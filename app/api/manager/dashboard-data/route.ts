import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get the current date for today's data
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date(today).setHours(23, 59, 59, 999));
    
    // Fetch all orders for today
    const todayOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        items: true
      }
    });
    
    // Calculate order summary based on status
    const orderSummary = {
      pending: todayOrders.filter(order => order.status === 'PENDING').length,
      inProgress: todayOrders.filter(order => order.status === 'IN_PROGRESS').length,
      ready: todayOrders.filter(order => order.status === 'READY').length,
      completed: todayOrders.filter(order => order.status === 'COMPLETED').length,
      cancelled: todayOrders.filter(order => order.status === 'CANCELLED').length,
      total: todayOrders.length
    };
    
    // Calculate today's revenue
    const todayRevenue = todayOrders
      .filter(order => order.status === 'COMPLETED' || order.paymentStatus === 'PAID')
      .reduce((total, order) => total + order.total, 0);
    
    // Get active tables
    const tablesInUse = await prisma.table.count({
      where: {
        status: {
          in: ['OCCUPIED', 'RESERVED']
        }
      }
    });
    
    const totalTables = await prisma.table.count();
    
    // Get today's reservations
    const todayReservations = await prisma.reservation.findMany({
      where: {
        dateTime: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      orderBy: {
        dateTime: 'asc'
      },
      take: 10
    });
    
    // Format reservations for display
    const formattedReservations = todayReservations.map(reservation => ({
      id: reservation.id,
      time: new Date(reservation.dateTime).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      customerName: reservation.customerName,
      guests: reservation.guestCount,
      tableNumber: reservation.tableId,
      status: reservation.status
    }));
    
    // Get staff on duty
    const staffOnDuty = await prisma.user.findMany({
      where: {
        active: true,
        staff: {
          isNot: null
        }
      },
      select: {
        id: true,
        name: true,
        role: true
      },
      take: 5
    });
    
    // Get inventory alerts (low stock items)
    const inventoryAlerts = await prisma.ingredient.findMany({
      where: {
        quantity: {
          lte: prisma.ingredient.fields.minLevel
        }
      },
      select: {
        id: true,
        name: true,
        quantity: true,
        unit: true,
        minLevel: true
      },
      take: 5
    });
    
    // Calculate order stats by type
    const ordersByType = {
      dineIn: todayOrders.filter(order => order.type === 'DINE_IN').length,
      takeout: todayOrders.filter(order => order.type === 'TAKEOUT').length,
      delivery: todayOrders.filter(order => order.type === 'DELIVERY').length
    };
    
    // Combine all data
    const dashboardData = {
      orderSummary,
      todayRevenue,
      activeTables: tablesInUse,
      totalTables,
      reservations: formattedReservations,
      staffOnDuty,
      inventoryAlerts,
      ordersByType
    };
    
    return NextResponse.json(dashboardData);
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    
    // Return fallback data in case of error
    return NextResponse.json({
      orderSummary: {
        pending: 0,
        inProgress: 0,
        ready: 0,
        completed: 0,
        cancelled: 0,
        total: 0
      },
      todayRevenue: 0,
      activeTables: 0,
      totalTables: 0,
      reservations: [],
      staffOnDuty: [],
      inventoryAlerts: [],
      ordersByType: {
        dineIn: 0,
        takeout: 0,
        delivery: 0
      }
    });
  }
} 