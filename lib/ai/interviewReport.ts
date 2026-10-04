type Evaluation = { correctness?: unknown; relevance?: unknown; clarity?: unknown; depth?: unknown; feedback?: unknown; idealAnswer?: unknown };
export type ReportTurn = { question?: string; answer?: string; evaluation?: Evaluation };
export type InterviewReportResult = {
  scores: { communication: number; knowledge: number; articulation: number; thinking: number; overall: number };
  level: string;
  summary: string;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  questionAnalysis: { feedback: string; improvement: string; scores: { communication: number; knowledge: number; articulation: number; thinking: number } }[];
};

const dimensions = ['communication', 'knowledge', 'articulation', 'thinking'] as const;
type Dimension = typeof dimensions[number];
const clampScore = (value: unknown, fallback: number) => {
  const score = Number(value);
  if (!Number.isFinite(score)) return fallback;
  return Math.round(Math.max(0, Math.min(100, score <= 1 ? score * 100 : score)));
};
const text = (value: unknown, fallback: string) => typeof value === 'string' && value.trim() ? value.trim() : fallback;
const stringList = (value: unknown, fallback: string[]) => Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && !!item.trim()).map(item => item.trim()).slice(0, 6) : fallback;
const mean = (values: number[]) => values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;

export function normalizeInterviewReport(raw: any, turns: ReportTurn[]): InterviewReportResult {
  const evaluations = turns.map(turn => turn.evaluation || {});
  const fallback: Record<Dimension, number> = {
    communication: mean(evaluations.map(e => clampScore(e.relevance, 0))),
    knowledge: mean(evaluations.map(e => clampScore(e.correctness, 0))),
    articulation: mean(evaluations.map(e => clampScore(e.clarity, 0))),
    thinking: mean(evaluations.map(e => clampScore(e.depth, 0))),
  };
  const source = raw?.scores && typeof raw.scores === 'object' ? raw.scores : {};
  const scores = Object.fromEntries(dimensions.map(key => [key, clampScore(source[key], fallback[key])])) as Record<Dimension, number>;
  const overall = mean(dimensions.map(key => scores[key]));
  const level = overall >= 85 ? 'Pro' : overall >= 70 ? 'Professional' : overall >= 55 ? 'Advanced' : overall >= 40 ? 'Developing' : 'Beginner';
  const analysis = Array.isArray(raw?.questionAnalysis) ? raw.questionAnalysis : [];
  const questionAnalysis = turns.map((turn, index) => {
    const evaluation = evaluations[index];
    const item = analysis[index] || {};
    return {
      feedback: text(item.feedback, text(evaluation.feedback, 'There is not enough specific feedback for this answer.')),
      improvement: text(item.improvement, text(evaluation.idealAnswer, 'Add a clear explanation of your reasoning and why the approach fits the question.')),
      scores: {
        communication: clampScore(evaluation.relevance, 0),
        knowledge: clampScore(evaluation.correctness, 0),
        articulation: clampScore(evaluation.clarity, 0),
        thinking: clampScore(evaluation.depth, 0),
      },
    };
  });
  const scoreNames: Record<Dimension, string> = { communication: 'communication', knowledge: 'domain knowledge', articulation: 'articulation', thinking: 'structured thinking' };
  const lowest = [...dimensions].sort((a, b) => scores[a] - scores[b])[0];
  return {
    scores: { ...scores, overall }, level,
    summary: text(raw?.summary, `Your interview is rated ${level.toLowerCase()} with an overall score of ${overall}/100. Your strongest evidence was in ${scoreNames[[...dimensions].sort((a, b) => scores[b] - scores[a])[0]]}; focus next on ${scoreNames[lowest]}.`),
    strengths: stringList(raw?.strengths, [`Your ${scoreNames[[...dimensions].sort((a, b) => scores[b] - scores[a])[0]]} score was ${Math.max(...dimensions.map(key => scores[key]))}/100 based on your answers.`]),
    improvements: stringList(raw?.improvements, [`Build ${scoreNames[lowest]} by explaining your reasoning with specific evidence from each answer.`]),
    recommendations: stringList(raw?.recommendations, [`Practice a ${turns.length ? 'similar ' : ''}mock interview and focus on ${scoreNames[lowest]}.`]),
    questionAnalysis,
  };
}
