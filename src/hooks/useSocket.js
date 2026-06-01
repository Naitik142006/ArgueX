import { useEffect, useRef, useCallback, useState } from 'react';
import { initSocket, getSocket, emitEvent, listenEvent } from '../services/socketService';

/**
 * Custom React Hook: useSocket
 * 
 * Simplifies Socket.IO usage in React components
 * 
 * USAGE in component:
 * 
 * const { socket, isConnected, joinRoom, leaveRoom, sendMessage } = useSocket();
 * 
 * useEffect(() => {
 *   if (isConnected) {
 *     joinRoom('debate-123');
 *   }
 * }, [isConnected]);
 * 
 * return (
 *   <button onClick={() => sendMessage('Hello!')}>Send</button>
 * )
 */
export const useSocket = (token) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [roomUsers, setRoomUsers] = useState([]);

  // Initialize socket on mount
  useEffect(() => {
    if (token && !socketRef.current) {
      socketRef.current = initSocket(token);

      // Listen for connection events
      socketRef.current.on('connect', () => {
        console.log('✓ Socket connected');
        setIsConnected(true);
      });

      socketRef.current.on('disconnect', () => {
        console.log('✗ Socket disconnected');
        setIsConnected(false);
      });

      // Track online users
      socketRef.current.on('userOnline', (data) => {
        setOnlineUsers(prev => [...prev, data]);
      });

      socketRef.current.on('userOffline', (data) => {
        setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId));
      });

      // Track room users
      socketRef.current.on('roomState', (data) => {
        setRoomUsers(data.usersInRoom);
      });

      socketRef.current.on('userJoined', (data) => {
        setRoomUsers(prev => [
          ...prev,
          {
            userId: data.userId,
            userName: data.userName,
          }
        ]);
      });

      socketRef.current.on('userLeft', (data) => {
        setRoomUsers(prev => prev.filter(u => u.userId !== data.userId));
      });
    }

    return () => {
      // Cleanup on unmount (but keep connection alive for app)
    };
  }, [token]);

  /**
   * Join a debate room
   */
  const joinRoom = useCallback((roomId) => {
    if (socketRef.current) {
      emitEvent('joinRoom', { roomId });
    }
  }, []);

  /**
   * Leave a debate room
   */
  const leaveRoom = useCallback((roomId) => {
    if (socketRef.current) {
      emitEvent('leaveRoom', { roomId });
    }
  }, []);

  /**
   * Send debate message
   */
  const sendMessage = useCallback((message, roomId, debateId) => {
    if (socketRef.current) {
      emitEvent('debateMessage', {
        message,
        roomId,
        debateId,
      });
    }
  }, []);

  /**
   * Send typing indicator
   */
  const emitTyping = useCallback((roomId) => {
    if (socketRef.current) {
      emitEvent('userTyping', { roomId });
    }
  }, []);

  /**
   * Send stopped typing indicator
   */
  const emitStoppedTyping = useCallback((roomId) => {
    if (socketRef.current) {
      emitEvent('userStoppedTyping', { roomId });
    }
  }, []);

  /**
   * Listen for incoming messages
   */
  const onMessage = useCallback((callback) => {
    if (socketRef.current) {
      listenEvent('debateMessage', callback);
    }
  }, []);

  /**
   * Listen for room events
   */
  const onRoomEvent = useCallback((event, callback) => {
    if (socketRef.current) {
      listenEvent(event, callback);
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    onlineUsers,
    roomUsers,
    joinRoom,
    leaveRoom,
    sendMessage,
    emitTyping,
    emitStoppedTyping,
    onMessage,
    onRoomEvent,
  };
};

export default useSocket;
