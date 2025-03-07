"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { useRouter } from 'next/navigation';

// Register ChartJS components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export default function InventoryManagement() {
  const [inventoryData, setInventoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGenerateOrderModal, setShowGenerateOrderModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    currentStock: '',
    unit: 'kg',
    minLevel: '',
    pricePerUnit: '',
    supplier: '',
    locationInStorage: '',
    notes: ''
  });
  const [orderItems, setOrderItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newlyAddedItemId, setNewlyAddedItemId] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState({
    id: '',
    name: '',
    category: '',
    currentStock: '',
    unit: 'kg',
    minLevel: '',
    value: '',
    trend: 'stable'
  });
  const [showAIRestockAlert, setShowAIRestockAlert] = useState(true);
  const [aiRestockRecommendations, setAiRestockRecommendations] = useState([]);
  const router = useRouter();

  // Define a proper fetchInventoryData function that returns a promise
  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      
      // Fetch data from API
      const response = await fetch('/api/manager/inventory-data');
      if (!response.ok) throw new Error('Failed to fetch inventory data');
      const data = await response.json();
      
      // Generate AI restock recommendations based on inventory data
      if (data && data.items) {
        const recommendations = generateAIRestockRecommendations(data.items);
        setAiRestockRecommendations(recommendations);
      }
      
      setInventoryData(data);
      return data; // Return the data for promise chaining
    } catch (err) {
      console.error('Error fetching inventory data:', err);
      setError('Failed to load inventory data. Please try again later.');
      
      // Fallback dummy data
      const fallbackData = {
        stats: {
          totalItems: 78,
          lowStockItems: 12,
          totalValue: 12590.45,
          categories: ['Produce', 'Meat', 'Seafood', 'Dairy', 'Dry Goods', 'Beverages']
        },
        items: [
          { id: '1', name: 'Fresh Tomatoes', category: 'Produce', currentStock: 3.5, unit: 'kg', minLevel: 5, value: 17.5, usage: { last7Days: 12.5, last30Days: 45.8 }, trend: 'increasing' },
          // Other fallback items...
        ],
        aiAnalysis: {} // Simplified for brevity
      };
      
      setInventoryData(fallbackData);
      return fallbackData;
    } finally {
      setLoading(false);
    }
  };

  // Generate AI-powered restock recommendations
  const generateAIRestockRecommendations = (items) => {
    if (!items || !Array.isArray(items)) return [];
    
    // Apply AI-like logic to determine which items need restocking
    return items
      .filter(item => {
        // Items already below minimum level
        if (item.currentStock < item.minLevel) {
          return true;
        }
        
        // Items close to minimum level (within 20%) with increasing or stable usage trend
        if (item.currentStock <= item.minLevel * 1.2 && 
            (item.trend === 'increasing' || item.trend === 'stable')) {
          return true;
        }
        
        // Items with high usage in the last 7 days relative to current stock
        if (item.usage && item.usage.last7Days && 
            item.usage.last7Days > item.currentStock * 0.4) {
          return true;
        }
        
        return false;
      })
      .map(item => {
        // Calculate urgency score
        let urgencyScore = 0;
        
        // Base urgency on stock level
        if (item.currentStock <= 0) {
          urgencyScore = 100; // Out of stock
        } else if (item.currentStock < item.minLevel * 0.5) {
          urgencyScore = 90; // Critical
        } else if (item.currentStock < item.minLevel) {
          urgencyScore = 70; // Urgent
        } else if (item.currentStock < item.minLevel * 1.2) {
          urgencyScore = 50; // Warning
        }
        
        // Adjust for usage trend
        if (item.trend === 'increasing') {
          urgencyScore += 15;
        }
        
        // Adjust for recent usage
        if (item.usage && item.usage.last7Days) {
          const daysUntilEmpty = item.currentStock / (item.usage.last7Days / 7);
          if (daysUntilEmpty < 3) {
            urgencyScore += 20;
          } else if (daysUntilEmpty < 7) {
            urgencyScore += 10;
          }
        }
        
        // Cap at 100
        urgencyScore = Math.min(urgencyScore, 100);
        
        // Recommendation object
        return {
          ...item,
          urgencyScore,
          urgencyLevel: urgencyScore >= 80 ? 'critical' : urgencyScore >= 60 ? 'urgent' : 'warning',
          restockAmount: Math.max(Math.ceil((item.minLevel * 1.5) - item.currentStock), 1),
          reason: item.currentStock < item.minLevel 
            ? `Below minimum level (${item.minLevel} ${item.unit})`
            : item.trend === 'increasing'
              ? 'Increasing usage trend predicted to reach minimum soon'
              : 'Recent high usage detected'
        };
      })
      .sort((a, b) => b.urgencyScore - a.urgencyScore) // Sort by urgency (highest first)
      .slice(0, 5); // Limit to top 5 most urgent items
  };
  
  // Function to handle batch restocking of recommended items
  const handleBatchRestock = () => {
    // Only include items that aren't already in restocking process
    const itemsToRestock = aiRestockRecommendations.map(item => ({
      ...item,
      orderQuantity: item.restockAmount,
      totalCost: parseFloat((item.restockAmount * (item.value / Math.max(0.1, item.currentStock))).toFixed(2))
    }));
    
    setOrderItems(itemsToRestock);
    setShowGenerateOrderModal(true);
  };

  // Update the scroll effect to be safer
  useEffect(() => {
    // Only attempt to scroll if we're in the browser and have a valid ID
    if (typeof window !== 'undefined' && newlyAddedItemId) {
      // Use setTimeout to ensure DOM is updated first
      setTimeout(() => {
        try {
          const element = document.getElementById(`item-${newlyAddedItemId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } catch (error) {
          console.error('Error scrolling to new item:', error);
        }
      }, 100);
    }
  }, [newlyAddedItemId]);

  // Add useEffect to call fetchInventoryData on component mount
  useEffect(() => {
    fetchInventoryData();
  }, []);

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const menuContainers = document.querySelectorAll('.action-menu-container');
      let clickedInside = false;
      
      menuContainers.forEach(container => {
        if (container.contains(event.target)) {
          clickedInside = true;
        }
      });
      
      if (!clickedInside && openActionMenu !== null) {
        setOpenActionMenu(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openActionMenu]);

  // Display loading spinner while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-600 border-blue-200 border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventory data...</p>
        </div>
      </div>
    );
  }

  // Display error message if fetch failed
  if (error && !inventoryData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Inventory</h2>
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

  // Sort and filter inventory items
  const filteredItems = inventoryData.items
    .filter(item => 
      (selectedCategory === 'all' || item.category === selectedCategory) &&
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'stock') {
        return sortOrder === 'asc' 
          ? a.currentStock - b.currentStock 
          : b.currentStock - a.currentStock;
      } else if (sortBy === 'value') {
        return sortOrder === 'asc' 
          ? a.value - b.value 
          : b.value - a.value;
      }
      return 0;
    });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ 
      ...prev, 
      [name]: name === 'currentStock' || name === 'minLevel' || name === 'pricePerUnit' 
        ? value // Keep as string so empty fields work correctly
        : value 
    }));
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/manager/inventory-data/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      });
      
      if (!response.ok) throw new Error('Failed to add item');
      
      // Get the response data to get the ID of the new item
      const data = await response.json();
      
      // Reset form completely with empty values
      setNewItem({
        name: '',
        category: '',
        currentStock: '',
        unit: 'kg',
        minLevel: '',
        pricePerUnit: '',
        supplier: '',
        locationInStorage: '',
        notes: ''
      });
      
      // Close the modal
      setShowAddModal(false);
      
      // Show notification
      setNotification({
        show: true,
        message: `Successfully added ${data?.data?.name || 'item'} to inventory!`,
        type: 'success'
      });
      
      // Refresh data and apply highlight after a small delay
      fetchInventoryData().then(() => {
        if (data?.success && data?.data?.id) {
          setNewlyAddedItemId(data.data.id);
          
          // Auto-clear the highlight and notification after 5 seconds
          setTimeout(() => {
            setNewlyAddedItemId(null);
            setNotification({ show: false, message: '', type: '' });
          }, 5000);
        }
      });
      
    } catch (err) {
      console.error('Error adding inventory item:', err);
      setNotification({
        show: true,
        message: 'Failed to add item. Please try again.',
        type: 'error'
      });
      
      // Auto-clear error notification after 5 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const prepareOrderList = () => {
    // Prepare order list based on low stock items
    const lowStockItems = inventoryData.items
      .filter(item => item.currentStock < item.minLevel)
      .map(item => {
        const orderQuantity = Math.ceil(item.minLevel * 1.5 - item.currentStock);
        return {
          ...item,
          orderQuantity,
          totalCost: orderQuantity * item.value / item.currentStock
        };
      });
    
    setOrderItems(lowStockItems);
    setShowGenerateOrderModal(true);
  };

  const handleGenerateOrder = async () => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/manager/inventory-data/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: orderItems }),
      });
      
      if (!response.ok) throw new Error('Failed to generate order');
      
      // Close modal
      setShowGenerateOrderModal(false);
      
      // Show success notification
      setNotification({
        show: true,
        message: 'Order generated successfully!',
        type: 'success'
      });
      
      // Auto-dismiss notification
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 5000);
      
      // Refresh data to reflect updated inventory
      await fetchInventoryData();
      
    } catch (err) {
      console.error('Error generating order:', err);
      
      // Show error notification
      setNotification({
        show: true,
        message: 'Failed to generate order. Please try again.',
        type: 'error'
      });
      
      // Auto-dismiss notification
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateOrderQuantity = (id, quantity) => {
    setOrderItems(orderItems.map(item => 
      item.id === id 
        ? { ...item, orderQuantity: quantity, totalCost: quantity * item.value / item.currentStock } 
        : item
    ));
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/manager/inventory-data/category', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newCategory }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // If successful, add this category to the list safely
        setInventoryData(prev => {
          const updatedCategories = [...(prev?.stats?.categories || []), newCategory];
          return {
            ...prev,
            stats: {
              ...(prev?.stats || {}),
              categories: updatedCategories
            }
          };
        });
        
        // Reset and close modal
        setNewCategory('');
        setShowCategoryModal(false);
        
        // Show notification
        setNotification({
          show: true,
          message: 'Category added successfully!',
          type: 'success'
        });
        
        // Auto-dismiss notification
        setTimeout(() => {
          setNotification({ show: false, message: '', type: '' });
        }, 5000);
      } else if (data.existing) {
        setNotification({
          show: true,
          message: 'This category already exists.',
          type: 'error'
        });
        setTimeout(() => {
          setNotification({ show: false, message: '', type: '' });
        }, 5000);
      } else {
        throw new Error(data.error || 'Failed to add category');
      }
    } catch (err) {
      console.error('Error adding category:', err);
      setNotification({
        show: true,
        message: 'Failed to add category. Please try again.',
        type: 'error'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete item
  const handleDeleteItem = async (itemId) => {
    if (confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/manager/inventory-data/delete?id=${itemId}`, {
          method: 'DELETE',
        });
        
        const data = await response.json();
        
        if (response.ok) {
          // Show success notification
          setNotification({
            show: true,
            message: 'Item deleted successfully',
            type: 'success'
          });
          
          // Auto-dismiss notification after 5 seconds
          setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
          }, 5000);
          
          // Refresh inventory data
          fetchInventoryData();
        } else {
          throw new Error(data.message || 'Failed to delete item');
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        
        // Show error notification
        setNotification({
          show: true,
          message: `Error: ${error.message}`,
          type: 'error'
        });
        
        // Auto-dismiss notification after 5 seconds
        setTimeout(() => {
          setNotification({ show: false, message: '', type: '' });
        }, 5000);
      }
    }
  };
  
  // Fix the restock handler
  const handleRestock = (item) => {
    // Calculate order quantity (difference between minimum level and current stock)
    const orderQty = Math.max(item.minLevel - item.currentStock, 1);
    
    // Calculate cost (assuming unit cost is value / currentStock)
    const unitCost = item.currentStock > 0 ? item.value / item.currentStock : 0;
    const totalCost = orderQty * unitCost;
    
    setOrderItems([{
      ...item,
      orderQuantity: orderQty,
      totalCost: parseFloat(totalCost.toFixed(2))
    }]);
    setShowGenerateOrderModal(true);
  };

  // Add a handler for editing items
  const handleEditItem = (item) => {
    setEditItem({
      id: item.id,
      name: item.name,
      category: item.category,
      currentStock: item.currentStock.toString(),
      unit: item.unit,
      minLevel: item.minLevel.toString(),
      value: item.value.toString(),
      trend: item.trend
    });
    setShowEditModal(true);
    setOpenActionMenu(null);
  };
  
  // Handle edit item input changes
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditItem(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle edit item submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/manager/inventory-data/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editItem),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update item');
      }
      
      // Close the modal
      setShowEditModal(false);
      
      // Show success notification
      setNotification({
        show: true,
        message: 'Item updated successfully!',
        type: 'success'
      });
      
      // Auto-dismiss notification
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 5000);
      
      // Refresh inventory data to show the update
      await fetchInventoryData();
      
      // Highlight the updated item
      setNewlyAddedItemId(editItem.id);
      setTimeout(() => setNewlyAddedItemId(null), 3000);
      
    } catch (err) {
      console.error('Error updating item:', err);
      
      // Show error notification
      setNotification({
        show: true,
        message: err.message || 'Failed to update item. Please try again.',
        type: 'error'
      });
      
      // Auto-dismiss notification
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center">
              <Link href="/dashboard/manager" className="mr-4">
                <button className="p-1 rounded-full text-gray-500 hover:bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
            </div>
            <div className="mt-4 md:mt-0">
              <button 
                className={`px-4 py-2 text-sm rounded-md ${showAIInsights ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700 border border-purple-300'}`}
                onClick={() => setShowAIInsights(!showAIInsights)}
              >
                {showAIInsights ? 'Hide AI Insights' : 'Show AI Insights'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notification Banner */}
        {notification.show && (
          <div className={`mb-4 p-4 rounded-md ${
            notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 
            'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    onClick={() => setNotification({ show: false, message: '', type: '' })}
                    className={`inline-flex rounded-md p-1.5 ${
                      notification.type === 'success' ? 'text-green-500 hover:bg-green-100' : 
                      'text-red-500 hover:bg-red-100'
                    }`}
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* AI Restock Alert */}
        {showAIRestockAlert && aiRestockRecommendations.length > 0 && (
          <div className="bg-white shadow rounded-lg overflow-hidden mb-6 border-l-4 border-indigo-500">
            <div className="p-4 border-b border-gray-200 bg-indigo-50 flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-3 bg-indigo-100 rounded-full p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-indigo-800">AI Restock Recommendations</h2>
                  <p className="text-sm text-indigo-600">Our AI has detected items that may need restocking soon</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleBatchRestock}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
                >
                  Restock All
                </button>
                <button 
                  onClick={() => setShowAIRestockAlert(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Level</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                      <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {aiRestockRecommendations.map((item) => (
                      <tr key={`restock-${item.id}`} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-1">
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              <div className="text-xs text-gray-500">{item.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className={`text-sm font-medium ${
                            item.currentStock <= 0 ? 'text-red-700' :
                            item.currentStock < item.minLevel ? 'text-red-600' : 
                            item.currentStock < item.minLevel * 1.2 ? 'text-yellow-600' : 
                            'text-gray-900'
                          }`}>
                            {item.currentStock} {item.unit}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{item.minLevel} {item.unit}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.urgencyLevel === 'critical' ? 'bg-red-100 text-red-800' : 
                            item.urgencyLevel === 'urgent' ? 'bg-orange-100 text-orange-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.urgencyLevel === 'critical' ? 'Critical' : 
                             item.urgencyLevel === 'urgent' ? 'Urgent' : 'Warning'}
                            {' '}{Math.round(item.urgencyScore)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{item.reason}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <button 
                            onClick={() => handleRestock(item)}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                          >
                            Restock {item.restockAmount} {item.unit}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 text-sm text-gray-500 italic">
                <p>
                  <span className="font-medium">AI Insight:</span> These recommendations are based on current stock levels, historical usage patterns, and predicted future needs.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <SummaryCard 
            title="Total Inventory"
            value={inventoryData.stats.totalItems}
            description="Total items tracked"
            icon="📦"
            color="bg-blue-100 text-blue-800"
          />
          <SummaryCard 
            title="Low Stock Items"
            value={inventoryData.stats.lowStockItems}
            description="Items below minimum level"
            icon="⚠️"
            color="bg-red-100 text-red-800"
          />
          <SummaryCard 
            title="Inventory Value"
            value={`$${inventoryData.stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            description="Total current value"
            icon="💰"
            color="bg-green-100 text-green-800"
          />
          <SummaryCard 
            title="Categories"
            value={inventoryData.stats.categories.length}
            description="Different item categories"
            icon="🏷️"
            color="bg-purple-100 text-purple-800"
          />
        </div>

        {/* Search and Filter */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="w-full md:w-1/3">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search Inventory</label>
              <input
                type="text"
                id="search"
                placeholder="Search items..."
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-1/4">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Filter by Category</label>
              <select
                id="category"
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {inventoryData.stats.categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="w-full md:w-1/4">
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <div className="flex">
                <select
                  id="sort"
                  className="w-full px-4 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="name">Name</option>
                  <option value="stock">Current Stock</option>
                  <option value="value">Value</option>
                </select>
                <button
                  className="px-4 py-2 bg-gray-200 rounded-r-md border border-gray-300 hover:bg-gray-300"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium">Inventory Items</h2>
            <p className="text-sm text-gray-500 mt-1">Showing {filteredItems.length} of {inventoryData.items.length} items</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage Trend</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr 
                    id={`item-${item.id}`}
                    key={item.id} 
                    className={`hover:bg-gray-50 ${
                      newlyAddedItemId === item.id ? 'bg-green-50 animate-pulse' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${item.currentStock < item.minLevel ? 'text-red-600' : 'text-gray-900'}`}>
                        {item.currentStock} {item.unit}
                      </div>
                      {item.currentStock < item.minLevel && (
                        <div className="text-xs text-red-600">Low Stock</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{item.minLevel} {item.unit}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${item.value.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.trend === 'increasing' ? 'bg-green-100 text-green-800' : 
                        item.trend === 'decreasing' ? 'bg-red-100 text-red-800' : 
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {item.trend === 'increasing' ? '↑ Increasing' : 
                         item.trend === 'decreasing' ? '↓ Decreasing' : 
                         '→ Stable'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center space-x-2 action-menu-container">
                        <Link href={`/dashboard/manager/inventory/${item.id}`} className="text-blue-600 hover:text-blue-900 mr-2">
                          Details
                        </Link>
                        <button className="text-green-600 hover:text-green-900 mr-2" onClick={() => handleRestock(item)}>
                          Restock
                        </button>
                        
                        <div className="relative">
                          <button
                            className="text-gray-600 hover:text-gray-900"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenActionMenu(openActionMenu === item.id ? null : item.id);
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                          
                          {openActionMenu === item.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1">
                              <button
                                className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                                onClick={() => handleDeleteItem(item.id)}
                              >
                                Delete
                              </button>
                              <button
                                className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 w-full text-left"
                                onClick={() => handleEditItem(item)}
                              >
                                Edit
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors mr-2"
              onClick={() => setShowAddModal(true)}
            >
              Add New Item
            </button>
            <button 
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              onClick={prepareOrderList}
            >
              Generate Order
            </button>
          </div>
        </div>

        {/* AI Insights Section */}
        {showAIInsights && (
          <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-200 bg-purple-50">
              <div className="flex items-center">
                <div className="bg-purple-100 rounded-full p-2 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-medium text-purple-800">AI Inventory Analysis</h2>
                  <p className="text-sm text-purple-600 mt-1">Intelligent insights based on your inventory data</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-4">Monthly Usage by Category</h3>
                  <div className="h-80 w-full">
                    <Line 
                      data={inventoryData.aiAnalysis.monthlyUsageData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom'
                          }
                        }
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-4">Inventory Distribution by Category</h3>
                  <div className="h-80 w-full">
                    <Pie 
                      data={inventoryData.aiAnalysis.categoryDistribution}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom'
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-base font-medium text-gray-900 mb-4">Top Used Items</h3>
                  <div className="space-y-4">
                    {inventoryData.aiAnalysis.topUsedItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <span className="ml-3 text-sm font-medium text-gray-900">{item.name}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-3">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: `${item.usagePercent}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{item.usagePercent}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-base font-medium text-gray-900 mb-4">Usage Trends</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-green-600 mb-2">Increasing Usage</h4>
                      <div className="flex flex-wrap gap-2">
                        {inventoryData.aiAnalysis.usageTrends.increasing.map((item, index) => (
                          <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-red-600 mb-2">Decreasing Usage</h4>
                      <div className="flex flex-wrap gap-2">
                        {inventoryData.aiAnalysis.usageTrends.decreasing.map((item, index) => (
                          <span key={index} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-yellow-600 mb-2">Seasonal Items</h4>
                      <div className="flex flex-wrap gap-2">
                        {inventoryData.aiAnalysis.usageTrends.seasonal.map((item, index) => (
                          <span key={index} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-red-50 rounded-lg p-4">
                  <h3 className="text-base font-medium text-red-800 mb-4">Wastage Analysis</h3>
                  <div className="space-y-3">
                    {inventoryData.aiAnalysis.wastageItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{item.name}</span>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-3">
                            <div 
                              className="bg-red-600 h-2.5 rounded-full" 
                              style={{ width: `${item.wastagePercent}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-red-600">{item.wastagePercent}% wastage</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-base font-medium text-blue-800 mb-4">AI Recommendations</h3>
                  <ul className="space-y-2">
                    {inventoryData.aiAnalysis.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start">
                        <span className="inline-block w-4 h-4 bg-blue-200 rounded-full mt-1 mr-2"></span>
                        <span className="text-sm text-gray-800">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Item Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative bg-white rounded-lg shadow-xl max-w-md mx-auto p-6 w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Add New Inventory Item</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleAddItem}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      placeholder="Enter item name"
                      className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newItem.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <div className="flex space-x-2">
                      <select
                        id="category"
                        name="category"
                        required
                        className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newItem.category}
                        onChange={handleInputChange}
                      >
                        <option value="">Select a category</option>
                        {inventoryData.stats.categories.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowCategoryModal(true)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        + New
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="currentStock" className="block text-sm font-medium text-gray-700 mb-1">Current Stock</label>
                      <input
                        type="number"
                        id="currentStock"
                        name="currentStock"
                        required
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newItem.currentStock}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                      <select
                        id="unit"
                        name="unit"
                        required
                        className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newItem.unit}
                        onChange={handleInputChange}
                      >
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="liters">liters</option>
                        <option value="ml">ml</option>
                        <option value="units">units</option>
                        <option value="pieces">pieces</option>
                        <option value="bottles">bottles</option>
                        <option value="boxes">boxes</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="minLevel" className="block text-sm font-medium text-gray-700 mb-1">Minimum Level</label>
                      <input
                        type="number"
                        id="minLevel"
                        name="minLevel"
                        required
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newItem.minLevel}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="pricePerUnit" className="block text-sm font-medium text-gray-700 mb-1">Price per Unit</label>
                      <input
                        type="number"
                        id="pricePerUnit"
                        name="pricePerUnit"
                        required
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newItem.pricePerUnit}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                    <input
                      type="text"
                      id="supplier"
                      name="supplier"
                      placeholder="Enter supplier name"
                      className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newItem.supplier}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="locationInStorage" className="block text-sm font-medium text-gray-700 mb-1">Storage Location</label>
                    <input
                      type="text"
                      id="locationInStorage"
                      name="locationInStorage"
                      placeholder="Enter storage location"
                      className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newItem.locationInStorage}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={3}
                      placeholder="Enter any additional notes"
                      className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newItem.notes}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? 'Adding...' : 'Add Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Generate Order Modal */}
        {showGenerateOrderModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl mx-auto p-6 w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Generate Order</h3>
                <button 
                  onClick={() => setShowGenerateOrderModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {orderItems.length === 0 ? (
                <div className="text-center py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No items to order</h3>
                  <p className="mt-1 text-gray-500">All inventory items are above their minimum levels.</p>
                  <button
                    onClick={() => setShowGenerateOrderModal(false)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">The following items are below their minimum stock levels and need to be ordered:</p>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Level</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Quantity</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orderItems.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              <div className="text-sm text-gray-500">{item.category}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{item.currentStock} {item.unit}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{item.minLevel} {item.unit}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <input
                                type="number"
                                min="1"
                                step="1"
                                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md"
                                value={item.orderQuantity}
                                onChange={(e) => updateOrderQuantity(item.id, parseInt(e.target.value) || 0)}
                              />
                              <span className="ml-1 text-sm text-gray-500">{item.unit}</span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">${(item.value / item.currentStock).toFixed(2)}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">${item.totalCost.toFixed(2)}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={5} className="px-4 py-3 text-right text-sm font-medium">Total Order Value:</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-bold">
                            ${orderItems.reduce((sum, item) => sum + item.totalCost, 0).toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowGenerateOrderModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleGenerateOrder}
                      disabled={isSubmitting}
                      className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {isSubmitting ? 'Processing...' : 'Generate Order'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Add Category Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative bg-white rounded-lg shadow-xl max-w-md mx-auto p-6 w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Add New Category</h3>
                <button 
                  onClick={() => setShowCategoryModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleAddCategory}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="newCategory" className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                    <input
                      type="text"
                      id="newCategory"
                      required
                      placeholder="Enter category name"
                      className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? 'Adding...' : 'Add Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Item Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative bg-white rounded-lg shadow-xl max-w-md mx-auto p-6 w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Edit Item</h3>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleEditSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      placeholder="Enter item name"
                      className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editItem.name}
                      onChange={handleEditInputChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      id="category"
                      name="category"
                      required
                      className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editItem.category}
                      onChange={handleEditInputChange}
                    >
                      <option value="">Select a category</option>
                      {inventoryData.stats.categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="currentStock" className="block text-sm font-medium text-gray-700 mb-1">Current Stock</label>
                      <input
                        type="number"
                        id="currentStock"
                        name="currentStock"
                        required
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editItem.currentStock}
                        onChange={handleEditInputChange}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                      <select
                        id="unit"
                        name="unit"
                        required
                        className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editItem.unit}
                        onChange={handleEditInputChange}
                      >
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="liters">liters</option>
                        <option value="ml">ml</option>
                        <option value="units">units</option>
                        <option value="pieces">pieces</option>
                        <option value="bottles">bottles</option>
                        <option value="boxes">boxes</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="minLevel" className="block text-sm font-medium text-gray-700 mb-1">Minimum Level</label>
                      <input
                        type="number"
                        id="minLevel"
                        name="minLevel"
                        required
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editItem.minLevel}
                        onChange={handleEditInputChange}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                      <input
                        type="number"
                        id="value"
                        name="value"
                        required
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editItem.value}
                        onChange={handleEditInputChange}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="trend" className="block text-sm font-medium text-gray-700 mb-1">Usage Trend</label>
                    <select
                      id="trend"
                      name="trend"
                      required
                      className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editItem.trend}
                      onChange={handleEditInputChange}
                    >
                      <option value="increasing">Increasing</option>
                      <option value="stable">Stable</option>
                      <option value="decreasing">Decreasing</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? 'Updating...' : 'Update Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function SummaryCard({ title, value, description, icon, color }) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 h-12 w-12 ${color} rounded-full flex items-center justify-center text-2xl`}>
          {icon}
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
} 