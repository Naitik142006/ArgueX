import { io } from'socket.io-client';

/**
 * Socket.IO Client Configuration
 * * This service creates a Socket.IO connection to the backend
 * and handles authentication, reconnection, and event management.
 */

let socket = null;

/**
 * Initialize Socket.IO connection
 * @param {string} token - JWT auth token
 * @param {string} serverUrl - Backend server URL (default: current origin)
 * @returns {Socket} Socket.IO instance
 * * FLOW:
 * 1. Create socket with auth token
 * 2. Set up event listeners
 * 3. Return socket for use in components
 */
export const initSocket = (token, serverUrl = '') => {
 if (socket) {
 return socket;
 }

 socket = io(serverUrl, {
 // Authentication: Send JWT token when connecting
 auth: {
 token,
 },
 // Auto-reconnect settings
 reconnection: true,
 reconnectionDelay: 1000,
 reconnectionDelayMax: 5000,
 reconnectionAttempts: 5,
 });

 /**
 * CONNECTION EVENTS
 */

 // Successfully connected
 socket.on('connect', () => {
 console.log(`
 ✓ Connected to Socket.IO
 Socket ID: ${socket.id}`);
 });

 // Connection error
 socket.on('connect_error', (error) => {
 console.error('Socket connection error:', error);
 });

 // Reconnecting
 socket.on('reconnect_attempt', () => {
 console.log('Attempting to reconnect...');
 });

 // Successfully reconnected
 socket.on('reconnect', () => {
 console.log('✓ Reconnected to Socket.IO');
 });

 // Disconnected
 socket.on('disconnect', (reason) => {
 console.log('Disconnected from Socket.IO:', reason);
 });

 /**
 * ROOM EVENTS
 */

 // Emitted when a user joins a room
 socket.on('userJoined', (data) => {
 console.log(`👤 ${data.userName} joined the room`);
 });

 // Emitted when a user leaves a room
 socket.on('userLeft', (data) => {
 console.log(`👤 ${data.userName} left the room`);
 });

 // Receive room state when joining
 socket.on('roomState', (data) => {
 console.log('Room state:', data);
 });

 /**
 * PRESENCE EVENTS
 */

 // User came online
 socket.on('userOnline', (data) => {
 console.log(`🟢 ${data.userName} is online`);
 });

 // User went offline
 socket.on('userOffline', (data) => {
 console.log(`⚫ ${data.userName} is offline`);
 });

 /**
 * MESSAGE EVENTS
 */

 // Receive debate messages
 socket.on('debateMessage', (data) => {
 console.log(`💬 ${data.userName}: ${data.message}`);
 });

 /**
 * TYPING EVENTS
 */

 // Someone is typing
 socket.on('userTyping', (data) => {
 console.log(`✍️ ${data.userName} is typing...`);
 });

 // Someone stopped typing
 socket.on('userStoppedTyping', (data) => {
 console.log(`✍️ ${data.userName} stopped typing`);
 });

 /**
 * ERROR EVENTS
 */

 // Server error
 socket.on('error', (error) => {
 console.error('Socket error:', error);
 });

 return socket;
};

/**
 * Get current socket instance
 * @returns {Socket|null} Socket.IO instance or null if not connected
 */
export const getSocket = () => socket;

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
 if (socket) {
 socket.disconnect();
 socket = null;
 }
};

/**
 * Emit events to server
 * * USAGE:
 * emitEvent('joinRoom', { roomId:'123' })
 * emitEvent('debateMessage', { message:'Hello', roomId:'123' })
 */
export const emitEvent = (eventName, data) => {
 if (!socket) {
 console.error('Socket not connected');
 return;
 }

 socket.emit(eventName, data);
};

/**
 * Listen for events from server
 * * USAGE:
 * listenEvent('debateMessage', (data) => {
 * console.log(data);
 * })
 */
export const listenEvent = (eventName, callback) => {
 if (!socket) {
 console.error('Socket not connected');
 return;
 }

 socket.on(eventName, callback);
};

/**
 * Remove event listener
 */
export const removeEventListener = (eventName, callback) => {
 if (socket) {
 socket.off(eventName, callback);
 }
};

export default {
 initSocket,
 getSocket,
 disconnectSocket,
 emitEvent,
 listenEvent,
 removeEventListener,
};
