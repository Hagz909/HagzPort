# HgzPort: Dynamic Portfolio Builder & CMS (Enterprise-Grade Security Architecture)

HgzPort adalah platform **Content Management System (CMS) Portofolio Dinamis** berbasis Full-Stack Next.js yang dirancang untuk memfasilitasi pembuatan, pengelolaan, dan publikasi portofolio profesional secara instan. Platform ini dilengkapi dengan fitur pembuatan Resume (CV) bertenaga AI/PDF engine, pusat pesan terpadu, serta dasbor administrator yang memantau sistem secara real-time.

Dengan mengusung konsep **Open Source**, HgzPort dirancang sejak awal dengan prinsip **Security-by-Design**. Seluruh arsitektur kode didesain untuk mencegah kebocoran data (*data breaches*), eksploitasi API, dan manipulasi hak akses.

---

## 🛠️ Stack Teknologi & Infrastruktur
* **Frontend:** Next.js 16 (App Router), React 19 (Server & Client Components), Tailwind CSS, Framer Motion.
* **Backend:** Next.js Serverless Route Handlers (API Routes).
* **Database & ORM:** PostgreSQL (Hosted on Supabase Cloud) dengan Prisma ORM v7 (PrismaPg Driver Adapter).
* **Autentikasi:** NextAuth.js (Auth.js v5) dengan JWT (JSON Web Token) Strategy.
* **Media Storage:** Cloudinary CDN (Secure Signed Uploads).
* **Mail Gateway:** Resend SMTP API.

---

## 🛡️ Arsitektur Keamanan Sistem (Cyber Security Hardening)

Platform ini mengimplementasikan lapisan pertahanan berlapis (*Defense-in-Depth*) untuk menjamin integritas data dan keamanan privasi pengguna:

### 1. Sistem Autentikasi & Otorisasi Ketat (Role-Based Access Control - RBAC)
* **Pemisahan Peran:** Sistem membagi pengguna menjadi dua tingkat akses: `USER` (pemilik portofolio) dan `ADMIN` (pengawas sistem). 
* **Middleware Protection:** Rute navigasi `/dashboard/*` (User) dan `/admin/*` (Admin) diproteksi secara real-time di tingkat *Edge* oleh Next.js Middleware. Pengguna tanpa token sesi JWT yang valid akan langsung dialihkan ke halaman login sebelum komponen web dirender.
* **API Route Verification:** Setiap endpoint API menggunakan modul `getRequiredSession()` untuk memverifikasi identitas pengguna sebelum memproses data.

### 2. Pencegahan Kebocoran Database (Server-Side Proxy Pattern)
* **Koneksi Terisolasi:** Berbeda dengan arsitektur serverless tradisional yang rentan mengekspos database client, HgzPort tidak pernah menghubungkan Supabase secara langsung ke sisi klien (*Client-Side*). 
* **Prisma Cloud Gateway:** Semua query database (`PrismaClient`) hanya dieksekusi di lingkungan server terisolasi (*Node.js runtime* serverless Vercel). Klien hanya dapat berinteraksi dengan database melalui API Routes yang telah disaring dan diautentikasi.
* **Enkripsi Kredensial:** Kata sandi pengguna disimpan menggunakan algoritma hashing **Bcryptjs** dengan salt rounds tinggi untuk menangkal serangan *rainbow table* dan *brute force*.

### 3. Validasi & Sanitasi Input (Anti-Injection & XSS Protection)
* **Skema Data Zod:** Seluruh input data (formulir, biodata, proyek) divalidasi secara ketat menggunakan pustaka **Zod** sebelum masuk ke database. Hal ini secara efektif mencegah serangan *SQL Injection*, *NoSQL Injection*, dan pengiriman data korup.
* **XSS Defenses:** Konten dinamis yang diinput oleh pengguna disanitasi secara otomatis oleh mesin rendering React (JSX) yang mencegah eksekusi skrip berbahaya (*Cross-Site Scripting*).

### 4. Pengamanan Aset Media (Cloudinary Signed Uploads)
* **Token Tanda Tangan Digital:** Proses unggah gambar tidak menggunakan *unsigned preset* yang rawan dieksploitasi publik untuk menimbun file sampah. HgzPort mengimplementasikan API penandatanganan digital (`/api/upload/signature`) berbasis HMAC-SHA256 untuk memverifikasi legalitas unggahan gambar secara aman sebelum dikirim ke server Cloudinary.

### 5. Audit Trail & Mitigasi Denial of Service (DoS)
* **Aktivitas Log Real-time:** Dasbor Admin mencatat seluruh aktivitas CRUD penting dari pengguna. Log ini bertindak sebagai *audit trail* forensik jika terjadi keanehan sistem.
* **Auto-Archive Database (DB Bloat Prevention):** Sistem secara berkala menyaring log aktivitas admin. Ketika data log melampaui batas (threshold >15), log lama (>50 entri) otomatis diekspor menjadi format terkompresi JSON dan diarsipkan ke tabel backup. Hal ini mencegah serangan pemenuhan kapasitas database (*Database Flooding / Storage Exhaustion*).

### 6. Keamanan Transmisi Data & Sesi
* **Enforce HTTPS/SSL:** Seluruh komunikasi data dilindungi oleh enkripsi Transport Layer Security (TLS/HTTPS) bawaan Vercel untuk menangkal serangan pembajakan data di tengah jalan (*Man-in-the-Middle*).
* **HttpOnly & Secure Cookies:** Token autentikasi NextAuth disimpan dalam *Secure Cookies* dengan flag `HttpOnly` (tidak dapat dibaca oleh skrip JavaScript klien untuk mencegah pencurian token lewat XSS) dan `SameSite=Lax` (melindungi dari serangan *Cross-Site Request Forgery - CSRF*).

---

## 🚀 Fitur Utama
1. **Dynamic Builder:** Manajemen konten portofolio interaktif secara real-time.
2. **AI Resume Studio:** Ekspor instan seluruh data portofolio menjadi berkas CV PDF profesional.
3. **Pusat Pesan Publik:** Pengunjung dapat mengirim pesan langsung ke pemilik portofolio yang terintegrasi dengan notifikasi email Resend.
4. **Smart Feedback System:** Pop-up rating 5-bintang persisten yang menghormati kenyamanan pengguna (tidak muncul kembali jika dibatalkan/diisi).
5. **Admin Master Center:** Manajemen akun pengguna (aktivasi/penangguhan), monitoring umpan balik, dan log aktivitas real-time.
