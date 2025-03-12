import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../src/lib/prisma';
import * as bcrypt from 'bcryptjs';

// GET /api/users - Get all users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const parentId = searchParams.get('parentId');
    const notInStaff = searchParams.get('notInStaff') === 'true';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    
    // Build where clause
    const whereClause: any = {};
    
    if (role) {
      whereClause.role = role;
    }
    
    if (parentId) {
      whereClause.parentId = parentId;
    }
    
    // Filter for users that are not already in the staff system
    if (notInStaff) {
      whereClause.staff = null;
    }
    
    // Get users from database
    const users = await prisma.user.findMany({
      where: whereClause,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        parentId: true,
        isGroupHead: true,
        groupRole: true,
        children: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role, parentId, active, username } = body;
    
    // Validate required fields
    if (!name || !email || !password || !username) {
      return NextResponse.json({ error: 'Name, email, username, and password are required' }, { status: 400 });
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username }
    });
    
    if (existingUsername) {
      return NextResponse.json({ error: 'User with this username already exists' }, { status: 409 });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
        role: role || 'waiter', // Default role
        parentId: parentId || null,
        active: active !== undefined ? active : true
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        active: true,
        createdAt: true
      }
    });
    
    // Return the created user
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ 
      error: 'Failed to create user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT /api/users - Update a user
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, email, username, password, role, parentId, active, isGroupHead, groupRole } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Build update data
    const updateData: any = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (username) updateData.username = username;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    if (role) updateData.role = role;
    if (parentId !== undefined) updateData.parentId = parentId;
    if (active !== undefined) updateData.active = active;
    if (isGroupHead !== undefined) updateData.isGroupHead = isGroupHead;
    if (groupRole) updateData.groupRole = groupRole;
    
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        active: true,
        isGroupHead: true,
        groupRole: true,
        updatedAt: true
      }
    });
    
    // Return the updated user
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
} 