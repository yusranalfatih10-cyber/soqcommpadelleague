export interface League {
  id: string;
  name: string;
  logo_url: string;
  season: string;
  description: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  settings: LeagueSettings;
  created_at: string;
  updated_at: string;
}

export interface LeagueSettings {
  teams_count: number;
  pairs_per_team: number;
  pairs_played: number;
  courts_count: number;
  points_win: number;
  points_draw: number;
  points_loss: number;
  tiebreak_order: string[];
  match_format: string;
  target_games: number;
  golden_point: boolean;
}

export interface Team {
  id: string;
  name: string;
  logo_url: string;
  captain: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Player {
  id: string;
  team_id: string;
  name: string;
  photo_url: string;
  is_active: boolean;
  gender?: 'male' | 'female' | '';
  position?: 'right' | 'left' | 'both' | '';
  strengths?: string[]; // Keunggulan pemain
  created_at: string;
}

export interface PlayerStats {
  totalMatches: number;
  totalWins: number;
  totalLosses: number;
  winPercentage: number;
}

export interface Pair {
  id: string;
  team_id: string;
  player_1_id: string;
  player_2_id: string;
  pair_name: string;
  is_active: boolean;
}

export interface MVP {
  id: string;
  matchday_id: string;
  player_id: string;
  reason: string;
  created_at: string;
}

export interface Matchday {
  id: string;
  league_id: string;
  name: string;
  matchday_number: number;
  date: string;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export interface Match {
  id: string;
  matchday_id: string;
  team_a_id: string;
  team_b_id: string;
  court: number;
  start_time: string;
  end_time: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  winner_team_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PairMatchResult {
  id: string;
  match_id: string;
  position: number;
  team_a_pair_id: string | null;
  team_b_pair_id: string | null;
  score_team_a: number;
  score_team_b: number;
  winner_team_id: string | null;
  status: 'pending' | 'completed';
}

export interface Standing {
  team_id: string;
  played: number;
  total_points: number;
  pair_wins: number;
  pair_losses: number;
  pair_difference: number;
  head_to_head_points?: Record<string, number>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'super_admin' | 'admin' | 'operator';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  details: string;
  timestamp: string;
}

export type Page = 'home' | 'standings' | 'schedule' | 'results' | 'teams' | 'players' | 'mvp' | 'statistics' | 'league-info' | 'match-detail' | 'team-detail';
export type AdminPage = 'dashboard' | 'settings' | 'teams' | 'players' | 'pairs' | 'schedule' | 'input-score' | 'results' | 'standings' | 'statistics' | 'system';
