import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(request: Request) {
  // Parse the URL to get the query parameters
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
  }
  
  try {
    // Try to find the item first
    const item = await prisma.ingredient.findUnique({
      where: { id }
    });
    
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    // Delete usage records first to avoid foreign key constraints
    await prisma.ingredientUsage.deleteMany({
      where: { ingredientId: id }
    });
    
    // Delete the ingredient
    await prisma.ingredient.delete({
      where: { id }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Item deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json({ 
      error: 'Failed to delete inventory item', 
      details: error.message 
    }, { status: 500 });
  }
} 