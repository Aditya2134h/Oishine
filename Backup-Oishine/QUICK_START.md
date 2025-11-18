# 🚀 Quick Start - Deployment di Debian CLI

## 📋 Langkah 1: Install Docker (jika belum)

```bash
# Install Docker dengan satu command
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Reboot atau logout-login
sudo reboot
```

## 🚀 Langkah 2: Jalankan Aplikasi

```bash
# Masuk ke folder project
cd /path/to/project

# Buat script executable
chmod +x deploy.sh

# Jalankan di mode development
./deploy.sh dev

# ATAU production mode
./deploy.sh prod
```

## 🌐 Akses Aplikasi

- **Development**: http://localhost:3000
- **Production**: http://localhost

## 📱 Akses dari HP/Laptop Lain

1. Cari IP server: `ip addr show`
2. Akses: http://[IP_SERVER]:3000 (dev) atau http://[IP_SERVER] (prod)

## 🔧 Perintah Penting

```bash
# Stop aplikasi
./deploy.sh stop

# Lihat logs
./deploy.sh logs

# Restart
./deploy.sh stop && ./deploy.sh prod
```

## 🆘 Masalah?

1. **Port 3000 digunakan?** 
   ```bash
   sudo lsof -i :3000
   sudo kill -9 <PID>
   ```

2. **Tidak bisa akses dari luar?**
   ```bash
   sudo ufw allow 3000  # untuk development
   sudo ufw allow 80    # untuk production
   ```

3. **Error permission?**
   ```bash
   sudo usermod -aG docker $USER
   # logout dan login kembali
   ```

## 📊 Admin Access

- **URL**: http://localhost/admin
- **Default Admin**: 
  - Email: admin@oishine.com
  - Password: admin123

Selesai! 🎉