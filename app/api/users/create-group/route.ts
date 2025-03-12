import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/prisma';
import * as bcrypt from 'bcryptjs';

// POST /api/users/create-group - Create a group user and/or add users to a group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Two possible operations:
    // 1. Create a new group head user
    // 2. Add users to an existing group
    
    if (body.operation === 'create-group-head') {
      // Create a new group head user
      if (!body.username || !body.name || !body.email || !body.role) {
        return NextResponse.json(
          { error: 'Missing required fields for group head' },
          { status: 400 }
        );
      }

      // Check if username already exists
      const existingUser = await prisma.user.findUnique({
        where: { username: body.username },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Username already exists' },
          { status: 400 }
        );
      }

      // Check if email already exists
      const existingEmail = await prisma.user.findUnique({
        where: { email: body.email },
      });

      if (existingEmail) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        );
      }

      // Hash password (default to '111111' if not provided)
      const password = body.password || '111111';
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new group head user
      const newGroupHead = await prisma.user.create({
        data: {
          username: body.username,
          name: body.name,
          email: body.email,
          role: body.role,
          password: hashedPassword,
          active: body.active !== undefined ? body.active : true,
          isGroupHead: true,
          groupRole: body.role
        },
      });

      // Return user without password
      const { password: _, ...userWithoutPassword } = newGroupHead;
      
      return NextResponse.json({
        success: true,
        message: `Successfully created ${body.role} group head user`,
        user: {
          ...userWithoutPassword,
          createdAt: userWithoutPassword.createdAt.toISOString().split('T')[0],
        }
      });
    } 
    else if (body.operation === 'add-to-group') {
      // Add users to an existing group
      if (!body.groupHeadId || !body.userIds || !Array.isArray(body.userIds)) {
        return NextResponse.json(
          { error: 'Missing group head ID or user IDs' },
          { status: 400 }
        );
      }

      // Check if group head exists
      const groupHead = await prisma.user.findUnique({
        where: { id: body.groupHeadId }
      });

      if (!groupHead || !groupHead.isGroupHead) {
        return NextResponse.json(
          { error: 'Invalid group head ID' },
          { status: 404 }
        );
      }

      // Update each user to be a child of the group head
      const updatedUsers = await Promise.all(
        body.userIds.map(async (userId: string) => {
          try {
            return await prisma.user.update({
              where: { id: userId },
              data: {
                parentId: body.groupHeadId,
                groupRole: groupHead.role
              }
            });
          } catch (error) {
            console.error(`Failed to update user ${userId}:`, error);
            return null;
          }
        })
      );

      // Filter out failures
      const successfulUpdates = updatedUsers.filter(Boolean);

      return NextResponse.json({
        success: true,
        message: `Added ${successfulUpdates.length} users to ${groupHead.role} group`,
        updatedCount: successfulUpdates.length,
        failedCount: body.userIds.length - successfulUpdates.length
      });
    }
    else {
      return NextResponse.json(
        { error: 'Invalid operation. Use "create-group-head" or "add-to-group"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error managing user groups:', error);
    return NextResponse.json(
      { error: 'Failed to manage user groups', details: error.message },
      { status: 500 }
    );
  }
} 