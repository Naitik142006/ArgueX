import { useState, useRef, useEffect } from 'react';
import { SmilePlus, Reply, MoreVertical, Pencil, Trash2, Pin, Check, X, MessageSquareQuote } from 'lucide-react';
import Avatar from './ui/Avatar.jsx';
import Badge from './ui/Badge.jsx';

export default function MessageItem({
  message,
  currentUser,
  isOwn,
  onReply,
  onAddReaction,
  onRemoveReaction,
  onEdit,
  onDelete,
  onPin,
  onShowThread,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.message);
  const [showOptions, setShowOptions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const optionsRef = useRef(null);
  const reactionsRef = useRef(null);
  const isAI = message.userName === 'ArgueX AI Coach' || message.userName.includes('AI');

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target)) {
        setShowOptions(false);
      }
      if (reactionsRef.current && !reactionsRef.current.contains(e.target)) {
        setShowReactions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (editText.trim() && editText !== message.message) {
      onEdit(message._id, editText);
    }
    setIsEditing(false);
  };

  const getSentimentVariant = (sentiment) => {
    if (!sentiment) return 'default';
    if (sentiment.label === 'POSITIVE') return 'success';
    if (sentiment.label === 'NEGATIVE') return 'danger';
    return 'default';
  };

  const REACTIONS = ['👍', '💡', '💯', '🔥', '🤔', '❌'];

  return (
    <div className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'} group mb-4`}>
      <div className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${isOwn ? 'flex-row-reverse' : ''}`}>
        
        {/* Avatar */}
        {!isOwn && (
          <div className="shrink-0 mt-1">
            {isAI ? (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 p-[2px]">
                <div className="w-full h-full bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center">
                  <span className="text-[10px] font-bold text-zinc-900 dark:text-white">AI</span>
                </div>
              </div>
            ) : (
              <Avatar name={message.userName} size="sm" />
            )}
          </div>
        )}

        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          
          {/* Header Info */}
          <div className={`flex items-center gap-2 mb-1.5 px-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {isOwn ? (currentUser?.username || currentUser?.name || 'You') : (message.userName === 'User' ? 'Unknown' : message.userName)}
            </span>
            
            <span className="text-[10px] text-zinc-400">
              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            
            {message.sentiment && !isOwn && (
              <Badge variant={getSentimentVariant(message.sentiment)} size="xs">
                {message.sentiment.label}
              </Badge>
            )}
            
            {message.isPinned && (
              <Pin size={12} className="text-amber-500 fill-amber-500" />
            )}
          </div>

          {/* Message Bubble */}
          <div className="relative group/bubble flex items-center gap-2">
            
            {/* Hover Actions (Left of bubble if own, Right if other) */}
            <div className={`absolute top-0 -translate-y-1/2 opacity-0 group-hover/bubble:opacity-100 transition-opacity flex items-center gap-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-1 shadow-sm z-10 ${isOwn ? 'right-full mr-2' : 'left-full ml-2'}`}>
              
              <div className="relative" ref={reactionsRef}>
                <button 
                  onClick={() => setShowReactions(!showReactions)}
                  className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md transition-colors"
                  title="Add reaction"
                >
                  <SmilePlus size={14} />
                </button>
                {showReactions && (
                  <div className={`absolute top-full mt-1 ${isOwn ? 'right-0' : 'left-0'} flex gap-1 p-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl z-20`}>
                    {REACTIONS.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => {
                          onAddReaction(message._id, emoji);
                          setShowReactions(false);
                        }}
                        className="w-8 h-8 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg text-lg transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button 
                onClick={() => onReply(message._id)}
                className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md transition-colors"
                title="Reply in thread"
              >
                <Reply size={14} />
              </button>

              <div className="relative" ref={optionsRef}>
                <button 
                  onClick={() => setShowOptions(!showOptions)}
                  className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md transition-colors"
                >
                  <MoreVertical size={14} />
                </button>
                {showOptions && (
                  <div className={`absolute top-full mt-1 ${isOwn ? 'right-0' : 'left-0'} w-32 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl z-20`}>
                    {isOwn && (
                      <button onClick={() => { setIsEditing(true); setShowOptions(false); }} className="w-full text-left px-3 py-1.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 flex items-center gap-2">
                        <Pencil size={14} /> Edit
                      </button>
                    )}
                    {!message.isPinned && (
                      <button onClick={() => { onPin(message._id); setShowOptions(false); }} className="w-full text-left px-3 py-1.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 flex items-center gap-2">
                        <Pin size={14} /> Pin
                      </button>
                    )}
                    {isOwn && (
                      <button onClick={() => { onDelete(message._id); setShowOptions(false); }} className="w-full text-left px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2">
                        <Trash2 size={14} /> Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bubble */}
            <div 
              className={`
                px-4 py-2.5 text-sm leading-relaxed shadow-sm
                ${isOwn 
                  ? 'bg-brand-600 text-white rounded-2xl rounded-tr-sm' 
                  : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 text-zinc-900 dark:text-zinc-100 rounded-2xl rounded-tl-sm'
                }
              `}
            >
              {isEditing ? (
                <form onSubmit={handleEditSubmit} className="flex flex-col gap-2 min-w-[200px]">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className={`w-full bg-black/10 dark:bg-black/20 border-none rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-white/50 resize-none ${isOwn ? 'text-white' : 'text-zinc-900 dark:text-white'}`}
                    rows={2}
                    autoFocus
                  />
                  <div className="flex justify-end gap-1">
                    <button type="button" onClick={() => { setIsEditing(false); setEditText(message.message); }} className="p-1 hover:bg-black/10 rounded">
                      <X size={14} />
                    </button>
                    <button type="submit" className="p-1 hover:bg-black/10 rounded">
                      <Check size={14} />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="whitespace-pre-wrap">{message.message}</div>
              )}
            </div>
          </div>

          {/* Footer Metadata (Edited, Reactions, Thread) */}
          <div className={`flex flex-wrap items-center gap-1.5 mt-1.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            
            {message.isEdited && (
              <span className="text-[10px] text-zinc-400 mr-1">(edited)</span>
            )}

            {/* Reactions */}
            {message.reactions && message.reactions.size > 0 && Array.from(message.reactions.entries()).map(([emoji, users]) => (
              <button
                key={emoji}
                onClick={() => users.some(u => u._id === currentUser?.id || u._id === 'You') ? onRemoveReaction(message._id, emoji) : onAddReaction(message._id, emoji)}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-xs font-medium border transition-colors ${
                  users.some(u => u._id === currentUser?.id || u._id === 'You')
                    ? 'bg-brand-50 dark:bg-brand-500/20 border-brand-200 dark:border-brand-500/30 text-brand-600 dark:text-brand-300'
                    : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                }`}
                title={users.map(u => u.username || u._id).join(', ')}
              >
                <span>{emoji}</span>
                <span>{users.length}</span>
              </button>
            ))}

            {/* Thread Indicator */}
            {message.replyCount > 0 && (
              <button
                onClick={() => onShowThread(message._id)}
                className="flex items-center gap-1 px-2 py-0.5 ml-1 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-brand-600 dark:text-brand-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <MessageSquareQuote size={12} />
                {message.replyCount} {message.replyCount === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
