import { useState } from 'react';

function DebatePage() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'AI', text: 'Choose a topic and begin your opening argument.' },
  ]);
  const [draft, setDraft] = useState('');

  const handleSend = () => {
    if (!draft.trim()) return;
    setMessages((prev) => [...prev, { id: prev.length + 1, sender: 'You', text: draft }]);
    setDraft('');
  };

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/20">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">Debate room</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Topic: AI in education</h1>
            <p className="text-slate-400">Opponent: ArgueX AI coach</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="max-h-[420px] space-y-3 overflow-y-auto rounded-3xl border border-slate-800 bg-slate-950/90 p-5">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-3xl px-4 py-3 ${message.sender === 'You' ? 'bg-indigo-500/15 self-end text-right text-slate-100' : 'bg-slate-800 text-slate-300'}`}
              >
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">{message.sender}</p>
                <p className="mt-2 text-base leading-7">{message.text}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 rounded-3xl border border-slate-800 bg-slate-900/95 p-4 sm:flex-row sm:items-center">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Type your argument..."
              className="min-h-[56px] flex-1 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              type="button"
              onClick={handleSend}
              className="rounded-2xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DebatePage;
