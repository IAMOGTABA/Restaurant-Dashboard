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

  // Define fetchStaffData outside useEffect so it's accessible throughout the component
  const fetchStaffData = async () => {
    try {
      setLoading(true);
      
      // Fetch staff data from API
      const response = await fetch('/api/manager/staff-data');
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
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
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
      const response = await fetch(`/api/manager/staff-shifts?staffId=${staffId}`);
      if (!response.ok) throw new Error('Failed to fetch shifts');
      const data = await response.json();
      setStaffShifts(data);
      setLoadingShifts(false);
    } catch (err) {
      console.error('Error fetching staff shifts:', err);
      setStaffShifts([]);
      setLoadingShifts(false);
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
          hourlyRate: parseFloat(newStaffData.hourlyRate),
          contactNumber: newStaffData.contactNumber || '(000) 000-0000',
          address: newStaffData.address || 'No address provided',
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
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} shift`);
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
  
  // Handle input change for the add staff form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStaffData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // If the user is selected, pre-fill the name
    if (name === 'userId') {
      const selectedUser = users.find(user => user.id === value);
      setSelectedUser(selectedUser);
    }
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
              <button 
                onClick={() => setShowAddStaffModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Staff Member
              </button>
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
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <StaffSummaryCard 
            title="Total Staff" 
            count={staffData.staffCount.total}
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />}
            color="blue"
          />
          <StaffSummaryCard 
            title="On Duty" 
            count={staffData.staffCount.onDuty}
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />}
            color="green"
          />
          <StaffSummaryCard 
            title="Waiters" 
            count={staffData.staffCount.byRole.waiter?.total || 0}
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />}
            color="purple"
          />
          <StaffSummaryCard 
            title="Chefs" 
            count={staffData.staffCount.byRole.chef?.total || 0}
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />}
            color="yellow"
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
                      <div className="ml-2 flex-shrink-0 flex">
                        {employee.status === 'ACTIVE' ? (
                          <button
                            onClick={() => handleShiftAction(employee.id, 'end')}
                            disabled={updatingStatus[employee.id]}
                            className={`px-3 py-1 text-xs rounded-md bg-red-600 text-white hover:bg-red-700 focus:outline-none ${updatingStatus[employee.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {updatingStatus[employee.id] ? 'Updating...' : 'End Shift'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleShiftAction(employee.id, 'start')}
                            disabled={updatingStatus[employee.id] || employee.status === 'COMPLETED'}
                            className={`px-3 py-1 text-xs rounded-md ${
                              employee.status === 'COMPLETED' 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                : 'bg-green-600 text-white hover:bg-green-700 focus:outline-none'
                            } ${updatingStatus[employee.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {updatingStatus[employee.id] ? 'Updating...' : 'Start Shift'}
                          </button>
                        )}
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
                    Position/Role
                  </label>
                  <select
                    id="position"
                    name="position"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={newStaffData.position}
                    onChange={handleInputChange}
                    required
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
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="hourlyRate">
                    Hourly Rate
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
                    required
                    placeholder="10.00"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contactNumber">
                    Contact Number
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
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={newStaffData.address}
                    onChange={handleInputChange}
                    placeholder="123 Main St, City, Country"
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
            <div className="relative top-20 mx-auto p-5 border max-w-xl shadow-lg rounded-md bg-white">
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
              
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Shift History</h4>
                
                {loadingShifts ? (
                  <div className="text-center py-4">
                    <div className="w-8 h-8 border-2 border-t-blue-600 border-blue-200 border-solid rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-gray-500 text-sm">Loading shift data...</p>
                  </div>
                ) : staffShifts.length > 0 ? (
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
                              Duration: {shift.durationFormatted}
                            </p>
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