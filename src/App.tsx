import React from 'react';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { Layout } from './components/Layout';
import { DashboardView } from './components/DashboardView';
import { ChatView } from './components/ChatView';
import { ProjectView } from './components/ProjectView';
import { SprintsView } from './components/SprintsView';
import { DocumentsView } from './components/DocumentsView';
import { MeetingsView } from './components/MeetingsView';
import { AIAssistantView } from './components/AIAssistantView';
import { AnalyticsView } from './components/AnalyticsView';
import { AdminPanelView } from './components/AdminPanelView';
import { SettingsView } from './components/SettingsView';

const MainApp: React.FC = () => {
  const { activeView } = useWorkspace();

  const renderActiveView = () => {
    switch (activeView) {
      case 'Dashboard':
        return <DashboardView />;
      case 'Chat':
        return <ChatView />;
      case 'Projects':
        return <ProjectView />;
      case 'Sprints':
        return <SprintsView />;
      case 'Documents':
        return <DocumentsView />;
      case 'Meetings':
        return <MeetingsView />;
      case 'AI Assistant':
        return <AIAssistantView />;
      case 'Analytics':
        return <AnalyticsView />;
      case 'Admin Panel':
        return <AdminPanelView />;
      case 'Settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return <Layout>{renderActiveView()}</Layout>;
};

function App() {
  return (
    <WorkspaceProvider>
      <MainApp />
    </WorkspaceProvider>
  );
}

export default App;
