import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import InputField from '../components/Form/InputField.jsx';
import { loginRequest } from '../services/authService.js';

function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
    setMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const data = await loginRequest({
        email: form.email,
        password: form.password,
      });

      window.localStorage.setItem('arguexToken', data.token);
      setMessage('Login successful. Redirecting...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 800);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-10 shadow-xl shadow-slate-950/30">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">Login</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">Access your dashboard</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
            placeholder="Enter your password"
          />

          <button
            type="submit"
            className="w-full rounded-2xl bg-indigo-500 px-5 py-3 text-base font-semibold text-white transition hover:bg-indigo-400"
          >
            Login
          </button>
        </form>

        {error && <div className="mt-4 rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}
        {message && <div className="mt-4 rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{message}</div>}

        <p className="mt-6 text-center text-sm text-slate-400">
          Don’t have an account?{' '}
          <Link to="/signup" className="font-medium text-white hover:text-indigo-300">
            Signup now
          </Link>
        </p>
      </div>
    </section>
  );
}

export default LoginPage;
