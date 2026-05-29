import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import InputField from '../components/Form/InputField.jsx';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * LoginPage Component
 * 
 * Handles user authentication (logging in).
 * 
 * Flow:
 * 1. User enters email and password
 * 2. Frontend validates (both filled, email has @)
 * 3. If valid: make API call to backend
 * 4. Backend verifies credentials against MongoDB
 * 5. Backend returns token if valid, error if not
 * 6. Frontend stores token in localStorage
 * 7. Frontend redirects to dashboard
 * 8. User is now logged in!
 */
function LoginPage() {
  // Get login method from auth context
  const { login } = useAuth();
  const navigate = useNavigate();

  // State Management
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * handleChange: Update form state as user types
   * Clear errors when user starts typing again
   */
  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (message) setMessage('');
  };

  /**
   * handleSubmit: Process login when user clicks "Login"
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    // FRONTEND VALIDATION (Fast, no network)
    if (!form.email.trim()) {
      setError('Email is required');
      return;
    }

    if (!form.password) {
      setError('Password is required');
      return;
    }

    if (!form.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    // API CALL (Make network request)
    try {
      setIsLoading(true);
      setError('');
      setMessage('');

      const data = await login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      // Token already stored automatically
      setMessage('✅ Login successful! Redirecting...');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 800);

    } catch (err) {
      setIsLoading(false);
      
      // Show appropriate error based on what failed
      if (err.status === 401) {
        setError('Invalid email or password');
      } else if (err.status === 400) {
        setError(err.message || 'Please check your credentials');
      } else if (err.message === 'Failed to fetch') {
        setError('Cannot connect to server. Is the backend running?');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-10 shadow-xl shadow-slate-950/30">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">Welcome Back</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">Access your dashboard</h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            Login to continue your debates and join the discussion.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            disabled={isLoading}
          />

          <InputField
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            disabled={isLoading}
          />

          {error && (
            <div className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200" role="alert">
              ❌ {error}
            </div>
          )}
          {message && (
            <div className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200" role="status">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full rounded-2xl px-5 py-3 text-base font-semibold text-white transition ${
              isLoading
                ? 'bg-slate-600 cursor-not-allowed opacity-50'
                : 'bg-indigo-500 hover:bg-indigo-400'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Logging in...
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-indigo-300 hover:text-indigo-200">
            Create one now
          </Link>
        </p>
      </div>
    </section>
  );
}

export default LoginPage;
