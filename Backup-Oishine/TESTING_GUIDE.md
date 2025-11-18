# 🧪 Panduan Testing CRUD Admin OISHINE!

## ✅ **Status: SUDAH SIAP!**

Semua masalah telah diperbaiki:
- ✅ Halaman setup-admin: http://127.0.0.1:3000/setup-admin
- ✅ Halaman login: http://127.0.0.1:3000/admin/login  
- ✅ Admin user sudah dibuat
- ✅ Sample data sudah tersedia

---

## 🔑 **Login Credentials**

```
Email: admin@oishine.com
Password: admin123
```

---

## 📋 **Data Sample untuk Testing**

### 🍜 **Kategori**
- Mie
- Minuman  
- Snack

### 🛍️ **Produk**
1. **Mie Ayam Spesial** - Rp 25.000
2. **Mie Goreng OISHINE** - Rp 22.000
3. **Es Teh Manis** - Rp 8.000
4. **Kentang Goreng** - Rp 15.000

### 📦 **Pesanan Sample**
1. **Budi Santoso** - Status: PENDING - Total: Rp 33.000
2. **Siti Nurhaliza** - Status: CONFIRMED - Total: Rp 22.000  
3. **Ahmad Fadli** - Status: DELIVERING - Total: Rp 15.000

---

## 🧪 **Langkah Testing CRUD**

### 1. **Login ke Dashboard**
1. Buka: http://127.0.0.1:3000/admin/login
2. Masukkan email dan password
3. Klik "Masuk"
4. Seharusnya redirect ke dashboard

### 2. **Testing CRUD Produk**

#### ✅ **READ (Lihat Produk)**
1. Klik menu "Produk" di sidebar
2. Lihat daftar 4 produk yang sudah ada
3. Coba fitur pencarian (ketik "mie")
4. Coba filter kategori

#### ✅ **CREATE (Tambah Produk)**
1. Klik tombol "Tambah Produk"
2. Isi form:
   - Nama: "Bakso Special"
   - Deskripsi: "Bakso enak dengan kuah khas"
   - Harga: 20000
   - Kategori: "Mie"
   - Status: Tersedia
3. Klik "Simpan"
4. Produk baru harus muncul di daftar

#### ✅ **UPDATE (Edit Produk)**
1. Klik ikon edit pada produk "Es Teh Manis"
2. Ubah harga menjadi 10000
3. Ubah deskripsi
4. Klik "Update"
5. Perubahan harus tersimpan

#### ✅ **DELETE (Hapus Produk)**
1. Klik ikon hapus pada produk "Kentang Goreng"
2. Konfirmasi penghapusan
3. Produk harus hilang dari daftar

### 3. **Testing CRUD Pesanan**

#### ✅ **READ (Lihat Pesanan)**
1. Klik menu "Pesanan"
2. Lihat 3 pesanan sample
3. Klik pada pesanan untuk melihat detail
4. Lihat item pesanan dan info pelanggan

#### ✅ **UPDATE (Update Status)**
1. Pilih pesanan "Budi Santoso" (status PENDING)
2. Klik untuk update status
3. Ubah menjadi "CONFIRMED"
4. Status harus berubah di UI
5. Coba update ke "PREPARING" → "DELIVERING" → "COMPLETED"

### 4. **Testing Dashboard**
1. Klik menu "Dashboard"
2. Lihat statistik:
   - Total produk
   - Total pesanan
   - Pesanan terbaru
   - Grafik penjualan (jika ada)

---

## 🔍 **Troubleshooting**

### ❌ **Login Gagal**
- Pastikan email: `admin@oishine.com`
- Pastikan password: `admin123`
- Clear browser cache
- Coba incognito window

### ❌ **Halaman 404**
- Pastikan server running: http://127.0.0.1:3000
- Restart server: `npm run dev`
- Check console untuk error

### ❌ **Data Tidak Muncul**
- Refresh halaman
- Check browser console (F12)
- Pastikan tidak ada error di network tab

---

## 🧪 **Advanced Testing**

### **Security Testing**
1. Coba akses http://127.0.0.1:3000/admin/products tanpa login
2. Harus redirect ke login

### **Mobile Testing**
1. Buka di smartphone (pastikan same WiFi)
2. Gunakan IP: http://[YOUR-IP]:3000/admin/login
3. Test responsive design

### **API Testing**
```bash
# Test login API
curl -X POST http://127.0.0.1:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@oishine.com","password":"admin123"}'
```

---

## 📱 **Cara Akses dari HP**

1. **Find IP Anda:**
   ```bash
   ip addr show
   ```
2. **Akses dari HP:**
   ```
   http://192.168.x.x:3000/admin/login
   ```

---

## 🎯 **Expected Results**

Semua fitur harus berfungsi:
- ✅ Login/logout
- ✅ CRUD produk (create, read, update, delete)
- ✅ Update status pesanan
- ✅ Dashboard statistics
- ✅ Responsive design
- ✅ Security (redirect ke login)

---

## 🆘 **Jika Ada Masalah**

1. **Check server logs:** `tail -f dev.log`
2. **Restart server:** `npm run dev`
3. **Clear browser cache**
4. **Contact support** dengan detail error

Selamat testing! 🎉