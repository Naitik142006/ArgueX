import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
      <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <span className="inline-flex rounded-full bg-indigo-500/10 px-4 py-1 text-sm font-semibold text-indigo-200">
            AI-powered debate platform
          </span>
          <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl">
            ArgueX — where ideas are sharpened by AI.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-400">
            Explore debate topics, challenge AI personalities, and build your skills with a modern frontend prototype.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/signup"
              className="rounded-full bg-indigo-500 px-6 py-3 text-base font-semibold text-white transition hover:bg-indigo-400"
            >
              Start Debating
            </Link>
            <Link
              to="/login"
              className="rounded-full border border-slate-700 bg-slate-900/90 px-6 py-3 text-base font-semibold text-slate-100 transition hover:border-slate-500"
            >
              Login
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/30">
          <h2 className="text-xl font-semibold text-white">Platform features</h2>
          <div className="mt-6 space-y-4">
            {['AI debates', 'Leaderboards', 'AI personalities', 'Real-time scoring'].map((feature) => (
              <div key={feature} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
                <p className="font-medium text-slate-100">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default LandingPage;
