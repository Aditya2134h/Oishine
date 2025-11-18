# Panduan Deployment di Debian CLI dengan Docker

## 📋 Prasyarat

### 1. Install Docker di Debian
```bash
# Update package index
sudo apt-get update

# Install packages to allow apt to use a repository over HTTPS
sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Set up the stable repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add your user to the docker group (no need for sudo)
sudo usermod -aG docker $USER

# Reboot or logout and login again to apply group changes
sudo reboot
```

### 2. Verifikasi Installasi
```bash
# Cek Docker
docker --version

# Cek Docker Compose
docker compose version

# Test Docker (optional)
docker run hello-world
```

## 🚀 Cara Menjalankan Aplikasi

### Opsi 1: Menggunakan Deployment Script (Recommended)

```bash
# 1. Download atau clone project
cd /path/to/your/project

# 2. Buat deployment script executable
chmod +x deploy.sh

# 3. Jalankan di mode development
./deploy.sh dev

# ATAU jalankan di mode production
./deploy.sh prod
```

### Opsi 2: Manual dengan Docker Compose

```bash
# 1. Build dan start di development mode
docker-compose up -d --build

# 2. Untuk production dengan nginx
docker-compose --profile production up -d --build

# 3. Setup database (hanya pertama kali)
docker-compose exec app npx prisma db push
```

## 📁 Struktur Direktori

Setelah deployment, struktur direktori akan terlihat seperti ini:
```
/home/z/my-project/
├── Dockerfile
├── docker-compose.yml
├── deploy.sh
├── db/                    # Database files
├── uploads/               # File uploads
└── ... (project files)
```

## 🔧 Perintah Penting

### Management Commands
```bash
# Lihat status container
docker-compose ps

# Lihat logs
docker-compose logs -f

# Stop aplikasi
./deploy.sh stop
# atau
docker-compose down

# Restart aplikasi
docker-compose restart

# Update aplikasi
git pull
docker-compose up -d --build
```

### Database Commands
```bash
# Setup database
./deploy.sh setup-db

# Reset database
docker-compose exec app npx prisma db push --force-reset

# View database
docker-compose exec app npx prisma studio
```

## 🌐 Akses Aplikasi

### Development Mode
- **URL**: http://localhost:3000
- **Direct access**: Port 3000

### Production Mode
- **URL**: http://localhost
- **Behind nginx**: Port 80
- **WebSocket**: Supported for Socket.IO

## 🔍 Troubleshooting

### Common Issues

1. **Port sudah digunakan**
   ```bash
   # Cek port yang digunakan
   sudo netstat -tulpn | grep :3000
   
   # Kill process yang menggunakan port
   sudo kill -9 <PID>
   ```

2. **Permission denied**
   ```bash
   # Fix permission untuk docker
   sudo usermod -aG docker $USER
   # Logout dan login kembali
   ```

3. **Database tidak ter-create**
   ```bash
   # Manual setup database
   docker-compose exec app npx prisma db push
   ```

4. **Container tidak start**
   ```bash
   # Lihat logs untuk error
   docker-compose logs app
   
   # Rebuild container
   docker-compose down
   docker-compose up -d --build
   ```

### Monitoring

```bash
# Lihat resource usage
docker stats

# Lihat disk usage
docker system df

# Cleanup unused images
docker system prune -a
```

## 📱 Akses dari Device Lain

Untuk mengakses aplikasi dari device lain di network yang sama:

1. **Cari IP address server**:
   ```bash
   ip addr show
   # atau
   hostname -I
   ```

2. **Akses via browser**:
   - Development: http://[IP_SERVER]:3000
   - Production: http://[IP_SERVER]

3. **Jika tidak bisa diakses**, cek firewall:
   ```bash
   # Allow port 3000 (development)
   sudo ufw allow 3000
   
   # Allow port 80 (production)
   sudo ufw allow 80
   ```

## 🔄 Auto-start on Boot

Untuk membuat aplikasi auto-start saat boot:

```bash
# Buat systemd service
sudo nano /etc/systemd/system/oishine.service
```

Isi dengan:
```ini
[Unit]
Description=Oishine App
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/path/to/your/project
ExecStart=/usr/bin/docker-compose --profile production up -d
ExecStop=/usr/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

Enable service:
```bash
sudo systemctl enable oishine.service
sudo systemctl start oishine.service
```

## 📊 Performance Optimization

### Production Tips
1. Gunakan mode production untuk performance terbaik
2. Setup reverse proxy dengan nginx
3. Enable HTTPS dengan Let's Encrypt
4. Monitor resource usage dengan `docker stats`

### Security Tips
1. Jangan expose port 3000 di production
2. Gunakan firewall yang proper
3. Regular backup database folder
4. Update Docker images regularly

## 🆘 Bantuan

Jika ada masalah:
1. Cek logs: `./deploy.sh logs`
2. Cek status: `docker-compose ps`
3. Restart: `./deploy.sh stop && ./deploy.sh prod`
4. Rebuild: `docker-compose down && docker-compose up -d --build`