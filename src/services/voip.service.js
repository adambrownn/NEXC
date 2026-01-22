import EventEmitter from 'events';
import { Device } from '@twilio/voice-sdk';
import { io } from 'socket.io-client';

import axiosInstance from '../axiosConfig';

class VoIPService extends EventEmitter {
  constructor() {
    super();
    this.device = null;
    this.connection = null;
    this.incomingConnection = null;
    this.callHistory = [];
    this.isRegistered = false;
    this._initializing = false;
    this._isInitialized = false;
    this._identity = null;
    this._callerId = null;
    this._agentPingTimer = null;
    this.lastActiveCall = null;
    this._lastActiveCallKey = 'voip_activeCall';
    this.socket = null; // Socket.IO connection for real-time events
    this._inboundEnabled = true;
  }

  async initialize(_config) {
    if (this._isInitialized && this.device) {
      console.log('[VoIP Service] Already initialized, skipping');
      return true;
    }

    if (this._initializing) return false;
    this._initializing = true;

    try {
      console.log('[VoIP Service] Starting initialization...');
      
      // Fetch an access token from our backend (must be authenticated)
      console.log('[VoIP Service] Requesting Twilio token from backend...');
      const tokenResp = await axiosInstance.post('/voice/token', {});
      const { token, identity, callerId } = tokenResp.data || {};

      if (!token) {
        throw new Error('Twilio token missing from server response');
      }

      console.log('[VoIP Service] ✅ Token received');
      console.log('[VoIP Service] Identity:', identity);
      console.log('[VoIP Service] Caller ID:', callerId);

      this._identity = identity || null;
      this._callerId = callerId || null;

      // Tear down existing device if re-initializing
      if (this.device) {
        try {
          this.device.destroy();
          console.log('[VoIP Service] Previous device destroyed');
        } catch (e) {
          // ignore
        }
        this.device = null;
      }

      console.log('[VoIP Service] Creating new Twilio Device...');
      this.device = new Device(token, {
        // Keep defaults; audio permission is handled by the UI already
        // Close protection: don't assume any audio device routing yet
        closeProtection: true
      });

      this._wireDeviceEvents(this.device);

      console.log('[VoIP Service] Registering device with Twilio...');
      await this.device.register();
      console.log('[VoIP Service] ✅ Device registered successfully');
      this.isRegistered = true;

      this._isInitialized = true;

      // Initialize Socket.IO connection for real-time events
      this._initializeSocket();

      // CRITICAL FIX: Don't start empty heartbeat!
      // voipService should NOT be responsible for agent pings.
      // CallManagement handles status pings every 60 seconds (sufficient for 120s TTL).
      // Empty pings from voipService were resetting status to 'available' every 30s.
      // Removed:
      //   if (this._agentPingTimer) clearInterval(this._agentPingTimer);
      //   this._agentPingTimer = setInterval(() => { empty body }, 30_000);
      // Let CallManagement be the sole source of agent status updates.

      console.log('[VoIP Service] ✅ Initialization complete');
      return true;
    } catch (error) {
      this.isRegistered = false;
      this._isInitialized = false;
      this.emit('registrationStateChanged', false);
      const safeError =
        error instanceof Error
          ? error
          : new Error(typeof error === 'string' ? error : 'VoIP initialization failed');
      console.error('[VoIP Service] ❌ Initialization failed:', safeError.message);
      throw safeError;
    } finally {
      this._initializing = false;
    }
  }

  /**
   * Initialize Socket.IO connection for real-time call events
   * Layered on top of existing EventEmitter for backend integration
   */
  _initializeSocket() {
    // Avoid multiple socket connections
    if (this.socket?.connected) {
      return;
    }

    // Get Socket.IO URL
    const socketUrl = process.env.REACT_APP_API_BASE_URL || 'https://localhost:3000';
    
    // Get token from localStorage and parse it (it's stored as JSON string)
    let token = localStorage.getItem('accessToken');
    if (token) {
      try {
        // Token is stored as JSON string, need to parse it
        token = JSON.parse(token);
      } catch (e) {
        console.warn('[VoIP Service] Token not JSON, using as-is:', e.message);
      }
    }

    console.log('[VoIP Service] Initializing Socket.IO connection...');
    console.log('[VoIP Service] Token (first 20 chars):', token?.substring(0, 20) + '...');

    // Create Socket.IO connection
    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      secure: true,
      rejectUnauthorized: process.env.NODE_ENV === 'production',
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: { token }
    });

    // Connection event handlers
    this.socket.on('connect', () => {
      console.log('[VoIP Service] Socket.IO connected');
      console.log('[VoIP Service] Socket ID:', this.socket.id);
      this.emit('socketConnected'); // Emit for UI tracking
      
      // Join user's personal room for call notifications
      if (this._identity) {
        const userId = this._identity.replace('user_', '');
        console.log('[VoIP Service] Joining user room:', userId);
        this.socket.emit('join_user_room', { userId });
      }
      
      // Join voice monitoring room (if admin/supervisor)
      console.log('[VoIP Service] Requesting to join voice_monitoring room...');
      this.socket.emit('join_voice_monitoring');
      
      // Log to verify we're listening for events
      console.log('[VoIP Service] Listening for: call_activity, recording_available, call_status_update');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[VoIP Service] Socket.IO disconnected:', reason);
      this.emit('socketDisconnected'); // Emit for UI tracking
    });

    this.socket.on('connect_error', (error) => {
      console.error('[VoIP Service] Socket.IO connection error:', error.message);
    });
    
    // Listen for voice_monitoring room join acknowledgement
    this.socket.on('voice_monitoring_joined', (data) => {
      if (data.success) {
        console.log('✅ [VoIP Service] Joined voice_monitoring room successfully');
        console.log('[VoIP Service] Room has', data.roomMembers, 'member(s)');
      } else {
        console.warn('❌ [VoIP Service] Failed to join voice_monitoring:', data.reason);
        console.warn('[VoIP Service] Your role:', data.role);
      }
    });

    // Listen for real-time call status updates from backend
    this.socket.on('call_status_update', (data) => {
      console.log('[VoIP Service] Call status update received:', data);
      
      // Show browser notification for incoming calls
      if (data.status === 'ringing' && data.direction === 'inbound') {
        this._showBrowserNotification(data);
      }
      
      // Emit as EventEmitter for local UI (keeps existing behavior)
      this.emit('callStatusChanged', {
        callSid: data.callSid,
        status: data.status,
        from: data.from,
        to: data.to,
        direction: data.direction,
        timestamp: data.timestamp
      });
    });

    // Listen for general call activity (for monitoring/analytics)
    this.socket.on('call_activity', (data) => {
      console.log('[VoIP Service] Call activity:', data);
      
      // Emit for dashboard monitoring features
      this.emit('callActivity', data);
    });
    
    // Listen for recording availability
    this.socket.on('recording_available', (data) => {
      console.log('[VoIP Service] Recording available:', data);
      
      // Emit for dashboard to update UI
      this.emit('recordingAvailable', data);
    });

    // Listen for dequeued call notifications from hold loop
    this.socket.on('incoming_call_notification', (data) => {
      console.log('[VoIP Service] 📞 Dequeued call notification received:', data);
      
      // Simulate incoming call event for UI
      const call = {
        id: Date.now().toString(),
        number: data.From || 'Unknown',
        direction: 'incoming',
        status: 'ringing',
        timestamp: new Date(),
        callSid: data.CallSid,
        isDequeued: true
      };
      
      this.callHistory.unshift(call);
      console.log('[VoIP Service] ✅ Emitting incomingCall event for dequeued call');
      this.emit('incomingCall', { ...call });
    });
  }

  async setInboundAvailability(enabled) {
    console.log(`[VoIP Service] setInboundAvailability called: ${enabled}`);
    this._inboundEnabled = !!enabled;

    if (!this.device) {
      console.warn('[VoIP Service] Device not initialized, cannot change inbound availability');
      return;
    }

    try {
      if (enabled) {
        console.log('[VoIP Service] Registering device for inbound calls...');
        // Check if device is already registered
        if (!this.isRegistered) {
          await this.device.register();
          this.isRegistered = true;
          console.log('✅ [VoIP Service] Device registered - ready to receive calls');
        } else {
          console.log('[VoIP Service] Device already registered, skipping');
        }
        this.emit('registrationStateChanged', true);
      } else {
        console.log('[VoIP Service] Unregistering device - will not receive calls');
        // Check if device is actually registered before trying to unregister
        if (this.isRegistered) {
          await this.device.unregister();
          this.isRegistered = false;
          console.log('✅ [VoIP Service] Device unregistered');
        } else {
          console.log('[VoIP Service] Device already unregistered, skipping');
        }
        this.emit('registrationStateChanged', false);
      }
    } catch (err) {
      console.error('[VoIP Service] ❌ Failed to toggle inbound availability:', err?.message || err);
      throw err;
    }
  }

  /**
   * Show browser notification for incoming calls
   * Requires notification permission
   */
  _showBrowserNotification(data) {
    // Check if notifications are supported and permitted
    if (!('Notification' in window)) {
      console.warn('[VoIP Service] Browser notifications not supported');
      return;
    }

    // Request permission if not yet granted
    if (Notification.permission === 'default') {
      Notification.requestPermission();
      return;
    }

    if (Notification.permission === 'granted') {
      try {
        const notification = new Notification('📞 Incoming Call', {
          body: `Call from ${data.from}`,
          icon: '/favicon/favicon-96x96.png',
          badge: '/favicon/favicon-96x96.png',
          tag: data.callSid,
          requireInteraction: true,
          silent: false
        });

        // Handle notification click
        notification.onclick = () => {
          window.focus();
          notification.close();
          
          // Navigate to call management if not already there
          if (!window.location.pathname.includes('/dashboard/calls')) {
            window.location.href = '/dashboard/calls';
          }
        };
      } catch (error) {
        console.error('[VoIP Service] Error showing notification:', error);
      }
    }
  }

  _wireDeviceEvents(device) {
    device.on('registered', () => {
      this.isRegistered = true;
      this.emit('registrationStateChanged', true);
    });

    device.on('unregistered', () => {
      this.isRegistered = false;
      this.emit('registrationStateChanged', false);
    });

    device.on('error', (err) => {
      console.error('[Twilio Voice] Device error:', err);
      // Keep UI consistent
      this.emit('connectionFailed', { message: err?.message || 'Twilio Voice device error' });
    });

    device.on('incoming', (connection) => {
      console.log('[VoIP Service] 📞 Incoming call received');
      console.log('[VoIP Service] From:', connection?.parameters?.From);
      console.log('[VoIP Service] CallSid:', connection?.parameters?.CallSid);
      console.log('[VoIP Service] Current connection exists:', !!this.connection);
      
      // If already on a call, reject additional calls for now
      if (this.connection) {
        console.warn('[VoIP Service] Rejecting incoming call - already on a call');
        try { connection.reject(); } catch (e) { /* ignore */ }
        return;
      }

      this.incomingConnection = connection;

      const from = connection?.parameters?.From || 'Unknown';
      const call = {
        id: Date.now().toString(),
        number: from,
        direction: 'incoming',
        status: 'ringing',
        timestamp: new Date(),
        callSid: connection?.parameters?.CallSid
      };

      console.log('[VoIP Service] ✅ Incoming call added to history and emitted');
      this.callHistory.unshift(call);
      this.emit('incomingCall', { ...call });

      this._wireConnectionEvents(connection, call.id);
    });
  }

  _wireConnectionEvents(connection, callId) {
    const updateStatus = (status) => {
      const idx = this.callHistory.findIndex(c => c.id === callId);
      if (idx === -1) return;
      const callSid = connection?.parameters?.CallSid || this.callHistory[idx].callSid;
      const updatedCall = {
        ...this.callHistory[idx],
        status,
        callSid,
        parameters: connection?.parameters || this.callHistory[idx].parameters
      };

      this.callHistory[idx] = updatedCall;
      this.emit('callStatusChanged', { ...updatedCall });

      if (status === 'active' || status === 'hold') {
        this.setLastActiveCall({
          ...updatedCall,
          timestamp: updatedCall.timestamp || new Date()
        });
      }

      if (['ended', 'failed', 'canceled', 'rejected'].includes(status)) {
        this.setLastActiveCall(null);
      }
    };

    connection.on('accept', () => {
      this.connection = connection;
      this.incomingConnection = null;
      updateStatus('active');
    });

    connection.on('disconnect', () => {
      this._finalizeCall(callId, 'ended');
    });

    connection.on('cancel', () => {
      this._finalizeCall(callId, 'canceled');
    });

    connection.on('reject', () => {
      console.log('[Twilio Voice] Connection rejected');
      this._finalizeCall(callId, 'rejected');
    });

    connection.on('error', (err) => {
      console.error('[Twilio Voice] Connection error:', err);
      console.error('[Twilio Voice] Error code:', err?.code);
      console.error('[Twilio Voice] Error message:', err?.message);
      
      // Log detailed error info for 31005
      if (err?.message?.includes('31005')) {
        console.error('[Twilio Voice] ⚠️  ERROR 31005: Gateway rejected call');
        console.error('[Twilio Voice] This usually means:');
        console.error('[Twilio Voice]   1. TwiML endpoint returned invalid response');
        console.error('[Twilio Voice]   2. Webhook URL is unreachable');
        console.error('[Twilio Voice]   3. Gateway connection issue');
        console.error('[Twilio Voice]   4. Token expired or invalid');
      }
      
      this._finalizeCall(callId, 'failed');
    });
  }

  _finalizeCall(callId, reason) {
    const idx = this.callHistory.findIndex(c => c.id === callId);
    if (idx !== -1) {
      const endTime = new Date();
      const startTime = new Date(this.callHistory[idx].timestamp);
      const duration = Math.max(0, Math.floor((endTime - startTime) / 1000));
      this.callHistory[idx] = { ...this.callHistory[idx], status: reason, duration };
      console.log(`[Twilio Voice] Call finalized: ${reason} (Duration: ${duration}s)`);
      this.emit('callStatusChanged', { ...this.callHistory[idx] });
    }

    if (this.connection) {
      try { this.connection.disconnect(); } catch (e) { /* ignore */ }
    }
    this.connection = null;
    this.incomingConnection = null;
    this.setLastActiveCall(null);
  }

  async unregister() {
    if (!this.device) return;
    try {
      await this.device.unregister();
    } finally {
      this._inboundEnabled = false;
      this._isInitialized = false;
      this.setLastActiveCall?.(null);
      this._persistLastActiveCall?.(null);
      // Clean up agent heartbeat timer
      if (this._agentPingTimer) {
        clearInterval(this._agentPingTimer);
        this._agentPingTimer = null;
      }
      
      // Clean up Socket.IO connection
      if (this.socket) {
        console.log('[VoIP Service] Disconnecting Socket.IO...');
        this.socket.disconnect();
        this.socket = null;
      }
      
      // Clean up Twilio device
      try { this.device.destroy(); } catch (e) { /* ignore */ }
      this.device = null;
      this.isRegistered = false;
      this.emit('registrationStateChanged', false);
    }
  }

  async makeCall(number) {
    if (!this.device) throw new Error('Twilio device not initialized');
    if (!this.isRegistered) throw new Error('Twilio device not registered - ensure device.register() completed');
    if (this.connection) throw new Error('Already on a call');

    const to = (number || '').toString().trim();
    if (!to) throw new Error('Missing phone number');

    console.log('[Twilio Voice] Making call to:', to);
    console.log('[Twilio Voice] Device registered:', this.isRegistered);
    console.log('[Twilio Voice] Identity:', this._identity);

    const call = {
      id: Date.now().toString(),
      number: to,
      direction: 'outgoing',
      status: 'connecting',
      timestamp: new Date()
    };

    this.callHistory.unshift(call);
    this.emit('callStatusChanged', { ...call });

    try {
      console.log('[Twilio Voice] Initiating device.connect()...');
      const connection = await this.device.connect({
        params: { To: to }
      });
      console.log('[Twilio Voice] ✅ Device.connect() successful');
      this.connection = connection;

      this._wireConnectionEvents(connection, call.id);
      // For outbound, accept fires once connected
      return true;
    } catch (error) {
      console.error('[Twilio Voice] ❌ Device.connect() failed:', error?.message || error);
      this._finalizeCall(call.id, 'failed');
      throw error;
    }
  }

  async answerCall() {
    if (!this.incomingConnection) throw new Error('No incoming call to answer');
    try {
      this.incomingConnection.accept();
      return true;
    } catch (error) {
      throw error;
    }
  }

  _currentCallSid(callSidOverride) {
    return (
      callSidOverride ||
      this.connection?.parameters?.CallSid ||
      this.incomingConnection?.parameters?.CallSid ||
      this.lastActiveCall?.callSid ||
      null
    );
  }

  async hangupCall(options = {}) {
    const { strategy = 'terminate', callSid } = options;
    const targetCallSid = this._currentCallSid(callSid);

    if (strategy === 'ignore') {
      if (this.incomingConnection) {
        try { this.incomingConnection.reject(); } catch (error) { throw error; }
        this.incomingConnection = null;
        return true;
      }
      if (this.connection) {
        this.connection.disconnect();
        this.connection = null;
        return true;
      }
      throw new Error('No active call to ignore');
    }

    if (!this.connection && !this.incomingConnection && !targetCallSid) {
      throw new Error('No active call to hang up');
    }

    let backendSucceeded = false;

    // Terminate the caller side via backend to avoid re-queuing
    if (targetCallSid) {
      try {
        await axiosInstance.post(`/voice/calls/${targetCallSid}/hangup`);
        backendSucceeded = true;
      } catch (err) {
        // Fallback: try body-based endpoint (avoids any path issues)
        try {
          await axiosInstance.post('/voice/calls/hangup', { callSid: targetCallSid });
          backendSucceeded = true;
        } catch (err2) {
          console.warn('[VoIP Service] Backend hangup failed:', err?.message || err);
          console.warn('[VoIP Service] Fallback hangup also failed:', err2?.message || err2);
        }
      }
    }

    // Clean up local connections so UI clears immediately
    const hadLocalConnection = !!(this.connection || this.incomingConnection);

    if (this.connection) {
      try { this.connection.disconnect(); } catch (err) { /* ignore */ }
      this.connection = null;
    }

    if (this.incomingConnection) {
      try { this.incomingConnection.reject(); } catch (err) { /* ignore */ }
      this.incomingConnection = null;
    }

    this.setLastActiveCall(null);

    if (!backendSucceeded && !hadLocalConnection) {
      // Surface a hard error so UI can keep the widget open for retry
      throw new Error('Hangup failed: backend not reachable and no local call to disconnect');
    }

    return true;
  }

  async ignoreCall(options = {}) {
    return this.hangupCall({ ...options, strategy: 'ignore' });
  }

  async sendDTMF(tone) {
    if (!this.connection) throw new Error('No active call to send DTMF tones');
    this.connection.sendDigits(tone);
    return true;
  }

  async holdCall() {
    if (!this.connection) throw new Error('No active call to hold');
    // Simple client-side mute - TwiML backend redirection terminates the call
    this.connection.mute(true);

    const idx = this.callHistory.findIndex(c => c.status === 'active');
    if (idx !== -1) {
      this.callHistory[idx] = { ...this.callHistory[idx], status: 'hold' };
      this.emit('callStatusChanged', { ...this.callHistory[idx] });
    }
    console.log('✅ [VoIP] Call muted (on hold)');
    return true;
  }

  async resumeCall() {
    if (!this.connection) throw new Error('No active call to resume');
    // Simple client-side unmute
    this.connection.mute(false);

    const idx = this.callHistory.findIndex(c => c.status === 'hold');
    if (idx !== -1) {
      this.callHistory[idx] = { ...this.callHistory[idx], status: 'active' };
      this.emit('callStatusChanged', { ...this.callHistory[idx] });
    }
    console.log('✅ [VoIP] Call unmuted (resumed)');
    return true;
  }

  async transferCall(transferTo) {
    if (!transferTo) {
      throw new Error('Transfer target number is required');
    }

    const callSid = this._currentCallSid();
    if (!callSid) {
      throw new Error('No active call to transfer');
    }

    try {
      console.log(`[VoIP Service] Initiating transfer of ${callSid} to ${transferTo}`);
      
      const response = await axiosInstance.post(
        `/voice/calls/${callSid}/transfer`,
        { transferTo },
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log(`[VoIP Service] ✅ Transfer initiated:`, response.data);
      
      // Update local call state to indicate transfer in progress
      const idx = this.callHistory.findIndex(c => c.callSid === callSid);
      if (idx !== -1) {
        this.callHistory[idx] = {
          ...this.callHistory[idx],
          status: 'transferring',
          transferredTo: transferTo
        };
        this.emit('callStatusChanged', { ...this.callHistory[idx] });
      }

      return true;
    } catch (error) {
      console.error('[VoIP Service] Transfer failed:', error?.message || error);
      throw error;
    }
  }

  setRemoteAudioElement(_element) {
    // Twilio Voice JS manages remote audio routing internally.
    return true;
  }

  getCallHistory() {
    return [...this.callHistory];
  }

  isInitialized() {
    return !!this._isInitialized;
  }

  getCurrentActiveCall() {
    if (this.connection) {
      const active = this.callHistory.find(c => c.status === 'active' || c.status === 'hold');
      if (active) {
        return {
          ...active,
          parameters: this.connection.parameters || {},
          callSid: this.connection.parameters?.CallSid || active.callSid
        };
      }
    }
    return this._loadLastActiveCall();
  }

  setLastActiveCall(call) {
    this.lastActiveCall = call;
    this._persistLastActiveCall(call);
  }

  _persistLastActiveCall(call) {
    try {
      if (call) {
        sessionStorage.setItem(this._lastActiveCallKey, JSON.stringify(call));
      } else {
        sessionStorage.removeItem(this._lastActiveCallKey);
      }
    } catch (err) {
      console.warn('[VoIP Service] Failed to persist active call:', err?.message);
    }
  }

  _loadLastActiveCall() {
    if (this.lastActiveCall) return this.lastActiveCall;
    try {
      const raw = sessionStorage.getItem(this._lastActiveCallKey);
      if (raw) {
        this.lastActiveCall = JSON.parse(raw);
        return this.lastActiveCall;
      }
    } catch (err) {
      console.warn('[VoIP Service] Failed to load active call from session:', err?.message);
    }
    return null;
  }
}

const voipService = new VoIPService();
export default voipService;