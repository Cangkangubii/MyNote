'use client';

import { useState } from 'react';
import api from '@/lib/api';

export default function QuickCapture({ onCreated, placeholder = "Ketik ide cepat atau tugas baru... (Enter untuk simpan)" }) {
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
    <div className="pixel-window w-full bg-white">
      <div className="pixel-titlebar bg-linear-to-r from-yellow-200 via-pink-200 to-purple-200">
        <div className="flex items-center gap-2">
          <span className="font-pixel text-[10px] text-slate-900 tracking-wider">
            ★ QUICK CAPTURE PROMPT
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 bg-white border border-slate-900 rounded-xs inline-block"></span>
          <span className="w-2.5 h-2.5 bg-yellow-300 border border-slate-900 rounded-xs inline-block"></span>
          <span className="w-2.5 h-2.5 bg-pink-400 border border-slate-900 rounded-xs inline-block"></span>
        </div>
      </div>

      <div className="p-4 bg-purple-50/40">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="flex-1">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              className="w-full pixel-input text-sm"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="pixel-btn pixel-btn-purple px-5 py-2 text-xs"
          >
            {loading ? 'Menyimpan...' : '⚡ Tangkap Ide'}
          </button>
        </form>
        {error && <p className="mt-2 text-xs font-bold text-red-600">{error}</p>}
      </div>
    </div>
  );
}
