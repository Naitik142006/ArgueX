import { useState, useEffect, useCallback, useRef } from'react';

/**
 * Custom hook for Web Speech API (Speech-to-Text)
 * Handles continuous listening, push-to-talk, and browser compatibility.
 */
export function useSpeechRecognition({ onFinalResult } = {}) {
 const [isListening, setIsListening] = useState(false);
 const [transcript, setTranscript] = useState('');
 const [interimTranscript, setInterimTranscript] = useState('');
 const [error, setError] = useState(null);
 const [hasSupport, setHasSupport] = useState(true);

 const recognitionRef = useRef(null);

 const onFinalResultRef = useRef(onFinalResult);
 useEffect(() => {
   onFinalResultRef.current = onFinalResult;
 }, [onFinalResult]);

 useEffect(() => {
 // Check for browser support
 const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
 if (!SpeechRecognition) {
 setHasSupport(false);
 return;
 }

 const recognition = new SpeechRecognition();
 recognition.continuous = true;
 recognition.interimResults = true; // Show results while speaking
 recognition.lang ='en-US';

 recognition.onresult = (event) => {
 let finalStr ='';
 let interimStr ='';

 for (let i = event.resultIndex; i < event.results.length; ++i) {
 if (event.results[i].isFinal) {
 finalStr += event.results[i][0].transcript +' ';
 } else {
 interimStr += event.results[i][0].transcript;
 }
 }

 if (finalStr) {
 setTranscript((prev) => prev + finalStr);
 if (onFinalResultRef.current) onFinalResultRef.current(finalStr.trim());
 }
 setInterimTranscript(interimStr);
 };

 recognition.onerror = (event) => {
 console.error('Speech recognition error:', event.error);
 if (event.error === 'network' || event.error === 'no-speech') {
 setIsListening(false);
 return;
 }
 setError(event.error);
 setIsListening(false);
 };

 recognition.onend = () => {
 setIsListening(false);
 };

 recognitionRef.current = recognition;

 return () => {
 if (recognitionRef.current) {
 recognitionRef.current.stop();
 }
 };
 }, []);

 const startListening = useCallback(() => {
 if (recognitionRef.current && !isListening) {
 try {
 setInterimTranscript('');
 setError(null);
 recognitionRef.current.start();
 setIsListening(true);
 } catch (err) {
 console.error("Could not start speech recognition:", err);
 }
 }
 }, [isListening]);

 const stopListening = useCallback(() => {
 if (recognitionRef.current && isListening) {
 recognitionRef.current.stop();
 setIsListening(false);
 }
 }, [isListening]);

 const resetTranscript = useCallback(() => {
 setTranscript('');
 setInterimTranscript('');
 }, []);

 return {
 isListening,
 transcript,
 interimTranscript,
 startListening,
 stopListening,
 resetTranscript,
 error,
 hasSupport
 };
}
