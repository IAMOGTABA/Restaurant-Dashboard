import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/manager/staff-data/create - Create a new staff member
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log("Creating staff with data:", JSON.stringify(body));
    
    // Validate required fields
    if (!body.userId || !body.position) {
      console.log("Missing required fields:", { userId: body.userId, position: body.position });
      return NextResponse.json({ 
        error: 'Missing required fields: userId and position are required' 
      }, { status: 400 });
    }
    
    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: body.userId }
    });
    
    if (!user) {
      console.log("User not found with ID:", body.userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check if staff record already exists for this user
    const existingStaff = await prisma.staff.findFirst({
      where: { userId: body.userId }
    });
    
    if (existingStaff) {
      console.log("Staff record already exists for user:", body.userId);
      return NextResponse.json({ 
        error: 'Staff record already exists for this user',
        staffId: existingStaff.id
      }, { status: 400 });
    }
    
    // Format data to match database schema exactly
    // Use correct data types for numeric fields
    const hourlyRate = body.hourlyRate ? parseFloat(body.hourlyRate) : 10.0;
    
    // Create staff data object exactly matching schema
    const staffData = {
      userId: body.userId,
      position: body.position,
      hireDate: body.hireDate ? new Date(body.hireDate) : new Date(),
      hourlyRate: hourlyRate,
      contactNumber: body.contactNumber || '(000) 000-0000', 
      address: body.address || 'No address provided'
    };
    
    console.log("Final staff data to create:", JSON.stringify(staffData));
    
    // Create the staff record with error handling
    try {
      const newStaff = await prisma.staff.create({
        data: staffData,
        include: {
          user: true
        }
      });
      
      console.log("Staff record created successfully:", newStaff.id);
      
      // Return success with the new staff member data
      return NextResponse.json({
        success: true,
        message: 'Staff member created successfully',
        staff: {
          id: newStaff.id,
          userId: newStaff.userId,
          name: newStaff.user.name,
          position: newStaff.position,
          hireDate: newStaff.hireDate
        }
      });
    } catch (prismaError) {
      console.error("Prisma error creating staff:", JSON.stringify(prismaError, null, 2));
      
      // Check for specific Prisma errors and return helpful messages
      if (prismaError.code === 'P2002') {
        return NextResponse.json({ 
          error: 'This user is already assigned as staff',
          details: prismaError.message
        }, { status: 400 });
      }
      
      if (prismaError.code === 'P2003') {
        return NextResponse.json({ 
          error: 'Invalid user ID or reference constraint failed',
          details: prismaError.message
        }, { status: 400 });
      }
      
      // Generic Prisma error
      return NextResponse.json({ 
        error: 'Database error creating staff member',
        details: prismaError.message,
        info: 'Check server logs for more details'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating staff member:', error);
    return NextResponse.json({ 
      error: 'Failed to create staff member',
      details: error.message 
    }, { status: 500 });
  }
} 