import React from 'react';
import { Users, Trophy, ChevronRight } from 'lucide-react';
import { store } from '../store';
import { Team, Standing } from '../types';

interface TeamsPageProps {
  onViewTeam: (teamId: string) => void;
}

const TeamsPage: React.FC<TeamsPageProps> = ({ onViewTeam }) => {
  const teams = store.getTeams().filter(t => t.is_active);
  const standings = store.getStandings();

  const getStanding = (teamId: string): Standing | undefined => standings.find(s => s.team_id === teamId);
  const getPosition = (teamId: string): number => standings.findIndex(s => s.team_id === teamId) + 1;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-[#1599B8]/10 flex items-center justify-center">
          <Users size={20} className="text-[#1599B8]" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#173D4A] font-[Montserrat]">Tim Peserta</h1>
          <p className="text-xs text-[#718792]">{teams.length} tim terdaftar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {teams.map(team => {
          const standing = getStanding(team.id);
          const position = getPosition(team.id);

          return (
            <div
              key={team.id}
              onClick={() => onViewTeam(team.id)}
              className="bg-white rounded-xl shadow-sm border border-[#DCECEF] overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group"
            >
              <div className="h-2 bg-gradient-to-r from-[#16B9C0] to-[#087E91]" />
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#16B9C0] to-[#087E91] flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-[#16B9C0]/20">
                    {team.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-[#173D4A] truncate">{team.name}</h3>
                    <p className="text-xs text-[#718792]">Kapten: {team.captain}</p>
                  </div>
                  {position > 0 && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${position === 1 ? 'bg-[#A8D82E] text-white' : position === 2 ? 'bg-[#16B9C0] text-white' : position === 3 ? 'bg-[#1599B8] text-white' : 'bg-[#DCECEF] text-[#718792]'}`}>
                      #{position}
                    </div>
                  )}
                </div>

                {standing && (
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="text-center bg-[#F5FBFC] rounded-lg py-2">
                      <p className="text-sm font-bold text-[#173D4A]">{standing.played}</p>
                      <p className="text-[10px] text-[#718792]">Main</p>
                    </div>
                    <div className="text-center bg-[#F5FBFC] rounded-lg py-2">
                      <p className="text-sm font-bold text-[#2EAD72]">{standing.won}</p>
                      <p className="text-[10px] text-[#718792]">Menang</p>
                    </div>
                    <div className="text-center bg-[#F5FBFC] rounded-lg py-2">
                      <p className="text-sm font-bold text-[#E65C5C]">{standing.lost}</p>
                      <p className="text-[10px] text-[#718792]">Kalah</p>
                    </div>
                    <div className="text-center bg-[#F5FBFC] rounded-lg py-2">
                      <p className="text-sm font-bold text-[#087E91]">{standing.points}</p>
                      <p className="text-[10px] text-[#718792]">Poin</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#718792]">{team.description}</span>
                  <ChevronRight size={16} className="text-[#16B9C0] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {teams.length === 0 && (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-[#DCECEF] mb-4" />
          <h3 className="text-lg font-bold text-[#173D4A] mb-2">Belum Ada Tim</h3>
          <p className="text-sm text-[#718792]">Tim peserta akan ditampilkan setelah admin mendaftarkan tim.</p>
        </div>
      )}
    </div>
  );
};

export default TeamsPage;
