import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/manager/staff-shifts - Get all active shifts
export async function GET(request: NextRequest) {
  try {
    // Get URL parameters
    const searchParams = request.nextUrl.searchParams;
    const staffId = searchParams.get('staffId');
    const dateStr = searchParams.get('date');
    
    // Convert date string to Date object or use current date
    const date = dateStr ? new Date(dateStr) : new Date();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Build query filters
    const whereClause: any = {
      startTime: {
        gte: startOfDay,
        lte: endOfDay
      }
    };
    
    // Add staff filter if provided
    if (staffId) {
      whereClause.staffId = staffId;
    }
    
    // Get shifts from the database
    const shifts = await prisma.shift.findMany({
      where: whereClause,
      include: {
        staff: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        startTime: 'desc'
      }
    });
    
    // Process shift data for frontend
    const processedShifts = shifts.map(shift => {
      // Calculate duration in minutes
      let durationMinutes = 0;
      if (shift.startTime && shift.endTime) {
        durationMinutes = Math.round((shift.endTime.getTime() - shift.startTime.getTime()) / 60000);
      }
      
      // Format duration as hours and minutes
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      const durationStr = shift.endTime 
        ? `${hours}h ${minutes}m` 
        : 'In progress';
      
      return {
        id: shift.id.toString(),
        staffId: shift.staffId,
        staffName: shift.staff?.user?.name || 'Unknown',
        role: shift.staff?.position || 'Unknown',
        status: shift.status,
        startTime: shift.startTime,
        endTime: shift.endTime,
        duration: durationMinutes,
        durationFormatted: durationStr
      };
    });
    
    return NextResponse.json(processedShifts);
  } catch (error) {
    console.error('Error fetching staff shifts:', error);
    return NextResponse.json({ error: 'Failed to fetch staff shifts' }, { status: 500 });
  }
}

// POST /api/manager/staff-shifts - Create a new shift or update an existing one
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.staffId) {
      return NextResponse.json({ error: 'Staff ID is required' }, { status: 400 });
    }
    
    // Check if staff exists
    const staff = await prisma.staff.findUnique({
      where: { id: body.staffId }
    });
    
    if (!staff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }
    
    // Get current date
    const now = new Date();
    
    // Start of day
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    
    // End of day
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Check if staff already has an active shift today
    const existingShift = await prisma.shift.findFirst({
      where: {
        staffId: body.staffId,
        startTime: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: "ACTIVE"
      }
    });
    
    // If action is 'start' and there's no active shift, create a new one
    if (body.action === 'start' && !existingShift) {
      const newShift = await prisma.shift.create({
        data: {
          staffId: body.staffId,
          startTime: now,
          endTime: new Date(now.getTime() + 24 * 60 * 60 * 1000),
          status: 'ACTIVE'
        }
      });
      
      return NextResponse.json({
        success: true,
        message: 'Shift started successfully',
        shift: newShift
      });
    }
    
    // If action is 'end' and there's an active shift, update it
    if (body.action === 'end' && existingShift) {
      const updatedShift = await prisma.shift.update({
        where: { id: existingShift.id },
        data: {
          endTime: now,
          status: 'COMPLETED'
        }
      });
      
      return NextResponse.json({
        success: true,
        message: 'Shift ended successfully',
        shift: updatedShift
      });
    }
    
    // If action is 'start' but shift already exists
    if (body.action === 'start' && existingShift) {
      return NextResponse.json({
        success: false,
        message: 'Staff already has an active shift',
        shift: existingShift
      }, { status: 400 });
    }
    
    // If action is 'end' but no active shift exists
    if (body.action === 'end' && !existingShift) {
      return NextResponse.json({
        success: false,
        message: 'No active shift found for this staff member'
      }, { status: 400 });
    }
    
    // Handle invalid action
    return NextResponse.json({
      success: false,
      message: 'Invalid action. Use "start" or "end"'
    }, { status: 400 });
    
  } catch (error) {
    console.error('Error managing staff shift:', error);
    return NextResponse.json({ error: 'Failed to manage staff shift' }, { status: 500 });
  }
} 