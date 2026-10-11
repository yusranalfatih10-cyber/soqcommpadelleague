import { League, Team, Player, Pair, Matchday, Match, PairMatchResult, Standing, LeagueSettings } from './types';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_SETTINGS: LeagueSettings = {
  teams_count: 8,
  pairs_per_team: 5,
  pairs_played: 4,
  courts_count: 2,
  points_win: 3,
  points_draw: 1,
  points_loss: 0,
  tiebreak_order: ['points', 'head_to_head', 'pair_difference', 'pair_wins'],
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

function calculateStandings(matches: Match[], results: PairMatchResult[], teams: Team[]): Standing[] {
  const standings: Record<string, Standing> = {};
  teams.forEach(t => {
    standings[t.id] = { team_id: t.id, played: 0, won: 0, lost: 0, pair_wins: 0, pair_losses: 0, points: 0 };
  });

  const completedMatches = matches.filter(m => m.status === 'completed');
  completedMatches.forEach(match => {
    if (standings[match.team_a_id]) standings[match.team_a_id].played++;
    if (standings[match.team_b_id]) standings[match.team_b_id].played++;

    const matchResults = results.filter(r => r.match_id === match.id);
    let aWins = 0, bWins = 0;
    matchResults.forEach(r => {
      if (r.winner_team_id === match.team_a_id) {
        aWins++;
        if (standings[match.team_a_id]) standings[match.team_a_id].pair_wins++;
        if (standings[match.team_b_id]) standings[match.team_b_id].pair_losses++;
      } else {
        bWins++;
        if (standings[match.team_b_id]) standings[match.team_b_id].pair_wins++;
        if (standings[match.team_a_id]) standings[match.team_a_id].pair_losses++;
      }
    });

    if (aWins > bWins) {
      if (standings[match.team_a_id]) { standings[match.team_a_id].won++; standings[match.team_a_id].points += 3; }
      if (standings[match.team_b_id]) standings[match.team_b_id].lost++;
    } else if (bWins > aWins) {
      if (standings[match.team_b_id]) { standings[match.team_b_id].won++; standings[match.team_b_id].points += 3; }
      if (standings[match.team_a_id]) standings[match.team_a_id].lost++;
    }
  });

  return Object.values(standings).sort((a, b) => b.points - a.points || (b.pair_wins - b.pair_losses) - (a.pair_wins - a.pair_losses) || b.pair_wins - a.pair_wins);
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

  // Admin auth
  isAdminLoggedIn(): boolean {
    return localStorage.getItem('spl_admin_logged') === 'true';
  }

  loginAdmin(username: string, password: string): boolean {
    const stored = localStorage.getItem('spl_admin_credentials');
    if (!stored) {
      // First time setup
      localStorage.setItem('spl_admin_credentials', JSON.stringify({ username: 'admin', password: btoa('padel2025') }));
      if (username === 'admin' && password === 'padel2025') {
        localStorage.setItem('spl_admin_logged', 'true');
        return true;
      }
      return false;
    }
    const creds = JSON.parse(stored);
    if (username === creds.username && password === atob(creds.password)) {
      localStorage.setItem('spl_admin_logged', 'true');
      return true;
    }
    return false;
  }

  logoutAdmin() {
    localStorage.removeItem('spl_admin_logged');
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

  // Helper methods
  addTeam(team: Omit<Team, 'id' | 'created_at' | 'updated_at'>) {
    const teams = this.getTeams();
    const newTeam: Team = { ...team, id: uuidv4(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    teams.push(newTeam);
    this.saveTeams(teams);
    return newTeam;
  }

  updateTeam(team: Team) {
    const teams = this.getTeams();
    const idx = teams.findIndex(t => t.id === team.id);
    if (idx >= 0) {
      teams[idx] = { ...team, updated_at: new Date().toISOString() };
      this.saveTeams(teams);
    }
  }

  addMatch(match: Omit<Match, 'id' | 'created_at' | 'updated_at'>) {
    const matches = this.getMatches();
    const newMatch: Match = { ...match, id: uuidv4(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    matches.push(newMatch);
    this.saveMatches(matches);
    return newMatch;
  }

  updateMatch(match: Match) {
    const matches = this.getMatches();
    const idx = matches.findIndex(m => m.id === match.id);
    if (idx >= 0) {
      matches[idx] = { ...match, updated_at: new Date().toISOString() };
      this.saveMatches(matches);
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
      let aWins = 0, bWins = 0;
      newResults.forEach(r => {
        if (r.winner_team_id === match.team_a_id) aWins++;
        else bWins++;
      });
      match.winner_team_id = aWins > bWins ? match.team_a_id : bWins > aWins ? match.team_b_id : null;
      match.status = 'completed';
      this.updateMatch(match);
    }
  }
}

export const store = new Store();
