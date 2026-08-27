'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api, { setToken } from '@/lib/api';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      const { accessToken } = response.data;
      setToken(accessToken);
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal. Periksa kembali email dan password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="pixel-window w-full max-w-md bg-white shadow-2xl">
        <div className="pixel-titlebar bg-linear-to-r from-purple-300 via-pink-200 to-yellow-200">
          <span className="font-pixel text-xs text-slate-900">
            ★ SYSTEM://LOGIN.EXE
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-yellow-300 border border-slate-900 rounded-xs inline-block"></span>
            <span className="w-2.5 h-2.5 bg-pink-400 border border-slate-900 rounded-xs inline-block"></span>
          </div>
        </div>

        <div className="p-8 bg-linear-to-b from-purple-50/40 to-white space-y-6">
          <div className="text-center space-y-1">
            <h1 className="font-pixel text-base text-slate-900">Masuk Akun</h1>
            <p className="text-xs text-slate-600">Akses ruang kerja MyNote OS Anda</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-pixel text-[10px] text-slate-800 uppercase mb-1">
                Email Pengguna
              </label>
              <input
                type="email"
                required
                placeholder="nama@email.com"
                className="w-full pixel-input text-sm"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block font-pixel text-[10px] text-slate-800 uppercase mb-1">
                Kata Sandi
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full pixel-input text-sm"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            {error && (
              <div className="pixel-badge bg-rose-100 text-rose-900 p-2 block w-full text-xs font-bold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full pixel-btn pixel-btn-purple py-2.5 text-xs tracking-wider"
            >
              {loading ? 'MEMPROSES...' : '⚡ MASUK SEKARANG'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-600 font-medium">
            Belum memiliki akun?{' '}
            <Link href="/register" className="font-bold text-purple-700 hover:underline">
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
