import { supabase } from './lib/supabase';
import { League, Team, Player, Pair, Matchday, Match, PairMatchResult, Standing, User, AuditLog } from './types';
import { v4 as uuidv4 } from 'uuid';

// Default settings
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

// Calculate standings from match results
function calculateStandings(matches: Match[], results: PairMatchResult[], teams: Team[]): Standing[] {
  const standings: Record<string, Standing> = {};
  
  teams.forEach(t => {
    standings[t.id] = {
      team_id: t.id,
      played: 0,
      total_points: 0,
      pair_wins: 0,
      pair_losses: 0,
      pair_difference: 0,
      head_to_head_points: {},
    };
  });

  const completedMatches = matches.filter(m => m.status === 'completed');
  
  completedMatches.forEach(match => {
    if (standings[match.team_a_id]) standings[match.team_a_id].played++;
    if (standings[match.team_b_id]) standings[match.team_b_id].played++;

    const matchResults = results.filter(r => r.match_id === match.id && r.status === 'completed');
    let teamAPoints = 0, teamBPoints = 0;
    let teamAWins = 0, teamBWins = 0;

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
      if (!s.head_to_head_points) s.head_to_head_points = {};
      s.head_to_head_points[match.team_b_id] = (s.head_to_head_points[match.team_b_id] || 0) + teamAPoints;
    }

    if (standings[match.team_b_id]) {
      const s = standings[match.team_b_id];
      s.total_points += teamBPoints;
      s.pair_wins += teamBWins;
      s.pair_losses += teamAWins;
      s.pair_difference = s.pair_wins - s.pair_losses;
      if (!s.head_to_head_points) s.head_to_head_points = {};
      s.head_to_head_points[match.team_a_id] = (s.head_to_head_points[match.team_a_id] || 0) + teamBPoints;
    }
  });

  return Object.values(standings).sort((a, b) => {
    if (b.total_points !== a.total_points) return b.total_points - a.total_points;
    if (b.pair_difference !== a.pair_difference) return b.pair_difference - a.pair_difference;
    if (b.pair_wins !== a.pair_wins) return b.pair_wins - a.pair_wins;
    const h2hA = a.head_to_head_points?.[b.team_id] || 0;
    const h2hB = b.head_to_head_points?.[a.team_id] || 0;
    return h2hB - h2hA;
  });
}

// Store class dengan Supabase + in-memory cache
class Store {
  private listeners: Set<() => void> = new Set();
  private currentUser: User | null = null;
  
  // In-memory cache
  private league: League | null = null;
  private teams: Team[] = [];
  private players: Player[] = [];
  private pairs: Pair[] = [];
  private matchdays: Matchday[] = [];
  private matches: Match[] = [];
  private pairResults: PairMatchResult[] = [];
  private users: User[] = [];
  private initialized = false;

  // Initialize - load all data from Supabase
  async init() {
    if (this.initialized) return;
    
    try {
      // Load all data in parallel
      const [leagueData, teamsData, playersData, pairsData, matchdaysData, matchesData, resultsData, usersData] = await Promise.all([
        supabase.from('leagues').select('*').limit(1).single(),
        supabase.from('teams').select('*').order('name'),
        supabase.from('players').select('*').order('name'),
        supabase.from('pairs').select('*'),
        supabase.from('matchdays').select('*').order('matchday_number'),
        supabase.from('matches').select('*').order('created_at', { ascending: false }),
        supabase.from('pair_match_results').select('*'),
        supabase.from('admin_users').select('*').order('created_at'),
      ]);

      // Set league
      if (leagueData.data) {
        this.league = {
          id: leagueData.data.id,
          name: leagueData.data.name,
          logo_url: leagueData.data.logo_url || '',
          season: leagueData.data.season || '2025',
          description: leagueData.data.description || '',
          status: leagueData.data.status || 'ongoing',
          settings: leagueData.data.settings || DEFAULT_SETTINGS,
          created_at: leagueData.data.created_at,
          updated_at: leagueData.data.updated_at,
        };
      } else {
        // Create default league
        const { data } = await supabase.from('leagues').insert([{
          name: 'SOQ.COMM PADEL LEAGUE',
          season: '2025',
          description: 'One League. One Community. One Passion.',
          status: 'ongoing',
          settings: DEFAULT_SETTINGS,
        }]).select().single();
        
        if (data) {
          this.league = {
            id: data.id,
            name: data.name,
            logo_url: data.logo_url || '',
            season: data.season || '2025',
            description: data.description || '',
            status: data.status || 'ongoing',
            settings: data.settings || DEFAULT_SETTINGS,
            created_at: data.created_at,
            updated_at: data.updated_at,
          };
        }
      }

      // Set other data
      this.teams = teamsData.data || [];
      this.players = playersData.data || [];
      this.pairs = pairsData.data || [];
      this.matchdays = matchdaysData.data || [];
      this.matches = matchesData.data || [];
      this.pairResults = resultsData.data || [];
      this.users = usersData.data || [];

      // Create default admin if no users
      if (this.users.length === 0) {
        const { data } = await supabase.from('admin_users').insert([{
          name: 'Super Admin',
          email: 'admin@soqcomm.com',
          password_hash: btoa('padel2025'),
          role: 'super_admin',
          is_active: true,
        }]).select().single();
        
        if (data) {
          this.users = [data];
        }
      }

      // Create default teams if no teams
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
        if (data) {
          this.teams = data;
        }
      }

      this.initialized = true;
      this.notify();
    } catch (error) {
      console.error('Error initializing store:', error);
    }
  }

  // League
  getLeague(): League {
    return this.league || {
      id: 'default',
      name: 'SOQ.COMM PADEL LEAGUE',
      logo_url: '',
      season: '2025',
      description: 'One League. One Community. One Passion.',
      status: 'ongoing',
      settings: DEFAULT_SETTINGS,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  async saveLeague(league: Partial<League> & { id: string }) {
    if (!this.league) return;

    const { error } = await supabase
      .from('leagues')
      .update({
        name: league.name,
        logo_url: league.logo_url,
        season: league.season,
        description: league.description,
        status: league.status,
        settings: league.settings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', league.id);

    if (!error && this.league) {
      this.league = { ...this.league, ...league, updated_at: new Date().toISOString() };
      this.notify();
    }
  }

  // Teams
  getTeams(): Team[] {
    return this.teams;
  }

  async addTeam(team: Omit<Team, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('teams')
      .insert([team])
      .select()
      .single();

    if (!error && data) {
      this.teams = [...this.teams, data];
      this.notify();
      return data;
    }
    return null;
  }

  async updateTeam(team: Team) {
    const { error } = await supabase
      .from('teams')
      .update({
        name: team.name,
        logo_url: team.logo_url,
        captain: team.captain,
        description: team.description,
        is_active: team.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', team.id);

    if (!error) {
      this.teams = this.teams.map(t => t.id === team.id ? { ...team, updated_at: new Date().toISOString() } : t);
      this.notify();
    }
  }

  // Players
  getPlayers(): Player[] {
    return this.players;
  }

  async addPlayer(player: Omit<Player, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('players')
      .insert([player])
      .select()
      .single();

    if (!error && data) {
      this.players = [...this.players, data];
      this.notify();
      return data;
    }
    return null;
  }

  async updatePlayer(player: Player) {
    const { error } = await supabase
      .from('players')
      .update({
        name: player.name,
        team_id: player.team_id,
        photo_url: player.photo_url,
        is_active: player.is_active,
      })
      .eq('id', player.id);

    if (!error) {
      this.players = this.players.map(p => p.id === player.id ? player : p);
      this.notify();
    }
  }

  // Pairs
  getPairs(): Pair[] {
    return this.pairs;
  }

  // Matchdays
  getMatchdays(): Matchday[] {
    return this.matchdays;
  }

  // Matches
  getMatches(): Match[] {
    return this.matches;
  }

  async addMatch(match: Omit<Match, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('matches')
      .insert([match])
      .select()
      .single();

    if (!error && data) {
      this.matches = [...this.matches, data];
      this.notify();
      return data;
    }
    return null;
  }

  async updateMatch(match: Match) {
    const { error } = await supabase
      .from('matches')
      .update({
        matchday_id: match.matchday_id,
        team_a_id: match.team_a_id,
        team_b_id: match.team_b_id,
        court: match.court,
        start_time: match.start_time,
        end_time: match.end_time,
        status: match.status,
        winner_team_id: match.winner_team_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', match.id);

    if (!error) {
      this.matches = this.matches.map(m => m.id === match.id ? { ...match, updated_at: new Date().toISOString() } : m);
      this.notify();
    }
  }

  async deleteMatch(matchId: string) {
    await supabase.from('pair_match_results').delete().eq('match_id', matchId);
    
    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', matchId);

    if (!error) {
      this.matches = this.matches.filter(m => m.id !== matchId);
      this.pairResults = this.pairResults.filter(r => r.match_id !== matchId);
      this.notify();
    }
  }

  // Pair Match Results
  getPairResults(): PairMatchResult[] {
    return this.pairResults;
  }

  async saveMatchResult(matchId: string, results: Omit<PairMatchResult, 'id'>[]) {
    await supabase.from('pair_match_results').delete().eq('match_id', matchId);

    const { data, error } = await supabase
      .from('pair_match_results')
      .insert(results)
      .select();

    if (!error && data) {
      this.pairResults = [
        ...this.pairResults.filter(r => r.match_id !== matchId),
        ...data,
      ];

      // Update match status and winner
      const match = this.matches.find(m => m.id === matchId);
      if (match) {
        let aPoints = 0, bPoints = 0;
        results.forEach(r => {
          aPoints += r.score_team_a;
          bPoints += r.score_team_b;
        });
        
        match.winner_team_id = aPoints > bPoints ? match.team_a_id : bPoints > aPoints ? match.team_b_id : null;
        match.status = 'completed';
        await this.updateMatch(match);
      }

      this.notify();
    }
  }

  // Standings
  getStandings(): Standing[] {
    return calculateStandings(this.matches, this.pairResults, this.teams);
  }

  // Users
  getUsers(): User[] {
    return this.users;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAdminLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  async loginUser(email: string, password: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .eq('password_hash', btoa(password))
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return null;
    }

    this.currentUser = data;
    await this.addAuditLog(data.id, data.name, 'LOGIN', 'User logged in');
    this.notify();
    return this.currentUser;
  }

  async logoutUser() {
    if (this.currentUser) {
      await this.addAuditLog(this.currentUser.id, this.currentUser.name, 'LOGOUT', 'User logged out');
    }
    this.currentUser = null;
    this.notify();
  }

  async addUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('admin_users')
      .insert([{
        ...user,
        password_hash: btoa(user.password_hash),
      }])
      .select()
      .single();

    if (!error && data) {
      this.users = [...this.users, data];
      if (this.currentUser) {
        await this.addAuditLog(this.currentUser.id, this.currentUser.name, 'ADD_USER', `Added user: ${user.name}`);
      }
      this.notify();
      return data;
    }
    return null;
  }

  async updateUser(user: User) {
    const { error } = await supabase
      .from('admin_users')
      .update({
        name: user.name,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (!error) {
      this.users = this.users.map(u => u.id === user.id ? { ...user, updated_at: new Date().toISOString() } : u);
      if (this.currentUser) {
        await this.addAuditLog(this.currentUser.id, this.currentUser.name, 'UPDATE_USER', `Updated user: ${user.name}`);
      }
      this.notify();
    }
  }

  async deleteUser(userId: string) {
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', userId);

    if (!error) {
      this.users = this.users.filter(u => u.id !== userId);
      if (this.currentUser) {
        await this.addAuditLog(this.currentUser.id, this.currentUser.name, 'DELETE_USER', `Deleted user: ${userId}`);
      }
      this.notify();
    }
  }

  // Audit Logs
  async addAuditLog(userId: string, userName: string, action: string, details: string) {
    await supabase
      .from('audit_logs')
      .insert([{
        user_id: userId,
        user_name: userName,
        action,
        details,
      }]);
  }

  // Generate schedule
  async generateSchedule(teams: Team[], startDate: string, courts: number, replaceExisting: boolean) {
    const n = teams.length;
    if (n < 2) return;

    const matchdays: Omit<Matchday, 'id'>[] = [];
    const matches: Omit<Match, 'id' | 'created_at' | 'updated_at'>[] = [];
    const numRounds = n - 1;

    // Circle method for round-robin
    const teamIds = teams.map(t => t.id);
    if (n % 2 === 1) teamIds.push('BYE');

    const start = new Date(startDate);

    for (let round = 0; round < numRounds; round++) {
      const date = new Date(start);
      date.setDate(date.getDate() + round * 7);
      
      const matchday: Omit<Matchday, 'id'> = {
        league_id: this.league?.id || '',
        name: `Matchday ${round + 1}`,
        matchday_number: round + 1,
        date: date.toISOString().split('T')[0],
        status: 'upcoming',
      };
      matchdays.push(matchday);

      // Generate pairings for this round
      const roundFixtures: [string, string][] = [];
      for (let i = 0; i < Math.floor(n / 2); i++) {
        const homeIdx = (round + i) % (n - 1);
        const awayIdx = (n - 1 - i + round) % (n - 1);
        if (homeIdx !== awayIdx) {
          roundFixtures.push([teamIds[homeIdx], teamIds[awayIdx]]);
        }
      }

      // Assign to courts and time slots
      roundFixtures.forEach((fixture, idx) => {
        const court = (idx % courts) + 1;
        const slot = Math.floor(idx / courts);
        const startHour = 16 + slot * 2;
        
        matches.push({
          matchday_id: '', // Will be set after matchday is created
          team_a_id: fixture[0],
          team_b_id: fixture[1],
          court,
          start_time: `${startHour}:00`,
          end_time: `${startHour + 2}:00`,
          status: 'upcoming',
          winner_team_id: null,
        });
      });

      // Rotate teams (circle method)
      const last = teamIds.pop()!;
      teamIds.splice(1, 0, last);
    }

    if (replaceExisting) {
      // Delete existing upcoming matchdays and matches
      const upcomingMatchdays = this.matchdays.filter(md => md.status !== 'completed');
      for (const md of upcomingMatchdays) {
        await supabase.from('matches').delete().eq('matchday_id', md.id);
        await supabase.from('matchdays').delete().eq('id', md.id);
      }
      this.matchdays = this.matchdays.filter(md => md.status === 'completed');
      this.matches = this.matches.filter(m => {
        const md = this.matchdays.find(d => d.id === m.matchday_id);
        return md !== undefined;
      });
    }

    // Insert new matchdays and matches
    for (let i = 0; i < matchdays.length; i++) {
      const { data: mdData } = await supabase.from('matchdays').insert([matchdays[i]]).select().single();
      if (mdData) {
        this.matchdays = [...this.matchdays, mdData];
        
        // Insert matches for this matchday
        const roundMatches = matches.slice(i * Math.floor(n / 2), (i + 1) * Math.floor(n / 2));
        for (const match of roundMatches) {
          const { data: matchData } = await supabase.from('matches').insert([{
            ...match,
            matchday_id: mdData.id,
          }]).select().single();
          
          if (matchData) {
            this.matches = [...this.matches, matchData];
          }
        }
      }
    }

    if (this.currentUser) {
      await this.addAuditLog(this.currentUser.id, this.currentUser.name, 'GENERATE_SCHEDULE', `Generated ${matches.length} matches`);
    }

    this.notify();
  }

  // Reset functions
  async resetCompetitionData() {
    await supabase.from('pair_match_results').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('matches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('matchdays').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    this.matches = [];
    this.matchdays = [];
    this.pairResults = [];

    if (this.currentUser) {
      await this.addAuditLog(this.currentUser.id, this.currentUser.name, 'RESET_COMPETITION', 'Reset competition data');
    }

    this.notify();
  }

  async resetFullLeague() {
    await supabase.from('pair_match_results').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('matches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('matchdays').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('pairs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('players').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('teams').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('admin_users').delete().neq('role', 'super_admin');

    this.matches = [];
    this.matchdays = [];
    this.pairResults = [];
    this.pairs = [];
    this.players = [];
    this.teams = this.teams.filter(t => t.id === '00000000-0000-0000-0000-000000000000');
    this.users = this.users.filter(u => u.role === 'super_admin');

    if (this.currentUser) {
      await this.addAuditLog(this.currentUser.id, this.currentUser.name, 'RESET_FULL', 'Full league reset');
    }

    this.notify();
  }

  // Subscription
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(l => l());
  }
}

export const store = new Store();
