# Mikrotik Bridge Sakti 🚀
Tool jembatan (Sidecar Agent) untuk menghubungkan Dashboard Web dengan API Mikrotik dan sistem operasi (Windows/Linux/Android-Termux).

Didesain khusus untuk teknisi lapangan CCTV & Jaringan guna mempermudah monitoring hotspot dan manajemen IP Bindings (Auto-Bypass) langsung dari laptop atau handphone.

## ✨ Fitur Utama
- **Multi-Platform Support:** Berjalan lancar di Windows (CMD/PowerShell) dan Android (Termux).
- **Auto-Detection Network:** Mendeteksi SSID, Local IP, dan Gateway teknisi secara otomatis.
- **Mikrotik API Bridge:** Bertindak sebagai perantara aman antara browser dan Mikrotik via Port 8728.
- **Terminal Emulator:** Support perintah `ping` langsung dari dashboard web untuk connectivity test.
- **One-Click Bypass:** Mempercepat proses penambahan IP Bindings (Bypassed) ke Mikrotik.

## 🛠️ Persyaratan
- [Node.js](https://nodejs.org/) (Windows) atau `pkg install nodejs` (Termux).
- Akses ke Mikrotik dengan API service aktif (`IP -> Services -> api` di Winbox).

## 🚀 Cara Instalasi

### 1. Di Windows
1. Clone repository ini:
   ```bash
   git clone https://github.com/myruldev/mikrotik-bridge.git
   cd mikrotik-bridge
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Jalankan bridge:
   ```bash
   node bridge.js
   ```

### 2. Di Android (Termux)
1. Buka Termux dan siapkan environment:
   ```bash
   pkg update && pkg upgrade
   pkg install git nodejs-lts
   ```
2. Clone repository:
   ```bash
   git clone https://github.com/myruldev/mikrotik-bridge.git
   cd mikrotik-bridge
   ```
3. Install & Jalankan:
   ```bash
   npm install
   node bridge.js
   ```

## 📂 Struktur API (Endpoints)
- `GET /api/status`: Mendapatkan info hardware & jaringan teknisi.
- `POST /api/mikrotik/fetch`: Menarik data active users & bindings dari Mikrotik.
- `POST /api/mikrotik/bypass`: Menambahkan device ke IP Bindings.
- `GET /api/ping?host=IP`: Melakukan connectivity test.

## 📝 Catatan Sampingan
Aplikasi ini berjalan di `http://localhost:3001`. Pastikan port tersebut tidak terpakai oleh aplikasi lain. Jika ingin diakses dari luar jaringan lokal, gunakan **Cloudflare Tunnel**.

---
*Created with 🔥 by Antigravity for myruldev.*
