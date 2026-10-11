import React, { useState, useCallback, useRef } from 'react';
import { store } from './store';
import { Page, Team, Match, Matchday, Standing, PairMatchResult, Pair, Player, User } from './types';
import { v4 as uuidv4 } from 'uuid';
import AdminSettings from './components/AdminSettings';

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

// Download Klasemen PNG
const downloadStandingsPNG = (standings: Standing[], teams: Team[], league: any) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = 1920;
  const rowHeight = 60;
  const headerHeight = 200;
  const height = headerHeight + (standings.length * rowHeight) + 100;
  canvas.width = width;
  canvas.height = height;

  // Background
  ctx.fillStyle = '#F5FBFC';
  ctx.fillRect(0, 0, width, height);

  // Header gradient
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, '#087E91');
  gradient.addColorStop(1, '#16B9C0');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, headerHeight);

  // Logo circle
  ctx.beginPath();
  ctx.arc(100, 100, 50, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 40px Montserrat';
  ctx.textAlign = 'center';
  ctx.fillText('S', 100, 115);

  // Title
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 32px Montserrat';
  ctx.textAlign = 'left';
  ctx.fillText('KLASEMEN LIGA PADEL', 180, 80);
  ctx.font = '16px Inter';
  ctx.fillText(`${league.name} • Season ${league.season}`, 180, 110);
  ctx.fillText(`Diperbarui: ${new Date().toLocaleDateString('id-ID')}`, 180, 135);

  // Table header
  const tableTop = headerHeight + 20;
  ctx.fillStyle = '#087E91';
  ctx.fillRect(40, tableTop, width - 80, 50);
  
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px Inter';
  ctx.textAlign = 'center';
  const cols = ['Pos', 'Nama Tim', 'Main', 'Total Poin', 'Pasangan Menang', 'Pasangan Kalah', 'Selisih'];
  const colWidths = [80, 400, 100, 150, 180, 180, 150];
  let x = 40;
  cols.forEach((col, i) => {
    ctx.fillText(col, x + colWidths[i] / 2, tableTop + 30);
    x += colWidths[i];
  });

  // Table rows
  standings.forEach((s, idx) => {
    const team = teams.find(t => t.id === s.team_id);
    const y = tableTop + 50 + (idx * rowHeight);
    
    // Row background
    if (idx === 0) {
      ctx.fillStyle = 'rgba(168, 216, 46, 0.15)';
      ctx.fillRect(40, y, width - 80, rowHeight);
    } else if (idx % 2 === 0) {
      ctx.fillStyle = 'rgba(220, 236, 223, 0.3)';
      ctx.fillRect(40, y, width - 80, rowHeight);
    }

    // Position badge
    ctx.beginPath();
    ctx.arc(80, y + rowHeight / 2, 18, 0, Math.PI * 2);
    ctx.fillStyle = idx === 0 ? '#A8D82E' : idx === 1 ? '#16B9C0' : idx === 2 ? '#1599B8' : '#DCECEF';
    ctx.fill();
    ctx.fillStyle = idx < 3 ? '#fff' : '#718792';
    ctx.font = 'bold 14px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(String(idx + 1), 80, y + rowHeight / 2 + 5);

    // Team logo placeholder
    ctx.beginPath();
    ctx.arc(150, y + rowHeight / 2, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#16B9C0';
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Inter';
    ctx.fillText(team?.name.charAt(0) || '?', 150, y + rowHeight / 2 + 5);

    // Team name
    ctx.fillStyle = '#173D4A';
    ctx.font = '500 14px Inter';
    ctx.textAlign = 'left';
    ctx.fillText(team?.name || 'Unknown', 190, y + rowHeight / 2 + 5);

    // Stats
    ctx.textAlign = 'center';
    ctx.font = '14px Inter';
    ctx.fillStyle = '#173D4A';
    x = 40 + colWidths[0] + colWidths[1];
    ctx.fillText(String(s.played), x + colWidths[2] / 2, y + rowHeight / 2 + 5);
    x += colWidths[2];
    ctx.font = 'bold 14px Inter';
    ctx.fillStyle = '#087E91';
    ctx.fillText(String(s.total_points), x + colWidths[3] / 2, y + rowHeight / 2 + 5);
    x += colWidths[3];
    ctx.font = '14px Inter';
    ctx.fillStyle = '#2EAD72';
    ctx.fillText(String(s.pair_wins), x + colWidths[4] / 2, y + rowHeight / 2 + 5);
    x += colWidths[4];
    ctx.fillStyle = '#E65C5C';
    ctx.fillText(String(s.pair_losses), x + colWidths[5] / 2, y + rowHeight / 2 + 5);
    x += colWidths[5];
    ctx.fillStyle = '#173D4A';
    ctx.fillText(String(s.pair_difference), x + colWidths[6] / 2, y + rowHeight / 2 + 5);
  });

  // Footer
  const footerY = tableTop + 50 + (standings.length * rowHeight) + 30;
  ctx.fillStyle = '#718792';
  ctx.font = '12px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('Klasemen dihitung berdasarkan akumulasi total poin dari seluruh partai pasangan dalam pertandingan yang telah disahkan.', width / 2, footerY);
  ctx.fillText('© 2025 SOQ.COMM PADEL LEAGUE - Papua Barat Daya, Indonesia', width / 2, footerY + 25);

  // Download
  canvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SOQ-COMM-PADEL-LEAGUE-KLASEMEN-${league.season}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, 'image/png');
};

// App Component
function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [showAdmin, setShowAdmin] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [, setRefresh] = useState(0);

  const refresh = useCallback(() => setRefresh(r => r + 1), []);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    setSelectedMatchId(null);
    setSelectedTeamId(null);
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
    return <AdminView onExit={() => setShowAdmin(false)} onRefresh={refresh} />;
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
                  <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600 }}>Main</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600 }}>Total Poin</th>
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
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: C.primaryDark }}>{s.total_points}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: C.primaryDark }}>{s.total_points}</td>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary, margin: 0, fontFamily: 'Montserrat, sans-serif' }}>Klasemen Liga</h1>
        <button onClick={() => downloadStandingsPNG(standings, teams, league)} style={{
          padding: '8px 16px', background: C.primary, color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
        }}>
          ⬇ Download PNG
        </button>
      </div>
      <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', minWidth: 700 }}>
            <thead>
              <tr style={{ background: C.primaryDark, color: '#fff' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>Pos</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>Logo</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>Tim</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600 }}>Main</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600 }}>Total Poin</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600 }}>Pasangan Menang</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600 }}>Pasangan Kalah</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600 }}>Selisih</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s: Standing, idx: number) => {
                const team = getTeam(s.team_id);
                return (
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
                      {team?.logo_url ? (
                        <img src={team.logo_url} alt={team.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>
                          {team?.name.charAt(0)}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 500, color: C.textPrimary }}>{team?.name}</td>
                    <td style={{ padding: '12px', textAlign: 'center', color: C.textSecondary }}>{s.played}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 32, borderRadius: 8, background: `${C.primary}15`, color: C.primaryDark, fontWeight: 700 }}>{s.total_points}</span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', color: C.success, fontWeight: 600 }}>{s.pair_wins}</td>
                    <td style={{ padding: '12px', textAlign: 'center', color: C.error, fontWeight: 600 }}>{s.pair_losses}</td>
                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: 500, color: C.textPrimary }}>{s.pair_difference > 0 ? '+' : ''}{s.pair_difference}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {/* Legend */}
      <div style={{ background: C.surface, borderRadius: 12, padding: 16, border: `1px solid ${C.border}`, marginTop: 16 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, margin: '0 0 8px' }}>Sistem Perhitungan Klasemen</h3>
        <p style={{ fontSize: 12, color: C.textSecondary, margin: 0, lineHeight: 1.6 }}>
          Klasemen dihitung berdasarkan <strong>total poin dari semua partai pasangan</strong> dalam pertandingan beregu yang telah disahkan. Setiap partai memberikan poin sesuai jumlah game yang diperoleh.
        </p>
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
            const aPoints = results.reduce((sum, r) => sum + r.score_team_a, 0);
            const bPoints = results.reduce((sum, r) => sum + r.score_team_b, 0);
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
                      <span style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, fontFamily: 'Montserrat, sans-serif' }}>{aPoints}</span>
                      <span style={{ fontSize: 14, color: C.textSecondary, margin: '0 4px' }}>-</span>
                      <span style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, fontFamily: 'Montserrat, sans-serif' }}>{bPoints}</span>
                      <p style={{ fontSize: 10, color: C.textSecondary, margin: '2px 0 0' }}>Total Poin</p>
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
                  {team.logo_url ? (
                    <img src={team.logo_url} alt={team.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16 }}>
                      {team.name.charAt(0)}
                    </div>
                  )}
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
                      { v: standing.total_points, l: 'Poin', c: C.primaryDark },
                      { v: standing.pair_wins, l: 'Menang', c: C.success },
                      { v: standing.pair_losses, l: 'Kalah', c: C.error },
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
  const maxPoints = Math.max(...standings.map(s => s.total_points), 1);
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
          { label: 'Total Partai', value: pairResults.length, color: C.highlight },
        ].map((s, i) => (
          <div key={i} style={{ background: C.surface, borderRadius: 12, padding: 16, border: `1px solid ${C.border}` }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: s.color, margin: 0, fontFamily: 'Montserrat, sans-serif' }}>{s.value}</p>
            <p style={{ fontSize: 11, color: C.textSecondary, margin: '4px 0 0' }}>{s.label}</p>
          </div>
        ))}
      </div>
      {/* Chart */}
      <div style={{ background: C.surface, borderRadius: 12, padding: 20, border: `1px solid ${C.border}`, marginBottom: 16 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, margin: '0 0 12px', fontFamily: 'Montserrat, sans-serif' }}>Total Poin Klasemen Tim</h3>
        {standings.slice(0, 5).map((s: Standing, idx: number) => {
          const pct = (s.total_points / maxPoints) * 100;
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
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>{s.total_points}</span>
                </div>
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
  const aPoints = results.reduce((sum, r) => sum + r.score_team_a, 0);
  const bPoints = results.reduce((sum, r) => sum + r.score_team_b, 0);

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
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 28, fontWeight: 700, color: C.textPrimary, fontFamily: 'Montserrat, sans-serif' }}>{aPoints}</span>
                    <span style={{ fontSize: 16, color: C.textSecondary }}>-</span>
                    <span style={{ fontSize: 28, fontWeight: 700, color: C.textPrimary, fontFamily: 'Montserrat, sans-serif' }}>{bPoints}</span>
                  </div>
                  <p style={{ fontSize: 10, color: C.textSecondary, margin: '4px 0 0' }}>Total Poin</p>
                </>
              ) : (
                <span style={{ fontSize: 20, fontWeight: 700, color: C.textSecondary }}>VS</span>
              )}
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
      <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ background: `linear-gradient(to right, ${C.primaryDark}, ${C.primary})`, padding: 20, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {team.logo_url ? (
              <img src={team.logo_url} alt={team.name} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22 }}>
                {team.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px', fontFamily: 'Montserrat, sans-serif' }}>{team.name}</h1>
              <p style={{ fontSize: 12, opacity: 0.8, margin: 0 }}>Kapten: {team.captain}</p>
              <p style={{ fontSize: 11, opacity: 0.6, margin: '2px 0 0' }}>{team.description}</p>
            </div>
          </div>
        </div>
        {standing && (
          <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {[
              { l: 'Posisi', v: `#${position}`, c: C.primaryDark },
              { l: 'Total Poin', v: standing.total_points, c: C.primary },
              { l: 'Main', v: standing.played, c: C.textPrimary },
              { l: 'Pasangan Menang', v: standing.pair_wins, c: C.success },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', background: C.bg, borderRadius: 8, padding: '8px 0' }}>
                <p style={{ fontSize: 10, color: C.textSecondary, margin: '0 0 2px' }}>{s.l}</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: s.c, margin: 0, fontFamily: 'Montserrat, sans-serif' }}>{s.v}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      {pairs.length > 0 && (
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
      )}
    </div>
  );
};

// ============ ADMIN VIEW ============
const AdminView: React.FC<{ onExit: () => void; onRefresh: () => void }> = ({ onExit, onRefresh }) => {
  const [loggedIn, setLoggedIn] = useState(store.isAdminLoggedIn());
  const [currentUser, setCurrentUser] = useState<User | null>(store.getCurrentUser());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<{ type: string; msg: string } | null>(null);
  const [page, setPage] = useState('dashboard');

  const notify = (type: string, msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 3000);
    onRefresh();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = store.loginUser(email, password);
    if (user) {
      setLoggedIn(true);
      setCurrentUser(user);
      setError('');
    } else {
      setError('Email atau password salah');
    }
  };

  const handleLogout = () => {
    store.logoutUser();
    setLoggedIn(false);
    setCurrentUser(null);
    onExit();
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
          <form onSubmit={handleLogin} style={{ background: C.surface, borderRadius: 12, padding: 20, border: `1px solid ${C.border}` }}>
            {error && <div style={{ padding: '8px 12px', background: `${C.error}15`, borderRadius: 8, marginBottom: 12, fontSize: 12, color: C.error }}>{error}</div>}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: C.textPrimary, marginBottom: 4 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: 'none' }} placeholder="admin@soqcomm.com" required />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: C.textPrimary, marginBottom: 4 }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: 'none' }} placeholder="••••••••" required />
            </div>
            <button type="submit" style={{ width: '100%', padding: '10px', background: C.primary, color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: 13, border: 'none', cursor: 'pointer' }}>Login</button>
            <button type="button" onClick={onExit} style={{ width: '100%', padding: '10px', background: 'transparent', color: C.textSecondary, fontSize: 12, border: 'none', cursor: 'pointer', marginTop: 8 }}>← Kembali ke halaman utama</button>
          </form>
          <p style={{ textAlign: 'center', fontSize: 11, color: C.textSecondary, marginTop: 12 }}>Default: admin@soqcomm.com / padel2025</p>
        </div>
      </div>
    );
  }

  const teams = store.getTeams();
  const players = store.getPlayers();
  const matches = store.getMatches();
  const standings = store.getStandings();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'scores', label: 'Input Skor' },
    { id: 'settings', label: 'Pengaturan' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      {notification && (
        <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 100, padding: '10px 16px', borderRadius: 8, background: notification.type === 'success' ? C.success : C.error, color: '#fff', fontSize: 13, fontWeight: 500, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          {notification.msg}
        </div>
      )}
      <header style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Logo size="sm" />
          <span style={{ fontSize: 10, padding: '2px 8px', background: `${C.primary}15`, color: C.primaryDark, borderRadius: 10, fontWeight: 600 }}>Admin</span>
          {currentUser && <span style={{ fontSize: 11, color: C.textSecondary }}>• {currentUser.name} ({currentUser.role})</span>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onExit} style={{ padding: '6px 12px', fontSize: 12, color: C.textSecondary, background: 'none', border: 'none', cursor: 'pointer' }}>Lihat Situs</button>
          <button onClick={handleLogout} style={{ padding: '6px 12px', fontSize: 12, color: C.error, background: `${C.error}10`, borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 500 }}>Logout</button>
        </div>
      </header>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 16 }}>
        <nav style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 4, marginBottom: 16 }}>
          {menuItems.map(item => (
            <button key={item.id} onClick={() => setPage(item.id)} style={{
              padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              background: page === item.id ? C.primary : C.surface, color: page === item.id ? '#fff' : C.textSecondary,
            }}>{item.label}</button>
          ))}
        </nav>
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
          {page === 'scores' && <AdminScores notify={notify} />}
          {page === 'settings' && <AdminSettings notify={notify} onRefresh={onRefresh} />}
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
      store.saveMatchResult(match.id, results);
      notify('success', 'Hasil disahkan!');
    } else {
      const all = store.getPairResults().filter(r => r.match_id !== match.id);
      store.savePairResults([...all, ...results.map(r => ({ ...r, id: uuidv4() }))]);
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

export default App;
