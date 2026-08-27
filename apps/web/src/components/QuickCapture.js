'use client';

import { useState } from 'react';
import api from '@/lib/api';

export default function QuickCapture({ onCreated, placeholder = "Tangkap ide cepat atau tugas baru... (Tekan Enter)" }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || loading) return;

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/captures', { content: content.trim() });
      setContent('');
      if (onCreated) {
        onCreated(res.data?.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan capture');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-xs border border-gray-200 p-4 transition-all focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="flex-1 relative">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 text-sm bg-transparent border-0 focus:outline-hidden placeholder-gray-400"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Menyimpan...' : 'Tangkap'}
        </button>
      </form>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}
