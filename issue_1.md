## Milestone 1: Fondasi & Autentikasi

### Deskripsi
Inisialisasi struktur proyek monorepo/multi-folder untuk frontend (Next.js App Router) dan backend (NestJS) dengan konfigurasi TypeScript, linter, dan environment variable yang terisolasi.

---

### Spesifikasi Teknis

1. **Struktur Direktori:**
   ```text
   MyNote/
   ├── apps/
   │   ├── api/       # NestJS
   │   └── web/       # Next.js 14/15 App Router
   ├── .env.example
   ├── package.json   # Workspace root (npm/pnpm workspaces)
   └── .gitignore
   ```

2. **Backend Setup (`apps/api`):**
   - Inisialisasi NestJS dengan arsitektur modular.
   - Siapkan folder domain modules: `auth`, `captures`, `tasks`, `notes`, `logs`, `tags`, `search`, `dashboard`.
   - Setup `@nestjs/config` untuk membaca file `.env`.
   - Setup Global Validation Pipe: `app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))`.
   - Setup Global API Prefix: `app.setGlobalPrefix('api')`.
   - Setup CORS dengan credentials: `app.enableCors({ origin: 'http://localhost:3000', credentials: true })`.

3. **Frontend Setup (`apps/web`):**
   - Inisialisasi Next.js (App Router, TypeScript).
   - Setup Axios / Fetch instance terpusat dengan `baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'`.
   - Konfigurasi path alias TypeScript (`@/*`).

---

### Kriteria Penerimaan (Definition of Done)
- [ ] Menjalankan command `dev` di root dapat menjalankan `apps/web` (port 3000) dan `apps/api` (port 4000) secara bersamaan.
- [ ] File `.env` masuk ke `.gitignore` (hanya `.env.example` yang di-commit).
- [ ] Base endpoint backend `/api` dapat merespons request HTTP dari frontend.
