import React, { useState } from 'react';
import { AppState } from '../types';
import { simulateMeeting } from '../services/geminiService';
import { Users, Play, StopCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface MeetingRoomProps {
  state: AppState;
}

const MeetingRoom: React.FC<MeetingRoomProps> = ({ state }) => {
  const [activeMeeting, setActiveMeeting] = useState<'Daily' | 'Review' | 'Retrospective' | null>(null);
  const [simulationOutput, setSimulationOutput] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);

  const startMeeting = async (type: 'Daily' | 'Review' | 'Retrospective') => {
    if (!state.currentSprint && type !== 'Daily') { // Daily might happen before sprint strictly starts in some sims, but let's assume sprint needed
        // Assuming sprint needed for context
    }

    setActiveMeeting(type);
    setSimulationOutput("");
    setIsStreaming(true);

    try {
        const stream = simulateMeeting(type, {
            sprint: state.currentSprint,
            backlogSummary: state.backlog.slice(0, 5), // pass simplified context
            impediments: state.currentSprint?.impediments || []
        });

        for await (const chunk of stream) {
            setSimulationOutput(prev => prev + chunk);
        }
    } catch (e) {
        console.error(e);
        setSimulationOutput("Erro ao conectar com a equipe simulada.");
    } finally {
        setIsStreaming(false);
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <header>
        <h2 className="text-3xl font-bold text-gray-800">Sala de Reunião</h2>
        <p className="text-gray-500">Simule cerimônias ágeis com os agentes de IA.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
            onClick={() => startMeeting('Daily')}
            disabled={isStreaming || !state.currentSprint}
            className={`p-4 rounded-xl border transition-all text-left ${
                activeMeeting === 'Daily' ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-100' : 'bg-white border-gray-200 hover:border-blue-300'
            } ${!state.currentSprint ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <div className="bg-blue-100 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                <Users size={20} />
            </div>
            <h3 className="font-bold text-gray-800">Daily Scrum</h3>
            <p className="text-sm text-gray-500 mt-1">Alinhamento diário de 15 min.</p>
        </button>

        <button
            onClick={() => startMeeting('Review')}
            disabled={isStreaming || !state.currentSprint}
            className={`p-4 rounded-xl border transition-all text-left ${
                activeMeeting === 'Review' ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-100' : 'bg-white border-gray-200 hover:border-purple-300'
            } ${!state.currentSprint ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <div className="bg-purple-100 text-purple-600 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                <Play size={20} />
            </div>
            <h3 className="font-bold text-gray-800">Sprint Review</h3>
            <p className="text-sm text-gray-500 mt-1">Demonstração do incremento.</p>
        </button>

        <button
            onClick={() => startMeeting('Retrospective')}
            disabled={isStreaming || !state.currentSprint}
            className={`p-4 rounded-xl border transition-all text-left ${
                activeMeeting === 'Retrospective' ? 'bg-green-50 border-green-300 ring-2 ring-green-100' : 'bg-white border-gray-200 hover:border-green-300'
            } ${!state.currentSprint ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <div className="bg-green-100 text-green-600 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                <StopCircle size={20} />
            </div>
            <h3 className="font-bold text-gray-800">Retrospectiva</h3>
            <p className="text-sm text-gray-500 mt-1">Melhoria contínua do processo.</p>
        </button>
      </div>

      {/* Simulation Output Area */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[400px] flex flex-col">
        <div className="flex justify-between items-center mb-4 pb-4 border-b">
            <h3 className="text-lg font-semibold text-gray-700">
                {activeMeeting ? `Simulação: ${activeMeeting}` : 'Selecione uma reunião para começar'}
            </h3>
            {isStreaming && (
                <span className="flex items-center text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full animate-pulse">
                    <span className="w-2 h-2 bg-indigo-600 rounded-full mr-2"></span>
                    Equipe falando...
                </span>
            )}
        </div>

        <div className="prose prose-sm max-w-none flex-1 overflow-y-auto pr-2">
            {simulationOutput ? (
                <ReactMarkdown>{simulationOutput}</ReactMarkdown>
            ) : (
                <div className="text-center text-gray-400 mt-20">
                    <Users size={48} className="mx-auto mb-4 opacity-20" />
                    <p>A transcrição da reunião aparecerá aqui.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default MeetingRoom;
