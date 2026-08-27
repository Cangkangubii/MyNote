'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [selectedTag, setSelectedTag] = useState('');
  const [allTags, setAllTags] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeNote, setActiveNote] = useState(null); // null for new, note object for editing/viewing
  const [previewMode, setPreviewMode] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', tags: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchNotes = async () => {
    try {
      const url = selectedTag ? `/notes?tag=${encodeURIComponent(selectedTag)}` : '/notes';
      const [notesRes, tagsRes] = await Promise.all([
        api.get(url),
        api.get('/tags'),
      ]);
      setNotes(notesRes.data?.data || []);
      setAllTags(tagsRes.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch notes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTag]);

  const openCreateModal = () => {
    setActiveNote(null);
    setFormData({ title: '', content: '', tags: '' });
    setPreviewMode(false);
    setShowModal(true);
  };

  const openEditModal = (note) => {
    setActiveNote(note);
    const tagString = note.noteTags?.map((nt) => nt.tag.name).join(', ') || '';
    setFormData({ title: note.title, content: note.content, tags: tagString });
    setPreviewMode(false);
    setShowModal(true);
  };

  const handleDelete = async (noteId) => {
    if (!confirm('Hapus catatan ini?')) return;
    try {
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      if (showModal && activeNote?.id === noteId) {
        setShowModal(false);
      }
      await api.delete(`/notes/${noteId}`);
    } catch (err) {
      console.error('Failed to delete note', err);
      fetchNotes();
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim() || submitting) return;

    setSubmitting(true);
    try {
      const tagArray = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        title: formData.title.trim(),
        content: formData.content,
        tags: tagArray,
      };

      if (activeNote) {
        await api.patch(`/notes/${activeNote.id}`, payload);
      } else {
        await api.post('/notes', payload);
      }

      setShowModal(false);
      fetchNotes();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan catatan.');
    } finally {
      setSubmitting(false);
    }
  };

  // Simple and safe markdown parser for bold, italic, code blocks, lists, and headers
  const renderMarkdown = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="font-bold text-base mt-2 mb-1">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={idx} className="font-bold text-lg mt-3 mb-1">{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('# ')) {
        return <h2 key={idx} className="font-bold text-xl mt-4 mb-2">{line.replace('# ', '')}</h2>;
      }
      if (line.startsWith('- ')) {
        return <li key={idx} className="ml-4 list-disc text-sm">{line.replace('- ', '')}</li>;
      }
      if (line.startsWith('```')) {
        return <div key={idx} className="bg-gray-100 p-2 font-mono text-xs rounded my-1">{line.replace(/```/g, '')}</div>;
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-2"></div>;
      }
      return <p key={idx} className="text-sm leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notes &amp; Knowledge Base</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tulis ide bebas dan catatan panjang terstruktur dengan format Markdown.
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
                  #{tag.name} ({tag._count?.notes || 0})
                </option>
              ))}
            </select>
          )}

          {/* Toggle View Mode */}
          <div className="flex items-center bg-gray-200/70 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                viewMode === 'grid' ? 'bg-white shadow-xs text-blue-600' : 'text-gray-600'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                viewMode === 'list' ? 'bg-white shadow-xs text-blue-600' : 'text-gray-600'
              }`}
            >
              List
            </button>
          </div>

          <button
            onClick={openCreateModal}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-xs"
          >
            + Catatan Baru
          </button>
        </div>
      </div>

      {/* Notes Content */}
      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Memuat catatan...</div>
      ) : notes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300 p-8">
          <h3 className="text-base font-medium text-gray-900">Belum Ada Catatan</h3>
          <p className="text-sm text-gray-500 mt-1">
            Mulai buat catatan baru atau lakukan triage dari inbox untuk menyimpan referensi.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => openEditModal(note)}
              className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs hover:shadow-md hover:border-blue-300 transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <h3 className="font-bold text-gray-900 text-base mb-2">{note.title}</h3>
                <div className="text-sm text-gray-600 line-clamp-4 leading-relaxed whitespace-pre-wrap">
                  {note.content}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {note.noteTags?.map(({ tag }) => (
                    <span
                      key={tag.id}
                      className="px-2 py-0.5 text-[11px] font-medium bg-blue-50 text-blue-700 rounded-md"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(note.updatedAt).toLocaleDateString('id-ID', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 shadow-xs">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => openEditModal(note)}
              className="p-4 hover:bg-blue-50/50 transition cursor-pointer flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm truncate">{note.title}</h3>
                <p className="text-xs text-gray-500 truncate mt-0.5">{note.content}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="hidden sm:flex flex-wrap gap-1">
                  {note.noteTags?.map(({ tag }) => (
                    <span
                      key={tag.id}
                      className="px-2 py-0.5 text-[11px] font-medium bg-gray-100 text-gray-600 rounded"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(note.updatedAt).toLocaleDateString('id-ID', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Editor / Preview */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {activeNote ? 'Edit Catatan' : 'Catatan Baru'}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewMode(!previewMode)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md border transition ${
                    previewMode
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                >
                  {previewMode ? 'Mode Edit' : 'Preview Markdown'}
                </button>
                {activeNote && (
                  <button
                    type="button"
                    onClick={() => handleDelete(activeNote.id)}
                    className="text-xs text-red-600 px-2 py-1 hover:bg-red-50 rounded"
                  >
                    Hapus
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold ml-2"
                >
                  &times;
                </button>
              </div>
            </div>

            <form onSubmit={handleSave} className="flex-1 flex flex-col min-h-0 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Judul Catatan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Judul catatan..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex-1 flex flex-col min-h-0">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Konten Catatan (Mendukung Markdown) *
                </label>
                {previewMode ? (
                  <div className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-lg overflow-y-auto min-h-[220px]">
                    {renderMarkdown(formData.content)}
                  </div>
                ) : (
                  <textarea
                    required
                    rows="10"
                    placeholder="Tulis catatan Anda di sini menggunakan sintaks Markdown (contoh: # Heading, - List, **Bold**)..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="flex-1 w-full p-3 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden resize-none min-h-[220px]"
                  ></textarea>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Tags (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  placeholder="ide, riset, arsitektur"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Catatan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
