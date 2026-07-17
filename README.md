# Portfolio HgzPort (CMS Portofolio Dinamis)

Portfolio HgzPort adalah aplikasi Content Management System (CMS) modern yang dibuat khusus untuk mengelola portofolio profesional Anda. Anda bisa membuat banyak halaman portofolio dengan username berbeda, menyusun pengalaman, pendidikan, dan proyek-proyek Anda, lalu membagikannya ke publik.

## 🌟 Fitur Utama

- **Multi-Portofolio:** Buat lebih dari satu portofolio dalam satu akun.
- **CMS Intuitif:** Dashboard pengelolaan konten (biodata, hero, about, edu, dll).
- **Manajemen Proyek Drag-and-Drop:** Urutkan proyek dengan mudah menggunakan Dnd-Kit.
- **Wokwi Integration:** Embed simulasi IoT langsung di halaman portofolio Anda.
- **Formulir Kontak Bawaan:** Pengunjung dapat mengirim pesan langsung ke inbox dashboard Anda.
- **Role-Based Access (Admin/User):** Admin dapat memantau statistik dan pengguna terdaftar.
- **UI/UX Premium:** Animasi halus menggunakan Framer Motion, gaya Glassmorphism, dan dukungan mode gelap permanen yang elegan.

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS v4, Lucide Icons, Framer Motion
- **Database & ORM:** PostgreSQL (Supabase) + Prisma ORM
- **Autentikasi:** NextAuth.js v5 (Credentials)
- **Form & Validasi:** React Hook Form + Zod
- **Media Storage:** Cloudinary
- **State & Utils:** React Hot Toast, Dnd-Kit

## 🚀 Cara Menjalankan di Lokal

1. **Clone repository ini:**
   ```bash
   git clone <repo-url>
   cd portfolio-cms
   ```

2. **Install dependensi:**
   ```bash
   npm install
   ```

3. **Atur Environment Variables:**
   Buat file `.env.local` dan isi dengan konfigurasi berikut:
   ```env
   DATABASE_URL="postgres://..."
   DIRECT_URL="postgres://..."
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="rahasia-anda"
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="..."
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="..."
   ```

4. **Migrasi Database & Sinkronisasi:**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Jalankan Server Lokal:**
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## 📖 Deployment

Untuk panduan melakukan deploy ke Vercel dan produksi, silakan baca [DEPLOYMENT.md](DEPLOYMENT.md).

---
*Dibuat oleh Muhammad Ilham Musyaffa (HgzPort)*
