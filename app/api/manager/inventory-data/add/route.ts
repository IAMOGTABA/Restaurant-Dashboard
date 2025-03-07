import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    console.log("Received add item request:", body);
    
    // Validate required fields
    if (!body.name || !body.category || body.currentStock === undefined || !body.unit || body.minLevel === undefined || body.pricePerUnit === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    try {
      // Create new ingredient - without supplier relationship for now to avoid errors
      const newIngredient = await prisma.ingredient.create({
        data: {
          name: body.name,
          category: body.category,
          quantity: parseFloat(body.currentStock), // This is required by the DB schema
          currentStock: parseFloat(body.currentStock),
          unit: body.unit,
          minLevel: parseFloat(body.minLevel),
          pricePerUnit: parseFloat(body.pricePerUnit),
          locationInStorage: body.locationInStorage || null,
          notes: body.notes || null
          // Removed supplier connection to fix the error
        }
      });
      
      console.log("Created new ingredient:", newIngredient);
      
      // Create an initial usage record for tracking
      const usageRecord = await prisma.ingredientUsage.create({
        data: {
          ingredientId: newIngredient.id,
          date: new Date(),
          amount: 0, // Initial usage is 0
          type: 'INVENTORY_ADDITION'
        }
      });
      
      console.log("Created usage record:", usageRecord);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Ingredient added successfully',
        data: newIngredient 
      });
    } catch (dbError) {
      console.error("Database error when adding ingredient:", dbError);
      return NextResponse.json({ 
        error: 'Database error when adding ingredient', 
        details: dbError.message 
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error adding inventory item:', error);
    return NextResponse.json({ 
      error: 'Failed to add inventory item', 
      details: error.message 
    }, { status: 500 });
  }
} 