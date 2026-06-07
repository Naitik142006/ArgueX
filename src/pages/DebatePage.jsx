import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Swords, Zap } from 'lucide-react';
import { createDebateRequest, addDebateMessageRequest, requestAIReply } from '../services/debateService.js';
import { debateAPI } from '../services/api.js';
import MessageItem from '../components/MessageItem.jsx';
import DebateStatistics from '../components/DebateStatistics.jsx';
import MessageThread from '../components/MessageThread.jsx';
import Button from '../components/ui/Button.jsx';
import { useSocket } from '../hooks/useSocket.js';
import { useAuth } from '../context/AuthContext.jsx';

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

  const { urlDebateId } = useParams();
  const { user: currentUser } = useAuth();

  // Get token for socket connection
  const token = window.localStorage.getItem('token');
  const { socket, isConnected } = useSocket(token);

  // Load debate if ID is provided in URL
  useEffect(() => {
    if (urlDebateId) {
      setDebateId(urlDebateId);
      debateAPI.getById(urlDebateId)
        .then(data => {
          if (data && data.topic) {
            setTopic(data.topic);
            setMessages((data.messages || []).map((m, i) => normalizeMessage(m, i)));
          }
        })
        .catch(err => {
          console.error("Failed to load existing debate:", err);
          setError("Failed to load the selected debate.");
        });
    } else {
      // Reset state if navigating to new debate
      setDebateId(null);
      setTopic('AI in education');
      setMessages([]);
    }
  }, [urlDebateId]);

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col h-[calc(100vh-64px)]">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-500/10 text-brand-500 dark:text-brand-400 rounded-xl">
              <Zap size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                Debate Arena
                {isConnected && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_1px_rgba(16,185,129,0.5)]" title="Connected" />
                )}
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Opponent: <span className="font-medium text-brand-600 dark:text-brand-400">ArgueX AI Coach</span>
                {debateId && <span className="ml-2 px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-xs">ID: {debateId.substring(0,6)}...</span>}
              </p>
            </div>
          </div>

          <Button
            variant={showStats ? 'primary' : 'outline'}
            onClick={() => setShowStats((s) => !s)}
          >
            {showStats ? 'Hide Stats' : 'Show Stats'}
          </Button>
        </div>

        <div className="flex gap-3">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={!!debateId}
            placeholder="What would you like to debate about?"
            className="flex-1 px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60 transition-all"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-medium">
          {error}
        </div>
      )}

      {showStats && debateId && (
        <div className="mb-6">
          <DebateStatistics
            roomId={debateId}
            socket={socket}
            currentUser={currentUser}
            apiPath="/api/debates"
          />
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl flex flex-col overflow-hidden shadow-sm">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 smooth-scroll">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-sm">
                <div className="w-16 h-16 mx-auto bg-brand-500/10 text-brand-500 rounded-2xl flex items-center justify-center mb-4">
                  <Swords size={32} />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">Ready to debate?</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">Set a topic above and send your first argument. The AI coach will evaluate your logic and respond.</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <MessageItem
                key={message._id}
                message={message}
                currentUser={currentUser}
                isOwn={message.userName === currentUser?.username || message.userName === currentUser?.name || message.userName === 'User' || message.userName === 'Unknown' || message.userName === 'You'}
                onReply={handleReply}
                onAddReaction={handleAddReaction}
                onRemoveReaction={handleRemoveReaction}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPin={handlePin}
                onShowThread={handleShowThread}
              />
            ))
          )}

          {isAITyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-white">AI</span>
              </div>
              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce-1" />
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce-2" />
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce-3" />
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-950/50 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex gap-3">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Construct your argument..."
              className="flex-1 max-h-32 min-h-[52px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none smooth-scroll transition-all"
              rows={1}
            />
            <Button
              onClick={handleSend}
              disabled={isAITyping || !draft.trim()}
              variant="brand"
              className="h-[52px] px-6 shrink-0"
            >
              Send
            </Button>
          </div>
          <p className="text-[10px] text-zinc-400 mt-2 text-center">
            ArgueX AI may produce inaccurate information. Press Enter to send, Shift+Enter for new line.
          </p>
        </div>
      </div>

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
    </div>
  );
}
export default DebatePage;
