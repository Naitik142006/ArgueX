import { useEffect, useState, useRef } from'react';
import { useParams } from'react-router-dom';
import { Swords, Zap, Mic, MicOff, Activity, ShieldAlert, Target, BrainCircuit } from'lucide-react';
import { createDebateRequest, addDebateMessageRequest, requestAIReply } from'../services/debateService.js';
import { debateAPI, aiAPI } from'../services/api.js';
import MessageItem from'../components/MessageItem.jsx';
import DebateStatistics from'../components/DebateStatistics.jsx';
import MessageThread from'../components/MessageThread.jsx';
import LiveTranscriptPanel from'../components/debate/LiveTranscriptPanel.jsx';
import ScorecardModal from'../components/debate/ScorecardModal.jsx';
import Button from'../components/ui/Button.jsx';
import Badge from'../components/ui/Badge.jsx';
import { useSocket } from'../hooks/useSocket.js';
import { useAuth } from'../context/AuthContext.jsx';
import { useSpeechRecognition } from'../hooks/useSpeechRecognition.js';

/**
 * Normalize a debate-API message into the shape MessageItem expects.
 */
function normalizeMessage(raw, index) {
 return {
 _id: raw._id || raw.id || String(index + 1),
 userName: raw.sender || raw.userName ||'Unknown',
 message: raw.text || raw.message ||'',
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
 const [analysis, setAnalysis] = useState(null);
 const [isAnalyzing, setIsAnalyzing] = useState(false);
 const [isSending, setIsSending] = useState(false);
 const messagesEndRef = useRef(null);

 const scrollToBottom = () => {
   setTimeout(() => {
     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
   }, 100);
 };

 useEffect(() => {
   scrollToBottom();
 }, [messages, isAITyping]);

 const { urlDebateId } = useParams();
 const { user: currentUser } = useAuth();
 const {
 isListening,
 transcript,
 interimTranscript,
 startListening,
 stopListening,
 resetTranscript,
 error: speechError,
 hasSupport
 } = useSpeechRecognition();

 const prevListening = useRef(isListening);
 useEffect(() => {
 if (prevListening.current && !isListening && transcript) {
 setDraft(prev => prev + (prev ?'' :'') + transcript.trim());
 resetTranscript();
 }
 prevListening.current = isListening;
 }, [isListening, transcript, resetTranscript]);

 const token = window.localStorage.getItem('token');
 const { socket, isConnected, isReconnecting } = useSocket(token);

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
 setDebateId(null);
 setTopic('AI in education');
 setMessages([]);
 }
 }, [urlDebateId]);

 useEffect(() => {
 if (socket && debateId) {
 socket.emit('joinRoom', { roomId: debateId });
 }
 }, [socket, debateId]);

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
 reactions.set(reaction, [...users, { _id:'You', username:'You' }]);
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
 (u) => u._id !=='You'
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
 setIsSending(true);

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

 setIsAITyping(true);
 try {
 const aiResponse = await requestAIReply(currentDebateId);
 setMessages(aiResponse.messages.map((m, i) => normalizeMessage(m, i)));
 setStatus('AI replied.');
 } catch (aiErr) {
 setError('AI failed to reply:' + aiErr.message);
 } finally {
 setIsAITyping(false);
 }
 } catch (err) {
 setError(err.message);
 setStatus('');
 } finally {
 setIsSending(false);
 }
 };

 const handleConclude = async () => {
 if (!debateId) return;
 try {
 setIsAnalyzing(true);
 setError('');
 const data = await aiAPI.analyze(debateId);
 setAnalysis(data.analysis);
 } catch (err) {
 setError('Failed to analyze debate:' + err.message);
 } finally {
 setIsAnalyzing(false);
 }
 };

 const handleAddReaction = (messageId, emoji) => {
 if (socket) socket.emit('addReaction', { roomId: debateId, messageId, reaction: emoji });
 };

 const handleRemoveReaction = (messageId, emoji) => {
 if (socket) socket.emit('removeReaction', { roomId: debateId, messageId, reaction: emoji });
 };

 const handleEdit = (messageId, newText) => {
 if (socket) socket.emit('editMessage', { roomId: debateId, messageId, newMessage: newText });
 };

 const handleDelete = (messageId) => {
 if (socket) socket.emit('deleteMessage', { roomId: debateId, messageId });
 };

 const handlePin = (messageId) => {
 if (socket) socket.emit('pinMessage', { roomId: debateId, messageId });
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
 <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col h-[calc(100vh-80px)] animate-fade-in relative">
 {/* Ambient background for the arena */}
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-500/5 rounded-full blur-[150px] pointer-events-none -z-10"></div>
 <div className="mb-6 z-10">
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
 <div className="flex items-start gap-4">
 <div className="w-14 h-14 bg-surface border border-brand-500/30 rounded-2xl flex items-center justify-center shrink-0 relative overflow-hidden">
 <div className="absolute inset-0 bg-brand-500/10 animate-pulse"></div>
 <Swords size={28} className="text-brand-400 relative z-10" />
 </div>
 <div>
 <div className="flex items-center gap-3 mb-1">
 <h1 className="text-3xl font-heading font-bold text-white tracking-tight uppercase">
 Training <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-blue-200">Arena</span>
 </h1>
 {isConnected ? (
 <Badge variant="brand" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 py-0 text-[10px]">
 <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> SECURE LINK</span>
 </Badge>
 ) : isReconnecting ? (
 <Badge variant="brand" className="bg-amber-500/10 text-amber-400 border-amber-500/20 py-0 text-[10px]">
 <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span> RECONNECTING...</span>
 </Badge>
 ) : (
 <Badge variant="outline" className="text-zinc-500 border-zinc-700 py-0 text-[10px]">OFFLINE</Badge>
 )}
 </div>
 <p className="text-sm font-mono text-zinc-400 flex items-center gap-2">
 OPPONENT: <span className="text-neon-violet font-semibold">ARGUS-V1 (AI)</span>
 {debateId && <span className="text-zinc-600">| ID: {debateId.substring(0,8)}</span>}
 </p>
 </div>
 </div>

 <div className="flex items-center gap-3">
 <Button
 variant={showStats ?'neon' :'surface'}
 onClick={() => setShowStats((s) => !s)}
 className="font-mono text-xs uppercase tracking-widest"
 >
 <Activity size={14} className="mr-2" />
 {showStats ?'Hide Telemetry' :'Telemetry'}
 </Button>
 {debateId && (
 <Button
 variant="brand"
 onClick={handleConclude}
 disabled={isAnalyzing || messages.length < 2}
 className="font-mono text-xs uppercase tracking-widest"
 >
 <ShieldAlert size={14} className="mr-2" />
 {isAnalyzing ?'Analyzing...' :'Conclude Match'}
 </Button>
 )}
 </div>
 </div>

 <div className="glass-panel p-2 flex items-center gap-3 rounded-2xl relative z-10">
 <div className="pl-4">
 <Target size={18} className="text-brand-400" />
 </div>
 <input
 value={topic}
 onChange={(e) => setTopic(e.target.value)}
 disabled={!!debateId}
 placeholder="Initialize combat scenario (e.g. Universal Basic Income)"
 className="flex-1 bg-transparent border-none text-white font-mono placeholder-zinc-500 focus:outline-none focus:ring-0 disabled:opacity-50 py-2"
 />
 </div>
 </div>

 {error && (
 <div className="mb-4 p-4 rounded-xl glass-panel border-rose-500/30 bg-rose-500/10 text-rose-400 text-sm font-mono flex items-center gap-3">
 <ShieldAlert size={18} />
 {error}
 </div>
 )}

 {showStats && debateId && (
 <div className="mb-6 animate-fade-in">
 <DebateStatistics
 roomId={debateId}
 socket={socket}
 currentUser={currentUser}
 apiPath="/api/debates"
 />
 </div>
 )}

 {/* Chat Area */}
 <div className="flex-1 glass-panel border-white/10 rounded-3xl flex flex-col overflow-hidden relative z-10 shadow-glass">
 <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 smooth-scroll scrollbar-hide">
 {messages.length === 0 ? (
 <div className="h-full flex items-center justify-center">
 <div className="text-center max-w-md">
 <div className="w-20 h-20 mx-auto bg-surface border border-white/5 rounded-3xl flex items-center justify-center mb-6 shadow-glass relative group">
 <div className="absolute inset-0 bg-brand-500/20 rounded-3xl blur-xl group-hover:bg-brand-500/30 transition-colors"></div>
 <Swords size={36} className="text-brand-400 relative z-10" />
 </div>
 <h3 className="text-xl font-heading font-bold text-white mb-3 uppercase tracking-wide">Awaiting Initialization</h3>
 <p className="text-zinc-400 font-mono text-sm leading-relaxed">Set your scenario parameters above and construct your opening argument. Argus-V1 is standing by.</p>
 </div>
 </div>
 ) : (
 messages.map((message) => (
 <MessageItem
 key={message._id}
 message={message}
 currentUser={currentUser}
 isOwn={message.userName === currentUser?.username || message.userName === currentUser?.name || message.userName ==='User' || message.userName ==='Unknown' || message.userName ==='You'}
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
 <div className="flex gap-4 animate-fade-in">
 <div className="w-10 h-10 rounded-2xl bg-surface border border-neon-violet/30 flex items-center justify-center shrink-0 relative overflow-hidden">
 <div className="absolute inset-0 bg-neon-violet/10 animate-pulse"></div>
 <BrainCircuit size={20} className="text-neon-violet relative z-10" />
 </div>
 <div className="bg-surface border border-white/5 rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-2 shadow-glass">
 <div className="w-1.5 h-1.5 rounded-full bg-neon-violet animate-bounce-1" />
 <div className="w-1.5 h-1.5 rounded-full bg-neon-violet animate-bounce-2" />
 <div className="w-1.5 h-1.5 rounded-full bg-neon-violet animate-bounce-3" />
 <span className="ml-2 font-mono text-xs text-zinc-500 uppercase tracking-widest">Processing</span>
 </div>
 </div>
 )}
 <div ref={messagesEndRef} className="h-4" />
 </div>

 {/* Live Transcript Panel */}
 <div className="px-4 bg-background/50 border-t border-white/5">
 <LiveTranscriptPanel
 isListening={isListening}
 transcript={transcript}
 interimTranscript={interimTranscript}
 error={speechError}
 hasSupport={hasSupport}
 />
 </div>

 {/* Input Area */}
 <div className="p-4 sm:p-5 bg-background/80 backdrop-blur-xl border-t border-white/5">
 <div className="flex gap-3 relative">
 <textarea
 value={draft}
 onChange={(e) => setDraft(e.target.value)}
 onKeyDown={(e) => {
 if (e.key ==='Enter' && !e.shiftKey) {
 e.preventDefault();
 handleSend();
 }
 }}
 placeholder="Construct your argument..."
 className="flex-1 max-h-40 min-h-[56px] bg-surface border border-white/10 rounded-2xl px-5 py-4 text-sm font-medium text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500/50 focus:bg-white/5 resize-none smooth-scroll transition-all shadow-glass"
 rows={1}
 />
 {hasSupport && (
 <Button
 variant={isListening ?'danger' :'surface'}
 onClick={isListening ? stopListening : startListening}
 className={`h-[56px] w-[56px] shrink-0 p-0 flex items-center justify-center rounded-2xl transition-all ${isListening ?'animate-pulse' :''}`}
 title={isListening ?"Stop STT" :"Start STT"}
 >
 {isListening ? <MicOff size={22} className="text-rose-400" /> : <Mic size={22} className="text-zinc-400" />}
 </Button>
 )}
 <Button
 onClick={handleSend}
 disabled={isAITyping || isSending || (!draft.trim() && !transcript)}
 variant="brand"
 className="h-[56px] px-8 shrink-0 rounded-2xl font-heading font-bold tracking-wide uppercase"
 >
 Execute
 </Button>
 </div>
 <p className="text-[10px] font-mono text-zinc-500 mt-3 text-center uppercase tracking-widest">
 Argus-V1 is an AI. Verify factual claims. [ENTER] to execute, [SHIFT+ENTER] for line break.
 </p>
 </div>
 </div>

 {threadMessage && (
 <MessageThread
 message={threadMessage}
 roomId={debateId}
 currentUser={{ id:'You', username:'You' }}
 onClose={() => setThreadMessage(null)}
 onSendReply={handleSendReply}
 onAddReaction={handleAddReaction}
 />
 )}

 <ScorecardModal isOpen={!!analysis} analysis={analysis} onClose={() => setAnalysis(null)} />
 </div>
 );
}
export default DebatePage;
