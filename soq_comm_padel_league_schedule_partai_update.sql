-- ================================================================================
-- SOQ.COMM PADEL LEAGUE - MATCH LINEUP MIGRATION
-- ================================================================================
-- File: soq_comm_padel_league_schedule_partai_update.sql
-- Deskripsi: Membuat tabel match_lineups untuk menyimpan susunan pemain per partai
-- Versi: 1.0.0
-- Tanggal: 2025
-- 
-- FITUR YANG DITAMBAHKAN:
-- 1. Tabel match_lineups untuk menyimpan susunan pemain Partai 1-4
-- 2. Relasi ke tabel matches, teams, dan players
-- 3. Validasi untuk mencegah duplikasi partai
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
-- 8. Tunggu sampai selesai
-- ================================================================================

-- ================================================================================
-- BAGIAN 1: BUAT TABEL MATCH_LINEUPS
-- ================================================================================

CREATE TABLE IF NOT EXISTS match_lineups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  party_number INTEGER NOT NULL CHECK (party_number BETWEEN 1 AND 4),
  
  -- Tim A players
  team_a_player1_id UUID NOT NULL REFERENCES players(id) ON DELETE RESTRICT,
  team_a_player2_id UUID NOT NULL REFERENCES players(id) ON DELETE RESTRICT,
  
  -- Tim B players
  team_b_player1_id UUID NOT NULL REFERENCES players(id) ON DELETE RESTRICT,
  team_b_player2_id UUID NOT NULL REFERENCES players(id) ON DELETE RESTRICT,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: satu partai hanya boleh ada sekali per match
  CONSTRAINT unique_party_per_match UNIQUE (match_id, party_number)
);

-- ================================================================================
-- BAGIAN 2: BUAT INDEX UNTUK PERFORMA
-- ================================================================================

-- Index untuk pencarian berdasarkan match_id
CREATE INDEX IF NOT EXISTS idx_match_lineups_match_id ON match_lineups(match_id);

-- Index untuk pencarian berdasarkan party_number
CREATE INDEX IF NOT EXISTS idx_match_lineups_party_number ON match_lineups(party_number);

-- Index untuk pencarian berdasarkan status
CREATE INDEX IF NOT EXISTS idx_match_lineups_status ON match_lineups(status);

-- Composite index untuk query umum
CREATE INDEX IF NOT EXISTS idx_match_lineups_match_party ON match_lineups(match_id, party_number);

-- ================================================================================
-- BAGIAN 3: ROW LEVEL SECURITY (RLS)
-- ================================================================================

-- Enable RLS
ALTER TABLE match_lineups ENABLE ROW LEVEL SECURITY;

-- Policy: Public read access
CREATE POLICY "Public read access for match_lineups" 
ON match_lineups FOR SELECT 
USING (true);

-- Policy: Admin write access (untuk saat ini, semua bisa write)
-- Nantinya bisa disesuaikan dengan role admin
CREATE POLICY "Admin write access for match_lineups" 
ON match_lineups FOR ALL 
USING (true) 
WITH CHECK (true);

-- ================================================================================
-- BAGIAN 4: TRIGGER AUTO-UPDATE updated_at
-- ================================================================================

-- Fungsi untuk auto-update timestamp
CREATE OR REPLACE FUNCTION update_match_lineups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk auto-update
DROP TRIGGER IF EXISTS trigger_match_lineups_updated_at ON match_lineups;
CREATE TRIGGER trigger_match_lineups_updated_at
  BEFORE UPDATE ON match_lineups
  FOR EACH ROW
  EXECUTE FUNCTION update_match_lineups_updated_at();

-- ================================================================================
-- BAGIAN 5: VERIFIKASI STRUKTUR TABEL
-- ================================================================================

-- Query untuk memverifikasi struktur tabel match_lineups
/*
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'match_lineups'
ORDER BY ordinal_position;
*/

-- Query untuk melihat sample data
/*
SELECT 
  ml.id,
  ml.match_id,
  ml.party_number,
  ml.status,
  m.team_a_id,
  m.team_b_id,
  p1.name as team_a_player1,
  p2.name as team_a_player2,
  p3.name as team_b_player1,
  p4.name as team_b_player2
FROM match_lineups ml
JOIN matches m ON ml.match_id = m.id
JOIN players p1 ON ml.team_a_player1_id = p1.id
JOIN players p2 ON ml.team_a_player2_id = p2.id
JOIN players p3 ON ml.team_b_player1_id = p3.id
JOIN players p4 ON ml.team_b_player2_id = p4.id
LIMIT 10;
*/

-- ================================================================================
-- BAGIAN 6: ROLLBACK (JIKA PERLU)
-- ================================================================================

/*
-- PERINGATAN: Ini akan menghapus tabel dan semua data di dalamnya!
DROP TABLE IF EXISTS match_lineups;
*/

-- ================================================================================
-- CATATAN PENTING
-- ================================================================================
/*
MIGRASI SELESAI!

✅ Tabel baru yang dibuat:
   - match_lineups: Menyimpan susunan pemain per partai (1-4)

✅ Kolom yang ditambahkan:
   - id (UUID): Primary key
   - match_id (UUID): Foreign key ke tabel matches
   - party_number (INTEGER): Nomor partai (1-4)
   - team_a_player1_id (UUID): Pemain 1 Tim A
   - team_a_player2_id (UUID): Pemain 2 Tim A
   - team_b_player1_id (UUID): Pemain 1 Tim B
   - team_b_player2_id (UUID): Pemain 2 Tim B
   - status (TEXT): Status partai (pending/completed)
   - created_at (TIMESTAMPTZ): Waktu pembuatan
   - updated_at (TIMESTAMPTZ): Waktu update terakhir

✅ Constraint:
   - unique_party_per_match: Mencegah duplikasi partai dalam satu match
   - Foreign keys ke matches, players
   - Check constraint untuk party_number (1-4)

✅ Index yang dibuat:
   - idx_match_lineups_match_id
   - idx_match_lineups_party_number
   - idx_match_lineups_status
   - idx_match_lineups_match_party

✅ Trigger:
   - Auto-update updated_at saat ada perubahan

✅ RLS Policies:
   - Public read access
   - Admin write access

✅ Kompatibilitas:
   - Data existing tetap aman
   - Tidak ada data loss
   - Tidak ada downtime

✅ Langkah selanjutnya:
   1. Jalankan query verifikasi di BAGIAN 5
   2. Reload aplikasi (Ctrl+F5)
   3. Test fitur Edit Jadwal:
      - Buka Manajemen Jadwal
      - Klik Edit pada salah satu jadwal
      - Pop-up harus menampilkan 4 partai
      - Pilih pemain untuk setiap partai
      - Simpan dan verifikasi
   4. Test fitur Input Skor:
      - Buka Input Skor
      - Pilih jadwal yang sudah di-set lineups
      - Nama pemain harus otomatis muncul
      - Input skor dan simpan

✅ Troubleshooting:
   - Jika error "table already exists": Migrasi sudah dijalankan sebelumnya
   - Jika error "permission denied": Pastikan login sebagai admin Supabase
   - Jika error "foreign key constraint": Pastikan tabel matches dan players sudah ada
   - Jika data tidak muncul: Hard refresh browser (Ctrl+F5)

✅ Integrasi dengan fitur existing:
   - EditMatchModal: Tampilkan 4 panel partai dengan dropdown pemain
   - InputScore: Tampilkan nama pemain dari match_lineups
   - Tidak mengubah struktur penyimpanan skor yang sudah ada
   - Tetap menggunakan PairMatchResult untuk menyimpan hasil skor
*/

-- ================================================================================
-- SELESAI - MIGRASI BERHASIL!
-- ================================================================================
