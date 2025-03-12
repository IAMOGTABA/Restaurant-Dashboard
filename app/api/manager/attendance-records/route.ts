import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/manager/attendance-records - Get attendance records with filters
export async function GET(request: NextRequest) {
  try {
    // Get URL parameters
    const searchParams = request.nextUrl.searchParams;
    const staffId = searchParams.get('staffId');
    const role = searchParams.get('role');
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    const view = searchParams.get('view') || 'week'; // 'week', 'month', 'all'
    
    // Set up date range
    let startDate: Date, endDate: Date;
    
    if (startDateStr && endDateStr) {
      // Use provided date range
      startDate = new Date(startDateStr);
      endDate = new Date(endDateStr);
    } else {
      // Calculate based on view type
      const now = new Date();
      
      if (view === 'week') {
        // Start from the beginning of the week (Sunday)
        const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        startDate = new Date(now);
        startDate.setDate(now.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);
        
        // End at the end of the week (Saturday)
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
      } else if (view === 'month') {
        // Start from the beginning of the month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        
        // End at the end of the month
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
      } else {
        // Default to last 30 days
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
      }
    }
    
    // Get all staff with their users
    const staffQuery: any = {
      include: {
        user: true,
        shifts: {
          where: {
            startTime: {
              gte: startDate,
              lte: endDate
            }
          },
          orderBy: {
            startTime: 'asc'
          }
        }
      }
    };
    
    // Add filters if provided
    if (staffId) {
      staffQuery.where = { id: staffId };
    } else if (role) {
      staffQuery.where = { position: role };
    }
    
    // Get all staff and their shifts within the date range
    const staffWithShifts = await prisma.staff.findMany(staffQuery);
    
    // Process data for the frontend
    const attendanceRecords = staffWithShifts.map(staff => {
      // Organize shifts by date
      const shiftsByDate = {};
      
      staff.shifts.forEach(shift => {
        const dateString = shift.startTime.toISOString().split('T')[0]; // YYYY-MM-DD
        
        if (!shiftsByDate[dateString]) {
          shiftsByDate[dateString] = [];
        }
        
        shiftsByDate[dateString].push({
          id: shift.id,
          startTime: shift.startTime,
          endTime: shift.endTime,
          status: shift.status,
          duration: shift.endTime 
            ? Math.round((shift.endTime.getTime() - shift.startTime.getTime()) / 60000) 
            : null, // duration in minutes
          notes: shift.notes
        });
      });
      
      // Calculate attendance statistics
      const totalShifts = staff.shifts.length;
      const completedShifts = staff.shifts.filter(s => s.status === 'COMPLETED').length;
      const lateShifts = staff.shifts.filter(s => s.status === 'LATE').length;
      const absentShifts = staff.shifts.filter(s => s.status === 'ABSENT').length;
      const attendanceRate = totalShifts > 0 ? (completedShifts / totalShifts) * 100 : 0;
      
      // Format data for frontend
      return {
        id: staff.id,
        name: staff.user.name,
        role: staff.position,
        userId: staff.userId,
        contactNumber: staff.contactNumber,
        hireDate: staff.hireDate,
        shifts: staff.shifts,
        shiftsByDate,
        statistics: {
          totalShifts,
          completedShifts,
          lateShifts,
          absentShifts,
          attendanceRate: Math.round(attendanceRate)
        },
        dateRange: {
          start: startDate,
          end: endDate
        }
      };
    });
    
    return NextResponse.json({
      success: true,
      dateRange: {
        start: startDate,
        end: endDate,
        view
      },
      staffCount: attendanceRecords.length,
      records: attendanceRecords
    });
    
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch attendance records',
      details: error.message
    }, { status: 500 });
  }
} 