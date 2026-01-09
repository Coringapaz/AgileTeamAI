export enum Priority {
  HIGH = 'Alta',
  MEDIUM = 'Média',
  LOW = 'Baixa',
}

export enum StoryStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done',
}

export interface UserStory {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  storyPoints: number;
  priority: Priority;
  status: StoryStatus;
}

export interface Impediment {
  id: string;
  description: string;
  suggestedResolution: string;
  severity: 'Alta' | 'Média' | 'Baixa';
}

export interface Sprint {
  id: string;
  name: string;
  goal: string;
  stories: UserStory[];
  impediments: Impediment[];
  status: 'Planning' | 'Active' | 'Completed';
  startDate: string;
  endDate: string;
}

export interface MeetingReport {
  type: 'Daily' | 'Review' | 'Retrospective';
  date: string;
  summary: string;
  actionItems: string[];
}

export interface AppState {
  projectVision: string;
  backlog: UserStory[];
  currentSprint: Sprint | null;
  meetingReports: MeetingReport[];
}

export type ViewState = 'dashboard' | 'product-owner' | 'scrum-master' | 'meetings';
