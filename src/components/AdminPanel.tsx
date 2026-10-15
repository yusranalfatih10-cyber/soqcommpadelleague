import React, { useState, useEffect } from 'react';
import { store } from '../store';
import { Team, Player, User, Match, Matchday, MVP } from '../types';

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

interface AdminPanelProps {
  onExit: () => void;
  onRefresh: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onExit, onRefresh }) => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notification, setNotification] = useState<{ type: string; msg: string } | null>(null);
  const currentUser = store.getCurrentUser();

  const notify = (type: string, msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 3000);
    onRefresh();
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', roles: ['super_admin', 'admin', 'operator'] },
    { id: 'input-score', label: 'Input Skor', icon: '⚽', roles: ['super_admin', 'admin', 'operator'] },
    { id: 'score-management', label: 'Manajemen Skor', icon: '📝', roles: ['super_admin', 'admin'] },
    { id: 'teams', label: 'Manajemen Tim', icon: '👥', roles: ['super_admin', 'admin'] },
    { id: 'players', label: 'Manajemen Pemain', icon: '🏃', roles: ['super_admin', 'admin'] },
    { id: 'mvp-matchday', label: 'MVP Matchday', icon: '🏆', roles: ['super_admin', 'admin'] },
    { id: 'mvp-liga', label: 'MVP Liga', icon: '🏅', roles: ['super_admin', 'admin'] },
    { id: 'users', label: 'Manajemen User', icon: '👤', roles: ['super_admin'] },
    { id: 'schedule', label: 'Manajemen Jadwal', icon: '📅', roles: ['super_admin', 'admin'] },
    { id: 'generate-schedule', label: 'Generate Jadwal', icon: '🔄', roles: ['super_admin', 'admin'] },
    { id: 'standings-settings', label: 'Pengaturan Klasemen', icon: '🏆', roles: ['super_admin'] },
    { id: 'reset', label: 'Reset Liga', icon: '⚠️', roles: ['super_admin'] },
    { id: 'general', label: 'Pengaturan Umum', icon: '⚙️', roles: ['super_admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    currentUser && item.roles.includes(currentUser.role)
  );

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      {notification && (
        <div style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 1000,
          padding: '12px 20px',
          borderRadius: 8,
          background: notification.type === 'success' ? C.success : C.error,
          color: '#fff',
          fontSize: 13,
          fontWeight: 500,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          animation: 'slideIn 0.3s ease-out',
        }}>
          {notification.msg}
        </div>
      )}

      {/* Header */}
      <header style={{
        background: C.surface,
        borderBottom: `1px solid ${C.border}`,
        padding: '12px 16px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{
                padding: '8px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 20,
                color: C.textPrimary,
              }}
            >
              ☰
            </button>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary, margin: 0, fontFamily: 'Montserrat, sans-serif' }}>
                Admin Panel
              </h1>
              <p style={{ fontSize: 11, color: C.textSecondary, margin: 0 }}>
                {currentUser?.name} • {currentUser?.role.replace('_', ' ').toUpperCase()}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={onExit}
              style={{
                padding: '8px 16px',
                background: C.bg,
                color: C.textPrimary,
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                border: `1px solid ${C.border}`,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Lihat Situs
            </button>
            <button
              onClick={() => { store.logoutUser(); onExit(); }}
              style={{
                padding: '8px 16px',
                background: `${C.error}15`,
                color: C.error,
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', maxWidth: 1400, margin: '0 auto' }}>
        {/* Sidebar */}
        <aside style={{
          width: sidebarCollapsed ? 60 : 240,
          background: C.surface,
          borderRight: `1px solid ${C.border}`,
          minHeight: 'calc(100vh - 65px)',
          transition: 'width 0.3s ease',
          overflow: 'hidden',
        }}>
          <nav style={{ padding: '16px 8px' }}>
            {filteredMenuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                style={{
                  width: '100%',
                  padding: sidebarCollapsed ? '12px 8px' : '12px 16px',
                  marginBottom: 4,
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: activeMenu === item.id ? 600 : 500,
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  background: activeMenu === item.id ? `${C.primary}15` : 'transparent',
                  color: activeMenu === item.id ? C.primary : C.textSecondary,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                }}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: 24, overflow: 'auto' }}>
          {activeMenu === 'dashboard' && <Dashboard notify={notify} />}
          {activeMenu === 'input-score' && <InputScore notify={notify} />}
          {activeMenu === 'score-management' && <ScoreManagement notify={notify} />}
          {activeMenu === 'teams' && <TeamsManagement notify={notify} />}
          {activeMenu === 'players' && <PlayersManagement notify={notify} />}
          {activeMenu === 'mvp-matchday' && <MVPMatchdayManagement notify={notify} />}
          {activeMenu === 'mvp-liga' && <MVPLigaManagement notify={notify} />}
          {activeMenu === 'users' && <UsersManagement notify={notify} />}
          {activeMenu === 'schedule' && <ScheduleManagement notify={notify} />}
          {activeMenu === 'generate-schedule' && <GenerateSchedule notify={notify} />}
          {activeMenu === 'standings-settings' && <StandingsSettings notify={notify} />}
          {activeMenu === 'reset' && <ResetLeague notify={notify} />}
          {activeMenu === 'general' && <GeneralSettings notify={notify} />}
        </main>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

// Dashboard Component
const Dashboard: React.FC<{ notify: (type: string, msg: string) => void }> = ({ notify }) => {
  const teams = store.getTeams();
  const players = store.getPlayers();
  const matches = store.getMatches();
  const standings = store.getStandings();

  const completedMatches = matches.filter(m => m.status === 'completed');
  const upcomingMatches = matches.filter(m => m.status === 'upcoming');
  const totalPoints = standings.reduce((sum, s) => sum + s.total_points, 0);

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: 24, fontWeight: 700, color: C.textPrimary, margin: '0 0 24px', fontFamily: 'Montserrat, sans-serif' }}>
        Dashboard
      </h2>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total Tim', value: teams.length, color: C.primary, icon: '👥' },
          { label: 'Total Pemain', value: players.filter(p => p.is_active).length, color: C.secondary, icon: '🏃' },
          { label: 'Total Pertandingan', value: matches.length, color: C.primaryDark, icon: '⚽' },
          { label: 'Selesai', value: completedMatches.length, color: C.success, icon: '✅' },
          { label: 'Mendatang', value: upcomingMatches.length, color: C.warning, icon: '📅' },
          { label: 'Total Poin', value: totalPoints, color: C.accent, icon: '🏆' },
        ].map((stat, i) => (
          <div key={i} style={{
            background: C.surface,
            borderRadius: 12,
            padding: 20,
            border: `1px solid ${C.border}`,
            transition: 'all 0.3s',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
              <span style={{ fontSize: 32 }}>{stat.icon}</span>
            </div>
            <p style={{ fontSize: 32, fontWeight: 700, color: stat.color, margin: '0 0 4px', fontFamily: 'Montserrat, sans-serif' }}>
              {stat.value}
            </p>
            <p style={{ fontSize: 13, color: C.textSecondary, margin: 0 }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ background: C.surface, borderRadius: 12, padding: 24, border: `1px solid ${C.border}`, marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary, margin: '0 0 16px' }}>Akses Cepat</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          {[
            { label: 'Input Skor', icon: '⚽', color: C.primary },
            { label: 'Tambah Tim', icon: '👥', color: C.secondary },
            { label: 'Tambah Pemain', icon: '🏃', color: C.accent },
            { label: 'Generate Jadwal', icon: '🔄', color: C.highlight },
          ].map((action, i) => (
            <button key={i} style={{
              padding: '16px',
              background: `${action.color}10`,
              border: `1px solid ${action.color}30`,
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${action.color}20`;
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `${action.color}10`;
              e.currentTarget.style.transform = 'scale(1)';
            }}
            >
              <div style={{ fontSize: 24, marginBottom: 8 }}>{action.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: action.color }}>{action.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ background: C.surface, borderRadius: 12, padding: 24, border: `1px solid ${C.border}` }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary, margin: '0 0 16px' }}>Pertandingan Terdekat</h3>
        {upcomingMatches.length > 0 ? (
          <div style={{ display: 'grid', gap: 12 }}>
            {upcomingMatches.slice(0, 5).map(match => {
              const teamA = teams.find(t => t.id === match.team_a_id);
              const teamB = teams.find(t => t.id === match.team_b_id);
              return (
                <div key={match.id} style={{
                  padding: 16,
                  background: C.bg,
                  borderRadius: 8,
                  border: `1px solid ${C.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, margin: 0 }}>
                      {teamA?.name} vs {teamB?.name}
                    </p>
                    <p style={{ fontSize: 12, color: C.textSecondary, margin: '4px 0 0' }}>
                      Court {match.court} • {match.start_time}
                    </p>
                  </div>
                  <span style={{
                    padding: '4px 12px',
                    background: `${C.warning}15`,
                    color: C.warning,
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 600,
                  }}>
                    Akan Datang
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ color: C.textSecondary, textAlign: 'center', padding: 20 }}>
            Tidak ada pertandingan mendatang
          </p>
        )}
      </div>
    </div>
  );
};

// Input Score Component
const InputScore: React.FC<{ notify: (type: string, msg: string) => void }> = ({ notify }) => {
  const matches = store.getMatches();
  const teams = store.getTeams();
  const pairs = store.getPairs();
  const players = store.getPlayers();
  const [selectedMatch, setSelectedMatch] = useState<string>('');
  const [selectedParty, setSelectedParty] = useState<number>(1);
  const [scores, setScores] = useState([
    { a: 0, b: 0 },
    { a: 0, b: 0 },
    { a: 0, b: 0 },
    { a: 0, b: 0 },
  ]);

  const availableMatches = matches.filter(m => m.status === 'upcoming' || m.status === 'ongoing');
  const match = matches.find(m => m.id === selectedMatch);
  
  // Get match lineups
  const matchLineups = match ? store.getMatchLineupsByMatchId(match.id) : [];
  
  // Get player name by ID
  const getPlayerName = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    return player?.name || 'Pemain tidak ditemukan';
  };
  
  // Get lineup for selected party
  const currentLineup = matchLineups.find(l => l.party_number === selectedParty);

  const handleSave = async (draft: boolean) => {
    if (!match) {
      notify('error', 'Pertandingan tidak valid. Silakan pilih pertandingan kembali.');
      return;
    }

    // Validasi: pastikan semua partai memiliki skor
    const hasAllScores = scores.every(s => s.a >= 0 && s.b >= 0);
    if (!hasAllScores) {
      notify('error', 'Semua partai harus memiliki skor');
      return;
    }

    // Validasi: pastikan tidak ada skor yang sama (tidak ada seri di padel)
    const hasTie = scores.some(s => s.a === s.b);
    if (hasTie && !draft) {
      notify('error', 'Tidak boleh ada skor seri dalam padel');
      return;
    }

    // Gunakan match_lineups jika ada, fallback ke pairs
    const hasLineups = matchLineups.length > 0;
    
    const results = scores.map((s, idx) => {
      let teamAPairId: string | null = null;
      let teamBPairId: string | null = null;

      if (hasLineups) {
        // Gunakan data dari match_lineups
        const lineup = matchLineups.find(l => l.party_number === idx + 1);
        if (lineup) {
          // Cari pair yang sesuai dengan pemain di lineup
          const teamAPair = pairs.find(p => 
            p.team_id === match.team_a_id && 
            p.is_active &&
            ((p.player_1_id === lineup.team_a_player1_id && p.player_2_id === lineup.team_a_player2_id) ||
             (p.player_1_id === lineup.team_a_player2_id && p.player_2_id === lineup.team_a_player1_id))
          );
          const teamBPair = pairs.find(p => 
            p.team_id === match.team_b_id && 
            p.is_active &&
            ((p.player_1_id === lineup.team_b_player1_id && p.player_2_id === lineup.team_b_player2_id) ||
             (p.player_1_id === lineup.team_b_player2_id && p.player_2_id === lineup.team_b_player1_id))
          );
          
          teamAPairId = teamAPair?.id || null;
          teamBPairId = teamBPair?.id || null;
        }
      } else {
        // Fallback ke pairs (kompatibilitas dengan data lama)
        const teamAPairs = pairs.filter(p => p.team_id === match.team_a_id && p.is_active);
        const teamBPairs = pairs.filter(p => p.team_id === match.team_b_id && p.is_active);
        
        const teamAPair = teamAPairs[idx];
        const teamBPair = teamBPairs[idx];
        
        teamAPairId = teamAPair?.id || null;
        teamBPairId = teamBPair?.id || null;
      }

      return {
        match_id: match.id,
        position: idx + 1,
        team_a_pair_id: teamAPairId,
        team_b_pair_id: teamBPairId,
        score_team_a: s.a,
        score_team_b: s.b,
        winner_team_id: s.a > s.b ? match.team_a_id : s.b > s.a ? match.team_b_id : null,
        status: draft ? 'pending' as const : 'completed' as const,
      };
    });

    try {
      await store.saveMatchResult(match.id, results, draft);
      if (draft) {
        notify('success', 'Draft berhasil disimpan. Skor belum masuk klasemen.');
      } else {
        notify('success', 'Hasil berhasil disahkan! Klasemen telah diperbarui.');
      }
      setSelectedMatch('');
      setSelectedParty(1);
      setScores([{ a: 0, b: 0 }, { a: 0, b: 0 }, { a: 0, b: 0 }, { a: 0, b: 0 }]);
    } catch (error: any) {
      console.error('Error saving match result:', error);
      notify('error', error.message || 'Gagal menyimpan hasil. Silakan coba lagi.');
    }
  };

  const teamAPoints = scores.reduce((sum, s) => sum + s.a, 0);
  const teamBPoints = scores.reduce((sum, s) => sum + s.b, 0);

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: 24, fontWeight: 700, color: C.textPrimary, margin: '0 0 24px', fontFamily: 'Montserrat, sans-serif' }}>
        Input Skor
      </h2>

      <div style={{ background: C.surface, borderRadius: 12, padding: 24, border: `1px solid ${C.border}`, marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textPrimary, marginBottom: 8 }}>
          Pilih Pertandingan
        </label>
        <select
          value={selectedMatch}
          onChange={e => setSelectedMatch(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 8,
            border: `1px solid ${C.border}`,
            fontSize: 14,
            background: C.surface,
          }}
        >
          <option value="">-- Pilih pertandingan --</option>
          {availableMatches.map(m => {
            const teamA = teams.find(t => t.id === m.team_a_id);
            const teamB = teams.find(t => t.id === m.team_b_id);
            return (
              <option key={m.id} value={m.id}>
                {teamA?.name} vs {teamB?.name}
              </option>
            );
          })}
        </select>
      </div>

      {selectedMatch && match && (
        <div className="fade-in" style={{ background: C.surface, borderRadius: 12, padding: 24, border: `1px solid ${C.border}` }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary, margin: '0 0 20px', textAlign: 'center' }}>
            {teams.find(t => t.id === match.team_a_id)?.name} vs {teams.find(t => t.id === match.team_b_id)?.name}
          </h3>

          {/* Party Selector */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textPrimary, marginBottom: 8 }}>
              Pilih Partai
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {[1, 2, 3, 4].map(party => {
                const lineup = matchLineups.find(l => l.party_number === party);
                const hasLineup = lineup && lineup.team_a_player1_id && lineup.team_a_player2_id;
                return (
                  <button
                    key={party}
                    onClick={() => setSelectedParty(party)}
                    style={{
                      padding: '12px',
                      borderRadius: 8,
                      border: selectedParty === party ? `2px solid ${C.primary}` : `1px solid ${C.border}`,
                      background: selectedParty === party ? `${C.primary}15` : C.surface,
                      color: selectedParty === party ? C.primary : C.textPrimary,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      position: 'relative',
                    }}
                  >
                    Partai {party}
                    {hasLineup && (
                      <span style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: C.success,
                      }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Party Display */}
          <div style={{ 
            padding: 20, 
            background: C.bg, 
            borderRadius: 8, 
            border: `1px solid ${C.border}`,
            marginBottom: 24,
          }}>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: C.primary, margin: '0 0 16px' }}>
              Partai {selectedParty}
            </h4>
            
            {currentLineup ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center' }}>
                {/* Tim A Players */}
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: C.primary, margin: '0 0 8px' }}>
                    {teams.find(t => t.id === match.team_a_id)?.name}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: C.textPrimary }}>
                      {getPlayerName(currentLineup.team_a_player1_id)}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: C.textPrimary }}>
                      {getPlayerName(currentLineup.team_a_player2_id)}
                    </span>
                  </div>
                </div>

                {/* VS */}
                <div style={{ 
                  fontSize: 20, 
                  fontWeight: 700, 
                  color: C.textSecondary,
                  padding: '0 16px',
                }}>
                  VS
                </div>

                {/* Tim B Players */}
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: C.highlight, margin: '0 0 8px' }}>
                    {teams.find(t => t.id === match.team_b_id)?.name}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: C.textPrimary }}>
                      {getPlayerName(currentLineup.team_b_player1_id)}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: C.textPrimary }}>
                      {getPlayerName(currentLineup.team_b_player2_id)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ 
                padding: 24, 
                textAlign: 'center',
                background: `${C.warning}10`,
                borderRadius: 8,
                border: `1px dashed ${C.warning}`,
              }}>
                <p style={{ fontSize: 13, color: C.warning, margin: 0, fontWeight: 600 }}>
                  ⚠️ Susunan pemain untuk Partai {selectedParty} belum diatur
                </p>
                <p style={{ fontSize: 12, color: C.textSecondary, margin: '8px 0 0' }}>
                  Silakan atur susunan pemain di menu Manajemen Jadwal terlebih dahulu
                </p>
              </div>
            )}
          </div>

          {/* Score Input */}
          {currentLineup && (
            <div style={{ 
              padding: 20, 
              background: C.surface, 
              borderRadius: 8, 
              border: `2px solid ${C.primary}`,
              marginBottom: 24,
            }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, margin: '0 0 16px' }}>
                Input Skor Partai {selectedParty}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <label style={{ display: 'block', fontSize: 12, color: C.textSecondary, marginBottom: 8 }}>
                    Skor {teams.find(t => t.id === match.team_a_id)?.name}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="7"
                    value={scores[selectedParty - 1].a}
                    onChange={e => {
                      const newScores = [...scores];
                      newScores[selectedParty - 1] = { ...newScores[selectedParty - 1], a: parseInt(e.target.value) || 0 };
                      setScores(newScores);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 8,
                      border: `2px solid ${C.primary}`,
                      fontSize: 24,
                      fontWeight: 700,
                      textAlign: 'center',
                    }}
                  />
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: C.textSecondary }}>
                  -
                </div>
                <div style={{ textAlign: 'center' }}>
                  <label style={{ display: 'block', fontSize: 12, color: C.textSecondary, marginBottom: 8 }}>
                    Skor {teams.find(t => t.id === match.team_b_id)?.name}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="7"
                    value={scores[selectedParty - 1].b}
                    onChange={e => {
                      const newScores = [...scores];
                      newScores[selectedParty - 1] = { ...newScores[selectedParty - 1], b: parseInt(e.target.value) || 0 };
                      setScores(newScores);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 8,
                      border: `2px solid ${C.highlight}`,
                      fontSize: 24,
                      fontWeight: 700,
                      textAlign: 'center',
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: 24,
            padding: 20,
            background: `linear-gradient(135deg, ${C.primary}10, ${C.primaryDark}10)`,
            borderRadius: 12,
            marginBottom: 24,
          }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: C.textSecondary, margin: '0 0 8px' }}>Total Poin A</p>
              <p style={{ fontSize: 36, fontWeight: 700, color: C.primary, margin: 0, fontFamily: 'Montserrat, sans-serif' }}>
                {teamAPoints}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: 24, color: C.textSecondary }}>
              VS
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: C.textSecondary, margin: '0 0 8px' }}>Total Poin B</p>
              <p style={{ fontSize: 36, fontWeight: 700, color: C.highlight, margin: 0, fontFamily: 'Montserrat, sans-serif' }}>
                {teamBPoints}
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <button
              onClick={() => handleSave(true)}
              style={{
                padding: '14px',
                background: C.warning,
                color: '#fff',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Simpan Draft
            </button>
            <button
              onClick={() => handleSave(false)}
              style={{
                padding: '14px',
                background: C.success,
                color: '#fff',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Sahkan Hasil
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Score Management Component
const ScoreManagement: React.FC<{ notify: (type: string, msg: string) => void }> = ({ notify }) => {
  const matches = store.getMatches();
  const teams = store.getTeams();
  const pairResults = store.getPairResults();
  const [filter, setFilter] = useState<'all' | 'completed' | 'draft' | 'cancelled'>('all');

  // Tampilkan semua match yang memiliki hasil (baik draft maupun finalized)
  const matchesWithResults = matches.filter(m => {
    const hasResults = pairResults.some(r => r.match_id === m.id);
    if (!hasResults) return false;
    
    if (filter === 'all') return true;
    if (filter === 'completed') return m.status === 'completed';
    if (filter === 'draft') return m.status === 'ongoing' || m.status === 'upcoming';
    if (filter === 'cancelled') return m.status === 'cancelled';
    return true;
  });

  const handleDeactivate = async (matchId: string) => {
    if (confirm('Yakin ingin menonaktifkan hasil pertandingan ini? Hasil tidak akan dihitung dalam klasemen.')) {
      try {
        const match = matches.find(m => m.id === matchId);
        if (match) {
          await store.updateMatch({ ...match, status: 'cancelled' });
          notify('success', 'Hasil pertandingan dinonaktifkan');
        }
      } catch (error) {
        notify('error', 'Gagal menonaktifkan hasil');
      }
    }
  };

  const handleReactivate = async (matchId: string) => {
    if (confirm('Aktifkan kembali hasil pertandingan ini? Hasil akan dihitung dalam klasemen.')) {
      try {
        const match = matches.find(m => m.id === matchId);
        if (match) {
          await store.updateMatch({ ...match, status: 'completed' });
          notify('success', 'Hasil pertandingan diaktifkan kembali');
        }
      } catch (error) {
        notify('error', 'Gagal mengaktifkan hasil');
      }
    }
  };

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: 24, fontWeight: 700, color: C.textPrimary, margin: '0 0 24px', fontFamily: 'Montserrat, sans-serif' }}>
        Manajemen Skor
      </h2>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[
          { id: 'all', label: 'Semua Hasil' },
          { id: 'completed', label: 'Disahkan' },
          { id: 'draft', label: 'Draft' },
          { id: 'cancelled', label: 'Dinonaktifkan' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as any)}
            style={{
              padding: '8px 16px',
              background: filter === f.id ? C.primary : C.surface,
              color: filter === f.id ? '#fff' : C.textSecondary,
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              border: `1px solid ${filter === f.id ? C.primary : C.border}`,
              cursor: 'pointer',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        {matchesWithResults.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: C.textSecondary }}>
            <p style={{ margin: 0 }}>Belum ada hasil pertandingan</p>
          </div>
        ) : (
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: C.primaryDark, color: '#fff' }}>
                <th style={{ padding: 12, textAlign: 'left' }}>Pertandingan</th>
                <th style={{ padding: 12, textAlign: 'center' }}>Skor</th>
                <th style={{ padding: 12, textAlign: 'center' }}>Status</th>
                <th style={{ padding: 12, textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {matchesWithResults.map((match: any) => {
                const teamA = teams.find(t => t.id === match.team_a_id);
                const teamB = teams.find(t => t.id === match.team_b_id);
                const results = pairResults.filter(r => r.match_id === match.id);
                const aPoints = results.reduce((sum, r) => sum + r.score_team_a, 0);
                const bPoints = results.reduce((sum, r) => sum + r.score_team_b, 0);
                const isDraft = match.status === 'ongoing' || match.status === 'upcoming';
                const isCancelled = match.status === 'cancelled';

                return (
                  <tr key={match.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: 12 }}>
                      <p style={{ fontWeight: 600, margin: 0 }}>{teamA?.name} vs {teamB?.name}</p>
                    </td>
                    <td style={{ padding: 12, textAlign: 'center', fontWeight: 700 }}>
                      {aPoints} - {bPoints}
                    </td>
                    <td style={{ padding: 12, textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 12px',
                        background: isCancelled ? `${C.error}15` : isDraft ? `${C.warning}15` : `${C.success}15`,
                        color: isCancelled ? C.error : isDraft ? C.warning : C.success,
                        borderRadius: 12,
                        fontSize: 11,
                        fontWeight: 600,
                      }}>
                        {isCancelled ? 'Dinonaktifkan' : isDraft ? 'Draft' : 'Disahkan'}
                      </span>
                    </td>
                    <td style={{ padding: 12, textAlign: 'center' }}>
                      {isCancelled ? (
                        <button
                          onClick={() => handleReactivate(match.id)}
                          style={{
                            padding: '6px 12px',
                            background: `${C.success}15`,
                            color: C.success,
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 500,
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          Aktifkan
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDeactivate(match.id)}
                          style={{
                            padding: '6px 12px',
                            background: `${C.error}15`,
                            color: C.error,
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 500,
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          Nonaktifkan
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// Teams Management Component
const TeamsManagement: React.FC<{ notify: (type: string, msg: string) => void }> = ({ notify }) => {
  const [teams, setTeams] = useState<Team[]>(store.getTeams());
  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [name, setName] = useState('');
  const [captain, setCaptain] = useState('');
  const [desc, setDesc] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        notify('error', 'Ukuran file maksimal 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      notify('error', 'Nama tim harus diisi');
      return;
    }

    try {
      if (editingTeam) {
        await store.updateTeam({ ...editingTeam, name, captain, description: desc, logo_url: logoUrl });
        notify('success', 'Tim berhasil diperbarui');
      } else {
        await store.addTeam({ name, captain, description: desc, logo_url: logoUrl, is_active: true });
        notify('success', 'Tim baru berhasil ditambahkan');
      }
      setTeams(store.getTeams());
      setShowForm(false);
      setEditingTeam(null);
      setName('');
      setCaptain('');
      setDesc('');
      setLogoUrl('');
    } catch (error) {
      notify('error', 'Gagal menyimpan tim');
    }
  };

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setName(team.name);
    setCaptain(team.captain);
    setDesc(team.description);
    setLogoUrl(team.logo_url);
    setShowForm(true);
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: C.textPrimary, margin: 0, fontFamily: 'Montserrat, sans-serif' }}>
          Manajemen Tim
        </h2>
        <button
          onClick={() => { setShowForm(true); setEditingTeam(null); setName(''); setCaptain(''); setDesc(''); setLogoUrl(''); }}
          style={{
            padding: '10px 20px',
            background: C.primary,
            color: '#fff',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          + Tambah Tim
        </button>
      </div>

      {showForm && (
        <div className="fade-in" style={{ background: C.surface, borderRadius: 12, padding: 24, border: `1px solid ${C.border}`, marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary, margin: '0 0 16px' }}>
            {editingTeam ? 'Edit Tim' : 'Tambah Tim Baru'}
          </h3>
          
          {/* Logo Upload Section */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.textPrimary, marginBottom: 8 }}>
              Logo Tim
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="Logo Tim" 
                  style={{ 
                    width: 80, 
                    height: 80, 
                    borderRadius: '50%', 
                    objectFit: 'cover',
                    border: `2px solid ${C.primary}`,
                  }} 
                />
              ) : (
                <div style={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%', 
                  background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 28,
                }}>
                  {name ? name.charAt(0) : 'T'}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/png,image/jpeg,image/jpg,image/webp" 
                  onChange={handleLogoSelect} 
                  style={{ display: 'none' }} 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ 
                    padding: '8px 16px', 
                    background: C.bg, 
                    color: C.textPrimary, 
                    borderRadius: 6, 
                    fontSize: 12, 
                    border: `1px solid ${C.border}`, 
                    cursor: 'pointer',
                    marginBottom: 8,
                  }}
                >
                  {logoUrl ? 'Ganti Logo' : 'Pilih Logo'}
                </button>
                {logoUrl && (
                  <button 
                    onClick={() => setLogoUrl('')}
                    style={{ 
                      display: 'block',
                      padding: '8px 16px', 
                      background: `${C.error}15`, 
                      color: C.error, 
                      borderRadius: 6, 
                      fontSize: 12, 
                      border: 'none', 
                      cursor: 'pointer',
                    }}
                  >
                    Hapus Logo
                  </button>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nama tim"
              style={{ padding: '12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14 }}
            />
            <input
              value={captain}
              onChange={e => setCaptain(e.target.value)}
              placeholder="Nama kapten"
              style={{ padding: '12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14 }}
            />
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Deskripsi"
              rows={3}
              style={{ padding: '12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <button
              onClick={handleSave}
              style={{ padding: '12px', background: C.success, color: '#fff', borderRadius: 8, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}
            >
              Simpan
            </button>
            <button
              onClick={() => { setShowForm(false); setEditingTeam(null); }}
              style={{ padding: '12px', background: C.bg, color: C.textSecondary, borderRadius: 8, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}
            >
              Batal
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: 12 }}>
        {teams.map(team => (
          <div key={team.id} style={{
            background: C.surface,
            borderRadius: 12,
            padding: 16,
            border: `1px solid ${C.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateX(4px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateX(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          >
            {team.logo_url ? (
              <img 
                src={team.logo_url} 
                alt={team.name} 
                style={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '50%', 
                  objectFit: 'cover',
                  border: `2px solid ${C.primary}`,
                }} 
              />
            ) : (
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: 18,
              }}>
                {team.name.charAt(0)}
              </div>
            )}
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, margin: 0 }}>{team.name}</p>
              <p style={{ fontSize: 12, color: C.textSecondary, margin: '4px 0 0' }}>Kapten: {team.captain}</p>
            </div>
            <button
              onClick={() => handleEdit(team)}
              style={{
                padding: '8px 16px',
                background: `${C.primary}15`,
                color: C.primary,
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Players Management Component
const PlayersManagement: React.FC<{ notify: (type: string, msg: string) => void }> = ({ notify }) => {
  const [players, setPlayers] = useState<Player[]>(store.getPlayers());
  const teams = store.getTeams().filter(t => t.is_active);
  const [showForm, setShowForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [name, setName] = useState('');
  const [teamId, setTeamId] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [position, setPosition] = useState<'right' | 'left' | 'both' | ''>('');
  const [strengths, setStrengths] = useState<string[]>([]);
  const [newStrength, setNewStrength] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        notify('error', 'Ukuran file maksimal 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !teamId) {
      notify('error', 'Nama dan tim harus diisi');
      return;
    }

    try {
      if (editingPlayer) {
        await store.updatePlayer({ ...editingPlayer, name, team_id: teamId, photo_url: photoUrl, gender, position, strengths });
        notify('success', 'Pemain berhasil diperbarui');
      } else {
        await store.addPlayer({ name, team_id: teamId, photo_url: photoUrl, is_active: true, gender, position, strengths });
        notify('success', 'Pemain baru berhasil ditambahkan');
      }
      setPlayers(store.getPlayers());
      setShowForm(false);
      setEditingPlayer(null);
      setName('');
      setTeamId('');
      setPhotoUrl('');
      setGender('');
      setPosition('');
      setStrengths([]);
      setNewStrength('');
    } catch (error) {
      notify('error', 'Gagal menyimpan pemain');
    }
  };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setName(player.name);
    setTeamId(player.team_id);
    setPhotoUrl(player.photo_url);
    setGender(player.gender || '');
    setPosition(player.position || '');
    setStrengths(player.strengths || []);
    setShowForm(true);
  };

  const handleAddStrength = () => {
    if (newStrength.trim() && !strengths.includes(newStrength.trim())) {
      setStrengths([...strengths, newStrength.trim()]);
      setNewStrength('');
    }
  };

  const handleRemoveStrength = (strength: string) => {
    setStrengths(strengths.filter(s => s !== strength));
  };

  const handleToggleActive = async (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (player) {
      try {
        await store.updatePlayer({ ...player, is_active: !player.is_active });
        setPlayers(store.getPlayers());
        notify('success', `Pemain ${player.is_active ? 'dinonaktifkan' : 'diaktifkan'}`);
      } catch (error) {
        notify('error', 'Gagal mengubah status pemain');
      }
    }
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: C.textPrimary, margin: 0, fontFamily: 'Montserrat, sans-serif' }}>
          Manajemen Pemain
        </h2>
        <button
          onClick={() => { setShowForm(true); setEditingPlayer(null); setName(''); setTeamId(''); setPhotoUrl(''); setGender(''); setPosition(''); setStrengths([]); setNewStrength(''); }}
          style={{
            padding: '10px 20px',
            background: C.primary,
            color: '#fff',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          + Tambah Pemain
        </button>
      </div>

      {showForm && (
        <div className="fade-in" style={{ background: C.surface, borderRadius: 12, padding: 24, border: `1px solid ${C.border}`, marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary, margin: '0 0 16px' }}>
            {editingPlayer ? 'Edit Pemain' : 'Tambah Pemain Baru'}
          </h3>
          
          {/* Photo Upload Section */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.textPrimary, marginBottom: 8 }}>
              Foto Pemain
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {photoUrl ? (
                <img 
                  src={photoUrl} 
                  alt="Foto Pemain" 
                  style={{ 
                    width: 80, 
                    height: 80, 
                    borderRadius: '50%', 
                    objectFit: 'cover',
                    border: `2px solid ${C.secondary}`,
                  }} 
                />
              ) : (
                <div style={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%', 
                  background: `${C.secondary}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: C.secondary,
                  fontWeight: 700,
                  fontSize: 28,
                }}>
                  {name ? name.charAt(0) : 'P'}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/png,image/jpeg,image/jpg,image/webp" 
                  onChange={handlePhotoSelect} 
                  style={{ display: 'none' }} 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ 
                    padding: '8px 16px', 
                    background: C.bg, 
                    color: C.textPrimary, 
                    borderRadius: 6, 
                    fontSize: 12, 
                    border: `1px solid ${C.border}`, 
                    cursor: 'pointer',
                    marginBottom: 8,
                  }}
                >
                  {photoUrl ? 'Ganti Foto' : 'Pilih Foto'}
                </button>
                {photoUrl && (
                  <button 
                    onClick={() => setPhotoUrl('')}
                    style={{ 
                      display: 'block',
                      padding: '8px 16px', 
                      background: `${C.error}15`, 
                      color: C.error, 
                      borderRadius: 6, 
                      fontSize: 12, 
                      border: 'none', 
                      cursor: 'pointer',
                    }}
                  >
                    Hapus Foto
                  </button>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nama pemain"
              style={{ padding: '12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14 }}
            />
            <select
              value={teamId}
              onChange={e => setTeamId(e.target.value)}
              style={{ padding: '12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14 }}
            >
              <option value="">Pilih tim</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select
              value={gender}
              onChange={e => setGender(e.target.value as 'male' | 'female' | '')}
              style={{ padding: '12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14 }}
            >
              <option value="">Pilih jenis kelamin</option>
              <option value="male">Pria</option>
              <option value="female">Wanita</option>
            </select>
            <select
              value={position}
              onChange={e => setPosition(e.target.value as 'right' | 'left' | 'both' | '')}
              style={{ padding: '12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14 }}
            >
              <option value="">Pilih posisi</option>
              <option value="right">Right Side (Kanan)</option>
              <option value="left">Left Side (Kiri)</option>
              <option value="both">Both Sides (Kanan & Kiri)</option>
            </select>
          </div>

          {/* Keunggulan Pemain Section */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.textPrimary, marginBottom: 8 }}>
              Keunggulan Pemain
            </label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                value={newStrength}
                onChange={e => setNewStrength(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleAddStrength()}
                placeholder="Contoh: Smash Keras, Bandeja Akurat, dll"
                style={{ flex: 1, padding: '12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14 }}
              />
              <button
                onClick={handleAddStrength}
                style={{
                  padding: '12px 20px',
                  background: C.primary,
                  color: '#fff',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Tambah
              </button>
            </div>
            {strengths.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {strengths.map((strength, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '6px 12px',
                      background: `${C.accent}20`,
                      borderRadius: 20,
                      border: `1px solid ${C.accent}`,
                    }}
                  >
                    <span style={{ fontSize: 13, color: C.textPrimary }}>{strength}</span>
                    <button
                      onClick={() => handleRemoveStrength(strength)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: C.error,
                        cursor: 'pointer',
                        fontSize: 16,
                        fontWeight: 700,
                        padding: 0,
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <button
              onClick={handleSave}
              style={{ padding: '12px', background: C.success, color: '#fff', borderRadius: 8, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}
            >
              Simpan
            </button>
            <button
              onClick={() => { setShowForm(false); setEditingPlayer(null); }}
              style={{ padding: '12px', background: C.bg, color: C.textSecondary, borderRadius: 8, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}
            >
              Batal
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: 12 }}>
        {players.slice(0, 20).map(player => {
          const team = teams.find(t => t.id === player.team_id);
          return (
            <div key={player.id} style={{
              background: C.surface,
              borderRadius: 12,
              padding: 16,
              border: `1px solid ${C.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateX(4px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              {player.photo_url ? (
                <img 
                  src={player.photo_url} 
                  alt={player.name} 
                  style={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: '50%', 
                    objectFit: 'cover',
                    border: `2px solid ${C.secondary}`,
                  }} 
                />
              ) : (
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: `${C.secondary}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: C.secondary,
                  fontWeight: 700,
                  fontSize: 18,
                }}>
                  {player.name.charAt(0)}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, margin: 0 }}>{player.name}</p>
                <p style={{ fontSize: 12, color: C.textSecondary, margin: '4px 0 0' }}>
                  {team?.name || 'Tidak ada tim'}
                  {player.gender && ` • ${player.gender === 'male' ? 'Pria' : 'Wanita'}`}
                  {player.position && ` • ${player.position === 'right' ? 'Right Side' : 'Left Side'}`}
                </p>
              </div>
              <button
                onClick={() => handleEdit(player)}
                style={{
                  padding: '8px 16px',
                  background: `${C.primary}15`,
                  color: C.primary,
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Edit
              </button>
              <button
                onClick={() => handleToggleActive(player.id)}
                style={{
                  padding: '8px 16px',
                  background: player.is_active ? `${C.warning}15` : `${C.success}15`,
                  color: player.is_active ? C.warning : C.success,
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {player.is_active ? 'Nonaktifkan' : 'Aktifkan'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Users Management Component
const UsersManagement: React.FC<{ notify: (type: string, msg: string) => void }> = ({ notify }) => {
  const [users, setUsers] = useState<User[]>(store.getUsers());
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<User['role']>('operator');

  const handleSave = async () => {
    if (!name.trim() || !email.trim() || (!editingUser && !password.trim())) {
      notify('error', 'Semua field harus diisi');
      return;
    }

    try {
      if (editingUser) {
        await store.updateUser({ ...editingUser, name, email, role });
        notify('success', 'User berhasil diperbarui');
      } else {
        await store.addUser({ name, email, password_hash: password, role, is_active: true });
        notify('success', 'User baru berhasil ditambahkan');
      }
      setUsers(store.getUsers());
      setShowForm(false);
      setEditingUser(null);
      setName('');
      setEmail('');
      setPassword('');
      setRole('operator');
    } catch (error) {
      notify('error', 'Gagal menyimpan user');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setShowForm(true);
  };

  const handleDelete = async (userId: string) => {
    if (confirm('Yakin ingin menghapus user ini?')) {
      try {
        await store.deleteUser(userId);
        setUsers(store.getUsers());
        notify('success', 'User berhasil dihapus');
      } catch (error) {
        notify('error', 'Gagal menghapus user');
      }
    }
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: C.textPrimary, margin: 0, fontFamily: 'Montserrat, sans-serif' }}>
          Manajemen User
        </h2>
        <button
          onClick={() => { setShowForm(true); setEditingUser(null); setName(''); setEmail(''); setPassword(''); setRole('operator'); }}
          style={{
            padding: '10px 20px',
            background: C.primary,
            color: '#fff',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          + Tambah User
        </button>
      </div>

      {showForm && (
        <div className="fade-in" style={{ background: C.surface, borderRadius: 12, padding: 24, border: `1px solid ${C.border}`, marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary, margin: '0 0 16px' }}>
            {editingUser ? 'Edit User' : 'Tambah User Baru'}
          </h3>
          <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nama lengkap"
              style={{ padding: '12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14 }}
            />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              style={{ padding: '12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14 }}
            />
            {!editingUser && (
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                style={{ padding: '12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14 }}
              />
            )}
            <select
              value={role}
              onChange={e => setRole(e.target.value as User['role'])}
              style={{ padding: '12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14 }}
            >
              <option value="operator">Operator</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <button
              onClick={handleSave}
              style={{ padding: '12px', background: C.success, color: '#fff', borderRadius: 8, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}
            >
              Simpan
            </button>
            <button
              onClick={() => { setShowForm(false); setEditingUser(null); }}
              style={{ padding: '12px', background: C.bg, color: C.textSecondary, borderRadius: 8, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}
            >
              Batal
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: 12 }}>
        {users.map(user => (
          <div key={user.id} style={{
            background: C.surface,
            borderRadius: 12,
            padding: 16,
            border: `1px solid ${C.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: `${C.accent}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: C.accent,
              fontWeight: 700,
              fontSize: 18,
            }}>
              {user.name.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, margin: 0 }}>{user.name}</p>
              <p style={{ fontSize: 12, color: C.textSecondary, margin: '4px 0 0' }}>
                {user.email} • {user.role.replace('_', ' ').toUpperCase()}
              </p>
            </div>
            <button
              onClick={() => handleEdit(user)}
              style={{
                padding: '8px 16px',
                background: `${C.primary}15`,
                color: C.primary,
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Edit
            </button>
            {user.role !== 'super_admin' && (
              <button
                onClick={() => handleDelete(user.id)}
                style={{
                  padding: '8px 16px',
                  background: `${C.error}15`,
                  color: C.error,
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Hapus
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Edit Match Modal Component
const EditMatchModal: React.FC<{
  match: Match;
  teams: Team[];
  matchdays: Matchday[];
  players: Player[];
  onSave: (match: Match, lineups?: any[]) => void;
  onCancel: () => void;
  notify: (type: string, msg: string) => void;
}> = ({ match, teams, matchdays, players, onSave, onCancel, notify }) => {
  const [matchdayId, setMatchdayId] = useState(match.matchday_id);
  const [teamAId, setTeamAId] = useState(match.team_a_id);
  const [teamBId, setTeamBId] = useState(match.team_b_id);
  const [court, setCourt] = useState(match.court);
  const [startTime, setStartTime] = useState(match.start_time);
  const [endTime, setEndTime] = useState(match.end_time);
  const [status, setStatus] = useState(match.status);
  
  // Load existing lineups
  const existingLineups = store.getMatchLineupsByMatchId(match.id);
  
  // State for 4 parties lineups
  const [lineups, setLineups] = useState([
    existingLineups[0] || { party_number: 1, team_a_player1_id: '', team_a_player2_id: '', team_b_player1_id: '', team_b_player2_id: '' },
    existingLineups[1] || { party_number: 2, team_a_player1_id: '', team_a_player2_id: '', team_b_player1_id: '', team_b_player2_id: '' },
    existingLineups[2] || { party_number: 3, team_a_player1_id: '', team_a_player2_id: '', team_b_player1_id: '', team_b_player2_id: '' },
    existingLineups[3] || { party_number: 4, team_a_player1_id: '', team_a_player2_id: '', team_b_player1_id: '', team_b_player2_id: '' },
  ]);

  // Get players by team
  const getTeamPlayers = (teamId: string) => {
    return players.filter(p => p.team_id === teamId && p.is_active);
  };

  const teamAPlayers = getTeamPlayers(teamAId);
  const teamBPlayers = getTeamPlayers(teamBId);

  const updateLineup = (partyIndex: number, field: string, value: string) => {
    const newLineups = [...lineups];
    newLineups[partyIndex] = { ...newLineups[partyIndex], [field]: value };
    setLineups(newLineups);
  };

  const handleSave = () => {
    if (teamAId === teamBId) {
      notify('error', 'Tim A dan Tim B tidak boleh sama');
      return;
    }

    // Validasi lineups (optional - admin bisa simpan tanpa lineups)
    const hasAnyLineup = lineups.some(l => 
      l.team_a_player1_id || l.team_a_player2_id || l.team_b_player1_id || l.team_b_player2_id
    );

    if (hasAnyLineup) {
      // Validasi setiap partai yang diisi
      for (let i = 0; i < lineups.length; i++) {
        const lineup = lineups[i];
        const hasAnyPlayer = lineup.team_a_player1_id || lineup.team_a_player2_id || lineup.team_b_player1_id || lineup.team_b_player2_id;
        
        if (hasAnyPlayer) {
          // Validasi lengkap untuk partai ini
          if (!lineup.team_a_player1_id || !lineup.team_a_player2_id) {
            notify('error', `Partai ${i + 1}: Lengkapi pemain Tim A`);
            return;
          }
          if (!lineup.team_b_player1_id || !lineup.team_b_player2_id) {
            notify('error', `Partai ${i + 1}: Lengkapi pemain Tim B`);
            return;
          }
          if (lineup.team_a_player1_id === lineup.team_a_player2_id) {
            notify('error', `Partai ${i + 1}: Pemain Tim A tidak boleh sama`);
            return;
          }
          if (lineup.team_b_player1_id === lineup.team_b_player2_id) {
            notify('error', `Partai ${i + 1}: Pemain Tim B tidak boleh sama`);
            return;
          }
        }
      }
    }

    const updatedMatch: Match = {
      ...match,
      matchday_id: matchdayId,
      team_a_id: teamAId,
      team_b_id: teamBId,
      court,
      start_time: startTime,
      end_time: endTime,
      status: status as Match['status'],
    };

    // Prepare lineups for saving
    const lineupsToSave = lineups
      .filter(l => l.team_a_player1_id && l.team_a_player2_id && l.team_b_player1_id && l.team_b_player2_id)
      .map(l => ({
        match_id: match.id,
        party_number: l.party_number,
        team_a_player1_id: l.team_a_player1_id,
        team_a_player2_id: l.team_a_player2_id,
        team_b_player1_id: l.team_b_player1_id,
        team_b_player2_id: l.team_b_player2_id,
        status: 'pending' as const,
      }));

    onSave(updatedMatch, lineupsToSave);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 16,
    }}>
      <div style={{
        background: C.surface,
        borderRadius: 12,
        padding: 24,
        maxWidth: 500,
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
      }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, color: C.textPrimary, margin: '0 0 20px' }}>
          Edit Jadwal Pertandingan
        </h3>

        <div style={{ display: 'grid', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.textPrimary, marginBottom: 8 }}>
              Matchday
            </label>
            <select
              value={matchdayId}
              onChange={e => setMatchdayId(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14 }}
            >
              {matchdays.map(md => (
                <option key={md.id} value={md.id}>Matchday {md.matchday_number} - {md.date}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.textPrimary, marginBottom: 8 }}>
              Tim A
            </label>
            <select
              value={teamAId}
              onChange={e => setTeamAId(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14 }}
            >
              {teams.filter(t => t.is_active).map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.textPrimary, marginBottom: 8 }}>
              Tim B
            </label>
            <select
              value={teamBId}
              onChange={e => setTeamBId(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14 }}
            >
              {teams.filter(t => t.is_active).map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.textPrimary, marginBottom: 8 }}>
                Court
              </label>
              <select
                value={court}
                onChange={e => setCourt(parseInt(e.target.value))}
                style={{ width: '100%', padding: '12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14 }}
              >
                <option value={1}>Court 1</option>
                <option value={2}>Court 2</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.textPrimary, marginBottom: 8 }}>
                Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as Match['status'])}
                style={{ width: '100%', padding: '12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14 }}
              >
                <option value="upcoming">Akan Datang</option>
                <option value="ongoing">Berlangsung</option>
                <option value="completed">Selesai</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.textPrimary, marginBottom: 8 }}>
                Jam Mulai
              </label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.textPrimary, marginBottom: 8 }}>
                Jam Selesai
              </label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14 }}
              />
            </div>
          </div>
        </div>

        {/* SUSUNAN PEMAIN PERTANDINGAN */}
        <div style={{ marginTop: 24, marginBottom: 20 }}>
          <h4 style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary, margin: '0 0 16px', borderBottom: `2px solid ${C.primary}`, paddingBottom: 8 }}>
            🎾 SUSUNAN PEMAIN PERTANDINGAN
          </h4>
          
          {teamAPlayers.length < 2 || teamBPlayers.length < 2 ? (
            <div style={{ padding: 16, background: `${C.warning}15`, borderRadius: 8, border: `1px solid ${C.warning}30` }}>
              <p style={{ fontSize: 13, color: C.warning, margin: 0, fontWeight: 600 }}>
                ⚠️ Peringatan: Tim harus memiliki minimal 2 pemain aktif untuk mengisi susunan pemain.
              </p>
              <p style={{ fontSize: 12, color: C.textSecondary, margin: '8px 0 0' }}>
                Tim A: {teamAPlayers.length} pemain aktif | Tim B: {teamBPlayers.length} pemain aktif
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              {[0, 1, 2, 3].map(partyIndex => (
                <div key={partyIndex} style={{ 
                  padding: 16, 
                  background: C.bg, 
                  borderRadius: 8, 
                  border: `1px solid ${C.border}` 
                }}>
                  <h5 style={{ 
                    fontSize: 14, 
                    fontWeight: 600, 
                    color: C.primary, 
                    margin: '0 0 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                    <span style={{ 
                      width: 24, 
                      height: 24, 
                      borderRadius: '50%', 
                      background: C.primary, 
                      color: '#fff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                    }}>
                      {partyIndex + 1}
                    </span>
                    Partai {partyIndex + 1}
                  </h5>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {/* Tim A */}
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.primary, marginBottom: 8 }}>
                        {teams.find(t => t.id === teamAId)?.name || 'Tim A'}
                      </label>
                      <div style={{ display: 'grid', gap: 8 }}>
                        <select
                          value={lineups[partyIndex].team_a_player1_id}
                          onChange={e => updateLineup(partyIndex, 'team_a_player1_id', e.target.value)}
                          style={{ 
                            width: '100%', 
                            padding: '10px', 
                            borderRadius: 6, 
                            border: `1px solid ${C.border}`, 
                            fontSize: 13,
                            background: C.surface,
                          }}
                        >
                          <option value="">Pilih Pemain 1</option>
                          {teamAPlayers.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                        <select
                          value={lineups[partyIndex].team_a_player2_id}
                          onChange={e => updateLineup(partyIndex, 'team_a_player2_id', e.target.value)}
                          style={{ 
                            width: '100%', 
                            padding: '10px', 
                            borderRadius: 6, 
                            border: `1px solid ${C.border}`, 
                            fontSize: 13,
                            background: C.surface,
                          }}
                        >
                          <option value="">Pilih Pemain 2</option>
                          {teamAPlayers.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Tim B */}
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.highlight, marginBottom: 8 }}>
                        {teams.find(t => t.id === teamBId)?.name || 'Tim B'}
                      </label>
                      <div style={{ display: 'grid', gap: 8 }}>
                        <select
                          value={lineups[partyIndex].team_b_player1_id}
                          onChange={e => updateLineup(partyIndex, 'team_b_player1_id', e.target.value)}
                          style={{ 
                            width: '100%', 
                            padding: '10px', 
                            borderRadius: 6, 
                            border: `1px solid ${C.border}`, 
                            fontSize: 13,
                            background: C.surface,
                          }}
                        >
                          <option value="">Pilih Pemain 1</option>
                          {teamBPlayers.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                        <select
                          value={lineups[partyIndex].team_b_player2_id}
                          onChange={e => updateLineup(partyIndex, 'team_b_player2_id', e.target.value)}
                          style={{ 
                            width: '100%', 
                            padding: '10px', 
                            borderRadius: 6, 
                            border: `1px solid ${C.border}`, 
                            fontSize: 13,
                            background: C.surface,
                          }}
                        >
                          <option value="">Pilih Pemain 2</option>
                          {teamBPlayers.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <button
            onClick={handleSave}
            style={{
              padding: '12px',
              background: C.success,
              color: '#fff',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Simpan Perubahan
          </button>
          <button
            onClick={onCancel}
            style={{
              padding: '12px',
              background: C.bg,
              color: C.textSecondary,
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};

// Schedule Management Component
const ScheduleManagement: React.FC<{ notify: (type: string, msg: string) => void }> = ({ notify }) => {
  const matches = store.getMatches();
  const teams = store.getTeams();
  const matchdays = store.getMatchdays();
  const players = store.getPlayers();
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const handleDelete = async (matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    if (match && match.status === 'completed') {
      notify('error', 'Tidak dapat menghapus pertandingan yang sudah selesai');
      return;
    }
    if (confirm('Yakin ingin menghapus jadwal pertandingan ini?')) {
      try {
        await store.deleteMatch(matchId);
        notify('success', 'Jadwal berhasil dihapus');
      } catch (error) {
        notify('error', 'Gagal menghapus jadwal');
      }
    }
  };

  const handleEdit = (match: Match) => {
    setEditingMatch(match);
    setShowEditForm(true);
  };

  const handleUpdateMatch = async (updatedMatch: Match, lineups?: any[]) => {
    try {
      await store.updateMatch(updatedMatch);
      
      // Save lineups if provided
      if (lineups !== undefined) {
        await store.saveMatchLineups(updatedMatch.id, lineups);
      }
      
      notify('success', 'Jadwal dan susunan pemain berhasil diperbarui');
      setShowEditForm(false);
      setEditingMatch(null);
    } catch (error: any) {
      console.error('Error updating match:', error);
      notify('error', error.message || 'Gagal memperbarui jadwal');
    }
  };

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: 24, fontWeight: 700, color: C.textPrimary, margin: '0 0 24px', fontFamily: 'Montserrat, sans-serif' }}>
        Manajemen Jadwal
      </h2>

      {showEditForm && editingMatch && (
        <EditMatchModal 
          match={editingMatch} 
          teams={teams}
          matchdays={matchdays}
          players={players}
          onSave={handleUpdateMatch}
          onCancel={() => { setShowEditForm(false); setEditingMatch(null); }}
          notify={notify}
        />
      )}

      <div style={{ display: 'grid', gap: 16 }}>
        {matchdays.map(md => {
          const mdMatches = matches.filter(m => m.matchday_id === md.id);
          return (
            <div key={md.id} style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
              <div style={{
                padding: '12px 16px',
                background: C.bg,
                borderBottom: `1px solid ${C.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, margin: 0 }}>
                  {md.name} - {md.date}
                </h3>
              </div>
              <div style={{ padding: 16 }}>
                {mdMatches.length > 0 ? (
                  <div style={{ display: 'grid', gap: 8 }}>
                    {mdMatches.map(match => {
                      const teamA = teams.find(t => t.id === match.team_a_id);
                      const teamB = teams.find(t => t.id === match.team_b_id);
                      return (
                        <div key={match.id} style={{
                          padding: 12,
                          background: C.bg,
                          borderRadius: 8,
                          border: `1px solid ${C.border}`,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary, margin: 0 }}>
                              {teamA?.name} vs {teamB?.name}
                            </p>
                            <p style={{ fontSize: 11, color: C.textSecondary, margin: '4px 0 0' }}>
                              Court {match.court} • {match.start_time}
                            </p>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => handleEdit(match)}
                              style={{
                                padding: '6px 12px',
                                background: `${C.primary}15`,
                                color: C.primary,
                                borderRadius: 6,
                                fontSize: 11,
                                fontWeight: 500,
                                border: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              Edit
                            </button>
                            {match.status !== 'completed' && (
                              <button
                                onClick={() => handleDelete(match.id)}
                                style={{
                                  padding: '6px 12px',
                                  background: `${C.error}15`,
                                  color: C.error,
                                  borderRadius: 6,
                                  fontSize: 11,
                                  fontWeight: 500,
                                  border: 'none',
                                  cursor: 'pointer',
                                }}
                              >
                                Hapus
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ color: C.textSecondary, fontSize: 13, textAlign: 'center', padding: 12 }}>
                    Tidak ada pertandingan
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Generate Schedule Component
const GenerateSchedule: React.FC<{ notify: (type: string, msg: string) => void }> = ({ notify }) => {
  const allTeams = store.getTeams().filter(t => t.is_active);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>(allTeams.map(t => t.id));
  const [startDate, setStartDate] = useState('2025-02-01');
  const [courts, setCourts] = useState(2);
  const [preview, setPreview] = useState<any>(null);
  const [replaceExisting, setReplaceExisting] = useState(false);

  const selectedTeams = allTeams.filter(t => selectedTeamIds.includes(t.id));
  const n = selectedTeams.length;
  const expectedMatchdays = n % 2 === 1 ? n : n - 1;
  const expectedMatches = (n * (n - 1)) / 2;

  const handleToggleTeam = (teamId: string) => {
    setSelectedTeamIds(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
    setPreview(null); // Reset preview when teams change
  };

  const handleSelectAll = () => {
    setSelectedTeamIds(allTeams.map(t => t.id));
    setPreview(null);
  };

  const handleDeselectAll = () => {
    setSelectedTeamIds([]);
    setPreview(null);
  };

  const handlePreview = () => {
    if (selectedTeams.length < 2) {
      notify('error', 'Minimal 2 tim harus dipilih');
      return;
    }

    const result = store.previewSchedule(selectedTeams, startDate, courts);
    setPreview(result);
  };

  const handleReshuffle = () => {
    if (selectedTeams.length < 2) {
      notify('error', 'Minimal 2 tim harus dipilih');
      return;
    }

    const result = store.previewSchedule(selectedTeams, startDate, courts);
    setPreview(result);
    notify('success', 'Jadwal diacak ulang');
  };

  const handleSave = async () => {
    if (!preview || !preview.validation.valid) {
      notify('error', 'Jadwal tidak valid. Silakan generate ulang.');
      return;
    }

    const existingMatches = store.getMatches().filter(m => m.status !== 'completed');
    if (existingMatches.length > 0 && !replaceExisting) {
      notify('error', 'Sudah ada jadwal yang belum selesai. Centang opsi "Ganti jadwal yang belum dimainkan" atau batalkan.');
      return;
    }

    if (existingMatches.length > 0 && replaceExisting) {
      if (!confirm(`Akan mengganti ${existingMatches.length} pertandingan yang belum selesai. Lanjutkan?`)) {
        return;
      }
    }

    try {
      await store.generateSchedule(selectedTeams, startDate, courts, replaceExisting);
      notify('success', `Jadwal berhasil dibuat: ${expectedMatches} pertandingan dalam ${expectedMatchdays} matchday`);
      setPreview(null);
    } catch (error: any) {
      notify('error', error.message || 'Gagal membuat jadwal');
    }
  };

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: 24, fontWeight: 700, color: C.textPrimary, margin: '0 0 24px', fontFamily: 'Montserrat, sans-serif' }}>
        Generate Jadwal Otomatis
      </h2>

      {/* Team Selection */}
      <div style={{ background: C.surface, borderRadius: 12, padding: 24, border: `1px solid ${C.border}`, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary, margin: 0 }}>
            Pilih Tim Peserta
          </h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleSelectAll}
              style={{
                padding: '6px 12px',
                background: C.bg,
                color: C.textPrimary,
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 500,
                border: `1px solid ${C.border}`,
                cursor: 'pointer',
              }}
            >
              Pilih Semua
            </button>
            <button
              onClick={handleDeselectAll}
              style={{
                padding: '6px 12px',
                background: C.bg,
                color: C.textPrimary,
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 500,
                border: `1px solid ${C.border}`,
                cursor: 'pointer',
              }}
            >
              Batal Pilih
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
          {allTeams.map(team => (
            <label
              key={team.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px',
                background: selectedTeamIds.includes(team.id) ? `${C.primary}10` : C.bg,
                borderRadius: 8,
                border: `1px solid ${selectedTeamIds.includes(team.id) ? C.primary : C.border}`,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <input
                type="checkbox"
                checked={selectedTeamIds.includes(team.id)}
                onChange={() => handleToggleTeam(team.id)}
                style={{ width: 16, height: 16, cursor: 'pointer' }}
              />
              <span style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary }}>
                {team.name}
              </span>
            </label>
          ))}
        </div>

        {/* Summary */}
        <div style={{ 
          padding: 16, 
          background: C.bg, 
          borderRadius: 8,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 16,
        }}>
          <div>
            <p style={{ fontSize: 11, color: C.textSecondary, margin: '0 0 4px' }}>Tim Dipilih</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: C.primary, margin: 0 }}>{selectedTeams.length}</p>
          </div>
          <div>
            <p style={{ fontSize: 11, color: C.textSecondary, margin: '0 0 4px' }}>Jumlah Matchday</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: C.primary, margin: 0 }}>{expectedMatchdays}</p>
          </div>
          <div>
            <p style={{ fontSize: 11, color: C.textSecondary, margin: '0 0 4px' }}>Total Pertandingan</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: C.primary, margin: 0 }}>{expectedMatches}</p>
          </div>
          {n % 2 === 1 && (
            <div>
              <p style={{ fontSize: 11, color: C.textSecondary, margin: '0 0 4px' }}>Total Bye</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: C.warning, margin: 0 }}>{n}</p>
            </div>
          )}
        </div>
      </div>

      {/* Settings */}
      <div style={{ background: C.surface, borderRadius: 12, padding: 24, border: `1px solid ${C.border}`, marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary, margin: '0 0 16px' }}>
          Pengaturan Jadwal
        </h3>

        <div style={{ display: 'grid', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.textPrimary, marginBottom: 8 }}>
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={startDate}
              onChange={e => { setStartDate(e.target.value); setPreview(null); }}
              style={{ width: '100%', padding: '12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.textPrimary, marginBottom: 8 }}>
              Jumlah Court
            </label>
            <input
              type="number"
              min="1"
              max="4"
              value={courts}
              onChange={e => { setCourts(parseInt(e.target.value) || 2); setPreview(null); }}
              style={{ width: '100%', padding: '12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14 }}
            />
          </div>
        </div>

        <button
          onClick={handlePreview}
          disabled={selectedTeams.length < 2}
          style={{
            width: '100%',
            padding: '14px',
            background: selectedTeams.length < 2 ? C.border : C.primary,
            color: '#fff',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            border: 'none',
            cursor: selectedTeams.length < 2 ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          Generate Preview
        </button>
      </div>

      {/* Preview */}
      {preview && (
        <div className="fade-in" style={{ background: C.surface, borderRadius: 12, padding: 24, border: `1px solid ${C.border}`, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary, margin: 0 }}>
              Preview Jadwal
            </h3>
            <button
              onClick={handleReshuffle}
              style={{
                padding: '8px 16px',
                background: C.secondary,
                color: '#fff',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              🔄 Acak Ulang
            </button>
          </div>

          {/* Validation Status */}
          <div style={{
            padding: 12,
            background: preview.validation.valid ? `${C.success}15` : `${C.error}15`,
            borderRadius: 8,
            marginBottom: 16,
          }}>
            <p style={{ 
              fontSize: 13, 
              fontWeight: 600, 
              color: preview.validation.valid ? C.success : C.error,
              margin: 0,
            }}>
              {preview.validation.valid ? '✓ Jadwal Valid' : '✗ Jadwal Tidak Valid'}
            </p>
            {!preview.validation.valid && (
              <ul style={{ margin: '8px 0 0', paddingLeft: 20, fontSize: 12, color: C.error }}>
                {preview.validation.errors.map((error: string, idx: number) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Schedule Details */}
          <div style={{ maxHeight: 500, overflowY: 'auto' }}>
            {preview.schedule.map((matchday: any) => (
              <div key={matchday.matchday_number} style={{ marginBottom: 16 }}>
                <div style={{ 
                  padding: '10px 12px', 
                  background: C.bg, 
                  borderRadius: 8, 
                  marginBottom: 8,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, margin: 0 }}>
                    Matchday {matchday.matchday_number} - {matchday.date}
                  </h4>
                  {matchday.bye_team && (
                    <span style={{ 
                      padding: '4px 8px', 
                      background: `${C.warning}20`, 
                      color: C.warning,
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                    }}>
                      Bye: {matchday.bye_team.name}
                    </span>
                  )}
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {matchday.matches.map((match: any, idx: number) => (
                    <div key={idx} style={{
                      padding: '10px 12px',
                      background: C.surface,
                      borderRadius: 6,
                      border: `1px solid ${C.border}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary, margin: 0 }}>
                          {match.team_a_name} vs {match.team_b_name}
                        </p>
                        <p style={{ fontSize: 11, color: C.textSecondary, margin: '2px 0 0' }}>
                          {match.start_time} - {match.end_time}
                        </p>
                      </div>
                      <span style={{
                        padding: '4px 8px',
                        background: `${C.primary}15`,
                        color: C.primary,
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 600,
                      }}>
                        Court {match.court}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Save Button */}
          <div style={{ marginTop: 16 }}>
            {store.getMatches().filter(m => m.status !== 'completed').length > 0 && (
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8, 
                marginBottom: 12,
                cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={replaceExisting}
                  onChange={e => setReplaceExisting(e.target.checked)}
                  style={{ width: 16, height: 16 }}
                />
                <span style={{ fontSize: 12, color: C.textPrimary }}>
                  Ganti jadwal yang belum dimainkan
                </span>
              </label>
            )}
            <button
              onClick={handleSave}
              disabled={!preview.validation.valid}
              style={{
                width: '100%',
                padding: '14px',
                background: preview.validation.valid ? C.success : C.border,
                color: '#fff',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                border: 'none',
                cursor: preview.validation.valid ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
              }}
            >
              Simpan Jadwal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Standings Settings Component
const StandingsSettings: React.FC<{ notify: (type: string, msg: string) => void }> = ({ notify }) => {
  const league = store.getLeague();

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: 24, fontWeight: 700, color: C.textPrimary, margin: '0 0 24px', fontFamily: 'Montserrat, sans-serif' }}>
        Pengaturan Klasemen
      </h2>

      <div style={{ background: C.surface, borderRadius: 12, padding: 24, border: `1px solid ${C.border}` }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary, margin: '0 0 16px' }}>
          Sistem Perhitungan Klasemen
        </h3>
        <p style={{ fontSize: 13, color: C.textSecondary, margin: '0 0 20px', lineHeight: 1.6 }}>
          Klasemen dihitung berdasarkan <strong style={{ color: C.textPrimary }}>total poin dari semua partai pasangan</strong> dalam pertandingan beregu yang telah disahkan. Setiap partai memberikan poin sesuai jumlah game yang diperoleh.
        </p>

        <div style={{ background: C.bg, borderRadius: 8, padding: 16, marginBottom: 20 }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, margin: '0 0 12px' }}>
            Urutan Tie-break:
          </h4>
          <ol style={{ fontSize: 13, color: C.textSecondary, margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
            <li>Total Poin (DESC)</li>
            <li>Selisih Pasangan (DESC)</li>
            <li>Pasangan Menang (DESC)</li>
            <li>Head-to-Head (DESC)</li>
          </ol>
        </div>

        <button
          onClick={() => notify('success', 'Pengaturan klasemen disimpan')}
          style={{
            width: '100%',
            padding: '14px',
            background: C.primary,
            color: '#fff',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Simpan Pengaturan
        </button>
      </div>
    </div>
  );
};

// Reset League Component
const ResetLeague: React.FC<{ notify: (type: string, msg: string) => void }> = ({ notify }) => {
  const [confirmText, setConfirmText] = useState('');
  const [resetType, setResetType] = useState<'competition' | 'full'>('competition');

  const handleReset = async () => {
    if (confirmText !== 'RESET LIGA') {
      notify('error', 'Ketik "RESET LIGA" untuk konfirmasi');
      return;
    }

    try {
      if (resetType === 'competition') {
        await store.resetCompetitionData();
        notify('success', 'Data kompetisi berhasil direset');
      } else {
        await store.resetFullLeague();
        notify('success', 'Liga berhasil direset sepenuhnya');
      }
      setConfirmText('');
    } catch (error) {
      notify('error', 'Gagal mereset liga');
    }
  };

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: 24, fontWeight: 700, color: C.textPrimary, margin: '0 0 24px', fontFamily: 'Montserrat, sans-serif' }}>
        Reset Liga
      </h2>

      <div style={{ background: C.surface, borderRadius: 12, padding: 24, border: `2px solid ${C.error}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <span style={{ fontSize: 32 }}>⚠️</span>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: C.error, margin: 0 }}>Peringatan</h3>
            <p style={{ fontSize: 13, color: C.textSecondary, margin: '4px 0 0' }}>
              Fitur ini akan menghapus data liga. Gunakan dengan hati-hati.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
          <label style={{ display: 'flex', alignItems: 'start', gap: 12, cursor: 'pointer', padding: 16, background: C.bg, borderRadius: 8, border: `1px solid ${resetType === 'competition' ? C.primary : C.border}` }}>
            <input
              type="radio"
              checked={resetType === 'competition'}
              onChange={() => setResetType('competition')}
              style={{ marginTop: 2 }}
            />
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, margin: 0 }}>
                Reset Data Kompetisi
              </p>
              <p style={{ fontSize: 12, color: C.textSecondary, margin: '4px 0 0' }}>
                Hapus jadwal, hasil, statistik. Pertahankan tim, pemain, user.
              </p>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'start', gap: 12, cursor: 'pointer', padding: 16, background: C.bg, borderRadius: 8, border: `1px solid ${resetType === 'full' ? C.primary : C.border}` }}>
            <input
              type="radio"
              checked={resetType === 'full'}
              onChange={() => setResetType('full')}
              style={{ marginTop: 2 }}
            />
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, margin: 0 }}>
                Reset Liga Menyeluruh
              </p>
              <p style={{ fontSize: 12, color: C.textSecondary, margin: '4px 0 0' }}>
                Hapus semua data kecuali Super Admin.
              </p>
            </div>
          </label>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.error, marginBottom: 8 }}>
            Ketik "RESET LIGA" untuk konfirmasi:
          </label>
          <input
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 8,
              border: `2px solid ${C.error}`,
              fontSize: 14,
              fontWeight: 600,
            }}
            placeholder="RESET LIGA"
          />
        </div>

        <button
          onClick={handleReset}
          disabled={confirmText !== 'RESET LIGA'}
          style={{
            width: '100%',
            padding: '14px',
            background: confirmText === 'RESET LIGA' ? C.error : C.border,
            color: '#fff',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            border: 'none',
            cursor: confirmText === 'RESET LIGA' ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
          }}
        >
          Reset Liga
        </button>
      </div>
    </div>
  );
};

// General Settings Component
const GeneralSettings: React.FC<{ notify: (type: string, msg: string) => void }> = ({ notify }) => {
  const league = store.getLeague();
  const [name, setName] = useState(league.name);
  const [season, setSeason] = useState(league.season);
  const [desc, setDesc] = useState(league.description);
  const [logoUrl, setLogoUrl] = useState(league.logo_url);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        notify('error', 'Ukuran file maksimal 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      await store.saveLeague({ ...league, name, season, description: desc, logo_url: logoUrl });
      notify('success', 'Pengaturan umum disimpan');
    } catch (error) {
      notify('error', 'Gagal menyimpan pengaturan');
    }
  };

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: 24, fontWeight: 700, color: C.textPrimary, margin: '0 0 24px', fontFamily: 'Montserrat, sans-serif' }}>
        Pengaturan Umum
      </h2>

      <div style={{ background: C.surface, borderRadius: 12, padding: 24, border: `1px solid ${C.border}` }}>
        {/* Logo Liga Section */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textPrimary, marginBottom: 12 }}>
            Logo SOQ.COMM PADEL LEAGUE
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt="Logo Liga" 
                style={{ 
                  width: 100, 
                  height: 100, 
                  borderRadius: '50%', 
                  objectFit: 'cover',
                  border: `3px solid ${C.primary}`,
                }} 
              />
            ) : (
              <div style={{ 
                width: 100, 
                height: 100, 
                borderRadius: '50%', 
                background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: 36,
              }}>
                S
              </div>
            )}
            <div style={{ flex: 1 }}>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/png,image/jpeg,image/jpg,image/webp" 
                onChange={handleLogoSelect} 
                style={{ display: 'none' }} 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                style={{ 
                  padding: '10px 20px', 
                  background: C.primary, 
                  color: '#fff', 
                  borderRadius: 8, 
                  fontSize: 13, 
                  fontWeight: 600, 
                  border: 'none', 
                  cursor: 'pointer',
                  marginBottom: 8,
                  width: '100%',
                }}
              >
                {logoUrl ? 'Ganti Logo' : 'Pilih Logo'}
              </button>
              {logoUrl && (
                <button 
                  onClick={() => setLogoUrl('')}
                  style={{ 
                    padding: '10px 20px', 
                    background: `${C.error}15`, 
                    color: C.error, 
                    borderRadius: 8, 
                    fontSize: 13, 
                    fontWeight: 600, 
                    border: 'none', 
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  Hapus Logo
                </button>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.textPrimary, marginBottom: 8 }}>
              Nama Liga
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.textPrimary, marginBottom: 8 }}>
              Season
            </label>
            <input
              value={season}
              onChange={e => setSeason(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.textPrimary, marginBottom: 8 }}>
              Deskripsi
            </label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={4}
              style={{ width: '100%', padding: '12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, resize: 'vertical' }}
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          style={{
            width: '100%',
            padding: '14px',
            background: C.primary,
            color: '#fff',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Simpan Pengaturan
        </button>
      </div>
    </div>
  );
};

// MVP Matchday Management Component (4 slot per pertandingan)
const MVPMatchdayManagement: React.FC<{ notify: (type: string, msg: string) => void }> = ({ notify }) => {
  const matches = store.getMatches().filter(m => m.status === 'completed');
  const players = store.getPlayers().filter(p => p.is_active);
  const teams = store.getTeams();
  const matchdays = store.getMatchdays();
  const mvpsMatchday = store.getMVPsMatchday();
  const matchLineups = store.getMatchLineups();
  
  const [showForm, setShowForm] = useState(false);
  const [editingMvp, setEditingMvp] = useState<any>(null);
  const [selectedMatch, setSelectedMatch] = useState('');
  const [selectedParty, setSelectedParty] = useState(1);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [notes, setNotes] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  const getPlayer = (playerId: string) => players.find(p => p.id === playerId);
  const getTeam = (teamId: string) => teams.find(t => t.id === teamId);
  const getMatch = (matchId: string) => matches.find(m => m.id === matchId);
  const getMatchday = (matchdayId: string) => matchdays.find(md => md.id === matchdayId);

  // Get players from match lineup for selected match and party
  const getAvailablePlayers = () => {
    if (!selectedMatch) return [];
    
    const lineup = matchLineups.find(l => l.match_id === selectedMatch && l.party_number === selectedParty);
    if (!lineup) return [];

    const match = getMatch(selectedMatch);
    if (!match) return [];

    // Get players from both teams
    const teamAPlayers = [
      getPlayer(lineup.team_a_player1_id),
      getPlayer(lineup.team_a_player2_id)
    ].filter(p => p) as Player[];

    const teamBPlayers = [
      getPlayer(lineup.team_b_player1_id),
      getPlayer(lineup.team_b_player2_id)
    ].filter(p => p) as Player[];

    return [...teamAPlayers, ...teamBPlayers];
  };

  const handleSave = async () => {
    if (!selectedMatch || !selectedPlayer) {
      notify('error', 'Pertandingan dan pemain harus dipilih');
      return;
    }

    const match = getMatch(selectedMatch);
    if (!match) {
      notify('error', 'Pertandingan tidak valid');
      return;
    }

    try {
      if (editingMvp) {
        await store.updateMVPMatchday({ 
          ...editingMvp, 
          match_id: selectedMatch,
          matchday_id: match.matchday_id,
          party_number: selectedParty,
          player_id: selectedPlayer,
          notes,
          is_published: isPublished,
        });
        notify('success', 'MVP Matchday berhasil diperbarui');
      } else {
        await store.addMVPMatchday({ 
          season: store.getLeague().season,
          match_id: selectedMatch,
          matchday_id: match.matchday_id,
          party_number: selectedParty,
          player_id: selectedPlayer,
          notes,
          is_published: isPublished,
        });
        notify('success', 'MVP Matchday berhasil ditambahkan');
      }
      
      setShowForm(false);
      setEditingMvp(null);
      setSelectedMatch('');
      setSelectedParty(1);
      setSelectedPlayer('');
      setNotes('');
      setIsPublished(false);
    } catch (error: any) {
      console.error('Error saving MVP Matchday:', error);
      notify('error', error.message || 'Gagal menyimpan MVP Matchday');
    }
  };

  const handleEdit = (mvp: any) => {
    setEditingMvp(mvp);
    setSelectedMatch(mvp.match_id);
    setSelectedParty(mvp.party_number);
    setSelectedPlayer(mvp.player_id);
    setNotes(mvp.notes);
    setIsPublished(mvp.is_published);
    setShowForm(true);
  };

  const handleDelete = async (mvpId: string) => {
    if (confirm('Yakin ingin menghapus MVP Matchday ini?')) {
      try {
        await store.deleteMVPMatchday(mvpId);
        notify('success', 'MVP Matchday berhasil dihapus');
      } catch (error: any) {
        console.error('Error deleting MVP Matchday:', error);
        notify('error', error.message || 'Gagal menghapus MVP Matchday');
      }
    }
  };

  // Group MVPs by match
  const mvpsByMatch = matches.map(match => {
    const matchMvps = mvpsMatchday.filter(m => m.match_id === match.id);
    return { match, mvps: matchMvps };
  }).filter(item => item.mvps.length > 0);

  const availablePlayers = getAvailablePlayers();

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: C.textPrimary, margin: 0, fontFamily: 'Montserrat, sans-serif' }}>
          🏆 MVP Matchday
        </h2>
        <button 
          onClick={() => { setShowForm(true); setEditingMvp(null); setSelectedMatch(''); setSelectedParty(1); setSelectedPlayer(''); setNotes(''); setIsPublished(false); }} 
          style={{ 
            padding: '10px 20px', 
            background: C.primary, 
            color: '#fff', 
            borderRadius: 8, 
            fontSize: 13, 
            fontWeight: 600, 
            border: 'none', 
            cursor: 'pointer',
          }}
        >
          + Tambah MVP Matchday
        </button>
      </div>

      {showForm && (
        <div className="fade-in" style={{ background: C.surface, borderRadius: 12, padding: 24, border: `1px solid ${C.border}`, marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary, margin: '0 0 16px' }}>
            {editingMvp ? 'Edit MVP Matchday' : 'Tambah MVP Matchday Baru'}
          </h3>
          
          <div style={{ display: 'grid', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.textPrimary, marginBottom: 8 }}>Pertandingan</label>
              <select 
                value={selectedMatch} 
                onChange={e => { setSelectedMatch(e.target.value); setSelectedParty(1); setSelectedPlayer(''); }}
                style={{ width: '100%', padding: '12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14 }}
              >
                <option value="">Pilih pertandingan</option>
                {matches.map(match => {
                  const teamA = getTeam(match.team_a_id);
                  const teamB = getTeam(match.team_b_id);
                  const matchday = getMatchday(match.matchday_id);
                  return (
                    <option key={match.id} value={match.id}>
                      {matchday?.name} - {teamA?.name} vs {teamB?.name}
                    </option>
                  );
                })}
              </select>
            </div>

            {selectedMatch && (
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.textPrimary, marginBottom: 8 }}>Partai</label>
                <select 
                  value={selectedParty} 
                  onChange={e => { setSelectedParty(parseInt(e.target.value)); setSelectedPlayer(''); }}
                  style={{ width: '100%', padding: '12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14 }}
                >
                  <option value={1}>Partai 1</option>
                  <option value={2}>Partai 2</option>
                  <option value={3}>Partai 3</option>
                  <option value={4}>Partai 4</option>
                </select>
              </div>
            )}

            {selectedMatch && availablePlayers.length > 0 && (
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.textPrimary, marginBottom: 8 }}>Pemain MVP</label>
                <select 
                  value={selectedPlayer} 
                  onChange={e => setSelectedPlayer(e.target.value)} 
                  style={{ width: '100%', padding: '12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14 }}
                >
                  <option value="">Pilih pemain</option>
                  {availablePlayers.map(player => {
                    const team = getTeam(player.team_id);
                    return (
                      <option key={player.id} value={player.id}>
                        {player.name} ({team?.name})
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {selectedMatch && availablePlayers.length === 0 && (
              <div style={{ padding: 16, background: `${C.warning}15`, borderRadius: 8, border: `1px solid ${C.warning}30` }}>
                <p style={{ fontSize: 13, color: C.warning, margin: 0, fontWeight: 600 }}>
                  ⚠️ Susunan pemain untuk partai ini belum diatur
                </p>
                <p style={{ fontSize: 12, color: C.textSecondary, margin: '8px 0 0' }}>
                  Silakan atur susunan pemain di menu Manajemen Jadwal terlebih dahulu
                </p>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.textPrimary, marginBottom: 8 }}>Catatan Penilaian (Opsional)</label>
              <textarea 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
                rows={3}
                style={{ width: '100%', padding: '12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, resize: 'vertical' }} 
                placeholder="Catatan penilaian panitia..."
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={isPublished}
                  onChange={e => setIsPublished(e.target.checked)}
                  style={{ width: 18, height: 18, cursor: 'pointer' }}
                />
                <span style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary }}>
                  Publikasikan MVP (tampilkan di situs publik)
                </span>
              </label>
            </div>
          </div>

          {/* Preview */}
          {selectedPlayer && (
            <div style={{ 
              padding: 16, 
              background: C.bg, 
              borderRadius: 8, 
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}>
              {(() => {
                const player = getPlayer(selectedPlayer);
                if (!player) return null;
                const team = getTeam(player.team_id);
                return (
                  <>
                    {player.photo_url ? (
                      <img 
                        src={player.photo_url} 
                        alt={player.name} 
                        style={{ 
                          width: 80, 
                          height: 80, 
                          borderRadius: '50%', 
                          objectFit: 'cover',
                          border: `3px solid ${C.accent}`,
                        }} 
                      />
                    ) : (
                      <div style={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 32,
                        border: `3px solid ${C.accent}`,
                      }}>
                        {player.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary, margin: 0 }}>
                        {player.name}
                      </p>
                      {team && (
                        <p style={{ fontSize: 13, color: C.textSecondary, margin: '4px 0 0' }}>
                          {team.name}
                        </p>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <button onClick={handleSave} style={{ padding: '12px', background: C.success, color: '#fff', borderRadius: 8, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}>Simpan</button>
            <button onClick={() => { setShowForm(false); setEditingMvp(null); }} style={{ padding: '12px', background: C.bg, color: C.textSecondary, borderRadius: 8, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}>Batal</button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: 16 }}>
        {mvpsByMatch.map(({ match, mvps }) => {
          const teamA = getTeam(match.team_a_id);
          const teamB = getTeam(match.team_b_id);
          const matchday = getMatchday(match.matchday_id);

          return (
            <div key={match.id} style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, margin: 0 }}>
                  {matchday?.name} - {teamA?.name} vs {teamB?.name}
                </h3>
                <p style={{ fontSize: 12, color: C.textSecondary, margin: '4px 0 0' }}>
                  {matchday?.date} • Court {match.court}
                </p>
              </div>
              <div style={{ padding: 16 }}>
                {[1, 2, 3, 4].map(party => {
                  const mvp = mvps.find(m => m.party_number === party);
                  const player = mvp ? getPlayer(mvp.player_id) : null;
                  const team = player ? getTeam(player.team_id) : null;

                  return (
                    <div key={party} style={{ 
                      padding: 12, 
                      background: mvp ? `${C.accent}10` : C.bg, 
                      borderRadius: 8, 
                      marginBottom: 8,
                      border: mvp ? `1px solid ${C.accent}30` : `1px solid ${C.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: C.primaryDark, minWidth: 70 }}>
                          Partai {party}:
                        </span>
                        {mvp && player ? (
                          <>
                            {player.photo_url ? (
                              <img src={player.photo_url} alt={player.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: 40, height: 40, borderRadius: '50%', background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
                                {player.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <p style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, margin: 0 }}>
                                🏆 {player.name}
                              </p>
                              <p style={{ fontSize: 11, color: C.textSecondary, margin: '2px 0 0' }}>
                                {team?.name} {mvp.is_published ? '• 🟢 Published' : '• ⚪ Draft'}
                              </p>
                            </div>
                          </>
                        ) : (
                          <span style={{ fontSize: 12, color: C.textSecondary, fontStyle: 'italic' }}>
                            Belum ada MVP
                          </span>
                        )}
                      </div>
                      {mvp && (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => handleEdit(mvp)} style={{ padding: '6px 12px', fontSize: 11, color: C.primary, background: `${C.primary}15`, borderRadius: 6, border: 'none', cursor: 'pointer' }}>Edit</button>
                          <button onClick={() => handleDelete(mvp.id)} style={{ padding: '6px 12px', fontSize: 11, color: C.error, background: `${C.error}15`, borderRadius: 6, border: 'none', cursor: 'pointer' }}>Hapus</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {mvpsByMatch.length === 0 && !showForm && (
        <div style={{ 
          textAlign: 'center', 
          padding: 60,
          background: C.surface,
          borderRadius: 12,
          border: `1px solid ${C.border}`,
        }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🏆</div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: C.textPrimary, margin: '0 0 8px' }}>
            Belum Ada MVP Matchday
          </h3>
          <p style={{ fontSize: 13, color: C.textSecondary, margin: 0 }}>
            Klik tombol "Tambah MVP Matchday" untuk memilih pemain terbaik setiap partai
          </p>
        </div>
      )}
    </div>
  );
};

// MVP Liga Management Component
const MVPLigaManagement: React.FC<{ notify: (type: string, msg: string) => void }> = ({ notify }) => {
  const players = store.getPlayers().filter(p => p.is_active);
  const teams = store.getTeams();
  const league = store.getLeague();
  const mvpsLiga = store.getMVPsLiga();
  
  const [showForm, setShowForm] = useState(false);
  const [editingMvp, setEditingMvp] = useState<any>(null);
  const [selectedSeason, setSelectedSeason] = useState(league.season);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [notes, setNotes] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  const getPlayer = (playerId: string) => players.find(p => p.id === playerId);
  const getTeam = (teamId: string) => teams.find(t => t.id === teamId);

  const handleSave = async () => {
    if (!selectedSeason || !selectedPlayer) {
      notify('error', 'Musim dan pemain harus dipilih');
      return;
    }

    try {
      if (editingMvp) {
        await store.updateMVPLiga({ 
          ...editingMvp, 
          season: selectedSeason,
          player_id: selectedPlayer,
          notes,
          is_published: isPublished,
        });
        notify('success', 'MVP Liga berhasil diperbarui');
      } else {
        await store.addMVPLiga({ 
          season: selectedSeason,
          player_id: selectedPlayer,
          notes,
          is_published: isPublished,
        });
        notify('success', 'MVP Liga berhasil ditambahkan');
      }
      
      setShowForm(false);
      setEditingMvp(null);
      setSelectedSeason(league.season);
      setSelectedPlayer('');
      setNotes('');
      setIsPublished(false);
    } catch (error: any) {
      console.error('Error saving MVP Liga:', error);
      notify('error', error.message || 'Gagal menyimpan MVP Liga');
    }
  };

  const handleEdit = (mvp: any) => {
    setEditingMvp(mvp);
    setSelectedSeason(mvp.season);
    setSelectedPlayer(mvp.player_id);
    setNotes(mvp.notes);
    setIsPublished(mvp.is_published);
    setShowForm(true);
  };

  const handleDelete = async (mvpId: string) => {
    if (confirm('Yakin ingin menghapus MVP Liga ini?')) {
      try {
        await store.deleteMVPLiga(mvpId);
        notify('success', 'MVP Liga berhasil dihapus');
      } catch (error: any) {
        console.error('Error deleting MVP Liga:', error);
        notify('error', error.message || 'Gagal menghapus MVP Liga');
      }
    }
  };

  // Group MVPs by season
  const mvpsBySeason = mvpsLiga.reduce((acc, mvp) => {
    if (!acc[mvp.season]) acc[mvp.season] = [];
    acc[mvp.season].push(mvp);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: C.textPrimary, margin: 0, fontFamily: 'Montserrat, sans-serif' }}>
          🏅 MVP Liga
        </h2>
        <button 
          onClick={() => { setShowForm(true); setEditingMvp(null); setSelectedSeason(league.season); setSelectedPlayer(''); setNotes(''); setIsPublished(false); }} 
          style={{ 
            padding: '10px 20px', 
            background: C.primary, 
            color: '#fff', 
            borderRadius: 8, 
            fontSize: 13, 
            fontWeight: 600, 
            border: 'none', 
            cursor: 'pointer',
          }}
        >
          + Tetapkan MVP Liga
        </button>
      </div>

      {showForm && (
        <div className="fade-in" style={{ background: C.surface, borderRadius: 12, padding: 24, border: `1px solid ${C.border}`, marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary, margin: '0 0 16px' }}>
            {editingMvp ? 'Edit MVP Liga' : 'Tetapkan MVP Liga Baru'}
          </h3>
          
          <div style={{ display: 'grid', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.textPrimary, marginBottom: 8 }}>Musim Liga</label>
              <input 
                type="text"
                value={selectedSeason} 
                onChange={e => setSelectedSeason(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14 }}
                placeholder="Contoh: 2025"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.textPrimary, marginBottom: 8 }}>Pemain MVP</label>
              <select 
                value={selectedPlayer} 
                onChange={e => setSelectedPlayer(e.target.value)} 
                style={{ width: '100%', padding: '12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14 }}
              >
                <option value="">Pilih pemain</option>
                {players.map(player => {
                  const team = getTeam(player.team_id);
                  return (
                    <option key={player.id} value={player.id}>
                      {player.name} ({team?.name})
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.textPrimary, marginBottom: 8 }}>Catatan Penilaian</label>
              <textarea 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
                rows={4}
                style={{ width: '100%', padding: '12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, resize: 'vertical' }} 
                placeholder="Alasan pemilihan MVP Liga..."
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={isPublished}
                  onChange={e => setIsPublished(e.target.checked)}
                  style={{ width: 18, height: 18, cursor: 'pointer' }}
                />
                <span style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary }}>
                  Publikasikan MVP Liga (tampilkan di situs publik)
                </span>
              </label>
            </div>
          </div>

          {/* Preview */}
          {selectedPlayer && (
            <div style={{ 
              padding: 16, 
              background: C.bg, 
              borderRadius: 8, 
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}>
              {(() => {
                const player = getPlayer(selectedPlayer);
                if (!player) return null;
                const team = getTeam(player.team_id);
                return (
                  <>
                    {player.photo_url ? (
                      <img 
                        src={player.photo_url} 
                        alt={player.name} 
                        style={{ 
                          width: 80, 
                          height: 80, 
                          borderRadius: '50%', 
                          objectFit: 'cover',
                          border: `3px solid ${C.accent}`,
                        }} 
                      />
                    ) : (
                      <div style={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 32,
                        border: `3px solid ${C.accent}`,
                      }}>
                        {player.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary, margin: 0 }}>
                        {player.name}
                      </p>
                      {team && (
                        <p style={{ fontSize: 13, color: C.textSecondary, margin: '4px 0 0' }}>
                          {team.name}
                        </p>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <button onClick={handleSave} style={{ padding: '12px', background: C.success, color: '#fff', borderRadius: 8, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}>Simpan</button>
            <button onClick={() => { setShowForm(false); setEditingMvp(null); }} style={{ padding: '12px', background: C.bg, color: C.textSecondary, borderRadius: 8, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}>Batal</button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: 16 }}>
        {Object.entries(mvpsBySeason).map(([season, seasonMvps]) => (
          <div key={season} style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', background: C.bg, borderBottom: `1px solid ${C.border}` }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, margin: 0 }}>
                Musim {season}
              </h3>
            </div>
            <div style={{ padding: 16 }}>
              {seasonMvps.map(mvp => {
                const player = getPlayer(mvp.player_id);
                const team = player ? getTeam(player.team_id) : null;

                return (
                  <div key={mvp.id} style={{ 
                    padding: 16, 
                    background: `${C.accent}10`, 
                    borderRadius: 8, 
                    border: `1px solid ${C.accent}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      {player?.photo_url ? (
                        <img src={player.photo_url} alt={player.name} style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${C.accent}` }} />
                      ) : (
                        <div style={{ width: 60, height: 60, borderRadius: '50%', background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 24, border: `3px solid ${C.accent}` }}>
                          {player?.name.charAt(0) || '?'}
                        </div>
                      )}
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, margin: 0 }}>
                          🏅 {player?.name || 'Unknown Player'}
                        </p>
                        {team && (
                          <p style={{ fontSize: 12, color: C.textSecondary, margin: '4px 0 0' }}>
                            {team.name}
                          </p>
                        )}
                        <p style={{ fontSize: 11, color: C.textSecondary, margin: '2px 0 0' }}>
                          {mvp.is_published ? '🟢 Published' : '⚪ Draft'}
                        </p>
                        {mvp.notes && (
                          <p style={{ fontSize: 11, color: C.textSecondary, margin: '4px 0 0', fontStyle: 'italic' }}>
                            "{mvp.notes}"
                          </p>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handleEdit(mvp)} style={{ padding: '8px 16px', fontSize: 12, color: C.primary, background: `${C.primary}15`, borderRadius: 6, border: 'none', cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => handleDelete(mvp.id)} style={{ padding: '8px 16px', fontSize: 12, color: C.error, background: `${C.error}15`, borderRadius: 6, border: 'none', cursor: 'pointer' }}>Hapus</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {Object.keys(mvpsBySeason).length === 0 && !showForm && (
        <div style={{ 
          textAlign: 'center', 
          padding: 60,
          background: C.surface,
          borderRadius: 12,
          border: `1px solid ${C.border}`,
        }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🏅</div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: C.textPrimary, margin: '0 0 8px' }}>
            Belum Ada MVP Liga
          </h3>
          <p style={{ fontSize: 13, color: C.textSecondary, margin: 0 }}>
            Klik tombol "Tetapkan MVP Liga" untuk memilih pemain terbaik musim ini
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
