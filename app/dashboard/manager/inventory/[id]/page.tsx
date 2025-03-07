"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function InventoryItemDetail({ params }) {
  const { id } = params;
  const [itemData, setItemData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFrame, setTimeFrame] = useState('weekly');

  // Fetch item data
  useEffect(() => {
    const fetchItemData = async () => {
      try {
        setLoading(true);
        
        // Fetch data from API
        const response = await fetch(`/api/manager/inventory-item/${id}`);
        if (!response.ok) throw new Error('Failed to fetch item data');
        const data = await response.json();
        
        setItemData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching item data:', err);
        setError('Failed to load item data. Please try again later.');
        
        // Fallback dummy data
        setItemData({
          id,
          name: 'Sample Ingredient',
          category: 'Produce',
          currentStock: 5.2,
          unit: 'kg',
          minLevel: 4,
          maxLevel: 20,
          reorderPoint: 8,
          pricePerUnit: 5.99,
          supplier: 'Quality Foods Inc.',
          locationInStorage: 'Shelf A-3',
          updatedAt: new Date().toISOString(),
          expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Organic, locally sourced',
          usageData: {
            weekly: {
              labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              values: [1.2, 1.8, 1.5, 2.0, 2.2, 2.5, 1.9],
              costs: [7.19, 10.78, 8.99, 11.98, 13.18, 14.98, 11.38],
              trend: 'increasing'
            },
            monthly: {
              labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
              values: [8.5, 10.2, 8.9, 9.7],
              costs: [50.92, 61.10, 53.31, 58.10],
              trend: 'stable'
            },
            relatedItems: [
              { id: '2', name: 'Olive Oil', usage: 0.85 },
              { id: '3', name: 'Garlic', usage: 0.72 },
              { id: '4', name: 'Salt', usage: 0.65 }
            ]
          }
        });
        setLoading(false);
      }
    };
    
    fetchItemData();
  }, [id]);

  // Display loading spinner while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-600 border-blue-200 border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading item data...</p>
        </div>
      </div>
    );
  }

  // Display error message if fetch failed
  if (error && !itemData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Item Data</h2>
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

  // Prepare chart data
  const chartData = {
    labels: itemData.usageData[timeFrame].labels,
    datasets: [
      {
        label: `Usage (${itemData.unit})`,
        data: itemData.usageData[timeFrame].values,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  const costChartData = {
    labels: itemData.usageData[timeFrame].labels,
    datasets: [
      {
        label: 'Cost ($)',
        data: itemData.usageData[timeFrame].costs,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center">
              <Link href="/dashboard/manager/inventory" className="mr-4">
                <button className="p-1 rounded-full text-gray-500 hover:bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">{itemData.name}</h1>
              <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {itemData.category}
              </span>
            </div>
            <div className="mt-4 md:mt-0">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors mr-2">
                Update Stock
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                Place Order
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Stock Information</h2>
            <div className="space-y-4">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Current Stock:</span>
                <span className={`font-medium ${
                  itemData.currentStock < itemData.minLevel ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {itemData.currentStock} {itemData.unit}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Min Level:</span>
                <span className="font-medium text-gray-900">{itemData.minLevel} {itemData.unit}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Max Level:</span>
                <span className="font-medium text-gray-900">{itemData.maxLevel} {itemData.unit}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Reorder Point:</span>
                <span className="font-medium text-gray-900">{itemData.reorderPoint} {itemData.unit}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Price per Unit:</span>
                <span className="font-medium text-gray-900">${itemData.pricePerUnit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Total Value:</span>
                <span className="font-medium text-gray-900">${(itemData.currentStock * itemData.pricePerUnit).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Supplier Details</h2>
            <div className="space-y-4">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Supplier:</span>
                <span className="font-medium text-gray-900">{itemData.supplier}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium text-gray-900">{itemData.locationInStorage}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Last Updated:</span>
                <span className="font-medium text-gray-900">{formatDate(itemData.updatedAt)}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Expiry Date:</span>
                <span className={`font-medium ${
                  new Date(itemData.expiryDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
                    ? 'text-red-600' 
                    : 'text-gray-900'
                }`}>
                  {formatDate(itemData.expiryDate)}
                </span>
              </div>
              <div className="border-b pb-2">
                <span className="text-gray-600 block mb-1">Notes:</span>
                <span className="font-medium text-gray-900">{itemData.notes || 'No notes'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Usage Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Trend:</span>
                <span className={`font-medium px-2 py-1 rounded-full text-xs ${
                  itemData.usageData[timeFrame].trend === 'increasing' 
                    ? 'bg-green-100 text-green-800' 
                    : itemData.usageData[timeFrame].trend === 'decreasing'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {itemData.usageData[timeFrame].trend === 'increasing' 
                    ? '↑ Increasing' 
                    : itemData.usageData[timeFrame].trend === 'decreasing'
                    ? '↓ Decreasing'
                    : '→ Stable'}
                </span>
              </div>
              <div className="border-b pb-2">
                <span className="text-gray-600 block mb-2">Average Daily Usage:</span>
                <span className="font-medium text-gray-900 text-2xl">
                  {(itemData.usageData.weekly.values.reduce((a, b) => a + b, 0) / 7).toFixed(2)} {itemData.unit}
                </span>
              </div>
              <div className="border-b pb-2">
                <span className="text-gray-600 block mb-2">Weekly Usage:</span>
                <span className="font-medium text-gray-900 text-2xl">
                  {itemData.usageData.weekly.values.reduce((a, b) => a + b, 0).toFixed(2)} {itemData.unit}
                </span>
              </div>
              <div className="border-b pb-2">
                <span className="text-gray-600 block mb-2">Monthly Usage:</span>
                <span className="font-medium text-gray-900 text-2xl">
                  {itemData.usageData.monthly.values.reduce((a, b) => a + b, 0).toFixed(2)} {itemData.unit}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-lg font-medium">Usage Analysis</h2>
            <div className="mt-3 md:mt-0">
              <select
                className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={timeFrame}
                onChange={(e) => setTimeFrame(e.target.value)}
              >
                <option value="weekly">Weekly View</option>
                <option value="monthly">Monthly View</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-base font-medium text-gray-700 mb-4">
                Usage ({timeFrame === 'weekly' ? 'Past Week' : 'Past Month'})
              </h3>
              <div className="h-80">
                <Line 
                  data={chartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: `Amount (${itemData.unit})`
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
            
            <div>
              <h3 className="text-base font-medium text-gray-700 mb-4">
                Cost ({timeFrame === 'weekly' ? 'Past Week' : 'Past Month'})
              </h3>
              <div className="h-80">
                <Line 
                  data={costChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Cost ($)'
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Related Items</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Related Usage</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {itemData.usageData.relatedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{item.usage.toFixed(2)} correlation</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/dashboard/manager/inventory/${item.id}`} className="text-blue-600 hover:text-blue-900">
                        View
                      </Link>
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