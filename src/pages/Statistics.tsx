import React from 'react';
import { BarChart3, TrendingUp, Award, Users } from 'lucide-react';
import { store } from '../store';
import { Team, Standing } from '../types';

const StatisticsPage: React.FC = () => {
  const teams = store.getTeams();
  const matches = store.getMatches();
  const standings = store.getStandings();
  const pairs = store.getPairs();
  const pairResults = store.getPairResults();

  const getTeam = (id: string): Team | undefined => teams.find(t => t.id === id);
  const completedMatches = matches.filter(m => m.status === 'completed');

  const topTeams = standings.slice(0, 5);
  const maxPoints = Math.max(...standings.map(s => s.points), 1);

  const pairWinCounts: Record<string, number> = {};
  pairResults.forEach(r => {
    if (r.winner_team_id) {
      const key = r.winner_team_id === getTeam(r.team_a_pair_id?.split('-')[1] || '')?.id ? r.team_a_pair_id : r.team_b_pair_id;
      pairWinCounts[key] = (pairWinCounts[key] || 0) + 1;
    }
  });

  const totalPairWins = pairResults.length;
  const teamAWins = pairResults.filter(r => {
    const match = matches.find(m => m.id === r.match_id);
    return match && r.winner_team_id === match.team_a_id;
  }).length;
  const teamBWins = totalPairWins - teamAWins;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-[#A8D82E]/10 flex items-center justify-center">
          <BarChart3 size={20} className="text-[#A8D82E]" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#173D4A] font-[Montserrat]">Statistik Liga</h1>
          <p className="text-xs text-[#718792]">Data performa kompetisi</p>
        </div>
      </div>

      {completedMatches.length === 0 ? (
        <div className="text-center py-12">
          <BarChart3 size={48} className="mx-auto text-[#DCECEF] mb-4" />
          <h3 className="text-lg font-bold text-[#173D4A] mb-2">Belum Ada Data Statistik</h3>
          <p className="text-sm text-[#718792]">Statistik akan tersedia setelah pertandingan pertama selesai.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-[#DCECEF]">
              <div className="flex items-center gap-2 mb-2">
                <Users size={16} className="text-[#16B9C0]" />
                <span className="text-xs text-[#718792]">Total Tim</span>
              </div>
              <p className="text-2xl font-bold text-[#173D4A] font-[Montserrat]">{teams.filter(t => t.is_active).length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-[#DCECEF]">
              <div className="flex items-center gap-2 mb-2">
                <Award size={16} className="text-[#2EAD72]" />
                <span className="text-xs text-[#718792]">Pertandingan Selesai</span>
              </div>
              <p className="text-2xl font-bold text-[#173D4A] font-[Montserrat]">{completedMatches.length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-[#DCECEF]">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} className="text-[#A8D82E]" />
                <span className="text-xs text-[#718792]">Total Pasangan</span>
              </div>
              <p className="text-2xl font-bold text-[#173D4A] font-[Montserrat]">{pairs.filter(p => p.is_active).length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-[#DCECEF]">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 size={16} className="text-[#FF805E]" />
                <span className="text-xs text-[#718792]">Total Pasangan Bertanding</span>
              </div>
              <p className="text-2xl font-bold text-[#173D4A] font-[Montserrat]">{totalPairWins}</p>
            </div>
          </div>

          {/* Standings Chart */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-[#DCECEF]">
            <h3 className="text-sm font-bold text-[#173D4A] mb-4 font-[Montserrat]">Poin Klasemen Tim</h3>
            <div className="space-y-3">
              {topTeams.map((s: Standing, idx: number) => {
                const team = getTeam(s.team_id);
                const percentage = (s.points / maxPoints) * 100;
                return (
                  <div key={s.team_id} className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-[#A8D82E] text-white' : idx === 1 ? 'bg-[#16B9C0] text-white' : 'bg-[#DCECEF] text-[#718792]'}`}>
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium text-[#173D4A] w-32 truncate">{team?.name}</span>
                    <div className="flex-1 h-6 bg-[#F5FBFC] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#16B9C0] to-[#087E91] flex items-center justify-end pr-2 transition-all duration-700"
                        style={{ width: `${Math.max(percentage, 8)}%` }}
                      >
                        <span className="text-[10px] font-bold text-white">{s.points}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Win Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-[#DCECEF]">
              <h3 className="text-sm font-bold text-[#173D4A] mb-4 font-[Montserrat]">Distribusi Kemenangan Pasangan</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#718792]">Tim A menang</span>
                    <span className="text-sm font-bold text-[#16B9C0]">{teamAWins}</span>
                  </div>
                  <div className="h-4 bg-[#F5FBFC] rounded-full overflow-hidden">
                    <div className="h-full bg-[#16B9C0] rounded-full transition-all duration-700" style={{ width: `${totalPairWins > 0 ? (teamAWins / totalPairWins) * 100 : 0}%` }} />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#718792]">Tim B menang</span>
                    <span className="text-sm font-bold text-[#FF805E]">{teamBWins}</span>
                  </div>
                  <div className="h-4 bg-[#F5FBFC] rounded-full overflow-hidden">
                    <div className="h-full bg-[#FF805E] rounded-full transition-all duration-700" style={{ width: `${totalPairWins > 0 ? (teamBWins / totalPairWins) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-[#DCECEF]">
              <h3 className="text-sm font-bold text-[#173D4A] mb-4 font-[Montserrat]">Performa Tim</h3>
              <div className="space-y-2">
                {standings.slice(0, 4).map((s: Standing) => {
                  const team = getTeam(s.team_id);
                  const winRate = s.played > 0 ? Math.round((s.won / s.played) * 100) : 0;
                  return (
                    <div key={s.team_id} className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[#173D4A] truncate w-28">{team?.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-[#F5FBFC] rounded-full overflow-hidden">
                          <div className="h-full bg-[#2EAD72] rounded-full" style={{ width: `${winRate}%` }} />
                        </div>
                        <span className="text-xs font-bold text-[#2EAD72] w-8 text-right">{winRate}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Team Performance Table */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-[#DCECEF]">
            <h3 className="text-sm font-bold text-[#173D4A] mb-4 font-[Montserrat]">Riwayat Performa Tim</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#DCECEF]">
                    <th className="text-left py-2 text-xs font-semibold text-[#718792]">Tim</th>
                    <th className="text-center py-2 text-xs font-semibold text-[#718792]">Main</th>
                    <th className="text-center py-2 text-xs font-semibold text-[#718792]">Menang</th>
                    <th className="text-center py-2 text-xs font-semibold text-[#718792]">Kalah</th>
                    <th className="text-center py-2 text-xs font-semibold text-[#718792]">Win Rate</th>
                    <th className="text-center py-2 text-xs font-semibold text-[#718792]">MP</th>
                    <th className="text-center py-2 text-xs font-semibold text-[#718792]">KP</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((s: Standing) => {
                    const team = getTeam(s.team_id);
                    const winRate = s.played > 0 ? Math.round((s.won / s.played) * 100) : 0;
                    return (
                      <tr key={s.team_id} className="border-b border-[#DCECEF] last:border-0">
                        <td className="py-2 font-medium text-[#173D4A]">{team?.name}</td>
                        <td className="py-2 text-center text-[#718792]">{s.played}</td>
                        <td className="py-2 text-center text-[#2EAD72] font-medium">{s.won}</td>
                        <td className="py-2 text-center text-[#E65C5C] font-medium">{s.lost}</td>
                        <td className="py-2 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${winRate >= 60 ? 'bg-[#2EAD72]/10 text-[#2EAD72]' : winRate >= 40 ? 'bg-[#F2A23A]/10 text-[#F2A23A]' : 'bg-[#E65C5C]/10 text-[#E65C5C]'}`}>
                            {winRate}%
                          </span>
                        </td>
                        <td className="py-2 text-center text-[#173D4A]">{s.pair_wins}</td>
                        <td className="py-2 text-center text-[#173D4A]">{s.pair_losses}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatisticsPage;
