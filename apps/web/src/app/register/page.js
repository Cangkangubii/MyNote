'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/register', formData);
      router.push('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registrasi gagal. Silakan coba kembali.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="pixel-window w-full max-w-md bg-white shadow-2xl">
        <div className="pixel-titlebar bg-linear-to-r from-mint-300 via-yellow-200 to-purple-200">
          <span className="font-pixel text-xs text-slate-900">
            ★ SYSTEM://REGISTER.EXE
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-yellow-300 border border-slate-900 rounded-xs inline-block"></span>
            <span className="w-2.5 h-2.5 bg-pink-400 border border-slate-900 rounded-xs inline-block"></span>
          </div>
        </div>

        <div className="p-8 bg-linear-to-b from-mint-50/40 to-white space-y-6">
          <div className="text-center space-y-1">
            <h1 className="font-pixel text-base text-slate-900">Registrasi Pengguna</h1>
            <p className="text-xs text-slate-600">Buat akun baru untuk mulai menggunakan MyNote OS</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-pixel text-[10px] text-slate-800 uppercase mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                placeholder="Nama Anda"
                className="w-full pixel-input text-sm"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

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
                placeholder="Minimal 6 karakter"
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
              className="w-full pixel-btn pixel-btn-mint py-2.5 text-xs tracking-wider"
            >
              {loading ? 'MENDAFTAR...' : '⚡ BUAT AKUN SEKARANG'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-600 font-medium">
            Sudah memiliki akun?{' '}
            <Link href="/login" className="font-bold text-purple-700 hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
