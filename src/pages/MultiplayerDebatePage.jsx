import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Video, Mic, MicOff, VideoOff, Copy, Check, Users, BrainCircuit } from 'lucide-react';
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
    <div className="h-[calc(100vh-73px)] bg-zinc-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-zinc-900 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-3">
          <Badge className="bg-brand-500/20 text-brand-400">Live Match</Badge>
          <span className="text-zinc-400 text-sm font-medium flex items-center gap-1">
            <Users size={14}/> {totalParticipants} / 6
          </span>
        </div>
        <div className="flex items-center gap-2">
          {totalParticipants < 6 && (
            <Button variant="outline" onClick={copyInviteLink} className="gap-2 hidden sm:flex">
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Invite Link'}
            </Button>
          )}
          <Button variant="danger" onClick={handleLeave}>Leave</Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Video Arena */}
        <div className={`flex-1 p-4 gap-4 overflow-y-auto grid ${gridClass} auto-rows-fr`}>
          {/* Local User */}
          <div className="flex-1 rounded-3xl overflow-hidden relative bg-zinc-900 border border-zinc-800 shadow-2xl min-h-[300px]">
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            {isVideoMuted && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-10">
                <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center text-3xl font-bold text-zinc-500">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl text-white font-medium flex items-center gap-2 z-20">
              {user?.username} <Badge className="bg-zinc-800 text-zinc-300">You</Badge>
            </div>
            {/* Controls */}
            <div className="absolute bottom-4 right-4 flex gap-2 z-20">
              <button onClick={handleToggleAudio} className={`p-3 rounded-xl backdrop-blur-md transition-colors ${isAudioMuted ? 'bg-rose-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}>
                {isAudioMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <button onClick={handleToggleVideo} className={`p-3 rounded-xl backdrop-blur-md transition-colors ${isVideoMuted ? 'bg-rose-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}>
                {isVideoMuted ? <VideoOff size={20} /> : <Video size={20} />}
              </button>
            </div>
            
            {/* Interim Transcript preview */}
            {interimTranscript && !isAudioMuted && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl text-white text-sm font-medium z-20 max-w-[80%] text-center line-clamp-2">
                {interimTranscript}
              </div>
            )}
          </div>

          {/* Placeholder if empty */}
          {opponentsArray.length === 0 && (
            <div className="flex-1 rounded-3xl overflow-hidden relative bg-zinc-900 border border-zinc-800 shadow-2xl flex flex-col items-center justify-center text-center px-4 min-h-[300px]">
              <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-brand-500 mb-4 animate-pulse">
                <Video size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Waiting for opponents...</h3>
              <p className="text-zinc-400 max-w-sm mb-6">Share this invite link with up to 5 friends to start debating.</p>
              <div className="flex items-center gap-2 bg-zinc-950/50 p-2 rounded-xl border border-zinc-800 w-full max-w-md mx-auto z-20">
                <input type="text" readOnly value={`${window.location.origin}/multiplayer/${roomId}`} className="bg-transparent border-none text-zinc-300 text-sm flex-1 outline-none px-2 font-mono" onClick={(e) => e.target.select()} />
                <Button onClick={copyInviteLink} variant="brand" className="whitespace-nowrap px-4 py-2 h-auto text-sm gap-2">
                  {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied' : 'Copy'}
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
        <div className="w-80 bg-zinc-900 border-l border-zinc-800 flex flex-col shrink-0">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Mic size={18} className="text-brand-500" />
              Live Transcript
            </h3>
            {!hasSupport && <Badge className="bg-rose-500/20 text-rose-400">Not Supported</Badge>}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={chatScrollRef}>
            {chatMessages.length === 0 ? (
              <div className="text-center text-zinc-500 text-sm mt-10">
                Start speaking to populate the transcript...
              </div>
            ) : (
              chatMessages.map(msg => (
                <div key={msg._id} className={`flex flex-col ${msg.userId === user?.id ? 'items-end' : 'items-start'}`}>
                  <span className="text-xs text-zinc-500 mb-1">{msg.userId === user?.id ? 'You' : msg.sender}</span>
                  <div className={`px-3 py-2 rounded-2xl text-sm ${msg.userId === user?.id ? 'bg-brand-600 text-white rounded-br-none' : 'bg-zinc-800 text-zinc-300 rounded-bl-none'}`}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-zinc-800 bg-zinc-950/50">
            {evaluation ? (
              <div className="space-y-4">
                <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-3">
                  <h4 className="font-bold text-brand-400 flex items-center gap-2 mb-2">
                    <BrainCircuit size={16} /> AI Verdict
                  </h4>
                  <p className="text-sm text-zinc-300">{evaluation.summary}</p>
                </div>
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-zinc-500 uppercase">Rankings</h5>
                  {evaluation.rankings?.map((r) => (
                    <div key={r.userId} className="flex flex-col gap-1 bg-zinc-800 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">#{r.rank} {r.username}</span>
                        <Badge className="bg-brand-500/20 text-brand-400">Logic: {r.logicScore}/10</Badge>
                      </div>
                      <p className="text-xs text-zinc-400">{r.feedback}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Button 
                variant="brand" 
                className="w-full gap-2" 
                onClick={handleConcludeAndJudge}
                disabled={isJudging || chatMessages.length < 2}
              >
                {isJudging ? (
                  <span className="animate-pulse">Judging Debate...</span>
                ) : (
                  <>
                    <BrainCircuit size={18} />
                    Conclude & Judge
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

