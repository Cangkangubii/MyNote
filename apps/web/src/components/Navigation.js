'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import api, { getToken, removeToken } from '@/lib/api';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = getToken();
      if (!token || pathname === '/login' || pathname === '/register') {
        setUser(null);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        setUser(res.data?.data?.user);
      } catch (err) {
        setUser(null);
      }
    };
    fetchUser();
  }, [pathname]);

  // Handle global search debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(res.data?.data);
        setShowSearchDropdown(true);
      } catch (err) {
        console.error('Search error', err);
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
    { label: 'Dashboard', href: '/dashboard', icon: '★' },
    { label: 'Inbox', href: '/inbox', icon: '✉' },
    { label: 'Tasks', href: '/tasks', icon: '⚔' },
    { label: 'Notes', href: '/notes', icon: '✎' },
    { label: 'Daily Logs', href: '/logs', icon: '☕' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-purple-100/90 backdrop-blur-md border-b-2 border-slate-900 shadow-[0_4px_0_#0f172a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 group pixel-btn pixel-btn-yellow px-3 py-1.5"
            >
              <span className="font-pixel text-xs text-slate-900 tracking-wider">
                MyNote OS
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`pixel-btn px-3 py-1 text-xs transition-all ${
                      isActive
                        ? 'pixel-btn-purple text-white shadow-[1px_1px_0px_#0f172a] translate-x-[1px] translate-y-[1px]'
                        : 'pixel-btn-gray'
                    }`}
                  >
                    <span className="mr-1">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Search bar & user controls */}
          <div className="flex items-center gap-3 flex-1 max-w-md justify-end">
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
                placeholder="Cari item..."
                className="w-full pixel-input text-xs py-1.5 px-3"
              />

              {/* Search dropdown results */}
              {showSearchDropdown && searchResults && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 pixel-window z-50 max-h-96 overflow-y-auto">
                  <div className="pixel-titlebar">
                    <span className="font-pixel text-[10px] text-slate-900">
                      Search Results
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 bg-yellow-300 border border-slate-900 rounded-xs inline-block"></span>
                      <span className="w-2.5 h-2.5 bg-pink-400 border border-slate-900 rounded-xs inline-block"></span>
                    </div>
                  </div>

                  {searchResults.total === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-500 font-medium">
                      Tidak ada hasil untuk &ldquo;{searchResults.query}&rdquo;
                    </div>
                  ) : (
                    <div className="p-2 space-y-3 bg-slate-50">
                      {/* Tasks results */}
                      {searchResults.tasks?.length > 0 && (
                        <div>
                          <div className="font-pixel text-[9px] text-purple-700 px-2 py-1 uppercase">
                            Tasks ({searchResults.tasks.length})
                          </div>
                          {searchResults.tasks.map((task) => (
                            <Link
                              key={task.id}
                              href="/tasks"
                              onClick={() => setShowSearchDropdown(false)}
                              className="block p-2 rounded-md hover:bg-purple-100 border border-transparent hover:border-purple-300 transition text-xs"
                            >
                              <div className="font-bold text-gray-900">{task.title}</div>
                              <div className="text-[10px] text-gray-500 capitalize">Status: {task.status}</div>
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Notes results */}
                      {searchResults.notes?.length > 0 && (
                        <div>
                          <div className="font-pixel text-[9px] text-pink-700 px-2 py-1 uppercase">
                            Notes ({searchResults.notes.length})
                          </div>
                          {searchResults.notes.map((note) => (
                            <Link
                              key={note.id}
                              href="/notes"
                              onClick={() => setShowSearchDropdown(false)}
                              className="block p-2 rounded-md hover:bg-pink-100 border border-transparent hover:border-pink-300 transition text-xs"
                            >
                              <div className="font-bold text-gray-900">{note.title}</div>
                              <div className="text-[10px] text-gray-500 truncate">{note.content}</div>
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Logs results */}
                      {searchResults.logs?.length > 0 && (
                        <div>
                          <div className="font-pixel text-[9px] text-emerald-700 px-2 py-1 uppercase">
                            Daily Logs ({searchResults.logs.length})
                          </div>
                          {searchResults.logs.map((log) => (
                            <Link
                              key={log.id}
                              href="/logs"
                              onClick={() => setShowSearchDropdown(false)}
                              className="block p-2 rounded-md hover:bg-emerald-100 border border-transparent hover:border-emerald-300 transition text-xs"
                            >
                              <div className="font-bold text-gray-900">
                                {new Date(log.logDate).toLocaleDateString('id-ID')}
                              </div>
                              <div className="text-[10px] text-gray-500 truncate">{log.did}</div>
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
            <div className="flex items-center gap-2">
              {user && (
                <span className="hidden lg:inline font-bold text-xs bg-white border border-slate-900 rounded-md px-2 py-1 text-slate-800 shadow-[1px_1px_0px_#0f172a]">
                  {user.name || user.email}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="pixel-btn pixel-btn-danger px-2.5 py-1 text-xs"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-purple-200 gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`pixel-btn px-2 py-0.5 text-[10px] ${
                  isActive ? 'pixel-btn-purple text-white' : 'pixel-btn-gray'
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
