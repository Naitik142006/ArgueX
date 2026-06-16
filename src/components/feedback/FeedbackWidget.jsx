import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Camera, AlertCircle, CheckCircle, Bug, Lightbulb, Zap, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';

const feedbackTypes = [
  { value: 'Bug Report', label: 'Bug Report', icon: Bug, color: 'text-rose-400' },
  { value: 'Feature Request', label: 'Feature Request', icon: Zap, color: 'text-brand-400' },
  { value: 'Suggestion', label: 'Suggestion', icon: Lightbulb, color: 'text-yellow-400' },
  { value: 'General Feedback', label: 'General', icon: Info, color: 'text-blue-400' },
];

const priorityLevels = ['Low', 'Medium', 'High'];

export default function FeedbackWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [referenceId, setReferenceId] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    type: 'Bug Report',
    title: '',
    description: '',
    screenshotUrl: '',
    priority: 'Low'
  });

  // Only show widget if user is logged in
  if (!user) return null;

  const getSystemContext = () => {
    return {
      page: window.location.pathname,
      browser: navigator.userAgent.split(' ').pop() || 'Unknown',
      device: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop'
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      setError('Title and description are required.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const context = getSystemContext();
      
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${window.localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...formData,
          ...context
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to submit feedback');

      setReferenceId(data.feedback.referenceId);
      setIsSuccess(true);
      
      // Auto close after 3 seconds
      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
        setFormData({ type: 'Bug Report', title: '', description: '', screenshotUrl: '', priority: 'Low' });
      }, 4000);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[100]">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="bg-brand-600 hover:bg-brand-500 text-white p-4 rounded-full shadow-lg shadow-brand-500/20 border border-brand-400/30 flex items-center justify-center transition-colors group"
        >
          <MessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-end sm:justify-center p-4 sm:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="relative w-full max-w-lg"
            >
              <Card className="shadow-2xl shadow-black/50 border-white/10 flex flex-col max-h-[85vh] sm:max-h-[80vh] overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
                  <div>
                    <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2">
                      Help Improve ArgueX
                    </h2>
                    <p className="text-sm text-zinc-400 mt-1">Found a bug or have an idea? We'd love to hear from you.</p>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                  {isSuccess ? (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }} 
                      animate={{ scale: 1, opacity: 1 }} 
                      className="flex flex-col items-center justify-center py-12 text-center"
                    >
                      <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle size={32} />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">Thank you!</h3>
                      <p className="text-zinc-400 mb-6 max-w-sm">Your feedback helps us make ArgueX better for everyone.</p>
                      <div className="bg-surface border border-white/10 px-6 py-3 rounded-xl">
                        <span className="text-xs text-zinc-500 uppercase tracking-widest block mb-1">Reference ID</span>
                        <span className="font-mono text-brand-400 font-bold">{referenceId}</span>
                      </div>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      {error && (
                        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start gap-2">
                          <AlertCircle size={16} className="shrink-0 mt-0.5" />
                          <span>{error}</span>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-mono text-zinc-400 uppercase tracking-widest mb-2">Type of Feedback</label>
                        <div className="grid grid-cols-2 gap-2">
                          {feedbackTypes.map((t) => (
                            <button
                              key={t.value}
                              type="button"
                              onClick={() => setFormData({ ...formData, type: t.value })}
                              className={`p-3 rounded-xl border flex items-center gap-2 text-sm transition-all duration-200 ${
                                formData.type === t.value 
                                ? 'bg-white/10 border-white/20 text-white' 
                                : 'bg-surface border-white/5 text-zinc-400 hover:bg-white/5'
                              }`}
                            >
                              <t.icon size={16} className={t.color} />
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-zinc-400 uppercase tracking-widest mb-2">Title</label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Brief summary of the issue or idea..."
                          className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all"
                          maxLength={100}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-zinc-400 uppercase tracking-widest mb-2">Description</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Provide details, steps to reproduce, or explain your idea..."
                          className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all min-h-[120px] resize-y"
                          maxLength={2000}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-mono text-zinc-400 uppercase tracking-widest mb-2">Priority</label>
                          <select
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500/50 transition-all appearance-none"
                          >
                            {priorityLevels.map(p => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-mono text-zinc-400 uppercase tracking-widest mb-2">Screenshot URL</label>
                          <div className="relative">
                            <Camera size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input
                              type="url"
                              value={formData.screenshotUrl}
                              onChange={(e) => setFormData({ ...formData, screenshotUrl: e.target.value })}
                              placeholder="https://..."
                              className="w-full bg-background border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-surface rounded-xl p-3 border border-white/5 mt-6">
                        <div className="flex items-start gap-2 text-xs text-zinc-500 font-mono">
                          <Info size={14} className="shrink-0 mt-0.5" />
                          <p>
                            We automatically capture your user ID, browser, and current page (<span className="text-zinc-300">{window.location.pathname}</span>) to help diagnose issues.
                          </p>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        variant="primary" 
                        className="w-full py-3"
                        disabled={isSubmitting || !formData.title || !formData.description}
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                        {!isSubmitting && <Send size={16} className="ml-2" />}
                      </Button>
                    </form>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
