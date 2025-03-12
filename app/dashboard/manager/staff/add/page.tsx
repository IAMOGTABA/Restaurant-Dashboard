"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AddStaff() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [staffEntries, setStaffEntries] = useState([{ userId: '', role: 'waiter', status: 'ACTIVE' }]);
  const [availableUsers, setAvailableUsers] = useState([]);
  
  // Staff Role options
  const roles = ['waiter', 'chef', 'manager', 'bartender', 'cashier', 'cleaner', 'hostess', 'shisha'];
  
  // Fetch available users from the database
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users?notInStaff=true');
        if (response.ok) {
          const data = await response.json();
          setAvailableUsers(data);
        } else {
          console.error('Failed to fetch available users');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    
    fetchUsers();
  }, []);

  // Add another staff entry row
  const addStaffRow = () => {
    setStaffEntries([...staffEntries, { userId: '', role: 'waiter', status: 'ACTIVE' }]);
  };

  // Remove a staff entry row
  const removeStaffRow = (index) => {
    if (staffEntries.length > 1) {
      const updatedEntries = [...staffEntries];
      updatedEntries.splice(index, 1);
      setStaffEntries(updatedEntries);
    }
  };

  // Handle input changes
  const handleInputChange = (index, field, value) => {
    const updatedEntries = [...staffEntries];
    updatedEntries[index][field] = value;
    
    // If the user changes, auto-select their role from existing data
    if (field === 'userId') {
      const selectedUser = availableUsers.find(user => user.id === value);
      if (selectedUser && selectedUser.role) {
        updatedEntries[index].role = selectedUser.role;
      }
    }
    
    setStaffEntries(updatedEntries);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate entries
      const invalidEntries = staffEntries.filter(entry => !entry.userId);

      if (invalidEntries.length > 0) {
        throw new Error('You must select a user for each entry');
      }
      
      // Add each staff member to the staff system
      const results = await Promise.all(
        staffEntries.map(async (entry) => {
          const response = await fetch('/api/manager/staff', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: entry.userId,
              role: entry.role,
              status: entry.status
            }),
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.error || `Failed to add staff member`);
          }
          
          return data;
        })
      );
      
      setNotification({
        show: true,
        message: `Successfully added ${results.length} staff member${results.length !== 1 ? 's' : ''}`,
        type: 'success'
      });
      
      // Reset form or redirect
      setStaffEntries([{ userId: '', role: 'waiter', status: 'ACTIVE' }]);
      
      // Redirect to staff page after 2 seconds
      setTimeout(() => {
        router.push('/dashboard/manager/staff');
      }, 2000);
      
    } catch (error) {
      console.error('Error adding staff:', error);
      setNotification({
        show: true,
        message: error.message || 'Failed to add staff members. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
      
      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {notification.show && (
          <div className={`mb-4 p-4 rounded-md ${
            notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 
            'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <p>{notification.message}</p>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Add Staff Members</h1>
          <Link href="/dashboard/manager/staff" passHref>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
              <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Back to Staff List
            </button>
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="mb-4 text-gray-600">Add existing users to the staff management system. You can add multiple staff members at once.</p>
          
          {availableUsers.length === 0 ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md mb-6">
              <p className="text-yellow-700">No available users found. All users may already be added to the staff system.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {staffEntries.map((entry, index) => (
                <div key={index} className="mb-6 p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium text-gray-900">Staff Member #{index + 1}</h3>
                    {staffEntries.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeStaffRow(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`user-${index}`}>
                        Select User
                      </label>
                      <select
                        id={`user-${index}`}
                        value={entry.userId}
                        onChange={(e) => handleInputChange(index, 'userId', e.target.value)}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        required
                      >
                        <option value="">Select a user</option>
                        {availableUsers.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.name} ({user.email}) - {user.role}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`role-${index}`}>
                        Role
                      </label>
                      <select
                        id={`role-${index}`}
                        value={entry.role}
                        onChange={(e) => handleInputChange(index, 'role', e.target.value)}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        required
                      >
                        {roles.map(role => (
                          <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`status-${index}`}>
                        Status
                      </label>
                      <select
                        id={`status-${index}`}
                        value={entry.status}
                        onChange={(e) => handleInputChange(index, 'status', e.target.value)}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        required
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="ON_LEAVE">On Leave</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="flex flex-col sm:flex-row sm:justify-between items-center mt-6">
                <button
                  type="button"
                  onClick={addStaffRow}
                  className="mb-4 sm:mb-0 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  disabled={availableUsers.length <= staffEntries.length}
                >
                  <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Another Staff Member
                </button>
                
                <button
                  type="submit"
                  disabled={loading || availableUsers.length === 0}
                  className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none ${(loading || availableUsers.length === 0) ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>Add to Staff</>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
} 