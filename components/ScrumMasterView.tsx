import React, { useState } from 'react';
import { UserStory, Sprint, AppState, Impediment } from '../types';
import { planSprint, analyzeImpediments } from '../services/geminiService';
import { Calendar, Play, Loader2, AlertTriangle, CheckSquare, ShieldAlert } from 'lucide-react';

interface ScrumMasterViewProps {
  state: AppState;
  updateSprint: (sprint: Sprint) => void;
}

const ScrumMasterView: React.FC<ScrumMasterViewProps> = ({ state, updateSprint }) => {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [velocity, setVelocity] = useState(20);

  const handlePlanSprint = async () => {
    if (state.backlog.length === 0) {
        alert("O Backlog está vazio. Peça ao PO para criar histórias primeiro.");
        return;
    }
    setLoading(true);
    try {
      // Filter out DONE stories
      const availableBacklog = state.backlog.filter(s => s.status !== 'Done');
      
      const plan = await planSprint(availableBacklog, velocity);
      
      // Map IDs back to full objects
      const selectedStories = state.backlog.filter(s => plan.selectedIds.includes(s.id));
      
      const newSprint: Sprint = {
        id: `sprint-${Date.now()}`,
        name: `Sprint ${state.currentSprint ? parseInt(state.currentSprint.name.split(' ')[1] || '0') + 1 : 1}`,
        goal: plan.goal,
        stories: selectedStories,
        impediments: [],
        status: 'Active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // +2 weeks
      };
      
      updateSprint(newSprint);
    } catch (error) {
      console.error("Planning failed", error);
      alert("Falha ao planejar sprint.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeRisks = async () => {
    if (!state.currentSprint) return;
    setAnalyzing(true);
    try {
      const risks = await analyzeImpediments(state.currentSprint);
      const newImpediments: Impediment[] = risks.map((r, i) => ({
        ...r,
        id: `imp-${Date.now()}-${i}`
      }));
      
      updateSprint({
        ...state.currentSprint,
        impediments: [...state.currentSprint.impediments, ...newImpediments]
      });
    } catch (error) {
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Área do Scrum Master</h2>
          <p className="text-gray-500">Planeje Sprints, remova impedimentos e garanta o fluxo.</p>
        </div>
        <div className="bg-orange-50 px-4 py-2 rounded-lg border border-orange-100 text-orange-700 flex items-center gap-2">
            <ShieldAlert size={18} />
            <span className="font-medium">Gestão de Processo</span>
        </div>
      </header>

      {/* No Sprint State */}
      {!state.currentSprint ? (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
            <Calendar size={48} className="mx-auto text-indigo-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Nenhuma Sprint Ativa</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Utilize a IA para analisar o backlog priorizado e sugerir o melhor escopo para a próxima iteração.
            </p>
            
            <div className="flex items-center justify-center gap-4 mb-6">
                <label className="text-sm font-medium text-gray-700">Velocidade da Equipe (pts):</label>
                <input 
                    type="number" 
                    value={velocity} 
                    onChange={(e) => setVelocity(Number(e.target.value))}
                    className="w-20 p-2 border rounded text-center"
                />
            </div>

            <button
                onClick={handlePlanSprint}
                disabled={loading}
                className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
                {loading ? <Loader2 className="animate-spin" /> : <Play size={20} />}
                <span>Planejar Sprint com IA</span>
            </button>
        </div>
      ) : (
        <div className="space-y-6">
            {/* Active Sprint Dashboard */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-indigo-900">{state.currentSprint.name}</h3>
                        <p className="text-indigo-700 text-sm mt-1">Goal: <strong>{state.currentSprint.goal}</strong></p>
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                        Ativa
                    </span>
                </div>
                
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                            <CheckSquare size={18} />
                            Backlog da Sprint
                        </h4>
                        <button 
                            onClick={handleAnalyzeRisks}
                            disabled={analyzing}
                            className="text-sm flex items-center gap-2 text-orange-600 hover:text-orange-700 border border-orange-200 bg-orange-50 px-3 py-1.5 rounded transition-colors"
                        >
                            {analyzing ? <Loader2 className="animate-spin" size={14}/> : <AlertTriangle size={14} />}
                            Detectar Impedimentos
                        </button>
                    </div>

                    <div className="space-y-3">
                        {state.currentSprint.stories.map(story => (
                            <div key={story.id} className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                                <div>
                                    <span className="font-medium text-gray-800">{story.title}</span>
                                    <span className="ml-2 text-xs text-gray-500 bg-white px-2 py-0.5 rounded border">{story.storyPoints} pts</span>
                                </div>
                                <span className="text-xs text-gray-500">{story.priority}</span>
                            </div>
                        ))}
                    </div>

                    {/* Impediments Section */}
                    {state.currentSprint.impediments.length > 0 && (
                        <div className="mt-8 animate-fade-in">
                            <h4 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
                                <AlertTriangle size={18} />
                                Impedimentos Identificados
                            </h4>
                            <div className="grid gap-3">
                                {state.currentSprint.impediments.map(imp => (
                                    <div key={imp.id} className="bg-red-50 border border-red-100 p-4 rounded-lg">
                                        <div className="flex justify-between">
                                            <p className="text-red-800 font-medium">{imp.description}</p>
                                            <span className="text-xs bg-white text-red-600 px-2 py-1 rounded border border-red-100 h-fit">
                                                {imp.severity}
                                            </span>
                                        </div>
                                        <p className="text-red-600 text-sm mt-2 italic">
                                            Sugestão: {imp.suggestedResolution}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ScrumMasterView;
