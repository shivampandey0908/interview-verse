import { NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import { reportPrompt } from '@/lib/ai/prompts';
import { generateJson } from '@/lib/ai/gemini';
import { normalizeInterviewReport } from '@/lib/ai/interviewReport';
import Interview from '@/server/models/Interview';
import InterviewReport from '@/server/models/InterviewReport';
import { getSession } from '@/server/middleware/auth';

const hasCurrentReport = (report: any) => report?.scores && ['communication', 'knowledge', 'articulation', 'thinking'].every(key => Number.isFinite(Number(report.scores[key]))) && typeof report.level === 'string';

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  try {
    await connectDb();
    const interview = await Interview.findOne({ _id: params.id, userId: session.userId });
    if (!interview) return NextResponse.json({ error: 'Interview not found.' }, { status: 404 });
    if (hasCurrentReport(interview.report)) return NextResponse.json({ report: interview.report });

    const turns = interview.answers.map((answer: any, index: number) => ({
      question: interview.questions[index]?.question || '',
      answer: answer.text || '',
      evaluation: answer.evaluation || {},
    }));
    if (!turns.length) return NextResponse.json({ error: 'No answers were saved, so there is not enough evidence to rate this interview.' }, { status: 400 });

    const generated = await generateJson<unknown>(reportPrompt(turns));
    const report = normalizeInterviewReport(generated, turns);
    interview.status = 'completed';
    interview.completedAt = interview.completedAt || new Date();
    interview.score = report.scores.overall;
    interview.report = report;
    interview.duration = interview.duration || Math.round((Date.now() - interview.createdAt.getTime()) / 1000);
    await interview.save();
    await InterviewReport.findOneAndUpdate(
      { interviewId: interview.id },
      { userId: session.userId, interviewId: interview.id, ...report },
      { upsert: true, new: true },
    );
    return NextResponse.json({ report });
  } catch (error) {
    console.error('Interview report generation failed:', error);
    return NextResponse.json({ error: 'The report could not be generated. Please try again.' }, { status: 503 });
  }
}
