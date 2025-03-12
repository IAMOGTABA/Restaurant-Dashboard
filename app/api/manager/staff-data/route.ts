import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    
    // Build where clause for User model
    const whereClause: any = {};
    
    if (role && role !== 'all') {
      whereClause.role = role;
    }
    
    // We're going to use the users that have staff entries
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date(today).setHours(23, 59, 59, 999));
    
    const usersWithStaff = await prisma.user.findMany({
      where: {
        ...whereClause,
        active: true,
        staff: {
          isNot: null
        }
      },
      include: {
        staff: {
          include: {
            Shift: {
              where: {
                startTime: {
                  gte: startOfDay,
                  lt: endOfDay
                }
              }
            }
          }
        }
      }
    });
    
    // Transform data for frontend
    const staffWithStats = usersWithStaff.map(user => {
      const shifts = user.staff?.Shift || [];
      const totalShifts = shifts.length;
      const completedShifts = shifts.filter(s => s.status === 'COMPLETED').length;
      const activeShift = shifts.find(s => s.status === 'ACTIVE');
      
      return {
        id: user.staff.id,
        userId: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        position: user.staff.position,
        status: activeShift ? 'ACTIVE' : 'OFF',
        shiftTime: activeShift 
          ? `${formatTime(activeShift.startTime)} - ${activeShift.endTime ? formatTime(activeShift.endTime) : 'Present'}`
          : 'Off Duty',
        attendanceStats: {
          total: totalShifts,
          present: completedShifts,
          rate: totalShifts > 0 ? Math.round((completedShifts / totalShifts) * 100) : 0
        }
      };
    });
    
    // Get staff members by role
    const staffByRole = {};
    usersWithStaff.forEach(user => {
      const role = user.role.toLowerCase();
      if (!staffByRole[role]) {
        staffByRole[role] = 0;
      }
      staffByRole[role]++;
    });
    
    // Count active staff and those on duty
    const totalStaff = usersWithStaff.length;
    const activeStaff = usersWithStaff.filter(user => user.active).length;
    const onDutyToday = usersWithStaff.filter(user => 
      user.staff?.Shift?.some(shift => 
        shift.status === 'SCHEDULED' || shift.status === 'ACTIVE'
      )
    ).length;
    
    // Staff with attendance issues (below 70%)
    const attendanceIssues = staffWithStats.filter(
      staff => staff.attendanceStats.total > 0 && staff.attendanceStats.rate < 70
    ).length;
    
    return NextResponse.json({
      staff: staffWithStats,
      staffCount: {
        total: totalStaff,
        active: activeStaff,
        onDutyToday,
        attendanceIssues,
        byRole: staffByRole
      }
    });
    
  } catch (error) {
    console.error('Database error fetching staff data:', error);
    
    // Return a fallback with empty data
    return NextResponse.json({
      staff: [],
      staffCount: {
        total: 0,
        active: 0,
        onDutyToday: 0,
        attendanceIssues: 0,
        byRole: {}
      }
    });
  }
}

// Helper function to format time
function formatTime(date: Date | null): string {
  if (!date) return '';
  
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
} 