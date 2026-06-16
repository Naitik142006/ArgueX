import { useState } from'react';
import { Link, useNavigate } from'react-router-dom';
import { motion } from'framer-motion';
import { User, Mail, Lock, ShieldCheck, Fingerprint } from'lucide-react';
import { useAuth } from'../context/AuthContext.jsx';
import Input from'../components/ui/Input.jsx';
import Button from'../components/ui/Button.jsx';

export default function SignupPage() {
 const { signup } = useAuth();
 const navigate = useNavigate();

 const [form, setForm] = useState({ username:'', email:'', password:'' });
 const [error, setError] = useState('');
 const [isLoading, setIsLoading] = useState(false);

 const handleChange = (e) => {
 const { name, value } = e.target;
 setForm((prev) => ({ ...prev, [name]: value }));
 if (error) setError('');
 };

 const calculateStrength = (pass) => {
 let score = 0;
 if (pass.length > 5) score += 1;
 if (pass.length > 8) score += 1;
 if (/[A-Z]/.test(pass)) score += 1;
 if (/[0-9]/.test(pass)) score += 1;
 return score; // 0 to 4
 };

 const strength = calculateStrength(form.password);
 const strengthLabels = ['VULNERABLE','SUB-OPTIMAL','ACCEPTABLE','SECURE','IMPENETRABLE'];
 const strengthColors = ['bg-rose-500','bg-amber-500','bg-brand-400','bg-emerald-400','bg-teal-400'];

 const handleSubmit = async (e) => {
 e.preventDefault();

 if (!form.username.trim() || !form.email.trim() || !form.password) {
 setError('Please fill in all fields');
 return;
 }

 if (form.password.length < 6) {
 setError('Password must be at least 6 characters');
 return;
 }

 try {
 setIsLoading(true);
 setError('');
 await signup({
 username: form.username.trim(),
 email: form.email.trim().toLowerCase(),
 password: form.password,
 });
 navigate('/dashboard');
 } catch (err) {
 setError(err.message ||'Registration failed. Please try again.');
 setIsLoading(false);
 }
 };

 return (
 <div className="min-h-[calc(100vh-80px)] flex flex-row-reverse animate-fade-in bg-background">
 {/* Left Panel: Branding / Art (Reversed to right side for variety) */}
 <div className="hidden lg:flex flex-1 flex-col justify-between bg-surface relative overflow-hidden p-12 border-l border-white/5 shadow-glass">
 <div className="absolute inset-0 bg-grid-arena opacity-30 pointer-events-none mix-blend-screen" />
 <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-neon-violet/10 blur-[120px] rounded-full pointer-events-none" />
 <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-500/10 blur-[120px] rounded-full pointer-events-none" />

 <div className="relative z-10 max-w-md ml-auto text-right">
 <div className="w-16 h-16 bg-brand-500/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md border border-brand-500/20 ml-auto">
 <Fingerprint className="text-neon-violet" size={32} />
 </div>
 <h2 className="text-5xl font-heading font-black text-white uppercase tracking-tight leading-tight mb-6">
 Forge your <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-violet to-brand-400">Legacy</span>.
 </h2>
 <p className="text-zinc-400 font-mono text-sm leading-relaxed max-w-sm ml-auto uppercase tracking-widest">
 Create an account to track your progress, unlock advanced AI personas, and join the global leaderboards.
 </p>
 </div>

 <div className="relative z-10 text-right">
 <p className="text-white font-mono text-sm mb-6 uppercase tracking-widest bg-white/5 border border-white/10 p-4 rounded-xl shadow-glass inline-block">"The best way to win an argument is to start by being right."</p>
 <div className="flex items-center justify-end gap-4">
 <div className="text-xs font-mono uppercase tracking-widest text-right">
 <p className="text-zinc-300 font-bold">Argus-V1 Core</p>
 <p className="text-zinc-500">System Architect</p>
 </div>
 <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-neon-violet p-[2px]">
 <div className="w-full h-full bg-zinc-900 rounded-full flex items-center justify-center">
 <span className="text-sm font-black text-white">AI</span>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Right Panel: Form (Left side) */}
 <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
 <div className="absolute inset-0 bg-neon-violet/5 blur-[100px] pointer-events-none"></div>
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4 }}
 className="w-full max-w-md relative z-10"
 >
 <div className="mb-10 text-center lg:text-left">
 <h1 className="text-4xl font-heading font-black text-white mb-3 uppercase tracking-tight">
 Create Account
 </h1>
 <p className="text-zinc-400 font-mono text-xs uppercase tracking-widest">
 Join thousands of debaters improving their logic.
 </p>
 </div>

 <form onSubmit={handleSubmit} className="space-y-6">
 <Input
 label="Username"
 name="username"
 type="text"
 placeholder="e.g. LogicMaster99"
 icon={<User size={18} className="text-zinc-500" />}
 value={form.username}
 onChange={handleChange}
 disabled={isLoading}
 />

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

 <div>
 <Input
 label="Password"
 name="password"
 type="password"
 placeholder="Create a strong password"
 icon={<Lock size={18} className="text-zinc-500" />}
 value={form.password}
 onChange={handleChange}
 disabled={isLoading}
 />
 {/* Password Strength Meter */}
 {form.password.length > 0 && (
 <div className="mt-3 space-y-2">
 <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-surface border border-white/5">
 {[1, 2, 3, 4].map((level) => (
 <div
 key={level}
 className={`h-full flex-1 transition-colors duration-300 border-r border-background last:border-0 ${
 strength >= level ? strengthColors[strength] :'bg-transparent'
 }`}
 />
 ))}
 </div>
 <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 text-right">
 Encryption: <span className={`font-bold ${strengthColors[strength].replace('bg-','text-')}`}>{strengthLabels[strength]}</span>
 </p>
 </div>
 )}
 </div>

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
 disabled={isLoading}
 >
 {isLoading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
 </Button>
 </div>
 </form>

 <p className="mt-10 text-center text-zinc-500 font-mono text-xs uppercase tracking-widest">
 Already have an account?{''}
 <Link to="/login" className="font-bold text-brand-400 hover:text-brand-300 transition-colors underline decoration-brand-500/30 underline-offset-4">
 Log In
 </Link>
 </p>
 </motion.div>
 </div>
 </div>
 );
}
