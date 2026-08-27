'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

const COLUMNS = [
  { key: 'todo', label: 'TO DO', titlebarBg: 'from-blue-200 to-indigo-200', icon: '📝', badge: 'bg-blue-200 text-blue-950' },
  { key: 'in_progress', label: 'IN PROGRESS', titlebarBg: 'from-yellow-200 to-amber-200', icon: '⚡', badge: 'bg-yellow-200 text-yellow-950' },
  { key: 'blocked', label: 'BLOCKED', titlebarBg: 'from-rose-200 to-pink-200', icon: '⛔', badge: 'bg-rose-200 text-rose-950' },
  { key: 'done', label: 'DONE', titlebarBg: 'from-emerald-200 to-teal-200', icon: '★', badge: 'bg-emerald-200 text-emerald-950' },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    dueDate: '',
    tags: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedTag, setSelectedTag] = useState('');
  const [allTags, setAllTags] = useState([]);

  const fetchTasks = async () => {
    try {
      const url = selectedTag ? `/tasks?tag=${encodeURIComponent(selectedTag)}` : '/tasks';
      const [tasksRes, tagsRes] = await Promise.all([
        api.get(url),
        api.get('/tags'),
      ]);
      setTasks(tasksRes.data?.data || []);
      setAllTags(tagsRes.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTag]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error('Failed to update task status', err);
      fetchTasks();
    }
  };

  const handleDelete = async (taskId) => {
    if (!confirm('Hapus tugas ini?')) return;
    try {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      await api.delete(`/tasks/${taskId}`);
    } catch (err) {
      console.error('Failed to delete task', err);
      fetchTasks();
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || submitting) return;

    setSubmitting(true);
    try {
      const tagArray = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        status: formData.status,
        dueDate: formData.dueDate || undefined,
        tags: tagArray,
      };

      await api.post('/tasks', payload);
      setShowModal(false);
      setFormData({ title: '', description: '', status: 'todo', dueDate: '', tags: '' });
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal membuat tugas.');
    } finally {
      setSubmitting(false);
    }
  };

  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'done') return false;
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 pixel-badge bg-purple-200 text-purple-950 mb-2">
            <span>⚔</span> QUEST &amp; TASK MANAGER
          </div>
          <h1 className="font-pixel text-lg sm:text-xl text-slate-900">Papan Kanban Tugas</h1>
          <p className="text-xs text-slate-600 mt-1">
            Visualisasikan dan pantau perkembangan tugas harian Anda di 4 kolom alur kerja.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tag Filter */}
          {allTags.length > 0 && (
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="pixel-input text-xs font-bold py-1.5"
            >
              <option value="">Semua Tag</option>
              {allTags.map((tag) => (
                <option key={tag.id} value={tag.name}>
                  #{tag.name} ({tag._count?.tasks || 0})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setShowModal(true)}
            className="pixel-btn pixel-btn-purple px-4 py-2 text-xs"
          >
            + Buat Tugas
          </button>
        </div>
      </div>

      {/* Kanban Board 4 Columns */}
      {loading ? (
        <div className="text-center py-16 font-pixel text-xs text-purple-700 animate-pulse">
          MEMUAT PAPAN KANBAN...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {COLUMNS.map((col) => {
            const columnTasks = tasks.filter((t) => t.status === col.key);

            return (
              <div
                key={col.key}
                className="pixel-window bg-slate-50 flex flex-col min-h-[520px]"
              >
                {/* Column Titlebar */}
                <div className={`pixel-titlebar bg-linear-to-r ${col.titlebarBg}`}>
                  <div className="flex items-center gap-2">
                    <span>{col.icon}</span>
                    <span className="font-pixel text-[10px] text-slate-900">
                      {col.label}
                    </span>
                  </div>
                  <span className={`pixel-badge text-[10px] ${col.badge}`}>
                    {columnTasks.length}
                  </span>
                </div>

                {/* Column Cards Container */}
                <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                  {columnTasks.length === 0 ? (
                    <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-lg text-xs font-bold text-slate-400">
                      Kosong
                    </div>
                  ) : (
                    columnTasks.map((task) => {
                      const overdue = isOverdue(task.dueDate, task.status);

                      return (
                        <div
                          key={task.id}
                          className="pixel-box p-3.5 bg-white flex flex-col justify-between gap-3"
                        >
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm leading-snug">
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className="text-xs text-slate-600 mt-1 line-clamp-2 font-medium">
                                {task.description}
                              </p>
                            )}

                            {/* Tags */}
                            {task.taskTags?.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2.5">
                                {task.taskTags.map(({ tag }) => (
                                  <span
                                    key={tag.id}
                                    className="pixel-badge bg-purple-100 text-purple-900 text-[10px]"
                                  >
                                    #{tag.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Due Date & Controls */}
                          <div className="pt-2 border-t-2 border-slate-100 flex items-center justify-between text-xs">
                            {task.dueDate ? (
                              <span
                                className={`pixel-badge text-[10px] ${
                                  overdue
                                    ? 'bg-rose-200 text-rose-950'
                                    : 'bg-yellow-100 text-yellow-950'
                                }`}
                              >
                                {overdue ? 'Lewat: ' : 'Due: '}
                                {new Date(task.dueDate).toLocaleDateString('id-ID', {
                                  month: 'numeric',
                                  day: 'numeric',
                                })}
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-semibold">-</span>
                            )}

                            <div className="flex items-center gap-1.5">
                              {/* Status Dropdown */}
                              <select
                                value={task.status}
                                onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                className="pixel-input text-[10px] font-bold py-0.5 px-1 bg-slate-50"
                              >
                                <option value="todo">To Do</option>
                                <option value="in_progress">In Prog</option>
                                <option value="blocked">Blocked</option>
                                <option value="done">Done</option>
                              </select>

                              {/* Delete button */}
                              <button
                                onClick={() => handleDelete(task.id)}
                                className="pixel-btn pixel-btn-danger text-xs px-1.5 py-0.5"
                                title="Hapus tugas"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pixel Modal: Tambah Tugas */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="pixel-window max-w-lg w-full bg-white shadow-2xl">
            <div className="pixel-titlebar bg-linear-to-r from-purple-200 to-pink-200">
              <span className="font-pixel text-xs text-slate-900">
                ★ BUAT TUGAS BARU
              </span>
              <button
                onClick={() => setShowModal(false)}
                className="pixel-btn pixel-btn-danger text-xs px-2 py-0.5"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-6 space-y-4 bg-purple-50/30">
              <div>
                <label className="block font-pixel text-[10px] text-slate-800 uppercase mb-1">
                  Judul Tugas *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Selesaikan perancangan antarmuka"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full pixel-input text-sm"
                />
              </div>

              <div>
                <label className="block font-pixel text-[10px] text-slate-800 uppercase mb-1">
                  Deskripsi / Rincian
                </label>
                <textarea
                  rows="3"
                  placeholder="Catatan tambahan..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full pixel-input text-sm resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-pixel text-[10px] text-slate-800 uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full pixel-input text-sm bg-white font-bold"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="blocked">Blocked</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block font-pixel text-[10px] text-slate-800 uppercase mb-1">
                    Jatuh Tempo
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full pixel-input text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-pixel text-[10px] text-slate-800 uppercase mb-1">
                  Tags (Pisahkan koma)
                </label>
                <input
                  type="text"
                  placeholder="fitur, desain, penting"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full pixel-input text-sm"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t-2 border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="pixel-btn pixel-btn-gray px-4 py-2 text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="pixel-btn pixel-btn-purple px-5 py-2 text-xs"
                >
                  {submitting ? 'Menyimpan...' : '⚡ Simpan Tugas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
