-- SOQ.COMM PADEL LEAGUE - Database Schema
-- Copy semua isi file ini dan paste ke Supabase SQL Editor

-- 1. TABEL LEAGUES
CREATE TABLE leagues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'SOQ.COMM PADEL LEAGUE',
  logo_url TEXT DEFAULT '',
  season TEXT DEFAULT '2025',
  description TEXT DEFAULT 'One League. One Community. One Passion.',
  status TEXT DEFAULT 'ongoing',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL TEAMS
CREATE TABLE teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT DEFAULT '',
  captain TEXT DEFAULT '',
  description TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL PLAYERS
CREATE TABLE players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  photo_url TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL PAIRS
CREATE TABLE pairs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  player_1_id UUID REFERENCES players(id) ON DELETE SET NULL,
  player_2_id UUID REFERENCES players(id) ON DELETE SET NULL,
  pair_name TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true
);

-- 5. TABEL MATCHDAYS
CREATE TABLE matchdays (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  matchday_number INTEGER NOT NULL,
  date DATE,
  status TEXT DEFAULT 'upcoming'
);

-- 6. TABEL MATCHES
CREATE TABLE matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  matchday_id UUID REFERENCES matchdays(id) ON DELETE CASCADE,
  team_a_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  team_b_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  court INTEGER DEFAULT 1,
  start_time TEXT DEFAULT '16:00',
  end_time TEXT DEFAULT '18:00',
  status TEXT DEFAULT 'upcoming',
  winner_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABEL PAIR_MATCH_RESULTS
CREATE TABLE pair_match_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  team_a_pair_id UUID REFERENCES pairs(id) ON DELETE SET NULL,
  team_b_pair_id UUID REFERENCES pairs(id) ON DELETE SET NULL,
  score_team_a INTEGER DEFAULT 0,
  score_team_b INTEGER DEFAULT 0,
  winner_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending'
);

-- 8. TABEL ADMIN_USERS
CREATE TABLE admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'operator',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TABEL AUDIT_LOGS
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  user_name TEXT,
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE matchdays ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE pair_match_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- POLICIES - Allow all operations for now (can be restricted later)
CREATE POLICY "Enable all access" ON leagues FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON teams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON players FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON pairs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON matchdays FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON matches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON pair_match_results FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON admin_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON audit_logs FOR ALL USING (true) WITH CHECK (true);

-- INSERT DEFAULT DATA

-- Default League
INSERT INTO leagues (name, season, description, status, settings) VALUES (
  'SOQ.COMM PADEL LEAGUE',
  '2025',
  'One League. One Community. One Passion. Kompetisi padel yang mempertemukan komunitas, klub, dan pemain terbaik dalam semangat sportivitas dan persaudaraan.',
  'ongoing',
  '{"teams_count": 8, "pairs_per_team": 5, "pairs_played": 4, "courts_count": 2, "points_win": 3, "points_draw": 1, "points_loss": 0, "tiebreak_order": ["total_points", "pair_difference", "pair_wins", "head_to_head"], "match_format": "single_set", "target_games": 6, "golden_point": false}'
);

-- Default Admin User
INSERT INTO admin_users (name, email, password_hash, role, is_active) VALUES (
  'Super Admin',
  'admin@soqcomm.com',
  'cGFkZWwyMDI1',
  'super_admin',
  true
);

-- Default Teams (8 tim)
INSERT INTO teams (name, captain, description, is_active) VALUES
  ('Papua Padel Club', 'Andi Prasetyo', 'Klub padel dari Sorong', true),
  ('Sorong Padel United', 'Budi Santoso', 'Klub padel komunitas Sorong', true),
  ('Raja Ampat Padel', 'Carlos Wospakrik', 'Klub padel dari Raja Ampat', true),
  ('Bird of Paradise', 'Daniel Inubun', 'Klub padel Cendrawasih', true),
  ('West Papua Padel', 'Erik Mambrasar', 'Klub padel Papua Barat Daya', true),
  ('Cendrawasih Padel FC', 'Fajar Rumbekas', 'Klub padel Cendrawasih FC', true),
  ('Pacific Padel Team', 'Gregory Flassy', 'Klub padel Pasifik', true),
  ('Coral Reef Padel', 'Hans Kambuaya', 'Klub padel terumbu karang', true);

-- SELESAI! Database siap digunakan.
