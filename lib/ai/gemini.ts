import { GoogleGenerativeAI } from '@google/generative-ai';

export async function generateJson<T>(prompt: string): Promise<T> {
  if (!process.env.GEMINI_API_KEY) throw new Error('AI service is not configured. Add GEMINI_API_KEY on the server.');
  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // Keep the model configurable because Google retires model IDs over time.
  const model = client.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash', generationConfig: { responseMimeType: 'application/json', temperature: 0.65 } });
  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/^```(?:json)?\s*|\s*```$/g, '');
  try { return JSON.parse(text) as T; } catch { throw new Error('The interviewer returned an unreadable response. Please retry.'); }
}
