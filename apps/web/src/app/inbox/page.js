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
      // Reactively filter out the resolved item
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inbox &amp; Quick Capture</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kumpulkan ide mentah dan lakukan triage menjadi Tugas, Catatan, atau Log Harian.
        </p>
      </div>

      {/* Quick Capture Input */}
      <div className="mb-8">
        <QuickCapture onCreated={handleItemCreated} placeholder="Tulis ide atau tangkapan cepat baru... lalu tekan Enter" />
      </div>

      {/* Inbox Items List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Item Belum Diproses ({captures.length})
          </h2>
          {captures.length > 0 && (
            <span className="text-xs text-gray-400">Pilih tindakan untuk menyortir</span>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Memuat inbox...</div>
        ) : captures.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300 p-8">
            <h3 className="text-base font-medium text-gray-900">Inbox Kosong</h3>
            <p className="text-sm text-gray-500 mt-1">
              Semua tangkapan ide telah diproses atau belum ada ide baru yang dicatat.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {captures.map((item) => (
              <div
                key={item.id}
                className={`bg-white p-5 rounded-xl border border-gray-200 shadow-xs transition-all ${
                  processingId === item.id ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                <div className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                  {item.content}
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-gray-400">
                    {new Date(item.createdAt).toLocaleString('id-ID', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleResolve(item.id, 'task')}
                      className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition"
                    >
                      Jadikan Task
                    </button>
                    <button
                      onClick={() => handleResolve(item.id, 'note')}
                      className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition"
                    >
                      Jadikan Note
                    </button>
                    <button
                      onClick={() => handleResolve(item.id, 'log')}
                      className="px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md transition"
                    >
                      Tambah ke Log
                    </button>
                    <button
                      onClick={() => handleResolve(item.id, 'discarded')}
                      className="px-2.5 py-1 text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                    >
                      Buang
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
