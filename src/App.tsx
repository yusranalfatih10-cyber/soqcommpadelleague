import React, { useState, useCallback } from 'react';
import Layout from './Layout';
import HomePage from './pages/Home';
import StandingsPage from './pages/Standings';
import SchedulePage from './pages/Schedule';
import ResultsPage from './pages/Results';
import TeamsPage from './pages/Teams';
import StatisticsPage from './pages/Statistics';
import LeagueInfoPage from './pages/LeagueInfo';
import MatchDetailPage from './pages/MatchDetail';
import TeamDetailPage from './pages/TeamDetail';
import AdminPanel from './pages/AdminPanel';
import { Page } from './types';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [showAdmin, setShowAdmin] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [previousPage, setPreviousPage] = useState<Page>('home');

  const handleNavigate = useCallback((page: Page) => {
    setCurrentPage(page);
    setSelectedMatchId(null);
    setSelectedTeamId(null);
    window.scrollTo(0, 0);
  }, []);

  const handleViewMatch = useCallback((matchId: string) => {
    setPreviousPage(currentPage);
    setSelectedMatchId(matchId);
    setCurrentPage('match-detail' as Page);
    window.scrollTo(0, 0);
  }, [currentPage]);

  const handleViewTeam = useCallback((teamId: string) => {
    setPreviousPage(currentPage);
    setSelectedTeamId(teamId);
    setCurrentPage('team-detail' as Page);
    window.scrollTo(0, 0);
  }, [currentPage]);

  const handleBackFromDetail = useCallback(() => {
    setCurrentPage(previousPage);
    setSelectedMatchId(null);
    setSelectedTeamId(null);
  }, [previousPage]);

  const handleAdminLogin = useCallback(() => {
    setShowAdmin(true);
  }, []);

  const handleExitAdmin = useCallback(() => {
    setShowAdmin(false);
  }, []);

  if (showAdmin) {
    return <AdminPanel onExit={handleExitAdmin} />;
  }

  const renderPage = () => {
    if (currentPage === 'match-detail' && selectedMatchId) {
      return <MatchDetailPage matchId={selectedMatchId} onBack={handleBackFromDetail} onViewTeam={handleViewTeam} />;
    }
    if (currentPage === 'team-detail' && selectedTeamId) {
      return <TeamDetailPage teamId={selectedTeamId} onBack={handleBackFromDetail} onViewMatch={handleViewMatch} />;
    }

    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} onViewMatch={handleViewMatch} onViewTeam={handleViewTeam} />;
      case 'standings':
        return <StandingsPage onViewTeam={handleViewTeam} />;
      case 'schedule':
        return <SchedulePage onViewMatch={handleViewMatch} />;
      case 'results':
        return <ResultsPage onViewMatch={handleViewMatch} />;
      case 'teams':
        return <TeamsPage onViewTeam={handleViewTeam} />;
      case 'statistics':
        return <StatisticsPage />;
      case 'league-info':
        return <LeagueInfoPage />;
      default:
        return <HomePage onNavigate={handleNavigate} onViewMatch={handleViewMatch} onViewTeam={handleViewTeam} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate} onAdminLogin={handleAdminLogin}>
      {renderPage()}
    </Layout>
  );
}

export default App;
