import React, { useState } from 'react';
import { UserStory, Priority } from '../types';
import { generateBacklog } from '../services/geminiService';
import { Plus, Loader2, Target, ScrollText, Layers } from 'lucide-react';

interface ProductOwnerViewProps {
  vision: string;
  setVision: (v: string) => void;
  backlog: UserStory[];
  setBacklog: (stories: UserStory[]) => void;
}

const ProductOwnerView: React.FC<ProductOwnerViewProps> = ({ vision, setVision, backlog, setBacklog }) => {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!vision.trim()) return;
    setLoading(true);
    try {
      const newStoriesRaw = await generateBacklog(vision, backlog);
      const newStories: UserStory[] = newStoriesRaw.map((s, idx) => ({
        ...s,
        id: `story-${Date.now()}-${idx}`,
        status: 'To Do' as any // Default status
      }));
      setBacklog([...backlog, ...newStories]);
    } catch (error) {
      console.error("Failed to generate backlog", error);
      alert("Erro ao gerar backlog. Verifique sua chave de API ou tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (p: Priority) => {
    switch (p) {
      case Priority.HIGH: return 'bg-red-100 text-red-700 border-red-200';
      case Priority.MEDIUM: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case Priority.LOW: return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Área do Product Owner</h2>
          <p className="text-gray-500">Defina a visão e gerencie o Product Backlog.</p>
        </div>
        <div className="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100 text-indigo-700 flex items-center gap-2">
            <Target size={18} />
            <span className="font-medium">Modo Estratégico</span>
        </div>
      </header>

      {/* Vision Input */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Visão do Produto / Requisitos Brutos
        </label>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[120px]"
          placeholder="Ex: Quero um aplicativo de delivery de comida focada em pratos saudáveis, onde o usuário pode filtrar por restrições alimentares..."
          value={vision}
          onChange={(e) => setVision(e.target.value)}
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={loading || !vision}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-white font-medium transition-colors ${
              loading || !vision ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Layers size={20} />}
            <span>{loading ? 'Analisando e Gerando...' : 'Gerar Histórias com IA'}</span>
          </button>
        </div>
      </div>

      {/* Backlog List */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
            <ScrollText className="text-gray-600" />
            <h3 className="text-xl font-semibold text-gray-800">Product Backlog ({backlog.length})</h3>
        </div>

        {backlog.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">O backlog está vazio. Defina a visão acima para começar.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {backlog.map((story) => (
              <div key={story.id} className="bg-white p-5 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                            {story.storyPoints} pts
                        </span>
                        <h4 className="text-lg font-semibold text-gray-900">{story.title}</h4>
                    </div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${getPriorityColor(story.priority)}`}>
                    {story.priority}
                  </span>
                </div>
                <p className="text-gray-600 mb-3 text-sm">{story.description}</p>
                
                <div className="bg-gray-50 p-3 rounded text-sm text-gray-700">
                  <strong className="block text-gray-900 mb-1 text-xs uppercase tracking-wide">Critérios de Aceitação:</strong>
                  <ul className="list-disc pl-5 space-y-1">
                    {story.acceptanceCriteria.map((ac, i) => (
                      <li key={i}>{ac}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductOwnerView;
