import { Link } from 'react-router-dom';

function DashboardPage() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Dashboard</h2>
            <p className="mt-2 text-sm text-slate-400">Quick access to your debate journey.</p>
          </div>
          <div className="space-y-3">
            {['Home', 'Debates', 'Leaderboard', 'Profile'].map((item) => (
              <div key={item} className="rounded-2xl bg-slate-950/80 px-4 py-3 text-sm text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </aside>

        <div className="space-y-8">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-white">Welcome back, debater.</h1>
                <p className="mt-2 text-slate-400">Pick a topic and start your next debate session.</p>
              </div>
              <Link
                to="/debate"
                className="inline-flex rounded-full bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
              >
                Start Debate
              </Link>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
              <h2 className="text-xl font-semibold text-white">Recent debates</h2>
              <p className="mt-3 text-slate-400">This area will hold your latest debates and scores.</p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
              <h2 className="text-xl font-semibold text-white">Leaderboard preview</h2>
              <p className="mt-3 text-slate-400">See how you rank against other challengers.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DashboardPage;
