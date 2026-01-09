import React from 'react';
import { AppState, StoryStatus } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { ClipboardList, CheckCircle, AlertTriangle, Zap } from 'lucide-react';

interface DashboardProps {
  state: AppState;
}

const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  const totalPoints = state.backlog.reduce((acc, story) => acc + story.storyPoints, 0);
  const completedPoints = state.backlog
    .filter(s => s.status === StoryStatus.DONE)
    .reduce((acc, s) => acc + s.storyPoints, 0);
  
  const pendingStories = state.backlog.filter(s => s.status !== StoryStatus.DONE).length;
  const currentSprintName = state.currentSprint ? state.currentSprint.name : 'Nenhuma Sprint Ativa';

  // Data for Charts
  const statusData = [
    { name: 'A Fazer', value: state.backlog.filter(s => s.status === StoryStatus.TODO).length },
    { name: 'Em Progresso', value: state.backlog.filter(s => s.status === StoryStatus.IN_PROGRESS).length },
    { name: 'Concluído', value: state.backlog.filter(s => s.status === StoryStatus.DONE).length },
  ];

  const priorityData = [
    { name: 'Alta', count: state.backlog.filter(s => s.priority === 'Alta').length },
    { name: 'Média', count: state.backlog.filter(s => s.priority === 'Média').length },
    { name: 'Baixa', count: state.backlog.filter(s => s.priority === 'Baixa').length },
  ];

  const COLORS = ['#9CA3AF', '#60A5FA', '#34D399'];

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Dashboard do Projeto</h2>
        <p className="text-gray-500">Visão geral do progresso e métricas da equipe.</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
            <ClipboardList size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Backlog Restante</p>
            <h3 className="text-2xl font-bold text-gray-800">{pendingStories} <span className="text-sm font-normal">histórias</span></h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <Zap size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Sprint Atual</p>
            <h3 className="text-xl font-bold text-gray-800 truncate max-w-[150px]" title={currentSprintName}>{currentSprintName}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Progresso Total</p>
            <h3 className="text-2xl font-bold text-gray-800">
              {totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0}%
            </h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-full">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Impedimentos Ativos</p>
            <h3 className="text-2xl font-bold text-gray-800">
              {state.currentSprint ? state.currentSprint.impediments.length : 0}
            </h3>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Status das Histórias</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Distribuição por Prioridade</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip cursor={{fill: 'transparent'}}/>
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
