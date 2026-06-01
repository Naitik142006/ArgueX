import { useState, useRef } from 'react';
import '../styles/MessageItem.css';

/**
 * Enhanced MessageItem Component
 * 
 * Displays a single message with:
 * - Reactions
 * - Edit/Delete options
 * - Thread indicator
 * - Sentiment indicator
 */
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
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const editInputRef = useRef(null);

  /**
   * Handle edit submission
   */
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (editText.trim() && editText !== message.message) {
      onEdit(message._id, editText);
      setIsEditing(false);
    }
  };

  /**
   * Format sentiment for display
   */
  const getSentimentColor = (sentiment) => {
    if (!sentiment) return 'neutral';
    switch (sentiment.label) {
      case 'POSITIVE':
        return 'positive';
      case 'NEGATIVE':
        return 'negative';
      default:
        return 'neutral';
    }
  };

  /**
   * Get emotion icon
   */
  const getEmotionIcon = (emotion) => {
    const icons = {
      ASSERTIVE: '💪',
      CURIOUS: '🤔',
      CONCERNED: '😟',
      SUPPORTIVE: '👍',
      CRITICAL: '⚠️',
      NEUTRAL: '😐',
    };
    return icons[emotion] || '😐';
  };

  // Common reactions
  const REACTIONS = ['👍', '👎', '💯', '🔥', '😊', '❌', '🤔', '📌'];

  return (
    <div className={`message-item ${isOwn ? 'message-own' : 'message-other'}`}>
      <div className="message-container">
        {/* Header */}
        <div className="message-header-row">
          <div className="message-author-info">
            <span className="message-author">{message.userName}</span>
            {message.position && (
              <span className={`message-position ${message.position}`}>
                {message.position.toUpperCase()}
              </span>
            )}
          </div>

          {/* Sentiment indicator */}
          {message.sentiment && (
            <div className={`sentiment-badge ${getSentimentColor(message.sentiment)}`}>
              <span>{getEmotionIcon(message.sentiment.emotion)}</span>
              <span className="sentiment-label">
                {message.sentiment.label.toLowerCase()}
              </span>
            </div>
          )}

          {/* Time and metadata */}
          <div className="message-meta">
            <span className="message-time">
              {new Date(message.createdAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            {message.isEdited && (
              <span className="message-edited">(edited)</span>
            )}
          </div>
        </div>

        {/* Message content */}
        {isEditing ? (
          <form onSubmit={handleEditSubmit} className="edit-form">
            <input
              ref={editInputRef}
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="edit-input"
              autoFocus
            />
            <div className="edit-actions">
              <button type="submit" className="btn-save">
                Save
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => {
                  setIsEditing(false);
                  setEditText(message.message);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="message-content">
            {message.message}
          </div>
        )}

        {/* Thread indicator */}
        {message.replyCount > 0 && (
          <div className="thread-indicator" onClick={() => onShowThread(message._id)}>
            <span>💬 {message.replyCount} {message.replyCount === 1 ? 'reply' : 'replies'}</span>
          </div>
        )}

        {/* Reactions */}
        <div className="reactions-row">
          {message.reactions && message.reactions.size > 0 && (
            <div className="reactions-display">
              {Array.from(message.reactions.entries()).map(([emoji, users]) => (
                <button
                  key={emoji}
                  className={`reaction-badge ${
                    users.some(u => u._id === currentUser?.id)
                      ? 'reaction-active'
                      : ''
                  }`}
                  onClick={() =>
                    users.some(u => u._id === currentUser?.id)
                      ? onRemoveReaction(message._id, emoji)
                      : onAddReaction(message._id, emoji)
                  }
                  title={users.map(u => u.username).join(', ')}
                >
                  {emoji} {users.length}
                </button>
              ))}
            </div>
          )}

          {/* Add reaction button */}
          <div className="reaction-picker-wrapper">
            <button
              className="btn-add-reaction"
              onClick={() => setShowReactionPicker(!showReactionPicker)}
              title="Add reaction"
            >
              +
            </button>

            {showReactionPicker && (
              <div className="reaction-picker">
                {REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    className="reaction-option"
                    onClick={() => {
                      onAddReaction(message._id, emoji);
                      setShowReactionPicker(false);
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message actions */}
        <div className="message-actions">
          {/* Reply button */}
          <button
            className="action-btn reply-btn"
            onClick={() => onReply(message._id)}
            title="Reply to this message"
          >
            💬 Reply
          </button>

          {/* Options menu */}
          <div className="action-menu">
            <button
              className="action-btn options-btn"
              onClick={() => setShowOptions(!showOptions)}
            >
              ⋮
            </button>

            {showOptions && (
              <div className="options-dropdown">
                {/* Edit button */}
                {isOwn && (
                  <button
                    className="option-item edit-option"
                    onClick={() => {
                      setIsEditing(true);
                      setShowOptions(false);
                    }}
                  >
                    ✏️ Edit
                  </button>
                )}

                {/* Delete button */}
                {isOwn && (
                  <button
                    className="option-item delete-option"
                    onClick={() => {
                      onDelete(message._id);
                      setShowOptions(false);
                    }}
                  >
                    🗑️ Delete
                  </button>
                )}

                {/* Pin button (room creator only) */}
                {!message.isPinned && (
                  <button
                    className="option-item pin-option"
                    onClick={() => {
                      onPin(message._id);
                      setShowOptions(false);
                    }}
                  >
                    📌 Pin
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Pinned indicator */}
        {message.isPinned && (
          <div className="pinned-badge">📌 Pinned</div>
        )}
      </div>
    </div>
  );
}
