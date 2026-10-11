import React, { useState, useRef } from 'react';
import { store } from '../store';
import { Team, Player, User } from '../types';
import { v4 as uuidv4 } from 'uuid';

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
    { id: 'users', label: 'Manajemen User' },
    { id: 'standings', label: 'Pengaturan Klasemen' },
    { id: 'schedule', label: 'Manajemen Jadwal' },
    { id: 'generate', label: 'Generate Jadwal' },
    { id: 'reset', label: 'Reset Liga' },
  ];

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary, margin: '0 0 16px', fontFamily: 'Montserrat, sans-serif' }}>Pengaturan Liga</h2>
      
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              background: activeTab === tab.id ? C.primary : C.surface,
              color: activeTab === tab.id ? '#fff' : C.textSecondary,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'general' && <GeneralSettings notify={notify} onRefresh={onRefresh} />}
      {activeTab === 'teams' && <TeamsManagement notify={notify} onRefresh={onRefresh} />}
      {activeTab === 'players' && <PlayersManagement notify={notify} onRefresh={onRefresh} />}
      {activeTab === 'users' && currentUser?.role === 'super_admin' && <UsersManagement notify={notify} onRefresh={onRefresh} />}
      {activeTab === 'standings' && <StandingsSettings notify={notify} onRefresh={onRefresh} />}
      {activeTab === 'schedule' && <ScheduleManagement notify={notify} onRefresh={onRefresh} />}
      {activeTab === 'generate' && <GenerateSchedule notify={notify} onRefresh={onRefresh} />}
      {activeTab === 'reset' && currentUser?.role === 'super_admin' && <ResetLeague notify={notify} onRefresh={onRefresh} />}
    </div>
  );
};

// General Settings
const GeneralSettings: React.FC<{ notify: (type: string, msg: string) => void; onRefresh: () => void }> = ({ notify, onRefresh }) => {
  const league = store.getLeague();
  const [name, setName] = useState(league.name);
  const [season, setSeason] = useState(league.season);
  const [desc, setDesc] = useState(league.description);
  const [status, setStatus] = useState(league.status);
  const [logoUrl, setLogoUrl] = useState(league.logo_url);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      await store.saveLeague({ ...league, name, season, description: desc, status, logo_url: logoUrl });
      notify('success', 'Pengaturan umum disimpan');
      onRefresh();
    } catch (error) {
      console.error('Error saving league:', error);
      notify('error', 'Gagal menyimpan pengaturan. Silakan coba lagi.');
    }
  };

  return (
    <div style={{ background: C.surface, borderRadius: 10, padding: 16, border: `1px solid ${C.border}` }}>
      {/* Logo Upload */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: C.textSecondary, marginBottom: 4 }}>Logo Liga</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {logoUrl ? (
            <img src={logoUrl} alt="Logo Liga" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${C.primary}` }} />
          ) : (
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 28 }}>
              S
            </div>
          )}
          <div style={{ flex: 1 }}>
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handleLogoSelect} style={{ display: 'none' }} />
            <button onClick={() => fileInputRef.current?.click()} style={{ padding: '6px 12px', background: C.bg, color: C.textPrimary, borderRadius: 6, fontSize: 11, border: `1px solid ${C.border}`, cursor: 'pointer', marginBottom: 4 }}>
              {logoUrl ? 'Ganti Logo' : 'Pilih Logo'}
            </button>
            {logoUrl && (
              <button onClick={() => setLogoUrl('')} style={{ display: 'block', padding: '6px 12px', background: `${C.error}15`, color: C.error, borderRadius: 6, fontSize: 11, border: 'none', cursor: 'pointer' }}>
                Hapus Logo
              </button>
            )}
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
        <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, resize: 'vertical' }} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: C.textSecondary, marginBottom: 4 }}>Status Kompetisi</label>
        <select value={status} onChange={e => setStatus(e.target.value as any)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }}>
          <option value="upcoming">Akan Datang</option>
          <option value="ongoing">Berlangsung</option>
          <option value="completed">Selesai</option>
        </select>
      </div>
      <button onClick={handleSave} style={{ width: '100%', padding: '10px', background: C.primary, color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: 13, border: 'none', cursor: 'pointer' }}>Simpan Pengaturan</button>
    </div>
  );
};

// Teams Management
const TeamsManagement: React.FC<{ notify: (type: string, msg: string) => void; onRefresh: () => void }> = ({ notify, onRefresh }) => {
  const [teams, setTeams] = useState<Team[]>(store.getTeams());
  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [name, setName] = useState('');
  const [captain, setCaptain] = useState('');
  const [desc, setDesc] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        const result = await store.addTeam({ name, captain, description: desc, logo_url: logoUrl, is_active: true });
        if (result) {
          notify('success', 'Tim baru berhasil ditambahkan');
        } else {
          notify('error', 'Gagal menambahkan tim. Silakan coba lagi.');
          return;
        }
      }
      
      setTeams(store.getTeams());
      setShowForm(false);
      setEditingTeam(null);
      setName('');
      setCaptain('');
      setDesc('');
      setLogoUrl('');
      onRefresh();
    } catch (error) {
      console.error('Error saving team:', error);
      notify('error', 'Terjadi kesalahan. Silakan coba lagi.');
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

  const handleToggleActive = async (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (team) {
      try {
        await store.updateTeam({ ...team, is_active: !team.is_active });
        setTeams(store.getTeams());
        notify('success', `Tim ${team.is_active ? 'dinonaktifkan' : 'diaktifkan'}`);
        onRefresh();
      } catch (error) {
        console.error('Error toggling team:', error);
        notify('error', 'Gagal mengubah status tim. Silakan coba lagi.');
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, margin: 0 }}>Daftar Tim</h3>
        <button onClick={() => { setShowForm(true); setEditingTeam(null); setName(''); setCaptain(''); setDesc(''); setLogoUrl(''); }} style={{ padding: '6px 12px', background: C.primary, color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer' }}>+ Tambah Tim</button>
      </div>

      {showForm && (
        <div style={{ background: C.surface, borderRadius: 10, padding: 16, border: `1px solid ${C.border}`, marginBottom: 12 }}>
          <h4 style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, margin: '0 0 12px' }}>{editingTeam ? 'Edit Tim' : 'Tambah Tim Baru'}</h4>
          
          {/* Logo Upload */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: C.textSecondary, marginBottom: 4 }}>Logo Tim</label>
            {logoUrl && (
              <div style={{ marginBottom: 8 }}>
                <img src={logoUrl} alt="Preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: `1px solid ${C.border}` }} />
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handleFileSelect} style={{ display: 'none' }} />
            <button onClick={() => fileInputRef.current?.click()} style={{ padding: '6px 12px', background: C.bg, color: C.textPrimary, borderRadius: 6, fontSize: 11, border: `1px solid ${C.border}`, cursor: 'pointer', marginRight: 8 }}>
              {logoUrl ? 'Ganti Logo' : 'Pilih Logo'}
            </button>
            {logoUrl && (
              <button onClick={() => setLogoUrl('')} style={{ padding: '6px 12px', background: `${C.error}15`, color: C.error, borderRadius: 6, fontSize: 11, border: 'none', cursor: 'pointer' }}>
                Hapus Logo
              </button>
            )}
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: C.textSecondary, marginBottom: 4 }}>Nama Tim</label>
            <input value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }} placeholder="Nama tim" />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: C.textSecondary, marginBottom: 4 }}>Kapten</label>
            <input value={captain} onChange={e => setCaptain(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }} placeholder="Nama kapten" />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: C.textSecondary, marginBottom: 4 }}>Deskripsi</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, resize: 'vertical' }} placeholder="Deskripsi tim" />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} style={{ flex: 1, padding: '8px', background: C.success, color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer' }}>Simpan</button>
            <button onClick={() => { setShowForm(false); setEditingTeam(null); }} style={{ flex: 1, padding: '8px', background: C.bg, color: C.textSecondary, borderRadius: 8, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer' }}>Batal</button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: 8 }}>
        {teams.map(team => (
          <div key={team.id} style={{ background: C.surface, borderRadius: 10, padding: 12, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
            {team.logo_url ? (
              <img src={team.logo_url} alt={team.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>
                {team.name.charAt(0)}
              </div>
            )}
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary, margin: 0 }}>{team.name}</p>
              <p style={{ fontSize: 11, color: C.textSecondary, margin: 0 }}>Kapten: {team.captain} • {team.is_active ? 'Aktif' : 'Nonaktif'}</p>
            </div>
            <button onClick={() => handleEdit(team)} style={{ padding: '4px 10px', fontSize: 11, color: C.primary, background: `${C.primary}15`, borderRadius: 6, border: 'none', cursor: 'pointer' }}>Edit</button>
            <button onClick={() => handleToggleActive(team.id)} style={{ padding: '4px 10px', fontSize: 11, color: team.is_active ? C.warning : C.success, background: team.is_active ? `${C.warning}15` : `${C.success}15`, borderRadius: 6, border: 'none', cursor: 'pointer' }}>
              {team.is_active ? 'Nonaktifkan' : 'Aktifkan'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Players Management
const PlayersManagement: React.FC<{ notify: (type: string, msg: string) => void; onRefresh: () => void }> = ({ notify, onRefresh }) => {
  const [players, setPlayers] = useState<Player[]>(store.getPlayers());
  const teams = store.getTeams().filter(t => t.is_active);
  const [showForm, setShowForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [name, setName] = useState('');
  const [teamId, setTeamId] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        const result = await store.addPlayer({ name, team_id: teamId, photo_url: photoUrl, is_active: true });
        if (result) {
          notify('success', 'Pemain baru berhasil ditambahkan');
        } else {
          notify('error', 'Gagal menambahkan pemain. Silakan coba lagi.');
          return;
        }
      }
      
      setPlayers(store.getPlayers());
      setShowForm(false);
      setEditingPlayer(null);
      setName('');
      setTeamId('');
      setPhotoUrl('');
      onRefresh();
    } catch (error) {
      console.error('Error saving player:', error);
      notify('error', 'Terjadi kesalahan. Silakan coba lagi.');
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
        onRefresh();
      } catch (error) {
        console.error('Error toggling player:', error);
        notify('error', 'Gagal mengubah status pemain. Silakan coba lagi.');
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, margin: 0 }}>Daftar Pemain</h3>
        <button onClick={() => { setShowForm(true); setEditingPlayer(null); setName(''); setTeamId(''); setPhotoUrl(''); }} style={{ padding: '6px 12px', background: C.primary, color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer' }}>+ Tambah Pemain</button>
      </div>

      {showForm && (
        <div style={{ background: C.surface, borderRadius: 10, padding: 16, border: `1px solid ${C.border}`, marginBottom: 12 }}>
          <h4 style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, margin: '0 0 12px' }}>{editingPlayer ? 'Edit Pemain' : 'Tambah Pemain Baru'}</h4>
          
          {/* Photo Upload */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: C.textSecondary, marginBottom: 4 }}>Foto Pemain</label>
            {photoUrl && (
              <div style={{ marginBottom: 8 }}>
                <img src={photoUrl} alt="Preview" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '50%', border: `1px solid ${C.border}` }} />
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handleFileSelect} style={{ display: 'none' }} />
            <button onClick={() => fileInputRef.current?.click()} style={{ padding: '6px 12px', background: C.bg, color: C.textPrimary, borderRadius: 6, fontSize: 11, border: `1px solid ${C.border}`, cursor: 'pointer', marginRight: 8 }}>
              {photoUrl ? 'Ganti Foto' : 'Pilih Foto'}
            </button>
            {photoUrl && (
              <button onClick={() => setPhotoUrl('')} style={{ padding: '6px 12px', background: `${C.error}15`, color: C.error, borderRadius: 6, fontSize: 11, border: 'none', cursor: 'pointer' }}>
                Hapus Foto
              </button>
            )}
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: C.textSecondary, marginBottom: 4 }}>Nama Lengkap</label>
            <input value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }} placeholder="Nama pemain" />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: C.textSecondary, marginBottom: 4 }}>Tim</label>
            <select value={teamId} onChange={e => setTeamId(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }}>
              <option value="">Pilih tim</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} style={{ flex: 1, padding: '8px', background: C.success, color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer' }}>Simpan</button>
            <button onClick={() => { setShowForm(false); setEditingPlayer(null); }} style={{ flex: 1, padding: '8px', background: C.bg, color: C.textSecondary, borderRadius: 8, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer' }}>Batal</button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: 8 }}>
        {players.filter(p => p.is_active).slice(0, 20).map(player => {
          const team = teams.find(t => t.id === player.team_id);
          return (
            <div key={player.id} style={{ background: C.surface, borderRadius: 10, padding: 12, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
              {player.photo_url ? (
                <img src={player.photo_url} alt={player.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${C.secondary}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.secondary, fontWeight: 700, fontSize: 13 }}>
                  {player.name.charAt(0)}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary, margin: 0 }}>{player.name}</p>
                <p style={{ fontSize: 11, color: C.textSecondary, margin: 0 }}>{team?.name || 'Tidak ada tim'}</p>
              </div>
              <button onClick={() => handleEdit(player)} style={{ padding: '4px 10px', fontSize: 11, color: C.primary, background: `${C.primary}15`, borderRadius: 6, border: 'none', cursor: 'pointer' }}>Edit</button>
              <button onClick={() => handleToggleActive(player.id)} style={{ padding: '4px 10px', fontSize: 11, color: player.is_active ? C.warning : C.success, background: player.is_active ? `${C.warning}15` : `${C.success}15`, borderRadius: 6, border: 'none', cursor: 'pointer' }}>
                {player.is_active ? 'Nonaktifkan' : 'Aktifkan'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Users Management
const UsersManagement: React.FC<{ notify: (type: string, msg: string) => void; onRefresh: () => void }> = ({ notify, onRefresh }) => {
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
        const result = await store.addUser({ name, email, password_hash: password, role, is_active: true });
        if (result) {
          notify('success', 'User baru berhasil ditambahkan');
        } else {
          notify('error', 'Gagal menambahkan user. Silakan coba lagi.');
          return;
        }
      }
      
      setUsers(store.getUsers());
      setShowForm(false);
      setEditingUser(null);
      setName('');
      setEmail('');
      setPassword('');
      setRole('operator');
      onRefresh();
    } catch (error) {
      console.error('Error saving user:', error);
      notify('error', 'Terjadi kesalahan. Silakan coba lagi.');
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
        onRefresh();
      } catch (error) {
        console.error('Error deleting user:', error);
        notify('error', 'Gagal menghapus user. Silakan coba lagi.');
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, margin: 0 }}>Daftar User</h3>
        <button onClick={() => { setShowForm(true); setEditingUser(null); setName(''); setEmail(''); setPassword(''); setRole('operator'); }} style={{ padding: '6px 12px', background: C.primary, color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer' }}>+ Tambah User</button>
      </div>

      {showForm && (
        <div style={{ background: C.surface, borderRadius: 10, padding: 16, border: `1px solid ${C.border}`, marginBottom: 12 }}>
          <h4 style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, margin: '0 0 12px' }}>{editingUser ? 'Edit User' : 'Tambah User Baru'}</h4>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: C.textSecondary, marginBottom: 4 }}>Nama Lengkap</label>
            <input value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }} placeholder="Nama user" />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: C.textSecondary, marginBottom: 4 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }} placeholder="email@example.com" />
          </div>
          {!editingUser && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: C.textSecondary, marginBottom: 4 }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }} placeholder="Password" />
            </div>
          )}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: C.textSecondary, marginBottom: 4 }}>Role</label>
            <select value={role} onChange={e => setRole(e.target.value as User['role'])} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }}>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="operator">Operator</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} style={{ flex: 1, padding: '8px', background: C.success, color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer' }}>Simpan</button>
            <button onClick={() => { setShowForm(false); setEditingUser(null); }} style={{ flex: 1, padding: '8px', background: C.bg, color: C.textSecondary, borderRadius: 8, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer' }}>Batal</button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: 8 }}>
        {users.map(user => (
          <div key={user.id} style={{ background: C.surface, borderRadius: 10, padding: 12, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${C.accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.accent, fontWeight: 700, fontSize: 13 }}>
              {user.name.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary, margin: 0 }}>{user.name}</p>
              <p style={{ fontSize: 11, color: C.textSecondary, margin: 0 }}>{user.email} • {user.role.replace('_', ' ').toUpperCase()}</p>
            </div>
            <button onClick={() => handleEdit(user)} style={{ padding: '4px 10px', fontSize: 11, color: C.primary, background: `${C.primary}15`, borderRadius: 6, border: 'none', cursor: 'pointer' }}>Edit</button>
            {user.role !== 'super_admin' && (
              <button onClick={() => handleDelete(user.id)} style={{ padding: '4px 10px', fontSize: 11, color: C.error, background: `${C.error}15`, borderRadius: 6, border: 'none', cursor: 'pointer' }}>Hapus</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Standings Settings
const StandingsSettings: React.FC<{ notify: (type: string, msg: string) => void; onRefresh: () => void }> = ({ notify, onRefresh }) => {
  const league = store.getLeague();
  const [tiebreakOrder, setTiebreakOrder] = useState(league.settings.tiebreak_order);

  const handleSave = async () => {
    try {
      await store.saveLeague({ ...league, settings: { ...league.settings, tiebreak_order: tiebreakOrder } });
      notify('success', 'Pengaturan klasemen disimpan');
      onRefresh();
    } catch (error) {
      console.error('Error saving standings settings:', error);
      notify('error', 'Gagal menyimpan pengaturan. Silakan coba lagi.');
    }
  };

  return (
    <div style={{ background: C.surface, borderRadius: 10, padding: 16, border: `1px solid ${C.border}` }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, margin: '0 0 12px' }}>Sistem Perhitungan Klasemen</h3>
      <p style={{ fontSize: 12, color: C.textSecondary, margin: '0 0 16px', lineHeight: 1.6 }}>
        Klasemen dihitung berdasarkan <strong>total poin dari semua partai pasangan</strong> dalam pertandingan beregu yang telah disahkan. Setiap partai memberikan poin sesuai jumlah game yang diperoleh.
      </p>
      <div style={{ background: C.bg, borderRadius: 8, padding: 12, marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary, margin: '0 0 8px' }}>Urutan Tie-break:</p>
        <ol style={{ fontSize: 11, color: C.textSecondary, margin: 0, paddingLeft: 20 }}>
          <li>Total Poin (DESC)</li>
          <li>Selisih Pasangan (DESC)</li>
          <li>Pasangan Menang (DESC)</li>
          <li>Head-to-Head (DESC)</li>
        </ol>
      </div>
      <button onClick={handleSave} style={{ width: '100%', padding: '10px', background: C.primary, color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: 13, border: 'none', cursor: 'pointer' }}>Simpan Pengaturan</button>
    </div>
  );
};

// Schedule Management
const ScheduleManagement: React.FC<{ notify: (type: string, msg: string) => void; onRefresh: () => void }> = ({ notify, onRefresh }) => {
  const matches = store.getMatches();
  const teams = store.getTeams();
  const matchdays = store.getMatchdays();

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
        onRefresh();
      } catch (error) {
        console.error('Error deleting match:', error);
        notify('error', 'Gagal menghapus jadwal. Silakan coba lagi.');
      }
    }
  };

  return (
    <div>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, margin: '0 0 12px' }}>Manajemen Jadwal</h3>
      <div style={{ display: 'grid', gap: 8 }}>
        {matches.slice(0, 20).map(match => {
          const teamA = teams.find(t => t.id === match.team_a_id);
          const teamB = teams.find(t => t.id === match.team_b_id);
          const md = matchdays.find(m => m.id === match.matchday_id);
          return (
            <div key={match.id} style={{ background: C.surface, borderRadius: 10, padding: 12, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary, margin: 0 }}>{teamA?.name} vs {teamB?.name}</p>
                <p style={{ fontSize: 11, color: C.textSecondary, margin: 0 }}>{md?.name} • {md?.date} • {match.start_time} • Court {match.court}</p>
              </div>
              {match.status !== 'completed' && (
                <button onClick={() => handleDelete(match.id)} style={{ padding: '4px 10px', fontSize: 11, color: C.error, background: `${C.error}15`, borderRadius: 6, border: 'none', cursor: 'pointer' }}>Hapus</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Generate Schedule
const GenerateSchedule: React.FC<{ notify: (type: string, msg: string) => void; onRefresh: () => void }> = ({ notify, onRefresh }) => {
  const teams = store.getTeams().filter(t => t.is_active);
  const [startDate, setStartDate] = useState('2025-02-01');
  const [courts, setCourts] = useState(2);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [preview, setPreview] = useState<{ matchdays: any[], matches: any[] } | null>(null);

  const handleGeneratePreview = () => {
    if (teams.length < 2) {
      notify('error', 'Minimal 2 tim aktif diperlukan');
      return;
    }
    // Generate preview tanpa menyimpan
    const n = teams.length;
    const numRounds = n - 1;
    const matchdays = [];
    const matches = [];
    const start = new Date(startDate);

    for (let round = 0; round < numRounds; round++) {
      const date = new Date(start);
      date.setDate(date.getDate() + round * 7);
      matchdays.push({ name: `Matchday ${round + 1}`, date: date.toISOString().split('T')[0] });
      
      // Simple round-robin pairing
      for (let i = 0; i < Math.floor(n / 2); i++) {
        const homeIdx = (round + i) % (n - 1);
        const awayIdx = (n - 1 - i + round) % (n - 1);
        if (homeIdx !== awayIdx) {
          matches.push({
            matchday: round + 1,
            teamA: teams[homeIdx]?.name || '',
            teamB: teams[awayIdx]?.name || '',
            court: (i % courts) + 1,
          });
        }
      }
    }

    setPreview({ matchdays, matches });
  };

  const handleSave = () => {
    if (!preview) return;
    if (confirm(`Akan membuat ${preview.matches.length} pertandingan. Lanjutkan?`)) {
      store.generateSchedule(teams, startDate, courts, replaceExisting);
      notify('success', `Jadwal berhasil dibuat: ${preview.matches.length} pertandingan`);
      setPreview(null);
      onRefresh();
    }
  };

  return (
    <div style={{ background: C.surface, borderRadius: 10, padding: 16, border: `1px solid ${C.border}` }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, margin: '0 0 12px' }}>Generate Jadwal Otomatis</h3>
      <p style={{ fontSize: 12, color: C.textSecondary, margin: '0 0 16px' }}>
        Membuat jadwal round-robin otomatis untuk {teams.length} tim aktif. Setiap tim akan bertemu satu sama lain tepat satu kali.
      </p>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: C.textSecondary, marginBottom: 4 }}>Tanggal Mulai</label>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: C.textSecondary, marginBottom: 4 }}>Jumlah Court</label>
        <input type="number" min="1" max="4" value={courts} onChange={e => setCourts(parseInt(e.target.value) || 2)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input type="checkbox" checked={replaceExisting} onChange={e => setReplaceExisting(e.target.checked)} style={{ width: 16, height: 16 }} />
          <span style={{ fontSize: 12, color: C.textPrimary }}>Ganti jadwal yang belum dimainkan</span>
        </label>
      </div>

      <button onClick={handleGeneratePreview} style={{ width: '100%', padding: '10px', background: C.secondary, color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: 13, border: 'none', cursor: 'pointer', marginBottom: 12 }}>Generate Preview</button>

      {preview && (
        <div style={{ background: C.bg, borderRadius: 8, padding: 12, marginBottom: 12 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary, margin: '0 0 8px' }}>Preview: {preview.matchdays.length} matchday, {preview.matches.length} pertandingan</p>
          <button onClick={handleSave} style={{ width: '100%', padding: '10px', background: C.success, color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: 13, border: 'none', cursor: 'pointer' }}>Simpan Jadwal</button>
        </div>
      )}
    </div>
  );
};

// Reset League
const ResetLeague: React.FC<{ notify: (type: string, msg: string) => void; onRefresh: () => void }> = ({ notify, onRefresh }) => {
  const [confirmText, setConfirmText] = useState('');
  const [resetType, setResetType] = useState<'competition' | 'full'>('competition');

  const handleReset = () => {
    if (confirmText !== 'RESET LIGA') {
      notify('error', 'Ketik "RESET LIGA" untuk konfirmasi');
      return;
    }
    if (resetType === 'competition') {
      store.resetCompetitionData();
      notify('success', 'Data kompetisi berhasil direset');
    } else {
      store.resetFullLeague();
      notify('success', 'Liga berhasil direset sepenuhnya');
    }
    setConfirmText('');
    onRefresh();
  };

  return (
    <div style={{ background: C.surface, borderRadius: 10, padding: 16, border: `1px solid ${C.error}` }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: C.error, margin: '0 0 12px' }}>⚠️ Reset Liga</h3>
      <p style={{ fontSize: 12, color: C.textSecondary, margin: '0 0 16px', lineHeight: 1.6 }}>
        Fitur ini akan menghapus data liga. Gunakan dengan hati-hati.
      </p>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 8 }}>
          <input type="radio" checked={resetType === 'competition'} onChange={() => setResetType('competition')} style={{ width: 16, height: 16 }} />
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary, margin: 0 }}>Reset Data Kompetisi</p>
            <p style={{ fontSize: 11, color: C.textSecondary, margin: 0 }}>Hapus jadwal, hasil, statistik. Pertahankan tim, pemain, user.</p>
          </div>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input type="radio" checked={resetType === 'full'} onChange={() => setResetType('full')} style={{ width: 16, height: 16 }} />
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary, margin: 0 }}>Reset Liga Menyeluruh</p>
            <p style={{ fontSize: 11, color: C.textSecondary, margin: 0 }}>Hapus semua data kecuali Super Admin.</p>
          </div>
        </label>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: C.error, marginBottom: 4 }}>Ketik "RESET LIGA" untuk konfirmasi:</label>
        <input value={confirmText} onChange={e => setConfirmText(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.error}`, fontSize: 13 }} placeholder="RESET LIGA" />
      </div>

      <button onClick={handleReset} disabled={confirmText !== 'RESET LIGA'} style={{ width: '100%', padding: '10px', background: confirmText === 'RESET LIGA' ? C.error : C.border, color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: 13, border: 'none', cursor: confirmText === 'RESET LIGA' ? 'pointer' : 'not-allowed' }}>
        Reset Liga
      </button>
    </div>
  );
};

export default AdminSettings;
