import React, { useEffect, useRef } from'react';
import Badge from'../ui/Badge.jsx';

export default function RemoteVideoPlayer({ opponent }) {
 const videoRef = useRef(null);

 useEffect(() => {
 if (videoRef.current && opponent.stream) {
 videoRef.current.srcObject = opponent.stream;
 }
 }, [opponent.stream]);

 return (
 <div className="flex-1 rounded-3xl overflow-hidden relative bg-zinc-900 border border-zinc-800 shadow-2xl min-h-[300px]">
 <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
 
 {!opponent.stream && (
   <div className="absolute inset-0 flex items-center justify-center bg-surface z-10">
     <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl font-heading font-bold text-zinc-600 shadow-glass">
       {opponent.username?.charAt(0).toUpperCase() || '?'}
     </div>
   </div>
 )}
 <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl text-white font-medium flex items-center gap-2 z-20">
 {opponent.username} <Badge className="bg-rose-500/20 text-rose-400">Opponent</Badge>
 </div>
 </div>
 );
}
