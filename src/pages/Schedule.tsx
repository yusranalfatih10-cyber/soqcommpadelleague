import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Filter, ChevronDown } from 'lucide-react';
import { store } from '../store';
import { Team, Match, Matchday } from '../types';

interface SchedulePageProps {
  onViewMatch: (matchId: string) => void;
}

const SchedulePage: React.FC<SchedulePageProps> = ({ onViewMatch }) => {
  const teams = store.getTeams();
  const matches = store.getMatches();
  const matchdays = store.getMatchdays();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('all');
  const [selectedMatchday, setSelectedMatchday] = useState<string>('all');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');

  const getTeam = (id: string): Team | undefined => teams.find(t => t.id === id);
  const getMatchday = (id: string): Matchday | undefined => matchdays.find(md => md.id === id);

  const filteredMatches = matches.filter(m => {
    if (filter !== 'all' && m.status !== filter) return false;
    if (selectedMatchday !== 'all' && m.matchday_id !== selectedMatchday) return false;
    if (selectedTeam !== 'all' && m.team_a_id !== selectedTeam && m.team_b_id !== selectedTeam) return false;
    return true;
  });

  const groupedByMatchday = filteredMatches.reduce((acc: Record<string, Match[]>, match) => {
    const mdId = match.matchday_id;
    if (!acc[mdId]) acc[mdId] = [];
    acc[mdId].push(match);
    return acc;
  }, {});

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming': return { bg: 'bg-[#1599B8]/10', text: 'text-[#1599B8]', label: 'Akan Datang' };
      case 'ongoing': return { bg: 'bg-[#FF805E]/10', text: 'text-[#FF805E]', label: 'Berlangsung' };
      case 'completed': return { bg: 'bg-[#2EAD72]/10', text: 'text-[#2EAD72]', label: 'Selesai' };
      case 'cancelled': return { bg: 'bg-[#E65C5C]/10', text: 'text-[#E65C5C]', label: 'Dibatalkan' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-500', label: status };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-[#16B9C0]/10 flex items-center justify-center">
          <Calendar size={20} className="text-[#16B9C0]" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#173D4A] font-[Montserrat]">Jadwal Pertandingan</h1>
          <p className="text-xs text-[#718792]">{matches.length} pertandingan terjadwal</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-[#DCECEF] mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={16} className="text-[#718792]" />
          <span className="text-sm font-medium text-[#173D4A]">Filter</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Status filter */}
          <div className="flex flex-wrap gap-1">
            {[
              { value: 'all', label: 'Semua' },
              { value: 'upcoming', label: 'Akan Datang' },
              { value: 'ongoing', label: 'Berlangsung' },
              { value: 'completed', label: 'Selesai' },
            ].map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value as typeof filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f.value ? 'bg-[#16B9C0] text-white' : 'bg-[#F5FBFC] text-[#718792] hover:bg-[#DCECEF]'}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Matchday filter */}
          <div className="relative">
            <select
              value={selectedMatchday}
              onChange={(e) => setSelectedMatchday(e.target.value)}
              className="appearance-none px-3 py-1.5 pr-8 rounded-lg text-xs font-medium bg-[#F5FBFC] text-[#718792] border border-[#DCECEF] focus:outline-none focus:border-[#16B9C0]"
            >
              <option value="all">Semua Matchday</option>
              {matchdays.map(md => (
                <option key={md.id} value={md.id}>Matchday {md.matchday_number}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#718792] pointer-events-none" />
          </div>

          {/* Team filter */}
          <div className="relative">
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="appearance-none px-3 py-1.5 pr-8 rounded-lg text-xs font-medium bg-[#F5FBFC] text-[#718792] border border-[#DCECEF] focus:outline-none focus:border-[#16B9C0]"
            >
              <option value="all">Semua Tim</option>
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#718792] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Matches grouped by matchday */}
      {Object.keys(groupedByMatchday).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedByMatchday).map(([mdId, mdMatches]) => {
            const md = getMatchday(mdId);
            return (
              <div key={mdId}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-[#087E91] text-white text-xs font-bold rounded-full">
                    {md?.name}
                  </span>
                  <span className="text-xs text-[#718792]">{md?.date}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {mdMatches.map(match => {
                    const statusBadge = getStatusBadge(match.status);
                    return (
                      <div
                        key={match.id}
                        onClick={() => onViewMatch(match.id)}
                        className="bg-white rounded-xl p-4 shadow-sm border border-[#DCECEF] cursor-pointer hover:shadow-md transition-all"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className={`px-2 py-0.5 ${statusBadge.bg} ${statusBadge.text} text-xs font-medium rounded-full`}>
                            {statusBadge.label}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-[#718792]">
                            <MapPin size={12} /> Court {match.court}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#16B9C0] to-[#087E91] flex items-center justify-center text-white text-xs font-bold">
                                {getTeam(match.team_a_id)?.name.charAt(0)}
                              </div>
                              <span className="font-medium text-sm text-[#173D4A]">{getTeam(match.team_a_id)?.name}</span>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-[#718792] px-2">VS</span>
                          <div className="flex-1 text-right">
                            <div className="flex items-center gap-2 justify-end">
                              <span className="font-medium text-sm text-[#173D4A]">{getTeam(match.team_b_id)?.name}</span>
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF805E] to-[#e06040] flex items-center justify-center text-white text-xs font-bold">
                                {getTeam(match.team_b_id)?.name.charAt(0)}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-center gap-3 mt-3 text-xs text-[#718792]">
                          <span className="flex items-center gap-1"><Clock size={12} /> {match.start_time} - {match.end_time}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar size={48} className="mx-auto text-[#DCECEF] mb-4" />
          <h3 className="text-lg font-bold text-[#173D4A] mb-2">Tidak Ada Pertandingan</h3>
          <p className="text-sm text-[#718792]">Tidak ada pertandingan yang sesuai dengan filter yang dipilih.</p>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
