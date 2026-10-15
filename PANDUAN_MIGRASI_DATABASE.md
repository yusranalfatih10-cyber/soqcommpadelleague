# 🗄️ PANDUAN MIGRASI DATABASE SUPABASE

## ⚠️ PENTING: Baca Sebelum Menjalankan SQL

File SQL `COMPLETE_MIGRATION.sql` adalah script migrasi lengkap dan aman untuk menambahkan semua fitur baru ke database Supabase Anda.

---

## 📋 Fitur yang Ditambahkan

Script ini akan membuat 3 tabel baru:

1. **`match_lineups`** - Susunan pemain per partai (4 partai per pertandingan)
2. **`mvps_matchday`** - MVP per partai (4 slot per pertandingan)
3. **`mvps_liga`** - MVP per musim (1 per musim)

Plus:
- ✅ Semua foreign keys
- ✅ Index untuk performa
- ✅ Row Level Security (RLS) policies
- ✅ Auto-update triggers untuk timestamp
- ✅ Constraints untuk validasi data

---

## 🚀 Cara Menjalankan SQL

### Langkah 1: Buka Supabase Dashboard

1. Login ke https://supabase.com
2. Pilih project **PADEL LEAGUE** Anda

### Langkah 2: Buka SQL Editor

1. Klik menu **SQL Editor** di sidebar kiri
2. Klik tombol **New Query**

### Langkah 3: Copy dan Paste SQL

1. Buka file `COMPLETE_MIGRATION.sql`
2. **Copy SEMUA isi file** (Ctrl+A, Ctrl+C)
3. **Paste ke SQL Editor** (Ctrl+V)

### Langkah 4: Jalankan SQL

1. Klik tombol **Run** di pojok kanan bawah
2. Atau tekan **Ctrl+Enter**
3. Tunggu sampai selesai (biasanya < 10 detik)

### Langkah 5: Verifikasi

Anda akan melihat output seperti ini:
```
✓ Semua tabel berhasil dibuat: match_lineups, mvps_matchday, mvps_liga
```

### Langkah 6: Reload Aplikasi

1. Buka aplikasi Anda di browser
2. Tekan **Ctrl+F5** (hard refresh)
3. Login sebagai admin
4. Test semua fitur baru

---

## 🔍 Verifikasi Tabel Sudah Dibuat

Setelah menjalankan SQL, Anda bisa verifikasi dengan query ini:

```sql
-- Cek semua tabel baru
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('match_lineups', 'mvps_matchday', 'mvps_liga');
```

Harusnya muncul 3 baris:
- match_lineups
- mvps_matchday
- mvps_liga

---

## 🐛 Troubleshooting

### Error: "relation already exists"

**Penyebab:** Tabel sudah ada dari migrasi sebelumnya

**Solusi:** 
- Script ini aman untuk dijalankan berulang kali
- Error ini bisa diabaikan
- Tabel yang sudah ada tidak akan ditimpa

### Error: "permission denied"

**Penyebab:** Anda tidak memiliki hak akses sebagai admin

**Solusi:**
- Pastikan login sebagai **owner** atau **admin** di Supabase
- Cek role Anda di Settings → Database → Roles

### Error: "foreign key constraint failed"

**Penyebab:** Tabel referensi (matches, players, matchdays) belum ada

**Solusi:**
- Pastikan aplikasi sudah di-setup dengan benar
- Tabel-tabel dasar harus sudah ada sebelum menjalankan migrasi ini

### Error: "syntax error at or near..."

**Penyebab:** Ada kesalahan syntax di SQL

**Solusi:**
- Copy **SEMUA** isi file, jangan hanya sebagian
- Pastikan tidak ada karakter yang terpotong
- Coba jalankan per bagian (copy per BAGIAN)

### Tabel tidak muncul setelah Run

**Penyebab:** SQL berhasil dijalankan tapi ada warning

**Solusi:**
- Cek output di SQL Editor
- Lihat apakah ada error message
- Coba refresh halaman Supabase Dashboard
- Jalankan query verifikasi di atas

---

## 📊 Struktur Tabel yang Dibuat

### 1. match_lineups

```sql
match_lineups (
  id UUID PRIMARY KEY,
  match_id UUID → matches(id),
  party_number INTEGER (1-4),
  team_a_player1_id UUID → players(id),
  team_a_player2_id UUID → players(id),
  team_b_player1_id UUID → players(id),
  team_b_player2_id UUID → players(id),
  status TEXT ('pending' | 'completed'),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(match_id, party_number)
)
```

**Fungsi:** Menyimpan susunan pemain untuk setiap partai dalam pertandingan

### 2. mvps_matchday

```sql
mvps_matchday (
  id UUID PRIMARY KEY,
  season TEXT,
  matchday_id UUID → matchdays(id),
  match_id UUID → matches(id),
  party_number INTEGER (1-4),
  player_id UUID → players(id),
  notes TEXT,
  is_published BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(match_id, party_number)
)
```

**Fungsi:** Menyimpan MVP untuk setiap partai (4 slot per pertandingan)

### 3. mvps_liga

```sql
mvps_liga (
  id UUID PRIMARY KEY,
  season TEXT,
  player_id UUID → players(id),
  notes TEXT,
  is_published BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

**Fungsi:** Menyimpan MVP Liga (1 per musim)

---

## 🔒 Keamanan (RLS Policies)

### match_lineups
- ✅ Public read access (semua orang bisa lihat)
- ✅ Admin write access (hanya admin bisa tambah/edit/hapus)

### mvps_matchday
- ✅ Public read access HANYA untuk yang is_published = true
- ✅ Admin write access (hanya admin bisa tambah/edit/hapus)

### mvps_liga
- ✅ Public read access HANYA untuk yang is_published = true
- ✅ Admin write access (hanya admin bisa tambah/edit/hapus)

---

## 🧪 Testing Setelah Migrasi

### Test 1: Edit Jadwal dengan Susunan Pemain

1. Login sebagai admin
2. Buka menu **Manajemen Jadwal**
3. Klik **Edit** pada salah satu jadwal
4. Scroll ke bagian **SUSUNAN PEMAIN PERTANDINGAN**
5. Pilih pemain untuk Partai 1-4
6. Klik **Simpan**
7. ✅ Harus berhasil tanpa error

### Test 2: Input Skor

1. Buka menu **Input Skor**
2. Pilih pertandingan yang sudah di-set lineups
3. Klik selector partai (1-4)
4. ✅ Nama pemain harus muncul otomatis
5. Input skor
6. Klik **Sahkan Hasil**
7. ✅ Harus berhasil tanpa error

### Test 3: MVP Matchday

1. Buka menu **Manajemen MVP** → **MVP Matchday**
2. Klik **+ Tambah MVP Matchday**
3. Pilih matchday dan pertandingan
4. Pilih partai (1-4)
5. Pilih pemain dari dropdown
6. Klik **Simpan**
7. ✅ Harus berhasil tanpa error

### Test 4: MVP Liga

1. Buka menu **Manajemen MVP** → **MVP Liga**
2. Klik **+ Tetapkan MVP Liga**
3. Pilih musim dan pemain
4. Klik **Simpan**
5. ✅ Harus berhasil tanpa error

### Test 5: Statistik Pemain

1. Buka halaman **Pemain** di situs publik
2. Klik salah satu kartu pemain
3. ✅ Modal profil harus terbuka
4. ✅ Statistik harus terupdate (total pertandingan, menang, kalah, win rate)
5. ✅ Riwayat pertandingan harus muncul

---

## 📝 Rollback (Jika Ada Masalah)

Jika migrasi menyebabkan masalah dan Anda perlu rollback:

```sql
-- PERINGATAN: Ini akan menghapus semua data di tabel baru!
-- Hanya lakukan jika Anda yakin!

DROP TABLE IF EXISTS mvps_liga;
DROP TABLE IF EXISTS mvps_matchday;
DROP TABLE IF EXISTS match_lineups;
```

**Catatan:** 
- Data di tabel lama (matches, players, teams, dll) TIDAK akan terpengaruh
- Hanya tabel baru yang akan dihapus
- Anda bisa menjalankan migrasi ulang setelah memperbaiki masalah

---

## ✅ Checklist Sebelum Menjalankan

- [ ] Backup database (optional tapi recommended)
- [ ] Login sebagai admin/owner di Supabase
- [ ] Buka SQL Editor
- [ ] Copy SEMUA isi file `COMPLETE_MIGRATION.sql`
- [ ] Paste ke SQL Editor
- [ ] Klik Run
- [ ] Tunggu sampai selesai
- [ ] Verifikasi 3 tabel sudah dibuat
- [ ] Reload aplikasi (Ctrl+F5)
- [ ] Test semua fitur baru

---

## 🆘 Butuh Bantuan?

Jika masih ada masalah setelah mengikuti panduan ini:

1. **Screenshot error message** di SQL Editor
2. **Screenshot output** setelah Run
3. **Jalankan query verifikasi** dan screenshot hasilnya
4. Kirim informasi tersebut untuk troubleshooting lebih lanjut

---

## 📚 Dokumentasi Lengkap

- **UPDATE_STATISTIK_MVP_DOKUMENTASI.md** - Dokumentasi fitur MVP dan statistik
- **UPDATE_MANAJEMEN_JADWAL_DOKUMENTASI.md** - Dokumentasi fitur manajemen jadwal
- **COMPLETE_MIGRATION.sql** - File SQL migrasi ini

---

**Status:** ✅ **SIAP DIJALANKAN**

Script ini telah di-test dan aman untuk dijalankan di production database.

**Last Updated:** 2025
**Version:** 2.0.0
