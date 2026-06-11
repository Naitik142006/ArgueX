import { useState, useEffect, useCallback, useRef } from'react';

/**
 * Hook to request and manage access to the user's camera and microphone.
 */
export function useMediaStream(video = true, audio = true) {
 const [stream, setStream] = useState(null);
 const [error, setError] = useState(null);
 const [isLoading, setIsLoading] = useState(true);
 const streamRef = useRef(null);

 useEffect(() => {
 let mounted = true;

 const initStream = async () => {
 try {
 setIsLoading(true);
 const mediaStream = await navigator.mediaDevices.getUserMedia({ video, audio });
 if (mounted) {
 streamRef.current = mediaStream;
 setStream(mediaStream);
 setError(null);
 } else {
 // If unmounted before we get the stream, stop it immediately
 mediaStream.getTracks().forEach(track => track.stop());
 }
 } catch (err) {
 console.error('Failed to get media stream', err);
 if (mounted) {
 setError(err.message ||'Microphone/Camera permission denied or device not found.');
 }
 } finally {
 if (mounted) {
 setIsLoading(false);
 }
 }
 };

 initStream();

 return () => {
 mounted = false;
 if (streamRef.current) {
 streamRef.current.getTracks().forEach(track => track.stop());
 streamRef.current = null;
 }
 };
 }, [video, audio]);

 const toggleVideo = useCallback(() => {
 if (streamRef.current) {
 const videoTrack = streamRef.current.getVideoTracks()[0];
 if (videoTrack) {
 videoTrack.enabled = !videoTrack.enabled;
 return videoTrack.enabled;
 }
 }
 return false;
 }, []);

 const toggleAudio = useCallback(() => {
 if (streamRef.current) {
 const audioTrack = streamRef.current.getAudioTracks()[0];
 if (audioTrack) {
 audioTrack.enabled = !audioTrack.enabled;
 return audioTrack.enabled;
 }
 }
 return false;
 }, []);

 return { stream, error, isLoading, toggleVideo, toggleAudio };
}

