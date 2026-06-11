import React from'react';
import { motion, AnimatePresence } from'framer-motion';
import { Trophy, TrendingUp, TrendingDown, X, Star, AlertTriangle, ShieldCheck } from'lucide-react';
import Button from'../ui/Button.jsx';
import Badge from'../ui/Badge.jsx';

export default function ScorecardModal({ analysis, isOpen, onClose }) {
 if (!analysis) return null;

 const { logicScore, evidenceScore, persuasionScore, clarityScore, summary, fallacies, feedback, winner, eloChange } = analysis;

 const isWin = winner ==='user';
 const isLoss = winner ==='ai';
 const isDraw = winner ==='draw';

 return (
 <AnimatePresence>
 {isOpen && (
 <>
 {/* Backdrop */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
 onClick={onClose}
 />
 {/* Modal */}
 <motion.div
 initial={{ opacity: 0, scale: 0.95, x:"-50%", y:"-40%" }}
 animate={{ opacity: 1, scale: 1, x:"-50%", y:"-50%" }}
 exit={{ opacity: 0, scale: 0.95, x:"-50%", y:"-40%" }}
 className="fixed left-1/2 top-1/2 w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl z-50 p-6 sm:p-8 smooth-scroll"
 >
 {/* Close Button */}
 <button
 onClick={onClose}
 className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-900 rounded-full transition-colors"
 >
 <X size={20} />
 </button>

 {/* Header: Result & Elo */}
 <div className="text-center mb-8">
 <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
 isWin ?'bg-emerald-500/20 text-emerald-500' :
 isLoss ?'bg-rose-500/20 text-rose-500' :'bg-amber-500/20 text-amber-500'
 }`}>
 {isWin ? <Trophy size={40} /> : isLoss ? <AlertTriangle size={40} /> : <ShieldCheck size={40} />}
 </div>
 <h2 className="text-3xl font-heading font-black text-zinc-900 dark:text-white mb-2">
 {isWin ?'Victory!' : isLoss ?'Defeat' :'Draw'}
 </h2>
 <div className="flex items-center justify-center gap-2 text-lg font-medium">
 <span className="text-zinc-500 dark:text-zinc-400">Rating Change:</span>
 <span className={`flex items-center gap-1 ${
 eloChange > 0 ?'text-emerald-500' : eloChange < 0 ?'text-rose-500' :'text-zinc-500'
 }`}>
 {eloChange > 0 ?'+' :''}{eloChange}
 {eloChange > 0 ? <TrendingUp size={20} /> : eloChange < 0 ? <TrendingDown size={20} /> : null}
 </span>
 </div>
 </div>

 {/* Scores Grid */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
 {[
 { label:'Logic', score: logicScore, color:'text-blue-500', bg:'bg-blue-500/10' },
 { label:'Evidence', score: evidenceScore, color:'text-indigo-500', bg:'bg-indigo-500/10' },
 { label:'Persuasion', score: persuasionScore, color:'text-purple-500', bg:'bg-purple-500/10' },
 { label:'Clarity', score: clarityScore, color:'text-brand-500', bg:'bg-brand-500/10' }
 ].map(s => (
 <div key={s.label} className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-4 text-center border border-zinc-200 dark:border-zinc-800">
 <div className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-2 ${s.bg} ${s.color}`}>
 <Star size={20} className="fill-current" />
 </div>
 <div className="text-2xl font-black text-zinc-900 dark:text-white">{s.score}<span className="text-sm text-zinc-400 font-medium">/10</span></div>
 <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mt-1">{s.label}</div>
 </div>
 ))}
 </div>

 {/* Summary */}
 <div className="bg-brand-500/10 border border-brand-500/20 rounded-2xl p-5 mb-6">
 <h3 className="text-sm font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-2">Verdict Summary</h3>
 <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-sm">{summary}</p>
 </div>

 {/* Fallacies */}
 {fallacies && fallacies.length > 0 && (
 <div className="mb-6">
 <h3 className="text-sm font-bold uppercase tracking-wider text-rose-500 mb-3 flex items-center gap-2">
 <AlertTriangle size={16} /> Logical Fallacies Detected
 </h3>
 <div className="space-y-3">
 {fallacies.map((f, i) => (
 <div key={i} className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-4">
 <div className="font-bold text-rose-600 dark:text-rose-400 text-sm mb-1">{f.name}</div>
 <div className="text-sm text-zinc-600 dark:text-zinc-400">{f.explanation}</div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Feedback */}
 <div>
 <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-500 mb-3 flex items-center gap-2">
 <ShieldCheck size={16} /> Coach's Feedback
 </h3>
 <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
 {feedback}
 </p>
 </div>

 <div className="mt-8 flex justify-center">
 <Button onClick={onClose} variant="brand" className="w-full sm:w-auto px-12">
 Continue
 </Button>
 </div>
 </motion.div>
 </>
 )}
 </AnimatePresence>
 );
}
