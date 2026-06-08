/**
 * WebRTC Service Wrapper (Mesh Network)
 * Manages multiple RTCPeerConnections for N-Way video/audio.
 */

export class VideoService {
  constructor(socket, roomId, localUserId) {
    this.socket = socket;
    this.roomId = roomId;
    this.localUserId = localUserId; // Need local userId to attach as senderUserId
    this.peers = new Map(); // targetUserId -> RTCPeerConnection
    this.localStream = null;
    this.onRemoteStream = null;
    
    // ICE servers for NAT traversal
    this.config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    // Bind socket listeners
    this.socket.on('webrtc-offer', this.handleReceiveOffer);
    this.socket.on('webrtc-answer', this.handleReceiveAnswer);
    this.socket.on('webrtc-ice-candidate', this.handleReceiveIceCandidate);
  }

  /**
   * Initialize with local stream and callback for remote streams
   */
  initialize(localStream, onRemoteStreamCallback) {
    this.localStream = localStream;
    this.onRemoteStream = onRemoteStreamCallback; // signature: (userId, stream) => void
  }

  /**
   * Add a new peer (when someone joins the room or we join and discover them)
   */
  async addPeer(targetUserId, isInitiator) {
    if (this.peers.has(targetUserId)) {
      return this.peers.get(targetUserId);
    }

    const peerConnection = new RTCPeerConnection(this.config);

    // Add local stream tracks to this peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream);
      });
    }

    // Handle incoming remote stream from this peer
    peerConnection.ontrack = (event) => {
      if (this.onRemoteStream && event.streams && event.streams[0]) {
        this.onRemoteStream(targetUserId, event.streams[0]);
      }
    };

    // Handle ICE candidates generated locally -> send to THIS specific peer via Socket
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('webrtc-ice-candidate', {
          roomId: this.roomId,
          candidate: event.candidate,
          senderUserId: this.localUserId,
          targetUserId: targetUserId
        });
      }
    };

    this.peers.set(targetUserId, peerConnection);

    // If we are the initiator (e.g. we were already in the room when they joined)
    if (isInitiator) {
      try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        this.socket.emit('webrtc-offer', {
          roomId: this.roomId,
          offer: peerConnection.localDescription,
          senderUserId: this.localUserId,
          targetUserId: targetUserId
        });
      } catch (err) {
        console.error(`Error creating offer for ${targetUserId}:`, err);
      }
    }

    return peerConnection;
  }

  /**
   * Remove a peer when they leave the room
   */
  removePeer(userId) {
    const peerConnection = this.peers.get(userId);
    if (peerConnection) {
      peerConnection.close();
      this.peers.delete(userId);
    }
  }

  /**
   * Clean up and destroy all peer connections.
   */
  destroy() {
    this.peers.forEach((peerConnection) => {
      peerConnection.close();
    });
    this.peers.clear();

    if (this.socket) {
      this.socket.off('webrtc-offer', this.handleReceiveOffer);
      this.socket.off('webrtc-answer', this.handleReceiveAnswer);
      this.socket.off('webrtc-ice-candidate', this.handleReceiveIceCandidate);
    }
  }

  // ==========================================
  // SIGNALING HANDLERS
  // ==========================================

  handleReceiveOffer = async ({ offer, senderUserId, targetUserId }) => {
    // Ignore if it's not meant for us
    if (targetUserId !== this.localUserId) return;

    try {
      // The sender wants to connect to us. We need a peer connection for them.
      let peerConnection = this.peers.get(senderUserId);
      if (!peerConnection) {
        peerConnection = await this.addPeer(senderUserId, false);
      }

      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      this.socket.emit('webrtc-answer', {
        roomId: this.roomId,
        answer: peerConnection.localDescription,
        senderUserId: this.localUserId,
        targetUserId: senderUserId
      });
    } catch (err) {
      console.error(`Error handling offer from ${senderUserId}:`, err);
    }
  };

  handleReceiveAnswer = async ({ answer, senderUserId, targetUserId }) => {
    if (targetUserId !== this.localUserId) return;

    try {
      const peerConnection = this.peers.get(senderUserId);
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch (err) {
      console.error(`Error handling answer from ${senderUserId}:`, err);
    }
  };

  handleReceiveIceCandidate = async ({ candidate, senderUserId, targetUserId }) => {
    if (targetUserId !== this.localUserId) return;

    try {
      const peerConnection = this.peers.get(senderUserId);
      if (peerConnection) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (err) {
      console.error(`Error adding ICE candidate from ${senderUserId}:`, err);
    }
  };
}
