import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../src/lib/prisma';

// PATCH /api/users/[id]/toggle-status - Toggle user active status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const body = await request.json();

    // Log the input data for debugging
    console.log('Toggle status request:', { userId, body });

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      console.log(`User not found: ${userId}`);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Explicitly convert to boolean to avoid any type issues
    let newStatus: boolean;
    
    if (body.active !== undefined) {
      // Convert the value to an explicit boolean
      newStatus = body.active === true || body.active === 'true';
    } else {
      // Toggle current status
      newStatus = !existingUser.active;
    }
    
    console.log(`Updating user ${userId} status from ${existingUser.active} to ${newStatus}`);

    // Update user active status with explicit boolean
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { active: newStatus },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      },
    });

    console.log(`User updated successfully. New status: ${updatedUser.active}`);

    return NextResponse.json({
      ...updatedUser,
      createdAt: updatedUser.createdAt.toISOString().split('T')[0],
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    return NextResponse.json(
      { error: 'Failed to update user status' },
      { status: 500 }
    );
  }
} 