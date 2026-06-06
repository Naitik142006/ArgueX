import { useEffect, useState } from 'react';
import { createDebateRequest, addDebateMessageRequest, requestAIReply } from '../services/debateService.js';
import MessageItem from '../components/MessageItem.jsx';
import DebateStatistics from '../components/DebateStatistics.jsx';
import MessageThread from '../components/MessageThread.jsx';
import { useSocket } from '../hooks/useSocket.js';
import '../styles/DebatePage.css';

/**
 * Normalize a debate-API message into the shape MessageItem expects.
 * Debate API returns { sender, text } but MessageItem expects
 * { _id, userName, message, createdAt, reactions, isPinned, isEdited, ... }
 */
function normalizeMessage(raw, index) {
  return {
    _id: raw._id || raw.id || String(index + 1),
    userName: raw.sender || raw.userName || 'Unknown',
    message: raw.text || raw.message || '',
    createdAt: raw.createdAt || new Date().toISOString(),
    sentiment: raw.sentiment || null,
    reactions: raw.reactions || new Map(),
    isPinned: raw.isPinned || false,
    isEdited: raw.isEdited || false,
    position: raw.position || null,
    replyCount: raw.replyCount || 0,
  };
}

function DebatePage() {
  const [topic, setTopic] = useState('AI in education');
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [debateId, setDebateId] = useState(null);
  const [isAITyping, setIsAITyping] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [threadMessage, setThreadMessage] = useState(null);

  // Get token for socket connection
  const token = window.localStorage.getItem('token');
  const { socket, isConnected } = useSocket(token);

  // Join socket room when debate starts
  useEffect(() => {
    if (socket && debateId) {
      socket.emit('joinRoom', { roomId: debateId });
    }
  }, [socket, debateId]);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      setMessages((prev) => [...prev, normalizeMessage(msg, prev.length)]);
    };

    const handleEdit = ({ messageId, newMessage }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, message: newMessage, isEdited: true } : m
        )
      );
    };

    const handleDelete = ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    };

    const handleReactionAdded = ({ messageId, reaction }) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m._id !== messageId) return m;
          const reactions = m.reactions instanceof Map
            ? new Map(m.reactions)
            : new Map();
          const users = reactions.get(reaction) || [];
          reactions.set(reaction, [...users, { _id: 'You', username: 'You' }]);
          return { ...m, reactions };
        })
      );
    };

    const handleReactionRemoved = ({ messageId, reaction }) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m._id !== messageId) return m;
          const reactions = m.reactions instanceof Map
            ? new Map(m.reactions)
            : new Map();
          const users = (reactions.get(reaction) || []).filter(
            (u) => u._id !== 'You'
          );
          if (users.length === 0) {
            reactions.delete(reaction);
          } else {
            reactions.set(reaction, users);
          }
          return { ...m, reactions };
        })
      );
    };

    const handlePin = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, isPinned: true } : m))
      );
    };

    const handleThread = ({ parentMessageId, replies }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === parentMessageId
            ? { ...m, replyCount: replies?.length || m.replyCount + 1 }
            : m
        )
      );
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('debateMessage', handleNewMessage);
    socket.on('messageEdited', handleEdit);
    socket.on('messageDeleted', handleDelete);
    socket.on('reactionAdded', handleReactionAdded);
    socket.on('reactionRemoved', handleReactionRemoved);
    socket.on('messagePinned', handlePin);
    socket.on('threadUpdated', handleThread);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('debateMessage', handleNewMessage);
      socket.off('messageEdited', handleEdit);
      socket.off('messageDeleted', handleDelete);
      socket.off('reactionAdded', handleReactionAdded);
      socket.off('reactionRemoved', handleReactionRemoved);
      socket.off('messagePinned', handlePin);
      socket.off('threadUpdated', handleThread);
    };
  }, [socket]);

  const handleSend = async () => {
    if (!draft.trim()) return;
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
        setMessages(updated.messages.map((m, i) => normalizeMessage(m, i)));
        setStatus('Debate started and message saved.');
      } else {
        const updated = await addDebateMessageRequest(currentDebateId, draft, token);
        setMessages(updated.messages.map((m, i) => normalizeMessage(m, i)));
        setStatus('Message sent. Waiting for AI...');
      }
      setDraft('');

      // Trigger AI reply
      setIsAITyping(true);
      try {
        const aiResponse = await requestAIReply(currentDebateId);
        setMessages(aiResponse.messages.map((m, i) => normalizeMessage(m, i)));
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

  // -- Handlers passed to MessageItem (matching its prop interface) --
  const handleAddReaction = (messageId, emoji) => {
    if (socket) {
      socket.emit('addReaction', { roomId: debateId, messageId, reaction: emoji });
    }
  };

  const handleRemoveReaction = (messageId, emoji) => {
    if (socket) {
      socket.emit('removeReaction', { roomId: debateId, messageId, reaction: emoji });
    }
  };

  const handleEdit = (messageId, newText) => {
    if (socket) {
      socket.emit('editMessage', { roomId: debateId, messageId, newMessage: newText });
    }
  };

  const handleDelete = (messageId) => {
    if (socket) {
      socket.emit('deleteMessage', { roomId: debateId, messageId });
    }
  };

  const handlePin = (messageId) => {
    if (socket) {
      socket.emit('pinMessage', { roomId: debateId, messageId });
    }
  };

  const handleReply = (messageId) => {
    const msg = messages.find((m) => m._id === messageId);
    if (msg) setThreadMessage(msg);
  };

  const handleShowThread = (messageId) => {
    const msg = messages.find((m) => m._id === messageId);
    if (msg) setThreadMessage(msg);
  };

  const handleSendReply = ({ parentId, message: replyMsg, position }) => {
    if (socket) {
      socket.emit('replyToMessage', {
        roomId: debateId,
        parentId,
        message: replyMsg,
        position,
      });
    }
  };

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/20">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">
              Debate room
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-white">
              Topic: {topic}
            </h1>
            <p className="text-slate-400">
              Opponent: ArgueX AI coach
              {isConnected && (
                <span className="ml-2 inline-block h-2 w-2 rounded-full bg-emerald-400" title="Socket connected" />
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowStats((s) => !s)}
            className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition"
          >
            {showStats ? 'Hide Stats' : '📊 Show Stats'}
          </button>
        </div>

        <div className="space-y-4">
          {/* Topic & ID */}
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Choose a topic for your debate"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
            <div className="rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm text-slate-300">
              Debate ID: {debateId ?? 'not started'}
            </div>
          </div>

          {/* Status banners */}
          {error && (
            <div className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}
          {status && (
            <div className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {status}
            </div>
          )}

          {/* Statistics panel (toggle) */}
          {showStats && debateId && (
            <DebateStatistics
              roomId={debateId}
              socket={socket}
              currentUser="You"
              apiPath="/api/debates"
            />
          )}

          {/* Messages area */}
          <div className="max-h-[420px] space-y-3 overflow-y-auto rounded-3xl border border-slate-800 bg-slate-950/90 p-5">
            {messages.length === 0 && (
              <p className="text-center text-sm text-slate-500">
                No messages yet. Start the debate!
              </p>
            )}
            {messages.map((message) => (
              <MessageItem
                key={message._id}
                message={message}
                currentUser={{ id: 'You', username: 'You' }}
                isOwn={message.userName === 'You'}
                onReply={handleReply}
                onAddReaction={handleAddReaction}
                onRemoveReaction={handleRemoveReaction}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPin={handlePin}
                onShowThread={handleShowThread}
              />
            ))}
            {isAITyping && (
              <div className="rounded-3xl bg-slate-800 px-4 py-3 text-slate-300">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                  AI Coach
                </p>
                <div className="mt-2 flex items-center space-x-2">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-slate-500 [animation-delay:-0.3s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-slate-500 [animation-delay:-0.15s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-slate-500" />
                </div>
              </div>
            )}
          </div>

          {/* Compose bar */}
          <div className="flex flex-col gap-3 rounded-3xl border border-slate-800 bg-slate-900/95 p-4 sm:flex-row sm:items-center">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
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

      {/* Thread modal */}
      {threadMessage && (
        <MessageThread
          message={threadMessage}
          roomId={debateId}
          currentUser={{ id: 'You', username: 'You' }}
          onClose={() => setThreadMessage(null)}
          onSendReply={handleSendReply}
          onAddReaction={handleAddReaction}
        />
      )}
    </section>
  );
}

export default DebatePage;
