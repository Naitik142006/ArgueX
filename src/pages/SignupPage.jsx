import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import InputField from '../components/Form/InputField.jsx';
import { signupRequest } from '../services/authService.js';

function SignupPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
    setMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.username || !form.email || !form.password || !form.confirmPassword) {
      setError('Please fill in every field.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const data = await signupRequest({
        username: form.username,
        email: form.email,
        password: form.password,
      });

      window.localStorage.setItem('arguexToken', data.token);
      setMessage('Signup successful! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-10 shadow-xl shadow-slate-950/30">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">Welcome to ArgueX</p>
          <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">Create your debate profile</h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            Start the frontend experience with a signup form that uses React state and validation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Enter your display name"
          />
          <InputField
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
          />
          <InputField
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Create a password"
          />
          <InputField
            label="Confirm password"
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat your password"
          />

          {error && <div className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}
          {message && <div className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{message}</div>}

          <button
            type="submit"
            className="w-full rounded-2xl bg-indigo-500 px-5 py-3 text-base font-semibold text-white transition hover:bg-indigo-400"
          >
            Signup
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-white hover:text-indigo-300">
            Login here
          </Link>
        </p>
      </div>
    </section>
  );
}

export default SignupPage;
