import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquareQuote, ChevronRight } from 'lucide-react';
import Button from './ui/Button.jsx';
import Avatar from './ui/Avatar.jsx';
import Badge from './ui/Badge.jsx';

export default function MessageThread({
  message,
  roomId,
  currentUser,
  onClose,
  onSendReply,
  onAddReaction,
}) {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchThread = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `/api/chat/rooms/${roomId}/threads/${message._id}`,
          {
            headers: { 'Authorization': `Bearer ${token}` },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setReplies(data.thread.replies || []);
        }
      } catch (error) {
        console.error('Error fetching thread:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchThread();
  }, [message._id, roomId]);

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsSubmitting(true);
    try {
      onSendReply({
        parentId: message._id,
        message: replyText,
        position: 'neutral',
      });

      const newReply = {
        _id: Date.now().toString(),
        author: currentUser?.username || 'You',
        message: replyText,
        position: 'neutral',
        timestamp: new Date(),
        reactions: new Map(),
      };

      setReplies([...replies, newReply]);
      setReplyText('');
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Sidebar */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full sm:w-[400px] h-full bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg font-heading font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              <MessageSquareQuote size={20} className="text-brand-500" />
              Thread
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto smooth-scroll">
            {/* Original Message */}
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30">
              <div className="flex items-start gap-3">
                <Avatar name={message.userName} size="sm" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-zinc-900 dark:text-white">
                      {message.userName}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                    {message.message}
                  </div>
                </div>
              </div>
            </div>

            {/* Replies */}
            <div className="p-5">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
                <span className="text-xs font-medium text-zinc-400">
                  {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
                </span>
                <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                        <div className="h-10 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : replies.length > 0 ? (
                <div className="space-y-5">
                  {replies.map((reply) => (
                    <div key={reply._id} className="flex items-start gap-3">
                      <Avatar name={reply.author} size="sm" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-zinc-900 dark:text-white">
                            {reply.author}
                          </span>
                          <span className="text-[10px] text-zinc-500">
                            {new Date(reply.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 p-3 rounded-2xl rounded-tl-sm">
                          {reply.message}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-zinc-500 py-8">
                  No replies yet. Be the first to start the discussion!
                </p>
              )}
            </div>
          </div>

          {/* Reply Input */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <form onSubmit={handleSubmitReply} className="flex flex-col gap-3">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Reply to thread..."
                disabled={isSubmitting}
                className="w-full max-h-32 min-h-[80px] px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none smooth-scroll transition-all"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={!replyText.trim() || isSubmitting}
                  variant="brand"
                  loading={isSubmitting}
                >
                  Send Reply
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
