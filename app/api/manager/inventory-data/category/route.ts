import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all categories
export async function GET() {
  try {
    // Get unique categories from ingredients table
    const ingredients = await prisma.ingredient.findMany();
    const categories = [...new Set(ingredients.map(item => item.category))];
    
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST to add a new category
export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    
    if (!body.name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }
    
    // Check if the category already exists
    const ingredients = await prisma.ingredient.findMany({
      where: {
        category: body.name
      }
    });
    
    if (ingredients.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Category already exists',
        existing: true
      });
    }
    
    // Since we don't have a dedicated categories table, we'll create
    // a sample ingredient with this category to establish it
    const placeholderIngredient = await prisma.ingredient.create({
      data: {
        name: `${body.name} Category (Sample)`,
        category: body.name,
        quantity: 0,
        currentStock: 0,
        unit: 'unit',
        minLevel: 0,
        pricePerUnit: 0
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Category added successfully',
      data: {
        category: body.name,
        placeholderId: placeholderIngredient.id
      }
    });
    
  } catch (error) {
    console.error('Error adding category:', error);
    return NextResponse.json({ 
      error: 'Failed to add category',
      details: error.message
    }, { status: 500 });
  }
} 