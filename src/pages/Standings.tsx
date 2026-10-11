import React from 'react';
import { Trophy, Info } from 'lucide-react';
import { store } from '../store';
import { Standing, Team } from '../types';

interface StandingsPageProps {
  onViewTeam: (teamId: string) => void;
}

const StandingsPage: React.FC<StandingsPageProps> = ({ onViewTeam }) => {
  const teams = store.getTeams();
  const standings = store.getStandings();
  const league = store.getLeague();

  const getTeam = (id: string): Team | undefined => teams.find(t => t.id === id);

  const getPositionStyle = (idx: number) => {
    if (idx === 0) return 'bg-gradient-to-r from-[#A8D82E]/20 to-transparent border-l-4 border-l-[#A8D82E]';
    if (idx === 1) return 'bg-gradient-to-r from-[#16B9C0]/10 to-transparent border-l-4 border-l-[#16B9C0]';
    if (idx === 2) return 'bg-gradient-to-r from-[#1599B8]/10 to-transparent border-l-4 border-l-[#1599B8]';
    return '';
  };

  const getPositionBadge = (idx: number) => {
    if (idx === 0) return 'bg-[#A8D82E] text-white';
    if (idx === 1) return 'bg-[#16B9C0] text-white';
    if (idx === 2) return 'bg-[#1599B8] text-white';
    return 'bg-[#DCECEF] text-[#718792]';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-[#16B9C0]/10 flex items-center justify-center">
          <Trophy size={20} className="text-[#16B9C0]" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#173D4A] font-[Montserrat]">Klasemen Liga</h1>
          <p className="text-xs text-[#718792]">Season {league.season}</p>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-[#DCECEF] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#087E91] text-white">
                <th className="px-4 py-3 text-left font-semibold w-12">Pos</th>
                <th className="px-4 py-3 text-left font-semibold">Tim</th>
                <th className="px-4 py-3 text-center font-semibold">Main</th>
                <th className="px-4 py-3 text-center font-semibold">Menang</th>
                <th className="px-4 py-3 text-center font-semibold">Kalah</th>
                <th className="px-4 py-3 text-center font-semibold">MP</th>
                <th className="px-4 py-3 text-center font-semibold">KP</th>
                <th className="px-4 py-3 text-center font-semibold">Selisih</th>
                <th className="px-4 py-3 text-center font-semibold">Poin</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s: Standing, idx: number) => (
                <tr
                  key={s.team_id}
                  onClick={() => onViewTeam(s.team_id)}
                  className={`border-b border-[#DCECEF] last:border-0 hover:bg-[#F5FBFC] cursor-pointer transition-colors ${getPositionStyle(idx)}`}
                >
                  <td className="px-4 py-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${getPositionBadge(idx)}`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#16B9C0] to-[#087E91] flex items-center justify-center text-white text-xs font-bold">
                        {getTeam(s.team_id)?.name.charAt(0)}
                      </div>
                      <span className="font-medium text-[#173D4A]">{getTeam(s.team_id)?.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-[#718792]">{s.played}</td>
                  <td className="px-4 py-3 text-center text-[#2EAD72] font-semibold">{s.won}</td>
                  <td className="px-4 py-3 text-center text-[#E65C5C] font-semibold">{s.lost}</td>
                  <td className="px-4 py-3 text-center text-[#173D4A]">{s.pair_wins}</td>
                  <td className="px-4 py-3 text-center text-[#173D4A]">{s.pair_losses}</td>
                  <td className="px-4 py-3 text-center text-[#173D4A] font-medium">{s.pair_wins - s.pair_losses > 0 ? '+' : ''}{s.pair_wins - s.pair_losses}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#16B9C0]/10 text-[#087E91] font-bold">
                      {s.points}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {standings.map((s: Standing, idx: number) => (
          <div
            key={s.team_id}
            onClick={() => onViewTeam(s.team_id)}
            className={`bg-white rounded-xl p-4 shadow-sm border border-[#DCECEF] cursor-pointer hover:shadow-md transition-all ${getPositionStyle(idx)}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getPositionBadge(idx)}`}>
                {idx + 1}
              </span>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#16B9C0] to-[#087E91] flex items-center justify-center text-white font-bold">
                {getTeam(s.team_id)?.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[#173D4A]">{getTeam(s.team_id)?.name}</p>
                <p className="text-xs text-[#718792]">{s.played} pertandingan</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#087E91] font-[Montserrat]">{s.points}</p>
                <p className="text-[10px] text-[#718792]">poin</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-[#F5FBFC] rounded-lg py-2">
                <p className="text-sm font-bold text-[#2EAD72]">{s.won}</p>
                <p className="text-[10px] text-[#718792]">Menang</p>
              </div>
              <div className="bg-[#F5FBFC] rounded-lg py-2">
                <p className="text-sm font-bold text-[#E65C5C]">{s.lost}</p>
                <p className="text-[10px] text-[#718792]">Kalah</p>
              </div>
              <div className="bg-[#F5FBFC] rounded-lg py-2">
                <p className="text-sm font-bold text-[#173D4A]">{s.pair_wins}</p>
                <p className="text-[10px] text-[#718792]">MP</p>
              </div>
              <div className="bg-[#F5FBFC] rounded-lg py-2">
                <p className="text-sm font-bold text-[#173D4A]">{s.pair_losses}</p>
                <p className="text-[10px] text-[#718792]">KP</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 bg-white rounded-xl p-4 shadow-sm border border-[#DCECEF]">
        <div className="flex items-center gap-2 mb-3">
          <Info size={16} className="text-[#16B9C0]" />
          <h3 className="text-sm font-semibold text-[#173D4A]">Aturan Penghitungan Poin</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-[#718792]">
          <p>• Menang pertandingan: <span className="font-semibold text-[#173D4A]">{league.settings.points_win} poin</span></p>
          <p>• Seri pertandingan: <span className="font-semibold text-[#173D4A]">{league.settings.points_draw} poin</span></p>
          <p>• Kalah pertandingan: <span className="font-semibold text-[#173D4A]">{league.settings.points_loss} poin</span></p>
          <p>• MP = Menang Pasangan, KP = Kalah Pasangan</p>
        </div>
        <div className="mt-3 pt-3 border-t border-[#DCECEF]">
          <p className="text-xs text-[#718792]">
            <span className="font-semibold">Tie-break:</span> {league.settings.tiebreak_order.map((t, i) => (
              <span key={i}>
                {i > 0 && ' → '}
                {t === 'points' && 'Poin klasemen'}
                {t === 'head_to_head' && 'Head-to-head'}
                {t === 'pair_difference' && 'Selisih pasangan'}
                {t === 'pair_wins' && 'Total menang pasangan'}
              </span>
            ))}
          </p>
        </div>
      </div>

      {standings.length === 0 && (
        <div className="text-center py-12">
          <Trophy size={48} className="mx-auto text-[#DCECEF] mb-4" />
          <h3 className="text-lg font-bold text-[#173D4A] mb-2">Belum Ada Klasemen</h3>
          <p className="text-sm text-[#718792]">Klasemen akan muncul setelah pertandingan pertama selesai.</p>
        </div>
      )}
    </div>
  );
};

export default StandingsPage;
