import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ProductOwnerView from './components/ProductOwnerView';
import ScrumMasterView from './components/ScrumMasterView';
import MeetingRoom from './components/MeetingRoom';
import { AppState, ViewState, UserStory, Sprint } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  
  // Central State
  const [vision, setVision] = useState('');
  const [backlog, setBacklog] = useState<UserStory[]>([]);
  const [currentSprint, setCurrentSprint] = useState<Sprint | null>(null);
  
  // Derived AppState to pass down
  const appState: AppState = {
    projectVision: vision,
    backlog,
    currentSprint,
    meetingReports: []
  };

  const updateSprint = (sprint: Sprint) => {
    setCurrentSprint(sprint);
    // Also update backlog statuses for selected stories
    const sprintStoryIds = sprint.stories.map(s => s.id);
    setBacklog(prev => prev.map(story => 
        sprintStoryIds.includes(story.id) ? { ...story, status: 'In Progress' } : story
    ));
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard state={appState} />;
      case 'product-owner':
        return (
          <ProductOwnerView 
            vision={vision} 
            setVision={setVision}
            backlog={backlog}
            setBacklog={setBacklog}
          />
        );
      case 'scrum-master':
        return (
          <ScrumMasterView 
            state={appState}
            updateSprint={updateSprint}
          />
        );
      case 'meetings':
        return <MeetingRoom state={appState} />;
      default:
        return <Dashboard state={appState} />;
    }
  };

  return (
    <Layout currentView={currentView} setCurrentView={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

export default App;
