import React, { useState, useEffect } from 'react';
import { store } from './store';

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
const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg'; logoUrl?: string }> = ({ size = 'md', logoUrl }) => {
  const s = size === 'lg' ? 56 : size === 'md' ? 36 : 28;
  const fs = size === 'lg' ? 20 : size === 'md' ? 13 : 10;
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: s, height: s }}>
        {logoUrl ? (
          <img src={logoUrl} alt="Logo" style={{ width: s, height: s, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{
            width: s, height: s, borderRadius: '50%',
            background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: fs }}>S</span>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontWeight: 700, color: C.textPrimary, fontSize: fs, lineHeight: 1.2 }}>SOQ.COMM</span>
        <span style={{ fontWeight: 600, color: C.primary, fontSize: fs * 0.75, lineHeight: 1.2 }}>PADEL LEAGUE</span>
      </div>
    </div>
  );
};

// Main App Component
export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [showAdmin, setShowAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setRefresh] = useState(0);

  const refresh = () => setRefresh(r => r + 1);

  // Initialize store
  useEffect(() => {
    const initStore = async () => {
      try {
        await store.init();
        setLoading(false);
      } catch (err: any) {
        console.error('Error initializing store:', err);
        setError(err.message || 'Gagal memuat data');
        setLoading(false);
      }
    };
    
    initStore();
  }, []);

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: C.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}>
        <div style={{
          background: C.surface,
          borderRadius: 12,
          padding: 24,
          maxWidth: 400,
          textAlign: 'center',
          border: `1px solid ${C.border}`,
        }}>
          <h1 style={{ color: C.error, fontSize: 20, marginBottom: 12 }}>Error</h1>
          <p style={{ color: C.textSecondary, fontSize: 14, marginBottom: 16 }}>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              background: C.primary,
              color: '#fff',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: C.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
      }}>
        <Logo size="lg" />
        <p style={{ color: C.textSecondary, fontSize: 14 }}>Memuat data dari cloud...</p>
      </div>
    );
  }

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  if (showAdmin) {
    return <AdminView onExit={() => setShowAdmin(false)} onRefresh={refresh} />;
  }

  const league = store.getLeague();
  const teams = store.getTeams();
  const players = store.getPlayers();
  const matches = store.getMatches();
  const standings = store.getStandings();
  const matchdays = store.getMatchdays();
  const mvps = store.getMVPs();

  const navItems = [
    { page: 'home', label: 'Beranda' },
    { page: 'standings', label: 'Klasemen' },
    { page: 'schedule', label: 'Jadwal' },
    { page: 'results', label: 'Hasil' },
    { page: 'teams', label: 'Tim' },
    { page: 'players', label: 'Pemain' },
    { page: 'mvp', label: 'MVP' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      {/* Header */}
      <header style={{
        background: C.surface,
        borderBottom: `1px solid ${C.border}`,
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => handleNavigate('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <Logo size="sm" logoUrl={league.logo_url} />
          </button>
          <nav style={{ display: 'flex', gap: 4, overflowX: 'auto' }}>
            {navItems.map(item => (
              <button
                key={item.page}
                onClick={() => handleNavigate(item.page)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                  background: currentPage === item.page ? C.primary : 'transparent',
                  color: currentPage === item.page ? '#fff' : C.textPrimary,
                  whiteSpace: 'nowrap',
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <button
            onClick={() => setShowAdmin(true)}
            style={{
              padding: '8px 16px',
              background: C.primaryDark,
              color: '#fff',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Admin
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 16px' }}>
        {currentPage === 'home' && <HomeView teams={teams} matches={matches} standings={standings} league={league} mvps={store.getMVPs()} players={players} onNavigate={handleNavigate} />}
        {currentPage === 'standings' && <StandingsView teams={teams} standings={standings} league={league} />}
        {currentPage === 'schedule' && <ScheduleView teams={teams} matches={matches} matchdays={matchdays} />}
        {currentPage === 'results' && <ResultsView teams={teams} matches={matches} matchdays={matchdays} pairResults={store.getPairResults()} />}
        {currentPage === 'teams' && <TeamsView teams={teams} standings={standings} />}
        {currentPage === 'players' && <PlayersView teams={teams} players={players} />}
        {currentPage === 'mvp' && <MVPView teams={teams} players={players} matchdays={matchdays} mvps={mvps} />}
      </main>

      {/* Footer */}
      <footer style={{ background: C.primaryDark, color: '#fff', padding: '24px 16px', marginTop: 40 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontWeight: 700, fontSize: 14, margin: '0 0 4px' }}>SOQ.COMM PADEL LEAGUE</p>
          <p style={{ fontSize: 11, opacity: 0.7, margin: 0 }}>© 2025 Papua Barat Daya, Indonesia</p>
        </div>
      </footer>
    </div>
  );
}

// Home View
const HomeView: React.FC<{ teams: any[]; matches: any[]; standings: any[]; league: any; mvps: any[]; players: any[]; onNavigate: (page: string) => void }> = ({ teams, matches, standings, league, mvps, players, onNavigate }) => {
  const completedMatches = matches.filter(m => m.status === 'completed');
  const upcomingMatches = matches.filter(m => m.status === 'upcoming');
  const latestMvp = mvps.length > 0 ? mvps[0] : null;
  const mvpPlayer = latestMvp ? players.find((p: any) => p.id === latestMvp.player_id) : null;
  const mvpTeam = mvpPlayer ? teams.find((t: any) => t.id === mvpPlayer.team_id) : null;

  return (
    <div>
      <section style={{
        background: `linear-gradient(135deg, ${C.bg}, #fff)`,
        borderRadius: 16,
        padding: '40px 24px',
        marginBottom: 24,
        textAlign: 'center',
      }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: C.textPrimary, margin: '0 0 8px' }}>
          SOQ.COMM <span style={{ color: C.primary }}>PADEL LEAGUE</span>
        </h1>
        <p style={{ color: C.textSecondary, fontSize: 14, margin: '0 0 24px' }}>
          {league.description}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => onNavigate('standings')} style={{
            padding: '12px 24px',
            background: C.primary,
            color: '#fff',
            borderRadius: 12,
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
          }}>
            Lihat Klasemen
          </button>
          <button onClick={() => onNavigate('schedule')} style={{
            padding: '12px 24px',
            background: '#fff',
            color: C.primary,
            borderRadius: 12,
            fontWeight: 600,
            border: `2px solid ${C.primary}`,
            cursor: 'pointer',
          }}>
            Jadwal Pertandingan
          </button>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Tim', value: teams.length, color: C.primary },
          { label: 'Pertandingan', value: matches.length, color: C.secondary },
          { label: 'Selesai', value: completedMatches.length, color: C.success },
          { label: 'Mendatang', value: upcomingMatches.length, color: C.warning },
        ].map((stat, i) => (
          <div key={i} style={{ background: C.surface, borderRadius: 12, padding: 16, border: `1px solid ${C.border}` }}>
            <p style={{ fontSize: 24, fontWeight: 700, color: stat.color, margin: 0 }}>{stat.value}</p>
            <p style={{ fontSize: 11, color: C.textSecondary, margin: '4px 0 0' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {standings.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary, margin: '0 0 12px' }}>Klasemen Sementara</h2>
          <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.primaryDark, color: '#fff' }}>
                  <th style={{ padding: 10, textAlign: 'left' }}>Pos</th>
                  <th style={{ padding: 10, textAlign: 'left' }}>Tim</th>
                  <th style={{ padding: 10, textAlign: 'center' }}>Main</th>
                  <th style={{ padding: 10, textAlign: 'center' }}>Poin</th>
                </tr>
              </thead>
              <tbody>
                {standings.slice(0, 5).map((s: any, idx: number) => {
                  const team = teams.find(t => t.id === s.team_id);
                  return (
                    <tr key={s.team_id} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: 10 }}>{idx + 1}</td>
                      <td style={{ padding: 10, fontWeight: 500 }}>{team?.name}</td>
                      <td style={{ padding: 10, textAlign: 'center' }}>{s.played}</td>
                      <td style={{ padding: 10, textAlign: 'center', fontWeight: 700 }}>{s.total_points}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Player MVP Section */}
      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary, margin: '0 0 12px' }}>🏆 PLAYER MVP</h2>
        {latestMvp && mvpPlayer ? (
          <div style={{
            background: `linear-gradient(135deg, ${C.accent}10, ${C.success}10)`,
            borderRadius: 16,
            padding: 24,
            border: `2px solid ${C.accent}`,
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            flexWrap: 'wrap',
          }}>
            {mvpPlayer.photo_url ? (
              <img 
                src={mvpPlayer.photo_url} 
                alt={mvpPlayer.name} 
                style={{ 
                  width: 120, 
                  height: 120, 
                  borderRadius: '50%', 
                  objectFit: 'cover',
                  border: `4px solid ${C.accent}`,
                  boxShadow: '0 4px 12px rgba(168, 216, 46, 0.3)',
                }} 
              />
            ) : (
              <div style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: 48,
                border: `4px solid ${C.accent}`,
                boxShadow: '0 4px 12px rgba(168, 216, 46, 0.3)',
              }}>
                {mvpPlayer.name.charAt(0)}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{
                display: 'inline-block',
                padding: '4px 12px',
                background: C.accent,
                color: '#fff',
                borderRadius: 12,
                fontSize: 11,
                fontWeight: 700,
                marginBottom: 8,
              }}>
                🏆 MOST VALUABLE PLAYER
              </div>
              <h3 style={{ fontSize: 24, fontWeight: 700, color: C.textPrimary, margin: '0 0 8px' }}>
                {mvpPlayer.name}
              </h3>
              {mvpTeam && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  {mvpTeam.logo_url ? (
                    <img 
                      src={mvpTeam.logo_url} 
                      alt={mvpTeam.name} 
                      style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <div style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 10,
                    }}>
                      {mvpTeam.name.charAt(0)}
                    </div>
                  )}
                  <span style={{ fontSize: 14, color: C.textSecondary, fontWeight: 500 }}>
                    {mvpTeam.name}
                  </span>
                </div>
              )}
              {latestMvp.reason && (
                <p style={{ fontSize: 13, color: C.textSecondary, margin: '8px 0 0', fontStyle: 'italic' }}>
                  "{latestMvp.reason}"
                </p>
              )}
            </div>
          </div>
        ) : (
          <div style={{
            background: C.surface,
            borderRadius: 12,
            padding: 40,
            border: `1px solid ${C.border}`,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
            <p style={{ color: C.textSecondary, fontSize: 14, margin: 0 }}>
              Player MVP akan diumumkan setelah pertandingan berlangsung.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

// Standings View
// Generate klasemen image for download
const generateStandingsImage = (standings: any[], teams: any[], league: any): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const width = 1200;
  const rowHeight = 60;
  const headerHeight = 180;
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

  // Logo
  if (league.logo_url) {
    const logoImg = new Image();
    logoImg.src = league.logo_url;
    try {
      ctx.save();
      ctx.beginPath();
      ctx.arc(80, 90, 40, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(logoImg, 40, 50, 80, 80);
      ctx.restore();
    } catch (e) {
      ctx.beginPath();
      ctx.arc(80, 90, 40, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('S', 80, 90);
    }
  } else {
    ctx.beginPath();
    ctx.arc(80, 90, 40, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', 80, 90);
  }

  // Title
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('KLASEMEN LIGA PADEL', 140, 80);
  ctx.font = '16px Arial';
  ctx.fillText(`${league.name} • Season ${league.season}`, 140, 105);
  ctx.font = '14px Arial';
  ctx.fillText(`Diperbarui: ${new Date().toLocaleDateString('id-ID')}`, 140, 130);

  // Table header
  const tableTop = headerHeight + 20;
  ctx.fillStyle = '#087E91';
  ctx.fillRect(40, tableTop, width - 80, 40);
  
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const cols = ['Pos', 'Tim', 'Main', 'Total Poin', 'Menang', 'Kalah', 'Selisih'];
  const colWidths = [60, 300, 80, 120, 100, 100, 100];
  let x = 40;
  cols.forEach((col, i) => {
    ctx.fillText(col, x + colWidths[i] / 2, tableTop + 20);
    x += colWidths[i];
  });

  // Table rows
  standings.forEach((s, idx) => {
    const team = teams.find(t => t.id === s.team_id);
    const y = tableTop + 40 + (idx * rowHeight);
    
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
    ctx.arc(70, y + rowHeight / 2, 16, 0, Math.PI * 2);
    ctx.fillStyle = idx === 0 ? '#A8D82E' : idx === 1 ? '#16B9C0' : idx === 2 ? '#1599B8' : '#DCECEF';
    ctx.fill();
    ctx.fillStyle = idx < 3 ? '#fff' : '#718792';
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(idx + 1), 70, y + rowHeight / 2);

    // Team logo or placeholder
    if (team?.logo_url) {
      const teamImg = new Image();
      teamImg.src = team.logo_url;
      try {
        ctx.save();
        ctx.beginPath();
        ctx.arc(130, y + rowHeight / 2, 18, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(teamImg, 112, y + rowHeight / 2 - 18, 36, 36);
        ctx.restore();
      } catch (e) {
        ctx.beginPath();
        ctx.arc(130, y + rowHeight / 2, 18, 0, Math.PI * 2);
        ctx.fillStyle = '#16B9C0';
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(team?.name.charAt(0) || '?', 130, y + rowHeight / 2);
      }
    } else {
      ctx.beginPath();
      ctx.arc(130, y + rowHeight / 2, 18, 0, Math.PI * 2);
      ctx.fillStyle = '#16B9C0';
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(team?.name.charAt(0) || '?', 130, y + rowHeight / 2);
    }

    // Team name
    ctx.fillStyle = '#173D4A';
    ctx.font = '500 13px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(team?.name || 'Unknown', 160, y + rowHeight / 2);

    // Stats
    ctx.textAlign = 'center';
    ctx.font = '13px Arial';
    ctx.fillStyle = '#173D4A';
    x = 40 + colWidths[0] + colWidths[1];
    ctx.fillText(String(s.played), x + colWidths[2] / 2, y + rowHeight / 2);
    x += colWidths[2];
    ctx.font = 'bold 13px Arial';
    ctx.fillStyle = '#087E91';
    ctx.fillText(String(s.total_points), x + colWidths[3] / 2, y + rowHeight / 2);
    x += colWidths[3];
    ctx.font = '13px Arial';
    ctx.fillStyle = '#2EAD72';
    ctx.fillText(String(s.pair_wins), x + colWidths[4] / 2, y + rowHeight / 2);
    x += colWidths[4];
    ctx.fillStyle = '#E65C5C';
    ctx.fillText(String(s.pair_losses), x + colWidths[5] / 2, y + rowHeight / 2);
    x += colWidths[5];
    ctx.fillStyle = '#173D4A';
    ctx.fillText(`${s.pair_difference > 0 ? '+' : ''}${s.pair_difference}`, x + colWidths[6] / 2, y + rowHeight / 2);
  });

  // Footer
  const footerY = tableTop + 40 + (standings.length * rowHeight) + 30;
  ctx.fillStyle = '#718792';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('Klasemen dihitung berdasarkan akumulasi total poin dari seluruh partai pasangan dalam pertandingan yang telah disahkan.', width / 2, footerY);
  ctx.fillText('© 2025 SOQ.COMM PADEL LEAGUE - Papua Barat Daya, Indonesia', width / 2, footerY + 20);

  return canvas.toDataURL('image/png');
};

const StandingsView: React.FC<{ teams: any[]; standings: any[]; league: any }> = ({ teams, standings, league }) => {
  const handleDownload = () => {
    const imageData = generateStandingsImage(standings, teams, league);
    const link = document.createElement('a');
    link.download = `SOQ-COMM-PADEL-LEAGUE-KLASEMEN-${league.season}.png`;
    link.href = imageData;
    link.click();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary, margin: 0 }}>Klasemen Liga</h1>
        <button
          onClick={handleDownload}
          style={{
            padding: '10px 20px',
            background: C.primary,
            color: '#fff',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          ⬇ Download Klasemen PNG
        </button>
      </div>
      <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'auto' }}>
        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', minWidth: 700 }}>
          <thead>
            <tr style={{ background: C.primaryDark, color: '#fff' }}>
              <th style={{ padding: 10, textAlign: 'left' }}>Pos</th>
              <th style={{ padding: 10, textAlign: 'left' }}>Tim</th>
              <th style={{ padding: 10, textAlign: 'center' }}>Main</th>
              <th style={{ padding: 10, textAlign: 'center' }}>Total Poin</th>
              <th style={{ padding: 10, textAlign: 'center' }}>Menang</th>
              <th style={{ padding: 10, textAlign: 'center' }}>Kalah</th>
              <th style={{ padding: 10, textAlign: 'center' }}>Selisih</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s: any, idx: number) => {
              const team = teams.find(t => t.id === s.team_id);
              return (
                <tr key={s.team_id} style={{ borderBottom: `1px solid ${C.border}`, background: idx === 0 ? `${C.accent}15` : 'transparent' }}>
                  <td style={{ padding: 10 }}>
                    <span style={{
                      width: 28, height: 28, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700,
                      background: idx === 0 ? C.accent : idx === 1 ? C.primary : idx === 2 ? C.secondary : C.border,
                      color: idx < 3 ? '#fff' : C.textSecondary,
                    }}>{idx + 1}</span>
                  </td>
                  <td style={{ padding: 10, fontWeight: 500 }}>{team?.name}</td>
                  <td style={{ padding: 10, textAlign: 'center' }}>{s.played}</td>
                  <td style={{ padding: 10, textAlign: 'center', fontWeight: 700, color: C.primaryDark }}>{s.total_points}</td>
                  <td style={{ padding: 10, textAlign: 'center', color: C.success }}>{s.pair_wins}</td>
                  <td style={{ padding: 10, textAlign: 'center', color: C.error }}>{s.pair_losses}</td>
                  <td style={{ padding: 10, textAlign: 'center' }}>{s.pair_difference > 0 ? '+' : ''}{s.pair_difference}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Schedule View
const ScheduleView: React.FC<{ teams: any[]; matches: any[]; matchdays: any[] }> = ({ teams, matches, matchdays }) => {
  const getTeam = (id: string) => teams.find(t => t.id === id);

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary, margin: '0 0 16px' }}>Jadwal Pertandingan</h1>
      {matchdays.map((md: any) => {
        const mdMatches = matches.filter(m => m.matchday_id === md.id);
        if (mdMatches.length === 0) return null;
        return (
          <div key={md.id} style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, margin: '0 0 10px' }}>
              {md.name} - {md.date}
            </h3>
            <div style={{ display: 'grid', gap: 10 }}>
              {mdMatches.map((match: any) => (
                <div key={match.id} style={{ background: C.surface, borderRadius: 10, padding: 12, border: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, margin: 0 }}>{getTeam(match.team_a_id)?.name}</p>
                      <p style={{ fontSize: 11, color: C.textSecondary, margin: '2px 0' }}>vs</p>
                      <p style={{ fontWeight: 600, margin: 0 }}>{getTeam(match.team_b_id)?.name}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 12, color: C.textSecondary, margin: 0 }}>Court {match.court}</p>
                      <p style={{ fontSize: 12, color: C.textSecondary, margin: '2px 0' }}>{match.start_time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Results View
const ResultsView: React.FC<{ teams: any[]; matches: any[]; matchdays: any[]; pairResults: any[] }> = ({ teams, matches, matchdays, pairResults }) => {
  const getTeam = (id: string) => teams.find(t => t.id === id);
  const getMatchday = (id: string) => matchdays.find(md => md.id === id);
  const completedMatches = matches.filter(m => m.status === 'completed').reverse();

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary, margin: '0 0 16px' }}>Hasil Pertandingan</h1>
      {completedMatches.length === 0 ? (
        <p style={{ color: C.textSecondary, textAlign: 'center', padding: 40 }}>Belum ada hasil pertandingan.</p>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {completedMatches.map((match: any) => {
            const results = pairResults.filter(r => r.match_id === match.id);
            const aPoints = results.reduce((sum: number, r: any) => sum + r.score_team_a, 0);
            const bPoints = results.reduce((sum: number, r: any) => sum + r.score_team_b, 0);
            return (
              <div key={match.id} style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 16 }}>
                <p style={{ fontSize: 11, color: C.textSecondary, margin: '0 0 8px' }}>
                  {getMatchday(match.matchday_id)?.name} • {getMatchday(match.matchday_id)?.date}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, margin: 0, color: match.winner_team_id === match.team_a_id ? C.primary : C.textPrimary }}>
                      {getTeam(match.team_a_id)?.name}
                    </p>
                  </div>
                  <div style={{ padding: '0 16px', textAlign: 'center' }}>
                    <span style={{ fontSize: 22, fontWeight: 700 }}>{aPoints}</span>
                    <span style={{ fontSize: 14, color: C.textSecondary, margin: '0 4px' }}>-</span>
                    <span style={{ fontSize: 22, fontWeight: 700 }}>{bPoints}</span>
                  </div>
                  <div style={{ flex: 1, textAlign: 'right' }}>
                    <p style={{ fontWeight: 600, margin: 0, color: match.winner_team_id === match.team_b_id ? C.primary : C.textPrimary }}>
                      {getTeam(match.team_b_id)?.name}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Teams View
const TeamsView: React.FC<{ teams: any[]; standings: any[] }> = ({ teams, standings }) => {
  const activeTeams = teams.filter(t => t.is_active);
  const getPosition = (teamId: string) => standings.findIndex(s => s.team_id === teamId) + 1;

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary, margin: '0 0 16px' }}>Tim Peserta</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
        {activeTeams.map((team: any) => {
          const pos = getPosition(team.id);
          return (
            <div key={team.id} style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 16,
                }}>
                  {team.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, margin: 0 }}>{team.name}</p>
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
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Players View
const PlayersView: React.FC<{ teams: any[]; players: any[] }> = ({ teams, players }) => {
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const activePlayers = players.filter(p => p.is_active);
  const filteredPlayers = activePlayers.filter(p => {
    const matchTeam = selectedTeam === 'all' || p.team_id === selectedTeam;
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchTeam && matchSearch;
  });

  const getTeam = (teamId: string) => teams.find(t => t.id === teamId);

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary, margin: '0 0 16px' }}>Daftar Pemain</h1>
      
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Cari pemain..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: '10px 16px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }}
        />
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          style={{ padding: '10px 16px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: C.surface }}
        >
          <option value="all">Semua Tim</option>
          {teams.filter(t => t.is_active).map(team => (
            <option key={team.id} value={team.id}>{team.name}</option>
          ))}
        </select>
      </div>

      {filteredPlayers.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {filteredPlayers.map((player: any) => {
            const team = getTeam(player.team_id);
            return (
              <div key={player.id} style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                <div style={{ height: 200, background: `linear-gradient(135deg, ${C.primary}20, ${C.primaryDark}20)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {player.photo_url ? (
                    <img src={player.photo_url} alt={player.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 32 }}>
                      {player.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div style={{ padding: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary, margin: '0 0 8px' }}>{player.name}</h3>
                  {team && (
                    <p style={{ fontSize: 13, color: C.textSecondary, margin: '0 0 8px' }}>{team.name}</p>
                  )}
                  <span style={{ display: 'inline-block', padding: '4px 12px', background: player.is_active ? `${C.success}15` : `${C.error}15`, color: player.is_active ? C.success : C.error, borderRadius: 12, fontSize: 11, fontWeight: 600 }}>
                    {player.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: 60, background: C.surface, borderRadius: 12, border: `1px solid ${C.border}` }}>
          <p style={{ color: C.textSecondary }}>Tidak ada pemain yang sesuai dengan filter</p>
        </div>
      )}
    </div>
  );
};

// MVP View
const MVPView: React.FC<{ teams: any[]; players: any[]; matchdays: any[]; mvps: any[] }> = ({ teams, players, matchdays, mvps }) => {
  const getPlayer = (playerId: string) => players.find(p => p.id === playerId);
  const getTeam = (teamId: string) => teams.find(t => t.id === teamId);
  const getMatchday = (matchdayId: string) => matchdays.find(md => md.id === matchdayId);

  const mvpsByMatchday = matchdays
    .filter(md => md.status === 'completed')
    .map(md => {
      const mvp = mvps.find(m => m.matchday_id === md.id);
      return { matchday: md, mvp };
    })
    .filter(item => item.mvp);

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary, margin: '0 0 16px' }}>🏆 Player MVP</h1>
      <p style={{ fontSize: 13, color: C.textSecondary, margin: '0 0 24px' }}>Pemain terbaik setiap matchday</p>

      {mvpsByMatchday.length > 0 ? (
        <div style={{ display: 'grid', gap: 16 }}>
          {mvpsByMatchday.map(({ matchday, mvp }) => {
            if (!mvp) return null;
            const player = getPlayer(mvp.player_id);
            const team = player ? getTeam(player.team_id) : null;

            return (
              <div key={mvp.id} style={{ background: C.surface, borderRadius: 12, border: `2px solid ${C.accent}`, overflow: 'hidden' }}>
                <div style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.success})`, padding: '12px 16px' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>🏆 MVP Matchday {matchday.matchday_number}</h3>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', margin: '4px 0 0' }}>{matchday.date}</p>
                </div>
                <div style={{ padding: 20, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', border: `4px solid ${C.accent}`, flexShrink: 0 }}>
                    {player?.photo_url ? (
                      <img src={player.photo_url} alt={player?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 48 }}>
                        {player?.name.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <h2 style={{ fontSize: 24, fontWeight: 700, color: C.textPrimary, margin: '0 0 8px' }}>{player?.name || 'Unknown Player'}</h2>
                    {team && <p style={{ fontSize: 14, color: C.textSecondary, margin: '0 0 12px' }}>{team.name}</p>}
                    {mvp.reason && (
                      <div style={{ padding: 12, background: `${C.accent}10`, borderRadius: 8, border: `1px solid ${C.accent}30` }}>
                        <p style={{ fontSize: 12, color: C.textPrimary, margin: 0, fontStyle: 'italic' }}>"{mvp.reason}"</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: 60, background: C.surface, borderRadius: 12, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏆</div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary, margin: '0 0 8px' }}>Belum Ada MVP</h3>
          <p style={{ color: C.textSecondary, fontSize: 13 }}>Player MVP akan ditampilkan setelah admin memilih pemain terbaik</p>
        </div>
      )}
    </div>
  );
};

// Admin View
const AdminView: React.FC<{ onExit: () => void; onRefresh: () => void }> = ({ onExit, onRefresh }) => {
  const [loggedIn, setLoggedIn] = useState(store.isAdminLoggedIn());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await store.loginUser(email, password);
      if (user) {
        setLoggedIn(true);
        setError('');
      } else {
        setError('Email atau password salah');
      }
    } catch (err: any) {
      setError(err.message || 'Login gagal');
    }
  };

  if (!loggedIn) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Logo size="lg" />
            <h1 style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary, margin: '16px 0 4px' }}>Admin Login</h1>
          </div>
          <form onSubmit={handleLogin} style={{ background: C.surface, borderRadius: 12, padding: 20, border: `1px solid ${C.border}` }}>
            {error && <div style={{ padding: '8px 12px', background: `${C.error}15`, borderRadius: 8, marginBottom: 12, fontSize: 12, color: C.error }}>{error}</div>}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 4 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }} required />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 4 }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }} required />
            </div>
            <button type="submit" style={{ width: '100%', padding: '10px', background: C.primary, color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: 13, border: 'none', cursor: 'pointer' }}>Login</button>
            <button type="button" onClick={onExit} style={{ width: '100%', padding: '10px', background: 'transparent', color: C.textSecondary, fontSize: 12, border: 'none', cursor: 'pointer', marginTop: 8 }}>← Kembali</button>
          </form>
          <p style={{ textAlign: 'center', fontSize: 11, color: C.textSecondary, marginTop: 12 }}>Default: admin@soqcomm.com / padel2025</p>
        </div>
      </div>
    );
  }

  return <AdminPanelLazy onExit={onExit} onRefresh={onRefresh} />;
};

// Lazy load AdminPanel
const AdminPanelLazy = React.lazy(() => import('./components/AdminPanel'));
