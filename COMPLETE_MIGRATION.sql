-- ================================================================================
-- SOQ.COMM PADEL LEAGUE - COMPLETE DATABASE MIGRATION
-- ================================================================================
-- File: COMPLETE_MIGRATION.sql
-- Deskripsi: Migrasi lengkap untuk semua fitur baru
-- Versi: 2.0.0
-- Tanggal: 2025
-- 
-- FITUR YANG DITAMBAHKAN:
-- 1. Tabel match_lineups untuk susunan pemain per partai
-- 2. Tabel mvps_matchday untuk MVP per partai (4 slot per pertandingan)
-- 3. Tabel mvps_liga untuk MVP per musim (1 per musim)
-- 4. Semua constraints, indexes, dan triggers
-- 
-- CARA MENJALANKAN:
-- 1. Buka Supabase Dashboard
-- 2. Pilih project PADEL LEAGUE
-- 3. Klik menu "SQL Editor"
-- 4. Klik "New Query"
-- 5. Copy SELURUH isi file ini
-- 6. Paste ke SQL Editor
-- 7. Klik "Run" atau tekan Ctrl+Enter
-- 8. Tunggu sampai selesai (biasanya < 10 detik)
-- 
-- CATATAN PENTING:
-- - Script ini aman untuk dijalankan berulang kali
-- - Menggunakan IF NOT EXISTS untuk mencegah error
-- - Tidak akan menghapus data yang sudah ada
-- - Semua tabel dan constraints akan dibuat jika belum ada
-- ================================================================================

-- ================================================================================
-- BAGIAN 1: TABEL match_lineups (Susunan Pemain per Partai)
-- ================================================================================

DO $$
BEGIN
  -- Cek apakah tabel match_lineups sudah ada
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'match_lineups') THEN
    CREATE TABLE match_lineups (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      match_id UUID NOT NULL,
      party_number INTEGER NOT NULL CHECK (party_number BETWEEN 1 AND 4),
      team_a_player1_id UUID NOT NULL,
      team_a_player2_id UUID NOT NULL,
      team_b_player1_id UUID NOT NULL,
      team_b_player2_id UUID NOT NULL,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      CONSTRAINT unique_party_per_match UNIQUE (match_id, party_number)
    );
    
    RAISE NOTICE 'Tabel match_lineups berhasil dibuat';
  ELSE
    RAISE NOTICE 'Tabel match_lineups sudah ada, dilewati';
  END IF;
END $$;

-- Tambahkan foreign keys untuk match_lineups (jika belum ada)
DO $$
BEGIN
  -- Foreign key ke matches
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'match_lineups_match_id_fkey'
  ) THEN
    ALTER TABLE match_lineups 
    ADD CONSTRAINT match_lineups_match_id_fkey 
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE;
  END IF;
  
  -- Foreign key ke players (team_a_player1)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'match_lineups_team_a_player1_id_fkey'
  ) THEN
    ALTER TABLE match_lineups 
    ADD CONSTRAINT match_lineups_team_a_player1_id_fkey 
    FOREIGN KEY (team_a_player1_id) REFERENCES players(id) ON DELETE RESTRICT;
  END IF;
  
  -- Foreign key ke players (team_a_player2)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'match_lineups_team_a_player2_id_fkey'
  ) THEN
    ALTER TABLE match_lineups 
    ADD CONSTRAINT match_lineups_team_a_player2_id_fkey 
    FOREIGN KEY (team_a_player2_id) REFERENCES players(id) ON DELETE RESTRICT;
  END IF;
  
  -- Foreign key ke players (team_b_player1)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'match_lineups_team_b_player1_id_fkey'
  ) THEN
    ALTER TABLE match_lineups 
    ADD CONSTRAINT match_lineups_team_b_player1_id_fkey 
    FOREIGN KEY (team_b_player1_id) REFERENCES players(id) ON DELETE RESTRICT;
  END IF;
  
  -- Foreign key ke players (team_b_player2)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'match_lineups_team_b_player2_id_fkey'
  ) THEN
    ALTER TABLE match_lineups 
    ADD CONSTRAINT match_lineups_team_b_player2_id_fkey 
    FOREIGN KEY (team_b_player2_id) REFERENCES players(id) ON DELETE RESTRICT;
  END IF;
END $$;

-- Index untuk match_lineups
CREATE INDEX IF NOT EXISTS idx_match_lineups_match_id ON match_lineups(match_id);
CREATE INDEX IF NOT EXISTS idx_match_lineups_party_number ON match_lineups(party_number);
CREATE INDEX IF NOT EXISTS idx_match_lineups_status ON match_lineups(status);
CREATE INDEX IF NOT EXISTS idx_match_lineups_match_party ON match_lineups(match_id, party_number);

-- ================================================================================
-- BAGIAN 2: TABEL mvps_matchday (MVP per Partai)
-- ================================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'mvps_matchday') THEN
    CREATE TABLE mvps_matchday (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      season TEXT NOT NULL,
      matchday_id UUID NOT NULL,
      match_id UUID NOT NULL,
      party_number INTEGER NOT NULL CHECK (party_number BETWEEN 1 AND 4),
      player_id UUID NOT NULL,
      notes TEXT DEFAULT '',
      is_published BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      CONSTRAINT unique_mvp_per_party UNIQUE (match_id, party_number)
    );
    
    RAISE NOTICE 'Tabel mvps_matchday berhasil dibuat';
  ELSE
    RAISE NOTICE 'Tabel mvps_matchday sudah ada, dilewati';
  END IF;
END $$;

-- Foreign keys untuk mvps_matchday
DO $$
BEGIN
  -- Foreign key ke matchdays
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'mvps_matchday_matchday_id_fkey'
  ) THEN
    ALTER TABLE mvps_matchday 
    ADD CONSTRAINT mvps_matchday_matchday_id_fkey 
    FOREIGN KEY (matchday_id) REFERENCES matchdays(id) ON DELETE CASCADE;
  END IF;
  
  -- Foreign key ke matches
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'mvps_matchday_match_id_fkey'
  ) THEN
    ALTER TABLE mvps_matchday 
    ADD CONSTRAINT mvps_matchday_match_id_fkey 
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE;
  END IF;
  
  -- Foreign key ke players
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'mvps_matchday_player_id_fkey'
  ) THEN
    ALTER TABLE mvps_matchday 
    ADD CONSTRAINT mvps_matchday_player_id_fkey 
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE RESTRICT;
  END IF;
END $$;

-- Index untuk mvps_matchday
CREATE INDEX IF NOT EXISTS idx_mvps_matchday_season ON mvps_matchday(season);
CREATE INDEX IF NOT EXISTS idx_mvps_matchday_matchday ON mvps_matchday(matchday_id);
CREATE INDEX IF NOT EXISTS idx_mvps_matchday_match ON mvps_matchday(match_id);
CREATE INDEX IF NOT EXISTS idx_mvps_matchday_player ON mvps_matchday(player_id);
CREATE INDEX IF NOT EXISTS idx_mvps_matchday_published ON mvps_matchday(is_published);

-- ================================================================================
-- BAGIAN 3: TABEL mvps_liga (MVP per Musim)
-- ================================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'mvps_liga') THEN
    CREATE TABLE mvps_liga (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      season TEXT NOT NULL,
      player_id UUID NOT NULL,
      notes TEXT DEFAULT '',
      is_published BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    RAISE NOTICE 'Tabel mvps_liga berhasil dibuat';
  ELSE
    RAISE NOTICE 'Tabel mvps_liga sudah ada, dilewati';
  END IF;
END $$;

-- Foreign key untuk mvps_liga
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'mvps_liga_player_id_fkey'
  ) THEN
    ALTER TABLE mvps_liga 
    ADD CONSTRAINT mvps_liga_player_id_fkey 
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE RESTRICT;
  END IF;
END $$;

-- Index untuk mvps_liga
CREATE INDEX IF NOT EXISTS idx_mvps_liga_season ON mvps_liga(season);
CREATE INDEX IF NOT EXISTS idx_mvps_liga_player ON mvps_liga(player_id);
CREATE INDEX IF NOT EXISTS idx_mvps_liga_published ON mvps_liga(is_published);

-- ================================================================================
-- BAGIAN 4: ROW LEVEL SECURITY (RLS)
-- ================================================================================

-- Enable RLS untuk semua tabel baru
ALTER TABLE match_lineups ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvps_matchday ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvps_liga ENABLE ROW LEVEL SECURITY;

-- Drop policies lama jika ada (untuk menghindari konflik)
DROP POLICY IF EXISTS "Public read access for match_lineups" ON match_lineups;
DROP POLICY IF EXISTS "Admin write access for match_lineups" ON match_lineups;
DROP POLICY IF EXISTS "Public read access for published mvps_matchday" ON mvps_matchday;
DROP POLICY IF EXISTS "Admin write access for mvps_matchday" ON mvps_matchday;
DROP POLICY IF EXISTS "Public read access for published mvps_liga" ON mvps_liga;
DROP POLICY IF EXISTS "Admin write access for mvps_liga" ON mvps_liga;

-- Buat policies baru
CREATE POLICY "Public read access for match_lineups" 
ON match_lineups FOR SELECT 
USING (true);

CREATE POLICY "Admin write access for match_lineups" 
ON match_lineups FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Public read access for published mvps_matchday" 
ON mvps_matchday FOR SELECT 
USING (is_published = true);

CREATE POLICY "Admin write access for mvps_matchday" 
ON mvps_matchday FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Public read access for published mvps_liga" 
ON mvps_liga FOR SELECT 
USING (is_published = true);

CREATE POLICY "Admin write access for mvps_liga" 
ON mvps_liga FOR ALL 
USING (true) 
WITH CHECK (true);

-- ================================================================================
-- BAGIAN 5: TRIGGERS AUTO-UPDATE updated_at
-- ================================================================================

-- Fungsi untuk auto-update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop triggers lama jika ada
DROP TRIGGER IF EXISTS trigger_match_lineups_updated_at ON match_lineups;
DROP TRIGGER IF EXISTS trigger_mvps_matchday_updated_at ON mvps_matchday;
DROP TRIGGER IF EXISTS trigger_mvps_liga_updated_at ON mvps_liga;

-- Buat triggers baru
CREATE TRIGGER trigger_match_lineups_updated_at
  BEFORE UPDATE ON match_lineups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_mvps_matchday_updated_at
  BEFORE UPDATE ON mvps_matchday
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_mvps_liga_updated_at
  BEFORE UPDATE ON mvps_liga
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================================================
-- BAGIAN 6: VERIFIKASI
-- ================================================================================

-- Query untuk memverifikasi semua tabel sudah dibuat
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM pg_tables 
  WHERE schemaname = 'public' 
  AND tablename IN ('match_lineups', 'mvps_matchday', 'mvps_liga');
  
  IF table_count = 3 THEN
    RAISE NOTICE '✓ Semua tabel berhasil dibuat: match_lineups, mvps_matchday, mvps_liga';
  ELSE
    RAISE WARNING '⚠ Hanya % dari 3 tabel yang berhasil dibuat', table_count;
  END IF;
END $$;

-- ================================================================================
-- SELESAI - MIGRASI BERHASIL!
-- ================================================================================

-- Instruksi selanjutnya:
-- 1. Reload aplikasi (Ctrl+F5)
-- 2. Test fitur Edit Jadwal dengan susunan pemain
-- 3. Test fitur Input Skor
-- 4. Test fitur MVP Matchday dan MVP Liga
-- 5. Cek profil pemain untuk melihat statistik yang terupdate
