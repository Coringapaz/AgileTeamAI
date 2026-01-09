import React from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, ListTodo, CalendarClock, MessageSquare } from 'lucide-react';

interface LayoutProps {
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, setCurrentView, children }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'product-owner', label: 'Product Owner', icon: ListTodo },
    { id: 'scrum-master', label: 'Scrum Master', icon: CalendarClock },
    { id: 'meetings', label: 'Reuniões', icon: MessageSquare },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-10 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            AgileTeamAI
          </h1>
          <p className="text-xs text-gray-500 mt-1">Simulador de Equipe Ágil</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as ViewState)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                currentView === item.id
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="text-xs text-gray-400 text-center">
            Powered by Gemini AI
          </div>
        </div>
      </aside>

      {/* Mobile Nav Header (Visible only on small screens) */}
      <div className="md:hidden fixed top-0 w-full bg-white border-b border-gray-200 z-20 p-4 flex justify-between items-center">
         <h1 className="text-xl font-bold text-indigo-600">AgileTeamAI</h1>
         <div className="flex space-x-4">
             {navItems.map(item => (
                 <button key={item.id} onClick={() => setCurrentView(item.id as ViewState)} className={currentView === item.id ? 'text-indigo-600' : 'text-gray-500'}>
                     <item.icon size={24} />
                 </button>
             ))}
         </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto h-full">
            {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
