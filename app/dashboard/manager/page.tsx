"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ManagerDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch data from API
        const response = await fetch('/api/manager/dashboard-data');
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        const data = await response.json();
        
        // Set data to state
        setDashboardData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        
        // Fallback dummy data
        setDashboardData({
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
        });
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Display loading spinner while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-600 border-blue-200 border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Display error message if fetch failed
  if (error && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="p-1 text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Notifications</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400"></span>
                </button>
              </div>
              <div className="flex items-center">
                <img className="h-8 w-8 rounded-full" src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" />
                <span className="ml-2 text-sm font-medium text-gray-700">John Manager</span>
              </div>
              <button className="ml-4 px-3 py-1 text-sm text-red-600 hover:text-red-800">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Today's Orders" 
            value={dashboardData.orderSummary.total} 
            icon="📝" 
          />
          <StatCard 
            title="Today's Revenue" 
            value={`$${dashboardData.todayRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} 
            icon="💰" 
          />
          <StatCard 
            title="Active Tables" 
            value={`${dashboardData.tables.active}/${dashboardData.tables.total}`} 
            icon="🪑" 
          />
          <StatCard 
            title="Staff On Duty" 
            value={`${dashboardData.staffCount.onDuty}/${dashboardData.staffCount.total}`} 
            icon="👨‍🍳" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Today's Reservations</h2>
                <Link href="/reservations" className="text-sm text-blue-600 hover:text-blue-800">
                  View All
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guests</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dashboardData.reservations.map((reservation) => (
                      <tr key={reservation.id}>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{reservation.time}</td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{reservation.name}</td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{reservation.guests}</td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{reservation.table}</td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            reservation.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {reservation.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Order Status</h2>
                <Link href="/orders" className="text-sm text-blue-600 hover:text-blue-800">
                  View All Orders
                </Link>
              </div>
              <div className="space-y-4">
                <StatusBar label="Pending" value={dashboardData.orderSummary.pending} max={dashboardData.orderSummary.total} color="bg-yellow-500" />
                <StatusBar label="In Progress" value={dashboardData.orderSummary.inProgress} max={dashboardData.orderSummary.total} color="bg-blue-500" />
                <StatusBar label="Ready" value={dashboardData.orderSummary.ready} max={dashboardData.orderSummary.total} color="bg-green-500" />
                <StatusBar label="Completed" value={dashboardData.orderSummary.completed} max={dashboardData.orderSummary.total} color="bg-gray-500" />
                <StatusBar label="Cancelled" value={dashboardData.orderSummary.cancelled} max={dashboardData.orderSummary.total} color="bg-red-500" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">Staff on Duty</h2>
              <div className="space-y-3">
                {dashboardData.staffOnDuty.map((staff) => (
                  <div key={staff.id} className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{staff.name}</p>
                      <p className="text-xs text-gray-500">{staff.role} • {staff.shiftTime}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      staff.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {staff.status === 'COMPLETED' ? 'Present' : staff.status === 'LATE' ? 'Late' : staff.status}
                    </span>
                  </div>
                ))}
              </div>
              <Link href="/dashboard/manager/staff">
                <button className="mt-4 w-full bg-blue-50 text-blue-600 py-2 rounded-md text-sm hover:bg-blue-100 transition-colors">
                  Manage Staff
                </button>
              </Link>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">Inventory Alerts</h2>
              <div className="space-y-3">
                {dashboardData.inventoryAlerts.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.item}</p>
                      <p className="text-xs text-gray-500">Current: {item.currentStock} {item.unit} (Min: {item.minLevel})</p>
                    </div>
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                      Low Stock
                    </span>
                  </div>
                ))}
              </div>
              <Link href="/dashboard/manager/inventory">
                <button className="mt-4 w-full bg-blue-50 text-blue-600 py-2 rounded-md text-sm hover:bg-blue-100 transition-colors">
                  Update Inventory
                </button>
              </Link>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">Today's Orders</h2>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{dashboardData.orderStats.food}</p>
                  <p className="text-xs text-gray-500">Food</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{dashboardData.orderStats.beverage}</p>
                  <p className="text-xs text-gray-500">Beverage</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{dashboardData.orderStats.delivery}</p>
                  <p className="text-xs text-gray-500">Delivery</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white shadow rounded-lg p-6 transition duration-200 hover:shadow-md">
      <div className="flex items-center">
        <div className="flex-shrink-0 bg-blue-50 h-12 w-12 rounded-full flex items-center justify-center text-2xl">
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function StatusBar({ label, value, max, color }) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-medium text-gray-700">{value}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full">
        <div
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
} 