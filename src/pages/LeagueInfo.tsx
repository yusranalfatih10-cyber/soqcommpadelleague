import React from 'react';
import { Info, Settings, Calendar, Users, Trophy, MapPin } from 'lucide-react';
import { store } from '../store';

const LeagueInfoPage: React.FC = () => {
  const league = store.getLeague();
  const teams = store.getTeams();
  const matches = store.getMatches();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-[#087E91]/10 flex items-center justify-center">
          <Info size={20} className="text-[#087E91]" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#173D4A] font-[Montserrat]">Informasi Liga</h1>
          <p className="text-xs text-[#718792]">Detail kompetisi SOQ.COMM PADEL LEAGUE</p>
        </div>
      </div>

      {/* League Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-[#DCECEF] overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-[#087E91] to-[#16B9C0] p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-2xl font-bold font-[Montserrat]">S</span>
            </div>
            <div>
              <h2 className="text-xl font-bold font-[Montserrat]">{league.name}</h2>
              <p className="text-sm text-white/80 italic">One League. One Community. One Passion.</p>
              <p className="text-xs text-white/60 mt-1">Season {league.season} • Papua Barat Daya, Indonesia</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <p className="text-sm text-[#718792] leading-relaxed">{league.description}</p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium" style={{
            backgroundColor: league.status === 'ongoing' ? '#2EAD7215' : league.status === 'upcoming' ? '#1599B815' : '#71879215',
            color: league.status === 'ongoing' ? '#2EAD72' : league.status === 'upcoming' ? '#1599B8' : '#718792'
          }}>
            <span className="w-2 h-2 rounded-full" style={{
              backgroundColor: league.status === 'ongoing' ? '#2EAD72' : league.status === 'upcoming' ? '#1599B8' : '#718792'
            }} />
            {league.status === 'ongoing' ? 'Kompetisi Berlangsung' : league.status === 'upcoming' ? 'Segera Dimulai' : 'Selesai'}
          </div>
        </div>
      </div>

      {/* Competition Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-[#DCECEF]">
          <div className="flex items-center gap-2 mb-4">
            <Settings size={16} className="text-[#16B9C0]" />
            <h3 className="text-sm font-bold text-[#173D4A] font-[Montserrat]">Format Kompetisi</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-[#DCECEF]">
              <span className="text-sm text-[#718792]">Jumlah Tim</span>
              <span className="text-sm font-semibold text-[#173D4A]">{league.settings.teams_count} tim</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#DCECEF]">
              <span className="text-sm text-[#718792]">Pasangan per Tim</span>
              <span className="text-sm font-semibold text-[#173D4A]">{league.settings.pairs_per_team} pasangan</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#DCECEF]">
              <span className="text-sm text-[#718792]">Pasangan Dimainkan</span>
              <span className="text-sm font-semibold text-[#173D4A]">{league.settings.pairs_played} pasangan</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#DCECEF]">
              <span className="text-sm text-[#718792]">Jumlah Court</span>
              <span className="text-sm font-semibold text-[#173D4A]">{league.settings.courts_count} court</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-[#718792]">Format Pertandingan</span>
              <span className="text-sm font-semibold text-[#173D4A]">{league.settings.match_format === 'single_set' ? 'Single Set' : 'Best of 3'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-[#DCECEF]">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={16} className="text-[#A8D82E]" />
            <h3 className="text-sm font-bold text-[#173D4A] font-[Montserrat]">Sistem Poin & Tie-break</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-[#DCECEF]">
              <span className="text-sm text-[#718792]">Menang</span>
              <span className="text-sm font-semibold text-[#2EAD72]">{league.settings.points_win} poin</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#DCECEF]">
              <span className="text-sm text-[#718792]">Seri</span>
              <span className="text-sm font-semibold text-[#F2A23A]">{league.settings.points_draw} poin</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#DCECEF]">
              <span className="text-sm text-[#718792]">Kalah</span>
              <span className="text-sm font-semibold text-[#E65C5C]">{league.settings.points_loss} poin</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#DCECEF]">
              <span className="text-sm text-[#718792]">Target Game</span>
              <span className="text-sm font-semibold text-[#173D4A]">{league.settings.target_games} game</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-[#718792]">Golden Point</span>
              <span className="text-sm font-semibold text-[#173D4A]">{league.settings.golden_point ? 'Ya' : 'Tidak'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tie-break Rules */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-[#DCECEF] mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Users size={16} className="text-[#1599B8]" />
          <h3 className="text-sm font-bold text-[#173D4A] font-[Montserrat]">Aturan Tie-break</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {league.settings.tiebreak_order.map((rule, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#16B9C0]/10 text-[#087E91] text-xs font-bold flex items-center justify-center">{idx + 1}</span>
              <span className="text-sm text-[#173D4A]">
                {rule === 'points' && 'Poin klasemen'}
                {rule === 'head_to_head' && 'Hasil pertemuan langsung'}
                {rule === 'pair_difference' && 'Selisih kemenangan pasangan'}
                {rule === 'pair_wins' && 'Total kemenangan pasangan'}
              </span>
              {idx < league.settings.tiebreak_order.length - 1 && <span className="text-[#DCECEF]">→</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#DCECEF] text-center">
          <Users size={24} className="mx-auto text-[#16B9C0] mb-2" />
          <p className="text-2xl font-bold text-[#173D4A] font-[Montserrat]">{teams.filter(t => t.is_active).length}</p>
          <p className="text-xs text-[#718792]">Tim Aktif</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#DCECEF] text-center">
          <Calendar size={24} className="mx-auto text-[#1599B8] mb-2" />
          <p className="text-2xl font-bold text-[#173D4A] font-[Montserrat]">{matches.length}</p>
          <p className="text-xs text-[#718792]">Total Pertandingan</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#DCECEF] text-center">
          <MapPin size={24} className="mx-auto text-[#A8D82E] mb-2" />
          <p className="text-2xl font-bold text-[#173D4A] font-[Montserrat]">{league.settings.courts_count}</p>
          <p className="text-xs text-[#718792]">Court Tersedia</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#DCECEF] text-center">
          <Trophy size={24} className="mx-auto text-[#FF805E] mb-2" />
          <p className="text-2xl font-bold text-[#173D4A] font-[Montserrat]">{matches.filter(m => m.status === 'completed').length}</p>
          <p className="text-xs text-[#718792]">Pertandingan Selesai</p>
        </div>
      </div>
    </div>
  );
};

export default LeagueInfoPage;
