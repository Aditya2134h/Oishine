# 🍱 OISHINE! - Masakan Jepang Autentik (おいしいね！)

Website restoran Jepang modern yang menampilkan kelezatan masakan autentik dengan sentuhan kontemporer. OISHINE! (おいしいね！) yang berarti "Enak sekali!" menghadirkan pengalaman kuliner yang tak terlupakan dengan menu pilihan seperti Mochi, Dorayaki, Onigiri, Gyoza, dan minuman segar.

## ✨ Fitur Utama

### 🍣 Menu Lengkap
- **Makanan** - Mochi, Dorayaki, Onigiri, Gyoza
- **Minuman** - Iced Matcha Latte, Yuzu Tea
- **Arti Nama** - OISHINE! (おいしいね！) = "Enak sekali!" dalam bahasa Jepang

### 🛒 E-Commerce Features
- **Keranjang Belanja** - Sistem cart yang interaktif
- **Checkout** - Proses pemesanan yang mudah
- **Filter & Pencarian** - Cari menu favorit Anda
- **Kategori** - Kelompok menu berdasarkan jenis
- **Metode Pembayaran** - QRIS, Transfer Bank, E-Wallet, COD

### 💳 QRIS Payment System
- **QR Code Display** - Tampilan QR Code yang jelas untuk scanning
- **Timer Countdown** - 10 menit countdown dengan warning otomatis
- **Payment Instructions** - Panduan langkah demi langkah
- **Real-time Status** - Tracking status pembayaran
- **Multi-platform Support** - Kompatibel dengan semua e-wallet dan mobile banking

### 🎨 Desain Modern
- **Responsive Design** - Tampilan sempurna di semua perangkat
- **Animasi Halus** - Interaksi yang menarik dengan Framer Motion
- **Dark/Light Mode** - Tema yang dapat disesuaikan
- **Logo OISHINE!** - Branding yang konsisten dengan tulisan Jepang (おいしいね！)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup database
npm run db:generate
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) untuk melihat website OISHINE! (おいしいね！) berjalan.

## 🛠️ Teknologi yang Digunakan

- **⚡ Next.js 15** - React framework dengan App Router
- **📘 TypeScript 5** - Type-safe development
- **🎨 Tailwind CSS 4** - Utility-first CSS framework

### 🧩 UI & UX
- **🎯 Lucide React** - Icon library yang konsisten
- **🌈 Framer Motion** - Animasi yang smooth dan menarik
- **🎨 Next Themes** - Dark/light mode support

### 📋 Forms & State Management
- **🎣 React Hook Form** - Forms dengan validasi yang mudah
- **✅ Zod** - Schema validation
- **🐻 Zustand** - State management yang simple
- **🔄 TanStack Query** - Data fetching dan synchronization

### 🗄️ Database & Backend
- **🗄️ Prisma** - Modern database ORM
- **🔐 NextAuth.js** - Authentication solution
- **🌐 Socket.IO** - Real-time communication

## 📁 Struktur Project

```
src/
├── app/                 # Next.js App Router pages
│   ├── page.tsx        # Halaman utama OISHINE!
│   └── layout.tsx      # Root layout dengan metadata
├── components/          # Reusable React components
│   └── ui/             # shadcn/ui components
├── lib/                # Utility functions
├── prisma/             # Database schema & seed
└── public/             # Static assets (logo OISHINE!)
```

## 🌟 Fitur Spesial

### 🛒 Shopping Cart System
- Add/remove items dengan animasi smooth
- Real-time price calculation
- Quantity adjustment
- Checkout form dengan validation

### 🔍 Advanced Search & Filter
- Search berdasarkan nama atau deskripsi
- Filter berdasarkan kategori
- Real-time result update

### 📱 Mobile-First Design
- Responsive layout untuk semua device
- Touch-friendly interactions
- Optimized performance

### 🎨 Animasi & Interaksi
- Hero section dengan animasi menarik
- Product cards dengan hover effects
- Smooth page transitions
- Loading states yang elegan

## 🍽️ Menu Highlights

### Makanan Favorites
- **Mochi** - Rp 6.000
- **Dorayaki** - Rp 7.000  
- **Onigiri** - Rp 13.000
- **Gyoza** - Rp 8.000

### Minuman Segar
- **Iced Matcha Latte** - Rp 7.000
- **Yuzu Tea** - Rp 7.000

---

Made with ❤️ for OISHINE! Restaurant (おいしいね！)  
🍱 Masakan Jepang Autentik dengan Citarasa Terbaik - "Enak Sekali!"
