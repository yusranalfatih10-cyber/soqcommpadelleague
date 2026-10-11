import { League, Team, Player, Pair, Matchday, Match, PairMatchResult, Standing, LeagueSettings, User, AuditLog } from './types';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_SETTINGS: LeagueSettings = {
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

const DEFAULT_LEAGUE: League = {
  id: 'league-1',
  name: 'SOQ.COMM PADEL LEAGUE',
  logo_url: '',
  season: '2025',
  description: 'One League. One Community. One Passion. Kompetisi padel yang mempertemukan komunitas, klub, dan pemain terbaik dalam semangat sportivitas dan persaudaraan.',
  status: 'ongoing',
  settings: DEFAULT_SETTINGS,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const DEFAULT_TEAMS: Team[] = [
  { id: 'team-1', name: 'Papua Padel Club', logo_url: '', captain: 'Andi Prasetyo', description: 'Klub padel dari Sorong', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'team-2', name: 'Sorong Padel United', logo_url: '', captain: 'Budi Santoso', description: 'Klub padel komunitas Sorong', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'team-3', name: 'Raja Ampat Padel', logo_url: '', captain: 'Carlos Wospakrik', description: 'Klub padel dari Raja Ampat', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'team-4', name: 'Bird of Paradise', logo_url: '', captain: 'Daniel Inubun', description: 'Klub padel Cendrawasih', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'team-5', name: 'West Papua Padel', logo_url: '', captain: 'Erik Mambrasar', description: 'Klub padel Papua Barat Daya', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'team-6', name: 'Cendrawasih Padel FC', logo_url: '', captain: 'Fajar Rumbekas', description: 'Klub padel Cendrawasih FC', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'team-7', name: 'Pacific Padel Team', logo_url: '', captain: 'Gregory Flassy', description: 'Klub padel Pasifik', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'team-8', name: 'Coral Reef Padel', logo_url: '', captain: 'Hans Kambuaya', description: 'Klub padel terumbu karang', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const DEFAULT_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Super Admin',
    email: 'admin@soqcomm.com',
    password_hash: btoa('padel2025'),
    role: 'super_admin',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

function generatePlayers(teams: Team[]): Player[] {
  const players: Player[] = [];
  const firstNames = ['Andi', 'Budi', 'Carlos', 'Daniel', 'Erik', 'Fajar', 'Greg', 'Hans', 'Ivan', 'Joko'];
  const lastNames = ['Prasetyo', 'Santoso', 'Wospakrik', 'Inubun', 'Mambrasar', 'Rumbekas', 'Flassy', 'Kambuaya', 'Rumaseb', 'Solossa'];
  
  teams.forEach((team, teamIdx) => {
    for (let i = 0; i < 10; i++) {
      players.push({
        id: `player-${teamIdx}-${i}`,
        team_id: team.id,
        name: `${firstNames[(teamIdx + i) % 10]} ${lastNames[(teamIdx + i + 3) % 10]}`,
        photo_url: '',
        is_active: true,
        created_at: new Date().toISOString(),
      });
    }
  });
  return players;
}

function generatePairs(teams: Team[], players: Player[]): Pair[] {
  const pairs: Pair[] = [];
  teams.forEach((team, teamIdx) => {
    const teamPlayers = players.filter(p => p.team_id === team.id);
    for (let i = 0; i < 5; i++) {
      pairs.push({
        id: `pair-${teamIdx}-${i}`,
        team_id: team.id,
        player_1_id: teamPlayers[i * 2]?.id || '',
        player_2_id: teamPlayers[i * 2 + 1]?.id || '',
        pair_name: `Pasangan ${i + 1}`,
        is_active: true,
      });
    }
  });
  return pairs;
}

function generateMatchdays(leagueId: string): Matchday[] {
  const matchdays: Matchday[] = [];
  const startDate = new Date('2025-02-01');
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i * 7);
    matchdays.push({
      id: `matchday-${i + 1}`,
      league_id: leagueId,
      name: `Matchday ${i + 1}`,
      matchday_number: i + 1,
      date: date.toISOString().split('T')[0],
      status: i < 3 ? 'completed' : i === 3 ? 'ongoing' : 'upcoming',
    });
  }
  return matchdays;
}

function generateMatches(matchdays: Matchday[], teams: Team[]): Match[] {
  const matches: Match[] = [];
  const fixtures = [
    [[0,1],[2,3],[4,5],[6,7]],
    [[0,2],[1,3],[4,6],[5,7]],
    [[0,3],[1,2],[4,7],[5,6]],
    [[0,4],[1,5],[2,6],[3,7]],
    [[0,5],[1,4],[2,7],[3,6]],
    [[0,6],[1,7],[2,4],[3,5]],
    [[0,7],[1,6],[2,5],[3,4]],
  ];

  matchdays.forEach((md, mdIdx) => {
    const mdFixtures = fixtures[mdIdx] || [];
    mdFixtures.forEach((fixture, fIdx) => {
      const status = md.status;
      matches.push({
        id: `match-${mdIdx}-${fIdx}`,
        matchday_id: md.id,
        team_a_id: teams[fixture[0]].id,
        team_b_id: teams[fixture[1]].id,
        court: (fIdx % 2) + 1,
        start_time: fIdx < 2 ? '16:00' : '18:00',
        end_time: fIdx < 2 ? '18:00' : '20:00',
        status: status as Match['status'],
        winner_team_id: status === 'completed' ? (Math.random() > 0.5 ? teams[fixture[0]].id : teams[fixture[1]].id) : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    });
  });
  return matches;
}

function generatePairResults(matches: Match[], pairs: Pair[]): PairMatchResult[] {
  const results: PairMatchResult[] = [];
  matches.forEach(match => {
    if (match.status === 'completed') {
      for (let pos = 1; pos <= 4; pos++) {
        const scoreA = Math.floor(Math.random() * 4) + 3;
        const scoreB = Math.floor(Math.random() * scoreA);
        results.push({
          id: `result-${match.id}-${pos}`,
          match_id: match.id,
          position: pos,
          team_a_pair_id: pairs.find(p => p.team_id === match.team_a_id && p.is_active)?.id || '',
          team_b_pair_id: pairs.find(p => p.team_id === match.team_b_id && p.is_active)?.id || '',
          score_team_a: scoreA,
          score_team_b: scoreB,
          winner_team_id: scoreA > scoreB ? match.team_a_id : match.team_b_id,
          status: 'completed',
        });
      }
    }
  });
  return results;
}

// SISTEM KLASEMEN BARU: Total poin dari semua partai pasangan
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
      if (r.winner_team_id === match.team_a_id) {
        teamAWins++;
      } else if (r.winner_team_id === match.team_b_id) {
        teamBWins++;
      }
    });

    if (standings[match.team_a_id]) {
      const s = standings[match.team_a_id];
      s.total_points += teamAPoints;
      s.pair_wins += teamAWins;
      s.pair_losses += teamBWins;
      s.pair_difference = s.pair_wins - s.pair_losses;
      // Head-to-head
      if (!s.head_to_head_points) s.head_to_head_points = {};
      s.head_to_head_points[match.team_b_id] = (s.head_to_head_points[match.team_b_id] || 0) + teamAPoints;
    }

    if (standings[match.team_b_id]) {
      const s = standings[match.team_b_id];
      s.total_points += teamBPoints;
      s.pair_wins += teamBWins;
      s.pair_losses += teamAWins;
      s.pair_difference = s.pair_wins - s.pair_losses;
      // Head-to-head
      if (!s.head_to_head_points) s.head_to_head_points = {};
      s.head_to_head_points[match.team_a_id] = (s.head_to_head_points[match.team_a_id] || 0) + teamBPoints;
    }
  });

  // Sort berdasarkan: total_points DESC, pair_difference DESC, pair_wins DESC, head-to-head
  return Object.values(standings).sort((a, b) => {
    if (b.total_points !== a.total_points) return b.total_points - a.total_points;
    if (b.pair_difference !== a.pair_difference) return b.pair_difference - a.pair_difference;
    if (b.pair_wins !== a.pair_wins) return b.pair_wins - a.pair_wins;
    // Head-to-head
    const h2hA = a.head_to_head_points?.[b.team_id] || 0;
    const h2hB = b.head_to_head_points?.[a.team_id] || 0;
    return h2hB - h2hA;
  });
}

// Generate jadwal round-robin otomatis
function generateRoundRobinSchedule(teams: Team[], startDate: string, courts: number): { matchdays: Matchday[], matches: Match[] } {
  const n = teams.length;
  if (n < 2) return { matchdays: [], matches: [] };

  const matchdays: Matchday[] = [];
  const matches: Match[] = [];
  const numRounds = n - 1;
  const matchesPerRound = Math.floor(n / 2);

  // Circle method untuk round-robin
  const teamIds = teams.map(t => t.id);
  if (n % 2 === 1) teamIds.push('BYE'); // Tambah bye jika ganjil

  const start = new Date(startDate);

  for (let round = 0; round < numRounds; round++) {
    const date = new Date(start);
    date.setDate(date.getDate() + round * 7);
    
    const matchday: Matchday = {
      id: `matchday-gen-${round + 1}`,
      league_id: 'league-1',
      name: `Matchday ${round + 1}`,
      matchday_number: round + 1,
      date: date.toISOString().split('T')[0],
      status: 'upcoming',
    };
    matchdays.push(matchday);

    // Generate pasangan untuk round ini
    const roundFixtures: [string, string][] = [];
    for (let i = 0; i < matchesPerRound; i++) {
      const home = teamIds[i];
      const away = teamIds[n - 1 - i];
      if (home !== 'BYE' && away !== 'BYE') {
        roundFixtures.push([home, away]);
      }
    }

    // Assign ke court dan slot waktu
    roundFixtures.forEach((fixture, idx) => {
      const court = (idx % courts) + 1;
      const slot = Math.floor(idx / courts);
      const startHour = 16 + slot * 2;
      
      matches.push({
        id: `match-gen-${round}-${idx}`,
        matchday_id: matchday.id,
        team_a_id: fixture[0],
        team_b_id: fixture[1],
        court,
        start_time: `${startHour}:00`,
        end_time: `${startHour + 2}:00`,
        status: 'upcoming',
        winner_team_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    });

    // Rotate tim (circle method)
    const last = teamIds.pop()!;
    teamIds.splice(1, 0, last);
  }

  return { matchdays, matches };
}

// Store class
class Store {
  private listeners: Set<() => void> = new Set();

  getLeague(): League {
    const data = localStorage.getItem('spl_league');
    if (data) return JSON.parse(data);
    localStorage.setItem('spl_league', JSON.stringify(DEFAULT_LEAGUE));
    return DEFAULT_LEAGUE;
  }

  getTeams(): Team[] {
    const data = localStorage.getItem('spl_teams');
    if (data) return JSON.parse(data);
    localStorage.setItem('spl_teams', JSON.stringify(DEFAULT_TEAMS));
    return DEFAULT_TEAMS;
  }

  getPlayers(): Player[] {
    const data = localStorage.getItem('spl_players');
    if (data) return JSON.parse(data);
    const teams = this.getTeams();
    const players = generatePlayers(teams);
    localStorage.setItem('spl_players', JSON.stringify(players));
    return players;
  }

  getPairs(): Pair[] {
    const data = localStorage.getItem('spl_pairs');
    if (data) return JSON.parse(data);
    const teams = this.getTeams();
    const players = this.getPlayers();
    const pairs = generatePairs(teams, players);
    localStorage.setItem('spl_pairs', JSON.stringify(pairs));
    return pairs;
  }

  getMatchdays(): Matchday[] {
    const data = localStorage.getItem('spl_matchdays');
    if (data) return JSON.parse(data);
    const league = this.getLeague();
    const matchdays = generateMatchdays(league.id);
    localStorage.setItem('spl_matchdays', JSON.stringify(matchdays));
    return matchdays;
  }

  getMatches(): Match[] {
    const data = localStorage.getItem('spl_matches');
    if (data) return JSON.parse(data);
    const matchdays = this.getMatchdays();
    const teams = this.getTeams();
    const matches = generateMatches(matchdays, teams);
    localStorage.setItem('spl_matches', JSON.stringify(matches));
    return matches;
  }

  getPairResults(): PairMatchResult[] {
    const data = localStorage.getItem('spl_pair_results');
    if (data) return JSON.parse(data);
    const matches = this.getMatches();
    const pairs = this.getPairs();
    const results = generatePairResults(matches, pairs);
    localStorage.setItem('spl_pair_results', JSON.stringify(results));
    return results;
  }

  getStandings(): Standing[] {
    const matches = this.getMatches();
    const results = this.getPairResults();
    const teams = this.getTeams();
    return calculateStandings(matches, results, teams);
  }

  getUsers(): User[] {
    const data = localStorage.getItem('spl_users');
    if (data) return JSON.parse(data);
    localStorage.setItem('spl_users', JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }

  getAuditLogs(): AuditLog[] {
    const data = localStorage.getItem('spl_audit_logs');
    if (data) return JSON.parse(data);
    return [];
  }

  // Mutations
  saveLeague(league: League) {
    league.updated_at = new Date().toISOString();
    localStorage.setItem('spl_league', JSON.stringify(league));
    this.notify();
  }

  saveTeams(teams: Team[]) {
    localStorage.setItem('spl_teams', JSON.stringify(teams));
    this.notify();
  }

  savePlayers(players: Player[]) {
    localStorage.setItem('spl_players', JSON.stringify(players));
    this.notify();
  }

  savePairs(pairs: Pair[]) {
    localStorage.setItem('spl_pairs', JSON.stringify(pairs));
    this.notify();
  }

  saveMatchdays(matchdays: Matchday[]) {
    localStorage.setItem('spl_matchdays', JSON.stringify(matchdays));
    this.notify();
  }

  saveMatches(matches: Match[]) {
    localStorage.setItem('spl_matches', JSON.stringify(matches));
    this.notify();
  }

  savePairResults(results: PairMatchResult[]) {
    localStorage.setItem('spl_pair_results', JSON.stringify(results));
    this.notify();
  }

  saveUsers(users: User[]) {
    localStorage.setItem('spl_users', JSON.stringify(users));
    this.notify();
  }

  addAuditLog(userId: string, userName: string, action: string, details: string) {
    const logs = this.getAuditLogs();
    logs.push({
      id: uuidv4(),
      user_id: userId,
      user_name: userName,
      action,
      details,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem('spl_audit_logs', JSON.stringify(logs));
  }

  // Admin auth
  getCurrentUser(): User | null {
    const userId = localStorage.getItem('spl_current_user');
    if (!userId) return null;
    const users = this.getUsers();
    return users.find(u => u.id === userId) || null;
  }

  isAdminLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  loginUser(email: string, password: string): User | null {
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password_hash === btoa(password) && u.is_active);
    if (user) {
      localStorage.setItem('spl_current_user', user.id);
      this.addAuditLog(user.id, user.name, 'LOGIN', 'User logged in');
      return user;
    }
    return null;
  }

  logoutUser() {
    const user = this.getCurrentUser();
    if (user) {
      this.addAuditLog(user.id, user.name, 'LOGOUT', 'User logged out');
    }
    localStorage.removeItem('spl_current_user');
    this.notify();
  }

  // User management
  addUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
    const users = this.getUsers();
    const newUser: User = { 
      ...user, 
      id: uuidv4(), 
      password_hash: btoa(user.password_hash),
      created_at: new Date().toISOString(), 
      updated_at: new Date().toISOString() 
    };
    users.push(newUser);
    this.saveUsers(users);
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      this.addAuditLog(currentUser.id, currentUser.name, 'ADD_USER', `Added user: ${user.name}`);
    }
    return newUser;
  }

  updateUser(user: User) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      users[idx] = { ...user, updated_at: new Date().toISOString() };
      this.saveUsers(users);
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        this.addAuditLog(currentUser.id, currentUser.name, 'UPDATE_USER', `Updated user: ${user.name}`);
      }
    }
  }

  deleteUser(userId: string) {
    const users = this.getUsers().filter(u => u.id !== userId);
    this.saveUsers(users);
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      this.addAuditLog(currentUser.id, currentUser.name, 'DELETE_USER', `Deleted user: ${userId}`);
    }
  }

  // Team management
  addTeam(team: Omit<Team, 'id' | 'created_at' | 'updated_at'>) {
    const teams = this.getTeams();
    const newTeam: Team = { ...team, id: uuidv4(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    teams.push(newTeam);
    this.saveTeams(teams);
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      this.addAuditLog(currentUser.id, currentUser.name, 'ADD_TEAM', `Added team: ${team.name}`);
    }
    return newTeam;
  }

  updateTeam(team: Team) {
    const teams = this.getTeams();
    const idx = teams.findIndex(t => t.id === team.id);
    if (idx >= 0) {
      teams[idx] = { ...team, updated_at: new Date().toISOString() };
      this.saveTeams(teams);
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        this.addAuditLog(currentUser.id, currentUser.name, 'UPDATE_TEAM', `Updated team: ${team.name}`);
      }
    }
  }

  // Player management
  addPlayer(player: Omit<Player, 'id' | 'created_at'>) {
    const players = this.getPlayers();
    const newPlayer: Player = { ...player, id: uuidv4(), created_at: new Date().toISOString() };
    players.push(newPlayer);
    this.savePlayers(players);
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      this.addAuditLog(currentUser.id, currentUser.name, 'ADD_PLAYER', `Added player: ${player.name}`);
    }
    return newPlayer;
  }

  updatePlayer(player: Player) {
    const players = this.getPlayers();
    const idx = players.findIndex(p => p.id === player.id);
    if (idx >= 0) {
      players[idx] = player;
      this.savePlayers(players);
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        this.addAuditLog(currentUser.id, currentUser.name, 'UPDATE_PLAYER', `Updated player: ${player.name}`);
      }
    }
  }

  // Match management
  addMatch(match: Omit<Match, 'id' | 'created_at' | 'updated_at'>) {
    const matches = this.getMatches();
    const newMatch: Match = { ...match, id: uuidv4(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    matches.push(newMatch);
    this.saveMatches(matches);
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      this.addAuditLog(currentUser.id, currentUser.name, 'ADD_MATCH', `Added match: ${match.team_a_id} vs ${match.team_b_id}`);
    }
    return newMatch;
  }

  updateMatch(match: Match) {
    const matches = this.getMatches();
    const idx = matches.findIndex(m => m.id === match.id);
    if (idx >= 0) {
      matches[idx] = { ...match, updated_at: new Date().toISOString() };
      this.saveMatches(matches);
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        this.addAuditLog(currentUser.id, currentUser.name, 'UPDATE_MATCH', `Updated match: ${match.id}`);
      }
    }
  }

  deleteMatch(matchId: string) {
    const matches = this.getMatches().filter(m => m.id !== matchId);
    this.saveMatches(matches);
    const results = this.getPairResults().filter(r => r.match_id !== matchId);
    this.savePairResults(results);
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      this.addAuditLog(currentUser.id, currentUser.name, 'DELETE_MATCH', `Deleted match: ${matchId}`);
    }
  }

  saveMatchResult(matchId: string, results: Omit<PairMatchResult, 'id'>[]) {
    const allResults = this.getPairResults();
    const filtered = allResults.filter(r => r.match_id !== matchId);
    const newResults = results.map(r => ({ ...r, id: uuidv4() }));
    this.savePairResults([...filtered, ...newResults]);

    // Update match status and winner
    const matches = this.getMatches();
    const match = matches.find(m => m.id === matchId);
    if (match) {
      let aPoints = 0, bPoints = 0;
      newResults.forEach(r => {
        aPoints += r.score_team_a;
        bPoints += r.score_team_b;
      });
      match.winner_team_id = aPoints > bPoints ? match.team_a_id : bPoints > aPoints ? match.team_b_id : null;
      match.status = 'completed';
      this.updateMatch(match);
    }

    const currentUser = this.getCurrentUser();
    if (currentUser) {
      this.addAuditLog(currentUser.id, currentUser.name, 'SAVE_MATCH_RESULT', `Saved result for match: ${matchId}`);
    }
  }

  // Generate schedule
  generateSchedule(teams: Team[], startDate: string, courts: number, replaceExisting: boolean) {
    const { matchdays, matches } = generateRoundRobinSchedule(teams, startDate, courts);
    
    if (replaceExisting) {
      // Hapus matchdays dan matches lama yang belum selesai
      const oldMatchdays = this.getMatchdays().filter(md => {
        const mdMatches = this.getMatches().filter(m => m.matchday_id === md.id);
        return mdMatches.every(m => m.status !== 'completed');
      });
      const oldMatchIds = this.getMatches()
        .filter(m => oldMatchdays.some(md => md.id === m.matchday_id))
        .map(m => m.id);
      
      const remainingMatchdays = this.getMatchdays().filter(md => !oldMatchdays.some(omd => omd.id === md.id));
      const remainingMatches = this.getMatches().filter(m => !oldMatchIds.includes(m.id));
      const remainingResults = this.getPairResults().filter(r => !oldMatchIds.includes(r.match_id));

      this.saveMatchdays([...remainingMatchdays, ...matchdays]);
      this.saveMatches([...remainingMatches, ...matches]);
      this.savePairResults(remainingResults);
    } else {
      this.saveMatchdays([...this.getMatchdays(), ...matchdays]);
      this.saveMatches([...this.getMatches(), ...matches]);
    }

    const currentUser = this.getCurrentUser();
    if (currentUser) {
      this.addAuditLog(currentUser.id, currentUser.name, 'GENERATE_SCHEDULE', `Generated ${matches.length} matches`);
    }
  }

  // Reset league
  resetCompetitionData() {
    // Hapus jadwal, hasil, statistik - pertahankan tim, pemain, user
    this.saveMatchdays([]);
    this.saveMatches([]);
    this.savePairResults([]);
    
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      this.addAuditLog(currentUser.id, currentUser.name, 'RESET_COMPETITION', 'Reset competition data');
    }
  }

  resetFullLeague() {
    // Hapus semua data kecuali user super admin
    const superAdmins = this.getUsers().filter(u => u.role === 'super_admin');
    this.saveMatchdays([]);
    this.saveMatches([]);
    this.savePairResults([]);
    this.saveTeams([]);
    this.savePlayers([]);
    this.savePairs([]);
    this.saveUsers(superAdmins);
    
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      this.addAuditLog(currentUser.id, currentUser.name, 'RESET_FULL', 'Full league reset');
    }
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
