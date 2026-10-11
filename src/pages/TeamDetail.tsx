import React from 'react';
import { ArrowLeft, Users, Trophy, Calendar, CheckCircle } from 'lucide-react';
import { store } from '../store';
import { Team, Standing, Match, Pair, Player } from '../types';

interface TeamDetailPageProps {
  teamId: string;
  onBack: () => void;
  onViewMatch: (matchId: string) => void;
}

const TeamDetailPage: React.FC<TeamDetailPageProps> = ({ teamId, onBack, onViewMatch }) => {
  const team = store.getTeams().find(t => t.id === teamId);
  const standings = store.getStandings();
  const matches = store.getMatches();
  const pairs = store.getPairs().filter(p => p.team_id === teamId && p.is_active);
  const players = store.getPlayers().filter(p => p.team_id === teamId && p.is_active);
  const matchdays = store.getMatchdays();

  if (!team) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 text-center">
        <p className="text-[#718792]">Tim tidak ditemukan.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-[#16B9C0] text-white rounded-lg text-sm">Kembali</button>
      </div>
    );
  }

  const standing = standings.find(s => s.team_id === teamId);
  const position = standings.findIndex(s => s.team_id === teamId) + 1;

  const teamMatches = matches.filter(m => m.team_a_id === teamId || m.team_b_id === teamId);
  const completedMatches = teamMatches.filter(m => m.status === 'completed');
  const upcomingMatches = teamMatches.filter(m => m.status === 'upcoming');

  const getOpponent = (match: Match): Team | undefined => {
    const oppId = match.team_a_id === teamId ? match.team_b_id : match.team_a_id;
    return store.getTeams().find(t => t.id === oppId);
  };

  const getMatchday = (id: string) => matchdays.find(md => md.id === id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-[#718792] hover:text-[#16B9C0] mb-4 transition-colors">
        <ArrowLeft size={16} /> Kembali
      </button>

      {/* Team Header */}
      <div className="bg-white rounded-xl shadow-sm border border-[#DCECEF] overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-[#087E91] to-[#16B9C0] p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl md:text-3xl font-bold">
              {team.name.charAt(0)}
            </div>
            <div className="text-white">
              <h1 className="text-xl md:text-2xl font-bold font-[Montserrat]">{team.name}</h1>
              <p className="text-sm text-white/80">Kapten: {team.captain}</p>
              <p className="text-xs text-white/60 mt-1">{team.description}</p>
            </div>
          </div>
        </div>

        {standing && (
          <div className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="text-center bg-[#F5FBFC] rounded-lg p-3">
                <p className="text-xs text-[#718792] mb-1">Posisi</p>
                <p className="text-xl font-bold text-[#087E91] font-[Montserrat]">#{position}</p>
              </div>
              <div className="text-center bg-[#F5FBFC] rounded-lg p-3">
                <p className="text-xs text-[#718792] mb-1">Poin</p>
                <p className="text-xl font-bold text-[#16B9C0] font-[Montserrat]">{standing.points}</p>
              </div>
              <div className="text-center bg-[#F5FBFC] rounded-lg p-3">
                <p className="text-xs text-[#718792] mb-1">Main</p>
                <p className="text-xl font-bold text-[#173D4A] font-[Montserrat]">{standing.played}</p>
              </div>
              <div className="text-center bg-[#F5FBFC] rounded-lg p-3">
                <p className="text-xs text-[#718792] mb-1">Menang</p>
                <p className="text-xl font-bold text-[#2EAD72] font-[Montserrat]">{standing.won}</p>
              </div>
              <div className="text-center bg-[#F5FBFC] rounded-lg p-3">
                <p className="text-xs text-[#718792] mb-1">Kalah</p>
                <p className="text-xl font-bold text-[#E65C5C] font-[Montserrat]">{standing.lost}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pairs */}
      <div className="bg-white rounded-xl shadow-sm border border-[#DCECEF] overflow-hidden mb-6">
        <div className="px-5 py-3 bg-[#F5FBFC] border-b border-[#DCECEF] flex items-center gap-2">
          <Users size={16} className="text-[#16B9C0]" />
          <h3 className="text-sm font-bold text-[#173D4A] font-[Montserrat]">Pasangan Pemain</h3>
        </div>
        <div className="p-5">
          {pairs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pairs.map((pair: Pair) => {
                const p1 = players.find(p => p.id === pair.player_1_id);
                const p2 = players.find(p => p.id === pair.player_2_id);
                return (
                  <div key={pair.id} className="border border-[#DCECEF] rounded-lg p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#16B9C0]/10 flex items-center justify-center text-[#087E91] text-xs font-bold">
                      {pair.pair_name.split(' ').pop()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#173D4A]">{p1?.name || 'Pemain 1'}</p>
                      <p className="text-xs text-[#718792]">& {p2?.name || 'Pemain 2'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-[#718792] text-center py-4">Belum ada pasangan terdaftar.</p>
          )}
        </div>
      </div>

      {/* Players */}
      <div className="bg-white rounded-xl shadow-sm border border-[#DCECEF] overflow-hidden mb-6">
        <div className="px-5 py-3 bg-[#F5FBFC] border-b border-[#DCECEF] flex items-center gap-2">
          <Users size={16} className="text-[#1599B8]" />
          <h3 className="text-sm font-bold text-[#173D4A] font-[Montserrat]">Daftar Pemain</h3>
        </div>
        <div className="p-5">
          {players.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {players.map((player: Player) => (
                <div key={player.id} className="flex items-center gap-2 p-2 rounded-lg bg-[#F5FBFC]">
                  <div className="w-8 h-8 rounded-full bg-[#1599B8]/10 flex items-center justify-center text-[#1599B8] text-xs font-bold">
                    {player.name.charAt(0)}
                  </div>
                  <span className="text-xs font-medium text-[#173D4A] truncate">{player.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#718792] text-center py-4">Belum ada pemain terdaftar.</p>
          )}
        </div>
      </div>

      {/* Recent Matches */}
      {completedMatches.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-[#DCECEF] overflow-hidden mb-6">
          <div className="px-5 py-3 bg-[#F5FBFC] border-b border-[#DCECEF] flex items-center gap-2">
            <CheckCircle size={16} className="text-[#2EAD72]" />
            <h3 className="text-sm font-bold text-[#173D4A] font-[Montserrat]">Hasil Pertandingan Terakhir</h3>
          </div>
          <div className="p-5 space-y-2">
            {completedMatches.slice(-5).reverse().map(match => {
              const opponent = getOpponent(match);
              const isWin = match.winner_team_id === teamId;
              const md = getMatchday(match.matchday_id);
              return (
                <div key={match.id} onClick={() => onViewMatch(match.id)} className="flex items-center justify-between p-3 rounded-lg border border-[#DCECEF] cursor-pointer hover:bg-[#F5FBFC] transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isWin ? 'bg-[#2EAD72] text-white' : 'bg-[#E65C5C] text-white'}`}>
                      {isWin ? 'W' : 'L'}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-[#173D4A]">vs {opponent?.name}</p>
                      <p className="text-xs text-[#718792]">{md?.name} • {md?.date}</p>
                    </div>
                  </div>
                  <span className="text-xs text-[#718792]">Court {match.court}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming Matches */}
      {upcomingMatches.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-[#DCECEF] overflow-hidden">
          <div className="px-5 py-3 bg-[#F5FBFC] border-b border-[#DCECEF] flex items-center gap-2">
            <Calendar size={16} className="text-[#1599B8]" />
            <h3 className="text-sm font-bold text-[#173D4A] font-[Montserrat]">Jadwal Mendatang</h3>
          </div>
          <div className="p-5 space-y-2">
            {upcomingMatches.slice(0, 3).map(match => {
              const opponent = getOpponent(match);
              const md = getMatchday(match.matchday_id);
              return (
                <div key={match.id} onClick={() => onViewMatch(match.id)} className="flex items-center justify-between p-3 rounded-lg border border-[#DCECEF] cursor-pointer hover:bg-[#F5FBFC] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#1599B8]/10 flex items-center justify-center text-[#1599B8] text-xs font-bold">
                      {opponent?.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#173D4A]">vs {opponent?.name}</p>
                      <p className="text-xs text-[#718792]">{md?.name} • {md?.date} • {match.start_time}</p>
                    </div>
                  </div>
                  <span className="text-xs text-[#718792]">Court {match.court}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamDetailPage;
