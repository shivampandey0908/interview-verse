export type InterviewConfig = { type: 'Technical' | 'HR' | 'Mixed'; domain: string; topics: string[]; difficulty: string; totalQuestions: number };
export type Turn = { question: string; topic: string; answer: string; score?: number; feedback?: string; idealAnswer?: string };
export type InterviewSession = { id: string; config: InterviewConfig; turns: Turn[]; currentQuestion: string; questionNumber: number; startedAt: number; status: 'active' | 'completed' };
