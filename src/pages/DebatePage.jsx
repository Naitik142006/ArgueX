import { useState } from 'react';
import { createDebateRequest, addDebateMessageRequest, requestAIReply } from '../services/debateService.js';

function DebatePage() {
  const [topic, setTopic] = useState('AI in education');
  const [messages, setMessages] = useState([
    { id: 1, sender: 'AI', text: 'Choose a topic and begin your opening argument.' },
  ]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [debateId, setDebateId] = useState(null);
  const [isAITyping, setIsAITyping] = useState(false);

  const handleSend = async () => {
    if (!draft.trim()) return;

    const token = window.localStorage.getItem('arguexToken');
    if (!token) {
      setError('You must be logged in to send a message.');
      return;
    }

    try {
      setError('');
      setStatus('Sending message...');

      let currentDebateId = debateId;

      if (!currentDebateId) {
        const created = await createDebateRequest(topic, token);
        const updated = await addDebateMessageRequest(created._id, draft, token);
        currentDebateId = created._id;
        setDebateId(currentDebateId);
        setMessages(updated.messages.map((message, index) => ({ ...message, id: index + 1 })));
        setStatus('Debate started and message saved.');
      } else {
        const updated = await addDebateMessageRequest(currentDebateId, draft, token);
        setMessages(updated.messages.map((message, index) => ({ ...message, id: index + 1 })));
        setStatus('Message sent. Waiting for AI...');
      }

      setDraft('');
      
      // TRIGGER AI REPLY
      setIsAITyping(true);
      try {
        const aiResponse = await requestAIReply(currentDebateId);
        setMessages(aiResponse.messages.map((message, index) => ({ ...message, id: index + 1 })));
        setStatus('AI replied.');
      } catch (aiErr) {
        setError('AI failed to reply: ' + aiErr.message);
      } finally {
        setIsAITyping(false);
      }
      
    } catch (err) {
      setError(err.message);
      setStatus('');
    }
  };

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/20">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">Debate room</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Topic: {topic}</h1>
            <p className="text-slate-400">Opponent: ArgueX AI coach</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="Choose a topic for your debate"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
            <div className="rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm text-slate-300">
              Debate ID: {debateId ?? 'not started'}
            </div>
          </div>
          {error && <div className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}
          {status && <div className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{status}</div>}
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
            {isAITyping && (
              <div className="rounded-3xl bg-slate-800 px-4 py-3 text-slate-300">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">AI Coach</p>
                <div className="mt-2 flex items-center space-x-2">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-slate-500 [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-slate-500 [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-slate-500"></div>
                </div>
              </div>
            )}
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
              disabled={isAITyping}
              className="rounded-2xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-50"
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
