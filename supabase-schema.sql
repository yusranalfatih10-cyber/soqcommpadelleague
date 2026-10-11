-- ============================================
-- SOQ.COMM PADEL LEAGUE - Database Schema
-- ============================================
-- Jalankan SQL ini di Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. TABEL LEAGUES
-- ============================================
CREATE TABLE IF NOT EXISTS leagues (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'SOQ.COMM PADEL LEAGUE',
  logo_url TEXT DEFAULT '',
  season TEXT DEFAULT '2025',
  description TEXT DEFAULT 'One League. One Community. One Passion.',
  status TEXT DEFAULT 'ongoing' CHECK (status IN ('upcoming', 'ongoing', 'completed')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. TABEL TEAMS
-- ============================================
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT DEFAULT '',
  captain TEXT DEFAULT '',
  description TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. TABEL PLAYERS
-- ============================================
CREATE TABLE IF NOT EXISTS players (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  photo_url TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. TABEL PAIRS
-- ============================================
CREATE TABLE IF NOT EXISTS pairs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  player_1_id UUID REFERENCES players(id) ON DELETE SET NULL,
  player_2_id UUID REFERENCES players(id) ON DELETE SET NULL,
  pair_name TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true
);

-- ============================================
-- 5. TABEL MATCHDAYS
-- ============================================
CREATE TABLE IF NOT EXISTS matchdays (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  matchday_number INTEGER NOT NULL,
  date DATE,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed'))
);

-- ============================================
-- 6. TABEL MATCHES
-- ============================================
CREATE TABLE IF NOT EXISTS matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  matchday_id UUID REFERENCES matchdays(id) ON DELETE CASCADE,
  team_a_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  team_b_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  court INTEGER DEFAULT 1,
  start_time TEXT DEFAULT '16:00',
  end_time TEXT DEFAULT '18:00',
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  winner_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. TABEL PAIR_MATCH_RESULTS
-- ============================================
CREATE TABLE IF NOT EXISTS pair_match_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  team_a_pair_id UUID REFERENCES pairs(id) ON DELETE SET NULL,
  team_b_pair_id UUID REFERENCES pairs(id) ON DELETE SET NULL,
  score_team_a INTEGER DEFAULT 0,
  score_team_b INTEGER DEFAULT 0,
  winner_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed'))
);

-- ============================================
-- 8. TABEL USERS (Admin)
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'operator' CHECK (role IN ('super_admin', 'admin', 'operator')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. TABEL AUDIT_LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  user_name TEXT,
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES untuk performa
-- ============================================
CREATE INDEX IF NOT EXISTS idx_teams_active ON teams(is_active);
CREATE INDEX IF NOT EXISTS idx_players_team ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_pairs_team ON pairs(team_id);
CREATE INDEX IF NOT EXISTS idx_matches_matchday ON matches(matchday_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_pair_results_match ON pair_match_results(match_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Enable RLS untuk semua tabel
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE matchdays ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE pair_match_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Public read access untuk semua tabel (kecuali admin_users dan audit_logs)
CREATE POLICY "Public read access" ON leagues FOR SELECT USING (true);
CREATE POLICY "Public read access" ON teams FOR SELECT USING (true);
CREATE POLICY "Public read access" ON players FOR SELECT USING (true);
CREATE POLICY "Public read access" ON pairs FOR SELECT USING (true);
CREATE POLICY "Public read access" ON matchdays FOR SELECT USING (true);
CREATE POLICY "Public read access" ON matches FOR SELECT USING (true);
CREATE POLICY "Public read access" ON pair_match_results FOR SELECT USING (true);

-- Policy: Public write access (untuk demo, bisa diperketat nanti dengan auth)
CREATE POLICY "Public write access" ON leagues FOR INSERT WITH CHECK (true);
CREATE POLICY "Public write access" ON leagues FOR UPDATE USING (true);
CREATE POLICY "Public write access" ON teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Public write access" ON teams FOR UPDATE USING (true);
CREATE POLICY "Public write access" ON teams FOR DELETE USING (true);
CREATE POLICY "Public write access" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Public write access" ON players FOR UPDATE USING (true);
CREATE POLICY "Public write access" ON players FOR DELETE USING (true);
CREATE POLICY "Public write access" ON pairs FOR INSERT WITH CHECK (true);
CREATE POLICY "Public write access" ON pairs FOR UPDATE USING (true);
CREATE POLICY "Public write access" ON pairs FOR DELETE USING (true);
CREATE POLICY "Public write access" ON matchdays FOR INSERT WITH CHECK (true);
CREATE POLICY "Public write access" ON matchdays FOR UPDATE USING (true);
CREATE POLICY "Public write access" ON matchdays FOR DELETE USING (true);
CREATE POLICY "Public write access" ON matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Public write access" ON matches FOR UPDATE USING (true);
CREATE POLICY "Public write access" ON matches FOR DELETE USING (true);
CREATE POLICY "Public write access" ON pair_match_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Public write access" ON pair_match_results FOR UPDATE USING (true);
CREATE POLICY "Public write access" ON pair_match_results FOR DELETE USING (true);
CREATE POLICY "Public write access" ON admin_users FOR SELECT USING (true);
CREATE POLICY "Public write access" ON admin_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Public write access" ON admin_users FOR UPDATE USING (true);
CREATE POLICY "Public write access" ON admin_users FOR DELETE USING (true);
CREATE POLICY "Public write access" ON audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read access" ON audit_logs FOR SELECT USING (true);

-- ============================================
-- INSERT DEFAULT DATA
-- ============================================

-- Insert default league
INSERT INTO leagues (id, name, season, description, status, settings) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'SOQ.COMM PADEL LEAGUE',
  '2025',
  'One League. One Community. One Passion. Kompetisi padel yang mempertemukan komunitas, klub, dan pemain terbaik dalam semangat sportivitas dan persaudaraan.',
  'ongoing',
  '{"teams_count": 8, "pairs_per_team": 5, "pairs_played": 4, "courts_count": 2, "points_win": 3, "points_draw": 1, "points_loss": 0, "tiebreak_order": ["total_points", "pair_difference", "pair_wins", "head_to_head"], "match_format": "single_set", "target_games": 6, "golden_point": false}'
);

-- Insert default admin user
INSERT INTO admin_users (id, name, email, password_hash, role, is_active) VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Super Admin',
  'admin@soqcomm.com',
  'cGFkZWwyMDI1', -- base64 of 'padel2025'
  'super_admin',
  true
);

-- Insert 8 default teams
INSERT INTO teams (id, name, captain, description, is_active) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Papua Padel Club', 'Andi Prasetyo', 'Klub padel dari Sorong', true),
  ('10000000-0000-0000-0000-000000000002', 'Sorong Padel United', 'Budi Santoso', 'Klub padel komunitas Sorong', true),
  ('10000000-0000-0000-0000-000000000003', 'Raja Ampat Padel', 'Carlos Wospakrik', 'Klub padel dari Raja Ampat', true),
  ('10000000-0000-0000-0000-000000000004', 'Bird of Paradise', 'Daniel Inubun', 'Klub padel Cendrawasih', true),
  ('10000000-0000-0000-0000-000000000005', 'West Papua Padel', 'Erik Mambrasar', 'Klub padel Papua Barat Daya', true),
  ('10000000-0000-0000-0000-000000000006', 'Cendrawasih Padel FC', 'Fajar Rumbekas', 'Klub padel Cendrawasih FC', true),
  ('10000000-0000-0000-0000-000000000007', 'Pacific Padel Team', 'Gregory Flassy', 'Klub padel Pasifik', true),
  ('10000000-0000-0000-0000-000000000008', 'Coral Reef Padel', 'Hans Kambuaya', 'Klub padel terumbu karang', true);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function untuk auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers untuk auto-update
CREATE TRIGGER update_leagues_updated_at BEFORE UPDATE ON leagues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SELESAI! Database siap digunakan.
-- ============================================
