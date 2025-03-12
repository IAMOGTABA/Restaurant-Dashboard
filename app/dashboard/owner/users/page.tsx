"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { prisma } from '../../../../src/lib/prisma';

interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
}

export default function UserManagementPage() {
  // State for users and pagination
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  
  // State for modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showAddToGroupModal, setShowAddToGroupModal] = useState(false);
  
  // State for form data
  const [formData, setFormData] = useState({
    id: '',
    username: '',
    name: '',
    email: '',
    role: 'MANAGER',
    active: true,
    password: '111111'
  });
  
  // Selected user for editing/deleting
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Add a new state for tracking which users are currently being updated
  const [updatingUsers, setUpdatingUsers] = useState<Record<string, boolean>>({});
  
  // Add a new state for user groups
  const [userGroups, setUserGroups] = useState<Record<string, User[]>>({});
  
  // State for group operations
  const [groupFormData, setGroupFormData] = useState({
    username: '',
    name: '',
    email: '',
    role: 'WAITER',
    active: true,
    password: '111111'
  });
  
  // Selected group head for adding users to group
  const [selectedGroupHead, setSelectedGroupHead] = useState<User | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  
  // Add new states for success and error messages
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Add a new state for loading actions
  const [loadingAction, setLoadingAction] = useState(false);
  
  // Define fetchUsers function so it can be called from multiple places
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users?hierarchy=true');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      
      // Check if data has the new hierarchical structure
      if (data.users && data.userGroups) {
        setUsers(data.users);
        setFilteredUsers(data.users);
        
        // Set up user groups by role
        setUserGroups(data.userGroups);
      } else {
        // Old format, just set users directly
        setUsers(data);
        setFilteredUsers(data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch users from database on component mount
  useEffect(() => {
    fetchUsers();
  }, []);
  
  // Apply filters when search term, role filter, or status filter changes
  useEffect(() => {
    let filtered = [...users];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(term) || 
        user.name.toLowerCase().includes(term) || 
        user.email.toLowerCase().includes(term)
      );
    }
    
    // Apply role filter
    if (roleFilter) {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    // Apply status filter
    if (statusFilter) {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(user => user.active === isActive);
    }
    
    // Apply group filter
    if (groupFilter) {
      filtered = filtered.filter(user => {
        // Include the group head
        if (user.id === groupFilter) return true;
        
        // Include children of the group head
        return user.parentId === groupFilter;
      });
    }
    
    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter, groupFilter]);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle user creation
  const handleAddUser = async () => {
    try {
      setLoadingAction(true);
      
      // Make API request to create user
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        const errorMsg = responseData.error || responseData.details || 'Failed to create user';
        console.error('API error response:', responseData);
        throw new Error(errorMsg);
      }
      
      // Add the new user to the state immediately
      const newUser = responseData;
      setUsers(prevUsers => [newUser, ...prevUsers]);
      setFilteredUsers(prevUsers => [newUser, ...prevUsers]);
      
      // Show success message
      setSuccessMessage(`User ${formData.username} created successfully`);
      
      // Close modal and reset form
      setShowAddModal(false);
      resetForm();
      
      // Auto-dismiss success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
      // Also refresh the full user list to ensure consistency
      fetchUsers();
    } catch (err) {
      console.error('Error creating user:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to create user. Please try again.');
      
      // Auto-dismiss error message after 5 seconds
      setTimeout(() => {
        setErrorMessage('');
      }, 5000);
    } finally {
      setLoadingAction(false);
    }
  };
  
  // Handle user edit
  const handleEditUser = async () => {
    try {
      const response = await fetch(`/api/users/${formData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user');
      }
      
      const updatedUser = await response.json();
      setUsers(prevUsers => 
        prevUsers.map(user => user.id === updatedUser.id ? updatedUser : user)
      );
      setShowEditModal(false);
      resetForm();
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user. Please try again.');
    }
  };
  
  // Handle user delete
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      setLoadingAction(true);
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        const errorMsg = data.error || 'Failed to delete user';
        throw new Error(errorMsg);
      }
      
      // Remove the user from both lists
      setUsers(prevUsers => prevUsers.filter(user => user.id !== selectedUser.id));
      setFilteredUsers(prevUsers => prevUsers.filter(user => user.id !== selectedUser.id));
      
      // Show success message
      setSuccessMessage(`User ${selectedUser.name} deleted successfully`);
      
      // Close the modal
      setShowDeleteModal(false);
      
      // Reset selected user
      setSelectedUser(null);
      
      // Auto-dismiss success message
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error deleting user:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to delete user. Please try again.');
      
      // Auto-dismiss error message
      setTimeout(() => {
        setErrorMessage('');
      }, 5000);
    } finally {
      setLoadingAction(false);
    }
  };
  
  // Handle user status toggle
  const handleToggleStatus = async (user: User) => {
    try {
      // Prevent multiple clicks
      if (updatingUsers[user.id]) {
        return;
      }

      // Set this user as currently updating
      setUpdatingUsers(prev => ({ ...prev, [user.id]: true }));

      // Calculate new status (opposite of current)
      const newStatus = !user.active;
      
      console.log(`Toggling user ${user.id} (${user.username}) status from ${user.active} to ${newStatus}`);

      // Apply optimistic update immediately for better UX
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === user.id ? { ...u, active: newStatus } : u
        )
      );
      setFilteredUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === user.id ? { ...u, active: newStatus } : u
        )
      );

      // Make the API call with proper content-type and explicit boolean value
      const response = await fetch(`/api/users/${user.id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: newStatus }),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        // If the API call fails, revert the optimistic update
        console.error('API error response:', responseData);
        setUsers(prevUsers => 
          prevUsers.map(u => 
            u.id === user.id ? { ...u, active: user.active } : u
          )
        );
        setFilteredUsers(prevUsers => 
          prevUsers.map(u => 
            u.id === user.id ? { ...u, active: user.active } : u
          )
        );
        
        throw new Error(responseData.error || 'Failed to update user status');
      }
      
      // Successful response handling
      console.log('Server response:', responseData);
      
      // Update both users and filteredUsers lists with the server response
      const updatedUser = responseData;
      setUsers(prevUsers => 
        prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u)
      );
      setFilteredUsers(prevUsers => 
        prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u)
      );
      
      // Refresh user list from server to ensure data consistency
      await fetchUsers();
    } catch (err) {
      console.error('Error updating user status:', err);
      setError(`Failed to update user status: ${err instanceof Error ? err.message : 'Unknown error'}`);
      
      // Refresh user list to restore correct state
      await fetchUsers();
    } finally {
      // Remove the updating state for this user
      setUpdatingUsers(prev => {
        const updated = { ...prev };
        delete updated[user.id];
        return updated;
      });
    }
  };
  
  // Open edit modal with user data
  const openEditModal = (user: User) => {
    setFormData({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
      password: '111111'
    });
    
    setShowEditModal(true);
  };
  
  // Open delete confirmation modal
  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };
  
  // Reset form data
  const resetForm = () => {
    setFormData({
      id: '',
      username: '',
      name: '',
      email: '',
      role: 'MANAGER',
      active: true,
      password: '111111'
    });
  };

  // Check if a user is owner
  const isOwner = (role: string) => role === 'OWNER';

  // Handle creating a new group head
  const handleCreateGroupHead = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Check form data
      if (!groupFormData.username || !groupFormData.name || !groupFormData.email || !groupFormData.role) {
        setErrorMessage('All fields are required');
        return;
      }
      
      setLoadingAction(true);
      
      // Call API to create group head
      const response = await fetch('/api/users/create-group', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'create-group-head',
          ...groupFormData,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create group head');
      }
      
      // Show success message
      setSuccessMessage(`Successfully created ${groupFormData.role} group head`);
      
      // Close modal and reset form
      setShowGroupModal(false);
      setGroupFormData({
        username: '',
        name: '',
        email: '',
        role: 'WAITER',
        active: true,
        password: '111111'
      });
      
      // Refresh users
      await fetchUsers();
      
      // Auto-dismiss success message
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('Error creating group head:', error);
      setErrorMessage(error.message || 'Failed to create group head');
      
      // Auto-dismiss error
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
    } finally {
      setLoadingAction(false);
    }
  };
  
  // Handle adding users to a group
  const handleAddToGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Check selection
      if (!selectedGroupHead || !selectedUserIds.length) {
        setErrorMessage('Please select a group head and at least one user');
        return;
      }
      
      setLoadingAction(true);
      
      // Call API to add users to group
      const response = await fetch('/api/users/create-group', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'add-to-group',
          groupHeadId: selectedGroupHead.id,
          userIds: selectedUserIds,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add users to group');
      }
      
      // Show success message
      setSuccessMessage(`Successfully added ${data.updatedCount} users to ${selectedGroupHead.role} group`);
      
      // Close modal and reset selections
      setShowAddToGroupModal(false);
      setSelectedGroupHead(null);
      setSelectedUserIds([]);
      
      // Refresh users
      await fetchUsers();
      
      // Auto-dismiss success message
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('Error adding users to group:', error);
      setErrorMessage(error.message || 'Failed to add users to group');
      
      // Auto-dismiss error
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
    } finally {
      setLoadingAction(false);
    }
  };
  
  // Handle selecting/deselecting a user for adding to a group
  const handleUserSelection = (userId: string) => {
    setSelectedUserIds(prevSelected => {
      if (prevSelected.includes(userId)) {
        return prevSelected.filter(id => id !== userId);
      } else {
        return [...prevSelected, userId];
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your system users and their roles.
            </p>
          </div>
          
          {/* Action buttons */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="mr-2">+</span> Add User
            </button>
            
            <button
              onClick={() => setShowGroupModal(true)}
              className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <span className="mr-2">+</span> Create Group User
            </button>
            
            <button
              onClick={() => setShowAddToGroupModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span className="mr-2">+</span> Add to Group
              </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Notifications */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Success! </strong>
            <span className="block sm:inline">{successMessage}</span>
            <button 
              className="absolute top-0 bottom-0 right-0 px-4 py-3" 
              onClick={() => setSuccessMessage('')}
            >
              <svg className="fill-current h-6 w-6 text-green-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <title>Close</title>
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
              </svg>
            </button>
          </div>
        )}
        
        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{errorMessage}</span>
            <button 
              className="absolute top-0 bottom-0 right-0 px-4 py-3" 
              onClick={() => setErrorMessage('')}
            >
              <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <title>Close</title>
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
              </svg>
            </button>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-medium">System Users</h2>
            
            {/* Filter Section */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input 
                  type="text" 
                  placeholder="Search by name, username or email..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <select
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                <option value="">All Roles</option>
                <option value="OWNER">Owner</option>
                <option value="MANAGER">Manager</option>
                <option value="KITCHEN">Kitchen</option>
                <option value="BAR">Bar</option>
                <option value="WAITER">Waiter</option>
                <option value="RECEPTIONIST">Receptionist</option>
                <option value="SHISHA">Shisha</option>
              </select>
                <select
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
                
                {/* Group Filter Dropdown */}
                <select
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value)}
                >
                  <option value="">All Users</option>
                  <optgroup label="User Groups">
                    {users
                      .filter(user => user.isGroupHead)
                      .map(group => (
                        <option key={group.id} value={group.id}>
                          {group.name} ({group.role} Group)
                        </option>
                      ))
                    }
                  </optgroup>
              </select>
              </div>
            </div>
          </div>
          
          {/* Selected Group Info - Display only when a group is selected */}
          {groupFilter && (
            <div className="border-b border-gray-200 px-6 py-4 bg-indigo-50">
              {(() => {
                const selectedGroup = users.find(user => user.id === groupFilter);
                if (!selectedGroup) return null;
                
                const groupMembers = users.filter(user => user.parentId === groupFilter);
                return (
                  <div>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
                          <span className="text-indigo-800 font-medium text-xl">{selectedGroup.name.charAt(0)}</span>
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{selectedGroup.name}'s Group</h3>
                        <p className="text-sm text-gray-500">
                          {selectedGroup.role} Group • {groupMembers.length} members
                        </p>
                      </div>
                      <div className="ml-auto">
                        <button 
                          onClick={() => setGroupFilter('')}
                          className="text-sm text-indigo-600 hover:text-indigo-900"
                        >
                          Clear Filter
                        </button>
                      </div>
                    </div>
                    
                    {groupMembers.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {groupMembers.map(member => (
                          <div key={member.id} className="flex items-center p-3 border border-indigo-100 rounded-lg bg-white">
                            <div className="flex-shrink-0">
                              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-100">
                                <span className="text-gray-700 text-sm">{member.name.charAt(0)}</span>
                              </span>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-800">{member.name}</p>
                              <p className="text-xs text-gray-500">{member.username}</p>
                            </div>
                            <div className="ml-auto">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                member.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {member.active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        No members in this group yet. Add members using the "Add to Group" button.
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-10">
                <svg className="animate-spin h-10 w-10 mx-auto text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-2 text-gray-500">Loading users...</p>
              </div>
            ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'OWNER' 
                          ? 'bg-purple-100 text-purple-800' 
                          : user.role === 'MANAGER' 
                            ? 'bg-blue-100 text-blue-800' 
                            : user.role === 'KITCHEN' 
                              ? 'bg-yellow-100 text-yellow-800'
                              : user.role === 'BAR'
                                ? 'bg-pink-100 text-pink-800'
                                : user.role === 'WAITER'
                                  ? 'bg-green-100 text-green-800'
                                  : user.role === 'RECEPTIONIST'
                                    ? 'bg-indigo-100 text-indigo-800'
                                    : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.createdAt}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                          <button 
                            className="text-indigo-600 hover:text-indigo-900"
                            onClick={() => openEditModal(user)}
                          >
                            Edit
                          </button>
                          <button 
                            className={`${
                              user.active 
                                ? 'text-red-600 hover:text-red-900' 
                                : 'text-green-600 hover:text-green-900'
                            } ${updatingUsers[user.id] ? 'opacity-50 cursor-wait' : ''}`}
                            onClick={() => handleToggleStatus(user)}
                            disabled={updatingUsers[user.id]}
                          >
                            {updatingUsers[user.id] ? (
                              <span className="inline-flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {user.active ? 'Deactivating...' : 'Activating...'}
                              </span>
                            ) : (
                              user.active ? 'Deactivate' : 'Activate'
                            )}
                      </button>
                      {user.role !== 'OWNER' && (
                            <button 
                              className="text-red-600 hover:text-red-900"
                              onClick={() => openDeleteModal(user)}
                            >
                              Delete
                            </button>
                      )}
                    </td>
                  </tr>
                    ))
                  )}
              </tbody>
            </table>
            )}
          </div>
          
          <div className="bg-white px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredUsers.length}</span> of <span className="font-medium">{users.length}</span> users
              </div>
              <div className="flex space-x-2">
                <button className="btn btn-outline py-1 px-3 text-sm disabled:opacity-50" disabled>Previous</button>
                <button className="btn btn-outline py-1 px-3 text-sm disabled:opacity-50" disabled>Next</button>
              </div>
            </div>
          </div>
        </div>

        {/* User Groups Section */}
        {Object.keys(userGroups).length > 0 && (
          <div className="mb-8 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-purple-50 to-indigo-50">
              <h2 className="text-lg leading-6 font-medium text-gray-900">User Groups</h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Hierarchical user structure with parent-child relationships</p>
            </div>
            
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-200">
                {Object.entries(userGroups).map(([role, groups]) => (
                  <div key={role} className="py-4 sm:py-5 sm:grid sm:grid-cols-1 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 mb-2">
                      {role.charAt(0) + role.slice(1).toLowerCase()} Groups ({groups.length})
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
                      <ul className="divide-y divide-gray-200">
                        {groups.map(group => (
                          <li key={group.id} className="py-3">
                            <div className="flex items-center space-x-4">
                              <div className="flex-shrink-0">
                                <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-indigo-100">
                                  <span className="text-indigo-800 font-medium text-lg">{group.name.charAt(0)}</span>
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{group.name}</p>
                                <p className="text-sm text-gray-500 truncate">{group.email}</p>
                              </div>
                              <div className="inline-flex items-center">
                                <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full ${
                                  group.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {group.active ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </div>
                            
                            {/* Child users */}
                            {group.children && group.children.length > 0 && (
                              <div className="mt-2 ml-14 border-l-2 border-indigo-100 pl-4">
                                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Members ({group.children.length})</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {group.children.map(child => (
                                    <div key={child.id} className="flex items-center py-1">
                                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100">
                                        <span className="text-gray-700 text-xs">{child.name.charAt(0)}</span>
                                      </span>
                                      <div className="ml-2">
                                        <p className="text-sm font-medium text-gray-800">{child.name}</p>
                                        <p className="text-xs text-gray-500">{child.username}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        )}

        {/* Add User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="add-user-modal">
          <div className="relative top-20 mx-auto p-5 border shadow-lg rounded-md bg-white w-full max-w-md">
            <div className="flex justify-between items-center pb-3">
              <h3 className="text-lg font-medium">Add New User</h3>
                <button 
                  className="text-gray-400 hover:text-gray-500"
                  onClick={() => {
                    resetForm();
                    setShowAddModal(false);
                  }}
                >
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-2">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                    <input 
                      type="text" 
                      name="username"
                      className="input mt-1 w-full" 
                      placeholder="Username" 
                      value={formData.username}
                      onChange={handleInputChange}
                    />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input 
                      type="text" 
                      name="name"
                      className="input mt-1 w-full" 
                      placeholder="Full Name" 
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input 
                      type="email" 
                      name="email"
                      className="input mt-1 w-full" 
                      placeholder="Email address" 
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select 
                      className="input mt-1 w-full"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                    >
                    <option value="MANAGER">Manager</option>
                    <option value="KITCHEN">Kitchen</option>
                    <option value="BAR">Bar</option>
                    <option value="WAITER">Waiter</option>
                    <option value="RECEPTIONIST">Receptionist</option>
                    <option value="SHISHA">Shisha</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input 
                      type="password" 
                      name="password"
                      className="input mt-1 w-full" 
                      placeholder="Default: 111111" 
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                  <p className="mt-1 text-xs text-gray-500">Default password is set to 111111</p>
                </div>
                <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="active-status" 
                      name="active"
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded" 
                      checked={formData.active}
                      onChange={handleInputChange}
                    />
                  <label htmlFor="active-status" className="ml-2 block text-sm text-gray-900">Active account</label>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-5">
                <button 
                  className="btn btn-outline"
                  onClick={() => {
                    resetForm();
                    setShowAddModal(false);
                  }}
                >
                  Cancel
                </button>
                <button 
                  className={`btn btn-primary ${loadingAction ? 'opacity-75 cursor-not-allowed' : ''}`}
                  onClick={handleAddUser}
                  disabled={loadingAction}
                >
                  {loadingAction ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    'Create User'
                  )}
                </button>
            </div>
          </div>
        </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="edit-user-modal">
            <div className="relative top-20 mx-auto p-5 border shadow-lg rounded-md bg-white w-full max-w-md">
              <div className="flex justify-between items-center pb-3">
                <h3 className="text-lg font-medium">Edit User</h3>
                <button 
                  className="text-gray-400 hover:text-gray-500"
                  onClick={() => {
                    resetForm();
                    setShowEditModal(false);
                  }}
                >
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-2">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <input 
                      type="text" 
                      name="username"
                      className="input mt-1 w-full" 
                      placeholder="Username" 
                      value={formData.username}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input 
                      type="text" 
                      name="name"
                      className="input mt-1 w-full" 
                      placeholder="Full Name" 
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input 
                      type="email" 
                      name="email"
                      className="input mt-1 w-full" 
                      placeholder="Email address" 
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select 
                      className="input mt-1 w-full"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      disabled={isOwner(formData.role)}
                    >
                      {isOwner(formData.role) ? (
                        <option value="OWNER">Owner</option>
                      ) : (
                        <>
                          <option value="MANAGER">Manager</option>
                          <option value="KITCHEN">Kitchen</option>
                          <option value="BAR">Bar</option>
                          <option value="WAITER">Waiter</option>
                          <option value="RECEPTIONIST">Receptionist</option>
                          <option value="SHISHA">Shisha</option>
                        </>
                      )}
                    </select>
                    {isOwner(formData.role) && (
                      <p className="mt-1 text-xs text-red-500">Owner role cannot be changed</p>
                    )}
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="edit-active-status" 
                      name="active"
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded" 
                      checked={formData.active}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="edit-active-status" className="ml-2 block text-sm text-gray-900">Active account</label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-5">
                <button 
                  className="btn btn-outline"
                  onClick={() => {
                    resetForm();
                    setShowEditModal(false);
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleEditUser}
                >
                  Update User
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete User Modal */}
        {showDeleteModal && (
          <DeleteModal
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDeleteUser}
            loading={loadingAction}
            title="Delete User"
            message={`Are you sure you want to delete user ${selectedUser?.name}? This action cannot be undone.`}
          />
        )}
        
        {/* Create Group User Modal */}
        {showGroupModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-md w-full mx-4">
              <div className="px-6 py-4 bg-blue-50 border-b border-gray-200">
                <h3 className="text-lg font-medium text-blue-900">Create Group User</h3>
                <p className="text-sm text-blue-600">
                  Create a main user that can contain multiple sub-users.
                </p>
              </div>
              
              <form onSubmit={handleCreateGroupHead} className="p-6">
                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    {errorMessage}
                  </div>
                )}
                
                <div className="mb-4">
                  <label htmlFor="groupUsername" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    id="groupUsername"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter username"
                    value={groupFormData.username}
                    onChange={(e) => setGroupFormData({...groupFormData, username: e.target.value})}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                  <input
                    type="text"
                    id="groupName"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter display name"
                    value={groupFormData.name}
                    onChange={(e) => setGroupFormData({...groupFormData, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="groupEmail" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    id="groupEmail"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter email"
                    value={groupFormData.email}
                    onChange={(e) => setGroupFormData({...groupFormData, email: e.target.value})}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="groupRole" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    id="groupRole"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={groupFormData.role}
                    onChange={(e) => setGroupFormData({...groupFormData, role: e.target.value})}
                    required
                  >
                    <option value="WAITER">Waiter</option>
                    <option value="SHISHA">Shisha</option>
                    <option value="CHEF">Chef</option>
                    <option value="BARTENDER">Bartender</option>
                    <option value="MANAGER">Manager</option>
                    <option value="RECEPTIONIST">Receptionist</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="groupPassword" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    id="groupPassword"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter password (default: 111111)"
                    value={groupFormData.password}
                    onChange={(e) => setGroupFormData({...groupFormData, password: e.target.value})}
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave blank to use default password: 111111</p>
                </div>
                
                <div className="mb-4 flex items-center">
                  <input
                    type="checkbox"
                    id="groupActive"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={groupFormData.active}
                    onChange={(e) => setGroupFormData({...groupFormData, active: e.target.checked})}
                  />
                  <label htmlFor="groupActive" className="ml-2 block text-sm text-gray-700">Active</label>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowGroupModal(false)}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={loadingAction}
                  >
                    {loadingAction ? 'Creating...' : 'Create Group User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Add to Group Modal */}
        {showAddToGroupModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-3xl w-full mx-4">
              <div className="px-6 py-4 bg-indigo-50 border-b border-gray-200">
                <h3 className="text-lg font-medium text-indigo-900">Add Users to Group</h3>
                <p className="text-sm text-indigo-600">
                  Select users to add to a group.
                </p>
              </div>
              
              <form onSubmit={handleAddToGroup} className="p-6">
                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    {errorMessage}
                  </div>
                )}
                
                <div className="mb-6">
                  <label htmlFor="selectGroupHead" className="block text-sm font-medium text-gray-700 mb-1">Select Group Head</label>
                  <select
                    id="selectGroupHead"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={selectedGroupHead?.id || ''}
                    onChange={(e) => {
                      const groupHead = filteredUsers.find(u => u.id === e.target.value);
                      setSelectedGroupHead(groupHead || null);
                    }}
                    required
                  >
                    <option value="">Select a group head</option>
                    {filteredUsers
                      .filter(user => user.isGroupHead)
                      .map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.role})
                        </option>
                      ))
                    }
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Users to Add</label>
                  <div className="border border-gray-300 rounded-md h-60 overflow-y-auto p-2">
                    {filteredUsers
                      .filter(user => !user.isGroupHead && !user.parentId)
                      .map(user => (
                        <div key={user.id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            id={`select-user-${user.id}`}
                            checked={selectedUserIds.includes(user.id)}
                            onChange={() => handleUserSelection(user.id)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`select-user-${user.id}`} className="ml-2 flex-1 text-sm text-gray-700 cursor-pointer">
                            {user.name} ({user.role})
                          </label>
                        </div>
                      ))
                    }
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Selected: {selectedUserIds.length} users
                  </p>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddToGroupModal(false);
                      setSelectedGroupHead(null);
                      setSelectedUserIds([]);
                    }}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    disabled={loadingAction || !selectedGroupHead || selectedUserIds.length === 0}
                  >
                    {loadingAction ? 'Adding...' : 'Add to Group'}
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

// Add CSS for modal input fields
const inputStyles = `
  .input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }
  
  .input:focus {
    outline: none;
    ring: 2px;
    ring-offset: 2px;
    ring-indigo-500;
    border-color: #6366f1;
  }
  
  .btn {
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-weight: 500;
    text-align: center;
  }
  
  .btn-outline {
    border: 1px solid #d1d5db;
    background-color: white;
    color: #374151;
  }
  
  .btn-outline:hover {
    background-color: #f3f4f6;
  }
  
  .btn-primary {
    background-color: #4f46e5;
    color: white;
  }
  
  .btn-primary:hover {
    background-color: #4338ca;
  }
  
  .btn-danger {
    background-color: #ef4444;
    color: white;
  }
  
  .btn-danger:hover {
    background-color: #dc2626;
  }
`;

// Delete confirmation modal component
interface DeleteModalProps {
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  loading: boolean;
}

function DeleteModal({ onClose, onConfirm, title, message, loading }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50" id="delete-modal">
      <div className="relative mx-auto p-5 border shadow-lg rounded-md bg-white w-full max-w-md">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">{message}</p>
          </div>
          <div className="flex justify-end gap-3 px-4 py-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              className={`px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 