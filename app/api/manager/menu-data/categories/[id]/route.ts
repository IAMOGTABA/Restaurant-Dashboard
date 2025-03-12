import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT: Update a category by ID
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { name, description } = await request.json();
    
    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }
    
    // Check if another category with the same name exists (excluding current category)
    const existingCategory = await prisma.category.findFirst({
      where: {
        name,
        id: {
          not: id
        }
      }
    });
    
    if (existingCategory) {
      return NextResponse.json(
        { error: 'A category with this name already exists' },
        { status: 400 }
      );
    }
    
    // Update the category
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name,
        description: description || ''
      }
    });
    
    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE: Remove a category by ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Check if there are menu items associated with this category
    const itemsCount = await prisma.menuItem.count({
      where: { categoryId: id }
    });
    
    if (itemsCount > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete category with associated menu items',
          itemsCount
        },
        { status: 400 }
      );
    }
    
    // Delete the category
    await prisma.category.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
} 