#!/usr/bin/env node

// Script untuk memperbaiki akses lokal OISHINE!
const fs = require('fs');
const path = require('path');

console.log('🔧 Memperbaiki akses lokal OISHINE!...\n');

// 1. Cek apakah server berjalan
console.log('1. Memeriksa status server...');
const { spawn } = require('child_process');

// Test koneksi ke server
async function testConnection(host, port) {
  return new Promise((resolve) => {
    const net = require('net');
    const socket = new net.Socket();
    
    socket.setTimeout(3000);
    
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', () => {
      resolve(false);
    });
    
    socket.connect(port, host);
  });
}

async function main() {
  const hosts = ['localhost', '127.0.0.1', '0.0.0.0'];
  const port = 3000;
  
  console.log(`\n2. Menguji koneksi ke port ${port}:`);
  
  for (const host of hosts) {
    const connected = await testConnection(host, port);
    console.log(`   ${host}:${port} - ${connected ? '✅ Terhubung' : '❌ Tidak terhubung'}`);
  }
  
  console.log('\n3. Membuat file test...');
  
  // Buat file test HTML
  const testHtml = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Login OISHINE!</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-b from-red-50 to-pink-50 min-h-screen">
    <div class="container mx-auto px-4 py-8 max-w-md">
        <div class="bg-white rounded-2xl shadow-xl p-8">
            <!-- Logo -->
            <div class="text-center mb-8">
                <div class="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden bg-red-100">
                    <img src="/oishine-logo-new.png" alt="OISHINE!" class="w-full h-full object-cover" />
                </div>
                <h1 class="text-3xl font-bold text-red-600">OISHINE!</h1>
                <p class="text-gray-600 text-sm">おいしいね！</p>
            </div>

            <!-- Form Login -->
            <form id="loginForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" id="email" value="admin@oishine.com" required
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input type="password" id="password" value="admin123" required
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                </div>
                <button type="submit" id="loginBtn"
                        class="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors">
                    Login
                </button>
            </form>

            <!-- Result -->
            <div id="result" class="mt-6 hidden">
                <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 class="font-semibold text-green-800 mb-2">✅ Login Berhasil!</h3>
                    <div id="userInfo" class="text-sm text-green-700"></div>
                    <button onclick="openDashboard()" 
                            class="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors">
                        Buka Dashboard Admin
                    </button>
                </div>
            </div>

            <!-- Error -->
            <div id="error" class="mt-6 hidden">
                <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 class="font-semibold text-red-800 mb-2">❌ Login Gagal</h3>
                    <div id="errorMessage" class="text-sm text-red-700"></div>
                </div>
            </div>

            <!-- Debug Info -->
            <div class="mt-6 text-xs text-gray-500">
                <div>Server URLs:</div>
                <div>• <a href="http://localhost:3000" target="_blank" class="text-blue-600 hover:underline">http://localhost:3000</a></div>
                <div>• <a href="http://127.0.0.1:3000" target="_blank" class="text-blue-600 hover:underline">http://127.0.0.1:3000</a></div>
                <div>• <a href="http://localhost:3000/admin/login" target="_blank" class="text-blue-600 hover:underline">Admin Login</a></div>
            </div>
        </div>
    </div>

    <script>
        const loginForm = document.getElementById('loginForm');
        const loginBtn = document.getElementById('loginBtn');
        const result = document.getElementById('result');
        const error = document.getElementById('error');
        const userInfo = document.getElementById('userInfo');
        const errorMessage = document.getElementById('errorMessage');

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            loginBtn.disabled = true;
            loginBtn.textContent = '🔄 Login...';
            result.classList.add('hidden');
            error.classList.add('hidden');
            
            try {
                // Coba localhost dulu
                let response = await fetch('http://localhost:3000/api/admin/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password })
                });
                
                // Jika gagal, coba 127.0.0.1
                if (!response.ok) {
                    response = await fetch('http://127.0.0.1:3000/api/admin/auth/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ email, password })
                    });
                }
                
                const data = await response.json();
                
                if (response.ok) {
                    // Simpan token
                    localStorage.setItem('admin-token', data.token);
                    
                    // Tampilkan sukses
                    userInfo.innerHTML = \`
                        <div><strong>Nama:</strong> \${data.user.name}</div>
                        <div><strong>Email:</strong> \${data.user.email}</div>
                        <div><strong>Role:</strong> \${data.user.role}</div>
                        <div><strong>Token:</strong> \${data.token.substring(0, 30)}...</div>
                    \`;
                    result.classList.remove('hidden');
                } else {
                    throw new Error(data.message || 'Login gagal');
                }
            } catch (err) {
                errorMessage.textContent = err.message;
                error.classList.remove('hidden');
            } finally {
                loginBtn.disabled = false;
                loginBtn.textContent = 'Login';
            }
        });

        function openDashboard() {
            window.open('http://localhost:3000/admin/dashboard', '_blank');
        }

        // Auto-test koneksi saat halaman dimuat
        window.addEventListener('load', async () => {
            try {
                const response = await fetch('http://localhost:3000/api/test');
                console.log('✅ Server terhubung');
            } catch (err) {
                console.log('❌ Server tidak terhubung:', err.message);
            }
        });
    </script>
</body>
</html>`;

  fs.writeFileSync(path.join(__dirname, 'test-login.html'), testHtml);
  console.log('✅ File test-login.html dibuat');
  
  // Buat API endpoint test
  const testApiPath = path.join(__dirname, 'src/app/api/test/route.ts');
  const testApiDir = path.dirname(testApiPath);
  
  if (!fs.existsSync(testApiDir)) {
    fs.mkdirSync(testApiDir, { recursive: true });
  }
  
  const testApi = `import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ 
      status: 'ok', 
      message: 'API berjalan dengan baik!',
      timestamp: new Date().toISOString(),
      host: request.headers.get('host'),
      userAgent: request.headers.get('user-agent')
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'API Error', message: error.message },
      { status: 500 }
    );
  }
}`;

  fs.writeFileSync(testApiPath, testApi);
  console.log('✅ API endpoint /api/test dibuat');
  
  console.log('\n4. Instruksi:');
  console.log('   • Buka file test-login.html di browser');
  console.log('   • Gunakan kredensial: admin@oishine.com / admin123');
  console.log('   • Test login dengan kedua URL (localhost & 127.0.0.1)');
  console.log('   • Jika berhasil, buka dashboard admin');
  
  console.log('\n5. URL Test:');
  console.log(`   • file://${__dirname}/test-login.html`);
  console.log('   • http://localhost:3000/api/test');
  console.log('   • http://127.0.0.1:3000/api/test');
  
  console.log('\n✅ Selesai! Silakan test login menggunakan file yang dibuat.');
}

main().catch(console.error);