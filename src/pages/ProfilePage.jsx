function ProfilePage() {
  const stats = [
    { label: 'Debates', value: 28 },
    { label: 'Wins', value: 18 },
    { label: 'Losses', value: 8 },
    { label: 'Achievements', value: 6 },
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/20">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">Profile</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Your debate stats</h1>
          </div>
          <div className="rounded-3xl bg-slate-950/90 px-5 py-3 text-sm text-slate-300">ArgueX member</div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
              <p className="text-sm text-slate-400">{item.label}</p>
              <p className="mt-4 text-4xl font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProfilePage;
