import'../styles/ParticipantList.css';

/**
 * ParticipantList Component
 * * Shows all participants in the debate room
 * Displays online status
 * Shows when participants join/leave
 */
export default function ParticipantList({ participants,
 currentUser,
 maxParticipants = 2
}) {
 /**
 * Get status color
 */
 const getStatusColor = (status) => {
 switch (status) {
 case'active':
 return'status-active';
 case'inactive':
 return'status-inactive';
 case'left':
 return'status-left';
 default:
 return'status-unknown';
 }
 };

 /**
 * Get status icon
 */
 const getStatusIcon = (status) => {
 switch (status) {
 case'active':
 return'🟢';
 case'inactive':
 return'🟡';
 case'left':
 return'⚫';
 default:
 return'❓';
 }
 };

 /**
 * Format join time
 */
 const formatJoinTime = (timestamp) => {
 const date = new Date(timestamp);
 return date.toLocaleTimeString('en-US', {
 hour:'2-digit',
 minute:'2-digit',
 });
 };

 return (
 <div className="participant-list">
 {/* Header */}
 <div className="participant-header">
 <h3>👥 Participants</h3>
 <span className="participant-count">
 {participants.filter(p => p.status ==='active').length}/{maxParticipants}
 </span>
 </div>

 {/* Participants */}
 <div className="participants-container">
 {participants.length === 0 ? (
 <div className="empty-participants">
 <p>Waiting for participants...</p>
 </div>
 ) : (
 <ul className="participants-list">
 {participants.map((participant, idx) => (
 <li key={idx} className={`participant-item ${getStatusColor(participant.status)}`}>
 <div className="participant-info">
 <span className="participant-status">
 {getStatusIcon(participant.status)}
 </span>
 <div className="participant-details">
 <div className="participant-name">
 {participant.user.username}
 {currentUser?.id === participant.user._id && (
 <span className="you-badge">YOU</span>
 )}
 </div>
 <div className="participant-meta">
 Joined {formatJoinTime(participant.joinedAt)}
 </div>
 </div>
 </div>
 {participant.status ==='left' && (
 <div className="participant-left-time">
 Left {participant.leftAt && formatJoinTime(participant.leftAt)}
 </div>
 )}
 </li>
 ))}
 </ul>
 )}
 </div>

 {/* Room info */}
 <div className="room-stats">
 <div className="stat">
 <span className="stat-label">Active:</span>
 <span className="stat-value">
 {participants.filter(p => p.status ==='active').length}
 </span>
 </div>
 <div className="stat">
 <span className="stat-label">Capacity:</span>
 <span className="stat-value">
 {participants.filter(p => p.status ==='active').length}/{maxParticipants}
 </span>
 </div>
 </div>
 </div>
 );
}
