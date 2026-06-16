import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Search, Filter, Bug, Zap, Lightbulb, Info, ChevronDown, Check, X, ThumbsUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';

const statusColors = {
  'Open': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'In Review': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'Planned': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Completed': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Rejected': 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
};

const typeIcons = {
  'Bug Report': Bug,
  'Feature Request': Zap,
  'Suggestion': Lightbulb,
  'General Feedback': Info,
};

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', status: '', priority: '', search: '' });

  useEffect(() => {
    fetchFeedback();
  }, [filters.type, filters.status, filters.priority]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFeedback();
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.priority) queryParams.append('priority', filters.priority);
      if (filters.search) queryParams.append('search', filters.search);

      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/feedback?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (res.ok) setFeedbacks(data.feedbacks);
    } catch (error) {
      console.error("Failed to fetch feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/feedback/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${window.localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setFeedbacks(prev => prev.map(f => f._id === id ? { ...f, status: newStatus } : f));
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <ShieldAlert size={64} className="text-rose-500 mb-6" />
        <h1 className="text-3xl font-heading font-black text-white mb-2">Access Denied</h1>
        <p className="text-zinc-400">You must be an administrator to view this page.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 mt-16 sm:mt-24">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div>
          <h1 className="text-4xl sm:text-5xl font-heading font-black text-white mb-2 tracking-tight">
            Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-neon-cyan">Dashboard</span>
          </h1>
          <p className="text-zinc-400 font-mono text-sm max-w-xl">
            Manage feedback, bug reports, and feature requests.
          </p>
        </div>
      </div>

      <Card className="mb-8 relative z-10 border-white/5 bg-surface/50">
        <div className="p-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by ID, title, or description..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full bg-background border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all text-sm"
            />
          </div>
          
          <div className="flex gap-4 flex-wrap">
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="bg-background border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-300 focus:border-brand-500/50 appearance-none min-w-[140px]"
            >
              <option value="">All Types</option>
              <option value="Bug Report">Bug Reports</option>
              <option value="Feature Request">Feature Requests</option>
              <option value="Suggestion">Suggestions</option>
            </select>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="bg-background border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-300 focus:border-brand-500/50 appearance-none min-w-[140px]"
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Review">In Review</option>
              <option value="Planned">Planned</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </Card>

      <div className="space-y-4 relative z-10">
        {loading ? (
          <div className="text-center py-12 text-zinc-500 font-mono text-sm">Loading feedback...</div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-12 bg-surface border border-white/5 rounded-2xl">
            <p className="text-zinc-500 font-mono text-sm">No feedback found matching filters.</p>
          </div>
        ) : (
          feedbacks.map((fb) => {
            const Icon = typeIcons[fb.type] || Info;
            return (
              <motion.div
                key={fb._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className="font-mono text-xs">{fb.referenceId}</Badge>
                      <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
                        <Icon size={14} />
                        {fb.type}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                        • {new Date(fb.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-2">{fb.title}</h3>
                    <p className="text-sm text-zinc-400 mb-4 whitespace-pre-wrap">{fb.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-xs font-mono text-zinc-500">
                      <div><span className="text-zinc-400">User:</span> {fb.username}</div>
                      <div><span className="text-zinc-400">Page:</span> {fb.page}</div>
                      <div><span className="text-zinc-400">Browser:</span> {fb.browser}</div>
                      {fb.screenshotUrl && (
                        <div>
                          <a href={fb.screenshotUrl} target="_blank" rel="noreferrer" className="text-brand-400 hover:underline">
                            View Screenshot ↗
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 ml-auto bg-white/5 px-2 py-1 rounded">
                        <ThumbsUp size={12} className="text-zinc-400" />
                        <span className="text-white font-bold">{fb.upvotes?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3 min-w-[200px] border-t lg:border-t-0 lg:border-l border-white/5 pt-4 lg:pt-0 lg:pl-6">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5">Priority</label>
                      <span className={`text-sm font-bold ${
                        fb.priority === 'High' ? 'text-rose-400' : 
                        fb.priority === 'Medium' ? 'text-yellow-400' : 'text-zinc-400'
                      }`}>{fb.priority}</span>
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5">Status</label>
                      <select
                        value={fb.status}
                        onChange={(e) => handleStatusChange(fb._id, e.target.value)}
                        className={`w-full appearance-none px-3 py-2 rounded-lg text-sm border font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-colors ${statusColors[fb.status]}`}
                      >
                        <option value="Open">Open</option>
                        <option value="In Review">In Review</option>
                        <option value="Planned">Planned</option>
                        <option value="Completed">Completed</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
