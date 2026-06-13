import { useState } from'react';
import { Link, useNavigate } from'react-router-dom';
import { motion } from'framer-motion';
import { Mail, Lock, ShieldCheck, Cpu } from'lucide-react';
import { useAuth } from'../context/AuthContext.jsx';
import Input from'../components/ui/Input.jsx';
import Button from'../components/ui/Button.jsx';

export default function LoginPage() {
 const { login } = useAuth();
 const navigate = useNavigate();

 const [form, setForm] = useState({ email:'', password:'' });
 const [error, setError] = useState('');
 const [isLoading, setIsLoading] = useState(false);

 const handleChange = (e) => {
 const { name, value } = e.target;
 setForm((prev) => ({ ...prev, [name]: value }));
 if (error) setError('');
 };

 const handleSubmit = async (e) => {
 e.preventDefault();

 if (!form.email.trim() || !form.password) {
 setError('Please fill in all fields');
 return;
 }

 try {
 setIsLoading(true);
 setError('');
 await login({
 email: form.email.trim().toLowerCase(),
 password: form.password,
 });
 navigate('/dashboard');
 } catch (err) {
 if (err.status === 401) setError('Invalid credentials detected.');
 else setError(err.message ||'Authentication sequence failed.');
 setIsLoading(false);
 }
 };

 return (
 <div className="min-h-[calc(100vh-80px)] flex animate-fade-in bg-background">
 {/* Left Panel: Branding / Art */}
 <div className="hidden lg:flex flex-1 flex-col justify-between bg-surface relative overflow-hidden p-12 border-r border-white/5 shadow-glass">
 <div className="absolute inset-0 bg-grid-arena opacity-30 pointer-events-none mix-blend-screen" />
 <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-brand-500/10 blur-[120px] rounded-full pointer-events-none" />
 <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-neon-cyan/10 blur-[120px] rounded-full pointer-events-none" />

 <div className="relative z-10 max-w-md">
 <div className="w-16 h-16 bg-brand-500/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md border border-brand-500/20">
 <Cpu className="text-brand-400" size={32} />
 </div>
 <h2 className="text-5xl font-heading font-black text-white uppercase tracking-tight leading-tight mb-6">
 Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-blue-200">Back</span>.
 </h2>
 <p className="text-zinc-400 font-mono text-sm leading-relaxed max-w-sm uppercase tracking-widest">
 ArgueX is the ultimate arena for intellectual growth. Engage with AI, climb the ranks, and sharpen your mind.
 </p>
 </div>

 <div className="relative z-10">
 <div className="flex items-center gap-4 mb-4">
 <div className="flex -space-x-3">
 {[1, 2, 3, 4].map((i) => (
 <div key={i} className="w-12 h-12 rounded-full border-2 border-surface bg-surface flex items-center justify-center overflow-hidden shadow-glass relative">
 <div className="absolute inset-0 bg-brand-500/20 mix-blend-overlay"></div>
 <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${i}&backgroundColor=transparent`} alt="avatar" className="w-full h-full object-cover scale-110" />
 </div>
 ))}
 </div>
 <div className="text-xs font-mono uppercase tracking-widest">
 <p className="text-white font-bold flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> 2,000+ Combatants</p>
 <p className="text-zinc-500 mt-1">Active in the Arena</p>
 </div>
 </div>
 </div>
 </div>

 {/* Right Panel: Form */}
 <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
 <div className="absolute inset-0 bg-brand-500/5 blur-[100px] pointer-events-none"></div>
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4 }}
 className="w-full max-w-md relative z-10"
 >
 <div className="mb-10 text-center lg:text-left">
 <h1 className="text-4xl font-heading font-black text-white mb-3 uppercase tracking-tight">
 Login
 </h1>
 <p className="text-zinc-400 font-mono text-xs uppercase tracking-widest">
 Please enter your credentials to proceed.
 </p>
 </div>

 <form onSubmit={handleSubmit} className="space-y-6">
 <Input
 label="Email Address"
 name="email"
 type="email"
 placeholder="name@example.com"
 icon={<Mail size={18} className="text-zinc-500" />}
 value={form.email}
 onChange={handleChange}
 disabled={isLoading}
 />

 <Input
 label="Password"
 name="password"
 type="password"
 placeholder="••••••••"
 icon={<Lock size={18} className="text-zinc-500" />}
 value={form.password}
 onChange={handleChange}
 disabled={isLoading}
 />

 {error && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height:'auto' }}
 className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono uppercase tracking-widest flex items-start gap-3 shadow-glass"
 >
 <ShieldCheck className="shrink-0 mt-0.5" size={16} />
 <p>{error}</p>
 </motion.div>
 )}

 <div className="pt-4">
 <Button
 type="submit"
 variant="brand"
 size="lg"
 className="w-full font-heading font-bold tracking-widest text-sm"
 loading={isLoading}
 >
 LOGIN
 </Button>
 </div>
 </form>

 <p className="mt-10 text-center text-zinc-500 font-mono text-xs uppercase tracking-widest">
 Don't have an account?{' '}
 <Link to="/signup" className="font-bold text-brand-400 hover:text-brand-300 transition-colors underline decoration-brand-500/30 underline-offset-4">
 Sign Up
 </Link>
 </p>
 </motion.div>
 </div>
 </div>
 );
}
