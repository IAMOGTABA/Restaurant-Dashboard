"use client";

import React from 'react';
import Link from 'next/link';

export default function KitchenDashboard() {
  // Mock data for orders
  const orders = [
    {
      id: 1001,
      table: 1,
      server: 'Robert',
      timeOrdered: '5:30 PM',
      status: 'PREPARING',
      items: [
        { id: 1, name: 'Bruschetta', quantity: 1, status: 'COMPLETED', notes: '', timeElapsed: '12m' },
        { id: 2, name: 'Grilled Salmon', quantity: 1, status: 'COOKING', notes: 'Medium well', timeElapsed: '8m' },
        { id: 3, name: 'Filet Mignon', quantity: 1, status: 'COOKING', notes: 'Medium rare', timeElapsed: '7m' }
      ]
    },
    {
      id: 1002,
      table: 4,
      server: 'Robert',
      timeOrdered: '5:45 PM',
      status: 'COMPLETED',
      items: [
        { id: 1, name: 'Calamari', quantity: 1, status: 'COMPLETED', notes: '', timeElapsed: '15m' },
        { id: 2, name: 'Chicken Parmesan', quantity: 2, status: 'COMPLETED', notes: '', timeElapsed: '22m' }
      ]
    },
    {
      id: 1003,
      table: 7,
      server: 'Robert',
      timeOrdered: '6:15 PM',
      status: 'PREPARING',
      items: [
        { id: 1, name: 'Mozzarella Sticks', quantity: 1, status: 'COMPLETED', notes: '', timeElapsed: '10m' },
        { id: 2, name: 'Filet Mignon', quantity: 1, status: 'COOKING', notes: 'Well done', timeElapsed: '5m' },
        { id: 3, name: 'Grilled Salmon', quantity: 1, status: 'READY', notes: '', timeElapsed: '14m' }
      ]
    },
    {
      id: 1004,
      table: 6,
      server: 'Jessica',
      timeOrdered: '6:20 PM',
      status: 'NEW',
      items: [
        { id: 1, name: 'Bruschetta', quantity: 2, status: 'PENDING', notes: '', timeElapsed: '1m' },
        { id: 2, name: 'Chicken Parmesan', quantity: 1, status: 'PENDING', notes: 'Extra cheese', timeElapsed: '1m' },
        { id: 3, name: 'Tiramisu', quantity: 2, status: 'PENDING', notes: '', timeElapsed: '1m' }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'READY':
        return 'bg-yellow-100 text-yellow-800';
      case 'COOKING':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-gray-100 text-gray-800';
      case 'NEW':
        return 'bg-purple-100 text-purple-800';
      case 'PREPARING':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Kitchen Dashboard</h1>
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
                <img className="h-8 w-8 rounded-full" src="https://randomuser.me/api/portraits/women/32.jpg" alt="User" />
                <span className="ml-2 text-sm font-medium text-gray-700">Chef Maria</span>
              </div>
              <Link href="/login" className="ml-4 px-3 py-1 text-sm text-red-600 hover:text-red-800">
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-white shadow rounded-md text-gray-800 font-medium">
              All Orders
            </button>
            <button className="px-4 py-2 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300">
              New
            </button>
            <button className="px-4 py-2 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300">
              Preparing
            </button>
            <button className="px-4 py-2 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300">
              Completed
            </button>
          </div>
          <div className="flex items-center">
            <span className="text-gray-600 mr-2">Sort by:</span>
            <select className="border rounded-md px-2 py-1 text-sm">
              <option>Newest First</option>
              <option>Oldest First</option>
              <option>Table Number</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg">Table {order.table}</h3>
                    <p className="text-sm text-gray-500">Server: {order.server}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <span className="text-sm text-gray-500 mt-1">
                      Ordered: {order.timeOrdered}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <h4 className="font-medium mb-2">Items:</h4>
                <ul className="space-y-3">
                  {order.items.map(item => (
                    <li key={item.id} className="flex justify-between items-center p-2 border rounded-md">
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium">{item.name}</span>
                          <span className="ml-2 text-sm bg-gray-100 px-2 py-0.5 rounded-full">
                            x{item.quantity}
                          </span>
                        </div>
                        {item.notes && (
                          <p className="text-sm text-gray-500">Note: {item.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-2">{item.timeElapsed}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="p-4 bg-gray-50 border-t">
                <div className="flex justify-between">
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                      Start Cooking
                    </button>
                    <button className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm">
                      Mark Ready
                    </button>
                  </div>
                  <button className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">
                    Complete Order
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
} 