import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch all categories with their menu items
    const categories = await prisma.category.findMany({
      include: {
        menuItems: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Process items to include metadata as properties
    const processedCategories = categories.map(category => {
      const processedItems = category.menuItems.map(item => {
        // Parse metadata if it exists
        let showDescription = true;
        let showIngredients = true;
        let showSpicyLevel = true;
        
        if (item.metadata) {
          try {
            const metadata = JSON.parse(item.metadata as string);
            showDescription = metadata.showDescription !== false;
            showIngredients = metadata.showIngredients !== false;
            showSpicyLevel = metadata.showSpicyLevel !== false;
          } catch (e) {
            console.error('Error parsing metadata for item', item.id, e);
          }
        }
        
        return {
          ...item,
          showDescription,
          showIngredients,
          showSpicyLevel
        };
      });
      
      return {
        ...category,
        menuItems: processedItems
      };
    });

    return NextResponse.json({ categories: processedCategories });
  } catch (error) {
    console.error('Error fetching menu data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu data' },
      { status: 500 }
    );
  }
} 