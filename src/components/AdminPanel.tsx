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
    { id: 'mvp-management', label: 'Manajemen Player MVP', icon: '🏆', roles: ['super_admin', 'admin'] },
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
          {activeMenu === 'mvp-management' && <MVPManagement notify={notify} />}
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
  const [selectedMatch, setSelectedMatch] = useState<string>('');
  const [scores, setScores] = useState([
    { a: 0, b: 0 },
    { a: 0, b: 0 },
    { a: 0, b: 0 },
    { a: 0, b: 0 },
  ]);

  const availableMatches = matches.filter(m => m.status === 'upcoming' || m.status === 'ongoing');
  const match = matches.find(m => m.id === selectedMatch);

  const handleSave = async (draft: boolean) => {
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

    try {
      await store.saveMatchResult(match.id, results);
      notify('success', draft ? 'Draft disimpan' : 'Hasil disahkan!');
      setSelectedMatch('');
      setScores([{ a: 0, b: 0 }, { a: 0, b: 0 }, { a: 0, b: 0 }, { a: 0, b: 0 }]);
    } catch (error) {
      notify('error', 'Gagal menyimpan hasil');
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
          <h3 style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary, margin: '0 0 20px', textAlign: 'center' }}>
            {teams.find(t => t.id === match.team_a_id)?.name} vs {teams.find(t => t.id === match.team_b_id)?.name}
          </h3>

          <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
            {scores.map((s, idx) => (
              <div key={idx} style={{
                display: 'grid',
                gridTemplateColumns: '100px 1fr 80px 80px 1fr 100px',
                gap: 12,
                alignItems: 'center',
                padding: 16,
                background: C.bg,
                borderRadius: 8,
                border: `1px solid ${C.border}`,
              }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.primaryDark }}>
                  Partai {idx + 1}
                </span>
                <span style={{ fontSize: 13, color: C.textSecondary }}>
                  Pasangan A{idx + 1}
                </span>
                <input
                  type="number"
                  min="0"
                  max="7"
                  value={s.a}
                  onChange={e => {
                    const newScores = [...scores];
                    newScores[idx] = { ...newScores[idx], a: parseInt(e.target.value) || 0 };
                    setScores(newScores);
                  }}
                  style={{
                    padding: '8px',
                    borderRadius: 6,
                    border: `1px solid ${C.border}`,
                    fontSize: 16,
                    fontWeight: 700,
                    textAlign: 'center',
                  }}
                />
                <input
                  type="number"
                  min="0"
                  max="7"
                  value={s.b}
                  onChange={e => {
                    const newScores = [...scores];
                    newScores[idx] = { ...newScores[idx], b: parseInt(e.target.value) || 0 };
                    setScores(newScores);
                  }}
                  style={{
                    padding: '8px',
                    borderRadius: 6,
                    border: `1px solid ${C.border}`,
                    fontSize: 16,
                    fontWeight: 700,
                    textAlign: 'center',
                  }}
                />
                <span style={{ fontSize: 13, color: C.textSecondary, textAlign: 'right' }}>
                  Pasangan B{idx + 1}
                </span>
                <span style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: s.a > s.b ? C.success : s.b > s.a ? C.error : C.textSecondary,
                  textAlign: 'right',
                }}>
                  {s.a > s.b ? 'A Menang' : s.b > s.a ? 'B Menang' : 'Seri'}
                </span>
              </div>
            ))}
          </div>

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

  const completedMatches = matches.filter(m => m.status === 'completed');

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

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: 24, fontWeight: 700, color: C.textPrimary, margin: '0 0 24px', fontFamily: 'Montserrat, sans-serif' }}>
        Manajemen Skor
      </h2>

      <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
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
            {completedMatches.map(match => {
              const teamA = teams.find(t => t.id === match.team_a_id);
              const teamB = teams.find(t => t.id === match.team_b_id);
              const results = pairResults.filter(r => r.match_id === match.id);
              const aPoints = results.reduce((sum, r) => sum + r.score_team_a, 0);
              const bPoints = results.reduce((sum, r) => sum + r.score_team_b, 0);

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
                      background: `${C.success}15`,
                      color: C.success,
                      borderRadius: 12,
                      fontSize: 11,
                      fontWeight: 600,
                    }}>
                      Selesai
                    </span>
                  </td>
                  <td style={{ padding: 12, textAlign: 'center' }}>
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
        await store.updatePlayer({ ...editingPlayer, name, team_id: teamId, photo_url: photoUrl });
        notify('success', 'Pemain berhasil diperbarui');
      } else {
        await store.addPlayer({ name, team_id: teamId, photo_url: photoUrl, is_active: true });
        notify('success', 'Pemain baru berhasil ditambahkan');
      }
      setPlayers(store.getPlayers());
      setShowForm(false);
      setEditingPlayer(null);
      setName('');
      setTeamId('');
      setPhotoUrl('');
    } catch (error) {
      notify('error', 'Gagal menyimpan pemain');
    }
  };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setName(player.name);
    setTeamId(player.team_id);
    setPhotoUrl(player.photo_url);
    setShowForm(true);
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
          onClick={() => { setShowForm(true); setEditingPlayer(null); setName(''); setTeamId(''); setPhotoUrl(''); }}
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
                <p style={{ fontSize: 12, color: C.textSecondary, margin: '4px 0 0' }}>{team?.name || 'Tidak ada tim'}</p>
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
  onSave: (match: Match) => void;
  onCancel: () => void;
  notify: (type: string, msg: string) => void;
}> = ({ match, teams, matchdays, onSave, onCancel, notify }) => {
  const [matchdayId, setMatchdayId] = useState(match.matchday_id);
  const [teamAId, setTeamAId] = useState(match.team_a_id);
  const [teamBId, setTeamBId] = useState(match.team_b_id);
  const [court, setCourt] = useState(match.court);
  const [startTime, setStartTime] = useState(match.start_time);
  const [endTime, setEndTime] = useState(match.end_time);
  const [status, setStatus] = useState(match.status);

  const handleSave = () => {
    if (teamAId === teamBId) {
      notify('error', 'Tim A dan Tim B tidak boleh sama');
      return;
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

    onSave(updatedMatch);
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

  const handleUpdateMatch = async (updatedMatch: Match) => {
    try {
      await store.updateMatch(updatedMatch);
      notify('success', 'Jadwal berhasil diperbarui');
      setShowEditForm(false);
      setEditingMatch(null);
    } catch (error) {
      notify('error', 'Gagal memperbarui jadwal');
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
  const teams = store.getTeams().filter(t => t.is_active);
  const [startDate, setStartDate] = useState('2025-02-01');
  const [courts, setCourts] = useState(2);

  const handleGenerate = async () => {
    if (teams.length < 2) {
      notify('error', 'Minimal 2 tim aktif diperlukan');
      return;
    }

    if (confirm(`Akan membuat jadwal untuk ${teams.length} tim. Lanjutkan?`)) {
      try {
        await store.generateSchedule(teams, startDate, courts, false);
        notify('success', 'Jadwal berhasil dibuat');
      } catch (error) {
        notify('error', 'Gagal membuat jadwal');
      }
    }
  };

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: 24, fontWeight: 700, color: C.textPrimary, margin: '0 0 24px', fontFamily: 'Montserrat, sans-serif' }}>
        Generate Jadwal Otomatis
      </h2>

      <div style={{ background: C.surface, borderRadius: 12, padding: 24, border: `1px solid ${C.border}` }}>
        <p style={{ fontSize: 13, color: C.textSecondary, margin: '0 0 20px', lineHeight: 1.6 }}>
          Membuat jadwal round-robin otomatis untuk {teams.length} tim aktif. Setiap tim akan bertemu satu sama lain tepat satu kali.
        </p>

        <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.textPrimary, marginBottom: 8 }}>
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
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
              onChange={e => setCourts(parseInt(e.target.value) || 2)}
              style={{ width: '100%', padding: '12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14 }}
            />
          </div>
        </div>

        <button
          onClick={handleGenerate}
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
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          Generate Jadwal
        </button>
      </div>
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

// MVP Management Component
const MVPManagement: React.FC<{ notify: (type: string, msg: string) => void }> = ({ notify }) => {
  const matchdays = store.getMatchdays().filter(md => md.status === 'completed');
  const players = store.getPlayers().filter(p => p.is_active);
  const teams = store.getTeams();
  const mvps = store.getMVPs();
  
  const [showForm, setShowForm] = useState(false);
  const [editingMvp, setEditingMvp] = useState<MVP | null>(null);
  const [selectedMatchday, setSelectedMatchday] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [reason, setReason] = useState('');

  const getPlayer = (playerId: string) => players.find(p => p.id === playerId);
  const getTeam = (teamId: string) => teams.find(t => t.id === teamId);
  const getMatchday = (matchdayId: string) => matchdays.find(md => md.id === matchdayId);

  const handleSave = async () => {
    if (!selectedMatchday || !selectedPlayer) {
      notify('error', 'Matchday dan pemain harus dipilih');
      return;
    }

    // Check if MVP already exists for this matchday
    const existingMvp = mvps.find(m => m.matchday_id === selectedMatchday);
    
    try {
      if (editingMvp) {
        await store.updateMVP({ 
          ...editingMvp, 
          matchday_id: selectedMatchday, 
          player_id: selectedPlayer, 
          reason 
        });
        notify('success', 'MVP berhasil diperbarui');
      } else {
        if (existingMvp) {
          notify('error', 'MVP untuk matchday ini sudah ada. Silakan edit yang existing.');
          return;
        }
        await store.addMVP({ 
          matchday_id: selectedMatchday, 
          player_id: selectedPlayer, 
          reason 
        });
        notify('success', 'MVP berhasil ditambahkan');
      }
      
      setShowForm(false);
      setEditingMvp(null);
      setSelectedMatchday('');
      setSelectedPlayer('');
      setReason('');
    } catch (error) {
      console.error('Error saving MVP:', error);
      notify('error', 'Gagal menyimpan MVP. Silakan coba lagi.');
    }
  };

  const handleEdit = (mvp: MVP) => {
    setEditingMvp(mvp);
    setSelectedMatchday(mvp.matchday_id);
    setSelectedPlayer(mvp.player_id);
    setReason(mvp.reason);
    setShowForm(true);
  };

  const handleDelete = async (mvpId: string) => {
    if (confirm('Yakin ingin menghapus MVP ini?')) {
      try {
        await store.deleteMVP(mvpId);
        notify('success', 'MVP berhasil dihapus');
      } catch (error) {
        console.error('Error deleting MVP:', error);
        notify('error', 'Gagal menghapus MVP. Silakan coba lagi.');
      }
    }
  };

  // Get matchdays that don't have MVP yet
  const availableMatchdays = matchdays.filter(md => !mvps.some(m => m.matchday_id === md.id));

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: C.textPrimary, margin: 0, fontFamily: 'Montserrat, sans-serif' }}>
          Manajemen Player MVP
        </h2>
        <button 
          onClick={() => { setShowForm(true); setEditingMvp(null); setSelectedMatchday(''); setSelectedPlayer(''); setReason(''); }} 
          disabled={availableMatchdays.length === 0}
          style={{ 
            padding: '10px 20px', 
            background: availableMatchdays.length === 0 ? C.border : C.primary, 
            color: '#fff', 
            borderRadius: 8, 
            fontSize: 13, 
            fontWeight: 600, 
            border: 'none', 
            cursor: availableMatchdays.length === 0 ? 'not-allowed' : 'pointer',
            opacity: availableMatchdays.length === 0 ? 0.5 : 1,
          }}
        >
          + Tambah Player MVP
        </button>
      </div>

      {availableMatchdays.length === 0 && !showForm && (
        <div style={{ 
          padding: 16, 
          background: `${C.accent}15`, 
          borderRadius: 8, 
          marginBottom: 24,
          fontSize: 13,
          color: C.textSecondary,
        }}>
          ✅ Semua matchday yang sudah selesai sudah memiliki MVP
        </div>
      )}

      {showForm && (
        <div className="fade-in" style={{ background: C.surface, borderRadius: 12, padding: 24, border: `1px solid ${C.border}`, marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary, margin: '0 0 16px' }}>
            {editingMvp ? 'Edit Player MVP' : 'Tambah Player MVP Baru'}
          </h3>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.textPrimary, marginBottom: 8 }}>Matchday</label>
            <select 
              value={selectedMatchday} 
              onChange={e => setSelectedMatchday(e.target.value)} 
              style={{ width: '100%', padding: '12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14 }}
            >
              <option value="">Pilih matchday</option>
              {(editingMvp ? matchdays : availableMatchdays).map(md => (
                <option key={md.id} value={md.id}>Matchday {md.matchday_number} - {md.date}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.textPrimary, marginBottom: 8 }}>Pemain</label>
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
                    {player.name} {team ? `(${team.name})` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.textPrimary, marginBottom: 8 }}>Alasan (Opsional)</label>
            <textarea 
              value={reason} 
              onChange={e => setReason(e.target.value)} 
              rows={3}
              style={{ width: '100%', padding: '12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, resize: 'vertical' }} 
              placeholder="Alasan pemilihan MVP..."
            />
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

      <div style={{ display: 'grid', gap: 12 }}>
        {mvps.map(mvp => {
          const player = getPlayer(mvp.player_id);
          const matchday = getMatchday(mvp.matchday_id);
          const team = player ? getTeam(player.team_id) : null;

          return (
            <div key={mvp.id} style={{ 
              background: C.surface, 
              borderRadius: 12, 
              padding: 16, 
              border: `2px solid ${C.accent}`, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 16,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateX(4px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(168, 216, 46, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              {player?.photo_url ? (
                <img 
                  src={player.photo_url} 
                  alt={player.name} 
                  style={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%', 
                    objectFit: 'cover',
                    border: `3px solid ${C.accent}`,
                  }} 
                />
              ) : (
                <div style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 24,
                  border: `3px solid ${C.accent}`,
                }}>
                  {player?.name.charAt(0) || '?'}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, margin: 0 }}>
                  🏆 {player?.name || 'Unknown Player'}
                </p>
                <p style={{ fontSize: 12, color: C.textSecondary, margin: '4px 0 0' }}>
                  Matchday {matchday?.matchday_number} • {matchday?.date}
                </p>
                {team && (
                  <p style={{ fontSize: 12, color: C.textSecondary, margin: '2px 0 0' }}>
                    {team.name}
                  </p>
                )}
                {mvp.reason && (
                  <p style={{ fontSize: 11, color: C.textSecondary, margin: '4px 0 0', fontStyle: 'italic' }}>
                    "{mvp.reason}"
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => handleEdit(mvp)} style={{ padding: '8px 16px', fontSize: 12, color: C.primary, background: `${C.primary}15`, borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 500 }}>Edit</button>
                <button onClick={() => handleDelete(mvp.id)} style={{ padding: '8px 16px', fontSize: 12, color: C.error, background: `${C.error}15`, borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 500 }}>Hapus</button>
              </div>
            </div>
          );
        })}
      </div>

      {mvps.length === 0 && !showForm && (
        <div style={{ 
          textAlign: 'center', 
          padding: 60,
          background: C.surface,
          borderRadius: 12,
          border: `1px solid ${C.border}`,
        }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🏆</div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: C.textPrimary, margin: '0 0 8px' }}>
            Belum Ada MVP
          </h3>
          <p style={{ fontSize: 13, color: C.textSecondary, margin: 0 }}>
            Klik tombol "Tambah Player MVP" untuk memilih pemain terbaik setiap matchday
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
