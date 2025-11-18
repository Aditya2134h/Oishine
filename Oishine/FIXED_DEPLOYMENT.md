# 🚀 FIXED: Deployment di Debian CLI (Docker Compose Issue Solved)

## 🔧 Masalah yang Diperbaiki

Script deployment sudah diperbaiki untuk mendukung:
- ✅ Docker Compose v2 (`docker compose`) - Debian terbaru
- ✅ Docker Compose v1 (`docker-compose`) - Debian lama
- ✅ Auto-detection command yang tepat

## 📋 Langkah 1: Pastikan Docker Sudah Benar

```bash
# Cek Docker
docker --version

# Cek Docker Compose (yang baru)
docker compose version

# ATAU cek yang lama
docker-compose --version
```

## 🚀 Langkah 2: Jalankan Aplikasi (FIXED)

```bash
# Masuk ke folder project
cd /home/adit/Oishine

# Buat script executable
chmod +x deploy.sh

# Test script (sekarang akan auto-detect docker compose)
./deploy.sh dev
```

## 🔍 Jika Masih Ada Masalah

### Opsi 1: Manual Command (Jika script masih error)

```bash
# Development mode
docker compose up -d --build app

# Production mode  
docker compose --profile production up -d --build

# Setup database
docker compose exec app npx prisma db push

# Lihat logs
docker compose logs -f

# Stop
docker compose down
```

### Opsi 2: Install Docker Compose yang Lama (Jika perlu)

```bash
# Remove yang baru
sudo apt-get remove docker-compose-plugin

# Install yang lama
sudo apt-get install docker-compose

# Test
docker-compose --version
```

## 🌐 Akses Aplikasi

Setelah berhasil:
- **Development**: http://localhost:3000
- **Production**: http://localhost
- **Admin**: http://localhost/admin

## 📱 Akses dari HP/Laptop

```bash
# Cari IP server
ip addr show | grep inet

# Akses dari device lain
http://[IP_SERVER]:3000 (dev)
http://[IP_SERVER] (prod)
```

## 🔧 Troubleshooting Lengkap

### 1. Permission Docker
```bash
# Tambah user ke docker group
sudo usermod -aG docker $USER

# Logout dan login kembali
exit
# login lagi
```

### 2. Port Conflict
```bash
# Cek port 3000
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>

# Atau ganti port di docker-compose.yml
```

### 3. Firewall
```bash
# Allow ports
sudo ufw allow 3000
sudo ufw allow 80
sudo ufw reload
```

### 4. Clean Docker (Jika ada masalah)
```bash
# Stop semua container
docker compose down

# Remove images
docker system prune -a

# Rebuild
docker compose up -d --build
```

## 📊 Monitoring

```bash
# Cek status container
docker compose ps

# Lihat resource usage
docker stats

# Lihat logs real-time
docker compose logs -f app
```

## 🎯 Quick Commands

```bash
# Start development
./deploy.sh dev

# Start production  
./deploy.sh prod

# Stop
./deploy.sh stop

# Logs
./deploy.sh logs

# Setup database
./deploy.sh setup-db
```

## 🆘 Emergency Commands

```bash
# Force stop semua
docker compose down --remove-orphans

# Rebuild dari awal
docker compose down
docker compose build --no-cache
docker compose up -d

# Reset database
docker compose exec app npx prisma db push --force-reset
```

## ✅ Test Koneksi

```bash
# Test dari server
curl http://localhost:3000

# Test dari luar (ganti IP)
curl http://[IP_SERVER]:3000
```

---

**Script sekarang sudah auto-detect Docker Compose command yang tepat!** 🎉

Jika masih ada masalah, gunakan manual command di atas.