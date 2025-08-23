import JsSIP from 'jssip';
import EventEmitter from 'events';

class VoIPService extends EventEmitter {
  constructor() {
    super();
    this.ua = null;
    this.session = null;
    this.callHistory = [];
    this.isRegistered = false;
    this.remoteAudio = new Audio();
    this.localStream = null;
    this.freeswitchServer = 'sip.nexc.co.uk'; // SIP domain
    this.wsServer = 'sip.nexc.co.uk:7443';    // WebSocket server (add this line)
    this.incomingSession = null;
    this._initializing = false;
  }

  async initialize(config) {
    try {
      // Use a lock to prevent multiple simultaneous initializations
      if (this._initializing) {
        console.log('VoIP service is already initializing, please wait...');
        return new Promise((resolve) => {
          const checkInterval = setInterval(() => {
            if (!this._initializing) {
              clearInterval(checkInterval);
              resolve(true);
            }
          }, 100);
        });
      }

      this._initializing = true;

      // Call this at the beginning of initialize method (right after this._initializing = true;)
      await this.testDnsResolution();

      // Check if we need to reinitialize
      if (this.ua &&
        this.freeswitchServer === (config?.domain || this.freeswitchServer)) {
        console.log('VoIP service already initialized with the same server');
        this._initializing = false;
        return true;
      }

      // Add clear debug logging to identify config issues
      console.log('VoIP initialization config:', {
        providedDomain: config?.domain,
        providedWsServer: config?.wsServer,
        currentWsServer: this.wsServer
      });

      // Update server configuration if provided
      if (config?.domain) {
        this.freeswitchServer = config.domain;
      }

      // Ensure consistent domain usage
      if (config?.domain) {
        this.freeswitchServer = config.domain;

        // Important: Always ensure domain values match
        if (this.freeswitchServer !== 'sip.nexc.co.uk') {
          console.warn('Using non-standard domain. Consider using sip.nexc.co.uk for best compatibility.');
        }
      }

      // Ensure wsServer always uses the same domain as freeswitchServer
      this.wsServer = config?.wsServer || `${this.freeswitchServer}:7443`;

      // IMPORTANT FIX: Always ensure wsServer uses the hostname
      this.wsServer = config?.wsServer || this.wsServer;

      // If wsServer contains an IP address (like 18.134.88.224), replace it with hostname
      if (this.wsServer.includes('18.134.88.224')) {
        console.log('Replacing IP address in WebSocket server with hostname');
        this.wsServer = this.wsServer.replace('18.134.88.224', 'sip.nexc.co.uk');
      }

      console.log('Final WebSocket server:', this.wsServer);

      // Cleanup existing connection if any
      if (this.ua) {
        console.log('Cleaning up existing user agent before creating a new one');
        this.ua.stop();
        this.ua = null;
      }

      // Add console message to help users with certificate issues
      console.warn(
        "If you're seeing WebSocket connection errors, please visit " +
        `https://${this.wsServer.split(':')[0]}:7443 directly in your browser and accept the certificate first.`
      );

      // Configure JsSIP - Use wsServer instead of freeswitchServer for WebSocket
      JsSIP.debug.enable('JsSIP:*'); // Enable logging for debugging

      // Build the WebSocket URL with proper hostname
      let wsUrl;
      if (this.wsServer.includes(':')) {
        // If port is specified in wsServer
        const [host, port] = this.wsServer.split(':');
        wsUrl = `wss://${host}:${port}`;
      } else {
        // Default to port 7443 if not specified
        wsUrl = `wss://${this.wsServer}:7443`;
      }

      console.log(`Connecting WebSocket to: ${wsUrl}`);
      const socket = new JsSIP.WebSocketInterface(wsUrl);

      const jsipConfig = {
        sockets: [socket],
        // CHANGE THIS LINE:
        uri: `sip:${this.freeswitchServer === 'sip.nexc.co.uk' ? '1000@sip.nexc.co.uk' : `1000@${this.freeswitchServer}`}`,
        display_name: 'NEXC User',
        register: true,
        password: '1000',
        register_expires: 300,

        // Add this line to specify the registration server explicitly
        registrar_server: `sip:${this.freeswitchServer}`,

        // Rest of configuration remains the same
        connection_recovery_min_interval: 2,
        connection_recovery_max_interval: 30,
        session_timers: true,
        session_timers_refresh_method: "UPDATE",
        session_timers_expires: 120,
        no_answer_timeout: 60
      };

      // Create JsSIP User Agent
      this.ua = new JsSIP.UA(jsipConfig);

      // Set up event handlers
      this.setupUAEventHandlers();

      // Start the user agent
      this.ua.start();
      console.log('JsSIP user agent started successfully');

      this._initializing = false;
      return true;
    } catch (error) {
      this._initializing = false;
      console.error('Failed to initialize VoIP service:', error);
      throw error;
    }
  }

  async testDnsResolution() {
    console.log('Testing DNS resolution for sip.nexc.co.uk...');

    // Test using fetch API (handles browser security context)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        await fetch('https://sip.nexc.co.uk:7443', {
          method: 'HEAD',
          mode: 'no-cors',
          signal: controller.signal
        });
        console.log('DNS resolution successful!');
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('DNS resolution timed out - likely working but endpoint not responding');
        } else if (err.name === 'TypeError') {
          console.error('DNS resolution failed - hostname cannot be resolved');
          console.log('Please add to hosts file: 18.134.88.224 sip.nexc.co.uk');
        } else {
          console.log('DNS fetch test:', err.message);
        }
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (err) {
      console.error('DNS test error:', err);
    }
  }

  setupUAEventHandlers() {
    // Connection events
    this.ua.on('connected', () => {
      console.log('WebSocket connected successfully');
    });

    this.ua.on('disconnected', () => {
      console.log('WebSocket disconnected');
      this.isRegistered = false;
      this.emit('registrationStateChanged', { isRegistered: false });

      // Add automatic reconnection logic with exponential backoff
      let reconnectAttempt = 0;
      const maxReconnectAttempts = 5;

      const attemptReconnect = () => {
        if (reconnectAttempt < maxReconnectAttempts) {
          reconnectAttempt++;
          const delay = Math.min(30, Math.pow(2, reconnectAttempt)) * 1000;

          console.log(`Attempting to reconnect (${reconnectAttempt}/${maxReconnectAttempts}) in ${delay / 1000} seconds...`);

          setTimeout(() => {
            if (this.ua) {
              console.log('Reconnecting WebSocket...');
              this.ua.start();
            }
          }, delay);
        } else {
          console.log('Maximum reconnection attempts reached. Please refresh the page.');
          this.emit('connectionFailed', { message: 'Maximum reconnection attempts reached' });
        }
      };

      attemptReconnect();
    });

    // Registration events
    this.ua.on('registered', () => {
      console.log('Successfully registered');
      this.isRegistered = true;
      this.emit('registrationStateChanged', { isRegistered: true });
    });

    this.ua.on('unregistered', () => {
      console.log('Unregistered');
      this.isRegistered = false;
      this.emit('registrationStateChanged', { isRegistered: false });
    });

    this.ua.on('registrationFailed', (e) => {
      console.error('Registration failed', e);
      this.isRegistered = false;
      this.emit('registrationStateChanged', { isRegistered: false });
    });

    // Call events
    this.ua.on('newRTCSession', (event) => {
      const session = event.session;

      if (session.direction === 'incoming') {
        this.handleIncomingCall(session);
      }
    });
  }

  async register() {
    if (!this.ua) {
      throw new Error('VoIP service not initialized');
    }

    try {
      this.ua.register();
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  async unregister() {
    if (this.ua && this.isRegistered) {
      try {
        this.ua.unregister();
      } catch (error) {
        console.error('Failed to unregister:', error);
      }
    }
  }

  async sendDTMF(tone) {
    if (!this.session) {
      throw new Error('No active call to send DTMF tones');
    }

    try {
      this.session.sendDTMF(tone);
      return true;
    } catch (error) {
      console.error('Failed to send DTMF tone:', error);
      throw error;
    }
  }

  setRemoteAudioElement(element) {
    console.log('Setting remote audio element', element);
    this.remoteAudio = element;

    if (!this.remoteAudio) return false;

    // Configure the audio element with essential settings
    this.remoteAudio.autoplay = true;
    this.remoteAudio.playsInline = true;
    this.remoteAudio.muted = false;
    this.remoteAudio.volume = 1.0;

    // Add this code to handle autoplay restrictions
    const tryPlayback = () => {
      this.remoteAudio.play()
        .then(() => console.log('Audio element ready for playback'))
        .catch(err => {
          console.warn('Audio playback needs user interaction:', err);
        });
    };

    // Try initial playback
    tryPlayback();

    // Add a click handler to the document to unlock audio on user interaction
    const unlockAudioOnClick = () => {
      tryPlayback();
      // Only need to do this once
      document.removeEventListener('click', unlockAudioOnClick);
    };
    document.addEventListener('click', unlockAudioOnClick);

    return true;
  }

  async makeCall(number) {
    try {
      if (!this.ua) {
        throw new Error('JsSIP user agent not initialized');
      }

      // Check if registered before making a call
      if (!this.isRegistered) {
        console.log('Not registered with FreeSWITCH, attempting registration...');
        try {
          await this.register();
          // Wait for registration to complete
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Registration timed out'));
            }, 5000);

            const registrationHandler = (status) => {
              if (status.isRegistered) {
                clearTimeout(timeout);
                this.removeListener('registrationStateChanged', registrationHandler);
                resolve();
              }
            };

            this.on('registrationStateChanged', registrationHandler);
          });
        } catch (error) {
          console.error('Failed to register:', error);
          throw new Error('Failed to register with FreeSWITCH. Please check your credentials.');
        }
      }

      // Get microphone access
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      console.log('Local audio stream obtained for call');

      // Create call options with a customized sessionTimersExpires option
      const options = {
        mediaConstraints: { audio: true, video: false },
        pcConfig: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        },
        mediaStream: this.localStream,
        // The standard JsSIP way to set Session-Expires header
        sessionTimersExpires: 120
        // Remove the extraHeaders that are causing the duplicate
      };

      // Format the target number
      const targetNumber = number === '9996' ? '9996' : number;
      const target = `sip:${targetNumber}@${this.freeswitchServer}`;

      console.log(`Dialing: ${target}`);

      // Make the call with the updated options
      this.session = this.ua.call(target, options);

      // Set up session event handlers and continue as before...
      this.setupSessionEventHandlers(this.session);

      // Add call to history
      const call = {
        id: Date.now().toString(),
        number: targetNumber,
        direction: 'outgoing',
        status: 'connecting',
        timestamp: new Date()
      };

      this.callHistory.unshift(call);
      this.emit('callStatusChanged', { ...call });

      return true;
    } catch (error) {
      console.error('Call failed:', error);
      throw error;
    }
  }

  setupSessionEventHandlers(session) {
    // Handle session progress (ringing)
    session.on('progress', () => {
      console.log('Call is ringing...');
      const callIndex = this.findActiveCallIndex();
      if (callIndex !== -1) {
        this.callHistory[callIndex].status = 'ringing';
        this.emit('callStatusChanged', { ...this.callHistory[callIndex] });
      }
    });

    // Handle session accepted (call answered)
    session.on('accepted', () => {
      console.log('Call accepted');

      const callIndex = this.findActiveCallIndex();
      if (callIndex !== -1) {
        this.callHistory[callIndex].status = 'active';
        this.emit('callStatusChanged', { ...this.callHistory[callIndex] });
      }
    });

    // Handle session confirmed (media established)
    session.on('confirmed', () => {
      console.log('Call confirmed - media established');
    });

    // Handle call ended
    session.on('ended', () => {
      this.handleCallEnded(session, 'ended');
    });

    // Handle call failed
    session.on('failed', (e) => {
      console.error('Call failed', e);
      this.handleCallEnded(session, 'failed');
    });

    // Handle media events - THIS IS CRITICAL FOR AUDIO
    session.on('addstream', (event) => {
      console.log('Remote stream received', event.stream);
      if (this.remoteAudio) {
        this.remoteAudio.srcObject = event.stream;
        this.remoteAudio.play()
          .then(() => console.log('Remote audio playback started'))
          .catch(err => console.error('Failed to play remote audio:', err));
      }
    });
  }

  findActiveCallIndex() {
    return this.callHistory.findIndex(
      call => ['connecting', 'ringing', 'active', 'hold'].includes(call.status)
    );
  }

  handleCallEnded(session, reason) {
    console.log(`Call ${reason}`);

    const callIndex = this.findActiveCallIndex();
    if (callIndex !== -1) {
      const endTime = new Date();
      const startTime = new Date(this.callHistory[callIndex].timestamp);
      const duration = Math.floor((endTime - startTime) / 1000);

      this.callHistory[callIndex] = {
        ...this.callHistory[callIndex],
        status: reason,
        duration
      };

      this.emit('callStatusChanged', { ...this.callHistory[callIndex] });
    }

    // Clean up media
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.remoteAudio) {
      this.remoteAudio.srcObject = null;
    }

    if (this.session === session) {
      this.session = null;
    }
  }

  async answerCall() {
    if (!this.incomingSession) {
      throw new Error('No incoming call to answer');
    }

    try {
      // Get audio stream for microphone
      this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Configure answer options
      const options = {
        mediaConstraints: { audio: true, video: false },
        pcConfig: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        },
        mediaStream: this.localStream
      };

      // Answer the call
      this.incomingSession.answer(options);
      this.session = this.incomingSession;

      // Update the call status
      const callIndex = this.findActiveCallIndex();
      if (callIndex !== -1) {
        this.callHistory[callIndex].status = 'active';
        this.emit('callStatusChanged', { ...this.callHistory[callIndex] });
      }

      this.incomingSession = null;
      return true;
    } catch (error) {
      console.error('Failed to answer call:', error);
      throw error;
    }
  }

  async hangupCall() {
    if (this.incomingSession) {
      try {
        this.incomingSession.terminate();
        this.incomingSession = null;
        return true;
      } catch (error) {
        console.error('Failed to reject incoming call:', error);
        throw error;
      }
    }

    if (!this.session) {
      throw new Error('No active call to hang up');
    }

    try {
      this.session.terminate();
      return true;
    } catch (error) {
      console.error('Failed to hang up call:', error);
      throw error;
    }
  }

  async holdCall() {
    if (!this.session) {
      throw new Error('No active call to hold');
    }

    try {
      this.session.hold();

      // Update call history
      const callIndex = this.findActiveCallIndex();
      if (callIndex !== -1) {
        this.callHistory[callIndex].status = 'hold';
        this.emit('callStatusChanged', { ...this.callHistory[callIndex] });
      }

      return true;
    } catch (error) {
      console.error('Failed to hold call:', error);
      throw error;
    }
  }

  async resumeCall() {
    if (!this.session) {
      throw new Error('No active call to resume');
    }

    try {
      this.session.unhold();

      // Update call history
      const callIndex = this.callHistory.findIndex(call => call.status === 'hold');
      if (callIndex !== -1) {
        this.callHistory[callIndex].status = 'active';
        this.emit('callStatusChanged', { ...this.callHistory[callIndex] });
      }

      return true;
    } catch (error) {
      console.error('Failed to resume call:', error);
      throw error;
    }
  }

  async transferCall(target) {
    if (!this.session) {
      throw new Error('No active call to transfer');
    }

    try {
      const targetUri = target.includes('@') ?
        `sip:${target}` :
        `sip:${target}@${this.freeswitchServer}`;

      this.session.refer(targetUri);

      // Update call history
      const callIndex = this.findActiveCallIndex();
      if (callIndex !== -1) {
        this.callHistory[callIndex].status = 'transferring';
        this.emit('callStatusChanged', { ...this.callHistory[callIndex] });
      }

      return true;
    } catch (error) {
      console.error('Failed to transfer call:', error);
      throw error;
    }
  }

  handleIncomingCall(session) {
    if (this.session) {
      // Already on a call, reject this one
      session.terminate();
      return;
    }

    this.incomingSession = session;

    // Set up event handlers for the incoming session
    this.setupSessionEventHandlers(session);

    // Extract caller information
    const from = session.remote_identity;
    const number = from.uri.user || 'Unknown';

    const call = {
      id: Date.now().toString(),
      number: number,
      direction: 'incoming',
      status: 'ringing',
      timestamp: new Date()
    };

    // Add to call history
    this.callHistory.unshift(call);

    // Emit event for UI
    this.emit('incomingCall', { ...call });
  }

  extractNumber(uri) {
    if (!uri) return 'Unknown';
    return uri.user || 'Unknown';
  }

  getCallHistory() {
    return [...this.callHistory];
  }
}

const voipService = new VoIPService();
export default voipService;