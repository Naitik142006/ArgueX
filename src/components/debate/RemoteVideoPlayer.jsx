import React, { useEffect, useRef } from 'react';
import Badge from '../ui/Badge.jsx';

export default function RemoteVideoPlayer({ opponent }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && opponent.stream) {
      videoRef.current.srcObject = opponent.stream;
    }
  }, [opponent.stream]);

  return (
    <div className="flex-1 rounded-3xl overflow-hidden relative bg-zinc-900 border border-zinc-800 shadow-2xl min-h-[300px]">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl text-white font-medium flex items-center gap-2 z-20">
        {opponent.username} <Badge className="bg-rose-500/20 text-rose-400">Opponent</Badge>
      </div>
    </div>
  );
}
