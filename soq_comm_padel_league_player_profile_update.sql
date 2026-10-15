-- SOQ.COMM PADEL LEAGUE - Player Profile Update Migration
-- File: soq_comm_padel_league_player_profile_update.sql
-- Deskripsi: Menambahkan kolom strengths (keunggulan pemain) ke tabel players
-- Tanggal: 2025

-- ============================================
-- 1. TAMBAH KOLOM STRENGTHS
-- ============================================

-- Tambahkan kolom strengths bertipe JSONB untuk menyimpan array keunggulan pemain
-- Kolom ini nullable dan default null untuk kompatibilitas dengan data existing
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS strengths JSONB DEFAULT '[]'::jsonb;

-- ============================================
-- 2. UPDATE KOLOM POSITION
-- ============================================

-- Update constraint kolom position untuk menambahkan opsi 'both'
-- Hapus constraint lama jika ada
ALTER TABLE players DROP CONSTRAINT IF EXISTS players_position_check;

-- Tambahkan constraint baru dengan opsi 'both'
ALTER TABLE players ADD CONSTRAINT players_position_check 
CHECK (position IN ('right', 'left', 'both', '') OR position IS NULL);

-- ============================================
-- 3. BUAT INDEX UNTUK PERFORMA
-- ============================================

-- Index untuk pencarian berdasarkan team_id
CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);

-- Index untuk filter pemain aktif
CREATE INDEX IF NOT EXISTS idx_players_is_active ON players(is_active);

-- Index untuk pencarian berdasarkan gender
CREATE INDEX IF NOT EXISTS idx_players_gender ON players(gender);

-- Index untuk pencarian berdasarkan position
CREATE INDEX IF NOT EXISTS idx_players_position ON players(position);

-- ============================================
-- 4. VERIFIKASI STRUKTUR TABEL
-- ============================================

-- Query untuk memverifikasi struktur tabel players setelah migrasi
-- Jalankan query ini untuk memastikan semua kolom sudah ditambahkan
/*
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'players'
ORDER BY ordinal_position;
*/

-- ============================================
-- 5. CATATAN PENTING
-- ============================================

/*
MIGRASI SELESAI!

Kolom baru yang ditambahkan:
- strengths (JSONB): Menyimpan array keunggulan pemain

Kolom yang diupdate:
- position: Menambahkan opsi 'both' (Both Sides)

Langkah selanjutnya:
1. Jalankan migrasi ini di Supabase SQL Editor
2. Reload aplikasi untuk menerapkan perubahan
3. Test fitur profil pemain dengan klik kartu pemain
4. Test fitur manajemen pemain dengan menambah keunggulan

Catatan:
- Migrasi ini aman dan tidak menghapus data existing
- Kolom strengths default null/array kosong untuk pemain lama
- Semua pemain existing tetap kompatibel
- Tidak ada downtime yang diperlukan
*/

-- ============================================
-- SELESAI
-- ============================================
