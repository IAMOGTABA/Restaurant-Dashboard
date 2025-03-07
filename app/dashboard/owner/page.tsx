"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart, LineChart, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Button } from '../../../components/ui/button';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function OwnerDashboard() {
  const [financialMetrics, setFinancialMetrics] = useState(null);
  const [topSellingItems, setTopSellingItems] = useState([]);
  const [businessTrends, setBusinessTrends] = useState([]);
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all dashboard data in a single request
        const response = await fetch('/api/owner/dashboard-data');
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        const data = await response.json();
        
        // Set all states from the fetched data
        setFinancialMetrics({
          revenue: data.financialMetrics.revenue,
          costs: {
            foodCost: data.financialMetrics.expenses.foodCost,
            laborCost: data.financialMetrics.expenses.laborCost,
            overhead: data.financialMetrics.expenses.overhead
          },
          profit: data.financialMetrics.profit,
          changes: data.financialMetrics.changes
        });
        
        setTopSellingItems(data.topSellingItems);
        setBusinessTrends(data.businessTrends);
        setInventoryAlerts(data.inventoryAlerts);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        
        // Set fallback data
        setFinancialMetrics({
          revenue: {
            daily: 3245.89,
            weekly: 22460.75,
            monthly: 94250.34,
            yearToDate: 845678.90
          },
          costs: {
            foodCost: 31250.45,
            laborCost: 42680.32,
            overhead: 18760.90
          },
          profit: {
            daily: 988.76,
            weekly: 6890.21,
            monthly: 29560.45,
            yearToDate: 256978.12
          },
          changes: {
            revenue: 5.2,
            profitMargin: 1.8,
            foodCost: -0.5,
            laborCost: 0.3
          }
        });
        
        // Fallback inventory alerts
        setInventoryAlerts([
          { id: 1, name: 'Premium Vodka', currentStock: 3, minLevel: 10, status: 'critical' },
          { id: 2, name: 'Lemon', currentStock: 15, minLevel: 20, status: 'warning' },
          { id: 3, name: 'Mint Leaves', currentStock: 8, minLevel: 15, status: 'warning' },
        ]);
        
        setTopSellingItems([
          { id: '1', name: 'Grilled Salmon', category: 'Main Course', sales: 342, revenue: 8892.00 },
          { id: '2', name: 'Filet Mignon', category: 'Main Course', sales: 287, revenue: 11480.00 },
          { id: '3', name: 'Caesar Salad', category: 'Appetizer', sales: 412, revenue: 4944.00 },
          { id: '4', name: 'Chocolate Lava Cake', category: 'Dessert', sales: 298, revenue: 2384.00 },
          { id: '5', name: 'House Wine', category: 'Beverage', sales: 526, revenue: 7890.00 },
        ]);
        
        setBusinessTrends([
          { month: 'Jan', revenue: 75340.45, profit: 22602.14 },
          { month: 'Feb', revenue: 68790.32, profit: 20637.10 },
          { month: 'Mar', revenue: 82450.90, profit: 24735.27 },
          { month: 'Apr', revenue: 79340.23, profit: 23802.07 },
          { month: 'May', revenue: 85670.76, profit: 25701.23 },
          { month: 'Jun', revenue: 90450.89, profit: 27135.27 },
        ]);
        
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Loading state
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
  
  // Error state
  if (error && !financialMetrics) {
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
            <h1 className="text-2xl font-bold text-gray-900">Owner Dashboard</h1>
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
                <img className="h-8 w-8 rounded-full" src="https://randomuser.me/api/portraits/women/48.jpg" alt="User" />
                <span className="ml-2 text-sm font-medium text-gray-700">Sarah Owner</span>
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
          <FinancialCard 
            title="Total Revenue (MTD)" 
            value={`$${financialMetrics?.revenue?.monthly?.toLocaleString() || '0'}`} 
            change={`${financialMetrics?.changes?.revenue >= 0 ? '+' : ''}${financialMetrics?.changes?.revenue?.toFixed(1)}%`}
            trend={financialMetrics?.changes?.revenue >= 0 ? "up" : "down"}
            icon={<DollarSign className="h-8 w-8 text-blue-500" />}
          />
          <FinancialCard 
            title="Profit Margin (MTD)" 
            value={`${financialMetrics?.profit?.monthly && financialMetrics?.revenue?.monthly 
              ? ((financialMetrics.profit.monthly / financialMetrics.revenue.monthly) * 100).toFixed(1) 
              : '0'}%`} 
            change={`${financialMetrics?.changes?.profitMargin >= 0 ? '+' : ''}${financialMetrics?.changes?.profitMargin?.toFixed(1)}%`}
            trend={financialMetrics?.changes?.profitMargin >= 0 ? "up" : "down"}
            icon={<TrendingUp className="h-8 w-8 text-green-500" />}
          />
          <FinancialCard 
            title="Food Cost Ratio" 
            value={`${financialMetrics?.costs?.foodCost && financialMetrics?.revenue?.monthly 
              ? ((financialMetrics.costs.foodCost / financialMetrics.revenue.monthly) * 100).toFixed(1) 
              : '0'}%`} 
            change={`${financialMetrics?.changes?.foodCost >= 0 ? '+' : ''}${financialMetrics?.changes?.foodCost?.toFixed(1)}%`}
            trend={financialMetrics?.changes?.foodCost >= 0 ? "up" : "down"}
            icon={<TrendingDown className="h-8 w-8 text-teal-500" />}
          />
          <FinancialCard 
            title="Labor Cost Ratio" 
            value={`${financialMetrics?.costs?.laborCost && financialMetrics?.revenue?.monthly 
              ? ((financialMetrics.costs.laborCost / financialMetrics.revenue.monthly) * 100).toFixed(1) 
              : '0'}%`} 
            change={`${financialMetrics?.changes?.laborCost >= 0 ? '+' : ''}${financialMetrics?.changes?.laborCost?.toFixed(1)}%`}
            trend={financialMetrics?.changes?.laborCost >= 0 ? "up" : "down"}
            icon={<BarChart className="h-8 w-8 text-purple-500" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartCard title="Revenue & Profit Trends">
            {businessTrends.length > 0 ? (
              <Bar
                data={{
                  labels: businessTrends.map(item => item.month),
                  datasets: [
                    {
                      label: 'Revenue',
                      data: businessTrends.map(item => item.revenue),
                      backgroundColor: 'rgba(59, 130, 246, 0.5)',
                      borderColor: 'rgba(59, 130, 246, 1)',
                      borderWidth: 1
                    },
                    {
                      label: 'Profit',
                      data: businessTrends.map(item => item.profit),
                      backgroundColor: 'rgba(16, 185, 129, 0.5)',
                      borderColor: 'rgba(16, 185, 129, 1)',
                      borderWidth: 1
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.05)'
                      },
                      ticks: {
                        callback: function(value) {
                          return '$' + value.toLocaleString();
                        }
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        boxWidth: 12,
                        padding: 20
                      }
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          let label = context.dataset.label || '';
                          if (label) {
                            label += ': ';
                          }
                          if (context.parsed.y !== null) {
                            label += '$' + context.parsed.y.toLocaleString();
                          }
                          return label;
                        }
                      }
                    }
                  }
                }}
                height={300}
              />
            ) : (
              <div className="h-80 flex items-center justify-center">
                <LineChart className="h-16 w-16 text-gray-300" />
                <p className="ml-4 text-gray-500">No data available</p>
              </div>
            )}
          </ChartCard>
          <ChartCard title="Inventory Alerts">
            <div className="h-80">
              <div className="h-full flex flex-col">
                {inventoryAlerts && inventoryAlerts.length > 0 ? (
                  <>
                    <div className="mb-4 flex justify-between text-sm font-medium text-gray-500">
                      <span>Item</span>
                      <span>Current Stock</span>
                      <span>Status</span>
                    </div>
                    <div className="space-y-3 overflow-y-auto">
                      {inventoryAlerts.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-gray-600">
                            {item.currentStock} / {item.minLevel}
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === 'critical' 
                              ? 'bg-red-100 text-red-800' 
                              : item.status === 'warning' 
                                ? 'bg-amber-100 text-amber-800' 
                                : 'bg-green-100 text-green-800'
                          }`}>
                            {item.status === 'critical' ? 'Critical' : item.status === 'warning' ? 'Low' : 'Good'}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        View All Inventory
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="bg-green-100 text-green-800 p-2 rounded-full mb-2">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-gray-600">All inventory levels are good</p>
                  </div>
                )}
              </div>
            </div>
          </ChartCard>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Top Selling Items</h2>
          </div>
          <div className="px-6 py-5">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topSellingItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{item.sales}</td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">${item.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <ActionButton 
              icon="👥" 
              title="User Management" 
              description="Add, edit, or remove system users" 
              href="/dashboard/owner/users" 
            />
            <ActionButton 
              icon="🧠" 
              title="AI Financial Intelligence" 
              description="Generate reports and analyze financial data with AI" 
              href="/dashboard/owner/financial" 
            />
            <ActionButton 
              icon="👥" 
              title="Manage Staff" 
              description="View and edit employee information" 
              href="/staff" 
            />
            <ActionButton 
              icon="🍽️" 
              title="Menu Analysis" 
              description="Analyze menu performance metrics" 
              href="/menu/analytics" 
            />
            <ActionButton 
              icon="📅" 
              title="Forecast Planning" 
              description="View AI-powered business forecasts" 
              href="/forecasts" 
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function FinancialCard({ title, value, change, trend, icon }) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg transition-all duration-200 hover:shadow-md">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-gray-50 rounded-md p-3">
            {icon || (trend === "up" ? 
              <TrendingUp className="h-8 w-8 text-green-500" /> : 
              <TrendingDown className="h-8 w-8 text-red-500" />
            )}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-4 py-3 sm:px-6">
        <div className="text-sm">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            trend === "up" ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {change}
          </span>
          <span className="ml-2 text-gray-500">from previous period</span>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">{title}</h2>
      </div>
      <div className="px-6 py-5">
        {children}
      </div>
    </div>
  );
}

function ActionButton({ icon, title, description, href }) {
  return (
    <Link href={href} className="block">
      <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center">
        <div className="flex-shrink-0 text-2xl">{icon}</div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <div className="ml-auto">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
} 