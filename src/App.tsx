import React, { useState, useCallback } from 'react';
import { store } from './store';
import { Page, Team, Match, Matchday, Standing, PairMatchResult, Pair, Player } from './types';
import { v4 as uuidv4 } from 'uuid';

// Colors
const C = {
  primary: '#16B9C0',
  primaryDark: '#087E91',
  secondary: '#1599B8',
  accent: '#A8D82E',
  highlight: '#FF805E',
  bg: '#F5FBFC',
  surface: '#FFFFFF',
  textPrimary: '#173D4A',
  textSecondary: '#718792',
  border: '#DCECEF',
  success: '#2EAD72',
  warning: '#F2A23A',
  error: '#E65C5C',
};

// Logo Component
const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const s = size === 'lg' ? 56 : size === 'md' ? 36 : 28;
  const fs = size === 'lg' ? 20 : size === 'md' ? 13 : 10;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: s, height: s }}>
        <div style={{
          width: s, height: s, borderRadius: '50%',
          background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: '#fff', fontWeight: 700, fontFamily: 'Montserrat, sans-serif', fontSize: fs }}>S</span>
        </div>
        <div style={{
          position: 'absolute', bottom: -2, right: -2,
          width: s * 0.3, height: s * 0.3, borderRadius: '50%',
          background: C.accent,
        }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontWeight: 700, color: C.textPrimary, fontFamily: 'Montserrat, sans-serif', fontSize: fs, lineHeight: 1.2 }}>SOQ.COMM</span>
        <span style={{ fontWeight: 600, color: C.primary, fontSize: fs * 0.75, lineHeight: 1.2 }}>PADEL LEAGUE</span>
      </div>
    </div>
  );
};

// App Component
function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [showAdmin, setShowAdmin] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminPage, setAdminPage] = useState('dashboard');
  const [adminLoggedIn, setAdminLoggedIn] = useState(store.isAdminLoggedIn());
  const [, setRefresh] = useState(0);

  const refresh = useCallback(() => setRefresh(r => r + 1), []);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    setSelectedMatchId(null);
    setSelectedTeamId(null);
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const handleViewMatch = (matchId: string) => {
    setSelectedMatchId(matchId);
    setCurrentPage('match-detail' as Page);
    window.scrollTo(0, 0);
  };

  const handleViewTeam = (teamId: string) => {
    setSelectedTeamId(teamId);
    setCurrentPage('team-detail' as Page);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setCurrentPage('home');
    setSelectedMatchId(null);
    setSelectedTeamId(null);
  };

  // Admin Panel
  if (showAdmin) {
    return <AdminView
      loggedIn={adminLoggedIn}
      onLogin={(u, p) => {
        if (store.loginAdmin(u, p)) {
          setAdminLoggedIn(true);
          return true;
        }
        return false;
      }}
      onLogout={() => { store.logoutAdmin(); setAdminLoggedIn(false); setShowAdmin(false); }}
      onExit={() => setShowAdmin(false)}
      page={adminPage}
      setPage={setAdminPage}
      refresh={refresh}
    />;
  }

  const teams = store.getTeams();
  const matches = store.getMatches();
  const standings = store.getStandings();
  const matchdays = store.getMatchdays();
  const pairs = store.getPairs();
  const players = store.getPlayers();
  const pairResults = store.getPairResults();
  const league = store.getLeague();

  const getTeam = (id: string) => teams.find(t => t.id === id);
  const getMatchday = (id: string) => matchdays.find(md => md.id === id);

  const navItems: { page: Page; label: string }[] = [
    { page: 'home', label: 'Beranda' },
    { page: 'standings', label: 'Klasemen' },
    { page: 'schedule', label: 'Jadwal' },
    { page: 'results', label: 'Hasil' },
    { page: 'teams', label: 'Tim' },
    { page: 'statistics', label: 'Statistik' },
    { page: 'league-info', label: 'Info Liga' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      {/* Header */}
      <header style={{
        background: C.surface, borderBottom: `1px solid ${C.border}`,
        position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => handleNavigate('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <Logo size="sm" />
          </button>
          {/* Desktop Nav */}
          <nav style={{ display: 'flex', gap: 4 }} className="desktop-nav">
            {navItems.slice(0, 5).map(item => (
              <button key={item.page} onClick={() => handleNavigate(item.page)} style={{
                padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                background: currentPage === item.page ? C.primary : 'transparent',
                color: currentPage === item.page ? '#fff' : C.textPrimary,
              }}>
                {item.label}
              </button>
            ))}
          </nav>
          <button onClick={() => setShowAdmin(true)} style={{
            padding: '8px 16px', background: C.primaryDark, color: '#fff',
            borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
          }}>
            Admin
          </button>
        </div>
        {/* Mobile Nav */}
        <div style={{ display: 'flex', overflowX: 'auto', padding: '0 16px 8px', gap: 4 }} className="mobile-nav scrollbar-hide">
          {navItems.map(item => (
            <button key={item.page} onClick={() => handleNavigate(item.page)} style={{
              padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
              border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              background: currentPage === item.page ? C.primary : C.bg,
              color: currentPage === item.page ? '#fff' : C.textSecondary,
            }}>
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 16px', minHeight: 'calc(100vh - 200px)' }}>
        {currentPage === 'match-detail' && selectedMatchId && (
          <MatchDetailView matchId={selectedMatchId} onBack={handleBack} onViewTeam={handleViewTeam} />
        )}
        {currentPage === 'team-detail' && selectedTeamId && (
          <TeamDetailView teamId={selectedTeamId} onBack={handleBack} onViewMatch={handleViewMatch} />
        )}
        {currentPage === 'home' && !selectedMatchId && !selectedTeamId && (
          <HomeView teams={teams} matches={matches} standings={standings} matchdays={matchdays} league={league}
            onNavigate={handleNavigate} onViewMatch={handleViewMatch} onViewTeam={handleViewTeam} />
        )}
        {currentPage === 'standings' && !selectedMatchId && !selectedTeamId && (
          <StandingsView teams={teams} standings={standings} league={league} onViewTeam={handleViewTeam} />
        )}
        {currentPage === 'schedule' && !selectedMatchId && !selectedTeamId && (
          <ScheduleView teams={teams} matches={matches} matchdays={matchdays} onViewMatch={handleViewMatch} />
        )}
        {currentPage === 'results' && !selectedMatchId && !selectedTeamId && (
          <ResultsView teams={teams} matches={matches} matchdays={matchdays} pairResults={pairResults} onViewMatch={handleViewMatch} />
        )}
        {currentPage === 'teams' && !selectedMatchId && !selectedTeamId && (
          <TeamsView teams={teams} standings={standings} onViewTeam={handleViewTeam} />
        )}
        {currentPage === 'statistics' && !selectedMatchId && !selectedTeamId && (
          <StatisticsView teams={teams} matches={matches} standings={standings} pairs={pairs} pairResults={pairResults} />
        )}
        {currentPage === 'league-info' && !selectedMatchId && !selectedTeamId && (
          <LeagueInfoView league={league} teams={teams} matches={matches} />
        )}
      </main>

      {/* Footer */}
      <footer style={{ background: C.primaryDark, color: '#fff', padding: '24px 16px', marginTop: 40 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>S</span>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>SOQ.COMM PADEL LEAGUE</p>
              <p style={{ fontSize: 11, opacity: 0.7, margin: 0 }}>One League. One Community. One Passion.</p>
            </div>
          </div>
          <p style={{ fontSize: 11, opacity: 0.6, margin: 0 }}>© 2025 Papua Barat Daya, Indonesia</p>
        </div>
      </footer>

      <style>{`
        .desktop-nav { display: flex; }
        .mobile-nav { display: none; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

// ============ HOME VIEW ============
const HomeView: React.FC<{
  teams: Team[]; matches: Match[]; standings: Standing[]; matchdays: Matchday[]; league: any;
  onNavigate: (p: Page) => void; onViewMatch: (id: string) => void; onViewTeam: (id: string) => void;
}> = ({ teams, matches, standings, matchdays, league, onNavigate, onViewMatch, onViewTeam }) => {
  const getTeam = (id: string) => teams.find(t => t.id === id);
  const getMatchday = (id: string) => matchdays.find(md => md.id === id);
  const completedMatches = matches.filter(m => m.status === 'completed');
  const upcomingMatches = matches.filter(m => m.status === 'upcoming');
  const nextMatch = upcomingMatches[0];
  const recentResults = completedMatches.slice(-4).reverse();
  const topStandings = standings.slice(0, 5);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section style={{
        background: `linear-gradient(135deg, ${C.bg}, #fff, #E8F8F9)`,
        borderRadius: 16, padding: '40px 24px', marginBottom: 24, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 20, right: 20, width: 200, height: 200, borderRadius: '50%', background: `${C.primary}10`, filter: 'blur(40px)' }} />
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: `${C.primary}15`, borderRadius: 20, marginBottom: 16 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.primary }} className="animate-pulse-soft" />
            <span style={{ fontSize: 11, fontWeight: 600, color: C.primaryDark }}>
              {league.status === 'ongoing' ? 'Kompetisi Berlangsung' : league.status === 'upcoming' ? 'Segera Dimulai' : 'Selesai'}
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 42px)', fontWeight: 800, color: C.textPrimary, fontFamily: 'Montserrat, sans-serif', margin: '0 0 8px' }}>
            SOQ.COMM<br /><span style={{ color: C.primary }}>PADEL LEAGUE</span>
          </h1>
          <p style={{ color: C.textSecondary, fontSize: 14, fontStyle: 'italic', margin: '0 0 4px' }}>One League. One Community. One Passion.</p>
          <p style={{ color: C.textSecondary, fontSize: 13, margin: '0 0 24px', maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' }}>
            {league.description}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => onNavigate('standings')} style={{
              padding: '12px 24px', background: C.primary, color: '#fff', borderRadius: 12,
              fontWeight: 600, fontSize: 13, border: 'none', cursor: 'pointer',
              boxShadow: `0 4px 12px ${C.primary}30`,
            }}>Lihat Klasemen</button>
            <button onClick={() => onNavigate('schedule')} style={{
              padding: '12px 24px', background: '#fff', color: C.primary, borderRadius: 12,
              fontWeight: 600, fontSize: 13, border: `2px solid ${C.primary}`, cursor: 'pointer',
            }}>Jadwal Pertandingan</button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Tim', value: teams.length, color: C.primary },
          { label: 'Total Pertandingan', value: matches.length, color: C.secondary },
          { label: 'Selesai', value: completedMatches.length, color: C.success },
          { label: 'Mendatang', value: upcomingMatches.length, color: C.warning },
        ].map((s, i) => (
          <div key={i} style={{ background: C.surface, borderRadius: 12, padding: 16, border: `1px solid ${C.border}` }}>
            <p style={{ fontSize: 24, fontWeight: 700, color: s.color, fontFamily: 'Montserrat, sans-serif', margin: 0 }}>{s.value}</p>
            <p style={{ fontSize: 11, color: C.textSecondary, margin: '4px 0 0' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Next Match */}
      {nextMatch && (
        <section style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary, margin: 0, fontFamily: 'Montserrat, sans-serif' }}>Pertandingan Berikutnya</h2>
            <button onClick={() => onNavigate('schedule')} style={{ fontSize: 12, color: C.primary, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>Lihat Semua →</button>
          </div>
          <div style={{ background: C.surface, borderRadius: 12, padding: 20, border: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ padding: '2px 8px', background: `${C.primary}15`, color: C.primaryDark, fontSize: 11, fontWeight: 500, borderRadius: 12 }}>{getMatchday(nextMatch.matchday_id)?.name}</span>
              <span style={{ padding: '2px 8px', background: `${C.accent}30`, color: '#5a7a18', fontSize: 11, fontWeight: 500, borderRadius: 12 }}>Akan Datang</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16 }}>
                  {getTeam(nextMatch.team_a_id)?.name.charAt(0)}
                </div>
                <p style={{ fontWeight: 600, fontSize: 13, color: C.textPrimary, margin: 0 }}>{getTeam(nextMatch.team_a_id)?.name}</p>
              </div>
              <div style={{ textAlign: 'center', padding: '0 12px' }}>
                <p style={{ fontSize: 20, fontWeight: 700, color: C.textSecondary, margin: 0 }}>VS</p>
                <p style={{ fontSize: 11, color: C.textSecondary, margin: '4px 0 0' }}>Court {nextMatch.court}</p>
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg, ${C.highlight}, #e06040)`, margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16 }}>
                  {getTeam(nextMatch.team_b_id)?.name.charAt(0)}
                </div>
                <p style={{ fontWeight: 600, fontSize: 13, color: C.textPrimary, margin: 0 }}>{getTeam(nextMatch.team_b_id)?.name}</p>
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: C.textSecondary }}>
              {getMatchday(nextMatch.matchday_id)?.date} • {nextMatch.start_time} - {nextMatch.end_time}
            </div>
          </div>
        </section>
      )}

      {/* Recent Results */}
      {recentResults.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary, margin: 0, fontFamily: 'Montserrat, sans-serif' }}>Hasil Terbaru</h2>
            <button onClick={() => onNavigate('results')} style={{ fontSize: 12, color: C.primary, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>Lihat Semua →</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            {recentResults.map(match => (
              <div key={match.id} onClick={() => onViewMatch(match.id)} style={{
                background: C.surface, borderRadius: 12, padding: 16, border: `1px solid ${C.border}`, cursor: 'pointer', transition: 'all 0.2s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: C.textSecondary }}>{getMatchday(match.matchday_id)?.name}</span>
                  <span style={{ padding: '2px 8px', background: `${C.success}15`, color: C.success, fontSize: 11, fontWeight: 500, borderRadius: 12 }}>Selesai</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p style={{ flex: 1, fontWeight: 600, fontSize: 13, color: match.winner_team_id === match.team_a_id ? C.primary : C.textPrimary, margin: 0 }}>{getTeam(match.team_a_id)?.name}</p>
                  <span style={{ padding: '4px 8px', background: C.bg, borderRadius: 8, fontSize: 12, fontWeight: 700, color: C.textPrimary }}>
                    {match.winner_team_id === match.team_a_id ? 'WIN' : match.winner_team_id === match.team_b_id ? 'LOSS' : 'DRAW'}
                  </span>
                  <p style={{ flex: 1, fontWeight: 600, fontSize: 13, color: match.winner_team_id === match.team_b_id ? C.primary : C.textPrimary, margin: 0, textAlign: 'right' }}>{getTeam(match.team_b_id)?.name}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Top Standings */}
      {topStandings.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary, margin: 0, fontFamily: 'Montserrat, sans-serif' }}>Klasemen Sementara</h2>
            <button onClick={() => onNavigate('standings')} style={{ fontSize: 12, color: C.primary, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>Klasemen Lengkap →</button>
          </div>
          <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.primaryDark, color: '#fff' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>Pos</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>Tim</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600 }}>M</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600 }}>Me</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600 }}>K</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600 }}>Poin</th>
                </tr>
              </thead>
              <tbody>
                {topStandings.map((s: Standing, idx: number) => (
                  <tr key={s.team_id} onClick={() => onViewTeam(s.team_id)} style={{ borderBottom: `1px solid ${C.border}`, cursor: 'pointer', background: idx === 0 ? `${C.accent}15` : 'transparent' }}>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        width: 24, height: 24, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700,
                        background: idx === 0 ? C.accent : idx === 1 ? C.primary : idx === 2 ? C.secondary : C.border,
                        color: idx < 3 ? '#fff' : C.textSecondary,
                      }}>{idx + 1}</span>
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 500, color: C.textPrimary }}>{getTeam(s.team_id)?.name}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: C.textSecondary }}>{s.played}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: C.success, fontWeight: 600 }}>{s.won}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: C.error, fontWeight: 600 }}>{s.lost}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: C.textPrimary }}>{s.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

// ============ STANDINGS VIEW ============
const StandingsView: React.FC<{ teams: Team[]; standings: Standing[]; league: any; onViewTeam: (id: string) => void }> = ({ teams, standings, league, onViewTeam }) => {
  const getTeam = (id: string) => teams.find(t => t.id === id);

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary, margin: '0 0 16px', fontFamily: 'Montserrat, sans-serif' }}>Klasemen Liga</h1>
      <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr style={{ background: C.primaryDark, color: '#fff' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>Pos</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>Tim</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600 }}>Main</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600 }}>Menang</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600 }}>Kalah</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600 }}>MP</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600 }}>KP</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600 }}>Selisih</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600 }}>Poin</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s: Standing, idx: number) => (
                <tr key={s.team_id} onClick={() => onViewTeam(s.team_id)} style={{
                  borderBottom: `1px solid ${C.border}`, cursor: 'pointer', transition: 'background 0.2s',
                  background: idx === 0 ? `${C.accent}15` : idx === 1 ? `${C.primary}10` : 'transparent',
                  borderLeft: idx < 3 ? `4px solid ${idx === 0 ? C.accent : idx === 1 ? C.primary : C.secondary}` : 'none',
                }}>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      width: 28, height: 28, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700,
                      background: idx === 0 ? C.accent : idx === 1 ? C.primary : idx === 2 ? C.secondary : C.border,
                      color: idx < 3 ? '#fff' : C.textSecondary,
                    }}>{idx + 1}</span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>
                        {getTeam(s.team_id)?.name.charAt(0)}
                      </div>
                      <span style={{ fontWeight: 500, color: C.textPrimary }}>{getTeam(s.team_id)?.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', color: C.textSecondary }}>{s.played}</td>
                  <td style={{ padding: '12px', textAlign: 'center', color: C.success, fontWeight: 600 }}>{s.won}</td>
                  <td style={{ padding: '12px', textAlign: 'center', color: C.error, fontWeight: 600 }}>{s.lost}</td>
                  <td style={{ padding: '12px', textAlign: 'center', color: C.textPrimary }}>{s.pair_wins}</td>
                  <td style={{ padding: '12px', textAlign: 'center', color: C.textPrimary }}>{s.pair_losses}</td>
                  <td style={{ padding: '12px', textAlign: 'center', fontWeight: 500, color: C.textPrimary }}>{s.pair_wins - s.pair_losses > 0 ? '+' : ''}{s.pair_wins - s.pair_losses}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, background: `${C.primary}15`, color: C.primaryDark, fontWeight: 700 }}>{s.points}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Legend */}
      <div style={{ background: C.surface, borderRadius: 12, padding: 16, border: `1px solid ${C.border}`, marginTop: 16 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, margin: '0 0 8px' }}>Aturan Penghitungan Poin</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8, fontSize: 12, color: C.textSecondary }}>
          <p style={{ margin: 0 }}>• Menang: <strong style={{ color: C.textPrimary }}>{league.settings.points_win} poin</strong></p>
          <p style={{ margin: 0 }}>• Seri: <strong style={{ color: C.textPrimary }}>{league.settings.points_draw} poin</strong></p>
          <p style={{ margin: 0 }}>• Kalah: <strong style={{ color: C.textPrimary }}>{league.settings.points_loss} poin</strong></p>
          <p style={{ margin: 0 }}>• MP = Menang Pasangan, KP = Kalah Pasangan</p>
        </div>
      </div>
    </div>
  );
};

// ============ SCHEDULE VIEW ============
const ScheduleView: React.FC<{ teams: Team[]; matches: Match[]; matchdays: Matchday[]; onViewMatch: (id: string) => void }> = ({ teams, matches, matchdays, onViewMatch }) => {
  const getTeam = (id: string) => teams.find(t => t.id === id);
  const getMatchday = (id: string) => matchdays.find(md => md.id === id);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('all');

  const filteredMatches = matches.filter(m => filter === 'all' || m.status === filter);
  const grouped = filteredMatches.reduce((acc: Record<string, Match[]>, m) => {
    if (!acc[m.matchday_id]) acc[m.matchday_id] = [];
    acc[m.matchday_id].push(m);
    return acc;
  }, {});

  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    upcoming: { bg: `${C.secondary}15`, text: C.secondary, label: 'Akan Datang' },
    ongoing: { bg: `${C.highlight}15`, text: C.highlight, label: 'Berlangsung' },
    completed: { bg: `${C.success}15`, text: C.success, label: 'Selesai' },
    cancelled: { bg: `${C.error}15`, text: C.error, label: 'Dibatalkan' },
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary, margin: '0 0 16px', fontFamily: 'Montserrat, sans-serif' }}>Jadwal Pertandingan</h1>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {(['all', 'upcoming', 'ongoing', 'completed'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer',
            background: filter === f ? C.primary : C.bg, color: filter === f ? '#fff' : C.textSecondary,
          }}>{f === 'all' ? 'Semua' : f === 'upcoming' ? 'Akan Datang' : f === 'ongoing' ? 'Berlangsung' : 'Selesai'}</button>
        ))}
      </div>
      {/* Matches */}
      {Object.entries(grouped).map(([mdId, mdMatches]) => {
        const md = getMatchday(mdId);
        return (
          <div key={mdId} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ padding: '4px 12px', background: C.primaryDark, color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 12 }}>{md?.name}</span>
              <span style={{ fontSize: 11, color: C.textSecondary }}>{md?.date}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
              {mdMatches.map(match => {
                const sc = statusColors[match.status] || statusColors.upcoming;
                return (
                  <div key={match.id} onClick={() => onViewMatch(match.id)} style={{
                    background: C.surface, borderRadius: 12, padding: 16, border: `1px solid ${C.border}`, cursor: 'pointer', transition: 'all 0.2s',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ padding: '2px 8px', background: sc.bg, color: sc.text, fontSize: 11, fontWeight: 500, borderRadius: 12 }}>{sc.label}</span>
                      <span style={{ fontSize: 11, color: C.textSecondary }}>Court {match.court}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>
                            {getTeam(match.team_a_id)?.name.charAt(0)}
                          </div>
                          <span style={{ fontWeight: 500, fontSize: 13, color: C.textPrimary }}>{getTeam(match.team_a_id)?.name}</span>
                        </div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: C.textSecondary, padding: '0 8px' }}>VS</span>
                      <div style={{ flex: 1, textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                          <span style={{ fontWeight: 500, fontSize: 13, color: C.textPrimary }}>{getTeam(match.team_b_id)?.name}</span>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, ${C.highlight}, #e06040)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>
                            {getTeam(match.team_b_id)?.name.charAt(0)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: 8, fontSize: 11, color: C.textSecondary }}>
                      {match.start_time} - {match.end_time}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============ RESULTS VIEW ============
const ResultsView: React.FC<{ teams: Team[]; matches: Match[]; matchdays: Matchday[]; pairResults: PairMatchResult[]; onViewMatch: (id: string) => void }> = ({ teams, matches, matchdays, pairResults, onViewMatch }) => {
  const getTeam = (id: string) => teams.find(t => t.id === id);
  const getMatchday = (id: string) => matchdays.find(md => md.id === id);
  const completedMatches = matches.filter(m => m.status === 'completed').reverse();

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary, margin: '0 0 16px', fontFamily: 'Montserrat, sans-serif' }}>Hasil Pertandingan</h1>
      {completedMatches.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ color: C.textSecondary }}>Belum ada hasil pertandingan.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {completedMatches.map(match => {
            const md = getMatchday(match.matchday_id);
            const results = pairResults.filter(r => r.match_id === match.id);
            const aWins = results.filter(r => r.winner_team_id === match.team_a_id).length;
            const bWins = results.filter(r => r.winner_team_id === match.team_b_id).length;
            return (
              <div key={match.id} onClick={() => onViewMatch(match.id)} style={{
                background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden', cursor: 'pointer',
              }}>
                <div style={{ padding: '8px 16px', background: C.bg, borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 500, color: C.primaryDark }}>{md?.name} • {md?.date}</span>
                  <span style={{ fontSize: 11, color: C.textSecondary }}>Court {match.court} • {match.start_time}</span>
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: 13, color: match.winner_team_id === match.team_a_id ? C.primary : C.textPrimary, margin: 0 }}>{getTeam(match.team_a_id)?.name}</p>
                      {match.winner_team_id === match.team_a_id && <span style={{ fontSize: 10, color: C.success, fontWeight: 500 }}>PEMENANG</span>}
                    </div>
                    <div style={{ padding: '0 16px', textAlign: 'center' }}>
                      <span style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, fontFamily: 'Montserrat, sans-serif' }}>{aWins}</span>
                      <span style={{ fontSize: 14, color: C.textSecondary, margin: '0 4px' }}>-</span>
                      <span style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, fontFamily: 'Montserrat, sans-serif' }}>{bWins}</span>
                    </div>
                    <div style={{ flex: 1, textAlign: 'right' }}>
                      <p style={{ fontWeight: 600, fontSize: 13, color: match.winner_team_id === match.team_b_id ? C.primary : C.textPrimary, margin: 0 }}>{getTeam(match.team_b_id)?.name}</p>
                      {match.winner_team_id === match.team_b_id && <span style={{ fontSize: 10, color: C.success, fontWeight: 500 }}>PEMENANG</span>}
                    </div>
                  </div>
                  {results.length > 0 && (
                    <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, marginTop: 8 }}>
                      {results.map(r => (
                        <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, padding: '2px 0' }}>
                          <span style={{ color: C.textSecondary }}>Pasangan {r.position}</span>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <span style={{ fontWeight: 600, color: r.winner_team_id === match.team_a_id ? C.success : C.textSecondary }}>{r.score_team_a}</span>
                            <span style={{ color: C.border }}>-</span>
                            <span style={{ fontWeight: 600, color: r.winner_team_id === match.team_b_id ? C.success : C.textSecondary }}>{r.score_team_b}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ============ TEAMS VIEW ============
const TeamsView: React.FC<{ teams: Team[]; standings: Standing[]; onViewTeam: (id: string) => void }> = ({ teams, standings, onViewTeam }) => {
  const activeTeams = teams.filter(t => t.is_active);
  const getPosition = (teamId: string) => standings.findIndex(s => s.team_id === teamId) + 1;
  const getStanding = (teamId: string) => standings.find(s => s.team_id === teamId);

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary, margin: '0 0 16px', fontFamily: 'Montserrat, sans-serif' }}>Tim Peserta</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
        {activeTeams.map(team => {
          const standing = getStanding(team.id);
          const pos = getPosition(team.id);
          return (
            <div key={team.id} onClick={() => onViewTeam(team.id)} style={{
              background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s',
            }}>
              <div style={{ height: 4, background: `linear-gradient(to right, ${C.primary}, ${C.primaryDark})` }} />
              <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16 }}>
                    {team.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 13, color: C.textPrimary, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team.name}</p>
                    <p style={{ fontSize: 11, color: C.textSecondary, margin: 0 }}>Kapten: {team.captain}</p>
                  </div>
                  {pos > 0 && (
                    <span style={{
                      width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700,
                      background: pos === 1 ? C.accent : pos === 2 ? C.primary : pos === 3 ? C.secondary : C.border,
                      color: pos <= 3 ? '#fff' : C.textSecondary,
                    }}>#{pos}</span>
                  )}
                </div>
                {standing && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                    {[
                      { v: standing.played, l: 'Main', c: C.textPrimary },
                      { v: standing.won, l: 'Menang', c: C.success },
                      { v: standing.lost, l: 'Kalah', c: C.error },
                      { v: standing.points, l: 'Poin', c: C.primaryDark },
                    ].map((s, i) => (
                      <div key={i} style={{ textAlign: 'center', background: C.bg, borderRadius: 8, padding: '6px 0' }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: s.c, margin: 0 }}>{s.v}</p>
                        <p style={{ fontSize: 9, color: C.textSecondary, margin: 0 }}>{s.l}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============ STATISTICS VIEW ============
const StatisticsView: React.FC<{ teams: Team[]; matches: Match[]; standings: Standing[]; pairs: Pair[]; pairResults: PairMatchResult[] }> = ({ teams, matches, standings, pairs, pairResults }) => {
  const completedMatches = matches.filter(m => m.status === 'completed');
  const maxPoints = Math.max(...standings.map(s => s.points), 1);
  const getTeam = (id: string) => teams.find(t => t.id === id);

  if (completedMatches.length === 0) {
    return (
      <div className="animate-fade-in">
        <h1 style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary, margin: '0 0 16px', fontFamily: 'Montserrat, sans-serif' }}>Statistik Liga</h1>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ color: C.textSecondary }}>Belum ada data statistik. Statistik akan tersedia setelah pertandingan pertama selesai.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary, margin: '0 0 16px', fontFamily: 'Montserrat, sans-serif' }}>Statistik Liga</h1>
      {/* Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Tim', value: teams.filter(t => t.is_active).length, color: C.primary },
          { label: 'Pertandingan Selesai', value: completedMatches.length, color: C.success },
          { label: 'Total Pasangan', value: pairs.filter(p => p.is_active).length, color: C.accent },
          { label: 'Total Pasangan Bertanding', value: pairResults.length, color: C.highlight },
        ].map((s, i) => (
          <div key={i} style={{ background: C.surface, borderRadius: 12, padding: 16, border: `1px solid ${C.border}` }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: s.color, margin: 0, fontFamily: 'Montserrat, sans-serif' }}>{s.value}</p>
            <p style={{ fontSize: 11, color: C.textSecondary, margin: '4px 0 0' }}>{s.label}</p>
          </div>
        ))}
      </div>
      {/* Chart */}
      <div style={{ background: C.surface, borderRadius: 12, padding: 20, border: `1px solid ${C.border}`, marginBottom: 16 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, margin: '0 0 12px', fontFamily: 'Montserrat, sans-serif' }}>Poin Klasemen Tim</h3>
        {standings.slice(0, 5).map((s: Standing, idx: number) => {
          const pct = (s.points / maxPoints) * 100;
          return (
            <div key={s.team_id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{
                width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, background: idx === 0 ? C.accent : idx === 1 ? C.primary : C.border,
                color: idx < 2 ? '#fff' : C.textSecondary,
              }}>{idx + 1}</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: C.textPrimary, width: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getTeam(s.team_id)?.name}</span>
              <div style={{ flex: 1, height: 20, background: C.bg, borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.max(pct, 5)}%`, background: `linear-gradient(to right, ${C.primary}, ${C.primaryDark})`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>{s.points}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Performance */}
      <div style={{ background: C.surface, borderRadius: 12, padding: 20, border: `1px solid ${C.border}` }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, margin: '0 0 12px', fontFamily: 'Montserrat, sans-serif' }}>Win Rate Tim</h3>
        {standings.map((s: Standing) => {
          const team = getTeam(s.team_id);
          const winRate = s.played > 0 ? Math.round((s.won / s.played) * 100) : 0;
          return (
            <div key={s.team_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: C.textPrimary, width: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team?.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 80, height: 8, background: C.bg, borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${winRate}%`, background: C.success, borderRadius: 4 }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.success, width: 30, textAlign: 'right' }}>{winRate}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============ LEAGUE INFO VIEW ============
const LeagueInfoView: React.FC<{ league: any; teams: Team[]; matches: Match[] }> = ({ league, teams, matches }) => {
  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary, margin: '0 0 16px', fontFamily: 'Montserrat, sans-serif' }}>Informasi Liga</h1>
      {/* Header Card */}
      <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ background: `linear-gradient(to right, ${C.primaryDark}, ${C.primary})`, padding: 24, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 22, fontWeight: 700 }}>S</span>
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px', fontFamily: 'Montserrat, sans-serif' }}>{league.name}</h2>
              <p style={{ fontSize: 12, opacity: 0.8, margin: 0, fontStyle: 'italic' }}>One League. One Community. One Passion.</p>
              <p style={{ fontSize: 11, opacity: 0.6, margin: '4px 0 0' }}>Season {league.season} • Papua Barat Daya</p>
            </div>
          </div>
        </div>
        <div style={{ padding: 16 }}>
          <p style={{ fontSize: 13, color: C.textSecondary, margin: 0, lineHeight: 1.6 }}>{league.description}</p>
        </div>
      </div>
      {/* Settings Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 16 }}>
        <div style={{ background: C.surface, borderRadius: 12, padding: 16, border: `1px solid ${C.border}` }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, margin: '0 0 12px' }}>Format Kompetisi</h3>
          {[
            { l: 'Jumlah Tim', v: `${league.settings.teams_count} tim` },
            { l: 'Pasangan per Tim', v: `${league.settings.pairs_per_team} pasangan` },
            { l: 'Pasangan Dimainkan', v: `${league.settings.pairs_played} pasangan` },
            { l: 'Jumlah Court', v: `${league.settings.courts_count} court` },
            { l: 'Format', v: league.settings.match_format === 'single_set' ? 'Single Set' : 'Best of 3' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 4 ? `1px solid ${C.border}` : 'none' }}>
              <span style={{ fontSize: 12, color: C.textSecondary }}>{item.l}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary }}>{item.v}</span>
            </div>
          ))}
        </div>
        <div style={{ background: C.surface, borderRadius: 12, padding: 16, border: `1px solid ${C.border}` }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, margin: '0 0 12px' }}>Sistem Poin</h3>
          {[
            { l: 'Menang', v: `${league.settings.points_win} poin`, c: C.success },
            { l: 'Seri', v: `${league.settings.points_draw} poin`, c: C.warning },
            { l: 'Kalah', v: `${league.settings.points_loss} poin`, c: C.error },
            { l: 'Target Game', v: `${league.settings.target_games} game`, c: C.textPrimary },
            { l: 'Golden Point', v: league.settings.golden_point ? 'Ya' : 'Tidak', c: C.textPrimary },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 4 ? `1px solid ${C.border}` : 'none' }}>
              <span style={{ fontSize: 12, color: C.textSecondary }}>{item.l}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: item.c }}>{item.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============ MATCH DETAIL VIEW ============
const MatchDetailView: React.FC<{ matchId: string; onBack: () => void; onViewTeam: (id: string) => void }> = ({ matchId, onBack, onViewTeam }) => {
  const match = store.getMatches().find(m => m.id === matchId);
  const teams = store.getTeams();
  const matchdays = store.getMatchdays();
  const pairResults = store.getPairResults();
  const pairs = store.getPairs();
  const players = store.getPlayers();

  if (!match) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <p style={{ color: C.textSecondary }}>Pertandingan tidak ditemukan.</p>
        <button onClick={onBack} style={{ marginTop: 16, padding: '8px 16px', background: C.primary, color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer' }}>Kembali</button>
      </div>
    );
  }

  const teamA = teams.find(t => t.id === match.team_a_id);
  const teamB = teams.find(t => t.id === match.team_b_id);
  const matchday = matchdays.find(md => md.id === match.matchday_id);
  const results = pairResults.filter(r => r.match_id === matchId);
  const aWins = results.filter(r => r.winner_team_id === match.team_a_id).length;
  const bWins = results.filter(r => r.winner_team_id === match.team_b_id).length;

  const statusLabel = match.status === 'upcoming' ? 'Akan Datang' : match.status === 'ongoing' ? 'LIVE' : match.status === 'completed' ? 'Selesai' : 'Dibatalkan';
  const statusColor = match.status === 'upcoming' ? C.secondary : match.status === 'ongoing' ? C.highlight : match.status === 'completed' ? C.success : C.error;

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.textSecondary, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, padding: 0 }}>
        ← Kembali
      </button>
      <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ background: `linear-gradient(to right, ${C.primaryDark}, ${C.primary})`, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{matchday?.name}</span>
          <span style={{ padding: '4px 12px', background: `${statusColor}20`, color: statusColor, fontSize: 11, fontWeight: 700, borderRadius: 12 }}>{statusLabel}</span>
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 20 }}>
                {teamA?.name.charAt(0)}
              </div>
              <button onClick={() => onViewTeam(match.team_a_id)} style={{ fontWeight: 700, fontSize: 13, color: C.textPrimary, background: 'none', border: 'none', cursor: 'pointer' }}>{teamA?.name}</button>
              {match.winner_team_id === match.team_a_id && <p style={{ fontSize: 10, color: C.success, fontWeight: 600, margin: '4px 0 0' }}>🏆 PEMENANG</p>}
            </div>
            <div style={{ padding: '0 16px', textAlign: 'center' }}>
              {match.status === 'completed' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 28, fontWeight: 700, color: C.textPrimary, fontFamily: 'Montserrat, sans-serif' }}>{aWins}</span>
                  <span style={{ fontSize: 16, color: C.textSecondary }}>-</span>
                  <span style={{ fontSize: 28, fontWeight: 700, color: C.textPrimary, fontFamily: 'Montserrat, sans-serif' }}>{bWins}</span>
                </div>
              ) : (
                <span style={{ fontSize: 20, fontWeight: 700, color: C.textSecondary }}>VS</span>
              )}
              <p style={{ fontSize: 10, color: C.textSecondary, margin: '4px 0 0' }}>Pasangan</p>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg, ${C.highlight}, #e06040)`, margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 20 }}>
                {teamB?.name.charAt(0)}
              </div>
              <button onClick={() => onViewTeam(match.team_b_id)} style={{ fontWeight: 700, fontSize: 13, color: C.textPrimary, background: 'none', border: 'none', cursor: 'pointer' }}>{teamB?.name}</button>
              {match.winner_team_id === match.team_b_id && <p style={{ fontSize: 10, color: C.success, fontWeight: 600, margin: '4px 0 0' }}>🏆 PEMENANG</p>}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}`, fontSize: 11, color: C.textSecondary }}>
            <span>📅 {matchday?.date}</span>
            <span>🕐 {match.start_time} - {match.end_time}</span>
            <span>📍 Court {match.court}</span>
          </div>
        </div>
      </div>
      {/* Pair Results */}
      {results.length > 0 && (
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', background: C.bg, borderBottom: `1px solid ${C.border}` }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, margin: 0 }}>Hasil Pertandingan Pasangan</h3>
          </div>
          <div style={{ padding: 16 }}>
            {results.map(r => {
              const pairA = pairs.find(p => p.id === r.team_a_pair_id);
              const pairB = pairs.find(p => p.id === r.team_b_pair_id);
              const p1a = players.find(p => p.id === pairA?.player_1_id);
              const p2a = players.find(p => p.id === pairA?.player_2_id);
              const p1b = players.find(p => p.id === pairB?.player_1_id);
              const p2b = players.find(p => p.id === pairB?.player_2_id);
              return (
                <div key={r.id} style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 500, color: C.primaryDark }}>Pasangan {r.position}</span>
                    <span style={{ fontSize: 10, fontWeight: 500, color: r.winner_team_id === match.team_a_id ? C.success : C.highlight, padding: '2px 6px', background: r.winner_team_id === match.team_a_id ? `${C.success}15` : `${C.highlight}15`, borderRadius: 8 }}>
                      {r.winner_team_id === match.team_a_id ? teamA?.name : teamB?.name} menang
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 12, fontWeight: 500, color: C.textPrimary, margin: 0 }}>{p1a?.name || 'Pemain 1'}</p>
                      <p style={{ fontSize: 11, color: C.textSecondary, margin: 0 }}>{p2a?.name || 'Pemain 2'}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px' }}>
                      <span style={{ fontSize: 18, fontWeight: 700, color: r.winner_team_id === match.team_a_id ? C.success : C.textSecondary }}>{r.score_team_a}</span>
                      <span style={{ fontSize: 12, color: C.border }}>-</span>
                      <span style={{ fontSize: 18, fontWeight: 700, color: r.winner_team_id === match.team_b_id ? C.success : C.textSecondary }}>{r.score_team_b}</span>
                    </div>
                    <div style={{ flex: 1, textAlign: 'right' }}>
                      <p style={{ fontSize: 12, fontWeight: 500, color: C.textPrimary, margin: 0 }}>{p1b?.name || 'Pemain 1'}</p>
                      <p style={{ fontSize: 11, color: C.textSecondary, margin: 0 }}>{p2b?.name || 'Pemain 2'}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {match.status === 'upcoming' && (
        <div style={{ background: C.surface, borderRadius: 12, padding: 32, border: `1px solid ${C.border}`, textAlign: 'center' }}>
          <p style={{ color: C.textSecondary, fontSize: 13 }}>Pertandingan belum dimulai. Detail pasangan dan skor akan tersedia setelah pertandingan dimulai.</p>
        </div>
      )}
    </div>
  );
};

// ============ TEAM DETAIL VIEW ============
const TeamDetailView: React.FC<{ teamId: string; onBack: () => void; onViewMatch: (id: string) => void }> = ({ teamId, onBack, onViewMatch }) => {
  const team = store.getTeams().find(t => t.id === teamId);
  const standings = store.getStandings();
  const matches = store.getMatches();
  const matchdays = store.getMatchdays();
  const pairs = store.getPairs().filter(p => p.team_id === teamId && p.is_active);
  const players = store.getPlayers().filter(p => p.team_id === teamId && p.is_active);
  const pairResults = store.getPairResults();

  if (!team) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <p style={{ color: C.textSecondary }}>Tim tidak ditemukan.</p>
        <button onClick={onBack} style={{ marginTop: 16, padding: '8px 16px', background: C.primary, color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer' }}>Kembali</button>
      </div>
    );
  }

  const standing = standings.find(s => s.team_id === teamId);
  const position = standings.findIndex(s => s.team_id === teamId) + 1;
  const teamMatches = matches.filter(m => m.team_a_id === teamId || m.team_b_id === teamId);
  const completedMatches = teamMatches.filter(m => m.status === 'completed').slice(-5).reverse();
  const upcomingMatches = teamMatches.filter(m => m.status === 'upcoming').slice(0, 3);

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.textSecondary, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, padding: 0 }}>
        ← Kembali
      </button>
      {/* Header */}
      <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ background: `linear-gradient(to right, ${C.primaryDark}, ${C.primary})`, padding: 20, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22 }}>
              {team.name.charAt(0)}
            </div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px', fontFamily: 'Montserrat, sans-serif' }}>{team.name}</h1>
              <p style={{ fontSize: 12, opacity: 0.8, margin: 0 }}>Kapten: {team.captain}</p>
              <p style={{ fontSize: 11, opacity: 0.6, margin: '2px 0 0' }}>{team.description}</p>
            </div>
          </div>
        </div>
        {standing && (
          <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
            {[
              { l: 'Posisi', v: `#${position}`, c: C.primaryDark },
              { l: 'Poin', v: standing.points, c: C.primary },
              { l: 'Main', v: standing.played, c: C.textPrimary },
              { l: 'Menang', v: standing.won, c: C.success },
              { l: 'Kalah', v: standing.lost, c: C.error },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', background: C.bg, borderRadius: 8, padding: '8px 0' }}>
                <p style={{ fontSize: 10, color: C.textSecondary, margin: '0 0 2px' }}>{s.l}</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: s.c, margin: 0, fontFamily: 'Montserrat, sans-serif' }}>{s.v}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Pairs */}
      <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '10px 16px', background: C.bg, borderBottom: `1px solid ${C.border}` }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, margin: 0 }}>Pasangan Pemain</h3>
        </div>
        <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
          {pairs.map(pair => {
            const p1 = players.find(p => p.id === pair.player_1_id);
            const p2 = players.find(p => p.id === pair.player_2_id);
            return (
              <div key={pair.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, borderRadius: 8, border: `1px solid ${C.border}` }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${C.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primaryDark, fontSize: 10, fontWeight: 700 }}>
                  {pair.pair_name.split(' ').pop()}
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 500, color: C.textPrimary, margin: 0 }}>{p1?.name || 'Pemain 1'}</p>
                  <p style={{ fontSize: 11, color: C.textSecondary, margin: 0 }}>& {p2?.name || 'Pemain 2'}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Recent Matches */}
      {completedMatches.length > 0 && (
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ padding: '10px 16px', background: C.bg, borderBottom: `1px solid ${C.border}` }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, margin: 0 }}>Hasil Pertandingan Terakhir</h3>
          </div>
          <div style={{ padding: 12 }}>
            {completedMatches.map(match => {
              const oppId = match.team_a_id === teamId ? match.team_b_id : match.team_a_id;
              const opp = store.getTeams().find(t => t.id === oppId);
              const isWin = match.winner_team_id === teamId;
              const md = matchdays.find(m => m.id === match.matchday_id);
              return (
                <div key={match.id} onClick={() => onViewMatch(match.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, marginBottom: 6, cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: isWin ? C.success : C.error, color: '#fff' }}>
                      {isWin ? 'W' : 'L'}
                    </span>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 500, color: C.textPrimary, margin: 0 }}>vs {opp?.name}</p>
                      <p style={{ fontSize: 10, color: C.textSecondary, margin: 0 }}>{md?.name} • {md?.date}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 10, color: C.textSecondary }}>Court {match.court}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Upcoming */}
      {upcomingMatches.length > 0 && (
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', background: C.bg, borderBottom: `1px solid ${C.border}` }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, margin: 0 }}>Jadwal Mendatang</h3>
          </div>
          <div style={{ padding: 12 }}>
            {upcomingMatches.map(match => {
              const oppId = match.team_a_id === teamId ? match.team_b_id : match.team_a_id;
              const opp = store.getTeams().find(t => t.id === oppId);
              const md = matchdays.find(m => m.id === match.matchday_id);
              return (
                <div key={match.id} onClick={() => onViewMatch(match.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, marginBottom: 6, cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${C.secondary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.secondary, fontSize: 11, fontWeight: 700 }}>
                      {opp?.name.charAt(0)}
                    </div>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 500, color: C.textPrimary, margin: 0 }}>vs {opp?.name}</p>
                      <p style={{ fontSize: 10, color: C.textSecondary, margin: 0 }}>{md?.name} • {md?.date} • {match.start_time}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 10, color: C.textSecondary }}>Court {match.court}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ============ ADMIN VIEW ============
const AdminView: React.FC<{
  loggedIn: boolean;
  onLogin: (u: string, p: string) => boolean;
  onLogout: () => void;
  onExit: () => void;
  page: string;
  setPage: (p: string) => void;
  refresh: () => void;
}> = ({ loggedIn, onLogin, onLogout, onExit, page, setPage, refresh }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<{ type: string; msg: string } | null>(null);

  const notify = (type: string, msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 3000);
    refresh();
  };

  if (!loggedIn) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}><Logo size="lg" /></div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary, margin: '0 0 4px', fontFamily: 'Montserrat, sans-serif' }}>Admin Login</h1>
            <p style={{ fontSize: 12, color: C.textSecondary, margin: 0 }}>Masuk untuk mengelola liga</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); if (!onLogin(username, password)) setError('Username atau password salah'); }} style={{ background: C.surface, borderRadius: 12, padding: 20, border: `1px solid ${C.border}` }}>
            {error && <div style={{ padding: '8px 12px', background: `${C.error}15`, borderRadius: 8, marginBottom: 12, fontSize: 12, color: C.error }}>{error}</div>}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: C.textPrimary, marginBottom: 4 }}>Username</label>
              <input value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: 'none' }} placeholder="admin" required />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: C.textPrimary, marginBottom: 4 }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: 'none' }} placeholder="••••••••" required />
            </div>
            <button type="submit" style={{ width: '100%', padding: '10px', background: C.primary, color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: 13, border: 'none', cursor: 'pointer' }}>Login</button>
            <button type="button" onClick={onExit} style={{ width: '100%', padding: '10px', background: 'transparent', color: C.textSecondary, fontSize: 12, border: 'none', cursor: 'pointer', marginTop: 8 }}>← Kembali ke halaman utama</button>
          </form>
          <p style={{ textAlign: 'center', fontSize: 11, color: C.textSecondary, marginTop: 12 }}>Default: admin / padel2025</p>
        </div>
      </div>
    );
  }

  const teams = store.getTeams();
  const players = store.getPlayers();
  const matches = store.getMatches();
  const standings = store.getStandings();
  const matchdays = store.getMatchdays();
  const league = store.getLeague();
  const pairs = store.getPairs();
  const pairResults = store.getPairResults();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'teams', label: 'Tim' },
    { id: 'schedule', label: 'Jadwal' },
    { id: 'scores', label: 'Input Skor' },
    { id: 'standings', label: 'Klasemen' },
    { id: 'settings', label: 'Pengaturan' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      {notification && (
        <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 100, padding: '10px 16px', borderRadius: 8, background: notification.type === 'success' ? C.success : C.error, color: '#fff', fontSize: 13, fontWeight: 500, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          {notification.msg}
        </div>
      )}
      {/* Header */}
      <header style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Logo size="sm" />
          <span style={{ fontSize: 10, padding: '2px 8px', background: `${C.primary}15`, color: C.primaryDark, borderRadius: 10, fontWeight: 600 }}>Admin</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onExit} style={{ padding: '6px 12px', fontSize: 12, color: C.textSecondary, background: 'none', border: 'none', cursor: 'pointer' }}>Lihat Situs</button>
          <button onClick={onLogout} style={{ padding: '6px 12px', fontSize: 12, color: C.error, background: `${C.error}10`, borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 500 }}>Logout</button>
        </div>
      </header>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 16, display: 'flex', gap: 16, flexDirection: 'column' }}>
        {/* Menu */}
        <nav style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 4 }}>
          {menuItems.map(item => (
            <button key={item.id} onClick={() => setPage(item.id)} style={{
              padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              background: page === item.id ? C.primary : C.surface, color: page === item.id ? '#fff' : C.textSecondary,
            }}>{item.label}</button>
          ))}
        </nav>
        {/* Content */}
        <div>
          {page === 'dashboard' && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary, margin: '0 0 12px', fontFamily: 'Montserrat, sans-serif' }}>Dashboard</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
                {[
                  { l: 'Tim', v: teams.length, c: C.primary },
                  { l: 'Pemain', v: players.filter(p => p.is_active).length, c: C.secondary },
                  { l: 'Pertandingan', v: matches.length, c: C.primaryDark },
                  { l: 'Selesai', v: matches.filter(m => m.status === 'completed').length, c: C.success },
                  { l: 'Mendatang', v: matches.filter(m => m.status === 'upcoming').length, c: C.warning },
                ].map((s, i) => (
                  <div key={i} style={{ background: C.surface, borderRadius: 10, padding: 14, border: `1px solid ${C.border}` }}>
                    <p style={{ fontSize: 20, fontWeight: 700, color: s.c, margin: 0, fontFamily: 'Montserrat, sans-serif' }}>{s.v}</p>
                    <p style={{ fontSize: 10, color: C.textSecondary, margin: '2px 0 0' }}>{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {page === 'teams' && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary, margin: '0 0 12px', fontFamily: 'Montserrat, sans-serif' }}>Manajemen Tim</h2>
              <div style={{ display: 'grid', gap: 8 }}>
                {teams.filter(t => t.is_active).map(team => (
                  <div key={team.id} style={{ background: C.surface, borderRadius: 10, padding: 12, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>
                        {team.name.charAt(0)}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary, margin: 0 }}>{team.name}</p>
                        <p style={{ fontSize: 11, color: C.textSecondary, margin: 0 }}>Kapten: {team.captain}</p>
                      </div>
                    </div>
                    <button onClick={() => {
                      const updated = teams.map(t => t.id === team.id ? { ...t, is_active: false } : t);
                      store.saveTeams(updated);
                      notify('success', 'Tim dinonaktifkan');
                    }} style={{ padding: '4px 10px', fontSize: 11, color: C.error, background: `${C.error}10`, borderRadius: 6, border: 'none', cursor: 'pointer' }}>Nonaktifkan</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {page === 'schedule' && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary, margin: '0 0 12px', fontFamily: 'Montserrat, sans-serif' }}>Manajemen Jadwal</h2>
              {matchdays.map(md => {
                const mdMatches = matches.filter(m => m.matchday_id === md.id);
                return (
                  <div key={md.id} style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, marginBottom: 10, overflow: 'hidden' }}>
                    <div style={{ padding: '8px 12px', background: C.bg, borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.textPrimary }}>{md.name}</span>
                      <span style={{ fontSize: 11, color: C.textSecondary }}>{md.date}</span>
                    </div>
                    <div style={{ padding: 10 }}>
                      {mdMatches.map(match => {
                        const tA = teams.find(t => t.id === match.team_a_id);
                        const tB = teams.find(t => t.id === match.team_b_id);
                        return (
                          <div key={match.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: `1px solid ${C.border}` }}>
                            <span style={{ fontSize: 12, color: C.textPrimary }}>{tA?.name} vs {tB?.name} (C{match.court})</span>
                            <select value={match.status} onChange={(e) => {
                              const updated = matches.map(m => m.id === match.id ? { ...m, status: e.target.value as Match['status'] } : m);
                              store.saveMatches(updated);
                              notify('success', 'Status diperbarui');
                            }} style={{ fontSize: 11, padding: '3px 6px', borderRadius: 6, border: `1px solid ${C.border}` }}>
                              <option value="upcoming">Akan Datang</option>
                              <option value="ongoing">Berlangsung</option>
                              <option value="completed">Selesai</option>
                              <option value="cancelled">Dibatalkan</option>
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {page === 'scores' && <AdminScores notify={notify} />}
          {page === 'standings' && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary, margin: '0 0 12px', fontFamily: 'Montserrat, sans-serif' }}>Klasemen</h2>
              <div style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                  <thead><tr style={{ background: C.primaryDark, color: '#fff' }}>
                    <th style={{ padding: 8, textAlign: 'left' }}>Pos</th><th style={{ padding: 8, textAlign: 'left' }}>Tim</th>
                    <th style={{ padding: 8, textAlign: 'center' }}>M</th><th style={{ padding: 8, textAlign: 'center' }}>Me</th>
                    <th style={{ padding: 8, textAlign: 'center' }}>K</th><th style={{ padding: 8, textAlign: 'center' }}>Poin</th>
                  </tr></thead>
                  <tbody>{standings.map((s, idx) => (
                    <tr key={s.team_id} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: 8, fontWeight: 700, color: C.primaryDark }}>{idx + 1}</td>
                      <td style={{ padding: 8, fontWeight: 500 }}>{teams.find(t => t.id === s.team_id)?.name}</td>
                      <td style={{ padding: 8, textAlign: 'center' }}>{s.played}</td>
                      <td style={{ padding: 8, textAlign: 'center', color: C.success }}>{s.won}</td>
                      <td style={{ padding: 8, textAlign: 'center', color: C.error }}>{s.lost}</td>
                      <td style={{ padding: 8, textAlign: 'center', fontWeight: 700, color: C.primaryDark }}>{s.points}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}
          {page === 'settings' && <AdminSettings league={league} notify={notify} />}
        </div>
      </div>
    </div>
  );
};

// Admin Scores Input
const AdminScores: React.FC<{ notify: (type: string, msg: string) => void }> = ({ notify }) => {
  const matches = store.getMatches();
  const teams = store.getTeams();
  const matchdays = store.getMatchdays();
  const pairs = store.getPairs();
  const [selectedMatch, setSelectedMatch] = useState('');
  const [scores, setScores] = useState([{ a: 0, b: 0 }, { a: 0, b: 0 }, { a: 0, b: 0 }, { a: 0, b: 0 }]);

  const availableMatches = matches.filter(m => m.status === 'upcoming' || m.status === 'ongoing');
  const match = matches.find(m => m.id === selectedMatch);

  const handleSave = (draft: boolean) => {
    if (!match) return;
    const results = scores.map((s, idx) => ({
      id: uuidv4(),
      match_id: match.id,
      position: idx + 1,
      team_a_pair_id: pairs.filter(p => p.team_id === match.team_a_id && p.is_active)[idx]?.id || '',
      team_b_pair_id: pairs.filter(p => p.team_id === match.team_b_id && p.is_active)[idx]?.id || '',
      score_team_a: s.a,
      score_team_b: s.b,
      winner_team_id: s.a > s.b ? match.team_a_id : s.b > s.a ? match.team_b_id : null,
      status: draft ? 'pending' as const : 'completed' as const,
    }));
    if (!draft) {
      store.saveMatchResult(match.id, results.map(r => ({ ...r })));
      notify('success', 'Hasil disahkan!');
    } else {
      const all = store.getPairResults().filter(r => r.match_id !== match.id);
      store.savePairResults([...all, ...results]);
      notify('success', 'Draft disimpan');
    }
    setSelectedMatch('');
    setScores([{ a: 0, b: 0 }, { a: 0, b: 0 }, { a: 0, b: 0 }, { a: 0, b: 0 }]);
  };

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary, margin: '0 0 12px', fontFamily: 'Montserrat, sans-serif' }}>Input Skor</h2>
      <div style={{ background: C.surface, borderRadius: 10, padding: 16, border: `1px solid ${C.border}`, marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: C.textPrimary, marginBottom: 6 }}>Pilih Pertandingan</label>
        <select value={selectedMatch} onChange={e => setSelectedMatch(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }}>
          <option value="">-- Pilih pertandingan --</option>
          {availableMatches.map(m => {
            const tA = teams.find(t => t.id === m.team_a_id);
            const tB = teams.find(t => t.id === m.team_b_id);
            const md = matchdays.find(d => d.id === m.matchday_id);
            return <option key={m.id} value={m.id}>{md?.name} - {tA?.name} vs {tB?.name}</option>;
          })}
        </select>
      </div>
      {selectedMatch && match && (
        <div style={{ background: C.surface, borderRadius: 10, padding: 16, border: `1px solid ${C.border}` }}>
          <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, color: C.textPrimary, margin: '0 0 12px' }}>
            {teams.find(t => t.id === match.team_a_id)?.name} vs {teams.find(t => t.id === match.team_b_id)?.name}
          </p>
          {scores.map((s, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: C.primaryDark, width: 70 }}>Pasangan {idx + 1}</span>
              <input type="number" min="0" max="7" value={s.a} onChange={e => { const n = [...scores]; n[idx] = { ...n[idx], a: parseInt(e.target.value) || 0 }; setScores(n); }} style={{ width: 50, textAlign: 'center', padding: '6px', borderRadius: 6, border: `1px solid ${C.border}`, fontWeight: 700 }} />
              <span style={{ color: C.textSecondary }}>-</span>
              <input type="number" min="0" max="7" value={s.b} onChange={e => { const n = [...scores]; n[idx] = { ...n[idx], b: parseInt(e.target.value) || 0 }; setScores(n); }} style={{ width: 50, textAlign: 'center', padding: '6px', borderRadius: 6, border: `1px solid ${C.border}`, fontWeight: 700 }} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button onClick={() => handleSave(false)} style={{ flex: 1, padding: '10px', background: C.success, color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: 12, border: 'none', cursor: 'pointer' }}>Sahkan Hasil</button>
            <button onClick={() => handleSave(true)} style={{ flex: 1, padding: '10px', background: C.warning, color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: 12, border: 'none', cursor: 'pointer' }}>Simpan Draft</button>
          </div>
        </div>
      )}
    </div>
  );
};

// Admin Settings
const AdminSettings: React.FC<{ league: any; notify: (type: string, msg: string) => void }> = ({ league, notify }) => {
  const [name, setName] = useState(league.name);
  const [season, setSeason] = useState(league.season);
  const [desc, setDesc] = useState(league.description);
  const [status, setStatus] = useState(league.status);
  const [ptsWin, setPtsWin] = useState(league.settings.points_win);
  const [ptsDraw, setPtsDraw] = useState(league.settings.points_draw);
  const [ptsLoss, setPtsLoss] = useState(league.settings.points_loss);
  const [courts, setCourts] = useState(league.settings.courts_count);
  const [target, setTarget] = useState(league.settings.target_games);
  const [gp, setGp] = useState(league.settings.golden_point);

  const handleSave = () => {
    store.saveLeague({
      ...league, name, season, description: desc, status,
      settings: { ...league.settings, points_win: ptsWin, points_draw: ptsDraw, points_loss: ptsLoss, courts_count: courts, target_games: target, golden_point: gp },
    });
    notify('success', 'Pengaturan disimpan');
  };

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary, margin: '0 0 12px', fontFamily: 'Montserrat, sans-serif' }}>Pengaturan Liga</h2>
      <div style={{ background: C.surface, borderRadius: 10, padding: 16, border: `1px solid ${C.border}` }}>
        {[
          { l: 'Nama Liga', v: name, set: setName, type: 'text' },
          { l: 'Season', v: season, set: setSeason, type: 'text' },
        ].map((f, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: C.textSecondary, marginBottom: 4 }}>{f.l}</label>
            <input value={f.v} onChange={e => f.set(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }} />
          </div>
        ))}
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: C.textSecondary, marginBottom: 4 }}>Deskripsi</label>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, resize: 'vertical' }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: C.textSecondary, marginBottom: 4 }}>Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }}>
            <option value="upcoming">Akan Datang</option>
            <option value="ongoing">Berlangsung</option>
            <option value="completed">Selesai</option>
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          {[
            { l: 'Poin Menang', v: ptsWin, set: setPtsWin },
            { l: 'Poin Seri', v: ptsDraw, set: setPtsDraw },
            { l: 'Poin Kalah', v: ptsLoss, set: setPtsLoss },
            { l: 'Jumlah Court', v: courts, set: setCourts },
            { l: 'Target Game', v: target, set: setTarget },
          ].map((f, i) => (
            <div key={i}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: C.textSecondary, marginBottom: 4 }}>{f.l}</label>
              <input type="number" value={f.v} onChange={e => f.set(parseInt(e.target.value) || 0)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }} />
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={gp} onChange={e => setGp(e.target.checked)} style={{ width: 16, height: 16 }} />
              <span style={{ fontSize: 12, color: C.textPrimary }}>Golden Point</span>
            </label>
          </div>
        </div>
        <button onClick={handleSave} style={{ width: '100%', padding: '10px', background: C.primary, color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: 13, border: 'none', cursor: 'pointer' }}>Simpan Pengaturan</button>
      </div>
    </div>
  );
};

export default App;
