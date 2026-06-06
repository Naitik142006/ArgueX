import { useState, useEffect } from 'react';
import '../styles/DebateStatistics.css';

/**
 * Debate Statistics Dashboard
 * 
 * Real-time metrics for debate:
 * - Message counts
 * - Sentiment analysis
 * - Reaction statistics
 * - Participant engagement
 * - Timeline metrics
 */
export default function DebateStatistics({ roomId, socket, currentUser, apiPath = '/api/chat/rooms' }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!roomId) return;

    /**
     * Fetch initial statistics
     */
    const fetchStatistics = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${apiPath}/${roomId}/statistics`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data.statistics);
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();

    /**
     * Listen for real-time statistics updates
     */
    if (socket) {
      socket.on('statisticsUpdated', (newStats) => {
        setStats(newStats);
      });

      return () => {
        socket.off('statisticsUpdated');
      };
    }
  }, [roomId, socket]);

  if (loading) {
    return <div className="statistics-loading">Loading statistics...</div>;
  }

  if (!stats) {
    return <div className="statistics-error">Unable to load statistics</div>;
  }

  /**
   * Sentiment color mapping
   */
  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'POSITIVE':
        return '#4caf50';
      case 'NEGATIVE':
        return '#f44336';
      case 'NEUTRAL':
        return '#9e9e9e';
      default:
        return '#667eea';
    }
  };

  /**
   * Format percentage
   */
  const formatPercent = (value) => {
    return typeof value === 'number' ? `${value}%` : '0%';
  };

  return (
    <div className="debate-statistics">
      {/* Tabs */}
      <div className="stats-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'sentiment' ? 'active' : ''}`}
          onClick={() => setActiveTab('sentiment')}
        >
          😊 Sentiment
        </button>
        <button
          className={`tab-button ${activeTab === 'engagement' ? 'active' : ''}`}
          onClick={() => setActiveTab('engagement')}
        >
          👥 Engagement
        </button>
        <button
          className={`tab-button ${activeTab === 'reactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('reactions')}
        >
          👍 Reactions
        </button>
      </div>

      {/* Tab Content */}
      <div className="stats-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="stats-section">
            <h3>Debate Overview</h3>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Messages</div>
                <div className="stat-value">{stats.messageCount || 0}</div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Participants</div>
                <div className="stat-value">{stats.participantCount || 0}</div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Duration</div>
                <div className="stat-value">
                  {stats.duration ? `${stats.duration}m` : 'Ongoing'}
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Threads</div>
                <div className="stat-value">{stats.threads || 0}</div>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Avg Message Length</div>
                <div className="stat-value">
                  {stats.averageMessageLength ? Math.round(stats.averageMessageLength) : 0}
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Message Rate</div>
                <div className="stat-value">{stats.messageRate?.toFixed(1) || 0}/min</div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Total Reactions</div>
                <div className="stat-value">{stats.totalReactions || 0}</div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Pinned Messages</div>
                <div className="stat-value">
                  {stats.pinnedMessages?.length || 0}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sentiment Tab */}
        {activeTab === 'sentiment' && (
          <div className="stats-section">
            <h3>Sentiment Analysis</h3>

            <div className="sentiment-summary">
              <div className="sentiment-score">
                <div className="score-label">Overall Score</div>
                <div className="score-value">
                  {stats.averageSentimentScore?.toFixed(2) || 0}
                </div>
                <div className="score-range">(-1 to +1)</div>
              </div>

              <div className="sentiment-chart">
                <div className="chart-title">Sentiment Distribution</div>
                <div className="chart-bars">
                  {stats.sentimentDistribution && (
                    <>
                      <div className="chart-bar-group">
                        <div
                          className="chart-bar positive"
                          style={{
                            height: `${stats.sentimentDistribution.POSITIVE || 0}%`,
                          }}
                        />
                        <div className="chart-label">
                          Positive
                          <br />
                          {formatPercent(stats.sentimentDistribution.POSITIVE)}
                        </div>
                      </div>

                      <div className="chart-bar-group">
                        <div
                          className="chart-bar neutral"
                          style={{
                            height: `${stats.sentimentDistribution.NEUTRAL || 0}%`,
                          }}
                        />
                        <div className="chart-label">
                          Neutral
                          <br />
                          {formatPercent(stats.sentimentDistribution.NEUTRAL)}
                        </div>
                      </div>

                      <div className="chart-bar-group">
                        <div
                          className="chart-bar negative"
                          style={{
                            height: `${stats.sentimentDistribution.NEGATIVE || 0}%`,
                          }}
                        />
                        <div className="chart-label">
                          Negative
                          <br />
                          {formatPercent(stats.sentimentDistribution.NEGATIVE)}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="dominant-sentiment">
              <div className="label">Dominant Sentiment: </div>
              <div
                className="badge"
                style={{
                  backgroundColor: getSentimentColor(stats.dominantSentiment),
                }}
              >
                {stats.dominantSentiment || 'N/A'}
              </div>
            </div>
          </div>
        )}

        {/* Engagement Tab */}
        {activeTab === 'engagement' && (
          <div className="stats-section">
            <h3>Participant Engagement</h3>

            <div className="participant-list">
              {stats.participantStats && stats.participantStats.length > 0 ? (
                stats.participantStats.map((participant, idx) => (
                  <div key={idx} className="participant-stat">
                    <div className="participant-name">{participant.user}</div>

                    <div className="participant-metrics">
                      <div className="metric">
                        <span className="metric-label">Messages:</span>
                        <span className="metric-value">{participant.messageCount}</span>
                      </div>

                      <div className="metric">
                        <span className="metric-label">Avg Length:</span>
                        <span className="metric-value">{participant.averageLength}</span>
                      </div>

                      <div className="metric">
                        <span className="metric-label">Reactions:</span>
                        <span className="metric-value">
                          {participant.reactionsReceived}
                        </span>
                      </div>

                      <div className="metric">
                        <span className="metric-label">Sentiment:</span>
                        <span
                          className="metric-value sentiment-badge"
                          style={{
                            backgroundColor: getSentimentColor(
                              participant.sentiment > 0
                                ? 'POSITIVE'
                                : participant.sentiment < 0
                                ? 'NEGATIVE'
                                : 'NEUTRAL'
                            ),
                          }}
                        >
                          {participant.sentiment.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="engagement-bar">
                      <div
                        className="engagement-fill"
                        style={{
                          width: `${
                            (participant.messageCount /
                              (stats.messageCount || 1)) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">No participant data yet</div>
              )}
            </div>
          </div>
        )}

        {/* Reactions Tab */}
        {activeTab === 'reactions' && (
          <div className="stats-section">
            <h3>Popular Reactions</h3>

            <div className="reactions-list">
              {stats.topReactions && Object.keys(stats.topReactions).length > 0 ? (
                Object.entries(stats.topReactions)
                  .sort((a, b) => b[1] - a[1])
                  .map(([emoji, count]) => (
                    <div key={emoji} className="reaction-stat">
                      <div className="reaction-emoji">{emoji}</div>
                      <div className="reaction-label">Reactions</div>
                      <div className="reaction-count">{count}</div>
                    </div>
                  ))
              ) : (
                <div className="no-data">No reactions yet</div>
              )}
            </div>

            {/* Pinned Messages */}
            {stats.pinnedMessages && stats.pinnedMessages.length > 0 && (
              <div className="pinned-section">
                <h4>📌 Pinned Messages</h4>
                <div className="pinned-list">
                  {stats.pinnedMessages.map((msg) => (
                    <div key={msg.id} className="pinned-item">
                      <div className="pinned-author">{msg.author}</div>
                      <div className="pinned-message">{msg.message}</div>
                      <div className="pinned-reactions">
                        👍 {msg.reactions || 0}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
