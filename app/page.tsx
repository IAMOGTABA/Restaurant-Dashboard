"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Call the authentication API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      
      // Redirect based on user role
      if (data.user) {
        const { role } = data.user;
        
        // Route to the appropriate dashboard
        if (role === 'OWNER') {
          router.push('/dashboard/owner');
        } else if (role === 'MANAGER') {
          router.push('/dashboard/manager');
        } else if (role === 'WAITER') {
          router.push('/dashboard/waiter');
        } else if (role === 'KITCHEN') {
          router.push('/dashboard/kitchen');
        } else if (role === 'BAR') {
          router.push('/dashboard/bar');
        } else if (role === 'RECEPTIONIST') {
          router.push('/dashboard/receptionist');
        } else if (role === 'SHISHA') {
          router.push('/dashboard/shisha');
        } else {
          // Default fallback
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            For the prototype, all passwords are set to: <span className="font-bold">111111</span>
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
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
        
        <form className="mt-8" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Password (111111)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Demo accounts:
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
              <div className="p-2 border rounded">
                <p className="font-medium">Owner</p>
                <p>Username: owner</p>
                <p>Password: 111111</p>
              </div>
              <div className="p-2 border rounded">
                <p className="font-medium">Manager</p>
                <p>Username: manager</p>
                <p>Password: 111111</p>
              </div>
              <div className="p-2 border rounded">
                <p className="font-medium">Waiter</p>
                <p>Username: waiter</p>
                <p>Password: 111111</p>
              </div>
              <div className="p-2 border rounded">
                <p className="font-medium">Kitchen Staff</p>
                <p>Username: kitchen</p>
                <p>Password: 111111</p>
              </div>
              <div className="p-2 border rounded">
                <p className="font-medium">Bar Staff</p>
                <p>Username: bar</p>
                <p>Password: 111111</p>
              </div>
              <div className="p-2 border rounded">
                <p className="font-medium">Receptionist</p>
                <p>Username: receptionist</p>
                <p>Password: 111111</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 