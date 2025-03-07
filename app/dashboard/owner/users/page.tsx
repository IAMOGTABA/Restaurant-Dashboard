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
  
  // State for modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
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
  
  // Define fetchUsers function so it can be called from multiple places
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
      setFilteredUsers(data);
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
    
    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter]);
  
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
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create user');
      }
      
      const newUser = await response.json();
      setUsers(prevUsers => [...prevUsers, newUser]);
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      console.error('Error creating user:', err);
      setError('Failed to create user. Please try again.');
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
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      
      setUsers(prevUsers => prevUsers.filter(user => user.id !== selectedUser.id));
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user. Please try again.');
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

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <div className="flex space-x-4">
              <Link href="/dashboard/owner" className="btn btn-outline">
                Back to Dashboard
              </Link>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  resetForm();
                  setShowAddModal(true);
                }}
              >
                Add New User
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  className="input py-2 px-3 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="bg-white border border-gray-300 rounded-md py-2 px-3 text-sm"
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
                className="bg-white border border-gray-300 rounded-md py-2 px-3 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          
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
                  className="btn btn-primary"
                  onClick={handleAddUser}
                >
                  Create User
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

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="delete-user-modal">
            <div className="relative top-20 mx-auto p-5 border shadow-lg rounded-md bg-white w-full max-w-md">
              <div className="flex justify-between items-center pb-3">
                <h3 className="text-lg font-medium">Confirm Delete</h3>
                <button 
                  className="text-gray-400 hover:text-gray-500"
                  onClick={() => setShowDeleteModal(false)}
                >
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete user <span className="font-medium">{selectedUser.name}</span>? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-end space-x-3 mt-5">
                <button 
                  className="btn btn-outline"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleDeleteUser}
                >
                  Delete
                </button>
            </div>
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
    transition: background-color 150ms, border-color 150ms, color 150ms;
  }
  
  .btn-primary {
    background-color: #6366f1;
    color: white;
  }
  
  .btn-primary:hover {
    background-color: #4f46e5;
  }
  
  .btn-outline {
    border: 1px solid #d1d5db;
    background-color: white;
  }
  
  .btn-outline:hover {
    background-color: #f9fafb;
  }
`; 