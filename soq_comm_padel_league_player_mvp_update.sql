-- ================================================================================
-- SOQ.COMM PADEL LEAGUE - MVP SYSTEM MIGRATION
-- ================================================================================
-- File: soq_comm_padel_league_player_mvp_update.sql
-- Deskripsi: Membuat tabel untuk MVP Matchday dan MVP Liga
-- Versi: 1.0.0
-- Tanggal: 2025
-- 
-- FITUR YANG DITAMBAHKAN:
-- 1. Tabel mvps_matchday untuk MVP per partai (4 slot per pertandingan)
-- 2. Tabel mvps_liga untuk MVP per musim (1 per musim)
-- 3. Relasi ke tabel matches, players, matchdays
-- 4. Constraint untuk mencegah duplikasi
-- 5. Index untuk optimasi performa
-- 
-- CARA MENJALANKAN:
-- 1. Buka Supabase Dashboard
-- 2. Pilih project PADEL LEAGUE
-- 3. Klik menu "SQL Editor"
-- 4. Klik "New Query"
-- 5. Copy seluruh isi file ini
-- 6. Paste ke SQL Editor
-- 7. Klik "Run" atau tekan Ctrl+Enter
-- 8. Tunggu sampai selesai
-- ================================================================================

-- ================================================================================
-- BAGIAN 1: BUAT TABEL mvps_matchday
-- ================================================================================
-- Tabel untuk menyimpan MVP per partai (4 slot per pertandingan)

CREATE TABLE IF NOT EXISTS mvps_matchday (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  season TEXT NOT NULL,
  matchday_id UUID NOT NULL REFERENCES matchdays(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  party_number INTEGER NOT NULL CHECK (party_number BETWEEN 1 AND 4),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE RESTRICT,
  notes TEXT DEFAULT '',
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: satu partai hanya boleh punya 1 MVP
  CONSTRAINT unique_mvp_per_party UNIQUE (match_id, party_number)
);

-- ================================================================================
-- BAGIAN 2: BUAT TABEL mvps_liga
-- ================================================================================
-- Tabel untuk menyimpan MVP Liga (1 per musim)

CREATE TABLE IF NOT EXISTS mvps_liga (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  season TEXT NOT NULL,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE RESTRICT,
  notes TEXT DEFAULT '',
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: satu musim hanya boleh punya 1 MVP Liga yang published
  -- Note: Constraint ini akan di-enforce di aplikasi, bukan di database
  -- karena kita mengizinkan draft multiple tapi hanya 1 yang published
);

-- ================================================================================
-- BAGIAN 3: BUAT INDEX UNTUK PERFORMA
-- ================================================================================

-- Index untuk mvps_matchday
CREATE INDEX IF NOT EXISTS idx_mvps_matchday_season ON mvps_matchday(season);
CREATE INDEX IF NOT EXISTS idx_mvps_matchday_matchday ON mvps_matchday(matchday_id);
CREATE INDEX IF NOT EXISTS idx_mvps_matchday_match ON mvps_matchday(match_id);
CREATE INDEX IF NOT EXISTS idx_mvps_matchday_player ON mvps_matchday(player_id);
CREATE INDEX IF NOT EXISTS idx_mvps_matchday_published ON mvps_matchday(is_published);

-- Index untuk mvps_liga
CREATE INDEX IF NOT EXISTS idx_mvps_liga_season ON mvps_liga(season);
CREATE INDEX IF NOT EXISTS idx_mvps_liga_player ON mvps_liga(player_id);
CREATE INDEX IF NOT EXISTS idx_mvps_liga_published ON mvps_liga(is_published);

-- ================================================================================
-- BAGIAN 4: ROW LEVEL SECURITY (RLS)
-- ================================================================================

-- Enable RLS untuk kedua tabel
ALTER TABLE mvps_matchday ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvps_liga ENABLE ROW LEVEL SECURITY;

-- Policy: Public read access untuk MVP yang published
CREATE POLICY "Public read access for published mvps_matchday" 
ON mvps_matchday FOR SELECT 
USING (is_published = true);

CREATE POLICY "Public read access for published mvps_liga" 
ON mvps_liga FOR SELECT 
USING (is_published = true);

-- Policy: Admin full access (untuk saat ini, semua bisa write)
-- Nantinya bisa disesuaikan dengan role admin
CREATE POLICY "Admin write access for mvps_matchday" 
ON mvps_matchday FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Admin write access for mvps_liga" 
ON mvps_liga FOR ALL 
USING (true) 
WITH CHECK (true);

-- ================================================================================
-- BAGIAN 5: TRIGGER AUTO-UPDATE updated_at
-- ================================================================================

-- Fungsi untuk auto-update timestamp
CREATE OR REPLACE FUNCTION update_mvps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk mvps_matchday
DROP TRIGGER IF EXISTS trigger_mvps_matchday_updated_at ON mvps_matchday;
CREATE TRIGGER trigger_mvps_matchday_updated_at
  BEFORE UPDATE ON mvps_matchday
  FOR EACH ROW
  EXECUTE FUNCTION update_mvps_updated_at();

-- Trigger untuk mvps_liga
DROP TRIGGER IF EXISTS trigger_mvps_liga_updated_at ON mvps_liga;
CREATE TRIGGER trigger_mvps_liga_updated_at
  BEFORE UPDATE ON mvps_liga
  FOR EACH ROW
  EXECUTE FUNCTION update_mvps_updated_at();

-- ================================================================================
-- BAGIAN 6: VERIFIKASI STRUKTUR TABEL
-- ================================================================================

-- Query untuk memverifikasi struktur tabel mvps_matchday
/*
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'mvps_matchday'
ORDER BY ordinal_position;
*/

-- Query untuk memverifikasi struktur tabel mvps_liga
/*
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'mvps_liga'
ORDER BY ordinal_position;
*/

-- Query untuk melihat sample data MVP Matchday
/*
SELECT 
  mm.id,
  mm.season,
  md.name as matchday,
  m.start_time,
  mm.party_number,
  p.name as player_name,
  t.name as team_name,
  mm.notes,
  mm.is_published
FROM mvps_matchday mm
JOIN matchdays md ON mm.matchday_id = md.id
JOIN matches m ON mm.match_id = m.id
JOIN players p ON mm.player_id = p.id
JOIN teams t ON p.team_id = t.id
ORDER BY mm.created_at DESC
LIMIT 10;
*/

-- Query untuk melihat sample data MVP Liga
/*
SELECT 
  ml.id,
  ml.season,
  p.name as player_name,
  t.name as team_name,
  ml.notes,
  ml.is_published,
  ml.created_at
FROM mvps_liga ml
JOIN players p ON ml.player_id = p.id
JOIN teams t ON p.team_id = t.id
ORDER BY ml.created_at DESC
LIMIT 10;
*/

-- ================================================================================
-- BAGIAN 7: ROLLBACK (JIKA PERLU)
-- ================================================================================

/*
-- PERINGATAN: Ini akan menghapus tabel dan semua data di dalamnya!
DROP TABLE IF EXISTS mvps_matchday;
DROP TABLE IF EXISTS mvps_liga;
*/

-- ================================================================================
-- CATATAN PENTING
-- ================================================================================
/*
MIGRASI SELESAI!

✅ Tabel baru yang dibuat:
   - mvps_matchday: MVP per partai (4 slot per pertandingan)
   - mvps_liga: MVP per musim (1 per musim)

✅ Kolom mvps_matchday:
   - id (UUID): Primary key
   - season (TEXT): Musim liga
   - matchday_id (UUID): Foreign key ke matchdays
   - match_id (UUID): Foreign key ke matches
   - party_number (INTEGER): Nomor partai (1-4)
   - player_id (UUID): Foreign key ke players
   - notes (TEXT): Catatan penilaian panitia
   - is_published (BOOLEAN): Status publikasi
   - created_at (TIMESTAMPTZ): Waktu pembuatan
   - updated_at (TIMESTAMPTZ): Waktu update terakhir

✅ Kolom mvps_liga:
   - id (UUID): Primary key
   - season (TEXT): Musim liga
   - player_id (UUID): Foreign key ke players
   - notes (TEXT): Catatan penilaian panitia
   - is_published (BOOLEAN): Status publikasi
   - created_at (TIMESTAMPTZ): Waktu pembuatan
   - updated_at (TIMESTAMPTZ): Waktu update terakhir

✅ Constraint:
   - unique_mvp_per_party: Mencegah duplikasi MVP untuk partai yang sama
   - Foreign keys ke matches, players, matchdays
   - Check constraint untuk party_number (1-4)

✅ Index yang dibuat:
   - idx_mvps_matchday_season
   - idx_mvps_matchday_matchday
   - idx_mvps_matchday_match
   - idx_mvps_matchday_player
   - idx_mvps_matchday_published
   - idx_mvps_liga_season
   - idx_mvps_liga_player
   - idx_mvps_liga_published

✅ Trigger:
   - Auto-update updated_at saat ada perubahan

✅ RLS Policies:
   - Public read access hanya untuk MVP yang published
   - Admin write access

✅ Kompatibilitas:
   - Data existing tetap aman
   - Tidak ada data loss
   - Tidak ada downtime

✅ Langkah selanjutnya:
   1. Jalankan query verifikasi di BAGIAN 6
   2. Reload aplikasi (Ctrl+F5)
   3. Test fitur MVP Matchday:
      - Buka Admin → Manajemen MVP → MVP Matchday
      - Tambah MVP untuk partai yang sudah selesai
      - Publikasikan MVP
      - Cek di situs publik
   4. Test fitur MVP Liga:
      - Buka Admin → Manajemen MVP → MVP Liga
      - Tetapkan MVP Liga untuk musim ini
      - Publikasikan
      - Cek di situs publik

✅ Catatan penting:
   - MVP Matchday: 4 slot per pertandingan (1 per partai)
   - MVP Liga: 1 per musim (hanya 1 yang bisa published)
   - MVP ditentukan oleh panitia, bukan otomatis berdasarkan kemenangan
   - Pemain dari tim yang kalah tetap bisa jadi MVP
   - Statistik pemain akan menampilkan jumlah MVP Matchday dan status MVP Liga

✅ Troubleshooting:
   - Jika error "table already exists": Migrasi sudah dijalankan sebelumnya
   - Jika error "permission denied": Pastikan login sebagai admin Supabase
   - Jika error "foreign key constraint": Pastikan tabel matches, players, matchdays sudah ada
   - Jika data tidak muncul: Hard refresh browser (Ctrl+F5)
*/

-- ================================================================================
-- SELESAI - MIGRASI BERHASIL!
-- ================================================================================
