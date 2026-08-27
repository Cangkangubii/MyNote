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
      await api.put('/logs/today', {
        did: formData.did.trim(),
        blockers: formData.blockers.trim() || undefined,
        next: formData.next.trim() || undefined,
      });
      setSuccessMsg('✓ Log harian berhasil disimpan!');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan log harian.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Streak Header Card */}
      <div className="pixel-window bg-white">
        <div className="pixel-titlebar bg-linear-to-r from-pink-200 via-rose-200 to-yellow-200">
          <span className="font-pixel text-[11px] text-slate-900">
            🔥 STREAK PROTOCOL &amp; DAILY LOG
          </span>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-yellow-300 border border-slate-900 rounded-xs inline-block"></span>
            <span className="w-2.5 h-2.5 bg-pink-400 border border-slate-900 rounded-xs inline-block"></span>
          </div>
        </div>

        <div className="p-6 bg-linear-to-br from-rose-50/60 to-orange-50/40 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h1 className="font-pixel text-base text-slate-900">Jurnal Refleksi Harian</h1>
            <p className="text-xs text-slate-600">
              Isi apa yang telah Anda kerjakan, kendala, dan rencana langkah selanjutnya.
            </p>
          </div>

          {/* Retro Level Streak Badge */}
          <div className="pixel-box p-4 bg-white border-2 border-slate-900 flex items-center gap-4 shrink-0 shadow-[4px_4px_0px_#0f172a]">
            <span className="text-3xl">🔥</span>
            <div>
              <div className="font-pixel text-2xl text-slate-900">
                {streakData.streak}
              </div>
              <div className="text-[11px] font-bold text-rose-700 uppercase">
                Hari Berturut-turut
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Log Hari Ini */}
      <div className="pixel-window bg-white">
        <div className="pixel-titlebar bg-linear-to-r from-purple-200 to-indigo-200">
          <span className="font-pixel text-[10px] text-slate-900">
            ☕ STANDUP JOURNAL - {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
          </span>
        </div>

        <form onSubmit={handleSaveToday} className="p-6 space-y-4 bg-purple-50/20">
          {successMsg && (
            <div className="pixel-badge bg-emerald-100 text-emerald-900 p-2 block w-full text-xs font-bold">
              {successMsg}
            </div>
          )}

          <div>
            <label className="block font-pixel text-[10px] text-slate-800 uppercase mb-1">
              1. Apa yang telah Anda selesaikan hari ini? (Did) *
            </label>
            <textarea
              required
              rows="3"
              placeholder="- Menyelesaikan fitur inbox&#10;- Merapikan modul notes"
              value={formData.did}
              onChange={(e) => setFormData({ ...formData, did: e.target.value })}
              className="w-full pixel-input text-xs font-mono"
            ></textarea>
          </div>

          <div>
            <label className="block font-pixel text-[10px] text-slate-800 uppercase mb-1">
              2. Apakah ada kendala / hambatan? (Blockers)
            </label>
            <textarea
              rows="2"
              placeholder="- Menunggu review PR atau masalah dependensi..."
              value={formData.blockers}
              onChange={(e) => setFormData({ ...formData, blockers: e.target.value })}
              className="w-full pixel-input text-xs font-mono"
            ></textarea>
          </div>

          <div>
            <label className="block font-pixel text-[10px] text-slate-800 uppercase mb-1">
              3. Apa rencana berikutnya besok? (Next)
            </label>
            <textarea
              rows="2"
              placeholder="- Pengujian E2E dan penulisan dokumentasi..."
              value={formData.next}
              onChange={(e) => setFormData({ ...formData, next: e.target.value })}
              className="w-full pixel-input text-xs font-mono"
            ></textarea>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting || !formData.did.trim()}
              className="pixel-btn pixel-btn-purple px-6 py-2.5 text-xs"
            >
              {submitting ? 'Menyimpan...' : '⚡ Simpan Log Hari Ini'}
            </button>
          </div>
        </form>
      </div>

      {/* Historical Logs Timeline Feed */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2">
          <span className="font-pixel text-xs text-purple-900">
            RIWAYAT LOG SEBELUMNYA
          </span>
          <span className="pixel-badge bg-purple-200 text-purple-900">
            {logs.length}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-12 font-pixel text-xs text-purple-700 animate-pulse">
            MEMUAT RIWAYAT LOG...
          </div>
        ) : logs.length === 0 ? (
          <div className="pixel-box text-center py-12 bg-white p-6">
            <span className="text-2xl block mb-2">📜</span>
            <p className="text-xs text-slate-500 font-bold">Belum ada riwayat catatan harian sebelumnya.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="pixel-window bg-white">
                <div className="pixel-titlebar bg-slate-100">
                  <span className="font-pixel text-[10px] text-slate-800">
                    📅 {new Date(log.logDate).toLocaleDateString('id-ID', { dateStyle: 'full' })}
                  </span>
                </div>

                <div className="p-5 space-y-3 text-xs bg-white">
                  <div>
                    <h4 className="font-bold text-slate-900 uppercase text-[10px] text-purple-800 mb-1">
                      Pekerjaan Selesai (Did):
                    </h4>
                    <div className="text-slate-800 whitespace-pre-wrap font-mono pl-2 border-l-2 border-purple-300">
                      {log.did}
                    </div>
                  </div>

                  {log.blockers && (
                    <div>
                      <h4 className="font-bold text-slate-900 uppercase text-[10px] text-rose-800 mb-1">
                        Kendala (Blockers):
                      </h4>
                      <div className="text-slate-800 whitespace-pre-wrap font-mono pl-2 border-l-2 border-rose-300">
                        {log.blockers}
                      </div>
                    </div>
                  )}

                  {log.next && (
                    <div>
                      <h4 className="font-bold text-slate-900 uppercase text-[10px] text-emerald-800 mb-1">
                        Langkah Selanjutnya (Next):
                      </h4>
                      <div className="text-slate-800 whitespace-pre-wrap font-mono pl-2 border-l-2 border-emerald-300">
                        {log.next}
                      </div>
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
