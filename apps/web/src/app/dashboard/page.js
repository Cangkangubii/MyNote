'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import QuickCapture from '@/components/QuickCapture';

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      const res = await api.get('/dashboard/summary');
      setSummary(res.data?.data);
    } catch (err) {
      console.error('Failed to load dashboard summary', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Banner */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Ikhtisar</h1>
        <p className="text-sm text-gray-500 mt-1">
          Pantau seluruh aktivitas, tugas mendesak, dan tangkapan ide Anda di satu tempat.
        </p>
      </div>

      {/* Quick Capture Form in Dashboard */}
      <div className="mb-8">
        <QuickCapture onCreated={fetchSummary} placeholder="Ada ide atau hal yang terlintas? Tangkap di sini..." />
      </div>

      {/* Summary Stat Cards */}
      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Memuat ringkasan dasbor...</div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Link
              href="/inbox"
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs hover:border-blue-300 hover:shadow-md transition"
            >
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Inbox Menggantung
              </span>
              <p className="text-3xl font-extrabold text-blue-600 mt-2">
                {summary?.inboxCount ?? 0}
              </p>
              <span className="text-xs text-gray-400 mt-1 block">Item perlu disortir &rarr;</span>
            </Link>

            <Link
              href="/tasks"
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs hover:border-amber-300 hover:shadow-md transition"
            >
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Tugas Jatuh Tempo
              </span>
              <p className="text-3xl font-extrabold text-amber-600 mt-2">
                {summary?.dueTodayTasksCount ?? 0}
              </p>
              <span className="text-xs text-gray-400 mt-1 block">Perlu diselesaikan hari ini &rarr;</span>
            </Link>

            <Link
              href="/logs"
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition"
            >
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Daily Log Streak
              </span>
              <p className="text-3xl font-extrabold text-emerald-600 mt-2">
                {summary?.streak ?? 0} <span className="text-sm font-medium text-gray-500">Hari</span>
              </p>
              <span className="text-xs text-gray-400 mt-1 block">
                {summary?.hasLoggedToday ? '✓ Log hari ini terisi' : 'Belum diisi hari ini'} &rarr;
              </span>
            </Link>

            <Link
              href="/notes"
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs hover:border-purple-300 hover:shadow-md transition"
            >
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total Catatan
              </span>
              <p className="text-3xl font-extrabold text-purple-600 mt-2">
                {summary?.totalNotes ?? 0}
              </p>
              <span className="text-xs text-gray-400 mt-1 block">Lihat basis pengetahuan &rarr;</span>
            </Link>
          </div>

          {/* Two-column layout: Due Tasks & Recent Notes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Due Tasks Widget */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900">Tugas Prioritas</h2>
                <Link href="/tasks" className="text-xs font-semibold text-blue-600 hover:underline">
                  Lihat Semua
                </Link>
              </div>

              {summary?.dueTasks?.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-400">
                  Tidak ada tugas yang menunggu.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {summary?.dueTasks?.map((task) => (
                    <div key={task.id} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{task.title}</h3>
                        <span className="text-xs text-gray-500 capitalize">
                          Status: {task.status.replace('_', ' ')}
                        </span>
                      </div>
                      {task.dueDate && (
                        <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded">
                          {new Date(task.dueDate).toLocaleDateString('id-ID', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Notes Widget */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900">Catatan Terbaru</h2>
                <Link href="/notes" className="text-xs font-semibold text-blue-600 hover:underline">
                  Lihat Semua
                </Link>
              </div>

              {summary?.recentNotes?.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-400">
                  Belum ada catatan tersimpan.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {summary?.recentNotes?.map((note) => (
                    <div key={note.id} className="py-3">
                      <h3 className="text-sm font-semibold text-gray-900">{note.title}</h3>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
