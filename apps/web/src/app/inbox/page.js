'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import QuickCapture from '@/components/QuickCapture';

export default function InboxPage() {
  const [captures, setCaptures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState('');

  const fetchCaptures = async () => {
    try {
      const res = await api.get('/captures?status=inbox');
      setCaptures(res.data?.data || []);
    } catch (err) {
      setError('Gagal memuat item inbox.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaptures();
  }, []);

  const handleResolve = async (id, resolution) => {
    try {
      setProcessingId(id);
      await api.post(`/captures/${id}/resolve`, { resolution });
      setCaptures((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memproses item.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleItemCreated = (newCapture) => {
    if (newCapture) {
      setCaptures((prev) => [newCapture, ...prev]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header Banner */}
      <div className="pixel-window">
        <div className="pixel-titlebar bg-linear-to-r from-mint-200 via-yellow-200 to-pink-200">
          <span className="font-pixel text-[11px] text-slate-900">
            ✉ INBOX &amp; TRIAGE PROTOCOL
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-white border border-slate-900 rounded-xs inline-block"></span>
            <span className="w-2.5 h-2.5 bg-pink-400 border border-slate-900 rounded-xs inline-block"></span>
          </div>
        </div>
        <div className="p-5 bg-white">
          <h1 className="font-pixel text-sm text-slate-900">Penangkap Ide Cepat</h1>
          <p className="text-xs text-slate-600 mt-1">
            Kumpulkan pemikiran mentah Anda, lalu tentukan takdirnya: jadikan Tugas, Catatan, Log Harian, atau Buang.
          </p>
        </div>
      </div>

      {/* Quick Capture Input */}
      <div>
        <QuickCapture onCreated={handleItemCreated} placeholder="Ketik ide mentah baru di sini..." />
      </div>

      {/* Inbox Items Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2">
            <span className="font-pixel text-xs text-purple-900">
              ANTREAN INBOX
            </span>
            <span className="pixel-badge bg-purple-200 text-purple-900">
              {captures.length}
            </span>
          </div>
          {captures.length > 0 && (
            <span className="text-xs font-semibold text-slate-500">Pilih aksi untuk menyortir:</span>
          )}
        </div>

        {error && (
          <div className="pixel-box p-4 bg-red-100 border-red-900 text-red-900 text-xs font-bold">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 font-pixel text-xs text-purple-700 animate-pulse">
            MEMUAT INBOX...
          </div>
        ) : captures.length === 0 ? (
          <div className="pixel-box text-center py-16 bg-white p-8">
            <span className="text-3xl block mb-2">✨</span>
            <h3 className="font-pixel text-xs text-slate-900">INBOX BERSIH &amp; KOSONG</h3>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Semua ide telah diproses atau belum ada catatan baru. Gunakan formulir di atas untuk mulai mencatat.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {captures.map((item) => (
              <div
                key={item.id}
                className={`pixel-box p-5 bg-white transition-all ${
                  processingId === item.id ? 'opacity-40 pointer-events-none' : ''
                }`}
              >
                <div className="text-sm text-slate-900 whitespace-pre-wrap leading-relaxed font-medium">
                  {item.content}
                </div>

                <div className="mt-4 pt-3 border-t-2 border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[11px] font-semibold text-slate-400">
                    {new Date(item.createdAt).toLocaleString('id-ID', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>

                  {/* 4 Pixel Triage Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleResolve(item.id, 'task')}
                      className="pixel-btn pixel-btn-purple px-2.5 py-1 text-xs"
                      title="Ubah menjadi tugas di Kanban Tasks"
                    >
                      ⚔ +Task
                    </button>
                    <button
                      onClick={() => handleResolve(item.id, 'note')}
                      className="pixel-btn pixel-btn-mint px-2.5 py-1 text-xs"
                      title="Simpan sebagai catatan di Notes"
                    >
                      ✎ +Note
                    </button>
                    <button
                      onClick={() => handleResolve(item.id, 'log')}
                      className="pixel-btn pixel-btn-yellow px-2.5 py-1 text-xs"
                      title="Tambahkan ke Daily Log hari ini"
                    >
                      ☕ +Log
                    </button>
                    <button
                      onClick={() => handleResolve(item.id, 'discarded')}
                      className="pixel-btn pixel-btn-danger px-2 py-1 text-xs"
                      title="Buang / abaikan capture ini"
                    >
                      ✕ Buang
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
