import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ShieldCheck, LogOut } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import FeedbackWidget from '../components/feedback/FeedbackWidget.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const pageVariants = {
  initial: { opacity: 0, scale: 0.98, filter: 'blur(4px)' },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, scale: 0.98, filter: 'blur(4px)' },
};

function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-white">
      {/* Subtle ambient background */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-grid-arena opacity-10" />
      <div className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-brand-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Admin Header */}
      <header className="relative z-10 border-b border-white/5 bg-surface/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
              <ShieldCheck size={16} className="text-brand-400" />
            </div>
            <div>
              <span className="font-heading font-bold text-white text-sm tracking-wide">ArgueX</span>
              <span className="ml-2 text-[10px] font-mono uppercase tracking-widest text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded-full">Admin</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-zinc-400 hover:text-white text-xs font-mono uppercase tracking-widest transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </header>

      {/* Admin Content */}
      <main className="relative z-10 flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default function Layout() {
  const { user } = useAuth();
  const location = useLocation();

  // Admins get a completely separate minimal layout
  if (user?.isAdmin) {
    return <AdminLayout />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-white relative selection:bg-neon-violet/30 selection:text-neon-cyan">
      {/* Ambient Animated Gradients & Noise */}
      <div className="fixed inset-0 z-0 pointer-events-none noise-overlay" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-grid-arena opacity-20" />
      <div className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none animate-float" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-neon-violet/10 rounded-full blur-[150px] pointer-events-none animate-float-delayed" />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <FeedbackWidget />
    </div>
  );
}
