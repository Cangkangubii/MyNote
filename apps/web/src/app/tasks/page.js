'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

const COLUMNS = [
  { key: 'todo', label: 'To Do', color: 'border-t-blue-500', bgBadge: 'bg-blue-50 text-blue-700' },
  { key: 'in_progress', label: 'In Progress', color: 'border-t-amber-500', bgBadge: 'bg-amber-50 text-amber-700' },
  { key: 'blocked', label: 'Blocked', color: 'border-t-rose-500', bgBadge: 'bg-rose-50 text-rose-700' },
  { key: 'done', label: 'Done', color: 'border-t-emerald-500', bgBadge: 'bg-emerald-50 text-emerald-700' },
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
      // Optimistic update
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kanban Tasks</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola alur kerja dan prioritas tugas secara visual.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tag Filter */}
          {allTags.length > 0 && (
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
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
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-xs"
          >
            + Tambah Tugas
          </button>
        </div>
      </div>

      {/* Kanban Board Grid */}
      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Memuat papan Kanban...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {COLUMNS.map((col) => {
            const columnTasks = tasks.filter((t) => t.status === col.key);

            return (
              <div
                key={col.key}
                className={`bg-gray-100/70 rounded-xl p-4 border border-gray-200 border-t-4 ${col.color} flex flex-col min-h-[500px]`}
              >
                {/* Column Title */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-800 text-sm">{col.label}</h2>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${col.bgBadge}`}>
                    {columnTasks.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {columnTasks.length === 0 ? (
                    <div className="h-32 flex items-center justify-center border border-dashed border-gray-300 rounded-lg text-xs text-gray-400">
                      Tidak ada tugas
                    </div>
                  ) : (
                    columnTasks.map((task) => {
                      const overdue = isOverdue(task.dueDate, task.status);

                      return (
                        <div
                          key={task.id}
                          className="bg-white p-4 rounded-lg shadow-xs border border-gray-200 hover:shadow-md transition flex flex-col justify-between gap-3"
                        >
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm leading-snug">
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {task.description}
                              </p>
                            )}

                            {/* Tags */}
                            {task.taskTags?.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2.5">
                                {task.taskTags.map(({ tag }) => (
                                  <span
                                    key={tag.id}
                                    className="px-2 py-0.5 text-[11px] font-medium bg-gray-100 text-gray-600 rounded-md"
                                  >
                                    #{tag.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Due Date & Actions */}
                          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                            {task.dueDate ? (
                              <span
                                className={`font-medium ${
                                  overdue ? 'text-red-600 font-semibold' : 'text-gray-500'
                                }`}
                              >
                                {overdue ? 'Lewat: ' : 'Jatuh tempo: '}
                                {new Date(task.dueDate).toLocaleDateString('id-ID', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            ) : (
                              <span className="text-gray-400">Tanpa deadline</span>
                            )}

                            <div className="flex items-center gap-1.5">
                              {/* Status Selector Dropdown */}
                              <select
                                value={task.status}
                                onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                className="text-[11px] bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 text-gray-700 focus:outline-hidden"
                              >
                                <option value="todo">To Do</option>
                                <option value="in_progress">In Progress</option>
                                <option value="blocked">Blocked</option>
                                <option value="done">Done</option>
                              </select>

                              {/* Delete button */}
                              <button
                                onClick={() => handleDelete(task.id)}
                                className="text-gray-400 hover:text-red-600 transition p-1"
                                title="Hapus tugas"
                              >
                                &times;
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

      {/* Modal Tambah Tugas */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Buat Tugas Baru</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Judul Tugas *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Siapkan proposal proyek"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Deskripsi / Catatan Tambahan
                </label>
                <textarea
                  rows="3"
                  placeholder="Rincian atau instruksi tugas..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Status Awal
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="blocked">Blocked</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Jatuh Tempo (Due Date)
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Tags (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  placeholder="frontend, fitur, penting"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Tugas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
