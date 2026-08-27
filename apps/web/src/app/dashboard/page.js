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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* OS Welcome Hero Banner */}
      <div className="pixel-window bg-white">
        <div className="pixel-titlebar">
          <span className="font-pixel text-xs text-slate-900">
            ★ SYSTEM://MYNOTE.DASHBOARD.EXE
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-white border-2 border-slate-900 rounded-xs inline-block"></span>
            <span className="w-3 h-3 bg-yellow-300 border-2 border-slate-900 rounded-xs inline-block"></span>
            <span className="w-3 h-3 bg-pink-400 border-2 border-slate-900 rounded-xs inline-block"></span>
          </div>
        </div>

        <div className="p-6 sm:p-8 bg-linear-to-r from-purple-100/60 via-pink-100/40 to-yellow-100/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 pixel-badge bg-yellow-200 text-yellow-900">
              <span>●</span> SESSION ACTIVE
            </div>
            <h1 className="font-pixel text-lg sm:text-xl text-slate-900 tracking-wide">
              Selamat Datang di MyNote OS
            </h1>
            <p className="text-sm text-slate-600 max-w-xl">
              Pusat kendali produktivitas retro: tangkap ide kilat, kelola papan tugas, simpan catatan, dan jaga konsistensi jurnal harian Anda.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/tasks" className="pixel-btn pixel-btn-purple px-4 py-2 text-xs">
              ⚔ Buka Tasks
            </Link>
            <Link href="/notes" className="pixel-btn pixel-btn-mint px-4 py-2 text-xs">
              ✎ Tulis Catatan
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Capture Widget */}
      <div>
        <QuickCapture onCreated={fetchSummary} />
      </div>

      {/* Summary Stat Cards */}
      {loading ? (
        <div className="text-center py-12 font-pixel text-xs text-purple-700 animate-pulse">
          MEMUAT DATA SISTEM...
        </div>
      ) : (
        <div className="space-y-8">
          {/* 4 Retro Pixel Metric Widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Inbox */}
            <Link
              href="/inbox"
              className="pixel-box p-5 bg-linear-to-br from-mint-50 to-emerald-100/60 border-2 border-slate-900 block group"
            >
              <div className="flex items-center justify-between">
                <span className="font-pixel text-[10px] text-emerald-800 uppercase">
                  Inbox
                </span>
                <span className="pixel-badge bg-emerald-200 text-emerald-900">✉</span>
              </div>
              <p className="font-pixel text-2xl text-slate-900 mt-3">
                {summary?.inboxCount ?? 0}
              </p>
              <span className="text-xs font-semibold text-emerald-700 mt-2 block group-hover:translate-x-1 transition-transform">
                Sortir item &rarr;
              </span>
            </Link>

            {/* Due Tasks */}
            <Link
              href="/tasks"
              className="pixel-box p-5 bg-linear-to-br from-yellow-50 to-amber-100/60 border-2 border-slate-900 block group"
            >
              <div className="flex items-center justify-between">
                <span className="font-pixel text-[10px] text-amber-800 uppercase">
                  Jatuh Tempo
                </span>
                <span className="pixel-badge bg-amber-200 text-amber-900">⏰</span>
              </div>
              <p className="font-pixel text-2xl text-slate-900 mt-3">
                {summary?.dueTodayTasksCount ?? 0}
              </p>
              <span className="text-xs font-semibold text-amber-700 mt-2 block group-hover:translate-x-1 transition-transform">
                Lihat tugas hari ini &rarr;
              </span>
            </Link>

            {/* Streak */}
            <Link
              href="/logs"
              className="pixel-box p-5 bg-linear-to-br from-pink-50 to-rose-100/60 border-2 border-slate-900 block group"
            >
              <div className="flex items-center justify-between">
                <span className="font-pixel text-[10px] text-rose-800 uppercase">
                  Log Streak
                </span>
                <span className="pixel-badge bg-rose-200 text-rose-900">🔥</span>
              </div>
              <p className="font-pixel text-2xl text-slate-900 mt-3">
                {summary?.streak ?? 0} <span className="font-sans text-xs font-bold text-slate-600">Hari</span>
              </p>
              <span className="text-xs font-semibold text-rose-700 mt-2 block group-hover:translate-x-1 transition-transform">
                {summary?.hasLoggedToday ? '✓ Log hari ini selesai' : 'Isi log hari ini'} &rarr;
              </span>
            </Link>

            {/* Notes */}
            <Link
              href="/notes"
              className="pixel-box p-5 bg-linear-to-br from-purple-50 to-indigo-100/60 border-2 border-slate-900 block group"
            >
              <div className="flex items-center justify-between">
                <span className="font-pixel text-[10px] text-purple-800 uppercase">
                  Catatan
                </span>
                <span className="pixel-badge bg-purple-200 text-purple-900">📚</span>
              </div>
              <p className="font-pixel text-2xl text-slate-900 mt-3">
                {summary?.totalNotes ?? 0}
              </p>
              <span className="text-xs font-semibold text-purple-700 mt-2 block group-hover:translate-x-1 transition-transform">
                Buka catatan &rarr;
              </span>
            </Link>
          </div>

          {/* Two-column layout: Due Tasks & Recent Notes Windows */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Due Tasks Window */}
            <div className="pixel-window">
              <div className="pixel-titlebar bg-linear-to-r from-amber-200 to-yellow-200">
                <span className="font-pixel text-[10px] text-slate-900">
                  ⚔ TUGAS PRIORITAS
                </span>
                <Link href="/tasks" className="pixel-btn pixel-btn-gray px-2 py-0.5 text-[10px]">
                  Buka Papan
                </Link>
              </div>

              <div className="p-4 bg-white min-h-[220px]">
                {summary?.dueTasks?.length === 0 ? (
                  <div className="text-center py-12 text-xs text-gray-400 font-bold">
                    Tidak ada tugas tertunda saat ini.
                  </div>
                ) : (
                  <div className="divide-y-2 divide-slate-100">
                    {summary?.dueTasks?.map((task) => (
                      <div key={task.id} className="py-3 flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">{task.title}</h3>
                          <span className="text-[11px] font-semibold text-purple-700 capitalize">
                            Status: {task.status.replace('_', ' ')}
                          </span>
                        </div>
                        {task.dueDate && (
                          <span className="pixel-badge bg-yellow-100 text-yellow-900 text-[10px]">
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
            </div>

            {/* Recent Notes Window */}
            <div className="pixel-window">
              <div className="pixel-titlebar bg-linear-to-r from-purple-200 to-pink-200">
                <span className="font-pixel text-[10px] text-slate-900">
                  ✎ CATATAN TERBARU
                </span>
                <Link href="/notes" className="pixel-btn pixel-btn-gray px-2 py-0.5 text-[10px]">
                  Lihat Semua
                </Link>
              </div>

              <div className="p-4 bg-white min-h-[220px]">
                {summary?.recentNotes?.length === 0 ? (
                  <div className="text-center py-12 text-xs text-gray-400 font-bold">
                    Belum ada catatan yang dibuat.
                  </div>
                ) : (
                  <div className="divide-y-2 divide-slate-100">
                    {summary?.recentNotes?.map((note) => (
                      <div key={note.id} className="py-3">
                        <h3 className="text-sm font-bold text-slate-900">{note.title}</h3>
                        <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">{note.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
