import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Video, Mic, MicOff, VideoOff, Copy, Check, Users, BrainCircuit, Activity, ShieldAlert } from 'lucide-react';
import { useSocket } from '../hooks/useSocket.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useMediaStream } from '../hooks/useMediaStream.js';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.js';
import { VideoService } from '../services/videoService.js';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import RemoteVideoPlayer from '../components/debate/RemoteVideoPlayer.jsx';

export default function MultiplayerDebatePage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
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
  const { stream: localStream, toggleVideo, toggleAudio } = useMediaStream(true, true);

  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // Speech Recognition
  const handleFinalSpeech = useCallback((text) => {
    if (text && socket) {
      socket.emit('multiplayer-message', { roomId, text });
    }
  }, [socket, roomId]);

  const { startListening, stopListening, interimTranscript, hasSupport } = useSpeechRecognition({
    onFinalResult: handleFinalSpeech
  });

  // Start/Stop listening based on mic state
  useEffect(() => {
    if (!hasSupport) return;
    if (isAudioMuted) {
      stopListening();
    } else {
      startListening();
    }
  }, [isAudioMuted, hasSupport, startListening, stopListening]);

  // Set local video stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Handle remote streams
  const handleRemoteStream = useCallback((userId, stream) => {
    setOpponents(prev => ({
      ...prev,
      [userId]: { ...prev[userId], stream }
    }));
  }, []);

  // Socket & WebRTC Initialization
  useEffect(() => {
    if (!socket || !roomId || !user?.id) return;

    socket.emit('joinRoom', { roomId });

    const rtcService = new VideoService(socket, roomId, user.id);
    rtcService.initialize(localStream, handleRemoteStream);
    setVideoService(rtcService);

    const handleRoomState = async (data) => {
      const newOpponents = {};
      for (const u of data.usersInRoom) {
        if (u.userId !== user.id) {
          newOpponents[u.userId] = { _id: u.userId, username: u.userName, stream: null };
        }
      }
      setOpponents(prev => ({ ...prev, ...newOpponents }));
    };

    const handleUserJoined = async (data) => {
      if (data.userId !== user.id) {
        setOpponents(prev => ({
          ...prev,
          [data.userId]: { _id: data.userId, username: data.userName, stream: null }
        }));
        if (rtcService) {
          await rtcService.addPeer(data.userId, true);
        }
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
  }, [socket, roomId, localStream, user?.id, handleRemoteStream]);

  const copyInviteLink = () => {
    const url = `${window.location.origin}/multiplayer/${roomId}`;
    navigator.clipboard.writeText(url);
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

  const handleLeave = () => {
    navigate('/dashboard');
  };

  const handleConcludeAndJudge = async () => {
    try {
      setIsJudging(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/debates/group/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roomId }),
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
          <Badge variant="neon" className="bg-brand-500/20 text-brand-400 py-1 px-3 shadow-neon-blue">
             <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
                PVP ARENA
             </span>
          </Badge>
          <span className="font-mono text-zinc-400 text-sm font-semibold tracking-widest flex items-center gap-2 uppercase">
            <Users size={16} className="text-neon-violet" /> {totalParticipants} / 6 LINKED
          </span>
        </div>
        <div className="flex items-center gap-3">
          {totalParticipants < 6 && (
            <Button variant="surface" onClick={copyInviteLink} className="gap-2 hidden sm:flex font-mono text-xs uppercase tracking-widest">
              {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} className="text-brand-400" />}
              {copied ? 'SECURED' : 'COPY COMM-LINK'}
            </Button>
          )}
          <Button variant="danger" onClick={handleLeave} className="font-mono text-xs uppercase tracking-widest">Abort</Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative z-10">
        {/* Main Video Arena */}
        <div className={`flex-1 p-4 lg:p-6 gap-4 lg:gap-6 overflow-y-auto grid ${gridClass} auto-rows-fr`}>
          {/* Local User */}
          <div className="flex-1 rounded-3xl overflow-hidden relative glass-panel border-white/10 shadow-glass min-h-[300px] group">
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent z-10 pointer-events-none"></div>
            
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-[1.02]" />
            
            {isVideoMuted && (
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
               <span className="font-heading font-bold text-white text-lg drop-shadow-md">{user?.username}</span>
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

          {/* Placeholder if empty */}
          {opponentsArray.length === 0 && (
            <div className="flex-1 rounded-3xl overflow-hidden relative glass-panel border-white/10 shadow-glass flex flex-col items-center justify-center text-center px-4 min-h-[300px]">
              <div className="absolute inset-0 bg-brand-500/5 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-500/20 via-transparent to-transparent opacity-50"></div>
              <div className="w-20 h-20 rounded-3xl bg-surface border border-white/5 flex items-center justify-center text-brand-400 mb-6 shadow-neon-blue relative z-10 overflow-hidden">
                <div className="absolute inset-0 bg-brand-500/20 animate-pulse"></div>
                <Video size={36} className="relative z-10" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-white mb-3 uppercase tracking-wide relative z-10">Awaiting Challengers</h3>
              <p className="text-zinc-400 font-mono text-sm max-w-sm mb-8 leading-relaxed relative z-10">Share the comm-link to establish a peer-to-peer mesh connection.</p>
              
              <div className="flex items-center gap-2 bg-surface/80 backdrop-blur-md p-2 rounded-2xl border border-white/10 w-full max-w-md mx-auto z-20 shadow-glass">
                <div className="flex-1 overflow-hidden px-3">
                   <input type="text" readOnly value={`${window.location.origin}/multiplayer/${roomId}`} className="bg-transparent border-none text-brand-400 text-sm w-full outline-none font-mono focus:ring-0" onClick={(e) => e.target.select()} />
                </div>
                <Button onClick={copyInviteLink} variant={copied ? 'neon' : 'brand'} className="whitespace-nowrap px-6 py-3 h-auto text-xs font-mono uppercase tracking-widest gap-2 rounded-xl">
                  {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'SECURED' : 'COPY'}
                </Button>
              </div>
            </div>
          )}

          {/* Remote Users */}
          {opponentsArray.map(opp => (
            <RemoteVideoPlayer key={opp._id} opponent={opp} />
          ))}
        </div>

        {/* Right Sidebar: Transcript & Judge */}
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
                <div key={idx} className={`flex flex-col ${msg.userId === user?.id ? 'items-end' : 'items-start'} animate-fade-in`}>
                  <span className="text-[10px] font-mono font-semibold text-zinc-500 mb-1.5 uppercase tracking-widest">{msg.userId === user?.id ? 'YOU' : msg.sender}</span>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed max-w-[85%] shadow-sm ${msg.userId === user?.id ? 'bg-brand-600 text-white rounded-br-sm' : 'bg-surface border border-white/5 text-zinc-300 rounded-bl-sm'}`}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-5 border-t border-white/10 bg-surface/80 backdrop-blur-xl">
            {evaluation ? (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-brand-500/10 border border-brand-500/20 rounded-2xl p-4 shadow-neon-blue relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/20 blur-xl"></div>
                  <h4 className="font-heading font-bold text-brand-400 flex items-center gap-2 mb-2 relative z-10 uppercase tracking-wide">
                    <BrainCircuit size={18} /> Argus-V1 Verdict
                  </h4>
                  <p className="text-sm text-zinc-300 relative z-10 leading-relaxed">{evaluation.summary}</p>
                </div>
                <div className="space-y-3">
                  <h5 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest">Final Standings</h5>
                  {evaluation.rankings?.map((r) => (
                    <div key={r.userId} className="flex flex-col gap-2 bg-surface border border-white/5 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-heading font-bold text-white text-lg flex items-center gap-2">
                           <span className="text-zinc-500">#{r.rank}</span> {r.username}
                        </span>
                        <Badge variant="neon" className="bg-brand-500/20 text-brand-400 font-mono text-xs">Logic: {r.logicScore}/10</Badge>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">{r.feedback}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Button 
                variant="brand" 
                size="xl"
                className="w-full gap-3 shadow-neon-blue font-heading font-bold uppercase tracking-widest" 
                onClick={handleConcludeAndJudge}
                disabled={isJudging || chatMessages.length < 2}
              >
                {isJudging ? (
                  <span className="flex items-center gap-2">
                     <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                     Processing Verdict...
                  </span>
                ) : (
                  <>
                    <BrainCircuit size={20} />
                    Conclude Match
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

