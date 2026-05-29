import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import InputField from '../components/Form/InputField.jsx';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * SignupPage Component
 * 
 * This component handles user registration.
 * 
 * Now uses useAuth() hook to access signup method from context.
 * This automatically updates global auth state when signup succeeds!
 */
function SignupPage() {
  // Get signup method from auth context
  const { signup } = useAuth();
  const navigate = useNavigate();

  // State Management
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ============================================================
  // EVENT HANDLERS
  // ============================================================

  /**
   * handleChange: Called when user types in any input field
   * 
   * Why update state on every keystroke?
   * - React re-renders component to show what user typed
   * - Enables real-time validation
   * - Enables "clear errors when user starts typing again"
   * 
   * Why clear error/message?
   * - User is fixing the issue, so old error is no longer relevant
   * - Clears previous success message if user tries again
   */
  const handleChange = (event) => {
    const { name, value } = event.target;
    
    // Update specific field in form state
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when user starts typing (better UX)
    if (error) setError('');
    if (message) setMessage('');
  };

  /**
   * handleSubmit: Called when user clicks signup button
   * 
   * Steps:
   * 1. Prevent default form behavior (page reload)
   * 2. Validate form on frontend (fast, no network)
   * 3. If validation fails: show error, return
   * 4. If validation passes: make API call
   * 5. If API succeeds: show success message, navigate
   * 6. If API fails: show error message
   */
  const handleSubmit = async (event) => {
    // Prevent page refresh when form submits
    event.preventDefault();

    // ========================================
    // STEP 1: FRONTEND VALIDATION
    // ========================================
    // These checks happen INSTANTLY (no network delay)
    // This is where we catch obvious mistakes immediately

    // Check all fields are filled
    if (!form.username.trim()) {
      setError('Username is required');
      return;
    }

    if (!form.email.trim()) {
      setError('Email is required');
      return;
    }

    if (!form.password) {
      setError('Password is required');
      return;
    }

    if (!form.confirmPassword) {
      setError('Please confirm your password');
      return;
    }

    // Check passwords match
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Check password is strong enough (beginner-friendly)
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Check email looks valid (simple check)
    if (!form.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    // ========================================
    // STEP 2: API CALL (BACKEND VALIDATION)
    // ========================================
    // Now that frontend validation passes, we can safely make API call

    try {
      // Show loading state
      setIsLoading(true);
      setError('');
      setMessage('');

      // Call backend to create account
      await signup({
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      // Backend returns: { token, user }
      // authService already stored token in localStorage
      // Now just show success and redirect

      // Backend returns: { token, user }
      // authService already stored token in localStorage
      // AuthContext also updated the global state
      // Now just show success and redirect

      setMessage('✅ Account created successfully! Redirecting to dashboard...');

      // Wait 1 second for user to see success message
      // Then redirect to dashboard (where they'll be logged in)
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);

    } catch (err) {
      // API call failed - show error to user
      setIsLoading(false);

      // Different error messages based on what went wrong
      if (err.status === 400) {
        // 400 = Client error (email already exists, validation failed, etc.)
        setError(err.message || 'Invalid signup information');
      } else if (err.status === 500) {
        // 500 = Server error
        setError('Server error. Please try again later.');
      } else if (err.message === 'Failed to fetch') {
        // Network error (backend not running)
        setError('Cannot connect to server. Is the backend running?');
      } else {
        setError(err.message || 'Signup failed. Please try again.');
      }
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-10 shadow-xl shadow-slate-950/30">
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">Welcome to ArgueX</p>
          <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">Create your debate profile</h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            Join thousands of debaters. Start arguing about what matters.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Input */}
          <InputField
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Enter your display name"
            disabled={isLoading}
          />

          {/* Email Input */}
          <InputField
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            disabled={isLoading}
          />

          {/* Password Input */}
          <InputField
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Create a strong password (min 6 characters)"
            disabled={isLoading}
          />

          {/* Confirm Password Input */}
          <InputField
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat your password"
            disabled={isLoading}
          />

          {/* Error Message */}
          {error && (
            <div
              className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
              role="alert"
            >
              ❌ {error}
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div
              className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
              role="status"
            >
              {message}
            </div>
          )}

          {/* Submit Button */}
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
                Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-8 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-300 hover:text-indigo-200">
            Login here
          </Link>
        </p>
      </div>
    </section>
  );
}

export default SignupPage;
