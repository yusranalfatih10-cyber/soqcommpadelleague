-- ================================================================================
-- SOQ.COMM PADEL LEAGUE - COMPLETE PLAYER PROFILE MIGRATION
-- ================================================================================
-- File: PLAYER_PROFILE_COMPLETE_MIGRATION.sql
-- Deskripsi: Migrasi lengkap untuk fitur profil pemain dengan statistik otomatis
-- Versi: 1.0.0
-- Tanggal: 2025
-- 
-- FITUR YANG DITAMBAHKAN:
-- 1. Kolom gender (jenis kelamin pemain)
-- 2. Kolom position (posisi bermain: right/left/both)
-- 3. Kolom strengths (keunggulan pemain dalam format JSONB)
-- 4. Index untuk optimasi performa
-- 
-- CARA MENJALANKAN:
-- 1. Buka Supabase Dashboard
-- 2. Pilih project PADEL LEAGUE
-- 3. Klik menu "SQL Editor"
-- 4. Klik "New Query"
-- 5. Copy seluruh isi file ini
-- 6. Paste ke SQL Editor
-- 7. Klik "Run" atau tekan Ctrl+Enter
-- 8. Tunggu sampai selesai (biasanya < 5 detik)
-- 9. Verifikasi dengan query di bagian akhir file
-- ================================================================================

-- ================================================================================
-- BAGIAN 1: TAMBAH KOLOM GENDER
-- ================================================================================
-- Kolom untuk menyimpan jenis kelamin pemain (Pria/Wanita)
-- Tipe: TEXT dengan constraint untuk validasi
-- Default: NULL (kompatibel dengan data existing)

ALTER TABLE players 
ADD COLUMN IF NOT EXISTS gender TEXT;

-- Tambahkan constraint untuk validasi nilai gender
ALTER TABLE players DROP CONSTRAINT IF EXISTS players_gender_check;
ALTER TABLE players ADD CONSTRAINT players_gender_check 
CHECK (gender IN ('male', 'female', '') OR gender IS NULL);

-- ================================================================================
-- BAGIAN 2: TAMBAH KOLOM POSITION
-- ================================================================================
-- Kolom untuk menyimpan posisi bermain pemain
-- Opsi: right (Kanan), left (Kiri), both (Kanan & Kiri)
-- Tipe: TEXT dengan constraint untuk validasi
-- Default: NULL (kompatibel dengan data existing)

ALTER TABLE players 
ADD COLUMN IF NOT EXISTS position TEXT;

-- Hapus constraint lama jika ada
ALTER TABLE players DROP CONSTRAINT IF EXISTS players_position_check;

-- Tambahkan constraint baru dengan opsi 'both'
ALTER TABLE players ADD CONSTRAINT players_position_check 
CHECK (position IN ('right', 'left', 'both', '') OR position IS NULL);

-- ================================================================================
-- BAGIAN 3: TAMBAH KOLOM STRENGTHS
-- ================================================================================
-- Kolom untuk menyimpan keunggulan pemain dalam format array
-- Tipe: JSONB (flexible untuk menyimpan array of strings)
-- Default: '[]'::jsonb (array kosong)
-- Contoh isi: ["Smash Keras", "Bandeja Akurat", "Volley Agresif"]

ALTER TABLE players 
ADD COLUMN IF NOT EXISTS strengths JSONB DEFAULT '[]'::jsonb;

-- ================================================================================
-- BAGIAN 4: BUAT INDEX UNTUK PERFORMA
-- ================================================================================
-- Index untuk mempercepat query berdasarkan team_id
CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);

-- Index untuk filter pemain aktif
CREATE INDEX IF NOT EXISTS idx_players_is_active ON players(is_active);

-- Index untuk pencarian berdasarkan gender
CREATE INDEX IF NOT EXISTS idx_players_gender ON players(gender);

-- Index untuk pencarian berdasarkan position
CREATE INDEX IF NOT EXISTS idx_players_position ON players(position);

-- ================================================================================
-- BAGIAN 5: VERIFIKASI MIGRASI
-- ================================================================================
-- Jalankan query ini untuk memverifikasi semua kolom sudah ditambahkan dengan benar

-- Query 1: Lihat struktur tabel players
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'players'
ORDER BY ordinal_position;

-- Query 2: Cek jumlah pemain dengan data baru
SELECT 
  COUNT(*) as total_players,
  COUNT(gender) as players_with_gender,
  COUNT(position) as players_with_position,
  COUNT(CASE WHEN strengths != '[]'::jsonb THEN 1 END) as players_with_strengths
FROM players;

-- Query 3: Lihat sample data pemain dengan field baru
SELECT 
  id,
  name,
  gender,
  position,
  strengths,
  team_id,
  is_active
FROM players
LIMIT 10;

-- ================================================================================
-- BAGIAN 6: ROLLBACK (JIKA PERLU)
-- ================================================================================
-- Jika ada masalah dan perlu rollback, jalankan query berikut:
-- PERINGATAN: Ini akan menghapus kolom baru dan data di dalamnya!

/*
ALTER TABLE players DROP COLUMN IF EXISTS gender;
ALTER TABLE players DROP COLUMN IF EXISTS position;
ALTER TABLE players DROP COLUMN IF EXISTS strengths;
DROP INDEX IF EXISTS idx_players_team_id;
DROP INDEX IF EXISTS idx_players_is_active;
DROP INDEX IF EXISTS idx_players_gender;
DROP INDEX IF EXISTS idx_players_position;
*/

-- ================================================================================
-- CATATAN PENTING
-- ================================================================================
/*
MIGRASI SELESAI!

✅ Kolom baru yang ditambahkan:
   - gender (TEXT): Jenis kelamin pemain (male/female)
   - position (TEXT): Posisi bermain (right/left/both)
   - strengths (JSONB): Array keunggulan pemain

✅ Index yang dibuat:
   - idx_players_team_id
   - idx_players_is_active
   - idx_players_gender
   - idx_players_position

✅ Kompatibilitas:
   - Data existing tetap aman
   - Kolom baru default NULL/empty
   - Tidak ada data loss
   - Tidak ada downtime

✅ Langkah selanjutnya:
   1. Jalankan query verifikasi di BAGIAN 5
   2. Reload aplikasi (Ctrl+F5)
   3. Test fitur profil pemain:
      - Buka halaman Pemain
      - Klik kartu pemain
      - Modal profil harus terbuka
   4. Test fitur manajemen pemain:
      - Login sebagai admin
      - Buka Manajemen Pemain
      - Tambah/edit pemain dengan field baru
      - Simpan dan verifikasi

✅ Troubleshooting:
   - Jika error "column already exists": Migrasi sudah dijalankan sebelumnya
   - Jika error "permission denied": Pastikan login sebagai admin Supabase
   - Jika data tidak muncul: Hard refresh browser (Ctrl+F5)

✅ Support:
   - Dokumentasi lengkap: UPDATE_FITUR_PEMAIN_DOKUMENTASI.md
   - File SQL ini: PLAYER_PROFILE_COMPLETE_MIGRATION.sql
*/

-- ================================================================================
-- SELESAI - MIGRASI BERHASIL!
-- ================================================================================
