import React, { useState } from 'react';
import { CheckCircle, MapPin, Clock } from 'lucide-react';
import { store } from '../store';
import { Team, Match, Matchday, PairMatchResult } from '../types';

interface ResultsPageProps {
  onViewMatch: (matchId: string) => void;
}

const ResultsPage: React.FC<ResultsPageProps> = ({ onViewMatch }) => {
  const teams = store.getTeams();
  const matches = store.getMatches();
  const matchdays = store.getMatchdays();
  const pairResults = store.getPairResults();
  const [selectedMatchday, setSelectedMatchday] = useState<string>('all');

  const getTeam = (id: string): Team | undefined => teams.find(t => t.id === id);
  const getMatchday = (id: string): Matchday | undefined => matchdays.find(md => md.id === id);

  const completedMatches = matches
    .filter(m => m.status === 'completed')
    .filter(m => selectedMatchday === 'all' || m.matchday_id === selectedMatchday)
    .reverse();

  const getMatchPairResults = (matchId: string): PairMatchResult[] => {
    return pairResults.filter(r => r.match_id === matchId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-[#2EAD72]/10 flex items-center justify-center">
          <CheckCircle size={20} className="text-[#2EAD72]" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#173D4A] font-[Montserrat]">Hasil Pertandingan</h1>
          <p className="text-xs text-[#718792]">{completedMatches.length} pertandingan selesai</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2">
        <button
          onClick={() => setSelectedMatchday('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${selectedMatchday === 'all' ? 'bg-[#16B9C0] text-white' : 'bg-white text-[#718792] border border-[#DCECEF]'}`}
        >
          Semua
        </button>
        {matchdays.filter(md => md.status === 'completed').map(md => (
          <button
            key={md.id}
            onClick={() => setSelectedMatchday(md.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${selectedMatchday === md.id ? 'bg-[#16B9C0] text-white' : 'bg-white text-[#718792] border border-[#DCECEF]'}`}
          >
            {md.name}
          </button>
        ))}
      </div>

      {/* Results */}
      {completedMatches.length > 0 ? (
        <div className="space-y-4">
          {completedMatches.map(match => {
            const md = getMatchday(match.matchday_id);
            const results = getMatchPairResults(match.id);
            const teamAWins = results.filter(r => r.winner_team_id === match.team_a_id).length;
            const teamBWins = results.filter(r => r.winner_team_id === match.team_b_id).length;

            return (
              <div key={match.id} onClick={() => onViewMatch(match.id)} className="bg-white rounded-xl shadow-sm border border-[#DCECEF] overflow-hidden cursor-pointer hover:shadow-md transition-all">
                <div className="px-4 py-2 bg-[#F5FBFC] border-b border-[#DCECEF] flex items-center justify-between">
                  <span className="text-xs font-medium text-[#087E91]">{md?.name} • {md?.date}</span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs text-[#718792]"><MapPin size={12} /> Court {match.court}</span>
                    <span className="flex items-center gap-1 text-xs text-[#718792]"><Clock size={12} /> {match.start_time}</span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#16B9C0] to-[#087E91] flex items-center justify-center text-white text-sm font-bold">
                        {getTeam(match.team_a_id)?.name.charAt(0)}
                      </div>
                      <div>
                        <p className={`font-semibold text-sm ${match.winner_team_id === match.team_a_id ? 'text-[#16B9C0]' : 'text-[#173D4A]'}`}>
                          {getTeam(match.team_a_id)?.name}
                        </p>
                        {match.winner_team_id === match.team_a_id && <span className="text-[10px] text-[#2EAD72] font-medium">PEMENANG</span>}
                      </div>
                    </div>
                    <div className="text-center px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-[#173D4A] font-[Montserrat]">{teamAWins}</span>
                        <span className="text-sm text-[#718792]">-</span>
                        <span className="text-2xl font-bold text-[#173D4A] font-[Montserrat]">{teamBWins}</span>
                      </div>
                      <p className="text-[10px] text-[#718792]">Pasangan</p>
                    </div>
                    <div className="flex items-center gap-2 flex-1 justify-end">
                      <div className="text-right">
                        <p className={`font-semibold text-sm ${match.winner_team_id === match.team_b_id ? 'text-[#16B9C0]' : 'text-[#173D4A]'}`}>
                          {getTeam(match.team_b_id)?.name}
                        </p>
                        {match.winner_team_id === match.team_b_id && <span className="text-[10px] text-[#2EAD72] font-medium">PEMENANG</span>}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF805E] to-[#e06040] flex items-center justify-center text-white text-sm font-bold">
                        {getTeam(match.team_b_id)?.name.charAt(0)}
                      </div>
                    </div>
                  </div>

                  {/* Pair results */}
                  {results.length > 0 && (
                    <div className="border-t border-[#DCECEF] pt-3 mt-3">
                      <div className="space-y-1">
                        {results.map(r => (
                          <div key={r.id} className="flex items-center justify-between text-xs">
                            <span className="text-[#718792]">Pasangan {r.position}</span>
                            <div className="flex items-center gap-2">
                              <span className={`font-semibold ${r.winner_team_id === match.team_a_id ? 'text-[#2EAD72]' : 'text-[#718792]'}`}>{r.score_team_a}</span>
                              <span className="text-[#DCECEF]">-</span>
                              <span className={`font-semibold ${r.winner_team_id === match.team_b_id ? 'text-[#2EAD72]' : 'text-[#718792]'}`}>{r.score_team_b}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <CheckCircle size={48} className="mx-auto text-[#DCECEF] mb-4" />
          <h3 className="text-lg font-bold text-[#173D4A] mb-2">Belum Ada Hasil</h3>
          <p className="text-sm text-[#718792]">Hasil pertandingan akan muncul setelah pertandingan selesai.</p>
        </div>
      )}
    </div>
  );
};

export default ResultsPage;
