'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import api, { removeToken } from '@/lib/api';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data?.data?.user);
      } catch (err) {
        // User not logged in or token invalid
      }
    };
    fetchUser();
  }, []);

  // Handle global search debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(res.data?.data);
        setShowSearchDropdown(true);
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      removeToken();
      router.push('/login');
    }
  };

  const isPublicPage = pathname === '/login' || pathname === '/register';
  if (isPublicPage) {
    return null;
  }

  const navItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Inbox', href: '/inbox' },
    { label: 'Tasks', href: '/tasks' },
    { label: 'Notes', href: '/notes' },
    { label: 'Daily Logs', href: '/logs' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-blue-600">MyNote</span>
            </Link>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Search bar & user controls */}
          <div className="flex items-center gap-4 flex-1 max-w-md justify-end">
            {/* Global Search Bar */}
            <div className="relative flex-1 max-w-xs" ref={searchRef}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!e.target.value.trim()) {
                    setSearchResults(null);
                    setShowSearchDropdown(false);
                  }
                }}
                onFocus={() => {
                  if (searchResults) setShowSearchDropdown(true);
                }}
                placeholder="Cari task, note, log..."
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />

              {/* Search dropdown results */}
              {showSearchDropdown && searchResults && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
                  {searchResults.total === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      Tidak ada hasil ditemukan untuk &ldquo;{searchResults.query}&rdquo;
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {/* Tasks results */}
                      {searchResults.tasks?.length > 0 && (
                        <div className="p-2">
                          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 py-1">
                            Tasks ({searchResults.tasks.length})
                          </div>
                          {searchResults.tasks.map((task) => (
                            <Link
                              key={task.id}
                              href="/tasks"
                              onClick={() => setShowSearchDropdown(false)}
                              className="block px-2 py-1.5 rounded hover:bg-blue-50 text-sm"
                            >
                              <div className="font-medium text-gray-800">{task.title}</div>
                              <div className="text-xs text-gray-500 capitalize">Status: {task.status}</div>
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Notes results */}
                      {searchResults.notes?.length > 0 && (
                        <div className="p-2">
                          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 py-1">
                            Notes ({searchResults.notes.length})
                          </div>
                          {searchResults.notes.map((note) => (
                            <Link
                              key={note.id}
                              href="/notes"
                              onClick={() => setShowSearchDropdown(false)}
                              className="block px-2 py-1.5 rounded hover:bg-blue-50 text-sm"
                            >
                              <div className="font-medium text-gray-800">{note.title}</div>
                              <div className="text-xs text-gray-500 truncate">{note.content}</div>
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Logs results */}
                      {searchResults.logs?.length > 0 && (
                        <div className="p-2">
                          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 py-1">
                            Daily Logs ({searchResults.logs.length})
                          </div>
                          {searchResults.logs.map((log) => (
                            <Link
                              key={log.id}
                              href="/logs"
                              onClick={() => setShowSearchDropdown(false)}
                              className="block px-2 py-1.5 rounded hover:bg-blue-50 text-sm"
                            >
                              <div className="font-medium text-gray-800">
                                {new Date(log.logDate).toLocaleDateString('id-ID')}
                              </div>
                              <div className="text-xs text-gray-500 truncate">{log.did}</div>
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Captures results */}
                      {searchResults.captures?.length > 0 && (
                        <div className="p-2">
                          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 py-1">
                            Inbox Captures ({searchResults.captures.length})
                          </div>
                          {searchResults.captures.map((cap) => (
                            <Link
                              key={cap.id}
                              href="/inbox"
                              onClick={() => setShowSearchDropdown(false)}
                              className="block px-2 py-1.5 rounded hover:bg-blue-50 text-sm"
                            >
                              <div className="text-gray-800 text-sm truncate">{cap.content}</div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Profile & Logout */}
            <div className="flex items-center gap-3">
              {user && (
                <span className="hidden lg:inline text-xs text-gray-600 font-medium">
                  {user.name || user.email}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-gray-100">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-2 py-1 text-xs font-medium rounded ${
                  isActive ? 'text-blue-600 font-semibold' : 'text-gray-600'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
