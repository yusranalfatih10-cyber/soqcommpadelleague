# 🔧 Troubleshooting: Data Tidak Tersimpan di Supabase

## 🐛 Masalah yang Diperbaiki

**Issue:** Saat menambahkan data baru (user, tim, pemain, dll), data tidak tersimpan di Supabase meskipun aplikasi sudah di-publish ulang.

**Root Cause:** 
1. Method async di store tidak di-await dengan benar di komponen
2. Error handling tidak adequate - error tidak terlihat di UI
3. Tidak ada logging untuk debugging

**Status:** ✅ **SUDAH DIPERBAIKI**

---

## ✅ Perbaikan yang Dilakukan

### 1. **Store.ts - Error Handling & Logging**
Semua method async sekarang memiliki:
- ✅ Console logging untuk debugging (🔵 = proses, ✅ = sukses, ❌ = error)
- ✅ Try-catch blocks
- ✅ Error thrown ke komponen

**Method yang diperbaiki:**
- `saveLeague()` - Simpan pengaturan liga
- `addTeam()` - Tambah tim baru
- `updateTeam()` - Update data tim
- `addPlayer()` - Tambah pemain baru
- `updatePlayer()` - Update data pemain
- `addUser()` - Tambah user baru
- `updateUser()` - Update data user
- `deleteUser()` - Hapus user
- `deleteMatch()` - Hapus jadwal pertandingan

### 2. **AdminSettings.tsx - Async/Await**
Semua handler sekarang:
- ✅ Menggunakan `async/await`
- ✅ Memiliki try-catch blocks
- ✅ Menampilkan error message ke user
- ✅ Menunggu hasil sebelum update UI

**Handler yang diperbaiki:**
- `handleSave()` di GeneralSettings
- `handleSave()` di TeamsManagement
- `handleToggleActive()` di TeamsManagement
- `handleSave()` di PlayersManagement
- `handleToggleActive()` di PlayersManagement
- `handleSave()` di UsersManagement
- `handleDelete()` di UsersManagement
- `handleSave()` di StandingsSettings
- `handleDelete()` di ScheduleManagement

---

## 🧪 Cara Testing

### **Step 1: Buka Browser Console**
1. Buka aplikasi di browser
2. Tekan **F12** atau **Ctrl+Shift+I** (Windows) / **Cmd+Option+I** (Mac)
3. Klik tab **Console**

### **Step 2: Test Tambah User**
1. Login sebagai admin
2. Buka menu **Pengaturan** → **Manajemen User**
3. Klik **Tambah User**
4. Isi form dan klik **Simpan**

### **Step 3: Cek Console Logs**
Anda harus melihat log seperti ini:

```
🔵 Adding user to Supabase: {name: "Test User", email: "test@example.com", ...}
✅ User added successfully: {id: "xxx", name: "Test User", ...}
```

Jika ada error, Anda akan melihat:
```
🔵 Adding user to Supabase: {name: "Test User", ...}
❌ Error adding user: {message: "...", code: "...", ...}
❌ Exception in addUser: Error: ...
```

### **Step 4: Cek Supabase Dashboard**
1. Buka Supabase Dashboard
2. Klik **Table Editor**
3. Klik tabel **admin_users**
4. User baru harus muncul di daftar

---

## 🔍 Debugging Guide

### **Jika Data Tidak Muncul di Supabase**

#### **Check 1: Console Logs**
Buka browser console (F12) dan lihat apakah ada error:
- ✅ Jika ada log `✅ User added successfully` → Data berhasil disimpan
- ❌ Jika ada log `❌ Error adding user` → Ada masalah dengan Supabase

#### **Check 2: Supabase Connection**
Pastikan koneksi ke Supabase berhasil:
1. Buka browser console
2. Ketik: `console.log(window.supabase)` 
3. Harus ada object Supabase client

#### **Check 3: RLS Policies**
Pastikan RLS policies sudah di-setup:
1. Buka Supabase Dashboard → **Authentication** → **Policies**
2. Cek tabel `admin_users`
3. Harus ada policy "Enable all access" atau similar

#### **Check 4: API Keys**
Pastikan API keys benar di `src/lib/supabase.ts`:
```typescript
const supabaseUrl = 'https://jttsyvioiqztfcurwvww.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

---

## 🛠️ Common Issues & Solutions

### **Issue 1: "Failed to fetch" Error**

**Penyebab:** Koneksi ke Supabase gagal

**Solusi:**
1. Cek internet connection
2. Cek Supabase URL di `src/lib/supabase.ts`
3. Cek apakah project Supabase masih aktif
4. Cek firewall/antivirus memblokir koneksi

### **Issue 2: "New row violates row-level security policy"**

**Penyebab:** RLS policy memblokir insert

**Solusi:**
1. Buka Supabase Dashboard → **Authentication** → **Policies**
2. Klik tabel yang bermasalah (misal: `admin_users`)
3. Hapus policy yang restrictive
4. Tambahkan policy baru:
```sql
CREATE POLICY "Enable all access" ON admin_users
FOR ALL USING (true) WITH CHECK (true);
```

### **Issue 3: Data Tersimpan Tapi Tidak Muncul di UI**

**Penyebab:** Cache tidak ter-update

**Solusi:**
1. Hard refresh browser (Ctrl+F5 / Cmd+Shift+R)
2. Cek console logs apakah ada error
3. Pastikan `notify()` dipanggil setelah update data

### **Issue 4: "Column not found" Error**

**Penyebab:** Schema database tidak match dengan kode

**Solusi:**
1. Cek tabel di Supabase Table Editor
2. Pastikan semua kolom ada:
   - `admin_users`: id, name, email, password_hash, role, is_active, created_at, updated_at
   - `teams`: id, name, logo_url, captain, description, is_active, created_at, updated_at
   - `players`: id, team_id, name, photo_url, is_active, created_at
3. Jika ada kolom yang hilang, jalankan ALTER TABLE:
```sql
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
```

### **Issue 5: Password Tidak Bisa Login**

**Penyebab:** Password di-hash dengan base64, bukan bcrypt

**Solusi:**
Password default: `padel2025` (base64: `cGFkZWwyMDI1`)

Jika ingin ganti password manual:
```sql
UPDATE admin_users 
SET password_hash = encode(convert_to('newpassword', 'UTF8'), 'base64')
WHERE email = 'admin@soqcomm.com';
```

---

## 📊 Verification Checklist

Setelah deploy ulang, pastikan:

- [ ] **Build berhasil** tanpa error
- [ ] **Aplikasi bisa diakses** di URL production
- [ ] **Console logs muncul** saat tambah data
- [ ] **Data tersimpan** di Supabase Table Editor
- [ ] **Data muncul** di UI setelah refresh
- [ ] **Multi-device sync** berfungsi (data muncul di device lain)
- [ ] **Error message** muncul jika ada masalah

---

## 🎯 Testing Scenarios

### **Test 1: Tambah User**
1. Login sebagai admin
2. Buka Pengaturan → Manajemen User
3. Klik "Tambah User"
4. Isi: Nama="Test User", Email="test@test.com", Password="test123", Role="operator"
5. Klik "Simpan"
6. **Expected:** 
   - Console: `✅ User added successfully`
   - Supabase: User baru muncul di tabel `admin_users`
   - UI: User baru muncul di daftar

### **Test 2: Tambah Tim**
1. Login sebagai admin
2. Buka Pengaturan → Manajemen Tim
3. Klik "Tambah Tim"
4. Isi: Nama="Test Team", Kapten="Test Captain"
5. Upload logo (optional)
6. Klik "Simpan"
7. **Expected:**
   - Console: `✅ Team added successfully`
   - Supabase: Tim baru muncul di tabel `teams`
   - UI: Tim baru muncul di daftar

### **Test 3: Multi-Device Sync**
1. Buka aplikasi di laptop dan HP
2. Login sebagai admin di laptop
3. Tambah tim baru di laptop
4. **Expected:** Tim baru muncul di HP dalam 1-2 detik

---

## 📞 Support

Jika masih ada masalah setelah perbaikan:

1. **Screenshot console logs** (F12 → Console tab)
2. **Screenshot Supabase Table Editor** (tabel yang bermasalah)
3. **Screenshot error message** di UI
4. Kirim ke developer untuk debugging

---

## 🔄 Rollback Plan

Jika perbaikan ini menyebabkan masalah baru:

1. Revert ke versi sebelumnya (gunakan Git)
2. Atau disable fitur yang bermasalah
3. Laporkan bug ke developer

---

**Last Updated:** 2025
**Status:** ✅ Fixed & Deployed
