import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { staffId, status, date } = await request.json();
    
    // Validate required fields
    if (!staffId) {
      return NextResponse.json({ error: 'Staff ID is required' }, { status: 400 });
    }
    
    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }
    
    // Parse the date or use current date
    const shiftDate = date ? new Date(date) : new Date();
    
    // Find the staff member to confirm they exist
    const staff = await prisma.user.findUnique({
      where: { id: staffId }
    });
    
    if (!staff) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }
    
    // Check if there's already a shift for this staff on this date
    const existingShift = await prisma.shift.findFirst({
      where: {
        userId: staffId,
        date: {
          gte: new Date(shiftDate.setHours(0, 0, 0, 0)),
          lt: new Date(new Date(shiftDate).setHours(23, 59, 59, 999))
        }
      }
    });
    
    let shift;
    
    if (existingShift) {
      // Update existing shift
      shift = await prisma.shift.update({
        where: { id: existingShift.id },
        data: { status }
      });
    } else {
      // Create a new shift
      shift = await prisma.shift.create({
        data: {
          userId: staffId,
          date: shiftDate,
          status,
          startTime: new Date(),
          endTime: status === 'COMPLETED' ? new Date() : null
        }
      });
    }
    
    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: existingShift ? 'UPDATE_SHIFT' : 'CREATE_SHIFT',
        entityId: shift.id,
        entityType: 'SHIFT',
        details: JSON.stringify({
          staffId,
          status,
          date: shiftDate
        })
      }
    });
    
    return NextResponse.json({
      success: true,
      message: `Attendance ${existingShift ? 'updated' : 'marked'} successfully`,
      shift
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    return NextResponse.json({ 
      error: 'Failed to mark attendance',
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 