# 🏆 SOQ.COMM PADEL LEAGUE - Setup Supabase

Aplikasi telah berhasil dimigrasi ke Supabase! Data sekarang tersinkronisasi di semua device.

## 📋 Langkah Setup Database

### 1. Login ke Supabase Dashboard
- Buka: https://supabase.com
- Login dengan akun Anda
- Pilih project: **PADEL LEAGUE**

### 2. Jalankan SQL Schema
1. Klik menu **SQL Editor** di sidebar kiri
2. Klik **New Query**
3. Copy semua isi file `supabase-schema.sql`
4. Paste ke SQL Editor
5. Klik **Run** (atau tekan Ctrl+Enter)

SQL ini akan membuat:
- ✅ Tabel: leagues, teams, players, pairs, matchdays, matches, pair_match_results, admin_users, audit_logs
- ✅ Indexes untuk performa
- ✅ Row Level Security (RLS) policies
- ✅ Default data (8 tim, 1 admin)
- ✅ Auto-update triggers

### 3. Verifikasi Database
Setelah SQL dijalankan, cek di menu **Table Editor**:
- Harus ada 9 tabel
- Tabel `teams` harus punya 8 data default
- Tabel `admin_users` harus punya 1 data (Super Admin)

### 4. Deploy Ulang Aplikasi
```bash
# Build aplikasi
npm run build

# Deploy ke Vercel/Netlify
# Atau push ke GitHub untuk auto-deploy
```

## 🔐 Kredensial Default

**Admin Login:**
- Email: `admin@soqcomm.com`
- Password: `padel2025`

**PENTING:** Ganti password ini setelah login pertama!

## 🎯 Cara Kerja Aplikasi Sekarang

### Sebelum (localStorage):
```
Device A → localStorage A (data lokal)
Device B → localStorage B (data lokal)
❌ Data tidak sync
```

### Sekarang (Supabase):
```
Device A → Supabase Cloud DB ← Device B
           (data tersinkron real-time)
✅ Data sync di semua device
```

## 📱 Testing Multi-Device

1. Buka aplikasi di laptop: `https://your-app.vercel.app`
2. Buka aplikasi di HP: `https://your-app.vercel.app`
3. Login sebagai admin di laptop
4. Tambah tim baru
5. **Cek di HP** → Tim baru harus muncul otomatis!

## 🔧 Troubleshooting

### Data tidak muncul?
1. Cek Supabase Dashboard → Table Editor
2. Pastikan tabel sudah terisi data
3. Refresh halaman aplikasi (Ctrl+F5)

### Error saat login?
1. Cek tabel `admin_users` di Supabase
2. Pastikan ada user dengan email `admin@soqcomm.com`
3. Password harus `padel2025` (base64: `cGFkZWwyMDI1`)

### Upload logo tidak muncul?
1. Logo disimpan sebagai base64 di database
2. Cek kolom `logo_url` di tabel `teams` atau `leagues`
3. Pastikan tidak ada error di browser console (F12)

## 🚀 Fitur yang Sudah Terintegrasi

✅ **Data tersinkron di semua device**
✅ **Real-time updates**
✅ **Upload logo tim & liga**
✅ **Download klasemen PNG**
✅ **Sistem klasemen total poin**
✅ **Manajemen tim, pemain, user**
✅ **Generate jadwal otomatis**
✅ **Input skor pertandingan**
✅ **Audit log**
✅ **Reset liga**

## 📊 Struktur Database

### Tabel Utama:
- `leagues` - Data liga (nama, logo, season, settings)
- `teams` - Data tim (nama, logo, kapten)
- `players` - Data pemain (nama, foto, tim)
- `pairs` - Data pasangan (2 pemain)
- `matchdays` - Data matchday (tanggal, status)
- `matches` - Data pertandingan (tim A vs B, court, waktu)
- `pair_match_results` - Hasil setiap partai pasangan
- `admin_users` - User admin (email, password, role)
- `audit_logs` - Log aktivitas admin

### Relasi:
```
leagues 1──∞ matchdays 1──∞ matches 1──∞ pair_match_results
teams 1──∞ players
teams 1──∞ pairs 2──players
teams 1──∞ matches
```

## 🔒 Keamanan

### Saat Ini (Development):
- RLS enabled tapi open untuk demo
- Password di-hash dengan base64 (bukan production-ready)
- Anon key di-embed di frontend

### Untuk Production:
1. **Setup Supabase Auth** untuk login yang aman
2. **Update RLS policies** untuk restrict access
3. **Gunakan environment variables** untuk API keys
4. **Enable 2FA** untuk admin accounts

## 📝 Next Steps

1. ✅ Setup database (jalankan SQL)
2. ✅ Deploy ulang aplikasi
3. ✅ Test multi-device sync
4. ⏳ Ganti password admin default
5. ⏳ Setup custom domain (optional)
6. ⏳ Configure Supabase Auth (optional untuk production)

## 💡 Tips

### Backup Data:
- Supabase otomatis backup harian (free tier)
- Bisa export manual via Table Editor → Export → CSV

### Restore Data:
- Gunakan Supabase Dashboard → Database → Backups
- Atau import dari CSV backup

### Monitoring:
- Supabase Dashboard → Logs untuk lihat API calls
- Database → Performance untuk query performance

## 🆘 Butuh Bantuan?

- Supabase Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com
- Email: support@supabase.com

---

**Selamat! Aplikasi Anda sekarang cloud-based dan tersinkron di semua device!** 🎉
