import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayCircle, ArrowLeft, Trophy, AlertTriangle, ShieldCheck } from 'lucide-react';
import { debateAPI } from '../services/api.js';
import MessageItem from '../components/MessageItem.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';

export default function ReplayPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [debate, setDebate] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    debateAPI.getById(id)
      .then(data => {
        setDebate(data);
        setMessages(data.messages || []);
      })
      .catch(err => {
        console.error("Failed to load replay:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="h-screen flex items-center justify-center text-zinc-500 font-medium">Loading match replay...</div>;
  }

  if (!debate) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-center p-4">
        <AlertTriangle size={48} className="text-zinc-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Replay Not Found</h2>
        <p className="text-zinc-400 mb-6">This debate match could not be found or was deleted.</p>
        <Button onClick={() => navigate('/dashboard')} variant="brand">Return to Dashboard</Button>
      </div>
    );
  }

  const analysis = debate.evaluation;

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-73px)] flex flex-col bg-white dark:bg-zinc-950">
      
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between shrink-0">
        <div>
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors text-sm font-medium mb-3">
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-3 mb-1">
            <Badge className="bg-rose-500/10 text-rose-500 uppercase tracking-widest text-[10px]">Match Replay</Badge>
            <span className="text-zinc-400 text-xs font-medium">{new Date(debate.createdAt).toLocaleDateString()}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-zinc-900 dark:text-white">
            {debate.topic}
          </h1>
        </div>
        <div className="hidden sm:block text-brand-500/20">
          <PlayCircle size={64} />
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto smooth-scroll p-4 sm:p-6 space-y-6">
        {messages.map((msg, index) => (
          <MessageItem 
            key={msg._id || index} 
            message={{...msg, isAi: msg.senderRole === 'ai'}} 
            index={index} 
            hideActions={true} 
          />
        ))}

        {/* Final Scorecard Inline */}
        {analysis && (
          <div className="mt-12 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xl">
            <div className="text-center mb-6">
              <h2 className="text-xl font-heading font-black text-zinc-900 dark:text-white mb-2 flex items-center justify-center gap-2">
                <Trophy size={24} className={analysis.winner === 'user' ? 'text-emerald-500' : 'text-amber-500'} />
                Final Verdict: {analysis.winner === 'user' ? 'User Wins' : analysis.winner === 'ai' ? 'AI Wins' : 'Draw'}
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">{analysis.summary}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Logic', score: analysis.logicScore, color: 'text-blue-500' },
                { label: 'Evidence', score: analysis.evidenceScore, color: 'text-indigo-500' },
                { label: 'Persuasion', score: analysis.persuasionScore, color: 'text-purple-500' },
                { label: 'Clarity', score: analysis.clarityScore, color: 'text-brand-500' }
              ].map(s => (
                <div key={s.label} className="bg-white dark:bg-zinc-950 rounded-2xl p-4 text-center border border-zinc-200 dark:border-zinc-800">
                  <div className="text-2xl font-black text-zinc-900 dark:text-white">{s.score}<span className="text-sm text-zinc-400 font-medium">/10</span></div>
                  <div className={`text-xs font-semibold uppercase tracking-wider mt-1 ${s.color}`}>{s.label}</div>
                </div>
              ))}
            </div>

            {analysis.feedback && (
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-2">
                  <ShieldCheck size={14} /> Coach's Notes
                </h3>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">{analysis.feedback}</p>
              </div>
            )}
          </div>
        )}
        
        {messages.length === 0 && (
          <div className="text-center text-zinc-500 font-medium py-12">No messages exchanged in this debate.</div>
        )}
      </div>

    </div>
  );
}
