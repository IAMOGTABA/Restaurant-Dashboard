import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }
    
    // Find the item first to ensure it exists
    const existingItem = await prisma.ingredient.findUnique({
      where: { id: body.id }
    });
    
    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    // Prepare update data, only include fields that are provided
    const updateData: any = {};
    
    if (body.name !== undefined) updateData.name = body.name;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.currentStock !== undefined) updateData.currentStock = parseFloat(body.currentStock);
    if (body.minLevel !== undefined) updateData.minLevel = parseFloat(body.minLevel);
    if (body.value !== undefined) updateData.value = parseFloat(body.value);
    if (body.unit !== undefined) updateData.unit = body.unit;
    
    // Update the item
    const updatedItem = await prisma.ingredient.update({
      where: { id: body.id },
      data: updateData
    });
    
    // Log this activity
    await prisma.activityLog.create({
      data: {
        action: 'UPDATE_INVENTORY_ITEM',
        details: `Updated inventory item: ${updatedItem.name}`,
        timestamp: new Date()
      }
    }).catch(err => console.error('Failed to log activity:', err));
    
    return NextResponse.json({ 
      success: true, 
      message: 'Item updated successfully',
      data: updatedItem
    });
    
  } catch (error) {
    console.error('Error updating inventory item:', error);
    
    return NextResponse.json({ 
      error: 'Failed to update inventory item',
      details: error.message 
    }, { status: 500 });
  }
} 