import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request body
    if (!body.name || !body.price || !body.category) {
      return NextResponse.json(
        { error: 'Name, price, and category are required' },
        { status: 400 }
      );
    }
    
    // Check if category exists
    const category = await prisma.category.findUnique({
      where: {
        id: body.category
      }
    });
    
    if (!category) {
      return NextResponse.json(
        { error: 'Selected category not found' },
        { status: 400 }
      );
    }
    
    // Extract dietary and spice info from body
    const { isVegetarian, isVegan, isGlutenFree, spicyLevel } = body;
    
    // Only use the raw description from the body without any appended metadata
    // This prevents accumulating duplicate information
    let baseDescription = body.description || '';
    
    // Remove any existing metadata sections from the description to avoid duplication
    baseDescription = baseDescription
      .replace(/\n\nDietary Info:[\s\S]*?((\n\n)|$)/, '')
      .replace(/\n\nIngredients:[\s\S]*?((\n\n)|$)/, '')
      .replace(/\n\nPreparation Time:[\s\S]*?((\n\n)|$)/, '')
      .trim();
    
    // Now construct a clean description with the metadata
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
    
    if (body.ingredients) {
      description += description ? '\n\n' : '';
      description += `Ingredients: ${body.ingredients}`;
    }
    
    if (body.preparationTime) {
      description += description ? '\n\n' : '';
      description += `Preparation Time: ${body.preparationTime} minutes`;
    }
    
    // Get metadata for display options
    const metadata = {
      showDescription: body.showDescription !== false,
      showIngredients: body.showIngredients !== false,
      showSpicyLevel: body.showSpicyLevel !== false
    };
    
    // Create the new menu item
    const newMenuItem = await prisma.menuItem.create({
      data: {
        name: body.name,
        description: description,
        price: body.price,
        categoryId: body.category,
        image: body.imageUrl || null,
        isAvailable: body.isAvailable !== undefined ? body.isAvailable : true,
        metadata: JSON.stringify(metadata)
      }
    });
    
    // Return new menu item with full category info and parsed metadata
    const menuItemWithCategory = await prisma.menuItem.findUnique({
      where: {
        id: newMenuItem.id
      },
      include: {
        category: true
      }
    });
    
    // Parse metadata before returning
    const itemWithMeta = {
      ...menuItemWithCategory,
      showDescription: metadata.showDescription,
      showIngredients: metadata.showIngredients, 
      showSpicyLevel: metadata.showSpicyLevel
    };
    
    return NextResponse.json(itemWithMeta, { status: 201 });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { error: 'Failed to create menu item' },
      { status: 500 }
    );
  }
} 