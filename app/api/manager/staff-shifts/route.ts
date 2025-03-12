import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/manager/staff-shifts - Get all active shifts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get('staffId');
    
    if (!staffId) {
      return NextResponse.json({ error: 'Staff ID is required' }, { status: 400 });
    }
    
    console.log(`GET request for shifts with staffId: ${staffId}`);
    
    // First, check if this is actually a userId instead of a staffId
    let actualStaffId = staffId;
    
    // Try to find a staff member by this ID
    const staffDirectMatch = await prisma.staff.findUnique({
      where: { id: staffId },
      include: { user: true }
    });
    
    // If not found, check if it's a userId
    if (!staffDirectMatch) {
      console.log(`No staff found with id ${staffId}, checking if it's a userId...`);
      
      const staffByUserId = await prisma.staff.findFirst({
        where: { userId: staffId },
        include: { user: true }
      });
      
      if (staffByUserId) {
        console.log(`Found staff by userId: ${staffByUserId.id} (${staffByUserId.user.name})`);
        actualStaffId = staffByUserId.id;
      } else {
        return NextResponse.json({ 
          error: 'Staff not found',
          details: `No staff found with id: ${staffId}`
        }, { status: 404 });
      }
    } else {
      console.log(`Found staff directly: ${staffDirectMatch.id} (${staffDirectMatch.user.name})`);
    }
    
    // Get the staff's shifts from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    console.log(`Looking for shifts after ${thirtyDaysAgo.toISOString()} for staffId: ${actualStaffId}`);
    
    const shifts = await prisma.shift.findMany({
      where: {
        staffId: actualStaffId,
        startTime: {
          gte: thirtyDaysAgo
        }
      },
      orderBy: {
        startTime: 'desc'
      }
    });
    
    console.log(`Found ${shifts.length} shifts`);
    
    // Process shifts to prepare for calendar view
    const formattedShifts = shifts.map(shift => ({
      id: shift.id,
      date: shift.startTime.toISOString().split('T')[0],
      status: shift.status,
      startTime: shift.startTime.toISOString(),
      endTime: shift.endTime ? shift.endTime.toISOString() : null,
      durationMs: shift.endTime ? new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime() : null,
      durationFormatted: shift.endTime ? formatDuration(new Date(shift.startTime), new Date(shift.endTime)) : 'In progress'
    }));
    
    // Calculate attendance statistics
    const totalShifts = shifts.length;
    const presentShifts = shifts.filter(s => s.status === 'COMPLETED').length;
    const lateShifts = shifts.filter(s => s.status === 'LATE').length;
    const activeShifts = shifts.filter(s => s.status === 'ACTIVE').length;
    
    const attendanceRate = totalShifts > 0 ? Math.round((presentShifts / totalShifts) * 100) : 0;
    
    // Get the staff record we found (either direct match or by userId)
    const staffRecord = staffDirectMatch || await prisma.staff.findFirst({
      where: { userId: staffId },
      include: { user: true }
    });
    
    if (!staffRecord) {
      return NextResponse.json({ 
        error: 'Staff record not found',
        details: 'Could not retrieve staff details' 
      }, { status: 404 });
    }
    
    return NextResponse.json({
      staff: {
        id: staffRecord.id,
        userId: staffRecord.userId,
        name: staffRecord.user.name,
        role: staffRecord.position,
        email: staffRecord.user.email
      },
      shifts: formattedShifts,
      statistics: {
        totalShifts,
        presentShifts,
        lateShifts,
        activeShifts,
        attendanceRate
      }
    });
  } catch (error) {
    console.error('Error fetching staff shifts:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch staff shifts',
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// POST /api/manager/staff-shifts - Create a new shift or update an existing one
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log("Received shift action request body:", body);
    
    // Validate required fields
    if (!body.staffId) {
      console.error("Missing staffId in request");
      return NextResponse.json({ error: 'Staff ID is required' }, { status: 400 });
    }
    
    if (!body.action) {
      console.error("Missing action in request");
      return NextResponse.json({ error: 'Action (start/end) is required' }, { status: 400 });
    }
    
    console.log(`Processing ${body.action} shift request for staffId: ${body.staffId}`);
    
    // Try to find staff record directly using staffId
    let staffRecord = await prisma.staff.findUnique({
      where: { id: body.staffId },
      include: { user: true }
    });
    
    // If not found directly, try to find by userId
    if (!staffRecord) {
      console.log(`No staff record found with id=${body.staffId}, checking if it's a userId...`);
      
      staffRecord = await prisma.staff.findFirst({
        where: { userId: body.staffId },
        include: { user: true }
      });
      
      if (!staffRecord) {
        console.error(`No staff found with staffId=${body.staffId} or userId=${body.staffId}`);
        return NextResponse.json({ 
          error: 'Staff not found',
          details: `No staff record found for id: ${body.staffId}`
        }, { status: 404 });
      }
      
      console.log(`Found staff by userId: ${staffRecord.id} (${staffRecord.user.name})`);
    } else {
      console.log(`Found staff directly: ${staffRecord.id} (${staffRecord.user.name})`);
    }
    
    // Call handleShiftAction with the confirmed staffId
    return handleShiftAction(staffRecord.id, body.action);
  } catch (error) {
    console.error('Error in staff-shifts POST endpoint:', error);
    return NextResponse.json({
      error: 'Failed to process shift action',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to handle shift actions
async function handleShiftAction(staffId, action) {
  try {
    // Get current date
    const now = new Date();
    
    // Start of day
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    
    // End of day
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    
    console.log(`Looking for existing shifts for staffId ${staffId} between ${startOfDay.toISOString()} and ${endOfDay.toISOString()}`);
    
    // Check if staff already has an active shift today
    const existingShift = await prisma.shift.findFirst({
      where: {
        staffId: staffId,
        startTime: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: "ACTIVE"
      }
    });
    
    console.log(`Existing active shift found: ${existingShift ? 'Yes' : 'No'}`);
    
    // If action is 'start' and there's no active shift, create a new one
    if (action === 'start' && !existingShift) {
      console.log(`Creating new shift for staffId: ${staffId}`);
      const newShift = await prisma.shift.create({
        data: {
          staffId: staffId,
          startTime: now,
          endTime: null, // Don't set end time when starting
          status: 'ACTIVE'
        }
      });
      
      console.log(`New shift created with ID: ${newShift.id}`);
      
      return NextResponse.json({
        success: true,
        message: 'Shift started successfully',
        shift: newShift
      });
    }
    
    // If action is 'end' and there's an active shift, update it
    if (action === 'end' && existingShift) {
      console.log(`Ending shift with ID: ${existingShift.id} for staffId: ${staffId}`);
      const updatedShift = await prisma.shift.update({
        where: { id: existingShift.id },
        data: {
          endTime: now,
          status: 'COMPLETED'
        }
      });
      
      console.log(`Shift updated: ${updatedShift.id}, new status: ${updatedShift.status}`);
      
      return NextResponse.json({
        success: true,
        message: 'Shift ended successfully',
        shift: updatedShift
      });
    }
    
    // If action is 'start' but shift already exists
    if (action === 'start' && existingShift) {
      console.log(`Staff already has an active shift: ${existingShift.id}`);
      return NextResponse.json({
        success: false,
        message: 'Staff already has an active shift',
        shift: existingShift
      }, { status: 400 });
    }
    
    // If action is 'end' but no active shift exists
    if (action === 'end' && !existingShift) {
      console.log(`No active shift found for staffId: ${staffId}`);
      return NextResponse.json({
        success: false,
        message: 'No active shift found for this staff member'
      }, { status: 400 });
    }
    
    // Handle invalid action
    console.log(`Invalid action: ${action}`);
    return NextResponse.json({
      success: false,
      message: 'Invalid action. Use "start" or "end"'
    }, { status: 400 });
  } catch (error) {
    console.error(`Error in handleShiftAction: ${error.message}`);
    throw error;
  }
}

// Helper function to format duration between two dates
function formatDuration(start, end) {
  const durationMs = end.getTime() - start.getTime();
  
  // Format as hours and minutes
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
} 