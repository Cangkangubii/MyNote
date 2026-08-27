'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedTag, setSelectedTag] = useState('');
  const [allTags, setAllTags] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeNote, setActiveNote] = useState(null);
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

  const renderMarkdown = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="font-bold text-sm mt-2 mb-1 text-purple-900">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={idx} className="font-bold text-base mt-3 mb-1 text-purple-950">{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('# ')) {
        return <h2 key={idx} className="font-pixel text-sm mt-4 mb-2 text-slate-900">{line.replace('# ', '')}</h2>;
      }
      if (line.startsWith('- ')) {
        return <li key={idx} className="ml-4 list-disc text-xs font-medium text-slate-800">{line.replace('- ', '')}</li>;
      }
      if (line.startsWith('```')) {
        return <div key={idx} className="bg-slate-900 text-green-400 p-2.5 font-mono text-xs rounded-md my-1.5 border border-slate-700">{line.replace(/```/g, '')}</div>;
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-2"></div>;
      }
      return <p key={idx} className="text-xs leading-relaxed text-slate-800">{line}</p>;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 pixel-badge bg-pink-200 text-pink-950 mb-2">
            <span>✎</span> NOTEBOOK &amp; SCROLLS
          </div>
          <h1 className="font-pixel text-lg sm:text-xl text-slate-900">Catatan &amp; Knowledge Base</h1>
          <p className="text-xs text-slate-600 mt-1">
            Simpan dokumen teks panjang dan artikel referensi menggunakan format Markdown.
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
                  #{tag.name} ({tag._count?.notes || 0})
                </option>
              ))}
            </select>
          )}

          {/* Toggle View Mode */}
          <div className="flex items-center gap-1 bg-white p-1 border-2 border-slate-900 rounded-lg shadow-[2px_2px_0px_#0f172a]">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                viewMode === 'grid' ? 'bg-purple-200 text-purple-950 border border-slate-900' : 'text-slate-600'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                viewMode === 'list' ? 'bg-purple-200 text-purple-950 border border-slate-900' : 'text-slate-600'
              }`}
            >
              List
            </button>
          </div>

          <button
            onClick={openCreateModal}
            className="pixel-btn pixel-btn-mint px-4 py-2 text-xs"
          >
            + Tulis Catatan
          </button>
        </div>
      </div>

      {/* Notes Grid / List */}
      {loading ? (
        <div className="text-center py-16 font-pixel text-xs text-purple-700 animate-pulse">
          MEMUAT CATATAN...
        </div>
      ) : notes.length === 0 ? (
        <div className="pixel-box text-center py-16 bg-white p-8">
          <span className="text-3xl block mb-2">📖</span>
          <h3 className="font-pixel text-xs text-slate-900">BELUM ADA CATATAN</h3>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            Mulai tulis catatan pertama Anda atau lakukan triage dari inbox.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => openEditModal(note)}
              className="pixel-box p-5 bg-white hover:bg-purple-50/40 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="font-bold text-slate-900 text-base">{note.title}</h3>
                  <span className="text-xs text-purple-600">✎</span>
                </div>
                <div className="text-xs text-slate-600 line-clamp-4 leading-relaxed font-medium whitespace-pre-wrap">
                  {note.content}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t-2 border-slate-100 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {note.noteTags?.map(({ tag }) => (
                    <span
                      key={tag.id}
                      className="pixel-badge bg-pink-100 text-pink-900 text-[10px]"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
                <span className="text-[11px] font-bold text-slate-400">
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
        <div className="pixel-window bg-white divide-y-2 divide-slate-100">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => openEditModal(note)}
              className="p-4 hover:bg-purple-50 transition cursor-pointer flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 text-sm truncate">{note.title}</h3>
                <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">{note.content}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="hidden sm:flex flex-wrap gap-1">
                  {note.noteTags?.map(({ tag }) => (
                    <span
                      key={tag.id}
                      className="pixel-badge bg-purple-100 text-purple-900 text-[10px]"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-400">
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

      {/* Pixel Modal: Editor Markdown */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="pixel-window max-w-3xl w-full bg-white shadow-2xl flex flex-col max-h-[90vh]">
            <div className="pixel-titlebar bg-linear-to-r from-mint-200 via-yellow-200 to-pink-200">
              <span className="font-pixel text-xs text-slate-900">
                {activeNote ? '✎ EDIT NOTE.MD' : '★ NEW NOTE.MD'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewMode(!previewMode)}
                  className="pixel-btn pixel-btn-yellow text-xs px-2.5 py-0.5"
                >
                  {previewMode ? 'Mode Edit' : 'Preview MD'}
                </button>
                {activeNote && (
                  <button
                    type="button"
                    onClick={() => handleDelete(activeNote.id)}
                    className="pixel-btn pixel-btn-danger text-xs px-2 py-0.5"
                  >
                    Hapus
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="pixel-btn pixel-btn-danger text-xs px-2 py-0.5"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleSave} className="p-6 flex-1 flex flex-col min-h-0 space-y-4 bg-purple-50/20">
              <div>
                <label className="block font-pixel text-[10px] text-slate-800 uppercase mb-1">
                  Judul Catatan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Judul catatan..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full pixel-input text-sm font-bold"
                />
              </div>

              <div className="flex-1 flex flex-col min-h-0">
                <label className="block font-pixel text-[10px] text-slate-800 uppercase mb-1">
                  Konten Catatan (Markdown) *
                </label>
                {previewMode ? (
                  <div className="flex-1 p-4 bg-white border-2 border-slate-900 rounded-lg overflow-y-auto min-h-[220px] shadow-[inset_2px_2px_0px_#cbd5e1]">
                    {renderMarkdown(formData.content)}
                  </div>
                ) : (
                  <textarea
                    required
                    rows="10"
                    placeholder="Tulis catatan menggunakan Markdown (# Heading, - List, ``` Code, dll)..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="flex-1 w-full p-3 pixel-input text-xs font-mono resize-none min-h-[220px]"
                  ></textarea>
                )}
              </div>

              <div>
                <label className="block font-pixel text-[10px] text-slate-800 uppercase mb-1">
                  Tags (Pisahkan koma)
                </label>
                <input
                  type="text"
                  placeholder="ide, riset, arsitektur"
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
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="pixel-btn pixel-btn-purple px-5 py-2 text-xs"
                >
                  {submitting ? 'Menyimpan...' : '⚡ Simpan Catatan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
