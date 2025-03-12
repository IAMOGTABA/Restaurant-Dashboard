import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { targetCategoryId } = await request.json();
    
    // Validate required fields
    if (!targetCategoryId) {
      return NextResponse.json(
        { error: 'Target category ID is required' },
        { status: 400 }
      );
    }
    
    // Check if both categories exist
    const sourceCategory = await prisma.category.findUnique({
      where: { id }
    });
    
    const targetCategory = await prisma.category.findUnique({
      where: { id: targetCategoryId }
    });
    
    if (!sourceCategory || !targetCategory) {
      return NextResponse.json(
        { error: 'One or both categories not found' },
        { status: 404 }
      );
    }
    
    // Update all menu items from source category to target category
    const updateResult = await prisma.menuItem.updateMany({
      where: { categoryId: id },
      data: { categoryId: targetCategoryId }
    });
    
    return NextResponse.json({
      success: true,
      message: `Reassigned ${updateResult.count} menu items from "${sourceCategory.name}" to "${targetCategory.name}"`,
      count: updateResult.count
    });
  } catch (error) {
    console.error('Error reassigning menu items:', error);
    return NextResponse.json(
      { error: 'Failed to reassign menu items' },
      { status: 500 }
    );
  }
} 