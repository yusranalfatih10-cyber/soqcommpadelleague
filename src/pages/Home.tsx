import React from 'react';
import { Trophy, Calendar, Users, CheckCircle, ChevronRight, MapPin, Clock } from 'lucide-react';
import { store } from '../store';
import { Page, Team, Match, Standing } from '../types';

interface HomePageProps {
  onNavigate: (page: Page) => void;
  onViewMatch: (matchId: string) => void;
  onViewTeam: (teamId: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate, onViewMatch, onViewTeam }) => {
  const league = store.getLeague();
  const teams = store.getTeams();
  const matches = store.getMatches();
  const standings = store.getStandings();
  const matchdays = store.getMatchdays();

  const completedMatches = matches.filter(m => m.status === 'completed');
  const upcomingMatches = matches.filter(m => m.status === 'upcoming');
  const nextMatch = upcomingMatches[0];
  const recentResults = completedMatches.slice(-4).reverse();
  const topStandings = standings.slice(0, 5);

  const getTeam = (id: string): Team | undefined => teams.find(t => t.id === id);
  const getMatchday = (id: string) => matchdays.find(md => md.id === id);

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#F5FBFC] via-white to-[#E8F8F9] overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-[#16B9C0] blur-3xl" />
          <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-[#A8D82E] blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 relative">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#16B9C0]/10 rounded-full mb-4">
                <span className="w-2 h-2 rounded-full bg-[#16B9C0] animate-pulse-soft" />
                <span className="text-xs font-medium text-[#087E91]">
                  {league.status === 'ongoing' ? 'Kompetisi Berlangsung' : league.status === 'upcoming' ? 'Segera Dimulai' : 'Selesai'}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-[#173D4A] font-[Montserrat] mb-3">
                SOQ.COMM<br />
                <span className="text-[#16B9C0]">PADEL LEAGUE</span>
              </h1>
              <p className="text-[#718792] text-sm md:text-base mb-2 italic">One League. One Community. One Passion.</p>
              <p className="text-[#718792] text-sm md:text-base mb-6 max-w-lg">
                {league.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <button onClick={() => onNavigate('standings')} className="px-6 py-3 bg-[#16B9C0] text-white rounded-xl font-semibold text-sm hover:bg-[#0fa8ae] transition-all shadow-lg shadow-[#16B9C0]/20">
                  Lihat Klasemen
                </button>
                <button onClick={() => onNavigate('schedule')} className="px-6 py-3 bg-white text-[#16B9C0] border-2 border-[#16B9C0] rounded-xl font-semibold text-sm hover:bg-[#16B9C0]/5 transition-all">
                  Jadwal Pertandingan
                </button>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-[#16B9C0] to-[#087E91] flex items-center justify-center shadow-2xl shadow-[#16B9C0]/30">
                <div className="text-center text-white">
                  <span className="text-4xl md:text-5xl font-bold font-[Montserrat]">S</span>
                  <div className="w-12 h-1 bg-[#A8D82E] rounded-full mx-auto mt-2" />
                  <p className="text-xs mt-2 font-medium opacity-80">SEASON {league.season}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="max-w-7xl mx-auto px-4 -mt-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { icon: <Users size={20} />, label: 'Total Tim', value: teams.length, color: '#16B9C0' },
            { icon: <Calendar size={20} />, label: 'Total Pertandingan', value: matches.length, color: '#1599B8' },
            { icon: <CheckCircle size={20} />, label: 'Selesai', value: completedMatches.length, color: '#2EAD72' },
            { icon: <Trophy size={20} />, label: 'Mendatang', value: upcomingMatches.length, color: '#F2A23A' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-[#DCECEF] hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#173D4A] font-[Montserrat]">{stat.value}</p>
                  <p className="text-xs text-[#718792]">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Next Match */}
      {nextMatch && (
        <section className="max-w-7xl mx-auto px-4 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#173D4A] font-[Montserrat]">Pertandingan Berikutnya</h2>
            <button onClick={() => onNavigate('schedule')} className="text-sm text-[#16B9C0] font-medium flex items-center gap-1">
              Lihat Semua <ChevronRight size={14} />
            </button>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-[#DCECEF]">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="px-2 py-0.5 bg-[#16B9C0]/10 text-[#087E91] text-xs font-medium rounded-full">
                {getMatchday(nextMatch.matchday_id)?.name}
              </span>
              <span className="px-2 py-0.5 bg-[#A8D82E]/20 text-[#5a7a18] text-xs font-medium rounded-full">
                Akan Datang
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#16B9C0] to-[#087E91] mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg">
                  {getTeam(nextMatch.team_a_id)?.name.charAt(0)}
                </div>
                <p className="font-semibold text-sm text-[#173D4A]">{getTeam(nextMatch.team_a_id)?.name}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#718792]">VS</p>
                <div className="flex items-center gap-1 text-xs text-[#718792] mt-1">
                  <MapPin size={12} /> Court {nextMatch.court}
                </div>
              </div>
              <div className="flex-1 text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#FF805E] to-[#e06040] mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg">
                  {getTeam(nextMatch.team_b_id)?.name.charAt(0)}
                </div>
                <p className="font-semibold text-sm text-[#173D4A]">{getTeam(nextMatch.team_b_id)?.name}</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-[#718792]">
              <span className="flex items-center gap-1"><Calendar size={12} /> {nextMatch.start_time && getMatchday(nextMatch.matchday_id)?.date}</span>
              <span className="flex items-center gap-1"><Clock size={12} /> {nextMatch.start_time} - {nextMatch.end_time}</span>
            </div>
          </div>
        </section>
      )}

      {/* Recent Results */}
      {recentResults.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#173D4A] font-[Montserrat]">Hasil Terbaru</h2>
            <button onClick={() => onNavigate('results')} className="text-sm text-[#16B9C0] font-medium flex items-center gap-1">
              Lihat Semua <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentResults.map(match => (
              <div key={match.id} onClick={() => onViewMatch(match.id)} className="bg-white rounded-xl p-4 shadow-sm border border-[#DCECEF] cursor-pointer hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#718792]">{getMatchday(match.matchday_id)?.name}</span>
                  <span className="px-2 py-0.5 bg-[#2EAD72]/10 text-[#2EAD72] text-xs font-medium rounded-full">Selesai</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className={`font-semibold text-sm ${match.winner_team_id === match.team_a_id ? 'text-[#16B9C0]' : 'text-[#173D4A]'}`}>
                      {getTeam(match.team_a_id)?.name}
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-[#F5FBFC] rounded-lg text-sm font-bold text-[#173D4A]">
                    {match.winner_team_id === match.team_a_id ? 'WIN' : match.winner_team_id === match.team_b_id ? 'LOSS' : 'DRAW'}
                  </div>
                  <div className="flex-1 text-right">
                    <p className={`font-semibold text-sm ${match.winner_team_id === match.team_b_id ? 'text-[#16B9C0]' : 'text-[#173D4A]'}`}>
                      {getTeam(match.team_b_id)?.name}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Top Standings */}
      {topStandings.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mt-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#173D4A] font-[Montserrat]">Klasemen Sementara</h2>
            <button onClick={() => onNavigate('standings')} className="text-sm text-[#16B9C0] font-medium flex items-center gap-1">
              Klasemen Lengkap <ChevronRight size={14} />
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-[#DCECEF] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#087E91] text-white">
                    <th className="px-3 py-3 text-left font-semibold">Pos</th>
                    <th className="px-3 py-3 text-left font-semibold">Tim</th>
                    <th className="px-3 py-3 text-center font-semibold">M</th>
                    <th className="px-3 py-3 text-center font-semibold">Me</th>
                    <th className="px-3 py-3 text-center font-semibold">K</th>
                    <th className="px-3 py-3 text-center font-semibold">Poin</th>
                  </tr>
                </thead>
                <tbody>
                  {topStandings.map((s: Standing, idx: number) => (
                    <tr key={s.team_id} onClick={() => onViewTeam(s.team_id)} className="border-b border-[#DCECEF] last:border-0 hover:bg-[#F5FBFC] cursor-pointer transition-colors">
                      <td className="px-3 py-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-[#A8D82E] text-white' : idx === 1 ? 'bg-[#16B9C0] text-white' : idx === 2 ? 'bg-[#1599B8] text-white' : 'bg-[#DCECEF] text-[#718792]'}`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-medium text-[#173D4A]">{getTeam(s.team_id)?.name}</td>
                      <td className="px-3 py-3 text-center text-[#718792]">{s.played}</td>
                      <td className="px-3 py-3 text-center text-[#2EAD72] font-medium">{s.won}</td>
                      <td className="px-3 py-3 text-center text-[#E65C5C] font-medium">{s.lost}</td>
                      <td className="px-3 py-3 text-center font-bold text-[#173D4A]">{s.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {teams.length === 0 && (
        <section className="max-w-7xl mx-auto px-4 mt-12 text-center">
          <div className="py-12">
            <Trophy size={48} className="mx-auto text-[#DCECEF] mb-4" />
            <h3 className="text-lg font-bold text-[#173D4A] mb-2">Belum Ada Data</h3>
            <p className="text-sm text-[#718792]">Data kompetisi akan ditampilkan setelah admin menambahkan tim dan jadwal pertandingan.</p>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
