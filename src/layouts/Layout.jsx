import { Outlet, useLocation } from'react-router-dom';
import { AnimatePresence, motion } from'framer-motion';
import Navbar from'../components/Navbar.jsx';

const pageVariants = {
 initial: { opacity: 0, scale: 0.98, filter:'blur(4px)' },
 animate: { opacity: 1, scale: 1, filter:'blur(0px)' },
 exit: { opacity: 0, scale: 0.98, filter:'blur(4px)' },
};

export default function Layout() {
 const location = useLocation();
 return (
 <div className="min-h-screen flex flex-col bg-background text-white relative selection:bg-neon-violet/30 selection:text-neon-cyan">
 {/* Ambient Animated Gradients & Noise */}
 <div className="fixed inset-0 z-0 pointer-events-none noise-overlay"></div>
 <div className="fixed inset-0 z-0 pointer-events-none bg-grid-arena opacity-20"></div>
 <div className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none animate-float"></div>
 <div className="fixed bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-neon-violet/10 rounded-full blur-[150px] pointer-events-none animate-float-delayed"></div>
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
 </div>
 );
}
