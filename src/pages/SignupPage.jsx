import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', email: '', password: '' });
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
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
  const strengthColors = ['bg-rose-500', 'bg-amber-500', 'bg-emerald-400', 'bg-emerald-500', 'bg-teal-500'];

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
      setError(err.message || 'Signup failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-row-reverse">
      {/* Left Panel: Branding / Art (Reversed to right side for variety) */}
      <div className="hidden lg:flex flex-1 flex-col justify-between bg-zinc-900 relative overflow-hidden p-12">
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-500/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-500/20 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-md ml-auto text-right">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md border border-white/10 ml-auto">
            <CheckCircle2 className="text-accent-300" size={24} />
          </div>
          <h2 className="text-4xl font-heading font-bold text-white leading-tight mb-6">
            Start sharpening your mind today.
          </h2>
          <p className="text-zinc-400 text-lg">
            Create an account to track your progress, unlock advanced AI personas, and join the global leaderboards.
          </p>
        </div>

        <div className="relative z-10 text-right">
          <p className="text-white font-medium mb-4">"The best way to win an argument is to start by being right."</p>
          <div className="flex items-center justify-end gap-3">
            <div className="text-sm text-right">
              <p className="text-zinc-300 font-semibold">ArgueX AI Coach</p>
              <p className="text-zinc-500">System Core</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 p-[2px]">
              <div className="w-full h-full bg-zinc-900 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">AI</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Form (Left side) */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white dark:bg-zinc-950">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-heading font-bold text-zinc-900 dark:text-white mb-3">
              Create your account
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Join thousands of debaters improving their logic.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Username"
              name="username"
              type="text"
              placeholder="e.g. LogicMaster99"
              icon={<User size={18} />}
              value={form.username}
              onChange={handleChange}
              disabled={isLoading}
            />

            <Input
              label="Email address"
              name="email"
              type="email"
              placeholder="you@example.com"
              icon={<Mail size={18} />}
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
                icon={<Lock size={18} />}
                value={form.password}
                onChange={handleChange}
                disabled={isLoading}
              />
              
              {/* Password Strength Meter */}
              {form.password.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-full flex-1 transition-colors duration-300 border-r border-white dark:border-zinc-950 last:border-0 ${
                          strength >= level ? strengthColors[strength] : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 text-right">
                    Password strength: <span className="font-medium text-zinc-700 dark:text-zinc-300">{strengthLabels[strength]}</span>
                  </p>
                </div>
              )}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-medium flex items-start gap-2"
              >
                <ShieldCheck className="shrink-0 mt-0.5" size={16} />
                <p>{error}</p>
              </motion.div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                variant="brand"
                size="lg"
                className="w-full"
                loading={isLoading}
              >
                Create Account
              </Button>
            </div>
          </form>

          <p className="mt-8 text-center text-zinc-600 dark:text-zinc-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-500 transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
