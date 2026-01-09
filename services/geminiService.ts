import { GoogleGenAI, Type } from "@google/genai";
import { UserStory, Sprint, Impediment, Priority, StoryStatus } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Helper Schema Definitions ---

const userStorySchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Título curto da história" },
    description: { type: Type.STRING, description: "Descrição no formato 'Como [persona], eu quero [ação], para que [benefício]'" },
    acceptanceCriteria: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Lista de critérios de aceitação testáveis" 
    },
    storyPoints: { type: Type.INTEGER, description: "Estimativa Fibonacci (1, 2, 3, 5, 8, 13)" },
    priority: { type: Type.STRING, enum: ["Alta", "Média", "Baixa"] },
  },
  required: ["title", "description", "acceptanceCriteria", "storyPoints", "priority"],
};

const sprintPlanSchema = {
  type: Type.OBJECT,
  properties: {
    sprintGoal: { type: Type.STRING, description: "O objetivo principal desta sprint" },
    selectedStoryIds: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "IDs das histórias selecionadas do backlog que cabem na sprint" 
    },
    rationale: { type: Type.STRING, description: "Explicação curta do Scrum Master sobre a seleção" }
  },
  required: ["sprintGoal", "selectedStoryIds", "rationale"],
};

const impedimentSchema = {
  type: Type.OBJECT,
  properties: {
    impediments: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          suggestedResolution: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ["Alta", "Média", "Baixa"] }
        },
        required: ["description", "suggestedResolution", "severity"]
      }
    }
  },
  required: ["impediments"]
};

// --- API Functions ---

export const generateBacklog = async (vision: string, currentBacklog: UserStory[] = []): Promise<Omit<UserStory, 'id' | 'status'>[]> => {
  const model = "gemini-3-pro-preview"; // Using Pro for better reasoning on requirements
  
  const prompt = `
    Atue como um Product Owner experiente.
    Visão do Produto: "${vision}"
    
    Analise a visão e crie novas histórias de usuário detalhadas.
    Se já houver histórias, crie apenas novas que faltam.
    Retorne apenas JSON.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: userStorySchema
      }
    }
  });

  const rawStories = JSON.parse(response.text || "[]");
  return rawStories;
};

export const planSprint = async (backlog: UserStory[], velocity: number = 20): Promise<{ goal: string, selectedIds: string[], rationale: string }> => {
  const model = "gemini-3-pro-preview"; // Logic heavy task
  
  const simplifiedBacklog = backlog.map(s => ({ id: s.id, title: s.title, points: s.storyPoints, priority: s.priority }));
  
  const prompt = `
    Atue como um Scrum Master.
    Temos uma velocidade média de equipe de ${velocity} pontos.
    Planeje a próxima sprint selecionando histórias do backlog abaixo.
    Priorize histórias de alta prioridade, mas respeite a capacidade.
    
    Backlog Disponível:
    ${JSON.stringify(simplifiedBacklog)}
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: sprintPlanSchema
    }
  });

  const result = JSON.parse(response.text || "{}");
  return {
    goal: result.sprintGoal,
    selectedIds: result.selectedStoryIds || [],
    rationale: result.rationale
  };
};

export const analyzeImpediments = async (sprint: Sprint): Promise<Omit<Impediment, 'id'>[]> => {
  const model = "gemini-3-flash-preview"; 
  
  const prompt = `
    Atue como um Agile Coach / Scrum Master.
    Analise a Sprint atual e identifique possíveis riscos ou impedimentos baseados na natureza das histórias.
    
    Sprint Goal: ${sprint.goal}
    Stories: ${sprint.stories.map(s => s.title).join(', ')}
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: impedimentSchema
    }
  });

  const result = JSON.parse(response.text || "{}");
  return result.impediments || [];
};

export const simulateMeeting = async function* (
  type: 'Daily' | 'Review' | 'Retrospective', 
  contextData: any
) {
  const model = "gemini-3-flash-preview"; // Fast streaming for chat
  
  const prompt = `
    Atue como um facilitador de reuniões ágeis (Scrum Master).
    Estamos conduzindo uma reunião do tipo: ${type}.
    Contexto do Projeto: ${JSON.stringify(contextData)}
    
    Gere um roteiro simulado da reunião, incluindo falas da equipe (simuladas) e conclusões.
    Seja breve, profissional e motivador.
    Use formatação Markdown.
  `;

  const responseStream = await ai.models.generateContentStream({
    model,
    contents: prompt
  });

  for await (const chunk of responseStream) {
    yield chunk.text;
  }
};
