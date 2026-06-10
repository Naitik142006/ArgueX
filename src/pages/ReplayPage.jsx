import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayCircle, ArrowLeft, Trophy, AlertTriangle, ShieldCheck, Activity, BrainCircuit } from 'lucide-react';
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
    return (
      <div className="h-[calc(100vh-80px)] flex flex-col items-center justify-center text-zinc-500 font-mono text-sm uppercase tracking-widest gap-4 bg-background">
         <div className="w-8 h-8 rounded-full border-2 border-brand-500/30 border-t-brand-400 animate-spin"></div>
         Extracting Match Telemetry...
      </div>
    );
  }

  if (!debate) {
    return (
      <div className="h-[calc(100vh-80px)] flex flex-col items-center justify-center text-center p-4 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-rose-500/5 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="w-20 h-20 rounded-3xl bg-surface border border-rose-500/20 flex items-center justify-center text-rose-400 mb-6 shadow-glass relative z-10">
           <AlertTriangle size={36} />
        </div>
        <h2 className="text-2xl font-heading font-bold text-white mb-3 uppercase tracking-wide relative z-10">Record Not Found</h2>
        <p className="text-zinc-400 font-mono text-sm max-w-sm mb-8 relative z-10">This combat log has been expunged or does not exist in the databanks.</p>
        <Button onClick={() => navigate('/dashboard')} variant="surface" className="relative z-10 font-mono text-xs uppercase tracking-widest gap-2">
           <ArrowLeft size={14} /> Return to Mission Control
        </Button>
      </div>
    );
  }

  const analysis = debate.evaluation;

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-80px)] flex flex-col bg-background relative overflow-hidden animate-fade-in">
      
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-brand-500/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-white/10 bg-background/80 backdrop-blur-xl flex items-center justify-between shrink-0 relative z-10 shadow-glass">
        <div>
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors font-mono text-xs uppercase tracking-widest mb-4">
            <ArrowLeft size={14} /> Back
          </button>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="neon" className="bg-rose-500/10 text-rose-400 border-rose-500/20 py-0.5 shadow-[0_0_10px_rgba(244,63,94,0.2)]">
               <span className="flex items-center gap-2">
                  <PlayCircle size={12} /> COMBAT REPLAY
               </span>
            </Badge>
            <span className="text-zinc-500 font-mono text-xs uppercase tracking-widest">{new Date(debate.createdAt).toLocaleDateString()}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-black text-white uppercase tracking-tight drop-shadow-md">
            {debate.topic}
          </h1>
        </div>
        <div className="hidden sm:flex w-20 h-20 rounded-3xl bg-surface border border-white/5 items-center justify-center text-brand-400/30 shadow-glass relative overflow-hidden">
           <div className="absolute inset-0 bg-brand-500/5 animate-pulse"></div>
           <Activity size={40} className="relative z-10" />
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto smooth-scroll p-4 sm:p-6 space-y-6 relative z-10 scrollbar-hide">
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
          <div className="mt-12 glass-panel border border-white/10 rounded-3xl p-6 sm:p-8 shadow-glass relative overflow-hidden group">
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-brand-500/10 blur-3xl rounded-full group-hover:bg-brand-500/20 transition-colors duration-500"></div>
            
            <div className="text-center mb-8 relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface border border-white/5 mb-4 shadow-glass">
                 <Trophy size={28} className={analysis.winner === 'user' ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]'} />
              </div>
              <h2 className="text-2xl font-heading font-black text-white mb-2 uppercase tracking-wide">
                Final Verdict: <span className={analysis.winner === 'user' ? 'text-emerald-400' : 'text-amber-400'}>{analysis.winner === 'user' ? 'User Victorious' : analysis.winner === 'ai' ? 'AI Victorious' : 'Stalemate'}</span>
              </h2>
              <p className="font-mono text-zinc-400 text-sm max-w-xl mx-auto leading-relaxed">{analysis.summary}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 relative z-10">
              {[
                { label: 'Logic', score: analysis.logicScore, color: 'text-neon-cyan', border: 'border-neon-cyan/20', bg: 'bg-neon-cyan/5' },
                { label: 'Evidence', score: analysis.evidenceScore, color: 'text-brand-400', border: 'border-brand-500/20', bg: 'bg-brand-500/5' },
                { label: 'Persuasion', score: analysis.persuasionScore, color: 'text-neon-violet', border: 'border-neon-violet/20', bg: 'bg-neon-violet/5' },
                { label: 'Clarity', score: analysis.clarityScore, color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5' }
              ].map(s => (
                <div key={s.label} className={`bg-surface rounded-2xl p-4 text-center border shadow-glass ${s.border} ${s.bg}`}>
                  <div className={`text-3xl font-black font-heading tracking-tight ${s.color}`}>{s.score}<span className="text-sm font-mono text-zinc-500 ml-1">/10</span></div>
                  <div className="text-[10px] font-mono font-semibold uppercase tracking-widest mt-2 text-zinc-400">{s.label}</div>
                </div>
              ))}
            </div>

            {analysis.feedback && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 relative z-10 shadow-glass">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 mb-3 flex items-center gap-2">
                  <ShieldCheck size={16} /> Argus-V1 Notes
                </h3>
                <p className="text-sm text-emerald-100/70 leading-relaxed font-mono">{analysis.feedback}</p>
              </div>
            )}
          </div>
        )}
        
        {messages.length === 0 && (
          <div className="text-center text-zinc-500 font-mono text-sm uppercase tracking-widest py-12">No combat log data found.</div>
        )}
      </div>

    </div>
  );
}
