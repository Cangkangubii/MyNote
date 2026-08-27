'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { removeToken } from '@/lib/api';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data?.data?.user);
      } catch (err) {
        console.error('Failed to fetch user', err);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      removeToken();
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            {user && (
              <p className="text-sm text-gray-600">
                Logged in as <span className="font-semibold">{user.name || user.email}</span>
              </p>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
        <div className="p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700">
          Welcome to your MyNote workspace.
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white border rounded shadow-sm">
            <h3 className="font-semibold text-gray-500">Inbox Captures</h3>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="p-4 bg-white border rounded shadow-sm">
            <h3 className="font-semibold text-gray-500">Tasks</h3>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="p-4 bg-white border rounded shadow-sm">
            <h3 className="font-semibold text-gray-500">Notes</h3>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="p-4 bg-white border rounded shadow-sm">
            <h3 className="font-semibold text-gray-500">Daily Logs</h3>
            <p className="text-2xl font-bold">0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
