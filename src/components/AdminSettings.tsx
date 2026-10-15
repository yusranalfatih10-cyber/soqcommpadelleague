import React, { useState, useRef } from 'react';
import { store } from '../store';
import { Team, Player, User, MVP } from '../types';

const C = {
  primary: '#16B9C0', primaryDark: '#087E91', secondary: '#1599B8', accent: '#A8D82E',
  highlight: '#FF805E', bg: '#F5FBFC', surface: '#FFFFFF', textPrimary: '#173D4A',
  textSecondary: '#718792', border: '#DCECEF', success: '#2EAD72', warning: '#F2A23A', error: '#E65C5C',
};

interface AdminSettingsProps {
  notify: (type: string, msg: string) => void;
  onRefresh: () => void;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ notify, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('general');
  const currentUser = store.getCurrentUser();

  const tabs = [
    { id: 'general', label: 'Pengaturan Umum' },
    { id: 'teams', label: 'Manajemen Tim' },
    { id: 'players', label: 'Manajemen Pemain' },
    { id: 'mvp', label: 'Player MVP' },
    { id: 'users', label: 'Manajemen User' },
  ];

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary, margin: '0 0 16px' }}>Pengaturan Liga</h2>
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, overflowX: 'auto' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer',
            whiteSpace: 'nowrap', background: activeTab === tab.id ? C.primary : C.surface,
            color: activeTab === tab.id ? '#fff' : C.textSecondary,
          }}>
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === 'general' && <GeneralSettings notify={notify} onRefresh={onRefresh} />}
      {activeTab === 'teams' && <TeamsManagement notify={notify} onRefresh={onRefresh} />}
      {activeTab === 'players' && <PlayersManagement notify={notify} onRefresh={onRefresh} />}
      {activeTab === 'mvp' && <MVPManagement notify={notify} onRefresh={onRefresh} />}
      {activeTab === 'users' && currentUser?.role === 'super_admin' && <UsersManagement notify={notify} onRefresh={onRefresh} />}
    </div>
  );
};

const GeneralSettings: React.FC<{ notify: (type: string, msg: string) => void; onRefresh: () => void }> = ({ notify, onRefresh }) => {
  const league = store.getLeague();
  const [name, setName] = useState(league.name);
  const [season, setSeason] = useState(league.season);
  const [desc, setDesc] = useState(league.description);
  const [logoUrl, setLogoUrl] = useState(league.logo_url);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = (event) => setLogoUrl(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    await store.saveLeague({ ...league, name, season, description: desc, logo_url: logoUrl });
    notify('success', 'Pengaturan disimpan');
    onRefresh();
  };

  return (
    <div style={{ background: C.surface, borderRadius: 10, padding: 16, border: `1px solid ${C.border}` }}>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: C.textSecondary, marginBottom: 4 }}>Logo Liga</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 28 }}>S</div>
          )}
          <div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoSelect} style={{ display: 'none' }} />
            <button onClick={() => fileInputRef.current?.click()} style={{ padding: '6px 12px', background: C.bg, color: C.textPrimary, borderRadius: 6, fontSize: 11, border: `1px solid ${C.border}`, cursor: 'pointer' }}>
              {logoUrl ? 'Ganti Logo' : 'Pilih Logo'}
            </button>
          </div>
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: C.textSecondary, marginBottom: 4 }}>Nama Liga</label>
        <input value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: C.textSecondary, marginBottom: 4 }}>Season</label>
        <input value={season} onChange={e => setSeason(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: C.textSecondary, marginBottom: 4 }}>Deskripsi</label>
        <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }} />
      </div>
      <button onClick={handleSave} style={{ width: '100%', padding: '10px', background: C.primary, color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: 13, border: 'none', cursor: 'pointer' }}>Simpan</button>
    </div>
  );
};

const TeamsManagement: React.FC<{ notify: (type: string, msg: string) => void; onRefresh: () => void }> = ({ notify, onRefresh }) => {
  const [teams, setTeams] = useState<Team[]>(store.getTeams());
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [captain, setCaptain] = useState('');

  const handleSave = async () => {
    if (!name.trim()) { notify('error', 'Nama tim harus diisi'); return; }
    await store.addTeam({ name, captain, description: '', logo_url: '', is_active: true });
    setTeams(store.getTeams());
    setShowForm(false);
    setName('');
    setCaptain('');
    notify('success', 'Tim berhasil ditambahkan');
    onRefresh();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, margin: 0 }}>Daftar Tim</h3>
        <button onClick={() => setShowForm(true)} style={{ padding: '6px 12px', background: C.primary, color: '#fff', borderRadius: 8, fontSize: 12, border: 'none', cursor: 'pointer' }}>+ Tambah Tim</button>
      </div>
      {showForm && (
        <div style={{ background: C.surface, borderRadius: 10, padding: 16, border: `1px solid ${C.border}`, marginBottom: 12 }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nama tim" style={{ width: '100%', padding: '8px', borderRadius: 8, border: `1px solid ${C.border}`, marginBottom: 8 }} />
          <input value={captain} onChange={e => setCaptain(e.target.value)} placeholder="Kapten" style={{ width: '100%', padding: '8px', borderRadius: 8, border: `1px solid ${C.border}`, marginBottom: 8 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} style={{ flex: 1, padding: '8px', background: C.success, color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer' }}>Simpan</button>
            <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '8px', background: C.bg, color: C.textSecondary, borderRadius: 8, border: 'none', cursor: 'pointer' }}>Batal</button>
          </div>
        </div>
      )}
      <div style={{ display: 'grid', gap: 8 }}>
        {teams.map(team => (
          <div key={team.id} style={{ background: C.surface, borderRadius: 10, padding: 12, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
              {team.name.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary, margin: 0 }}>{team.name}</p>
              <p style={{ fontSize: 11, color: C.textSecondary, margin: 0 }}>Kapten: {team.captain}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PlayersManagement: React.FC<{ notify: (type: string, msg: string) => void; onRefresh: () => void }> = ({ notify, onRefresh }) => {
  const [players, setPlayers] = useState<Player[]>(store.getPlayers());
  const teams = store.getTeams().filter(t => t.is_active);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [teamId, setTeamId] = useState('');

  const handleSave = async () => {
    if (!name.trim() || !teamId) { notify('error', 'Nama dan tim harus diisi'); return; }
    await store.addPlayer({ name, team_id: teamId, photo_url: '', is_active: true });
    setPlayers(store.getPlayers());
    setShowForm(false);
    setName('');
    setTeamId('');
    notify('success', 'Pemain berhasil ditambahkan');
    onRefresh();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, margin: 0 }}>Daftar Pemain</h3>
        <button onClick={() => setShowForm(true)} style={{ padding: '6px 12px', background: C.primary, color: '#fff', borderRadius: 8, fontSize: 12, border: 'none', cursor: 'pointer' }}>+ Tambah Pemain</button>
      </div>
      {showForm && (
        <div style={{ background: C.surface, borderRadius: 10, padding: 16, border: `1px solid ${C.border}`, marginBottom: 12 }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nama pemain" style={{ width: '100%', padding: '8px', borderRadius: 8, border: `1px solid ${C.border}`, marginBottom: 8 }} />
          <select value={teamId} onChange={e => setTeamId(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 8, border: `1px solid ${C.border}`, marginBottom: 8 }}>
            <option value="">Pilih tim</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} style={{ flex: 1, padding: '8px', background: C.success, color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer' }}>Simpan</button>
            <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '8px', background: C.bg, color: C.textSecondary, borderRadius: 8, border: 'none', cursor: 'pointer' }}>Batal</button>
          </div>
        </div>
      )}
      <div style={{ display: 'grid', gap: 8 }}>
        {players.slice(0, 20).map(player => {
          const team = teams.find(t => t.id === player.team_id);
          return (
            <div key={player.id} style={{ background: C.surface, borderRadius: 10, padding: 12, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${C.secondary}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.secondary, fontWeight: 700 }}>
                {player.name.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary, margin: 0 }}>{player.name}</p>
                <p style={{ fontSize: 11, color: C.textSecondary, margin: 0 }}>{team?.name || 'Tidak ada tim'}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MVPManagement: React.FC<{ notify: (type: string, msg: string) => void; onRefresh: () => void }> = ({ notify, onRefresh }) => {
  const matchdays = store.getMatchdays().filter(md => md.status === 'completed');
  const players = store.getPlayers().filter(p => p.is_active);
  const mvps = store.getMVPs();
  const [showForm, setShowForm] = useState(false);
  const [selectedMatchday, setSelectedMatchday] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [reason, setReason] = useState('');

  const handleSave = async () => {
    if (!selectedMatchday || !selectedPlayer) { notify('error', 'Matchday dan pemain harus dipilih'); return; }
    await store.addMVP({ matchday_id: selectedMatchday, player_id: selectedPlayer, reason });
    setShowForm(false);
    setSelectedMatchday('');
    setSelectedPlayer('');
    setReason('');
    notify('success', 'MVP berhasil ditambahkan');
    onRefresh();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, margin: 0 }}>Player MVP</h3>
        <button onClick={() => setShowForm(true)} style={{ padding: '6px 12px', background: C.primary, color: '#fff', borderRadius: 8, fontSize: 12, border: 'none', cursor: 'pointer' }}>+ Pilih MVP</button>
      </div>
      {showForm && (
        <div style={{ background: C.surface, borderRadius: 10, padding: 16, border: `1px solid ${C.border}`, marginBottom: 12 }}>
          <select value={selectedMatchday} onChange={e => setSelectedMatchday(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 8, border: `1px solid ${C.border}`, marginBottom: 8 }}>
            <option value="">Pilih matchday</option>
            {matchdays.map(md => <option key={md.id} value={md.id}>Matchday {md.matchday_number}</option>)}
          </select>
          <select value={selectedPlayer} onChange={e => setSelectedPlayer(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 8, border: `1px solid ${C.border}`, marginBottom: 8 }}>
            <option value="">Pilih pemain</option>
            {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Alasan (opsional)" rows={2} style={{ width: '100%', padding: '8px', borderRadius: 8, border: `1px solid ${C.border}`, marginBottom: 8 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} style={{ flex: 1, padding: '8px', background: C.success, color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer' }}>Simpan</button>
            <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '8px', background: C.bg, color: C.textSecondary, borderRadius: 8, border: 'none', cursor: 'pointer' }}>Batal</button>
          </div>
        </div>
      )}
      <div style={{ display: 'grid', gap: 8 }}>
        {mvps.map(mvp => {
          const player = players.find(p => p.id === mvp.player_id);
          const matchday = matchdays.find(md => md.id === mvp.matchday_id);
          return (
            <div key={mvp.id} style={{ background: C.surface, borderRadius: 10, padding: 12, border: `2px solid ${C.accent}` }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, margin: 0 }}>🏆 {player?.name}</p>
              <p style={{ fontSize: 11, color: C.textSecondary, margin: '2px 0 0' }}>Matchday {matchday?.matchday_number}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const UsersManagement: React.FC<{ notify: (type: string, msg: string) => void; onRefresh: () => void }> = ({ notify, onRefresh }) => {
  const [users, setUsers] = useState<User[]>(store.getUsers());
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<User['role']>('operator');

  const handleSave = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) { notify('error', 'Semua field harus diisi'); return; }
    await store.addUser({ name, email, password_hash: password, role, is_active: true });
    setUsers(store.getUsers());
    setShowForm(false);
    setName('');
    setEmail('');
    setPassword('');
    notify('success', 'User berhasil ditambahkan');
    onRefresh();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, margin: 0 }}>Daftar User</h3>
        <button onClick={() => setShowForm(true)} style={{ padding: '6px 12px', background: C.primary, color: '#fff', borderRadius: 8, fontSize: 12, border: 'none', cursor: 'pointer' }}>+ Tambah User</button>
      </div>
      {showForm && (
        <div style={{ background: C.surface, borderRadius: 10, padding: 16, border: `1px solid ${C.border}`, marginBottom: 12 }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nama" style={{ width: '100%', padding: '8px', borderRadius: 8, border: `1px solid ${C.border}`, marginBottom: 8 }} />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" style={{ width: '100%', padding: '8px', borderRadius: 8, border: `1px solid ${C.border}`, marginBottom: 8 }} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" style={{ width: '100%', padding: '8px', borderRadius: 8, border: `1px solid ${C.border}`, marginBottom: 8 }} />
          <select value={role} onChange={e => setRole(e.target.value as User['role'])} style={{ width: '100%', padding: '8px', borderRadius: 8, border: `1px solid ${C.border}`, marginBottom: 8 }}>
            <option value="operator">Operator</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} style={{ flex: 1, padding: '8px', background: C.success, color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer' }}>Simpan</button>
            <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '8px', background: C.bg, color: C.textSecondary, borderRadius: 8, border: 'none', cursor: 'pointer' }}>Batal</button>
          </div>
        </div>
      )}
      <div style={{ display: 'grid', gap: 8 }}>
        {users.map(user => (
          <div key={user.id} style={{ background: C.surface, borderRadius: 10, padding: 12, border: `1px solid ${C.border}` }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary, margin: 0 }}>{user.name}</p>
            <p style={{ fontSize: 11, color: C.textSecondary, margin: '2px 0 0' }}>{user.email} • {user.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSettings;
