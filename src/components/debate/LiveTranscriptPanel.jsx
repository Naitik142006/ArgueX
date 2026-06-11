import { Mic, Loader2 } from'lucide-react';
import { motion, AnimatePresence } from'framer-motion';

export default function LiveTranscriptPanel({ isListening, transcript, interimTranscript, error,
 hasSupport }) {
 if (!hasSupport) {
 return (
 <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-sm">
 Your browser does not support Speech Recognition. Please use Chrome, Edge, or Safari.
 </div>
 );
 }

 if (error) {
 return (
 <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-sm flex items-center gap-2">
 <Mic className="w-4 h-4" />
 Microphone Error: {error ==='not-allowed' ?'Permission Denied' : error}
 </div>
 );
 }

 return (
 <AnimatePresence>
 {isListening && (
 <motion.div
 initial={{ opacity: 0, height: 0, y: 10 }}
 animate={{ opacity: 1, height:'auto', y: 0 }}
 exit={{ opacity: 0, height: 0, y: 10 }}
 className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-4 mb-4 overflow-hidden"
 >
 <div className="flex items-center gap-3 mb-2 text-brand-500">
 <div className="relative flex items-center justify-center w-6 h-6">
 <span className="absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75 animate-ping"></span>
 <Mic className="relative w-4 h-4" />
 </div>
 <span className="text-sm font-semibold tracking-wider uppercase">Listening...</span>
 </div>
 <div className="text-zinc-700 dark:text-zinc-300 min-h-[40px] text-sm md:text-base leading-relaxed">
 {transcript && <span>{transcript}</span>}
 <span className="text-zinc-400 dark:text-zinc-500 italic">
 {interimTranscript}
 <Loader2 className="inline-block w-3 h-3 ml-1 animate-spin" />
 </span>
 {!transcript && !interimTranscript && (
 <span className="text-zinc-400 dark:text-zinc-500">Speak now...</span>
 )}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 );
}
