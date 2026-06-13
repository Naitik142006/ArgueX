import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Mic, MicOff, VideoOff, Copy, Check, Users, BrainCircuit, Activity, ShieldAlert, LogIn, Swords, Loader2 } from 'lucide-react';
import { useSocket } from '../hooks/useSocket.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useMediaStream } from '../hooks/useMediaStream.js';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.js';
import { VideoService } from '../services/videoService.js';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import RemoteVideoPlayer from '../components/debate/RemoteVideoPlayer.jsx';

export default function MultiplayerDebatePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?._id || user?.id;
  
  // Room Flow States
  const [roomId, setRoomId] = useState(null);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [isLobby, setIsLobby] = useState(true);

  const [copied, setCopied] = useState(false);
  const [opponents, setOpponents] = useState({}); // { userId: { _id, username, stream } }
  const [videoService, setVideoService] = useState(null);
  
  // Chat Transcript State
  const [chatMessages, setChatMessages] = useState([]);
  const chatScrollRef = useRef(null);
  const [isJudging, setIsJudging] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  const localVideoRef = useRef(null);

  // Get socket connection
  const token = window.localStorage.getItem('token');
  const { socket, isConnected } = useSocket(token);

  // Local media stream
  const { stream: localStream, toggleVideo, toggleAudio, isLoading: isMediaLoading } = useMediaStream(true, true);

  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // Auto-Create Room on Mount
  useEffect(() => {
    const createRoom = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/pvp/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setRoomId(data.room.roomCode);
        }
      } catch (err) {
        console.error("Failed to create PvP room:", err);
      }
    };
    if (token) {
      createRoom();
    }
  }, [token]);

  // Handle Joining Existing Room
  const handleJoinRoom = async () => {
    if (!joinCodeInput.trim()) return;
    setIsJoining(true);
    setJoinError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/pvp/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ roomCode: joinCodeInput.trim() })
      });
      const data = await res.json();
      if (data.success) {
        // Leave current socket room if we were in one
        if (socket && roomId) {
          socket.emit('leaveRoom', { roomId });
        }
        // Transition to new room
        setRoomId(data.room.roomCode);
        setIsLobby(false);
      } else {
        setJoinError(data.message || 'Failed to join room');
      }
    } catch (err) {
      setJoinError('Network error joining room');
    } finally {
      setIsJoining(false);
    }
  };

  // Speech Recognition
  const handleFinalSpeech = useCallback((text) => {
    if (text && socket && !isLobby) {
      socket.emit('multiplayer-message', { roomId, text });
    }
  }, [socket, roomId, isLobby]);

  const { startListening, stopListening, interimTranscript, hasSupport } = useSpeechRecognition({
    onFinalResult: handleFinalSpeech
  });

  // Start/Stop listening based on mic state
  useEffect(() => {
    if (!hasSupport || isLobby) return;
    if (isAudioMuted) {
      stopListening();
    } else {
      startListening();
    }
  }, [isAudioMuted, hasSupport, isLobby, startListening, stopListening]);

  // Set local video stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, isLobby]);

  // Handle remote streams
  const handleRemoteStream = useCallback((userId, stream) => {
    setOpponents(prev => ({
      ...prev,
      [userId]: { ...prev[userId], stream }
    }));
  }, []);

  // Socket & WebRTC Initialization when roomId is available
  useEffect(() => {
    if (!socket || !roomId || !userId || isMediaLoading) return;

    socket.emit('joinRoom', { roomId });

    const rtcService = new VideoService(socket, roomId, userId);
    rtcService.initialize(localStream, handleRemoteStream);
    setVideoService(rtcService);

    const handleRoomState = async (data) => {
      const newOpponents = {};
      for (const u of data.usersInRoom) {
        if (u.userId !== userId) {
          newOpponents[u.userId] = { _id: u.userId, username: u.userName, stream: null };
        }
      }
      setOpponents(prev => ({ ...prev, ...newOpponents }));
      if (data.usersInRoom.length >= 2) {
        setIsLobby(false);
      }
    };

    const handleUserJoined = async (data) => {
      if (data.userId !== userId) {
        setOpponents(prev => ({
          ...prev,
          [data.userId]: { _id: data.userId, username: data.userName, stream: null }
        }));
        if (rtcService) {
          await rtcService.addPeer(data.userId, true);
        }
        setIsLobby(false); // Opponent joined, start debate
      }
    };

    const handleUserLeft = (data) => {
      if (rtcService) rtcService.removePeer(data.userId);
      setOpponents(prev => {
        const updated = { ...prev };
        delete updated[data.userId];
        return updated;
      });
    };

    const handleTranscriptUpdate = (msg) => {
      setChatMessages(prev => [...prev, msg]);
      setTimeout(() => {
        if (chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
      }, 100);
    };

    socket.on('roomState', handleRoomState);
    socket.on('userJoined', handleUserJoined);
    socket.on('userLeft', handleUserLeft);
    socket.on('multiplayer-transcript-update', handleTranscriptUpdate);

    return () => {
      socket.off('roomState', handleRoomState);
      socket.off('userJoined', handleUserJoined);
      socket.off('userLeft', handleUserLeft);
      socket.off('multiplayer-transcript-update', handleTranscriptUpdate);
      rtcService.destroy();
    };
  }, [socket, roomId, localStream, userId, handleRemoteStream, isMediaLoading]);

  const copyInviteLink = () => {
    if (!roomId) return;
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleVideo = () => {
    const enabled = toggleVideo();
    setIsVideoMuted(!enabled);
  };

  const handleToggleAudio = () => {
    const enabled = toggleAudio();
    setIsAudioMuted(!enabled);
  };

  const handleLeave = async () => {
    if (socket && roomId) {
      socket.emit('leaveRoom', { roomId });
    }
    try {
      await fetch(`${import.meta.env.VITE_API_URL || '/api'}/pvp/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ roomCode: roomId })
      });
    } catch (e) {}
    navigate('/dashboard');
  };

  const handleConcludeAndJudge = async () => {
    try {
      setIsJudging(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/debates/group/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roomId, chatMessages }),
      });
      const data = await res.json();
      if (res.ok) {
        setEvaluation(data);
      } else {
        alert(data.message || 'Evaluation failed');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to evaluate group debate.');
    } finally {
      setIsJudging(false);
    }
  };

  const opponentsArray = Object.values(opponents);
  const totalParticipants = 1 + opponentsArray.length;
  const renderedElementsCount = opponentsArray.length === 0 ? 2 : totalParticipants;

  let gridClass = "grid-cols-1 md:grid-cols-2";
  if (renderedElementsCount <= 2) gridClass = "grid-cols-1 md:grid-cols-2";
  else if (renderedElementsCount <= 4) gridClass = "grid-cols-1 sm:grid-cols-2";
  else gridClass = "grid-cols-2 md:grid-cols-3";

  return (
    <div className="h-[calc(100vh-80px)] bg-background flex flex-col relative overflow-hidden animate-fade-in">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-grid-arena opacity-20 pointer-events-none z-0"></div>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-background/80 backdrop-blur-xl border-b border-white/10 shrink-0 relative z-10">
        <div className="flex items-center gap-4 mb-4 sm:mb-0">
          <Badge variant="neon" className="bg-brand-500/20 text-brand-400 py-1 px-3">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
              PVP ARENA
            </span>
          </Badge>
          {!isLobby && (
            <span className="font-mono text-zinc-400 text-sm font-semibold tracking-widest flex items-center gap-2 uppercase">
              <Users size={16} className="text-neon-violet" /> {totalParticipants} LINKED
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button variant="danger" onClick={handleLeave} className="font-mono text-xs uppercase tracking-widest">Abort</Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative z-10">
        
        {/* Main Area */}
        <div className={`flex-1 p-4 lg:p-6 gap-4 lg:gap-6 overflow-y-auto grid ${isLobby ? 'grid-cols-1' : gridClass} auto-rows-fr`}>
          
          {isLobby ? (
            <div className="flex flex-col items-center justify-center h-full w-full max-w-2xl mx-auto space-y-8 animate-fade-in">
              {/* Host Code Area */}
              <div className="w-full glass-panel border border-white/10 p-8 rounded-3xl text-center shadow-glass relative overflow-hidden group">
                <div className="absolute inset-0 bg-brand-500/5 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-500/20 via-transparent to-transparent opacity-50"></div>
                <div className="relative z-10">
                  <h2 className="text-2xl font-heading font-bold text-white mb-2 uppercase tracking-wide">Waiting for Opponent...</h2>
                  <p className="text-zinc-400 font-mono text-sm mb-6">Share this code with your challenger</p>
                  
                  {roomId ? (
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <div className="bg-black/50 border border-brand-500/30 px-8 py-4 rounded-2xl font-mono text-4xl text-neon-cyan tracking-widest shadow-[0_0_15px_rgba(0,255,255,0.2)]">
                        {roomId}
                      </div>
                      <Button onClick={copyInviteLink} variant={copied ? 'neon' : 'brand'} className="h-[72px] px-6 rounded-2xl gap-2 font-mono uppercase tracking-widest">
                        {copied ? <Check size={24} /> : <Copy size={24} />}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-center my-8">
                      <Loader2 className="animate-spin text-brand-400" size={32} />
                    </div>
                  )}
                  <p className="text-xs text-zinc-500 font-mono uppercase">Room auto-closes after 1 hour</p>
                </div>
              </div>

              {/* Or Join Area */}
              <div className="w-full glass-panel border border-white/10 p-6 rounded-3xl relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-sm font-heading font-bold text-white mb-4 uppercase tracking-widest flex items-center gap-2">
                    <LogIn size={16} className="text-neon-violet" /> Join Existing Room
                  </h3>
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      placeholder="ENTER ROOM CODE" 
                      value={joinCodeInput}
                      onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                      className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-neon-violet/50 transition-colors uppercase"
                      maxLength={8}
                    />
                    <Button variant="neon" className="px-6 gap-2" onClick={handleJoinRoom} disabled={isJoining || !joinCodeInput.trim()}>
                      {isJoining ? <Loader2 className="animate-spin" size={18} /> : <Swords size={18} />} Join
                    </Button>
                  </div>
                  {joinError && <p className="text-rose-400 text-xs font-mono mt-3">{joinError}</p>}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Local User */}
              <div className="flex-1 rounded-3xl overflow-hidden relative glass-panel border-white/10 shadow-glass min-h-[300px] group">
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent z-10 pointer-events-none"></div>
                <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-[1.02]" />
                {(!localStream || isVideoMuted) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-surface z-10">
                    <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl font-heading font-bold text-zinc-600 shadow-glass">
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                  </div>
                )}
                <div className="absolute top-4 left-4 z-20 flex gap-2">
                  <Badge className="bg-brand-500/20 text-brand-400 border border-brand-500/30 backdrop-blur-md">YOU</Badge>
                  {isAudioMuted && <Badge className="bg-rose-500/20 text-rose-400 border border-rose-500/30 backdrop-blur-md"><MicOff size={12} /></Badge>}
                </div>

                <div className="absolute bottom-4 left-4 z-20 flex flex-col">
                  <span className="font-heading font-bold text-white text-lg">{user?.username}</span>
                  <span className="font-mono text-[10px] text-brand-400 uppercase tracking-widest">Broadcasting</span>
                </div>
                {/* Controls */}
                <div className="absolute bottom-4 right-4 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button onClick={handleToggleAudio} className={`p-3 rounded-xl backdrop-blur-xl transition-all duration-300 shadow-glass border ${isAudioMuted ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 hover:bg-rose-500/30' : 'bg-white/10 text-white border-white/10 hover:bg-white/20'}`}>
                    {isAudioMuted ? <MicOff size={20} /> : <Mic size={20} />}
                  </button>
                  <button onClick={handleToggleVideo} className={`p-3 rounded-xl backdrop-blur-xl transition-all duration-300 shadow-glass border ${isVideoMuted ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 hover:bg-rose-500/30' : 'bg-white/10 text-white border-white/10 hover:bg-white/20'}`}>
                    {isVideoMuted ? <VideoOff size={20} /> : <Video size={20} />}
                  </button>
                </div>
                {/* Interim Transcript preview */}
                {interimTranscript && !isAudioMuted && (
                  <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-xl text-brand-400 font-mono text-xs z-20 max-w-[80%] text-center shadow-glass animate-fade-in">
                    {interimTranscript}
                  </div>
                )}
              </div>

              {/* Remote Users */}
              {opponentsArray.map(opp => (
                <RemoteVideoPlayer key={opp._id} opponent={opp} />
              ))}
            </>
          )}
        </div>

        {/* Right Sidebar: Transcript & Judge */}
        {!isLobby && (
          <div className="w-full lg:w-96 glass-panel border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col shrink-0 relative z-10">
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-surface/50 backdrop-blur-md">
              <h3 className="font-heading font-bold text-white flex items-center gap-3 uppercase tracking-wide">
                <Activity size={18} className="text-neon-cyan" />
                Live Telemetry
              </h3>
              {!hasSupport && <Badge className="bg-rose-500/20 text-rose-400 border border-rose-500/30 py-0"><ShieldAlert size={12} className="mr-1"/> STT Offline</Badge>}
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-hide smooth-scroll" ref={chatScrollRef}>
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <Mic size={32} className="text-zinc-600 mb-4" />
                  <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">Voice feed inactive.</p>
                  <p className="text-zinc-600 text-xs mt-2">Speech will be transcribed here.</p>
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex flex-col ${msg.userId === userId ? 'items-end' : 'items-start'} animate-fade-in`}>
                    <span className="text-[10px] font-mono font-semibold text-zinc-500 mb-1.5 uppercase tracking-widest">{msg.userId === userId ? 'YOU' : msg.sender}</span>
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed max-w-[85%] shadow-sm ${msg.userId === userId ? 'bg-brand-600 text-white rounded-br-sm' : 'bg-surface border border-white/5 text-zinc-300 rounded-bl-sm'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-5 border-t border-white/10 bg-surface/80 backdrop-blur-xl">
              <Button variant={evaluation ? "surface" : "brand"} size="xl" 
                className="w-full gap-3 font-heading font-bold uppercase tracking-widest" 
                onClick={handleConcludeAndJudge}
                disabled={isJudging || chatMessages.length < 2 || evaluation}
              >
                {isJudging ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                    Processing Verdict...
                  </span>
                ) : evaluation ? (
                  <>
                    <BrainCircuit size={20} />
                    Match Concluded
                  </>
                ) : (
                  <>
                    <BrainCircuit size={20} />
                    Conclude Match
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Centered Evaluation Modal */}
      {evaluation && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in p-4">
          <div className="w-full max-w-2xl bg-surface/90 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto overflow-x-hidden scrollbar-hide">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 blur-[100px] pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h2 className="text-2xl font-heading font-bold text-white flex items-center gap-3 uppercase tracking-widest">
                <BrainCircuit className="text-brand-400" size={28} />
                Match Concluded
              </h2>
              <Button variant="ghost" onClick={() => setEvaluation(null)} className="text-zinc-400 hover:text-white">
                Close
              </Button>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="bg-brand-500/10 border border-brand-500/20 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/20 blur-2xl"></div>
                <h4 className="font-heading font-bold text-brand-400 flex items-center gap-2 mb-3 relative z-10 uppercase tracking-wide text-lg">
                  <BrainCircuit size={20} /> Argus-V1 Verdict
                </h4>
                <p className="text-zinc-200 relative z-10 leading-relaxed text-base">{evaluation.summary}</p>
              </div>

              <div className="space-y-4">
                <h5 className="text-sm font-mono font-bold text-zinc-500 uppercase tracking-widest">Final Standings</h5>
                <div className="grid gap-4">
                  {evaluation.rankings?.map((r) => (
                    <div key={r.userId} className="flex flex-col gap-3 bg-black/40 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-heading font-bold text-white text-xl flex items-center gap-3">
                          <span className={r.rank === 1 ? "text-amber-400" : "text-zinc-500"}>#{r.rank}</span> 
                          {r.username}
                        </span>
                        <Badge variant="neon" className="bg-brand-500/20 text-brand-400 font-mono text-sm py-1.5 px-3">
                          Logic: {r.logicScore}/10
                        </Badge>
                      </div>
                      <p className="text-sm text-zinc-400 leading-relaxed">{r.feedback}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
