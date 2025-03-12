import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Retrieve staff members
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    
    // Build where clause
    const whereClause: any = {
      status: { not: 'DELETED' }
    };
    
    if (role && role !== 'all') {
      whereClause.role = role;
    }
    
    // Get staff members from database with shift information
    const staff = await prisma.user.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true, 
        status: true,
        shifts: {
          where: {
            date: {
              gte: new Date(new Date().setDate(new Date().getDate() - 30)) // Last 30 days
            }
          },
          orderBy: {
            date: 'desc'
          },
          take: 10
        }
      }
    });
    
    // Get counts by role
    const roleStats = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true
      },
      where: {
        status: { not: 'DELETED' }
      }
    });
    
    // Transform into byRole object
    const byRole = {};
    roleStats.forEach(stat => {
      byRole[stat.role] = stat._count.role;
    });
    
    // Get total, active, and on duty counts
    const [totalCount, activeCount, onDutyToday] = await Promise.all([
      prisma.user.count({
        where: {
          status: { not: 'DELETED' }
        }
      }),
      prisma.user.count({
        where: {
          status: 'ACTIVE'
        }
      }),
      prisma.shift.count({
        where: {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999))
          },
          status: 'ACTIVE'
        },
        distinct: ['userId']
      })
    ]);
    
    // Calculate attendance stats for each staff member
    const staffWithStats = staff.map(member => {
      const totalShifts = member.shifts.length;
      const presentShifts = member.shifts.filter(s => s.status === 'COMPLETED').length;
      
      return {
        ...member,
        attendanceStats: {
          total: totalShifts,
          present: presentShifts,
          rate: totalShifts > 0 ? Math.round((presentShifts / totalShifts) * 100) : 0
        }
      };
    });
    
    // Get count of staff with attendance issues
    const attendanceIssues = staffWithStats.filter(
      staff => staff.attendanceStats.total > 0 && staff.attendanceStats.rate < 70
    ).length;
    
    return NextResponse.json({
      staff: staffWithStats,
      staffCount: {
        total: totalCount,
        active: activeCount,
        onDutyToday,
        attendanceIssues,
        byRole
      }
    });
    
  } catch (error) {
    console.error('Error fetching staff data:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch staff data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST: Add a user to the staff system
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, role, status } = body;
    
    // Validate required fields
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Update the user with staff-specific information
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: role || user.role, // Use existing role if not provided
        status: status || 'ACTIVE',
        isStaff: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true
      }
    });
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'ADD_STAFF',
        entityId: userId,
        entityType: 'USER',
        details: JSON.stringify({
          name: user.name,
          email: user.email,
          role: role || user.role,
          status: status || 'ACTIVE'
        })
      }
    });
    
    return NextResponse.json({
      success: true,
      message: `${user.name} has been added to the staff system`,
      staff: updatedUser
    });
    
  } catch (error) {
    console.error('Error adding staff:', error);
    return NextResponse.json({ 
      error: 'Failed to add staff member',
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// PUT: Update a staff member
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, role, status } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Staff ID is required' }, { status: 400 });
    }
    
    // Check if the staff member exists
    const staff = await prisma.user.findUnique({
      where: { 
        id,
        isStaff: true
      }
    });
    
    if (!staff) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }
    
    // Update the staff member
    const updatedStaff = await prisma.user.update({
      where: { id },
      data: {
        role: role !== undefined ? role : staff.role,
        status: status !== undefined ? status : staff.status
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true
      }
    });
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'UPDATE_STAFF',
        entityId: id,
        entityType: 'USER',
        details: JSON.stringify({
          role: role !== undefined ? role : undefined,
          status: status !== undefined ? status : undefined
        })
      }
    });
    
    return NextResponse.json({
      success: true,
      message: `Staff member updated successfully`,
      staff: updatedStaff
    });
    
  } catch (error) {
    console.error('Error updating staff:', error);
    return NextResponse.json({ 
      error: 'Failed to update staff member',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 