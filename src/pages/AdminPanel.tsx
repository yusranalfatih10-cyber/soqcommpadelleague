import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Settings, Users, Calendar, Edit3, Trophy, BarChart3, LogOut, ArrowLeft, Plus, Trash2, Save, X, CheckCircle, AlertCircle } from 'lucide-react';
import { store } from '../store';
import { AdminPage, Team, Match, Matchday, PairMatchResult } from '../types';
import { Logo } from '../Layout';

interface AdminPanelProps {
  onExit: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onExit }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(store.isAdminLoggedIn());
  const [currentPage, setCurrentPage] = useState<AdminPage>('dashboard');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [, setRefresh] = useState(0);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (store.loginAdmin(username, password)) {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Username atau password salah');
    }
  };

  const handleLogout = () => {
    store.logoutAdmin();
    setIsLoggedIn(false);
    onExit();
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setRefresh(r => r + 1);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F5FBFC] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo size="lg" />
            </div>
            <h1 className="text-xl font-bold text-[#173D4A] font-[Montserrat]">Admin Login</h1>
            <p className="text-sm text-[#718792] mt-1">Masuk untuk mengelola liga</p>
          </div>
          <form onSubmit={handleLogin} className="bg-white rounded-xl p-6 shadow-sm border border-[#DCECEF]">
            {loginError && (
              <div className="flex items-center gap-2 p-3 bg-[#E65C5C]/10 rounded-lg mb-4">
                <AlertCircle size={16} className="text-[#E65C5C]" />
                <span className="text-sm text-[#E65C5C]">{loginError}</span>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#173D4A] mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#DCECEF] text-sm focus:outline-none focus:border-[#16B9C0] focus:ring-1 focus:ring-[#16B9C0]"
                  placeholder="Masukkan username"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#173D4A] mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#DCECEF] text-sm focus:outline-none focus:border-[#16B9C0] focus:ring-1 focus:ring-[#16B9C0]"
                  placeholder="Masukkan password"
                  required
                />
              </div>
              <button type="submit" className="w-full py-2.5 bg-[#16B9C0] text-white rounded-lg font-semibold text-sm hover:bg-[#0fa8ae] transition-colors">
                Login
              </button>
            </div>
            <button type="button" onClick={onExit} className="w-full mt-3 py-2.5 text-[#718792] text-sm font-medium hover:text-[#173D4A] transition-colors">
              ← Kembali ke halaman utama
            </button>
          </form>
          <p className="text-center text-xs text-[#718792] mt-4">Default: admin / padel2025</p>
        </div>
      </div>
    );
  }

  const menuItems: { page: AdminPage; label: string; icon: React.ReactNode }[] = [
    { page: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { page: 'teams', label: 'Manajemen Tim', icon: <Users size={18} /> },
    { page: 'schedule', label: 'Jadwal', icon: <Calendar size={18} /> },
    { page: 'input-score', label: 'Input Skor', icon: <Edit3 size={18} /> },
    { page: 'standings', label: 'Klasemen', icon: <Trophy size={18} /> },
    { page: 'statistics', label: 'Statistik', icon: <BarChart3 size={18} /> },
    { page: 'settings', label: 'Pengaturan', icon: <Settings size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#F5FBFC]">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg animate-fade-in ${notification.type === 'success' ? 'bg-[#2EAD72] text-white' : 'bg-[#E65C5C] text-white'}`}>
          {notification.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b border-[#DCECEF] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="hidden sm:inline text-xs px-2 py-0.5 bg-[#16B9C0]/10 text-[#087E91] rounded-full font-medium">Admin Panel</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onExit} className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#718792] hover:text-[#173D4A] transition-colors">
              <ArrowLeft size={14} /> <span className="hidden sm:inline">Lihat Situs</span>
            </button>
            <button onClick={handleLogout} className="flex items-center gap-1 px-3 py-1.5 bg-[#E65C5C]/10 text-[#E65C5C] rounded-lg text-sm font-medium hover:bg-[#E65C5C]/20 transition-colors">
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="md:w-56 flex-shrink-0">
            <nav className="bg-white rounded-xl shadow-sm border border-[#DCECEF] p-2 flex md:flex-col gap-1 overflow-x-auto scrollbar-hide">
              {menuItems.map(item => (
                <button
                  key={item.page}
                  onClick={() => setCurrentPage(item.page)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${currentPage === item.page ? 'bg-[#16B9C0] text-white' : 'text-[#718792] hover:bg-[#F5FBFC] hover:text-[#173D4A]'}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            {currentPage === 'dashboard' && <AdminDashboard showNotification={showNotification} />}
            {currentPage === 'teams' && <AdminTeams showNotification={showNotification} />}
            {currentPage === 'schedule' && <AdminSchedule showNotification={showNotification} />}
            {currentPage === 'input-score' && <AdminInputScore showNotification={showNotification} />}
            {currentPage === 'standings' && <AdminStandings />}
            {currentPage === 'statistics' && <AdminStatistics />}
            {currentPage === 'settings' && <AdminSettings showNotification={showNotification} />}
          </main>
        </div>
      </div>
    </div>
  );
};

// Admin Dashboard
const AdminDashboard: React.FC<{ showNotification: (type: 'success' | 'error', msg: string) => void }> = () => {
  const teams = store.getTeams();
  const players = store.getPlayers();
  const matches = store.getMatches();
  const completedMatches = matches.filter(m => m.status === 'completed');
  const upcomingMatches = matches.filter(m => m.status === 'upcoming');

  return (
    <div className="animate-fade-in">
      <h2 className="text-lg font-bold text-[#173D4A] font-[Montserrat] mb-4">Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total Tim', value: teams.length, color: '#16B9C0' },
          { label: 'Total Pemain', value: players.filter(p => p.is_active).length, color: '#1599B8' },
          { label: 'Total Pertandingan', value: matches.length, color: '#087E91' },
          { label: 'Selesai', value: completedMatches.length, color: '#2EAD72' },
          { label: 'Mendatang', value: upcomingMatches.length, color: '#F2A23A' },
          { label: 'Menunggu Input', value: matches.filter(m => m.status === 'ongoing').length, color: '#FF805E' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-[#DCECEF]">
            <p className="text-2xl font-bold font-[Montserrat]" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs text-[#718792] mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-5 shadow-sm border border-[#DCECEF]">
        <h3 className="text-sm font-bold text-[#173D4A] mb-3">Aktivitas Terbaru</h3>
        <div className="space-y-2">
          {completedMatches.slice(-5).reverse().map(m => {
            const teamA = teams.find(t => t.id === m.team_a_id);
            const teamB = teams.find(t => t.id === m.team_b_id);
            return (
              <div key={m.id} className="flex items-center gap-3 p-2 rounded-lg bg-[#F5FBFC]">
                <CheckCircle size={14} className="text-[#2EAD72]" />
                <span className="text-sm text-[#173D4A]">{teamA?.name} vs {teamB?.name} - Selesai</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Admin Teams Management
const AdminTeams: React.FC<{ showNotification: (type: 'success' | 'error', msg: string) => void }> = ({ showNotification }) => {
  const [teams, setTeams] = useState<Team[]>(store.getTeams());
  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [name, setName] = useState('');
  const [captain, setCaptain] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      showNotification('error', 'Nama tim harus diisi');
      return;
    }
    if (editingTeam) {
      store.updateTeam({ ...editingTeam, name, captain, description });
      showNotification('success', 'Tim berhasil diperbarui');
    } else {
      store.addTeam({ name, captain, description, logo_url: '', is_active: true });
      showNotification('success', 'Tim baru berhasil ditambahkan');
    }
    setTeams(store.getTeams());
    setShowForm(false);
    setEditingTeam(null);
    setName('');
    setCaptain('');
    setDescription('');
  };

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setName(team.name);
    setCaptain(team.captain);
    setDescription(team.description);
    setShowForm(true);
  };

  const handleDelete = (teamId: string) => {
    if (confirm('Yakin ingin menonaktifkan tim ini?')) {
      const updated = teams.map(t => t.id === teamId ? { ...t, is_active: false } : t);
      store.saveTeams(updated);
      setTeams(updated);
      showNotification('success', 'Tim berhasil dinonaktifkan');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#173D4A] font-[Montserrat]">Manajemen Tim</h2>
        <button onClick={() => { setShowForm(true); setEditingTeam(null); setName(''); setCaptain(''); setDescription(''); }} className="flex items-center gap-1 px-3 py-2 bg-[#16B9C0] text-white rounded-lg text-sm font-medium hover:bg-[#0fa8ae] transition-colors">
          <Plus size={16} /> Tambah Tim
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-[#DCECEF] mb-4 animate-fade-in">
          <h3 className="text-sm font-bold text-[#173D4A] mb-3">{editingTeam ? 'Edit Tim' : 'Tambah Tim Baru'}</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[#718792] mb-1">Nama Tim</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[#DCECEF] text-sm focus:outline-none focus:border-[#16B9C0]" placeholder="Nama tim" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#718792] mb-1">Kapten</label>
              <input value={captain} onChange={e => setCaptain(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[#DCECEF] text-sm focus:outline-none focus:border-[#16B9C0]" placeholder="Nama kapten" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#718792] mb-1">Deskripsi</label>
              <input value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[#DCECEF] text-sm focus:outline-none focus:border-[#16B9C0]" placeholder="Deskripsi tim" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} className="flex items-center gap-1 px-4 py-2 bg-[#2EAD72] text-white rounded-lg text-sm font-medium hover:bg-[#269d66]">
                <Save size={14} /> Simpan
              </button>
              <button onClick={() => { setShowForm(false); setEditingTeam(null); }} className="flex items-center gap-1 px-4 py-2 bg-[#F5FBFC] text-[#718792] rounded-lg text-sm font-medium hover:bg-[#DCECEF]">
                <X size={14} /> Batal
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {teams.filter(t => t.is_active).map(team => (
          <div key={team.id} className="bg-white rounded-xl p-4 shadow-sm border border-[#DCECEF] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#16B9C0] to-[#087E91] flex items-center justify-center text-white font-bold text-sm">
                {team.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-[#173D4A]">{team.name}</p>
                <p className="text-xs text-[#718792]">Kapten: {team.captain}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => handleEdit(team)} className="p-2 text-[#16B9C0] hover:bg-[#16B9C0]/10 rounded-lg transition-colors">
                <Edit3 size={14} />
              </button>
              <button onClick={() => handleDelete(team.id)} className="p-2 text-[#E65C5C] hover:bg-[#E65C5C]/10 rounded-lg transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Admin Schedule Management
const AdminSchedule: React.FC<{ showNotification: (type: 'success' | 'error', msg: string) => void }> = ({ showNotification }) => {
  const [matches, setMatches] = useState<Match[]>(store.getMatches());
  const matchdays = store.getMatchdays();
  const teams = store.getTeams().filter(t => t.is_active);

  const updateMatchStatus = (matchId: string, status: Match['status']) => {
    const updated = matches.map(m => m.id === matchId ? { ...m, status } : m);
    store.saveMatches(updated);
    setMatches(updated);
    showNotification('success', `Status pertandingan diubah ke ${status}`);
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-lg font-bold text-[#173D4A] font-[Montserrat] mb-4">Manajemen Jadwal</h2>
      
      <div className="space-y-4">
        {matchdays.map(md => {
          const mdMatches = matches.filter(m => m.matchday_id === md.id);
          return (
            <div key={md.id} className="bg-white rounded-xl shadow-sm border border-[#DCECEF] overflow-hidden">
              <div className="px-4 py-3 bg-[#F5FBFC] border-b border-[#DCECEF] flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-[#173D4A]">{md.name}</span>
                  <span className="text-xs text-[#718792] ml-2">{md.date}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${md.status === 'completed' ? 'bg-[#2EAD72]/10 text-[#2EAD72]' : md.status === 'ongoing' ? 'bg-[#FF805E]/10 text-[#FF805E]' : 'bg-[#1599B8]/10 text-[#1599B8]'}`}>
                  {md.status}
                </span>
              </div>
              <div className="p-4 space-y-2">
                {mdMatches.map(match => {
                  const teamA = teams.find(t => t.id === match.team_a_id);
                  const teamB = teams.find(t => t.id === match.team_b_id);
                  return (
                    <div key={match.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-[#DCECEF] gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 bg-[#F5FBFC] rounded text-[#718792]">C{match.court}</span>
                        <span className="text-sm text-[#173D4A] font-medium">{teamA?.name} vs {teamB?.name}</span>
                        <span className="text-xs text-[#718792]">{match.start_time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <select
                          value={match.status}
                          onChange={(e) => updateMatchStatus(match.id, e.target.value as Match['status'])}
                          className="text-xs px-2 py-1 rounded border border-[#DCECEF] focus:outline-none focus:border-[#16B9C0]"
                        >
                          <option value="upcoming">Akan Datang</option>
                          <option value="ongoing">Berlangsung</option>
                          <option value="completed">Selesai</option>
                          <option value="cancelled">Dibatalkan</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Admin Input Score
const AdminInputScore: React.FC<{ showNotification: (type: 'success' | 'error', msg: string) => void }> = ({ showNotification }) => {
  const matches = store.getMatches();
  const teams = store.getTeams();
  const matchdays = store.getMatchdays();
  const pairs = store.getPairs();
  const [selectedMatch, setSelectedMatch] = useState<string>('');
  const [scores, setScores] = useState<{ scoreA: number; scoreB: number }[]>([{ scoreA: 0, scoreB: 0 }, { scoreA: 0, scoreB: 0 }, { scoreA: 0, scoreB: 0 }, { scoreA: 0, scoreB: 0 }]);

  const ongoingOrUpcoming = matches.filter(m => m.status === 'upcoming' || m.status === 'ongoing');
  const match = matches.find(m => m.id === selectedMatch);

  const handleSave = (isDraft: boolean) => {
    if (!match) return;
    
    const results: Omit<PairMatchResult, 'id'>[] = scores.map((s, idx) => ({
      match_id: match.id,
      position: idx + 1,
      team_a_pair_id: pairs.filter(p => p.team_id === match.team_a_id && p.is_active)[idx]?.id || '',
      team_b_pair_id: pairs.filter(p => p.team_id === match.team_b_id && p.is_active)[idx]?.id || '',
      score_team_a: s.scoreA,
      score_team_b: s.scoreB,
      winner_team_id: s.scoreA > s.scoreB ? match.team_a_id : s.scoreB > s.scoreA ? match.team_b_id : null,
      status: isDraft ? 'pending' : 'completed',
    }));

    if (!isDraft) {
      store.saveMatchResult(match.id, results);
      showNotification('success', 'Hasil pertandingan berhasil disahkan!');
    } else {
      // Save draft
      const allResults = store.getPairResults();
      const filtered = allResults.filter(r => r.match_id !== match.id);
      store.savePairResults([...filtered, ...results.map(r => ({ ...r, id: crypto.randomUUID() }))]);
      showNotification('success', 'Draft berhasil disimpan');
    }
    setSelectedMatch('');
    setScores([{ scoreA: 0, scoreB: 0 }, { scoreA: 0, scoreB: 0 }, { scoreA: 0, scoreB: 0 }, { scoreA: 0, scoreB: 0 }]);
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-lg font-bold text-[#173D4A] font-[Montserrat] mb-4">Input Skor Pertandingan</h2>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-[#DCECEF] mb-4">
        <label className="block text-sm font-medium text-[#173D4A] mb-2">Pilih Pertandingan</label>
        <select
          value={selectedMatch}
          onChange={(e) => setSelectedMatch(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-[#DCECEF] text-sm focus:outline-none focus:border-[#16B9C0]"
        >
          <option value="">-- Pilih pertandingan --</option>
          {ongoingOrUpcoming.map(m => {
            const teamA = teams.find(t => t.id === m.team_a_id);
            const teamB = teams.find(t => t.id === m.team_b_id);
            const md = matchdays.find(md => md.id === m.matchday_id);
            return (
              <option key={m.id} value={m.id}>{md?.name} - {teamA?.name} vs {teamB?.name} ({m.start_time})</option>
            );
          })}
        </select>
      </div>

      {selectedMatch && match && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-[#DCECEF] animate-fade-in">
          <div className="text-center mb-4">
            <p className="text-sm font-bold text-[#173D4A]">
              {teams.find(t => t.id === match.team_a_id)?.name} vs {teams.find(t => t.id === match.team_b_id)?.name}
            </p>
            <p className="text-xs text-[#718792]">Court {match.court} • {match.start_time}</p>
          </div>

          <div className="space-y-3">
            {scores.map((s, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-[#DCECEF]">
                <span className="text-xs font-medium text-[#087E91] w-20">Pasangan {idx + 1}</span>
                <div className="flex-1 flex items-center justify-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max="7"
                    value={s.scoreA}
                    onChange={(e) => {
                      const newScores = [...scores];
                      newScores[idx] = { ...newScores[idx], scoreA: parseInt(e.target.value) || 0 };
                      setScores(newScores);
                    }}
                    className="w-16 text-center px-2 py-1.5 rounded-lg border border-[#DCECEF] text-sm font-bold focus:outline-none focus:border-[#16B9C0]"
                  />
                  <span className="text-sm text-[#718792]">-</span>
                  <input
                    type="number"
                    min="0"
                    max="7"
                    value={s.scoreB}
                    onChange={(e) => {
                      const newScores = [...scores];
                      newScores[idx] = { ...newScores[idx], scoreB: parseInt(e.target.value) || 0 };
                      setScores(newScores);
                    }}
                    className="w-16 text-center px-2 py-1.5 rounded-lg border border-[#DCECEF] text-sm font-bold focus:outline-none focus:border-[#16B9C0]"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            <button onClick={() => handleSave(false)} className="flex-1 flex items-center justify-center gap-1 px-4 py-2.5 bg-[#2EAD72] text-white rounded-lg text-sm font-semibold hover:bg-[#269d66] transition-colors">
              <CheckCircle size={16} /> Sahkan Hasil
            </button>
            <button onClick={() => handleSave(true)} className="flex-1 flex items-center justify-center gap-1 px-4 py-2.5 bg-[#F2A23A] text-white rounded-lg text-sm font-semibold hover:bg-[#e09530] transition-colors">
              <Save size={16} /> Simpan Draft
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Admin Standings View
const AdminStandings: React.FC = () => {
  const standings = store.getStandings();
  const teams = store.getTeams();

  return (
    <div className="animate-fade-in">
      <h2 className="text-lg font-bold text-[#173D4A] font-[Montserrat] mb-4">Klasemen (Admin View)</h2>
      <div className="bg-white rounded-xl shadow-sm border border-[#DCECEF] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#087E91] text-white">
                <th className="px-3 py-2 text-left">Pos</th>
                <th className="px-3 py-2 text-left">Tim</th>
                <th className="px-3 py-2 text-center">M</th>
                <th className="px-3 py-2 text-center">Me</th>
                <th className="px-3 py-2 text-center">K</th>
                <th className="px-3 py-2 text-center">MP</th>
                <th className="px-3 py-2 text-center">KP</th>
                <th className="px-3 py-2 text-center">Poin</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s, idx) => (
                <tr key={s.team_id} className="border-b border-[#DCECEF] last:border-0">
                  <td className="px-3 py-2 font-bold text-[#087E91]">{idx + 1}</td>
                  <td className="px-3 py-2 font-medium text-[#173D4A]">{teams.find(t => t.id === s.team_id)?.name}</td>
                  <td className="px-3 py-2 text-center">{s.played}</td>
                  <td className="px-3 py-2 text-center text-[#2EAD72]">{s.won}</td>
                  <td className="px-3 py-2 text-center text-[#E65C5C]">{s.lost}</td>
                  <td className="px-3 py-2 text-center">{s.pair_wins}</td>
                  <td className="px-3 py-2 text-center">{s.pair_losses}</td>
                  <td className="px-3 py-2 text-center font-bold text-[#087E91]">{s.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Admin Statistics
const AdminStatistics: React.FC = () => {
  const teams = store.getTeams();
  const matches = store.getMatches();
  const standings = store.getStandings();

  return (
    <div className="animate-fade-in">
      <h2 className="text-lg font-bold text-[#173D4A] font-[Montserrat] mb-4">Statistik Liga</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#DCECEF]">
          <p className="text-2xl font-bold text-[#16B9C0]">{teams.filter(t => t.is_active).length}</p>
          <p className="text-xs text-[#718792]">Tim Aktif</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#DCECEF]">
          <p className="text-2xl font-bold text-[#2EAD72]">{matches.filter(m => m.status === 'completed').length}</p>
          <p className="text-xs text-[#718792]">Pertandingan Selesai</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#DCECEF]">
          <p className="text-2xl font-bold text-[#F2A23A]">{matches.filter(m => m.status === 'upcoming').length}</p>
          <p className="text-xs text-[#718792]">Pertandingan Mendatang</p>
        </div>
      </div>
      <div className="bg-white rounded-xl p-5 shadow-sm border border-[#DCECEF]">
        <h3 className="text-sm font-bold text-[#173D4A] mb-3">Performa Tim</h3>
        <div className="space-y-2">
          {standings.map(s => {
            const team = teams.find(t => t.id === s.team_id);
            const winRate = s.played > 0 ? Math.round((s.won / s.played) * 100) : 0;
            return (
              <div key={s.team_id} className="flex items-center gap-3">
                <span className="text-xs font-medium text-[#173D4A] w-32 truncate">{team?.name}</span>
                <div className="flex-1 h-3 bg-[#F5FBFC] rounded-full overflow-hidden">
                  <div className="h-full bg-[#16B9C0] rounded-full" style={{ width: `${winRate}%` }} />
                </div>
                <span className="text-xs font-bold text-[#16B9C0] w-8 text-right">{winRate}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Admin Settings
const AdminSettings: React.FC<{ showNotification: (type: 'success' | 'error', msg: string) => void }> = ({ showNotification }) => {
  const league = store.getLeague();
  const [name, setName] = useState(league.name);
  const [season, setSeason] = useState(league.season);
  const [description, setDescription] = useState(league.description);
  const [status, setStatus] = useState(league.status);
  const [pointsWin, setPointsWin] = useState(league.settings.points_win);
  const [pointsDraw, setPointsDraw] = useState(league.settings.points_draw);
  const [pointsLoss, setPointsLoss] = useState(league.settings.points_loss);
  const [courtsCount, setCourtsCount] = useState(league.settings.courts_count);
  const [targetGames, setTargetGames] = useState(league.settings.target_games);
  const [goldenPoint, setGoldenPoint] = useState(league.settings.golden_point);

  const handleSave = () => {
    const updated = {
      ...league,
      name,
      season,
      description,
      status,
      settings: {
        ...league.settings,
        points_win: pointsWin,
        points_draw: pointsDraw,
        points_loss: pointsLoss,
        courts_count: courtsCount,
        target_games: targetGames,
        golden_point: goldenPoint,
      },
    };
    store.saveLeague(updated);
    showNotification('success', 'Pengaturan berhasil disimpan');
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-lg font-bold text-[#173D4A] font-[Montserrat] mb-4">Pengaturan Liga</h2>
      <div className="bg-white rounded-xl p-5 shadow-sm border border-[#DCECEF] space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#718792] mb-1">Nama Liga</label>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[#DCECEF] text-sm focus:outline-none focus:border-[#16B9C0]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#718792] mb-1">Season</label>
          <input value={season} onChange={e => setSeason(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[#DCECEF] text-sm focus:outline-none focus:border-[#16B9C0]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#718792] mb-1">Deskripsi</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg border border-[#DCECEF] text-sm focus:outline-none focus:border-[#16B9C0]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#718792] mb-1">Status Kompetisi</label>
          <select value={status} onChange={e => setStatus(e.target.value as typeof status)} className="w-full px-3 py-2 rounded-lg border border-[#DCECEF] text-sm focus:outline-none focus:border-[#16B9C0]">
            <option value="upcoming">Akan Datang</option>
            <option value="ongoing">Berlangsung</option>
            <option value="completed">Selesai</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#718792] mb-1">Poin Menang</label>
            <input type="number" value={pointsWin} onChange={e => setPointsWin(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg border border-[#DCECEF] text-sm focus:outline-none focus:border-[#16B9C0]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#718792] mb-1">Poin Seri</label>
            <input type="number" value={pointsDraw} onChange={e => setPointsDraw(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg border border-[#DCECEF] text-sm focus:outline-none focus:border-[#16B9C0]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#718792] mb-1">Poin Kalah</label>
            <input type="number" value={pointsLoss} onChange={e => setPointsLoss(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg border border-[#DCECEF] text-sm focus:outline-none focus:border-[#16B9C0]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#718792] mb-1">Jumlah Court</label>
            <input type="number" value={courtsCount} onChange={e => setCourtsCount(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg border border-[#DCECEF] text-sm focus:outline-none focus:border-[#16B9C0]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#718792] mb-1">Target Game</label>
            <input type="number" value={targetGames} onChange={e => setTargetGames(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg border border-[#DCECEF] text-sm focus:outline-none focus:border-[#16B9C0]" />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={goldenPoint} onChange={e => setGoldenPoint(e.target.checked)} className="w-4 h-4 rounded border-[#DCECEF] text-[#16B9C0] focus:ring-[#16B9C0]" />
              <span className="text-sm text-[#173D4A]">Golden Point</span>
            </label>
          </div>
        </div>
        <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#16B9C0] text-white rounded-lg text-sm font-semibold hover:bg-[#0fa8ae] transition-colors">
          <Save size={16} /> Simpan Pengaturan
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;
