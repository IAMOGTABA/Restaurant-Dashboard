"use client";

import React from 'react';
import Link from 'next/link';

export default function WaiterDashboard() {
  // Mock data for tables
  const tables = [
    { id: 1, number: 1, capacity: 2, section: 'Window', status: 'OCCUPIED', order: 'In Progress', server: 'You' },
    { id: 2, number: 2, capacity: 2, section: 'Window', status: 'AVAILABLE', order: null, server: null },
    { id: 3, number: 3, capacity: 4, section: 'Window', status: 'RESERVED', order: null, server: null, reservation: '6:30 PM' },
    { id: 4, number: 4, capacity: 4, section: 'Window', status: 'OCCUPIED', order: 'Served', server: 'You' },
    { id: 5, number: 5, capacity: 4, section: 'Center', status: 'AVAILABLE', order: null, server: null },
    { id: 6, number: 6, capacity: 4, section: 'Center', status: 'OCCUPIED', order: 'Pending', server: 'Jessica' },
    { id: 7, number: 7, capacity: 4, section: 'Center', status: 'OCCUPIED', order: 'In Progress', server: 'You' },
    { id: 8, number: 8, capacity: 4, section: 'Center', status: 'AVAILABLE', order: null, server: null },
    { id: 9, number: 9, capacity: 6, section: 'Bar', status: 'OCCUPIED', order: 'Served', server: 'Robert' },
    { id: 10, number: 10, capacity: 6, section: 'Bar', status: 'AVAILABLE', order: null, server: null },
    { id: 11, number: 11, capacity: 8, section: 'Private', status: 'RESERVED', order: null, server: null, reservation: '7:00 PM' },
    { id: 12, number: 12, capacity: 8, section: 'Private', status: 'AVAILABLE', order: null, server: null },
  ];

  // Mock data for menu categories and items
  const menuCategories = [
    {
      id: 1,
      name: 'Appetizers',
      items: [
        { id: 101, name: 'Bruschetta', price: 8.99, description: 'Toasted bread topped with tomatoes, garlic, and basil' },
        { id: 102, name: 'Calamari', price: 12.99, description: 'Fried squid served with marinara sauce' },
        { id: 103, name: 'Mozzarella Sticks', price: 9.99, description: 'Breaded and fried mozzarella with marinara sauce' },
      ]
    },
    {
      id: 2,
      name: 'Main Courses',
      items: [
        { id: 201, name: 'Grilled Salmon', price: 24.99, description: 'Fresh salmon fillet with lemon butter sauce' },
        { id: 202, name: 'Filet Mignon', price: 34.99, description: '8oz tenderloin steak with red wine reduction' },
        { id: 203, name: 'Chicken Parmesan', price: 19.99, description: 'Breaded chicken topped with marinara and mozzarella' },
      ]
    },
    {
      id: 3,
      name: 'Desserts',
      items: [
        { id: 301, name: 'Tiramisu', price: 8.99, description: 'Classic Italian dessert with coffee and mascarpone' },
        { id: 302, name: 'Chocolate Lava Cake', price: 9.99, description: 'Warm chocolate cake with molten center' },
        { id: 303, name: 'Cheesecake', price: 7.99, description: 'New York style cheesecake with berry compote' },
      ]
    },
    {
      id: 4,
      name: 'Beverages',
      items: [
        { id: 401, name: 'Soft Drinks', price: 2.99, description: 'Coke, Diet Coke, Sprite, or Fanta' },
        { id: 402, name: 'House Wine (Glass)', price: 7.99, description: 'Red or white house wine' },
        { id: 403, name: 'Craft Beer', price: 6.99, description: 'Selection of local craft beers' },
      ]
    }
  ];

  // Mock data for active orders
  const activeOrders = [
    { 
      id: 1001, 
      table: 1, 
      status: 'In Progress', 
      items: [
        { name: 'Bruschetta', quantity: 1, status: 'Served' },
        { name: 'Grilled Salmon', quantity: 1, status: 'Cooking' },
        { name: 'Filet Mignon', quantity: 1, status: 'Cooking' },
        { name: 'House Wine (Glass)', quantity: 2, status: 'Served' }
      ],
      timeOpened: '5:30 PM'
    },
    { 
      id: 1002, 
      table: 4, 
      status: 'Served', 
      items: [
        { name: 'Calamari', quantity: 1, status: 'Served' },
        { name: 'Chicken Parmesan', quantity: 2, status: 'Served' },
        { name: 'Soft Drinks', quantity: 2, status: 'Served' }
      ],
      timeOpened: '5:45 PM'
    },
    { 
      id: 1003, 
      table: 7, 
      status: 'In Progress', 
      items: [
        { name: 'Mozzarella Sticks', quantity: 1, status: 'Served' },
        { name: 'Filet Mignon', quantity: 1, status: 'Cooking' },
        { name: 'Grilled Salmon', quantity: 1, status: 'Ready' },
        { name: 'Craft Beer', quantity: 2, status: 'Served' }
      ],
      timeOpened: '6:15 PM'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 border-green-300';
      case 'OCCUPIED':
        return 'bg-red-100 border-red-300';
      case 'RESERVED':
        return 'bg-yellow-100 border-yellow-300';
      case 'MAINTENANCE':
        return 'bg-gray-100 border-gray-300';
      default:
        return 'bg-white border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'text-green-700';
      case 'OCCUPIED':
        return 'text-red-700';
      case 'RESERVED':
        return 'text-yellow-700';
      case 'MAINTENANCE':
        return 'text-gray-700';
      default:
        return 'text-gray-700';
    }
  };

  const getTableSize = (capacity: number) => {
    if (capacity <= 2) return 'h-16 w-16';
    if (capacity <= 4) return 'h-20 w-20';
    if (capacity <= 6) return 'h-24 w-24';
    return 'h-28 w-28';
  };

  const getTableShape = (capacity: number, section: string) => {
    if (section === 'Bar') return 'rounded-full';
    return 'rounded-lg';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Waiter Dashboard</h1>
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
                <img className="h-8 w-8 rounded-full" src="https://randomuser.me/api/portraits/men/42.jpg" alt="User" />
                <span className="ml-2 text-sm font-medium text-gray-700">Robert Waiter</span>
              </div>
              <Link href="/login" className="ml-4 px-3 py-1 text-sm text-red-600 hover:text-red-800">
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Table View */}
          <div className="md:col-span-2">
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium">Floor Plan</h2>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-green-100 border border-green-300 mr-2"></div>
                    <span className="text-sm text-gray-700">Available</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-red-100 border border-red-300 mr-2"></div>
                    <span className="text-sm text-gray-700">Occupied</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-yellow-100 border border-yellow-300 mr-2"></div>
                    <span className="text-sm text-gray-700">Reserved</span>
                  </div>
                </div>
              </div>

              <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50 min-h-[400px] relative">
                {/* Window Section */}
                <div className="absolute top-0 left-0 right-0 h-6 bg-blue-100 border-b-2 border-blue-200 flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-700">Windows</span>
                </div>
                
                <div className="flex justify-around mt-12 mb-8">
                  {tables
                    .filter(table => table.section === 'Window')
                    .map(table => (
                      <Link 
                        key={table.id} 
                        href={`/dashboard/waiter/table/${table.number}`}
                        className={`${getTableSize(table.capacity)} ${getTableShape(table.capacity, table.section)} ${getStatusColor(table.status)} border flex flex-col items-center justify-center cursor-pointer shadow-md hover:shadow-lg transition-shadow relative`}
                      >
                        <div className={`font-bold ${getStatusText(table.status)}`}>
                          {table.number}
                        </div>
                        <div className="text-xs text-gray-600">{table.capacity}p</div>
                        {table.server && (
                          <div className="absolute -top-2 left-0 right-0 text-center">
                            <span className="inline-block px-2 py-0.5 text-xs bg-white rounded-full shadow text-gray-700">
                              {table.server}
                            </span>
                          </div>
                        )}
                        {table.order && (
                          <div className="absolute -bottom-2 left-0 right-0 text-center">
                            <span className="inline-block px-2 py-0.5 text-xs bg-white rounded-full shadow text-gray-700">
                              {table.order}
                            </span>
                          </div>
                        )}
                        {table.reservation && (
                          <div className="absolute -bottom-2 left-0 right-0 text-center">
                            <span className="inline-block px-2 py-0.5 text-xs bg-yellow-100 rounded-full shadow text-yellow-800">
                              {table.reservation}
                            </span>
                          </div>
                        )}
                      </Link>
                    ))
                  }
                </div>

                {/* Center Section */}
                <div className="flex justify-around my-8">
                  {tables
                    .filter(table => table.section === 'Center')
                    .map(table => (
                      <Link 
                        key={table.id} 
                        href={`/dashboard/waiter/table/${table.number}`}
                        className={`${getTableSize(table.capacity)} ${getTableShape(table.capacity, table.section)} ${getStatusColor(table.status)} border flex flex-col items-center justify-center cursor-pointer shadow-md hover:shadow-lg transition-shadow relative`}
                      >
                        <div className={`font-bold ${getStatusText(table.status)}`}>
                          {table.number}
                        </div>
                        <div className="text-xs text-gray-600">{table.capacity}p</div>
                        {table.server && (
                          <div className="absolute -top-2 left-0 right-0 text-center">
                            <span className="inline-block px-2 py-0.5 text-xs bg-white rounded-full shadow text-gray-700">
                              {table.server}
                            </span>
                          </div>
                        )}
                        {table.order && (
                          <div className="absolute -bottom-2 left-0 right-0 text-center">
                            <span className="inline-block px-2 py-0.5 text-xs bg-white rounded-full shadow text-gray-700">
                              {table.order}
                            </span>
                          </div>
                        )}
                      </Link>
                    ))
                  }
                </div>

                {/* Bar Section */}
                <div className="absolute bottom-4 left-4 right-4 h-12 bg-amber-50 border-2 border-amber-200 rounded-lg flex items-center justify-around">
                  <span className="absolute top-0 left-4 -translate-y-3 bg-amber-50 px-2 text-xs font-medium text-amber-700">Bar</span>
                  {tables
                    .filter(table => table.section === 'Bar')
                    .map(table => (
                      <Link 
                        key={table.id} 
                        href={`/dashboard/waiter/table/${table.number}`}
                        className={`${getTableSize(table.capacity)} ${getTableShape(table.capacity, table.section)} ${getStatusColor(table.status)} border flex flex-col items-center justify-center cursor-pointer shadow-md hover:shadow-lg transition-shadow relative`}
                      >
                        <div className={`font-bold ${getStatusText(table.status)}`}>
                          {table.number}
                        </div>
                        <div className="text-xs text-gray-600">{table.capacity}p</div>
                        {table.server && (
                          <div className="absolute -top-2 left-0 right-0 text-center">
                            <span className="inline-block px-2 py-0.5 text-xs bg-white rounded-full shadow text-gray-700">
                              {table.server}
                            </span>
                          </div>
                        )}
                        {table.order && (
                          <div className="absolute -bottom-2 left-0 right-0 text-center">
                            <span className="inline-block px-2 py-0.5 text-xs bg-white rounded-full shadow text-gray-700">
                              {table.order}
                            </span>
                          </div>
                        )}
                      </Link>
                    ))
                  }
                </div>

                {/* Private Section */}
                <div className="absolute right-4 top-1/4 bottom-1/4 w-32 bg-purple-50 border-2 border-purple-200 rounded-lg flex flex-col items-center justify-around">
                  <span className="absolute top-0 left-4 -translate-y-3 bg-purple-50 px-2 text-xs font-medium text-purple-700">Private</span>
                  {tables
                    .filter(table => table.section === 'Private')
                    .map(table => (
                      <Link 
                        key={table.id} 
                        href={`/dashboard/waiter/table/${table.number}`}
                        className={`${getTableSize(table.capacity)} ${getTableShape(table.capacity, table.section)} ${getStatusColor(table.status)} border flex flex-col items-center justify-center cursor-pointer shadow-md hover:shadow-lg transition-shadow relative`}
                      >
                        <div className={`font-bold ${getStatusText(table.status)}`}>
                          {table.number}
                        </div>
                        <div className="text-xs text-gray-600">{table.capacity}p</div>
                        {table.reservation && (
                          <div className="absolute -bottom-2 left-0 right-0 text-center">
                            <span className="inline-block px-2 py-0.5 text-xs bg-yellow-100 rounded-full shadow text-yellow-800">
                              {table.reservation}
                            </span>
                          </div>
                        )}
                      </Link>
                    ))
                  }
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Your Active Orders</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">New Order</button>
              </div>
              <div className="space-y-4">
                {activeOrders.map(order => (
                  <Link 
                    key={order.id} 
                    href={`/dashboard/waiter/table/${order.table}`}
                    className="block border rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <span className="font-medium">Table {order.table}</span>
                        <span className="ml-2 text-sm text-gray-500">Opened at {order.timeOpened}</span>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        order.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                        order.status === 'Served' ? 'bg-green-100 text-green-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="mt-2">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr>
                            <th className="text-left font-medium text-gray-500">Item</th>
                            <th className="text-center font-medium text-gray-500">Qty</th>
                            <th className="text-right font-medium text-gray-500">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item, index) => (
                            <tr key={index}>
                              <td className="py-1">{item.name}</td>
                              <td className="py-1 text-center">{item.quantity}</td>
                              <td className="py-1 text-right">
                                <span className={`px-2 py-0.5 text-xs rounded-full ${
                                  item.status === 'Served' ? 'bg-green-100 text-green-800' : 
                                  item.status === 'Ready' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {item.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-3 flex justify-end space-x-2">
                      <button className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100">
                        Add Items
                      </button>
                      <button className="px-3 py-1 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100">
                        Mark Ready
                      </button>
                      <button className="px-3 py-1 text-xs bg-purple-50 text-purple-700 rounded hover:bg-purple-100">
                        Payment
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Menu */}
          <div>
            <div className="bg-white shadow rounded-lg p-6 sticky top-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Menu</h2>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search menu..." 
                    className="py-1 px-3 text-sm border rounded-md"
                  />
                </div>
              </div>
              
              <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                {menuCategories.map(category => (
                  <div key={category.id}>
                    <h3 className="font-medium text-gray-900 border-b pb-2 mb-3">{category.name}</h3>
                    <div className="space-y-3">
                      {category.items.map(item => (
                        <div key={item.id} className="flex justify-between hover:bg-gray-50 p-2 rounded cursor-pointer">
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">{item.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${item.price.toFixed(2)}</p>
                            <button className="text-xs text-blue-600 hover:text-blue-800">Add to order</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Create New Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 