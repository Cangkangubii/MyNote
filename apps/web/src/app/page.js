import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 sm:py-16 space-y-12">
      {/* Hero Window */}
      <div className="pixel-window bg-white shadow-2xl">
        <div className="pixel-titlebar bg-linear-to-r from-purple-300 via-pink-200 to-yellow-200">
          <span className="font-pixel text-xs text-slate-900 tracking-wider">
            ★ SYSTEM://MYNOTE_OS_V1.0.EXE
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-yellow-300 border border-slate-900 rounded-xs inline-block"></span>
            <span className="w-2.5 h-2.5 bg-pink-400 border border-slate-900 rounded-xs inline-block"></span>
          </div>
        </div>

        <div className="p-8 sm:p-14 text-center space-y-6 bg-linear-to-b from-purple-100/40 via-pink-50/30 to-white">
          <div className="inline-flex items-center gap-2 pixel-badge bg-yellow-200 text-yellow-950">
            <span>✨</span> RETRO PASTEL PRODUCTIVITY
          </div>

          <h1 className="font-pixel text-2xl sm:text-4xl text-slate-900 leading-relaxed sm:leading-loose">
            Catat Cepat, Rencanakan Rapi, &amp; Jaga Fokus Anda.
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            Platform produktivitas pribadi berestetika retro pixel 90-an yang tenang dan menyenangkan. Tangkap ide seketika, kelola tugas di papan kanban, tulis catatan format Markdown, dan bangun konsistensi dengan jurnal harian.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login"
              className="pixel-btn pixel-btn-purple px-6 py-3 text-sm font-bold tracking-wide"
            >
              ⚡ Buka Workspace
            </Link>
            <Link
              href="/register"
              className="pixel-btn pixel-btn-mint px-6 py-3 text-sm font-bold tracking-wide"
            >
              + Daftar Gratis
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Feature Bento Windows */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Feature 1 */}
        <div className="pixel-window bg-white">
          <div className="pixel-titlebar bg-linear-to-r from-mint-200 to-emerald-200">
            <span className="font-pixel text-[10px] text-slate-900">✉ QUICK CAPTURE &amp; TRIAGE</span>
          </div>
          <div className="p-6 space-y-2">
            <h3 className="font-pixel text-xs text-slate-900">Penangkapan Ide Instan</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Tuliskan pemikiran apa pun yang terlintas ke dalam Inbox. Lakukan triage menjadi Tugas, Catatan, atau Log Harian hanya dengan satu klik.
            </p>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="pixel-window bg-white">
          <div className="pixel-titlebar bg-linear-to-r from-amber-200 to-yellow-200">
            <span className="font-pixel text-[10px] text-slate-900">⚔ KANBAN QUEST BOARD</span>
          </div>
          <div className="p-6 space-y-2">
            <h3 className="font-pixel text-xs text-slate-900">Papan Tugas Terstruktur</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Kelola tugas dalam 4 tahap alur kerja (To Do, In Progress, Blocked, Done) lengkap dengan filter label dan indikator jatuh tempo.
            </p>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="pixel-window bg-white">
          <div className="pixel-titlebar bg-linear-to-r from-pink-200 to-purple-200">
            <span className="font-pixel text-[10px] text-slate-900">✎ MARKDOWN KNOWLEDGE</span>
          </div>
          <div className="p-6 space-y-2">
            <h3 className="font-pixel text-xs text-slate-900">Catatan Teks Kaya</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Simpan dokumentasi, ide kreatif, dan referensi menggunakan format Markdown lengkap dengan pratinjau langsung di dalam editor.
            </p>
          </div>
        </div>

        {/* Feature 4 */}
        <div className="pixel-window bg-white">
          <div className="pixel-titlebar bg-linear-to-r from-rose-200 to-orange-200">
            <span className="font-pixel text-[10px] text-slate-900">🔥 DAILY REFLECTION &amp; STREAK</span>
          </div>
          <div className="p-6 space-y-2">
            <h3 className="font-pixel text-xs text-slate-900">Jurnal Refleksi Harian</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Catat pencapaian harian Anda, kendala yang dihadapi, serta rencana esok hari, dan lihat lonjakan skor konsistensi streak Anda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
