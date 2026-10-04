'use client';
import { ArrowLeft, ArrowRight, CalendarDays, Video } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Interview = { _id: string; type: string; domain: string; topics: string[]; score?: number; status: string; createdAt: string };
export default function History() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [name, setName] = useState('');
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    Promise.all([fetch('/api/profile'), fetch('/api/interviews')]).then(async ([profileRes, interviewsRes]) => {
      if (profileRes.ok) { const data = await profileRes.json(); setName(data.user.name); }
      if (interviewsRes.ok) { const data = await interviewsRes.json(); setInterviews(data.interviews || []); }
    }).catch(() => {}).finally(() => setLoaded(true));
  }, []);
  return <main className="app-shell"><aside className="sidebar"><Link href="/" className="wordmark"><span className="brand-mark"><Video size={16}/></span> interview<span>verse</span></Link><div className="side-label">WORKSPACE</div><Link className="side-item" href="/dashboard">◫ Overview</Link><Link className="side-item active" href="/history">◷ Interview history</Link><div className="sidebar-bottom"><Link className="user-profile" href="/dashboard"><span className="user-avatar">{name ? name.charAt(0).toUpperCase() : '?'}</span><span><b>{name || 'Your account'}</b><small>Free account</small></span></Link></div></aside><section className="main-panel"><header className="app-header"><Link href="/dashboard" className="back-link"><ArrowLeft size={15}/> Dashboard</Link><span className="header-avatar">{name ? name.charAt(0).toUpperCase() : '?'}</span></header><div className="dashboard-content history-content"><div className="eyebrow">YOUR PRACTICE JOURNEY</div><h1>Interview history<span>.</span></h1><p className="history-intro">Every conversation is a step forward. Revisit your feedback any time.</p>{interviews.length ? <div className="history-full-list">{interviews.map(item => <article key={item._id} className="history-full-row"><span className="history-symbol sage"><Video size={16}/></span><span className="history-name"><b>{item.domain} practice</b><small>{item.type.toUpperCase()} · {(item.topics || []).join(', ') || item.domain} · {item.status === 'completed' ? 'COMPLETED' : 'IN PROGRESS'}</small></span><span className="history-date"><CalendarDays size={13}/>{new Date(item.createdAt).toLocaleDateString()}</span><span className="history-score"><b>{typeof item.score === 'number' ? item.score : '—'}</b>{typeof item.score === 'number' && <small>/ 100</small>}</span></article>)}</div> : <div className="history-empty"><p>{loaded ? 'You haven’t completed a practice interview yet. Your sessions will appear here.' : 'Loading your practice history…'}</p><Link href="/interview/setup" className="button button-dark">Start your first interview <ArrowRight size={16}/></Link></div>}</div></section></main>;
}
