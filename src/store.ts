import { supabase } from './lib/supabase';
import { League, Team, Player, Pair, Matchday, Match, PairMatchResult, Standing, User, AuditLog, MVP } from './types';

const DEFAULT_SETTINGS = {
  teams_count: 8,
  pairs_per_team: 5,
  pairs_played: 4,
  courts_count: 2,
  points_win: 3,
  points_draw: 1,
  points_loss: 0,
  tiebreak_order: ['total_points', 'pair_difference', 'pair_wins', 'head_to_head'],
  match_format: 'single_set',
  target_games: 6,
  golden_point: false,
};

function calculateStandings(matches: Match[], results: PairMatchResult[], teams: Team[]): Standing[] {
  const standings: Record<string, Standing> = {};
  teams.forEach(t => {
    standings[t.id] = { team_id: t.id, played: 0, total_points: 0, pair_wins: 0, pair_losses: 0, pair_difference: 0, head_to_head_points: {} };
  });

  matches.filter(m => m.status === 'completed').forEach(match => {
    if (standings[match.team_a_id]) standings[match.team_a_id].played++;
    if (standings[match.team_b_id]) standings[match.team_b_id].played++;

    const matchResults = results.filter(r => r.match_id === match.id && r.status === 'completed');
    let teamAPoints = 0, teamBPoints = 0, teamAWins = 0, teamBWins = 0;

    matchResults.forEach(r => {
      teamAPoints += r.score_team_a;
      teamBPoints += r.score_team_b;
      if (r.winner_team_id === match.team_a_id) teamAWins++;
      else if (r.winner_team_id === match.team_b_id) teamBWins++;
    });

    if (standings[match.team_a_id]) {
      const s = standings[match.team_a_id];
      s.total_points += teamAPoints;
      s.pair_wins += teamAWins;
      s.pair_losses += teamBWins;
      s.pair_difference = s.pair_wins - s.pair_losses;
    }

    if (standings[match.team_b_id]) {
      const s = standings[match.team_b_id];
      s.total_points += teamBPoints;
      s.pair_wins += teamBWins;
      s.pair_losses += teamAWins;
      s.pair_difference = s.pair_wins - s.pair_losses;
    }
  });

  return Object.values(standings).sort((a, b) => {
    if (b.total_points !== a.total_points) return b.total_points - a.total_points;
    if (b.pair_difference !== a.pair_difference) return b.pair_difference - a.pair_difference;
    return b.pair_wins - a.pair_wins;
  });
}

class Store {
  private listeners: Set<() => void> = new Set();
  private currentUser: User | null = null;
  private league: League | null = null;
  private teams: Team[] = [];
  private players: Player[] = [];
  private pairs: Pair[] = [];
  private matchdays: Matchday[] = [];
  private matches: Match[] = [];
  private pairResults: PairMatchResult[] = [];
  private users: User[] = [];
  private mvps: MVP[] = [];
  private initialized = false;

  async init() {
    if (this.initialized) return;
    try {
      const [leagueData, teamsData, playersData, pairsData, matchdaysData, matchesData, resultsData, usersData, mvpsData] = await Promise.all([
        supabase.from('leagues').select('*').limit(1).single(),
        supabase.from('teams').select('*').order('name'),
        supabase.from('players').select('*').order('name'),
        supabase.from('pairs').select('*'),
        supabase.from('matchdays').select('*').order('matchday_number'),
        supabase.from('matches').select('*'),
        supabase.from('pair_match_results').select('*'),
        supabase.from('admin_users').select('*'),
        supabase.from('mvps').select('*'),
      ]);

      if (leagueData.data) {
        this.league = { ...leagueData.data, settings: leagueData.data.settings || DEFAULT_SETTINGS };
      } else {
        const { data } = await supabase.from('leagues').insert([{
          name: 'SOQ.COMM PADEL LEAGUE',
          season: '2025',
          description: 'One League. One Community. One Passion.',
          status: 'ongoing',
          settings: DEFAULT_SETTINGS,
        }]).select().single();
        if (data) this.league = { ...data, settings: data.settings || DEFAULT_SETTINGS };
      }

      this.teams = teamsData.data || [];
      this.players = playersData.data || [];
      this.pairs = pairsData.data || [];
      this.matchdays = matchdaysData.data || [];
      this.matches = matchesData.data || [];
      this.pairResults = resultsData.data || [];
      this.users = usersData.data || [];
      this.mvps = mvpsData.data || [];

      if (this.users.length === 0) {
        const { data } = await supabase.from('admin_users').insert([{
          name: 'Super Admin',
          email: 'admin@soqcomm.com',
          password_hash: btoa('padel2025'),
          role: 'super_admin',
          is_active: true,
        }]).select().single();
        if (data) this.users = [data];
      }

      if (this.teams.length === 0) {
        const defaultTeams = [
          { name: 'Papua Padel Club', captain: 'Andi Prasetyo', description: 'Klub padel dari Sorong' },
          { name: 'Sorong Padel United', captain: 'Budi Santoso', description: 'Klub padel komunitas Sorong' },
          { name: 'Raja Ampat Padel', captain: 'Carlos Wospakrik', description: 'Klub padel dari Raja Ampat' },
          { name: 'Bird of Paradise', captain: 'Daniel Inubun', description: 'Klub padel Cendrawasih' },
          { name: 'West Papua Padel', captain: 'Erik Mambrasar', description: 'Klub padel Papua Barat Daya' },
          { name: 'Cendrawasih Padel FC', captain: 'Fajar Rumbekas', description: 'Klub padel Cendrawasih FC' },
          { name: 'Pacific Padel Team', captain: 'Gregory Flassy', description: 'Klub padel Pasifik' },
          { name: 'Coral Reef Padel', captain: 'Hans Kambuaya', description: 'Klub padel terumbu karang' },
        ];
        const { data } = await supabase.from('teams').insert(defaultTeams).select();
        if (data) this.teams = data;
      }

      this.initialized = true;
      this.notify();
    } catch (error) {
      console.error('Error initializing store:', error);
    }
  }

  getLeague(): League {
    return this.league || { id: 'default', name: 'SOQ.COMM PADEL LEAGUE', logo_url: '', season: '2025', description: '', status: 'ongoing', settings: DEFAULT_SETTINGS, created_at: '', updated_at: '' };
  }

  async saveLeague(league: Partial<League> & { id: string }) {
    if (!this.league) return;
    const { error } = await supabase.from('leagues').update({
      name: league.name, logo_url: league.logo_url, season: league.season,
      description: league.description, status: league.status, settings: league.settings,
    }).eq('id', league.id);
    if (!error) {
      this.league = { ...this.league, ...league };
      this.notify();
    }
  }

  getTeams(): Team[] { return this.teams; }
  async addTeam(team: Omit<Team, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase.from('teams').insert([team]).select().single();
    if (!error && data) { this.teams = [...this.teams, data]; this.notify(); return data; }
    return null;
  }
  async updateTeam(team: Team) {
    const { error } = await supabase.from('teams').update({
      name: team.name, logo_url: team.logo_url, captain: team.captain, description: team.description, is_active: team.is_active,
    }).eq('id', team.id);
    if (!error) { this.teams = this.teams.map(t => t.id === team.id ? team : t); this.notify(); }
  }

  getPlayers(): Player[] { return this.players; }
  async addPlayer(player: Omit<Player, 'id' | 'created_at'>) {
    const { data, error } = await supabase.from('players').insert([player]).select().single();
    if (!error && data) { this.players = [...this.players, data]; this.notify(); return data; }
    return null;
  }
  async updatePlayer(player: Player) {
    const { error } = await supabase.from('players').update({
      name: player.name, team_id: player.team_id, photo_url: player.photo_url, is_active: player.is_active,
    }).eq('id', player.id);
    if (!error) { this.players = this.players.map(p => p.id === player.id ? player : p); this.notify(); }
  }

  getPairs(): Pair[] { return this.pairs; }
  getMatchdays(): Matchday[] { return this.matchdays; }
  getMatches(): Match[] { return this.matches; }
  async addMatch(match: Omit<Match, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase.from('matches').insert([match]).select().single();
    if (!error && data) { this.matches = [...this.matches, data]; this.notify(); return data; }
    return null;
  }
  async updateMatch(match: Match) {
    const { error } = await supabase.from('matches').update({
      matchday_id: match.matchday_id, team_a_id: match.team_a_id, team_b_id: match.team_b_id,
      court: match.court, start_time: match.start_time, end_time: match.end_time,
      status: match.status, winner_team_id: match.winner_team_id,
    }).eq('id', match.id);
    if (!error) { this.matches = this.matches.map(m => m.id === match.id ? match : m); this.notify(); }
  }
  async deleteMatch(matchId: string) {
    await supabase.from('pair_match_results').delete().eq('match_id', matchId);
    const { error } = await supabase.from('matches').delete().eq('id', matchId);
    if (!error) {
      this.matches = this.matches.filter(m => m.id !== matchId);
      this.pairResults = this.pairResults.filter(r => r.match_id !== matchId);
      this.notify();
    }
  }

  getPairResults(): PairMatchResult[] { return this.pairResults; }
  async saveMatchResult(matchId: string, results: Omit<PairMatchResult, 'id'>[]) {
    await supabase.from('pair_match_results').delete().eq('match_id', matchId);
    const { data, error } = await supabase.from('pair_match_results').insert(results).select();
    if (!error && data) {
      this.pairResults = [...this.pairResults.filter(r => r.match_id !== matchId), ...data];
      const match = this.matches.find(m => m.id === matchId);
      if (match) {
        let aPoints = 0, bPoints = 0;
        results.forEach(r => { aPoints += r.score_team_a; bPoints += r.score_team_b; });
        match.winner_team_id = aPoints > bPoints ? match.team_a_id : bPoints > aPoints ? match.team_b_id : null;
        match.status = 'completed';
        await this.updateMatch(match);
      }
      this.notify();
    }
  }

  getStandings(): Standing[] { return calculateStandings(this.matches, this.pairResults, this.teams); }
  getUsers(): User[] { return this.users; }
  getCurrentUser(): User | null { return this.currentUser; }
  isAdminLoggedIn(): boolean { return this.currentUser !== null; }

  async loginUser(email: string, password: string): Promise<User | null> {
    const { data, error } = await supabase.from('admin_users').select('*').eq('email', email).eq('password_hash', btoa(password)).eq('is_active', true).single();
    if (error || !data) return null;
    this.currentUser = data;
    this.notify();
    return this.currentUser;
  }

  async logoutUser() {
    this.currentUser = null;
    this.notify();
  }

  async addUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase.from('admin_users').insert([{ ...user, password_hash: btoa(user.password_hash) }]).select().single();
    if (!error && data) { this.users = [...this.users, data]; this.notify(); return data; }
    return null;
  }
  async updateUser(user: User) {
    const { error } = await supabase.from('admin_users').update({
      name: user.name, email: user.email, role: user.role, is_active: user.is_active,
    }).eq('id', user.id);
    if (!error) { this.users = this.users.map(u => u.id === user.id ? user : u); this.notify(); }
  }
  async deleteUser(userId: string) {
    const { error } = await supabase.from('admin_users').delete().eq('id', userId);
    if (!error) { this.users = this.users.filter(u => u.id !== userId); this.notify(); }
  }

  getMVPs(): MVP[] { return this.mvps; }
  async addMVP(mvp: Omit<MVP, 'id' | 'created_at'>) {
    const { data, error } = await supabase.from('mvps').insert([mvp]).select().single();
    if (!error && data) { this.mvps = [data, ...this.mvps]; this.notify(); return data; }
    return null;
  }
  async updateMVP(mvp: MVP) {
    const { error } = await supabase.from('mvps').update({
      matchday_id: mvp.matchday_id, player_id: mvp.player_id, reason: mvp.reason,
    }).eq('id', mvp.id);
    if (!error) { this.mvps = this.mvps.map(m => m.id === mvp.id ? mvp : m); this.notify(); }
  }
  async deleteMVP(mvpId: string) {
    const { error } = await supabase.from('mvps').delete().eq('id', mvpId);
    if (!error) { this.mvps = this.mvps.filter(m => m.id !== mvpId); this.notify(); }
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(l => l());
  }
}

export const store = new Store();
