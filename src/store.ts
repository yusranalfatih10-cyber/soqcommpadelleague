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

      // Auto-generate pairs from players if pairs table is empty
      if (this.pairs.length === 0 && this.players.length > 0) {
        await this.generatePairsFromPlayers();
      }

      this.initialized = true;
      this.notify();
    } catch (error: any) {
      console.error('Error initializing store:', error);
      // Fallback data jika Supabase gagal
      this.league = {
        id: 'fallback-league',
        name: 'SOQ.COMM PADEL LEAGUE',
        logo_url: '',
        season: '2025',
        description: 'One League. One Community. One Passion. Kompetisi padel yang mempertemukan komunitas, klub, dan pemain terbaik dalam semangat sportivitas dan persaudaraan.',
        status: 'ongoing',
        settings: DEFAULT_SETTINGS,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.teams = [
        { id: 'team-1', name: 'Papua Padel Club', logo_url: '', captain: 'Andi Prasetyo', description: 'Klub padel dari Sorong', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'team-2', name: 'Sorong Padel United', logo_url: '', captain: 'Budi Santoso', description: 'Klub padel komunitas Sorong', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'team-3', name: 'Raja Ampat Padel', logo_url: '', captain: 'Carlos Wospakrik', description: 'Klub padel dari Raja Ampat', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'team-4', name: 'Bird of Paradise', logo_url: '', captain: 'Daniel Inubun', description: 'Klub padel Cendrawasih', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'team-5', name: 'West Papua Padel', logo_url: '', captain: 'Erik Mambrasar', description: 'Klub padel Papua Barat Daya', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'team-6', name: 'Cendrawasih Padel FC', logo_url: '', captain: 'Fajar Rumbekas', description: 'Klub padel Cendrawasih FC', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'team-7', name: 'Pacific Padel Team', logo_url: '', captain: 'Gregory Flassy', description: 'Klub padel Pasifik', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'team-8', name: 'Coral Reef Padel', logo_url: '', captain: 'Hans Kambuaya', description: 'Klub padel terumbu karang', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ];
      this.users = [{
        id: 'user-1',
        name: 'Super Admin',
        email: 'admin@soqcomm.com',
        password_hash: btoa('padel2025'),
        role: 'super_admin',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }];
      this.initialized = true;
      this.notify();
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
    if (!error && data) { 
      this.players = [...this.players, data]; 
      // Auto-generate pairs after adding player
      await this.generatePairsFromPlayers();
      this.notify(); 
      return data; 
    }
    return null;
  }
  async updatePlayer(player: Player) {
    const { error } = await supabase.from('players').update({
      name: player.name, 
      team_id: player.team_id, 
      photo_url: player.photo_url, 
      is_active: player.is_active,
      gender: player.gender || null,
      position: player.position || null,
    }).eq('id', player.id);
    if (!error) { 
      this.players = this.players.map(p => p.id === player.id ? player : p); 
      this.notify(); 
    }
  }

  // Generate pairs automatically from active players
  async generatePairsFromPlayers() {
    const activePlayers = this.players.filter(p => p.is_active);
    const teams = this.teams.filter(t => t.is_active);
    
    // Clear existing pairs
    await supabase.from('pairs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    const newPairs: any[] = [];
    
    // For each team, create pairs from active players
    for (const team of teams) {
      const teamPlayers = activePlayers.filter(p => p.team_id === team.id);
      
      // Create pairs (2 players per pair)
      for (let i = 0; i < teamPlayers.length - 1; i += 2) {
        const player1 = teamPlayers[i];
        const player2 = teamPlayers[i + 1];
        
        if (player1 && player2) {
          newPairs.push({
            team_id: team.id,
            player_1_id: player1.id,
            player_2_id: player2.id,
            pair_name: `${player1.name} & ${player2.name}`,
            is_active: true,
          });
        }
      }
    }
    
    // Insert new pairs
    if (newPairs.length > 0) {
      const { data, error } = await supabase.from('pairs').insert(newPairs).select();
      if (!error && data) {
        this.pairs = data;
      }
    } else {
      this.pairs = [];
    }
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
  async saveMatchResult(matchId: string, results: Omit<PairMatchResult, 'id'>[], isDraft: boolean = false) {
    // Validasi matchId
    if (!matchId || matchId === '') {
      throw new Error('ID pertandingan tidak valid. Silakan pilih pertandingan kembali.');
    }

    // Validasi: pastikan semua 4 partai memiliki skor jika bukan draft
    if (!isDraft) {
      const hasAllScores = results.every(r => r.score_team_a >= 0 && r.score_team_b >= 0);
      if (!hasAllScores) {
        throw new Error('Semua partai harus memiliki skor yang valid');
      }
    }

    // Validasi UUID untuk setiap result
    results.forEach((r, idx) => {
      if (!r.match_id || r.match_id === '') {
        throw new Error(`ID pertandingan tidak valid pada partai ${idx + 1}`);
      }
      // team_a_pair_id dan team_b_pair_id boleh null, tapi tidak boleh string kosong
      if (r.team_a_pair_id === '') {
        throw new Error(`ID pasangan tim A tidak valid pada partai ${idx + 1}. Silakan periksa data pasangan.`);
      }
      if (r.team_b_pair_id === '') {
        throw new Error(`ID pasangan tim B tidak valid pada partai ${idx + 1}. Silakan periksa data pasangan.`);
      }
    });

    // Hapus hasil lama untuk match ini
    const { error: deleteError } = await supabase.from('pair_match_results').delete().eq('match_id', matchId);
    if (deleteError) {
      console.error('Error deleting old results:', deleteError);
      throw new Error('Gagal menghapus hasil lama: ' + deleteError.message);
    }

    // Insert hasil baru
    const { data, error } = await supabase.from('pair_match_results').insert(results).select();
    if (error) {
      console.error('Error inserting results:', error);
      throw new Error('Gagal menyimpan hasil: ' + error.message);
    }

    if (data) {
      // Update local state
      this.pairResults = [...this.pairResults.filter(r => r.match_id !== matchId), ...data];
      
      const match = this.matches.find(m => m.id === matchId);
      if (match) {
        // Hitung total poin
        let aPoints = 0, bPoints = 0;
        results.forEach(r => { 
          aPoints += r.score_team_a; 
          bPoints += r.score_team_b; 
        });

        // Update match berdasarkan status draft atau finalized
        if (isDraft) {
          // Draft: match tetap ongoing, results status pending
          match.status = 'ongoing';
          match.winner_team_id = null;
        } else {
          // Finalized: match completed, results completed
          match.status = 'completed';
          match.winner_team_id = aPoints > bPoints ? match.team_a_id : bPoints > aPoints ? match.team_b_id : null;
        }

        // Simpan update match ke database
        const { error: updateError } = await supabase
          .from('matches')
          .update({
            status: match.status,
            winner_team_id: match.winner_team_id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', match.id);

        if (updateError) {
          console.error('Error updating match:', updateError);
          throw new Error('Gagal update status match: ' + updateError.message);
        }

        // Update local matches array
        this.matches = this.matches.map(m => m.id === match.id ? { ...match, updated_at: new Date().toISOString() } : m);
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

  // Generate round-robin schedule with proper algorithm
  generateRoundRobin(teams: Team[]): { matchdays: any[]; matches: any[]; byeTeams: any[] } {
    const n = teams.length;
    if (n < 2) return { matchdays: [], matches: [], byeTeams: [] };

    // Shuffle teams for randomization
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
    const teamIds = shuffledTeams.map(t => t.id);
    
    // For odd number of teams, add BYE
    const hasBye = n % 2 === 1;
    if (hasBye) {
      teamIds.push('BYE');
    }
    
    const numTeams = teamIds.length;
    const numRounds = hasBye ? n : n - 1;
    const matchesPerRound = Math.floor(numTeams / 2);
    
    const matchdays: any[] = [];
    const matches: any[] = [];
    const byeTeams: any[] = [];
    
    // Circle method algorithm
    const fixed = teamIds[0]; // First team stays fixed
    const rotating = teamIds.slice(1); // Rest will rotate
    
    for (let round = 0; round < numRounds; round++) {
      const roundMatches: any[] = [];
      let byeTeam: string | null = null;
      
      // Create pairings for this round
      const currentRound = [fixed, ...rotating];
      
      for (let i = 0; i < matchesPerRound; i++) {
        const home = currentRound[i];
        const away = currentRound[numTeams - 1 - i];
        
        // Skip BYE matches
        if (home === 'BYE') {
          byeTeam = away;
          continue;
        }
        if (away === 'BYE') {
          byeTeam = home;
          continue;
        }
        
        // Randomize home/away orientation
        const swap = Math.random() > 0.5;
        roundMatches.push({
          team_a_id: swap ? away : home,
          team_b_id: swap ? home : away,
        });
      }
      
      // Shuffle match order within round
      roundMatches.sort(() => Math.random() - 0.5);
      
      matchdays.push({
        round: round + 1,
        matches: roundMatches,
        byeTeam: byeTeam,
      });
      
      if (byeTeam) {
        byeTeams.push({
          round: round + 1,
          teamId: byeTeam,
        });
      }
      
      // Rotate teams (circle method)
      if (rotating.length > 1) {
        const last = rotating.pop()!;
        rotating.unshift(last);
      }
    }
    
    return { matchdays, matches, byeTeams };
  }
  
  // Validate generated schedule
  validateSchedule(teams: Team[], schedule: any[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const n = teams.length;
    const expectedTotalMatches = (n * (n - 1)) / 2;
    const expectedRounds = n % 2 === 1 ? n : n - 1;
    
    // Count total matches
    let totalMatches = 0;
    const matchups = new Map<string, number>();
    const teamMatchCount = new Map<string, number>();
    const teamByeCount = new Map<string, number>();
    
    schedule.forEach((matchday, mdIdx) => {
      const teamsInRound = new Set<string>();
      
      matchday.matches.forEach((match: any) => {
        totalMatches++;
        
        // Check for duplicate matchups
        const key = [match.team_a_id, match.team_b_id].sort().join('-');
        matchups.set(key, (matchups.get(key) || 0) + 1);
        
        // Count team appearances
        teamMatchCount.set(match.team_a_id, (teamMatchCount.get(match.team_a_id) || 0) + 1);
        teamMatchCount.set(match.team_b_id, (teamMatchCount.get(match.team_b_id) || 0) + 1);
        
        // Check if team plays twice in same round
        if (teamsInRound.has(match.team_a_id)) {
          errors.push(`Tim ${match.team_a_id} bermain dua kali di Matchday ${mdIdx + 1}`);
        }
        if (teamsInRound.has(match.team_b_id)) {
          errors.push(`Tim ${match.team_b_id} bermain dua kali di Matchday ${mdIdx + 1}`);
        }
        teamsInRound.add(match.team_a_id);
        teamsInRound.add(match.team_b_id);
      });
      
      // Track bye
      if (matchday.byeTeam) {
        teamByeCount.set(matchday.byeTeam, (teamByeCount.get(matchday.byeTeam) || 0) + 1);
      }
    });
    
    // Validate total matches
    if (totalMatches !== expectedTotalMatches) {
      errors.push(`Total pertandingan tidak sesuai: ${totalMatches} (seharusnya ${expectedTotalMatches})`);
    }
    
    // Validate number of rounds
    if (schedule.length !== expectedRounds) {
      errors.push(`Jumlah matchday tidak sesuai: ${schedule.length} (seharusnya ${expectedRounds})`);
    }
    
    // Check for duplicate matchups
    matchups.forEach((count, key) => {
      if (count > 1) {
        errors.push(`Pertandingan ${key} muncul ${count} kali (seharusnya 1)`);
      }
    });
    
    // Check each team plays correct number of matches
    teams.forEach(team => {
      const matchCount = teamMatchCount.get(team.id) || 0;
      const expectedCount = n - 1;
      if (matchCount !== expectedCount) {
        errors.push(`Tim ${team.name} bermain ${matchCount} kali (seharusnya ${expectedCount})`);
      }
      
      // Check bye count for odd number of teams
      if (n % 2 === 1) {
        const byeCount = teamByeCount.get(team.id) || 0;
        if (byeCount !== 1) {
          errors.push(`Tim ${team.name} mendapat bye ${byeCount} kali (seharusnya 1)`);
        }
      }
    });
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }
  
  // Preview schedule without saving
  previewSchedule(teams: Team[], startDate: string, courts: number) {
    const { matchdays, byeTeams } = this.generateRoundRobin(teams);
    
    const start = new Date(startDate);
    const preview = matchdays.map((md, idx) => {
      const date = new Date(start);
      date.setDate(date.getDate() + idx * 7);
      
      const matchesWithDetails = md.matches.map((match: any, matchIdx: number) => {
        const court = (matchIdx % courts) + 1;
        const slot = Math.floor(matchIdx / courts);
        const startHour = 16 + slot * 2;
        
        const teamA = teams.find(t => t.id === match.team_a_id);
        const teamB = teams.find(t => t.id === match.team_b_id);
        
        return {
          ...match,
          court,
          start_time: `${startHour}:00`,
          end_time: `${startHour + 2}:00`,
          team_a_name: teamA?.name || 'Unknown',
          team_b_name: teamB?.name || 'Unknown',
        };
      });
      
      const byeTeam = md.byeTeam ? teams.find(t => t.id === md.byeTeam) : null;
      
      return {
        matchday_number: idx + 1,
        date: date.toISOString().split('T')[0],
        matches: matchesWithDetails,
        bye_team: byeTeam ? { id: byeTeam.id, name: byeTeam.name } : null,
      };
    });
    
    const validation = this.validateSchedule(teams, matchdays);
    
    return {
      schedule: preview,
      validation,
      summary: {
        total_teams: teams.length,
        total_matchdays: preview.length,
        total_matches: preview.reduce((sum, md) => sum + md.matches.length, 0),
        total_byes: byeTeams.length,
      },
    };
  }
  
  // Save generated schedule to database
  async generateSchedule(teams: Team[], startDate: string, courts: number, replaceExisting: boolean) {
    const { matchdays, byeTeams } = this.generateRoundRobin(teams);
    
    // Validate before saving
    const validation = this.validateSchedule(teams, matchdays);
    if (!validation.valid) {
      console.error('Schedule validation failed:', validation.errors);
      throw new Error('Jadwal tidak valid: ' + validation.errors.join(', '));
    }
    
    const start = new Date(startDate);
    
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
      const md = matchdays[i];
      const date = new Date(start);
      date.setDate(date.getDate() + i * 7);
      
      const matchdayData = {
        league_id: this.league?.id || '',
        name: `Matchday ${i + 1}`,
        matchday_number: i + 1,
        date: date.toISOString().split('T')[0],
        status: 'upcoming',
      };
      
      const { data: mdData } = await supabase.from('matchdays').insert([matchdayData]).select().single();
      if (mdData) {
        this.matchdays = [...this.matchdays, mdData];
        
        // Insert matches for this matchday
        for (let j = 0; j < md.matches.length; j++) {
          const match = md.matches[j];
          const court = (j % courts) + 1;
          const slot = Math.floor(j / courts);
          const startHour = 16 + slot * 2;
          
          const matchData = {
            matchday_id: mdData.id,
            team_a_id: match.team_a_id,
            team_b_id: match.team_b_id,
            court,
            start_time: `${startHour}:00`,
            end_time: `${startHour + 2}:00`,
            status: 'upcoming',
            winner_team_id: null,
          };
          
          const { data: matchRecord } = await supabase.from('matches').insert([matchData]).select().single();
          if (matchRecord) {
            this.matches = [...this.matches, matchRecord];
          }
        }
      }
    }
    
    this.notify();
  }

  async resetCompetitionData() {
    await supabase.from('pair_match_results').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('matches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('matchdays').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    this.matches = [];
    this.matchdays = [];
    this.pairResults = [];

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
    this.teams = [];
    this.users = this.users.filter(u => u.role === 'super_admin');

    this.notify();
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
