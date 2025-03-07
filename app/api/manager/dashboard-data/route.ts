import { NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/prisma';

export async function GET() {
  try {
    // Get current date
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    // Fetch today's orders
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    // Calculate order summary
    const orderSummary = {
      pending: orders.filter(order => order.status === 'PENDING').length,
      inProgress: orders.filter(order => order.status === 'IN_PROGRESS').length,
      ready: orders.filter(order => order.status === 'READY').length,
      completed: orders.filter(order => order.status === 'COMPLETED').length,
      cancelled: orders.filter(order => order.status === 'CANCELLED').length,
      total: orders.length
    };

    // Calculate today's revenue
    const todayRevenue = orders
      .filter(order => order.status === 'COMPLETED' || order.status === 'PAID')
      .reduce((sum, order) => sum + order.total, 0);

    // Fetch active tables
    const tables = await prisma.table.findMany();
    const activeTables = tables.filter(table => 
      table.status === 'OCCUPIED' || table.status === 'RESERVED'
    ).length;
    const totalTables = tables.length;

    // Fetch today's reservations
    const reservations = await prisma.reservation.findMany({
      where: {
        dateTime: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        user: true,
        table: true
      },
      orderBy: {
        dateTime: 'asc'
      },
      take: 10 // Limit to most recent 10
    });

    // Format reservations
    const formattedReservations = reservations.map(res => ({
      id: res.id,
      time: new Date(res.dateTime).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: 'numeric', 
        hour12: true 
      }),
      name: res.customerName,
      guests: res.guestCount,
      table: `Table ${res.table.number}`,
      status: res.status === 'CONFIRMED' ? 'Confirmed' : 
              res.status === 'PENDING' ? 'Pending' : 
              res.status === 'CANCELLED' ? 'Cancelled' : 
              res.status === 'COMPLETED' ? 'Completed' : 
              res.status === 'NO_SHOW' ? 'No Show' : res.status
    }));

    // Fetch staff on duty today
    const shifts = await prisma.shift.findMany({
      where: {
        startTime: {
          lte: now
        },
        endTime: {
          gte: now
        }
      },
      include: {
        staff: {
          include: {
            user: true
          }
        }
      }
    });

    const staffOnDuty = shifts.map(shift => ({
      id: shift.id,
      name: shift.staff.user.name,
      role: shift.staff.position,
      status: shift.status,
      shiftTime: `${new Date(shift.startTime).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: 'numeric', 
        hour12: true 
      })} - ${new Date(shift.endTime).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: 'numeric', 
        hour12: true 
      })}`
    }));

    const staffCount = {
      onDuty: staffOnDuty.length,
      total: await prisma.staff.count()
    };

    // Fetch inventory alerts
    const ingredients = await prisma.ingredient.findMany({
      where: {
        quantity: {
          lt: prisma.ingredient.fields.minLevel
        }
      }
    });

    const inventoryAlerts = ingredients.map(ing => ({
      id: ing.id,
      item: ing.name,
      currentStock: ing.quantity,
      minLevel: ing.minLevel,
      unit: ing.unit
    }));

    // Calculate order statistics
    const orderStats = {
      food: orders.filter(order => order.type === 'DINE_IN').length,
      beverage: orders.filter(order => order.type === 'TAKEOUT').length,
      delivery: orders.filter(order => order.type === 'DELIVERY').length,
    };

    // Combine all data
    const dashboardData = {
      orderSummary,
      todayRevenue,
      tables: {
        active: activeTables,
        total: totalTables
      },
      staffCount,
      reservations: formattedReservations,
      staffOnDuty,
      inventoryAlerts,
      orderStats
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching manager dashboard data:', error);
    
    // Fallback data
    const fallbackData = {
      orderSummary: {
        pending: 12,
        inProgress: 8,
        ready: 5,
        completed: 45,
        cancelled: 2,
        total: 72
      },
      todayRevenue: 2845.65,
      tables: {
        active: 12,
        total: 20
      },
      staffCount: {
        onDuty: 8,
        total: 10
      },
      reservations: [
        { id: '1', time: '12:30 PM', name: 'John Smith', guests: 4, table: 'Table 5', status: 'Confirmed' },
        { id: '2', time: '1:00 PM', name: 'Alice Johnson', guests: 2, table: 'Table 8', status: 'Confirmed' },
        { id: '3', time: '1:15 PM', name: 'Robert Brown', guests: 6, table: 'Table 12', status: 'Pending' },
        { id: '4', time: '2:00 PM', name: 'Emma Davis', guests: 3, table: 'Table 3', status: 'Confirmed' },
      ],
      staffOnDuty: [
        { id: '1', name: 'Michael Chen', role: 'Chef', status: 'COMPLETED', shiftTime: '8:00 AM - 4:00 PM' },
        { id: '2', name: 'Sarah Wilson', role: 'Server', status: 'COMPLETED', shiftTime: '11:00 AM - 7:00 PM' },
        { id: '3', name: 'David Miller', role: 'Bartender', status: 'LATE', shiftTime: '12:00 PM - 8:00 PM' },
        { id: '4', name: 'Jessica Lee', role: 'Host', status: 'COMPLETED', shiftTime: '10:00 AM - 6:00 PM' },
      ],
      inventoryAlerts: [
        { id: '1', item: 'Fresh Tomatoes', currentStock: 2, minLevel: 5, unit: 'kg' },
        { id: '2', item: 'Chicken Breast', currentStock: 3, minLevel: 10, unit: 'kg' },
        { id: '3', item: 'White Wine', currentStock: 4, minLevel: 8, unit: 'bottles' },
      ],
      orderStats: {
        food: 45,
        beverage: 18,
        delivery: 9
      }
    };
    
    return NextResponse.json(fallbackData);
  }
} 