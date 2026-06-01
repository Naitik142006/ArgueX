import { useEffect, useRef, useState } from 'react';
import '../styles/ChatWindow.css';

/**
 * ChatWindow Component
 * 
 * Displays real-time debate messages
 * Allows sending messages
 * Shows typing indicators
 * Auto-scrolls to latest message
 */
export default function ChatWindow({ 
  messages, 
  onSendMessage,
  onTyping,
  onStoppedTyping,
  typingUsers,
  currentUser,
  isLoading 
}) {
  const [input, setInput] = useState('');
  const [position, setPosition] = useState('pro');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Handle message submission
   */
  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Call parent handler
    onSendMessage(input, position);

    // Clear input
    setInput('');
    
    // Refocus
    inputRef.current?.focus();
  };

  /**
   * Handle typing indicator
   */
  const handleInputChange = (e) => {
    setInput(e.target.value);

    // Call parent typing handler
    if (onTyping) {
      onTyping();
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to emit stopped typing
    typingTimeoutRef.current = setTimeout(() => {
      if (onStoppedTyping) {
        onStoppedTyping();
      }
    }, 2000);
  };

  /**
   * Format timestamp
   */
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Determine message styling based on sender
   */
  const getMessageClass = (message) => {
    if (message.userId === currentUser?.id) {
      return 'message message-own';
    }
    return 'message message-other';
  };

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <h3>💬 Live Debate</h3>
        <div className="message-count">
          {messages.length} messages
        </div>
      </div>

      {/* Messages Container */}
      <div className="messages-container">
        {messages.length === 0 && (
          <div className="empty-state">
            <p>No messages yet. Start the debate!</p>
          </div>
        )}

        {messages.map((message, idx) => (
          <div key={idx} className={getMessageClass(message)}>
            <div className="message-header">
              <span className="message-author">{message.userName}</span>
              {message.position && (
                <span className={`message-position ${message.position}`}>
                  {message.position.toUpperCase()}
                </span>
              )}
              <span className="message-time">
                {formatTime(message.timestamp)}
              </span>
            </div>
            <div className="message-content">
              {message.message}
            </div>
          </div>
        ))}

        {/* Typing Indicators */}
        {typingUsers.length > 0 && (
          <div className="typing-indicator-container">
            {typingUsers.map((user) => (
              <div key={user.userId} className="typing-indicator">
                <span className="typing-text">
                  {user.userName} is typing
                </span>
                <span className="typing-dots">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <div className="input-group">
          {/* Position selector */}
          <select 
            className="position-select"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          >
            <option value="pro">Pro</option>
            <option value="con">Con</option>
            <option value="neutral">Neutral</option>
          </select>

          {/* Text input */}
          <input
            ref={inputRef}
            type="text"
            className="chat-input"
            placeholder="Enter your argument..."
            value={input}
            onChange={handleInputChange}
            disabled={isLoading}
          />

          {/* Send button */}
          <button 
            type="submit" 
            className="send-button"
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}
