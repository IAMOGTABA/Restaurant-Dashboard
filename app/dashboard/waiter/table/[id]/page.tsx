"use client";

import React from 'react';
import Link from 'next/link';

export default function TableOrderPage({ params }: { params: { id: string } }) {
  const tableId = parseInt(params.id);
  
  // Mock table data
  const table = {
    id: tableId,
    number: tableId,
    capacity: tableId <= 2 ? 2 : tableId <= 8 ? 4 : tableId <= 10 ? 6 : 8,
    section: tableId <= 4 ? 'Window' : tableId <= 8 ? 'Center' : tableId <= 10 ? 'Bar' : 'Private',
    status: 'OCCUPIED',
    server: 'Robert Waiter'
  };
  
  // Mock order data
  const order = {
    id: 1000 + tableId,
    status: 'In Progress',
    items: [
      { id: 1, name: 'Bruschetta', price: 8.99, quantity: 1, status: 'Served', notes: '' },
      { id: 2, name: 'Grilled Salmon', price: 24.99, quantity: 1, status: 'Cooking', notes: 'Medium well' },
      { id: 3, name: 'House Wine (Glass)', price: 7.99, quantity: 2, status: 'Served', notes: 'Red wine' }
    ],
    timeOpened: '6:30 PM',
    subtotal: 49.96,
    tax: 4.00,
    total: 53.96
  };
  
  // Mock menu categories and items
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

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link href="/dashboard/waiter" className="text-gray-500 hover:text-gray-700 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Table {table.number} Order</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                  {table.section} Section
                </span>
                <span className="ml-2 px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                  {table.capacity} Seats
                </span>
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
          {/* Left Column - Current Order */}
          <div className="md:col-span-2">
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-medium">Current Order</h2>
                  <p className="text-sm text-gray-500">Opened at {order.timeOpened}</p>
                </div>
                <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                  {order.status}
                </span>
              </div>

              {order.items.length > 0 ? (
                <div>
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium text-gray-500">Item</th>
                        <th className="text-center py-2 font-medium text-gray-500">Qty</th>
                        <th className="text-right py-2 font-medium text-gray-500">Price</th>
                        <th className="text-right py-2 font-medium text-gray-500">Status</th>
                        <th className="text-right py-2 font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="py-3">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              {item.notes && <p className="text-sm text-gray-500">{item.notes}</p>}
                            </div>
                          </td>
                          <td className="py-3 text-center">
                            <div className="flex items-center justify-center">
                              <button className="text-gray-500 hover:text-gray-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>
                              <span className="mx-2">{item.quantity}</span>
                              <button className="text-gray-500 hover:text-gray-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            </div>
                          </td>
                          <td className="py-3 text-right">${(item.price * item.quantity).toFixed(2)}</td>
                          <td className="py-3 text-right">
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                              item.status === 'Served' ? 'bg-green-100 text-green-800' : 
                              item.status === 'Ready' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button className="text-gray-500 hover:text-gray-700 mr-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button className="text-red-500 hover:text-red-700">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="mt-6 border-t pt-4">
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">${order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">${order.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-2 text-lg font-bold">
                      <span>Total</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                      Send to Kitchen
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                      Mark as Served
                    </button>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                      Process Payment
                    </button>
                    <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                      Print Receipt
                    </button>
                    <button className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200">
                      Cancel Order
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No items in order</h3>
                  <p className="mt-1 text-gray-500">Add items from the menu to get started.</p>
                </div>
              )}
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">Special Requests</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <button className="p-3 border rounded-md text-left hover:bg-gray-50">
                  <span className="font-medium">Allergy Information</span>
                </button>
                <button className="p-3 border rounded-md text-left hover:bg-gray-50">
                  <span className="font-medium">Dietary Restrictions</span>
                </button>
                <button className="p-3 border rounded-md text-left hover:bg-gray-50">
                  <span className="font-medium">Special Occasion</span>
                </button>
                <button className="p-3 border rounded-md text-left hover:bg-gray-50">
                  <span className="font-medium">Custom Request</span>
                </button>
              </div>
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Order Notes
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  className="w-full border rounded-md p-2"
                  placeholder="Add any special instructions or notes for this order..."
                ></textarea>
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
                  Add Selected Items
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 