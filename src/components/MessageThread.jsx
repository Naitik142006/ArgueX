import { useState, useEffect } from 'react';
import '../styles/MessageThread.css';

/**
 * Message Thread Component
 * 
 * Displays parent message and all threaded replies
 * Allows replying within the thread
 */
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
  const [selectedPosition, setSelectedPosition] = useState('neutral');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    /**
     * Fetch thread replies
     */
    const fetchThread = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `/api/chat/rooms/${roomId}/threads/${message._id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
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

  /**
   * Handle reply submission
   */
  const handleSubmitReply = async (e) => {
    e.preventDefault();

    if (!replyText.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Emit to socket (real-time)
      onSendReply({
        parentId: message._id,
        message: replyText,
        position: selectedPosition,
      });

      // Add to local state optimistically
      const newReply = {
        _id: Date.now().toString(),
        author: currentUser?.username || 'You',
        message: replyText,
        position: selectedPosition,
        timestamp: new Date(),
        reactions: new Map(),
      };

      setReplies([...replies, newReply]);
      setReplyText('');
      setSelectedPosition('neutral');
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Get sentiment color
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

  return (
    <div className="message-thread-overlay">
      <div className="message-thread-container">
        {/* Header */}
        <div className="thread-header">
          <h3>💬 Message Thread</h3>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Thread content */}
        <div className="thread-content">
          {/* Parent message */}
          <div className="parent-message-section">
            <div className="parent-label">Original Message</div>

            <div className="parent-message">
              <div className="parent-author">{message.userName}</div>

              {message.position && (
                <span className={`parent-position ${message.position}`}>
                  {message.position.toUpperCase()}
                </span>
              )}

              <div className="parent-text">{message.message}</div>

              {message.sentiment && (
                <div
                  className={`sentiment-indicator ${getSentimentColor(
                    message.sentiment
                  )}`}
                >
                  {message.sentiment.label}
                </div>
              )}

              <div className="parent-time">
                {new Date(message.createdAt).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="thread-divider" />

          {/* Replies */}
          <div className="replies-section">
            <div className="replies-label">
              {replies.length === 0
                ? 'No replies yet'
                : `${replies.length} ${replies.length === 1 ? 'Reply' : 'Replies'}`}
            </div>

            {loading ? (
              <div className="replies-loading">Loading replies...</div>
            ) : replies.length > 0 ? (
              <div className="replies-list">
                {replies.map((reply) => (
                  <div key={reply._id} className="reply-item">
                    <div className="reply-header">
                      <span className="reply-author">{reply.author}</span>

                      {reply.position && (
                        <span className={`reply-position ${reply.position}`}>
                          {reply.position.toUpperCase()}
                        </span>
                      )}

                      <span className="reply-time">
                        {new Date(reply.timestamp).toLocaleTimeString(
                          'en-US',
                          {
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </span>
                    </div>

                    <div className="reply-message">{reply.message}</div>

                    {reply.sentiment && (
                      <div
                        className={`sentiment-indicator ${getSentimentColor(
                          reply.sentiment
                        )} small`}
                      >
                        {reply.sentiment.label}
                      </div>
                    )}

                    {/* Reactions on reply */}
                    {reply.reactions && reply.reactions.size > 0 && (
                      <div className="reply-reactions">
                        {Array.from(reply.reactions.entries()).map(
                          ([emoji, users]) => (
                            <span key={emoji} className="reply-reaction-badge">
                              {emoji} {users.length}
                            </span>
                          )
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Reply form */}
          <form onSubmit={handleSubmitReply} className="reply-form">
            <div className="form-label">Add your reply</div>

            <div className="reply-form-content">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                className="reply-input"
                rows={3}
                disabled={isSubmitting}
              />

              <div className="form-controls">
                <div className="position-selector">
                  <label>Position:</label>
                  <select
                    value={selectedPosition}
                    onChange={(e) => setSelectedPosition(e.target.value)}
                    disabled={isSubmitting}
                  >
                    <option value="pro">Pro</option>
                    <option value="con">Con</option>
                    <option value="neutral">Neutral</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!replyText.trim() || isSubmitting}
                  className="submit-button"
                >
                  {isSubmitting ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Overlay click to close */}
      <div className="thread-overlay-bg" onClick={onClose} />
    </div>
  );
}
