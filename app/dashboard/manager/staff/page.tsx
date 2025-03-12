"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function StaffManagement() {
  const [staffData, setStaffData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  
  // Add new state variables for enhanced functionality
  const [users, setUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState('all');
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newStaffData, setNewStaffData] = useState({
    userId: '',
    position: '',
    hourlyRate: '10.00',
    contactNumber: '',
    address: '',
    notes: ''
  });
  const [showStaffDetailModal, setShowStaffDetailModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffShifts, setStaffShifts] = useState([]);
  const [loadingShifts, setLoadingShifts] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [shiftHistoryView, setShiftHistoryView] = useState('weekly'); // 'weekly' or 'monthly'

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };
    
    // Add passive option to improve performance
    document.addEventListener('mousedown', handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  // Define fetchStaffData outside useEffect so it's accessible throughout the component
  const fetchStaffData = async () => {
    try {
      setLoading(true);
      
      // Add a timeout to prevent hanging requests
      const fetchPromise = fetch('/api/manager/staff-data');
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      );
      
      // Race between fetch and timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      // Make sure we have a valid Response object
      if (!(response instanceof Response)) {
        throw new Error('Invalid response received');
      }
      
      if (!response.ok) throw new Error('Failed to fetch staff data');
      const data = await response.json();
      
      setStaffData(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching staff data:', err);
      setError('Failed to load staff data. Please try again later.');
      
      // Fallback dummy data
      setStaffData({
        staffCount: {
          total: 24,
          onDuty: 15,
          onDutyToday: 15,
          active: 24,
          byRole: {
            waiter: { total: 8, onDuty: 5 },
            chef: { total: 6, onDuty: 4 },
            bartender: { total: 4, onDuty: 2 },
            host: { total: 3, onDuty: 2 },
            manager: { total: 2, onDuty: 1 },
            cleaner: { total: 1, onDuty: 1 }
          }
        },
        staff: [
          { id: '1', name: 'John Smith', role: 'Chef', status: 'COMPLETED', shiftTime: '8:00 AM - 4:00 PM', image: 'https://randomuser.me/api/portraits/men/1.jpg', performance: 92 },
          { id: '2', name: 'Sarah Wilson', role: 'Waiter', status: 'COMPLETED', shiftTime: '11:00 AM - 7:00 PM', image: 'https://randomuser.me/api/portraits/women/2.jpg', performance: 88 },
          { id: '3', name: 'David Miller', role: 'Bartender', status: 'LATE', shiftTime: '12:00 PM - 8:00 PM', image: 'https://randomuser.me/api/portraits/men/3.jpg', performance: 75 },
          { id: '4', name: 'Jessica Lee', role: 'Host', status: 'COMPLETED', shiftTime: '10:00 AM - 6:00 PM', image: 'https://randomuser.me/api/portraits/women/4.jpg', performance: 95 },
          { id: '5', name: 'Michael Chen', role: 'Waiter', status: 'COMPLETED', shiftTime: '9:00 AM - 5:00 PM', image: 'https://randomuser.me/api/portraits/men/5.jpg', performance: 90 },
          { id: '6', name: 'Emma Davis', role: 'Chef', status: 'COMPLETED', shiftTime: '7:00 AM - 3:00 PM', image: 'https://randomuser.me/api/portraits/women/6.jpg', performance: 94 },
          { id: '7', name: 'Robert Taylor', role: 'Waiter', status: 'OFF', shiftTime: 'Off Today', image: 'https://randomuser.me/api/portraits/men/7.jpg', performance: 82 },
          { id: '8', name: 'Amanda Wilson', role: 'Bartender', status: 'COMPLETED', shiftTime: '4:00 PM - 12:00 AM', image: 'https://randomuser.me/api/portraits/women/8.jpg', performance: 89 }
        ]
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    // Call fetchStaffData when component mounts
    fetchStaffData();
    
    // Fetch available users for the add staff modal
    const fetchUsers = async () => {
      try {
        // Fetch users who are not already assigned to staff, including their role
        const response = await fetch('/api/users?notInStaff=true');
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        
        // Log user data for debugging
        console.log('Available users for staff assignment:', data);
        
        setUsers(data);
      } catch (err) {
        console.error('Error fetching users:', err);
        // We can still continue even if this fails
      }
    };
    
    fetchUsers();
  }, []);
  
  // Function to fetch shifts for a specific staff member
  const fetchStaffShifts = async (staffId) => {
    try {
      setLoadingShifts(true);
      
      console.log(`Fetching shifts for staff ID: ${staffId}`);
      
      // Make sure we have a valid staffId
      if (!staffId) {
        console.error('Invalid staffId in fetchStaffShifts:', staffId);
        throw new Error('Invalid staff ID');
      }
      
      // Add a timeout to prevent hanging requests
      const fetchPromise = fetch(`/api/manager/staff-shifts?staffId=${staffId}`);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      );
      
      // Race between fetch and timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      // Make sure we have a valid Response object
      if (!(response instanceof Response)) {
        throw new Error('Invalid response received');
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response from API:', errorData);
        throw new Error(errorData.error || 'Failed to fetch shifts');
      }
      
      const data = await response.json();
      
      // Process and format shift data
      const processedShifts = data.shifts.map(shift => {
        // Ensure shift has all required properties
        return {
          ...shift,
          durationFormatted: shift.durationFormatted || 'In progress'
        };
      });
      
      setStaffShifts(processedShifts);
      setLoadingShifts(false);
    } catch (err) {
      console.error('Error fetching staff shifts:', err);
      setStaffShifts([]);
      setLoadingShifts(false);
      
      // Show an error notification
      setNotification({
        show: true,
        message: `Failed to load shifts: ${err.message}`,
        type: 'error'
      });
      
      // Auto-dismiss notification
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    }
  };
  
  // Handle role filter change
  const handleRoleChange = (role) => {
    setSelectedRole(role);
  };
  
  // Handle adding a new staff member
  const handleAddStaff = async (e) => {
    e.preventDefault();
    
    try {
      // Validate data
      if (!newStaffData.userId || !newStaffData.position) {
        setNotification({
          show: true,
          message: 'Please select a user and position',
          type: 'error'
        });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
        return;
      }
      
      // Set submitting state
      setIsSubmitting(true);
      
      console.log("Submitting new staff data:", newStaffData);
      
      // Send API request to create staff member
      const response = await fetch('/api/manager/staff-data/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: newStaffData.userId,
          position: newStaffData.position,
          hourlyRate: parseFloat(newStaffData.hourlyRate) || 10.00,
          contactNumber: newStaffData.contactNumber || '(000) 000-0000',
          address: newStaffData.address || 'Not provided',
          notes: newStaffData.notes
        }),
      });
      
      // Parse response data
      const data = await response.json();
      console.log("Staff creation response:", data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create staff member');
      }
      
      // Show success notification
      setNotification({
        show: true,
        message: 'Staff member added successfully!',
        type: 'success'
      });
      
      // Close modal and reset form
      setShowAddStaffModal(false);
      setNewStaffData({
        userId: '',
        position: '',
        hourlyRate: '10.00',
        contactNumber: '',
        address: '',
        notes: ''
      });
      
      // Refresh staff data
      await fetchStaffData();
      
      // Auto-dismiss notification
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
      
    } catch (err) {
      console.error('Error adding staff member:', err);
      
      // Show detailed error notification
      setNotification({
        show: true,
        message: `Error: ${err.message || 'Failed to add staff member. Please try again.'}`,
        type: 'error'
      });
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 5000);
    } finally {
      // Clear submitting state
      setIsSubmitting(false);
    }
  };
  
  // Handle time tracking (start/end shift)
  const handleShiftAction = async (staffId, action) => {
    try {
      // Set updating status
      setUpdatingStatus(prev => ({ ...prev, [staffId]: true }));
      
      console.log(`Attempting to ${action} shift for staff ID: ${staffId}`);
      
      // If we don't have a valid staffId, log an error and return
      if (!staffId) {
        console.error('Invalid staffId:', staffId);
        throw new Error('Invalid staff ID');
      }
      
      // Send API request to start/end shift
      const response = await fetch('/api/manager/staff-shifts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staffId,
          action // 'start' or 'end'
        }),
      });
      
      // Always read the response, even if it's an error
      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
        console.log(`API response for ${action} shift:`, data);
      } catch (parseError) {
        console.error(`Error parsing JSON response: ${responseText}`);
        throw new Error(`Invalid response from server: ${responseText}`);
      }
      
      if (!response.ok) {
        console.error(`Error response (${response.status}):`, data);
        throw new Error(data.error || data.details || `Failed to ${action} shift`);
      }
      
      // Show success notification
      setNotification({
        show: true,
        message: data.message || `Shift ${action}ed successfully!`,
        type: 'success'
      });
      
      // Refresh staff data
      await fetchStaffData();
      
      // If in staff detail modal, also refresh shifts
      if (selectedStaff && selectedStaff.id === staffId) {
        fetchStaffShifts(staffId);
      }
      
      // Auto-dismiss notification
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
      
    } catch (err) {
      console.error(`Error ${action}ing shift:`, err);
      setNotification({
        show: true,
        message: err.message || `Failed to ${action} shift. Please try again.`,
        type: 'error'
      });
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    } finally {
      // Clear updating status
      setUpdatingStatus(prev => ({ ...prev, [staffId]: false }));
    }
  };
  
  // Open staff detail modal and fetch shifts
  const openStaffDetail = (staff) => {
    setSelectedStaff(staff);
    setShowStaffDetailModal(true);
    fetchStaffShifts(staff.id);
  };
  
  // Handle input changes in the add staff form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // When userId changes, find the user and automatically set the position based on their role
    if (name === 'userId' && value) {
      const selectedUser = users.find(user => user.id === value);
      if (selectedUser) {
        // Map user role to position
        let position = '';
        switch(selectedUser.role) {
          case 'MANAGER':
            position = 'Manager';
            break;
          case 'WAITER':
            position = 'Waiter';
            break;
          case 'KITCHEN':
            position = 'Chef';
            break;
          case 'BAR':
            position = 'Bartender';
            break;
          case 'RECEPTIONIST':
            position = 'Host';
            break;
          case 'SHISHA':
            position = 'Shisha';
            break;
          default:
            position = selectedUser.role.charAt(0) + selectedUser.role.slice(1).toLowerCase();
            break;
        }
        
        // Update the form with the user's role and clear address & hourlyRate
        setNewStaffData(prev => ({ 
          ...prev, 
          [name]: value,
          position: position,
          // Keep minimal defaults for hourlyRate and address
          hourlyRate: '10.00',
          address: ''
        }));
      }
    } else {
      // Normal input handling for other fields
      setNewStaffData(prev => ({ 
        ...prev, 
        [name]: value 
      }));
    }
  };

  // Calendar and date utility functions
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };
  
  // Generate calendar days for the monthly view
  const generateCalendarDays = (shifts) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Get the first day of the month
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    
    // Get the last day of the month
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    // Get the day of the week the first day falls on (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    // Get the last day of the previous month
    const lastDayOfPreviousMonth = new Date(currentYear, currentMonth, 0).getDate();
    
    // Create array for calendar days
    const calendarDays = [];
    
    // Add days from previous month to fill the first week
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = lastDayOfPreviousMonth - i;
      const date = new Date(currentYear, currentMonth - 1, day);
      
      // Check if there's a shift on this day
      const dayShift = shifts.find(shift => {
        const shiftDate = new Date(shift.startTime);
        return (
          shiftDate.getDate() === date.getDate() && 
          shiftDate.getMonth() === date.getMonth() && 
          shiftDate.getFullYear() === date.getFullYear()
        );
      });
      
      calendarDays.push({
        day,
        isCurrentMonth: false,
        isToday: false,
        hasShift: !!dayShift,
        shiftStatus: dayShift ? dayShift.status : null
      });
    }
    
    // Add days for current month
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isToday = day === today.getDate();
      
      // Check if there's a shift on this day
      const dayShift = shifts.find(shift => {
        const shiftDate = new Date(shift.startTime);
        return (
          shiftDate.getDate() === date.getDate() && 
          shiftDate.getMonth() === date.getMonth() && 
          shiftDate.getFullYear() === date.getFullYear()
        );
      });
      
      calendarDays.push({
        day,
        isCurrentMonth: true,
        isToday,
        hasShift: !!dayShift,
        shiftStatus: dayShift ? dayShift.status : null
      });
    }
    
    // Add days from next month to complete the grid (6 rows x 7 days = 42 cells)
    const remainingDays = 42 - calendarDays.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(currentYear, currentMonth + 1, day);
      
      // Check if there's a shift on this day
      const dayShift = shifts.find(shift => {
        const shiftDate = new Date(shift.startTime);
        return (
          shiftDate.getDate() === date.getDate() && 
          shiftDate.getMonth() === date.getMonth() && 
          shiftDate.getFullYear() === date.getFullYear()
        );
      });
      
      calendarDays.push({
        day,
        isCurrentMonth: false,
        isToday: false,
        hasShift: !!dayShift,
        shiftStatus: dayShift ? dayShift.status : null
      });
    }
    
    return calendarDays;
  };

  // Display loading spinner while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-600 border-blue-200 border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading staff data...</p>
        </div>
      </div>
    );
  }

  // Display error message if fetch failed
  if (error && !staffData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Staff Data</h2>
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

  const filteredStaff = filter === 'all' 
    ? staffData.staff 
    : staffData.staff.filter(employee => employee.role.toLowerCase() === filter);

  // Apply role filtering for the enhanced UI
  const roleFilteredStaff = selectedRole === 'all'
    ? filteredStaff
    : filteredStaff.filter(employee => employee.role.toLowerCase() === selectedRole.toLowerCase());

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center">
              <Link href="/dashboard/manager" className="mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 hover:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-2xl font-semibold text-gray-800">Staff Management</h1>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex justify-between items-center">
                <div className="flex-1 flex flex-col">
                  <h1 className="text-2xl font-bold">Staff Management</h1>
                  <p className="text-gray-600">Manage staff, track time, and monitor performance</p>
                </div>
                <div className="flex gap-3 items-center">
                  <button
                    onClick={() => setShowAddStaffModal(true)}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Staff Member
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Notification banner */}
        {notification.show && (
          <div className={`mb-4 p-4 rounded-md ${notification.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center">
              <div className={`mr-3 ${notification.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                {notification.type === 'success' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className={notification.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {notification.message}
              </div>
            </div>
          </div>
        )}

        {/* Staff Summary Cards */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <StaffSummaryCard 
            title="Total Staff" 
            count={staffData.staffCount.total}
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />}
            color="blue"
          />
          <StaffSummaryCard 
            title="Staff on Duty" 
            count={staffData.staffCount.onDutyToday || staffData.staffCount.onDuty || 0}
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />}
            color="green"
          />
        </div>

        {/* Role Filter Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => handleRoleChange('all')}
              className={`px-4 py-2 text-sm font-medium ${
                selectedRole === 'all'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Staff
            </button>
            {Object.keys(staffData.staffCount.byRole).map((role) => {
              // Count how many staff have this role
              const staffWithRole = staffData.staff.filter(
                staff => staff.role.toLowerCase() === role.toLowerCase()
              ).length;
              
              return (
                <button
                  key={role}
                  onClick={() => handleRoleChange(role)}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                    selectedRole === role
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                  {' '}
                  <span className={`font-bold ${selectedRole === role ? 'text-blue-600' : 'text-gray-700'}`}>
                    ({staffWithRole})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Role section header when filtered */}
        {selectedRole !== 'all' && (
          <div className="mb-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
            <h2 className="text-lg font-semibold text-indigo-800 mb-1 capitalize">
              {selectedRole} Staff
              <span className="ml-2 text-sm text-indigo-600 font-normal">
                ({roleFilteredStaff.length} {roleFilteredStaff.length === 1 ? 'member' : 'members'})
              </span>
            </h2>
            <p className="text-sm text-indigo-600">
              {selectedRole === 'shisha' 
                ? 'Managing all Shisha staff members and their shifts' 
                : `Viewing all staff with the ${selectedRole} role`}
            </p>
          </div>
        )}

        {/* Staff List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {roleFilteredStaff.map((employee) => (
              <li key={employee.id} className="hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <img 
                          className="h-12 w-12 rounded-full object-cover" 
                          src={employee.image || 'https://via.placeholder.com/48'} 
                          alt={employee.name} 
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 cursor-pointer" onClick={() => openStaffDetail(employee)}>
                          {employee.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {employee.role}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="ml-2 flex-shrink-0 flex">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          employee.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                          employee.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' : 
                          employee.status === 'LATE' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {employee.status === 'ACTIVE' ? 'On Duty' : 
                           employee.status === 'COMPLETED' ? 'Completed' : 
                           employee.status === 'LATE' ? 'Late' : 'Off Duty'}
                        </span>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex space-x-2">
                        <div className="relative inline-block text-left dropdown-container">
                          <button
                            onClick={() => {
                              // Toggle dropdown menu for this employee
                              setSelectedStaff(employee);
                              setOpenDropdown(openDropdown === employee.id ? null : employee.id);
                            }}
                            className="px-3 py-1 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none flex items-center"
                          >
                            Actions
                            <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                          </button>
                          
                          {/* Dropdown Menu */}
                          {openDropdown === employee.id && (
                            <div 
                              className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                              role="menu"
                              aria-orientation="vertical"
                              aria-labelledby="options-menu"
                            >
                              <div className="py-1" role="none">
                                {employee.status !== 'ACTIVE' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleShiftAction(employee.id, 'start');
                                      setOpenDropdown(null);
                                    }}
                                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                    role="menuitem"
                                    disabled={updatingStatus[employee.id]}
                                  >
                                    {updatingStatus[employee.id] ? 'Starting...' : 'Start Shift'}
                                  </button>
                                )}
                                
                                {employee.status === 'ACTIVE' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleShiftAction(employee.id, 'end');
                                      setOpenDropdown(null);
                                    }}
                                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                    role="menuitem"
                                    disabled={updatingStatus[employee.id]}
                                  >
                                    {updatingStatus[employee.id] ? 'Ending...' : 'End Shift'}
                                  </button>
                                )}
                                
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openStaffDetail(employee);
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                  role="menuitem"
                                >
                                  View Details
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {employee.shiftTime}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Performance: {employee.performance}%
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="relative pt-1">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                        <div style={{ width: `${employee.performance}%` }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                          employee.performance >= 90 ? 'bg-green-500' : 
                          employee.performance >= 70 ? 'bg-blue-500' : 
                          employee.performance >= 50 ? 'bg-yellow-500' : 
                          'bg-red-500'
                        }`}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Add Staff Modal */}
        {showAddStaffModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add Staff Member</h3>
                <button onClick={() => setShowAddStaffModal(false)} className="text-gray-400 hover:text-gray-500">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700">
                  <span className="font-semibold">Note:</span> You can add multiple staff members with the same role (e.g., multiple Shisha staff)
                </p>
              </div>
              
              <form onSubmit={handleAddStaff}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="userId">
                    Select User
                  </label>
                  <select
                    id="userId"
                    name="userId"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={newStaffData.userId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a user</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="position">
                    Position/Role <span className="text-xs text-blue-600">(Auto-filled from user role)</span>
                  </label>
                  <select
                    id="position"
                    name="position"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
                    value={newStaffData.position}
                    onChange={handleInputChange}
                    required
                    disabled={!!newStaffData.userId} // Disable when user is selected
                  >
                    <option value="">Select position</option>
                    <option value="Waiter">Waiter</option>
                    <option value="Chef">Chef</option>
                    <option value="Bartender">Bartender</option>
                    <option value="Host">Host</option>
                    <option value="Manager">Manager</option>
                    <option value="Cleaner">Cleaner</option>
                    <option value="Shisha">Shisha</option>
                  </select>
                  {newStaffData.userId && (
                    <p className="mt-1 text-xs text-gray-500">
                      Position is automatically set based on the user's role
                    </p>
                  )}
                </div>
                
                {/* Hourly Rate - Optional */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="hourlyRate">
                    Hourly Rate <span className="text-xs text-gray-500">(Optional - Default: 10.00)</span>
                  </label>
                  <input
                    type="number"
                    id="hourlyRate"
                    name="hourlyRate"
                    step="0.01"
                    min="0"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={newStaffData.hourlyRate}
                    onChange={handleInputChange}
                    placeholder="10.00"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contactNumber">
                    Contact Number <span className="text-xs text-gray-500">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    id="contactNumber"
                    name="contactNumber"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={newStaffData.contactNumber}
                    onChange={handleInputChange}
                    placeholder="(123) 456-7890"
                  />
                </div>
                
                {/* Address - Optional */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
                    Address <span className="text-xs text-gray-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={newStaffData.address}
                    onChange={handleInputChange}
                    placeholder="Only if needed"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
                    Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={newStaffData.notes}
                    onChange={handleInputChange}
                    rows={3}
                  ></textarea>
                </div>
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddStaffModal(false)}
                    className="mr-2 bg-white text-gray-700 font-medium py-2 px-4 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding...
                      </div>
                    ) : 'Add Staff'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Staff Detail Modal */}
        {showStaffDetailModal && selectedStaff && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border max-w-3xl shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Staff Details</h3>
                <button onClick={() => setShowStaffDetailModal(false)} className="text-gray-400 hover:text-gray-500">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0 h-20 w-20">
                  <img 
                    className="h-20 w-20 rounded-full object-cover" 
                    src={selectedStaff.image || 'https://via.placeholder.com/80'} 
                    alt={selectedStaff.name} 
                  />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-bold text-gray-900">{selectedStaff.name}</h2>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                      {selectedStaff.role}
                    </span>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      selectedStaff.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                      selectedStaff.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' : 
                      selectedStaff.status === 'LATE' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedStaff.status === 'ACTIVE' ? 'On Duty' : 
                       selectedStaff.status === 'COMPLETED' ? 'Completed' : 
                       selectedStaff.status === 'LATE' ? 'Late' : 'Off Duty'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedStaff.shiftTime}
                  </p>
                </div>
              </div>
              
              {/* Attendance Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-600">Current Week</h4>
                  <div className="mt-2">
                    <p className="text-2xl font-bold text-gray-900">
                      {staffShifts.filter(shift => {
                        const shiftDate = new Date(shift.startTime);
                        const today = new Date();
                        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
                        startOfWeek.setHours(0, 0, 0, 0);
                        return shiftDate >= startOfWeek;
                      }).length} shifts
                    </p>
                    <p className="text-sm text-gray-500">
                      {staffShifts.filter(shift => {
                        const shiftDate = new Date(shift.startTime);
                        const today = new Date();
                        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
                        startOfWeek.setHours(0, 0, 0, 0);
                        return shiftDate >= startOfWeek && shift.status === 'COMPLETED';
                      }).length} completed
                    </p>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-600">Current Month</h4>
                  <div className="mt-2">
                    <p className="text-2xl font-bold text-gray-900">
                      {staffShifts.filter(shift => {
                        const shiftDate = new Date(shift.startTime);
                        const today = new Date();
                        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                        return shiftDate >= startOfMonth;
                      }).length} shifts
                    </p>
                    <p className="text-sm text-gray-500">
                      {Math.round((staffShifts.filter(shift => {
                        const shiftDate = new Date(shift.startTime);
                        const today = new Date();
                        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                        return shiftDate >= startOfMonth && shift.status === 'COMPLETED';
                      }).length / Math.max(1, staffShifts.filter(shift => {
                        const shiftDate = new Date(shift.startTime);
                        const today = new Date();
                        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                        return shiftDate >= startOfMonth;
                      }).length)) * 100)}% completion rate
                    </p>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-600">All Time</h4>
                  <div className="mt-2">
                    <p className="text-2xl font-bold text-gray-900">
                      {staffShifts.length} shifts
                    </p>
                    <p className="text-sm text-gray-500">
                      Since {staffShifts.length > 0 ? 
                        new Date(staffShifts[staffShifts.length - 1].startTime).toLocaleDateString() : 
                        'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-md font-medium text-gray-900">Shift History</h4>
                  <div className="flex items-center space-x-3">
                    <div className="text-xs text-gray-500 mr-2">
                      {staffShifts.filter(s => s.status === 'COMPLETED').length} completed, 
                      {staffShifts.filter(s => s.status === 'LATE').length} late,
                      {staffShifts.filter(s => s.status === 'ACTIVE').length} active
                    </div>
                    <div className="flex bg-gray-200 rounded-md p-1">
                      <button
                        className={`text-xs px-3 py-1 rounded-md ${
                          shiftHistoryView === 'weekly' 
                            ? 'bg-blue-600 text-white' 
                            : 'text-gray-700 hover:bg-gray-300'
                        }`}
                        onClick={() => setShiftHistoryView('weekly')}
                      >
                        Weekly
                      </button>
                      <button
                        className={`text-xs px-3 py-1 rounded-md ${
                          shiftHistoryView === 'monthly' 
                            ? 'bg-blue-600 text-white' 
                            : 'text-gray-700 hover:bg-gray-300'
                        }`}
                        onClick={() => setShiftHistoryView('monthly')}
                      >
                        Monthly
                      </button>
                    </div>
                  </div>
                </div>
                
                {loadingShifts ? (
                  <div className="text-center py-4">
                    <div className="w-8 h-8 border-2 border-t-blue-600 border-blue-200 border-solid rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-gray-500 text-sm">Loading shift data...</p>
                  </div>
                ) : staffShifts.length > 0 ? (
                  <div>
                    {/* View based on the selected view type */}
                    {shiftHistoryView === 'weekly' ? (
                      /* Weekly Time Bar */
                      <div className="mb-6">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">This Week's Schedule</h5>
                        <div className="bg-gray-100 rounded-lg p-3">
                          <div className="grid grid-cols-7 gap-1">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
                              const today = new Date();
                              const currentWeekDay = new Date();
                              currentWeekDay.setDate(today.getDate() - today.getDay() + index);
                              
                              // Check if there's a shift on this day
                              const dayShift = staffShifts.find(shift => {
                                const shiftDate = new Date(shift.startTime);
                                return shiftDate.getDate() === currentWeekDay.getDate() && 
                                       shiftDate.getMonth() === currentWeekDay.getMonth() &&
                                       shiftDate.getFullYear() === currentWeekDay.getFullYear();
                              });
                              
                              return (
                                <div key={day} className="text-center">
                                  <div className="text-xs font-medium mb-1">{day}</div>
                                  <div className={`text-xs ${today.getDay() === index ? 'font-bold' : ''}`}>
                                    {currentWeekDay.getDate()}
                                  </div>
                                  <div className={`h-3 mt-1 rounded-full ${
                                    dayShift ? 
                                      dayShift.status === 'COMPLETED' ? 'bg-green-500' : 
                                      dayShift.status === 'LATE' ? 'bg-yellow-500' : 
                                      dayShift.status === 'ACTIVE' ? 'bg-blue-500' : 'bg-gray-300'
                                    : 'bg-gray-200'
                                  }`}></div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Monthly Calendar View */
                      <div className="mb-6">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">This Month's Overview</h5>
                        <div className="bg-gray-100 rounded-lg p-3">
                          <div className="mb-2 text-center">
                            <span className="text-sm font-medium">
                              {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}
                            </span>
                          </div>
                          
                          {/* Calendar header */}
                          <div className="grid grid-cols-7 gap-1 mb-1">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                              <div key={index} className="text-xs text-center font-medium text-gray-500">
                                {day}
                              </div>
                            ))}
                          </div>
                          
                          {/* Calendar grid */}
                          <div className="grid grid-cols-7 gap-1">
                            {generateCalendarDays(staffShifts).map((day, index) => (
                              <div 
                                key={index} 
                                className={`text-center py-1 text-xs ${
                                  day.isCurrentMonth ? '' : 'text-gray-400'
                                } ${
                                  day.isToday ? 'bg-blue-100 font-bold' : ''
                                }`}
                              >
                                <div>{day.day}</div>
                                {day.hasShift && (
                                  <div 
                                    className={`h-2 w-2 mx-auto mt-1 rounded-full ${
                                      day.shiftStatus === 'COMPLETED' ? 'bg-green-500' : 
                                      day.shiftStatus === 'LATE' ? 'bg-yellow-500' : 
                                      day.shiftStatus === 'ACTIVE' ? 'bg-blue-500' : 'bg-gray-300'
                                    }`}
                                  ></div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Shift List - Always show regardless of weekly/monthly view */}
                    <ul className="divide-y divide-gray-200">
                      {staffShifts.map(shift => (
                        <li key={shift.id} className="py-3">
                          <div className="flex justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {new Date(shift.startTime).toLocaleDateString()} {" "}
                                {new Date(shift.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                {shift.endTime ? 
                                  ` - ${new Date(shift.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 
                                  ' - Present'}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Duration: {shift.durationFormatted || 'In progress'}
                              </p>
                              
                              {/* Time bar visualization */}
                              <div className="mt-2 relative pt-1">
                                <div className="flex mb-2 items-center justify-between">
                                  <div>
                                    <span className="text-xs font-semibold inline-block text-gray-600">
                                      Shift Progress
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-xs font-semibold inline-block text-gray-600">
                                      {shift.endTime ? '100%' : 'In progress'}
                                    </span>
                                  </div>
                                </div>
                                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                                  <div 
                                    style={{ 
                                      width: shift.endTime ? '100%' : '50%',
                                      transition: 'width 1s ease-in-out'
                                    }} 
                                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                                      shift.status === 'COMPLETED' ? 'bg-green-500' : 
                                      shift.status === 'LATE' ? 'bg-yellow-500' : 
                                      shift.status === 'ACTIVE' ? 'bg-blue-500' : 'bg-gray-400'
                                    }`}
                                  ></div>
                                </div>
                              </div>
                            </div>
                            <div>
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                shift.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                                shift.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' : 
                                shift.status === 'LATE' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {shift.status}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No shift history available</p>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowStaffDetailModal(false)}
                  className="bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StaffSummaryCard({ title, count, icon, color }) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 h-12 w-12 ${color} rounded-full flex items-center justify-center text-2xl`}>
          {icon}
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-semibold text-gray-900">{count}</p>
        </div>
      </div>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
StaffSummaryCard = React.memo(StaffSummaryCard); 