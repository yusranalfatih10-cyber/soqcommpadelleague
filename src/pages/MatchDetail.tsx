import React from 'react';
import { ArrowLeft, MapPin, Clock, Calendar, Trophy, Users } from 'lucide-react';
import { store } from '../store';
import { Match, Team, Matchday, PairMatchResult, Pair, Player } from '../types';

interface MatchDetailPageProps {
  matchId: string;
  onBack: () => void;
  onViewTeam: (teamId: string) => void;
}

const MatchDetailPage: React.FC<MatchDetailPageProps> = ({ matchId, onBack, onViewTeam }) => {
  const match = store.getMatches().find(m => m.id === matchId);
  const teams = store.getTeams();
  const matchdays = store.getMatchdays();
  const pairResults = store.getPairResults();
  const pairs = store.getPairs();
  const players = store.getPlayers();

  if (!match) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 text-center">
        <p className="text-[#718792]">Pertandingan tidak ditemukan.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-[#16B9C0] text-white rounded-lg text-sm">Kembali</button>
      </div>
    );
  }

  const teamA = teams.find(t => t.id === match.team_a_id);
  const teamB = teams.find(t => t.id === match.team_b_id);
  const matchday = matchdays.find(md => md.id === match.matchday_id);
  const results = pairResults.filter(r => r.match_id === matchId);

  const getPlayerName = (playerId: string): string => {
    const player = players.find(p => p.id === playerId);
    return player?.name || 'Pemain';
  };

  const getPair = (pairId: string): Pair | undefined => pairs.find(p => p.id === pairId);

  const getStatusBadge = () => {
    switch (match.status) {
      case 'upcoming': return { bg: 'bg-[#1599B8]/10', text: 'text-[#1599B8]', label: 'Akan Datang' };
      case 'ongoing': return { bg: 'bg-[#FF805E]/10', text: 'text-[#FF805E]', label: 'LIVE' };
      case 'completed': return { bg: 'bg-[#2EAD72]/10', text: 'text-[#2EAD72]', label: 'Selesai' };
      case 'cancelled': return { bg: 'bg-[#E65C5C]/10', text: 'text-[#E65C5C]', label: 'Dibatalkan' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-500', label: match.status };
    }
  };

  const statusBadge = getStatusBadge();
  const teamAWins = results.filter(r => r.winner_team_id === match.team_a_id).length;
  const teamBWins = results.filter(r => r.winner_team_id === match.team_b_id).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-[#718792] hover:text-[#16B9C0] mb-4 transition-colors">
        <ArrowLeft size={16} /> Kembali
      </button>

      {/* Match Header */}
      <div className="bg-white rounded-xl shadow-sm border border-[#DCECEF] overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-[#087E91] to-[#16B9C0] p-4 flex items-center justify-between">
          <span className="text-white text-sm font-medium">{matchday?.name}</span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadge.bg} ${statusBadge.text}`}>
            {statusBadge.label}
          </span>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#16B9C0] to-[#087E91] mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-[#16B9C0]/20">
                {teamA?.name.charAt(0)}
              </div>
              <button onClick={() => onViewTeam(match.team_a_id)} className="font-bold text-sm md:text-base text-[#173D4A] hover:text-[#16B9C0] transition-colors">
                {teamA?.name}
              </button>
              {match.winner_team_id === match.team_a_id && (
                <span className="block text-xs text-[#2EAD72] font-medium mt-1">🏆 PEMENANG</span>
              )}
            </div>

            <div className="text-center px-4">
              {match.status === 'completed' ? (
                <div className="flex items-center gap-3">
                  <span className="text-3xl md:text-4xl font-bold text-[#173D4A] font-[Montserrat]">{teamAWins}</span>
                  <span className="text-lg text-[#718792]">-</span>
                  <span className="text-3xl md:text-4xl font-bold text-[#173D4A] font-[Montserrat]">{teamBWins}</span>
                </div>
              ) : (
                <span className="text-2xl font-bold text-[#718792]">VS</span>
              )}
              <p className="text-xs text-[#718792] mt-1">Pasangan</p>
            </div>

            <div className="flex-1 text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#FF805E] to-[#e06040] mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-[#FF805E]/20">
                {teamB?.name.charAt(0)}
              </div>
              <button onClick={() => onViewTeam(match.team_b_id)} className="font-bold text-sm md:text-base text-[#173D4A] hover:text-[#16B9C0] transition-colors">
                {teamB?.name}
              </button>
              {match.winner_team_id === match.team_b_id && (
                <span className="block text-xs text-[#2EAD72] font-medium mt-1">🏆 PEMENANG</span>
              )}
            </div>
          </div>

          {/* Match Info */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-4 border-t border-[#DCECEF]">
            <span className="flex items-center gap-1 text-xs text-[#718792]">
              <Calendar size={14} /> {matchday?.date}
            </span>
            <span className="flex items-center gap-1 text-xs text-[#718792]">
              <Clock size={14} /> {match.start_time} - {match.end_time}
            </span>
            <span className="flex items-center gap-1 text-xs text-[#718792]">
              <MapPin size={14} /> Court {match.court}
            </span>
          </div>
        </div>
      </div>

      {/* Pair Results */}
      {results.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-[#DCECEF] overflow-hidden mb-6">
          <div className="px-5 py-3 bg-[#F5FBFC] border-b border-[#DCECEF]">
            <h3 className="text-sm font-bold text-[#173D4A] font-[Montserrat]">Hasil Pertandingan Pasangan</h3>
          </div>
          <div className="p-5">
            <div className="space-y-3">
              {results.map(r => {
                const pairA = getPair(r.team_a_pair_id);
                const pairB = getPair(r.team_b_pair_id);
                const playerA1 = pairA ? getPlayerName(pairA.player_1_id) : '';
                const playerA2 = pairA ? getPlayerName(pairA.player_2_id) : '';
                const playerB1 = pairB ? getPlayerName(pairB.player_1_id) : '';
                const playerB2 = pairB ? getPlayerName(pairB.player_2_id) : '';

                return (
                  <div key={r.id} className="border border-[#DCECEF] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-[#087E91]">Pasangan {r.position}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.winner_team_id === match.team_a_id ? 'bg-[#2EAD72]/10 text-[#2EAD72]' : 'bg-[#FF805E]/10 text-[#FF805E]'}`}>
                        {r.winner_team_id === match.team_a_id ? teamA?.name : teamB?.name} menang
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#173D4A]">{playerA1}</p>
                        <p className="text-xs text-[#718792]">{playerA2}</p>
                      </div>
                      <div className="flex items-center gap-2 px-4">
                        <span className={`text-xl font-bold ${r.winner_team_id === match.team_a_id ? 'text-[#2EAD72]' : 'text-[#718792]'}`}>{r.score_team_a}</span>
                        <span className="text-sm text-[#DCECEF]">-</span>
                        <span className={`text-xl font-bold ${r.winner_team_id === match.team_b_id ? 'text-[#2EAD72]' : 'text-[#718792]'}`}>{r.score_team_b}</span>
                      </div>
                      <div className="flex-1 text-right">
                        <p className="text-sm font-medium text-[#173D4A]">{playerB1}</p>
                        <p className="text-xs text-[#718792]">{playerB2}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* No results yet */}
      {match.status === 'upcoming' && (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-[#DCECEF] text-center">
          <Users size={40} className="mx-auto text-[#DCECEF] mb-3" />
          <h3 className="text-sm font-bold text-[#173D4A] mb-1">Pertandingan Belum Dimulai</h3>
          <p className="text-xs text-[#718792]">Detail pasangan dan skor akan tersedia setelah pertandingan dimulai.</p>
        </div>
      )}
    </div>
  );
};

export default MatchDetailPage;
