# 🔧 Cara Membuat Tabel MVP di Supabase

## ⚠️ Masalah: Aplikasi Tidak Tampil

Jika aplikasi tidak tampil (layar putih), kemungkinan besar karena tabel `mvps` belum dibuat di Supabase.

## ✅ Solusi: Jalankan SQL Berikut

### Langkah 1: Buka Supabase SQL Editor
1. Login ke https://supabase.com
2. Pilih project **PADEL LEAGUE**
3. Klik menu **SQL Editor** di sidebar kiri

### Langkah 2: Copy dan Jalankan SQL Ini

```sql
-- Buat tabel MVP
CREATE TABLE IF NOT EXISTS mvps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  matchday_id UUID REFERENCES matchdays(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  reason TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE mvps ENABLE ROW LEVEL SECURITY;

-- Buat policy untuk allow all access
CREATE POLICY "Enable all access" ON mvps FOR ALL USING (true) WITH CHECK (true);
```

### Langkah 3: Klik "Run" atau tekan Ctrl+Enter

### Langkah 4: Refresh Aplikasi
Setelah tabel dibuat, refresh aplikasi Anda. Aplikasi sekarang akan bisa load data dari Supabase.

---

## 🔄 Alternatif: Gunakan Fallback Data

Jika Anda tidak ingin membuat tabel MVP sekarang, aplikasi sudah memiliki **fallback data** yang akan otomatis digunakan jika Supabase gagal connect.

Fallback data termasuk:
- ✅ 8 tim default
- ✅ 1 admin user (admin@soqcomm.com / padel2025)
- ✅ League settings default

**Catatan:** Dengan fallback data, Anda tidak bisa menyimpan perubahan ke database. Semua perubahan akan hilang saat refresh.

---

## 📊 Verifikasi Tabel Sudah Dibuat

Setelah menjalankan SQL, verifikasi di Supabase Dashboard:

1. Klik menu **Table Editor**
2. Anda harus melihat tabel **mvps** di daftar
3. Klik tabel mvps untuk melihat strukturnya

---

## 🎯 Langkah Selanjutnya

Setelah tabel MVP dibuat:

1. **Deploy ulang aplikasi** ke Vercel/Netlify
2. **Test aplikasi** - seharusnya sudah tampil
3. **Login sebagai admin** (admin@soqcomm.com / padel2025)
4. **Tambah data** - tim, pemain, jadwal, dll
5. **Pilih MVP** - di menu Pengaturan → Player MVP

---

## 🐛 Troubleshooting

### Masalah: Aplikasi masih layar putih setelah buat tabel

**Solusi:**
1. Hard refresh browser (Ctrl+F5 atau Cmd+Shift+R)
2. Clear browser cache
3. Cek browser console (F12) untuk lihat error
4. Pastikan Supabase URL dan API Key benar di `src/lib/supabase.ts`

### Masalah: Error "relation mvps does not exist"

**Solusi:**
- Tabel mvps belum dibuat. Jalankan SQL di atas.

### Masalah: Error "permission denied for table mvps"

**Solusi:**
- RLS policy belum dibuat. Pastikan sudah menjalankan:
```sql
CREATE POLICY "Enable all access" ON mvps FOR ALL USING (true) WITH CHECK (true);
```

---

## 📞 Butuh Bantuan?

Jika masih ada masalah:
1. Screenshot error di browser console (F12)
2. Screenshot Supabase Table Editor (daftar tabel)
3. Kirim ke developer untuk debugging

---

**Status:** ✅ **SOLUSI TERSEDIA**

Aplikasi sekarang memiliki fallback data jika Supabase tidak tersedia, tetapi disarankan untuk membuat tabel MVP agar bisa menyimpan data secara permanen.
