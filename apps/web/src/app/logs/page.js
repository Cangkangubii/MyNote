'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [streakData, setStreakData] = useState({ streak: 0, hasLoggedToday: false });
  const [formData, setFormData] = useState({ did: '', blockers: '', next: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchData = async () => {
    try {
      const [logsRes, streakRes, todayRes] = await Promise.all([
        api.get('/logs'),
        api.get('/logs/streak'),
        api.get('/logs/today'),
      ]);

      setLogs(logsRes.data?.data || []);
      setStreakData(streakRes.data?.data || { streak: 0, hasLoggedToday: false });

      if (todayRes.data?.data) {
        const t = todayRes.data.data;
        setFormData({
          did: t.did || '',
          blockers: t.blockers || '',
          next: t.next || '',
        });
      }
    } catch (err) {
      console.error('Failed to load daily logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveToday = async (e) => {
    e.preventDefault();
    if (!formData.did.trim() || submitting) return;

    setSubmitting(true);
    setSuccessMsg('');

    try {
      await api.put('/logs/today', formData);
      setSuccessMsg('Log hari ini berhasil disimpan!');
      fetchData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan log harian.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header & Streak Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daily Logs &amp; Standup</h1>
          <p className="text-sm text-gray-500 mt-1">
            Catat ringkasan pekerjaan, kendala, dan rencana harian secara konsisten.
          </p>
        </div>

        {/* Streak Counter Badge */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center gap-3">
          <div className="text-center">
            <span className="block text-2xl font-extrabold text-amber-700">
              {streakData.streak}
            </span>
            <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
              Hari Streak
            </span>
          </div>
          <div className="text-xs text-amber-700 border-l border-amber-200 pl-3">
            {streakData.hasLoggedToday ? (
              <span className="font-semibold text-emerald-700">✓ Sudah diisi hari ini</span>
            ) : (
              <span className="font-semibold text-amber-900">Belum diisi hari ini</span>
            )}
          </div>
        </div>
      </div>

      {/* Form Log Hari Ini */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">
            Jurnal Hari Ini ({new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })})
          </h2>
          {successMsg && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
              {successMsg}
            </span>
          )}
        </div>

        <form onSubmit={handleSaveToday} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Apa yang sudah dikerjakan hari ini? (Did) *
            </label>
            <textarea
              required
              rows="3"
              placeholder="- Menyelesaikan endpoint login&#10;- Merapikan konfigurasi database"
              value={formData.did}
              onChange={(e) => setFormData({ ...formData, did: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Kendala yang dihadapi (Blockers)
              </label>
              <textarea
                rows="2"
                placeholder="Misal: Menunggu persetujuan API dari pihak ketiga..."
                value={formData.blockers}
                onChange={(e) => setFormData({ ...formData, blockers: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Rencana selanjutnya (Next)
              </label>
              <textarea
                rows="2"
                placeholder="Misal: Melanjutkan pengujian modul integrasi..."
                value={formData.next}
                onChange={(e) => setFormData({ ...formData, next: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting || !formData.did.trim()}
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Log Hari Ini'}
            </button>
          </div>
        </form>
      </div>

      {/* Historical Feed */}
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-4">Riwayat Log Terdahulu</h2>

        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Memuat riwayat log...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300 p-6 text-sm text-gray-500">
            Belum ada catatan log harian. Mulai catat aktivitas hari ini di formulir atas.
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
                <div className="font-semibold text-sm text-blue-800 mb-3">
                  {new Date(log.logDate).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold text-xs text-gray-500 uppercase tracking-wider block">
                      Dikerjakan:
                    </span>
                    <p className="text-gray-800 whitespace-pre-wrap mt-0.5">{log.did}</p>
                  </div>

                  {log.blockers && (
                    <div className="pt-2 border-t border-gray-100">
                      <span className="font-semibold text-xs text-rose-600 uppercase tracking-wider block">
                        Kendala:
                      </span>
                      <p className="text-gray-700 whitespace-pre-wrap mt-0.5">{log.blockers}</p>
                    </div>
                  )}

                  {log.next && (
                    <div className="pt-2 border-t border-gray-100">
                      <span className="font-semibold text-xs text-emerald-600 uppercase tracking-wider block">
                        Langkah Selanjutnya:
                      </span>
                      <p className="text-gray-700 whitespace-pre-wrap mt-0.5">{log.next}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
