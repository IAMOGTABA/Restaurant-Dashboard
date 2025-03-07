import React from 'react';
import Link from 'next/link';

export default function TableManagementPage() {
  // Dummy data for prototype
  const tables = [
    { id: 1, number: 1, capacity: 2, section: 'Window', status: 'OCCUPIED', order: 'In Progress' },
    { id: 2, number: 2, capacity: 2, section: 'Window', status: 'AVAILABLE', order: null },
    { id: 3, number: 3, capacity: 4, section: 'Window', status: 'RESERVED', order: null },
    { id: 4, number: 4, capacity: 4, section: 'Window', status: 'OCCUPIED', order: 'Served' },
    { id: 5, number: 5, capacity: 4, section: 'Center', status: 'AVAILABLE', order: null },
    { id: 6, number: 6, capacity: 4, section: 'Center', status: 'OCCUPIED', order: 'Pending' },
    { id: 7, number: 7, capacity: 4, section: 'Center', status: 'OCCUPIED', order: 'In Progress' },
    { id: 8, number: 8, capacity: 4, section: 'Center', status: 'AVAILABLE', order: null },
    { id: 9, number: 9, capacity: 6, section: 'Bar', status: 'OCCUPIED', order: 'Served' },
    { id: 10, number: 10, capacity: 6, section: 'Bar', status: 'AVAILABLE', order: null },
    { id: 11, number: 11, capacity: 8, section: 'Private', status: 'RESERVED', order: null },
    { id: 12, number: 12, capacity: 8, section: 'Private', status: 'AVAILABLE', order: null },
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
    if (capacity <= 2) return 'h-20 w-20';
    if (capacity <= 4) return 'h-24 w-24';
    if (capacity <= 6) return 'h-28 w-28';
    return 'h-32 w-32';
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
            <h1 className="text-2xl font-bold text-gray-900">Table Management</h1>
            <div className="flex space-x-4">
              <Link href="/dashboard/manager" className="btn btn-outline">
                Back to Dashboard
              </Link>
              <Link href="/reservations" className="btn btn-primary">
                Reservations
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6 mb-8">
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
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-gray-100 border border-gray-300 mr-2"></div>
                <span className="text-sm text-gray-700">Maintenance</span>
              </div>
            </div>
          </div>

          <div className="border-2 border-gray-200 rounded-lg p-8 bg-gray-50 min-h-[500px] relative">
            {/* Window Section */}
            <div className="absolute top-0 left-0 right-0 h-8 bg-blue-100 border-b-2 border-blue-200 flex items-center justify-center">
              <span className="text-sm font-medium text-blue-700">Windows</span>
            </div>
            
            <div className="flex justify-around mt-16 mb-16">
              {tables
                .filter(table => table.section === 'Window')
                .map(table => (
                  <div 
                    key={table.id} 
                    className={`${getTableSize(table.capacity)} ${getTableShape(table.capacity, table.section)} ${getStatusColor(table.status)} border flex flex-col items-center justify-center cursor-pointer shadow-md hover:shadow-lg transition-shadow relative`}
                  >
                    <div className={`font-bold text-lg ${getStatusText(table.status)}`}>
                      {table.number}
                    </div>
                    <div className="text-xs text-gray-600">{table.capacity} seats</div>
                    {table.order && (
                      <div className="absolute -bottom-2 left-0 right-0 text-center">
                        <span className="inline-block px-2 py-1 text-xs bg-white rounded-full shadow text-gray-700">
                          {table.order}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              }
            </div>

            {/* Center Section */}
            <div className="flex justify-around my-8">
              {tables
                .filter(table => table.section === 'Center')
                .map(table => (
                  <div 
                    key={table.id} 
                    className={`${getTableSize(table.capacity)} ${getTableShape(table.capacity, table.section)} ${getStatusColor(table.status)} border flex flex-col items-center justify-center cursor-pointer shadow-md hover:shadow-lg transition-shadow relative`}
                  >
                    <div className={`font-bold text-lg ${getStatusText(table.status)}`}>
                      {table.number}
                    </div>
                    <div className="text-xs text-gray-600">{table.capacity} seats</div>
                    {table.order && (
                      <div className="absolute -bottom-2 left-0 right-0 text-center">
                        <span className="inline-block px-2 py-1 text-xs bg-white rounded-full shadow text-gray-700">
                          {table.order}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              }
            </div>

            {/* Bar Section */}
            <div className="absolute bottom-8 left-8 right-8 h-16 bg-amber-50 border-2 border-amber-200 rounded-lg flex items-center justify-around">
              <span className="absolute top-0 left-4 -translate-y-3 bg-amber-50 px-2 text-sm font-medium text-amber-700">Bar</span>
              {tables
                .filter(table => table.section === 'Bar')
                .map(table => (
                  <div 
                    key={table.id} 
                    className={`${getTableSize(table.capacity)} ${getTableShape(table.capacity, table.section)} ${getStatusColor(table.status)} border flex flex-col items-center justify-center cursor-pointer shadow-md hover:shadow-lg transition-shadow relative`}
                  >
                    <div className={`font-bold text-lg ${getStatusText(table.status)}`}>
                      {table.number}
                    </div>
                    <div className="text-xs text-gray-600">{table.capacity} seats</div>
                    {table.order && (
                      <div className="absolute -bottom-2 left-0 right-0 text-center">
                        <span className="inline-block px-2 py-1 text-xs bg-white rounded-full shadow text-gray-700">
                          {table.order}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              }
            </div>

            {/* Private Section */}
            <div className="absolute right-8 top-1/4 bottom-1/4 w-48 bg-purple-50 border-2 border-purple-200 rounded-lg flex flex-col items-center justify-around">
              <span className="absolute top-0 left-4 -translate-y-3 bg-purple-50 px-2 text-sm font-medium text-purple-700">Private Room</span>
              {tables
                .filter(table => table.section === 'Private')
                .map(table => (
                  <div 
                    key={table.id} 
                    className={`${getTableSize(table.capacity)} ${getTableShape(table.capacity, table.section)} ${getStatusColor(table.status)} border flex flex-col items-center justify-center cursor-pointer shadow-md hover:shadow-lg transition-shadow relative`}
                  >
                    <div className={`font-bold text-lg ${getStatusText(table.status)}`}>
                      {table.number}
                    </div>
                    <div className="text-xs text-gray-600">{table.capacity} seats</div>
                    {table.order && (
                      <div className="absolute -bottom-2 left-0 right-0 text-center">
                        <span className="inline-block px-2 py-1 text-xs bg-white rounded-full shadow text-gray-700">
                          {table.order}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Table Status</h2>
            <button className="btn btn-outline text-sm">Edit Floor Plan</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tables.map((table) => (
                  <tr key={table.id}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Table {table.number}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{table.capacity} people</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{table.section}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        table.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                        table.status === 'OCCUPIED' ? 'bg-red-100 text-red-800' :
                        table.status === 'RESERVED' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {table.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {table.order || '—'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                      <button className="text-primary-600 hover:text-primary-900">View</button>
                      <button className="text-primary-600 hover:text-primary-900">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
} 