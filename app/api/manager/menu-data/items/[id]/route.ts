import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    console.log(`Attempting to update menu item with ID: ${id}`);
    
    const body = await request.json();
    console.log('Update request body:', body);
    
    // Validate request body
    if (!body.name || body.price === undefined) {
      console.log('Validation failed: Missing name or price');
      return new Response(
        JSON.stringify({ error: 'Name and price are required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Check if the menu item exists
    const existingItem = await prisma.menuItem.findUnique({
      where: { id }
    });
    
    if (!existingItem) {
      console.log(`Menu item with ID ${id} not found`);
      return new Response(
        JSON.stringify({ error: 'Menu item not found' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Extract dietary and spice info from body
    const { isVegetarian, isVegan, isGlutenFree, spicyLevel } = body;
    
    // Process description with metadata
    let baseDescription = body.description || '';
    
    // Remove any existing metadata sections from the description
    baseDescription = baseDescription
      .replace(/\n\nDietary Info:[\s\S]*?((\n\n)|$)/, '')
      .replace(/\n\nIngredients:[\s\S]*?((\n\n)|$)/, '')
      .replace(/\n\nPreparation Time:[\s\S]*?((\n\n)|$)/, '')
      .trim();
    
    // Add dietary info
    let description = baseDescription;
    const dietaryInfo = [];
    if (isVegetarian) dietaryInfo.push('Vegetarian');
    if (isVegan) dietaryInfo.push('Vegan');
    if (isGlutenFree) dietaryInfo.push('Gluten-Free');
    if (spicyLevel > 0) dietaryInfo.push(`Spicy Level: ${spicyLevel}`);
    
    if (dietaryInfo.length > 0) {
      description += description ? '\n\n' : '';
      description += `Dietary Info: ${dietaryInfo.join(', ')}`;
    }
    
    // Add ingredients if provided
    if (body.ingredients) {
      description += description ? '\n\n' : '';
      description += `Ingredients: ${body.ingredients}`;
    }
    
    // Add preparation time if provided
    if (body.preparationTime) {
      description += description ? '\n\n' : '';
      description += `Preparation Time: ${body.preparationTime} minutes`;
    }
    
    // Prepare metadata for display options
    const metadata = {
      showDescription: body.showDescription !== false,
      showIngredients: body.showIngredients !== false,
      showSpicyLevel: body.showSpicyLevel !== false
    };
    
    // Prepare update data
    const updateData = {
      name: body.name,
      description: description,
      price: typeof body.price === 'string' ? parseFloat(body.price) : body.price,
      categoryId: body.category || undefined,
      image: body.imageUrl || null,
      isAvailable: body.isAvailable !== undefined ? body.isAvailable : true,
      metadata: JSON.stringify(metadata)
    };
    
    console.log('Updating menu item with data:', updateData);
    
    // Update the menu item
    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: updateData
    });
    
    console.log('Menu item updated successfully:', updatedItem);
    
    // Return the updated item
    return new Response(
      JSON.stringify(updatedItem),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error(`Error updating menu item with ID ${params.id}:`, error);
    return new Response(
      JSON.stringify({ error: 'Failed to update menu item', details: error.message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log(`Attempting to delete menu item with ID: ${id}`);
    
    // Check if the menu item exists before attempting to delete
    const existingItem = await prisma.menuItem.findUnique({
      where: { id }
    });
    
    if (!existingItem) {
      console.log(`Menu item with ID ${id} not found`);
      return new Response(null, { status: 404 });
    }
    
    // Delete the menu item
    await prisma.menuItem.delete({
      where: { id }
    });
    
    console.log(`Successfully deleted menu item with ID: ${id}`);
    // Return 204 No Content for successful deletion
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(`Error deleting menu item with ID ${params.id}:`, error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete menu item' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 