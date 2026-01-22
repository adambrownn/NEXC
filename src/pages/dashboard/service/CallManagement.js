import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Container,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  LinearProgress,
  Paper,
  Stack,
  Badge,
  ListItemIcon,
  FormControlLabel,
  Switch, 
  CircularProgress,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab
} from '@mui/material';
import {
  Call as CallIcon,
  CallEnd as CallEndIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Phone as PhoneIcon,
  Dialpad as DialpadIcon,
  PauseCircle as PauseIcon,
  PlayCircle as ResumeIcon,
  SwapCalls as TransferIcon,
  SettingsVoice as SettingsVoiceIcon,
  FiberManualRecord as FiberManualRecordIcon,
  NotificationsActive as NotificationsActiveIcon,
  Visibility as VisibilityIcon,
  Info as InfoIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  Mic as MicIcon,
  GetApp as GetAppIcon,
  Person as PersonIcon,
  Delete as DeleteIcon,
  PhoneInTalk as PhoneInTalkIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from '../../../axiosConfig';

// Components
import Page from '../../../components/Page';
import Scrollbar from '../../../components/Scrollbar';
import Label from '../../../components/Label';

// Services
import voipService from '../../../services/voip.service';

export default function CallManagement() {
  // State
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'disconnected', 'connecting', 'connected', 'error'
  const [activeCall, setActiveCall] = useState(null);
  const [callHistory, setCallHistory] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [callVolume, setCallVolume] = useState(100); // Volume percentage (0-100)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [callTime, setCallTime] = useState(0);
  const callTimerRef = useRef(null);
  const [testMode, setTestMode] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [callActivity, setCallActivity] = useState([]);
  const [userRole, setUserRole] = useState('user');
  const [agentRegistered, setAgentRegistered] = useState(false);
  const [agentStatus, setAgentStatus] = useState('available');
  const [agentActiveCalls, setAgentActiveCalls] = useState(0);
  const [availableAgentCount, setAvailableAgentCount] = useState(0);
  const [queueMetrics, setQueueMetrics] = useState({ size: 0, oldestAgeSeconds: 0 });

  const statusColorMap = useMemo(() => ({
    available: 'success',
    busy: 'error',
    away: 'warning'
  }), []);
  
  // Customer lookup state (Phase 1.3)
  const [customerInfo, setCustomerInfo] = useState(null);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerCallHistory, setCustomerCallHistory] = useState([]);

  // Monitoring filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [directionFilter, setDirectionFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRangeFilter, setTimeRangeFilter] = useState('all');
  
  // Tabs state
  const [currentTab, setCurrentTab] = useState(0);
  const [recordings, setRecordings] = useState([]);
  const [recordingsLoading, setRecordingsLoading] = useState(false);
  const [selectedCallEvent, setSelectedCallEvent] = useState(null);
  const [callDetailsOpen, setCallDetailsOpen] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  // Add this to your component
  const audioRef = useRef(null);
  const remoteAudioRef = useRef(null);

  // Add these states to your component
  const [showDeviceTest, setShowDeviceTest] = useState(false);
  const [testAudioStream, setTestAudioStream] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const audioTestRef = useRef(null);
  const audioContextRef = useRef(null);
  const scriptProcessorRef = useRef(null);
  const audioSourceRef = useRef(null);

  // Add this to your CallManagement.js file (near the top of the component)
  const [audioPermissionGranted, setAudioPermissionGranted] = useState(false);

  // CRITICAL FIX: Use refs to track current status to avoid stale closure bugs
  const agentStatusRef = useRef('available');
  const agentActiveCallsRef = useRef(0);

  // Keep refs in sync with state
  useEffect(() => {
    agentStatusRef.current = agentStatus;
    console.log(`[Agent Registry] Status ref updated to: ${agentStatus}`);
  }, [agentStatus]);

  useEffect(() => {
    agentActiveCallsRef.current = agentActiveCalls;
  }, [agentActiveCalls]);

  const updateAgentPresence = useCallback(async (statusOverride, activeCallsOverride) => {
    try {
      const token = localStorage.getItem('accessToken');
      let parsedToken = token;
      if (token) {
        try {
          parsedToken = JSON.parse(token);
        } catch (e) {
          // Token already raw
        }
      }

      // CRITICAL FIX: Always read from refs to get current values, not stale closure values
      const currentStatus = statusOverride !== undefined ? statusOverride : agentStatusRef.current;
      const currentActiveCalls = Number.isFinite(activeCallsOverride) ? activeCallsOverride : agentActiveCallsRef.current;
      
      const statusToSend = (currentStatus || 'available').toLowerCase();
      const activeCallsToSend = Number(currentActiveCalls);

      console.log(`[Agent Registry] PING: Sending status="${statusToSend}", activeCalls=${activeCallsToSend} (ref.status="${agentStatusRef.current}", ref.activeCalls=${agentActiveCallsRef.current}, statusOverride="${statusOverride}")`);

      const response = await axios.post(
        '/voice/agents/ping',
        {
          status: statusToSend,
          activeCalls: activeCallsToSend
        },
        {
          headers: {
            Authorization: `Bearer ${parsedToken}`
          }
        }
      );

      if (response.data?.availableCount !== undefined) {
        setAvailableAgentCount(response.data.availableCount);
      }

      setAgentRegistered(true);
    } catch (error) {
      console.error('[Agent Registry] ❌ Failed to update presence:', error.message);
      setAgentRegistered(false);
    }
  }, []); // Empty deps - always uses current ref values

  useEffect(() => {
    // Create one-time permission element
    if (!audioPermissionGranted) {
      const unlockAudio = () => {
        // Create and play a silent audio element
        const silentAudio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA");
        silentAudio.volume = 0; // Ensure it's silent
        silentAudio.play().then(() => {
          console.log("[AudioContext] Unlocked by user interaction");
          setAudioPermissionGranted(true);
          // Remove event listeners after success
          document.removeEventListener('click', unlockAudio);
          document.removeEventListener('touchstart', unlockAudio);
          document.removeEventListener('keydown', unlockAudio);
        }).catch(err => {
          // This is expected before user interaction - don't log as error
          console.log("[AudioContext] Waiting for user interaction...");
        });
      };

      // Add listeners for user interactions
      document.addEventListener('click', unlockAudio, { once: false });
      document.addEventListener('touchstart', unlockAudio, { once: false });
      document.addEventListener('keydown', unlockAudio, { once: false });

      return () => {
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
        document.removeEventListener('keydown', unlockAudio);
      };
    }
  }, [audioPermissionGranted]);

  // Load user role and saved volume preference
  useEffect(() => {
    // Get user role for permission checks
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserRole(user.accountType || user.role || 'user');
      }
    } catch (e) {
      console.error('Failed to parse user data:', e);
    }
    
    // Load saved volume preference
    const savedVolume = localStorage.getItem('call_volume');
    if (savedVolume) {
      setCallVolume(Number(savedVolume));
    }
  }, []);

  useEffect(() => {
    if (activeCall && activeCall.status === 'active') {
      // Start timer to update duration display
      callTimerRef.current = setInterval(() => {
        setCallTime(prev => prev + 1);
      }, 1000);
    } else {
      // Clear timer when no active call
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
        setCallTime(0);
      }
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [activeCall]);

  // Update agent busy/available flag based on active call state
  useEffect(() => {
    const calls = activeCall ? 1 : 0;
    setAgentActiveCalls(calls);

    // Mark busy while on a call; otherwise use chosen status
    const statusToSend = activeCall ? 'busy' : agentStatus;
    if (agentRegistered) {
      updateAgentPresence(statusToSend, calls);
    }
  }, [activeCall, agentRegistered, agentStatus, updateAgentPresence]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      // Cleanup call timer
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      
      // Cleanup audio test
      if (testAudioStream) {
        testAudioStream.getTracks().forEach(track => track.stop());
      }
      
      // Cleanup audio context
      if (audioContextRef.current) {
        try {
          if (scriptProcessorRef.current) {
            scriptProcessorRef.current.onaudioprocess = null;
            scriptProcessorRef.current.disconnect();
          }
          if (audioSourceRef.current) {
            audioSourceRef.current.disconnect();
          }
          if (audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
          }
        } catch (e) {
          console.error('Error cleaning up audio:', e);
        }
      }
      
      // NOTE: DO NOT unregister from VoIP service on component unmount
      // This would disconnect active calls when switching tabs
      // VoIP service is app-level and persists across navigation
      // Only unregister on actual logout or app close
    };
  }, [testAudioStream]);

  // Event handlers with useCallback
  const handleIncomingCall = useCallback((call) => {
    // Incoming call is handled by FloatingCallWidget
    // Just log it for diagnostics
    console.log('[CallManagement] Incoming call notification:', call);
    enqueueSnackbar(`Incoming call from ${call.number}`, {
      variant: 'info',
      autoHideDuration: 6000
    });
  }, [enqueueSnackbar]);

  const handleCallStatusChange = useCallback((call) => {
    console.log('[CallManagement] Call status changed:', call);
    
    if (call.status === 'active' || call.status === 'hold') {
      // Update activeCall for active or hold status
      setActiveCall(call);
    } else if (['ended', 'failed', 'canceled', 'rejected'].includes(call.status)) {
      setActiveCall(null);
      // Update call history
      setCallHistory(voipService.getCallHistory());
    }
  }, []);

  const handleRegistrationStateChange = useCallback((isRegistered) => {
    setConnectionStatus(isRegistered ? 'connected' : 'disconnected');
  }, []);

  // Initialize VoIP service with stable dependencies
  useEffect(() => {
    const initializeVoIP = async () => {
      // Get user info for role checking
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const role = user.accountType || user.role || 'user';
          console.log('[CallManagement] User role detected:', role);
          setUserRole(role);
        } catch (e) {
          console.error('[CallManagement] Failed to parse user:', e);
        }
      }
      
      // Load persisted call activity from localStorage
      try {
        const savedActivity = localStorage.getItem('callActivity');
        if (savedActivity) {
          const parsed = JSON.parse(savedActivity);
          console.log('[CallManagement] Loaded', parsed.length, 'call events from localStorage');
          setCallActivity(parsed);
        }
      } catch (e) {
        console.error('[CallManagement] Failed to load call activity:', e);
      }
      
      // Don't try to connect if in test mode
      if (testMode) {
        setConnectionStatus('connected'); // Just pretend we're connected in test mode
        return;
      }

      try {
        setLoading(true);

        if (voipService.isInitialized && voipService.isInitialized()) {
          console.log('[CallManagement] VoIP service already initialized, restoring state');
          setConnectionStatus('connected');

          const currentCall = voipService.getCurrentActiveCall?.();
          if (currentCall) {
            setActiveCall(currentCall);
            console.log('[CallManagement] Restored active call:', currentCall.number || currentCall.callSid);
          }

          setCallHistory(voipService.getCallHistory());
          return;
        }

        setConnectionStatus('connecting');

        console.log('[CallManagement] Initializing Twilio Voice SDK...');
        await voipService.initialize(); // No settings needed - Twilio handles it

        setConnectionStatus('connected');
        setCallHistory(voipService.getCallHistory());
        enqueueSnackbar('Connected to voice service', { variant: 'success' });
      } catch (err) {
        console.error('[CallManagement] Voice initialization failed:', err);
        setConnectionStatus('error');
        const message =
          err?.message ||
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          'Failed to connect to voice service. Please check your credentials.';
        setError(message);
        enqueueSnackbar(message, { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    initializeVoIP();

    // Set up event listeners
    voipService.on('incomingCall', handleIncomingCall);
    voipService.on('callStatusChanged', handleCallStatusChange);
    voipService.on('registrationStateChanged', handleRegistrationStateChange);
    
    // Socket.IO event listeners for real-time features
    const handleSocketConnected = () => {
      console.log('[CallManagement] Socket.IO connected - monitoring available');
      setSocketConnected(true);
    };
    const handleSocketDisconnected = () => {
      console.log('[CallManagement] Socket.IO disconnected');
      setSocketConnected(false);
    };
    const handleCallActivity = (event) => {
      console.log('[CallManagement] Received call activity:', event);
      setCallActivity(prev => {
        // Avoid duplicates by checking CallSid
        const exists = prev.some(e => e.CallSid === event.CallSid && e.CallStatus === event.CallStatus);
        if (exists) {
          console.log('[CallManagement] Duplicate event ignored:', event.CallSid);
          return prev;
        }
        const newActivity = [event, ...prev].slice(0, 50); // Keep last 50 events
        
        // Persist to localStorage
        try {
          localStorage.setItem('callActivity', JSON.stringify(newActivity));
          console.log('[CallManagement] Saved call activity to localStorage');
        } catch (e) {
          console.error('[CallManagement] Failed to save call activity:', e);
        }
        
        return newActivity;
      });
    };
    
    const handleRecordingAvailable = (event) => {
      console.log('[CallManagement] Recording available:', event);
      // Update existing call activity with recording info
      setCallActivity(prev => prev.map(call => 
        call.CallSid === event.CallSid 
          ? { ...call, recording: { status: 'available', s3Url: event.S3Url, duration: event.Duration, sid: event.RecordingSid } }
          : call
      ));
      enqueueSnackbar(`Recording available for call ${event.CallSid.substring(0, 10)}...`, { variant: 'success' });
      // Force refresh recordings list by calling useEffect hook below
      setRecordings(prev => [...prev]); // Trigger re-fetch on next tab switch
    };
    
    voipService.on('socketConnected', handleSocketConnected);
    voipService.on('socketDisconnected', handleSocketDisconnected);
    voipService.on('callActivity', handleCallActivity);
    voipService.on('recordingAvailable', handleRecordingAvailable);

    return () => {
      voipService.removeListener('incomingCall', handleIncomingCall);
      voipService.removeListener('callStatusChanged', handleCallStatusChange);
      voipService.removeListener('registrationStateChanged', handleRegistrationStateChange);
      voipService.removeListener('socketConnected', handleSocketConnected);
      voipService.removeListener('socketDisconnected', handleSocketDisconnected);
      voipService.removeListener('callActivity', handleCallActivity);
      voipService.removeListener('recordingAvailable', handleRecordingAvailable);
    };
  }, [enqueueSnackbar, handleIncomingCall, handleCallStatusChange, handleRegistrationStateChange, userRole, testMode]);

  // Agent auto-registration: ping backend every 60 seconds to stay available for inbound calls
  useEffect(() => {
    // Only register if user is admin/supervisor (not regular users)
    const allowedRoles = ['admin', 'superadmin', 'support', 'supervisor', 'manager'];
    
    // CRITICAL: Don't run until userRole has been loaded from localStorage
    // Initial state is 'user', but actual role comes from localStorage in VoIP init useEffect
    // If we run before that completes, we'll reject valid admins
    if (userRole === 'user') {
      console.log('[Agent Registry] Waiting for user role to be loaded from localStorage...');
      return; // Exit early, will re-run when userRole state updates
    }
    
    if (!allowedRoles.includes(userRole)) {
      console.log('[Agent Registry] User role', userRole, 'not eligible for agent registration');
      return;
    }

    // Initial registration on mount
    const registerAgent = async () => {
      // CRITICAL FIX: Always use current agentStatus state, not cached version
      // Pass undefined to force updateAgentPresence to read current state
      await updateAgentPresence(undefined, undefined);
    };

    // Register immediately
    registerAgent();

    // Then ping every 60 seconds to maintain availability
    const pingInterval = setInterval(() => {
      registerAgent();
    }, 60000); // 60 seconds

    console.log('[Agent Registry] Auto-registration enabled (60s interval)');

    // Cleanup on unmount
    return () => {
      clearInterval(pingInterval);
      console.log('[Agent Registry] Auto-registration disabled');
    };
  }, [userRole, updateAgentPresence]); // Re-run if user role changes or status updater changes

  // Ops metrics: queue size + agent status summary
  useEffect(() => {
    const allowedRoles = ['admin', 'superadmin', 'support', 'supervisor', 'manager'];
    if (!allowedRoles.includes(userRole)) return;

    let interval;

    const fetchMetrics = async () => {
      try {
        const [statusRes, queueRes] = await Promise.all([
          axios.get('/voice/agents/status'),
          axios.get('/voice/queue/metrics')
        ]);

        if (statusRes.data?.data) {
          const availableCount = statusRes.data.data.filter((item) => item.status === 'available').length;
          setAvailableAgentCount(availableCount);
        }

        if (queueRes.data?.data) {
          setQueueMetrics(queueRes.data.data);
        }
      } catch (err) {
        console.warn('[Voice Metrics] Failed to refresh metrics:', err.message);
      }
    };

    fetchMetrics();
    interval = setInterval(fetchMetrics, 30000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [userRole]);

  // Phase 1.3: Automatic customer lookup when call starts
  useEffect(() => {
    const lookupCustomer = async () => {
      // Only lookup if we have an active call with a phone number
      if (!activeCall || !activeCall.parameters) {
        setCustomerInfo(null);
        setCustomerCallHistory([]);
        return;
      }

      // Get phone number from call (use 'To' for outbound, 'From' for inbound)
      const phoneNumber = activeCall.direction === 'outbound' 
        ? activeCall.parameters.To 
        : activeCall.parameters.From;

      if (!phoneNumber || phoneNumber.startsWith('client:')) {
        console.log('[Customer Lookup] No phone number in call or internal call');
        return;
      }

      console.log('[Customer Lookup] Looking up customer for:', phoneNumber);
      setCustomerLoading(true);

      try {
        const token = localStorage.getItem('accessToken');
        let parsedToken = token;
        if (token) {
          try {
            parsedToken = JSON.parse(token);
          } catch (e) {
            // Token already raw
          }
        }

        // Use axiosConfig which already has baseURL and adds /v1 prefix automatically
        const response = await axios.get(
          `/customers/by-phone/${encodeURIComponent(phoneNumber)}`,
          {
            headers: {
              Authorization: `Bearer ${parsedToken}`
            }
          }
        );

        if (response.data.success && response.data.customer) {
          console.log('[Customer Lookup] ✅ Found customer:', response.data.customer);
          setCustomerInfo(response.data.customer);
          setCustomerCallHistory(response.data.calls || []);
          
          enqueueSnackbar(
            `Customer: ${response.data.customer.firstName} ${response.data.customer.lastName}`,
            { variant: 'info' }
          );
        } else {
          console.log('[Customer Lookup] Customer not found');
          setCustomerInfo(null);
          setCustomerCallHistory([]);
        }
      } catch (error) {
        console.error('[Customer Lookup] ❌ Failed to lookup customer:', error.message);
        setCustomerInfo(null);
        setCustomerCallHistory([]);
      } finally {
        setCustomerLoading(false);
      }
    };

    lookupCustomer();
  }, [activeCall, enqueueSnackbar]);

  // Test mode toggle handler
  const handleTestModeToggle = (enabled) => {
    setTestMode(enabled);
    if (enabled) {
      setConnectionStatus('connected');
    } else {
      setConnectionStatus('disconnected');
    }
  };

  const handleStatusChange = useCallback(async (value) => {
    // CRITICAL FIX: Update ref synchronously BEFORE any async operations
    // This prevents race conditions where device unregistration triggers effects
    // that read stale ref values before state updates
    agentStatusRef.current = value;
    setAgentStatus(value);
    
    console.log(`[Agent Status] Changed to ${value} (ref and state updated synchronously)`);
    
    // Critical: Toggle device registration BEFORE updating agent registry
    // This ensures the device is ready to receive calls before Twilio tries to dial
    try {
      if (voipService.setInboundAvailability) {
        console.log(`[Agent Status] Setting inbound availability to: ${value === 'available'}`);
        await voipService.setInboundAvailability(value === 'available');
        console.log('[Agent Status] Device registration state updated');
        
        // Wait a brief moment for Twilio SDK to fully register
        if (value === 'available') {
          await new Promise(resolve => setTimeout(resolve, 500));
          console.log('[Agent Status] Device ready, updating agent registry');
        }
      }
    } catch (err) {
      console.warn('[Agent Registry] Failed to toggle inbound availability:', err?.message || err);
      enqueueSnackbar('Failed to update device status', { variant: 'warning' });
    }
    
    // Now update agent registry so hold loop can select this agent (or not, if Away/Busy)
    await updateAgentPresence(value, agentActiveCalls);
    
    const statusMsg = value === 'available' ? 'Ready for calls' : value === 'away' ? 'Away (unavailable)' : 'Busy';
    enqueueSnackbar(statusMsg, { variant: 'info' });
  }, [agentActiveCalls, updateAgentPresence, enqueueSnackbar]);

  // Action handlers
  const logAudioState = () => {
    console.log('=== AUDIO ELEMENT STATES ===');
    const remoteEl = remoteAudioRef.current;
    console.log('remoteAudioRef:', remoteEl ? {
      exists: true,
      srcObject: remoteEl.srcObject ? `MediaStream (${remoteEl.srcObject.id})` : 'Not set',
      paused: remoteEl.paused,
      muted: remoteEl.muted,
      volume: remoteEl.volume,
      readyState: remoteEl.readyState,
      networkState: remoteEl.networkState
    } : { exists: false });

    const localEl = audioRef.current;
    console.log('audioRef:', localEl ? {
      exists: true,
      srcObject: localEl.srcObject ? `MediaStream (${localEl.srcObject.id})` : 'Not set',
      paused: localEl.paused,
      muted: localEl.muted,
      volume: localEl.volume,
      readyState: localEl.readyState,
      networkState: localEl.networkState
    } : { exists: false });
  };

  const ensureAudioPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Play a silent sound to unlock audio
      const audioContext = new AudioContext();
      const source = audioContext.createBufferSource();
      source.buffer = audioContext.createBuffer(1, 1, 22050);
      source.connect(audioContext.destination);
      source.start(0);

      // Stop the microphone stream - we just needed permission
      stream.getTracks().forEach(track => track.stop());

      setAudioPermissionGranted(true);
      return true;
    } catch (err) {
      console.error('Failed to get audio permissions:', err);
      enqueueSnackbar('Microphone access required for calls', { variant: 'error' });
      return false;
    }
  };

  const handleMakeCall = async () => {
    if (!await ensureAudioPermissions()) return;

    if (!phoneNumber) {
      enqueueSnackbar('Please enter a phone number', { variant: 'warning' });
      return;
    }

    if (testMode) {
      // Create a mock call for testing UI
      const mockCall = {
        id: Date.now().toString(),
        number: phoneNumber,
        direction: 'outgoing',
        status: 'active',
        timestamp: new Date()
      };
      setActiveCall(mockCall);
      setPhoneNumber('');

      // Start the call timer
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }

      setCallTime(0);
      callTimerRef.current = setInterval(() => {
        setCallTime(prev => prev + 1);
      }, 1000);

      return;
    }

    // Regular call handling
    if (connectionStatus !== 'connected') {
      enqueueSnackbar('Not connected to VoIP service', { variant: 'error' });
      return;
    }

    // Before making the call
    logAudioState();

    try {
      setLoading(true);
      
      // Emit outbound call event to Socket.IO for proper direction tracking
      try {
        const token = localStorage.getItem('accessToken');
        let parsedToken = token;
        if (token) {
          try {
            parsedToken = JSON.parse(token);
          } catch (e) {
            // Token already raw
          }
        }
        
        // Use axiosConfig which already has baseURL and adds /v1 prefix automatically
        await axios.post(
          '/voice/call-initiated',
          {
            to: phoneNumber,
            direction: 'outbound',
            initiatedBy: 'dashboard'
          },
          {
            headers: {
              Authorization: `Bearer ${parsedToken}`
            }
          }
        );
      } catch (socketErr) {
        console.warn('[Call Tracking] Failed to emit outbound event:', socketErr.message);
        // Continue with call even if tracking fails
      }
      
      await voipService.makeCall(phoneNumber);
      setPhoneNumber('');

      // After making the call
      setTimeout(() => {
        logAudioState();
      }, 2000);
    } catch (err) {
      console.error('Failed to make call:', err);
      enqueueSnackbar(`Call failed: ${err.message}`, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };



  const handleHangup = async () => {
    try {
      setLoading(true);

      if (!activeCall) {
        enqueueSnackbar('No active call to hang up', { variant: 'warning' });
        return;
      }

      const callSidForHangup = activeCall.callSid || activeCall.parameters?.CallSid;

      // Add this check for test mode
      if (testMode) {
        // Just update the UI for test mode
        setActiveCall(null);
        if (callTimerRef.current) {
          clearInterval(callTimerRef.current);
          callTimerRef.current = null;
        }
        // Add mock call to history for test mode
        const mockEndedCall = {
          id: activeCall.id,
          number: activeCall.number,
          direction: activeCall.direction,
          status: 'ended',
          timestamp: activeCall.timestamp,
          duration: callTime
        };
        setCallHistory(prev => [mockEndedCall, ...prev]);
      } else {
        // Real call handling
        await voipService.hangupCall({ strategy: 'terminate', callSid: callSidForHangup });
        // If backend succeeds, clear UI locally in case events lag
        setActiveCall(null);
      }
    } catch (err) {
      console.error('Failed to hang up:', err);
      enqueueSnackbar(`Hangup failed: ${err.message}`, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Additional call control handlers
  const handleHoldCall = async () => {
    try {
      setLoading(true);

      if (testMode) {
        // Update UI only
        setActiveCall(prev => ({
          ...prev,
          status: 'hold'
        }));
      } else {
        await voipService.holdCall();
      }
    } catch (err) {
      console.error('Failed to hold call:', err);
      enqueueSnackbar(`Hold failed: ${err.message}`, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleResumeCall = async () => {
    try {
      setLoading(true);

      if (testMode) {
        // Update UI only
        setActiveCall(prev => ({
          ...prev,
          status: 'active'
        }));
      } else {
        await voipService.resumeCall();
      }
    } catch (err) {
      console.error('Failed to resume call:', err);
      enqueueSnackbar(`Resume failed: ${err.message}`, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const [transferNumber, setTransferNumber] = useState('');
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);

  const handleTransferCall = async () => {
    if (!transferNumber) {
      enqueueSnackbar('Please enter a transfer number', { variant: 'warning' });
      return;
    }

    try {
      setLoading(true);

      if (testMode) {
        // Simulate transfer
        const mockTransferredCall = {
          id: activeCall.id,
          number: activeCall.number,
          direction: activeCall.direction,
          status: 'transferred',
          timestamp: activeCall.timestamp,
          duration: callTime,
          transferredTo: transferNumber
        };
        setCallHistory(prev => [mockTransferredCall, ...prev]);
        setActiveCall(null);
        if (callTimerRef.current) {
          clearInterval(callTimerRef.current);
          callTimerRef.current = null;
        }
        enqueueSnackbar(`Call transferred to ${transferNumber} (Test Mode)`, { variant: 'info' });
      } else {
        await voipService.transferCall(transferNumber);
        enqueueSnackbar(`Call transfer to ${transferNumber} initiated`, { variant: 'success' });
        // Don't immediately clear the call - let Twilio handle the transition
      }

      setTransferDialogOpen(false);
      setTransferNumber('');
    } catch (err) {
      console.error('Failed to transfer call:', err);
      enqueueSnackbar(`Transfer failed: ${err.message}`, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const [dtmfDialogOpen, setDtmfDialogOpen] = useState(false);

  const handleSendDTMF = (tone) => {
    try {
      if (!testMode) {
        voipService.sendDTMF(tone);
      } else {
        // Just show a notification in test mode
        enqueueSnackbar(`DTMF tone ${tone} sent (Test Mode)`, { variant: 'info' });
      }
    } catch (err) {
      console.error('Failed to send DTMF tone:', err);
      enqueueSnackbar(`DTMF failed: ${err.message}`, { variant: 'error' });
    }
  };

  // Filter call activity based on selected filters
  const filteredCallActivity = useMemo(() => {
    let filtered = [...callActivity];
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => 
        event.CallStatus?.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    // Direction filter  
    if (directionFilter !== 'all') {
      filtered = filtered.filter(event =>
        event.Direction?.toLowerCase() === directionFilter.toLowerCase()
      );
    }
    
    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event =>
        event.From?.toLowerCase().includes(query) ||
        event.To?.toLowerCase().includes(query) ||
        event.CallSid?.toLowerCase().includes(query)
      );
    }
    
    // Time range filter
    if (timeRangeFilter !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      
      switch(timeRangeFilter) {
        case '1h':
          cutoff.setHours(now.getHours() - 1);
          break;
        case '4h':
          cutoff.setHours(now.getHours() - 4);
          break;
        case 'today':
          cutoff.setHours(0, 0, 0, 0);
          break;
        default:
          break;
      }
      
      if (timeRangeFilter !== 'all') {
        filtered = filtered.filter(event => 
          new Date(event.Timestamp) >= cutoff
        );
      }
    }
    
    return filtered;
  }, [callActivity, statusFilter, directionFilter, searchQuery, timeRangeFilter]);

  // Export call activity to CSV
  const handleExportCallActivity = useCallback(() => {
    try {
      // Prepare CSV data
      const headers = ['Timestamp', 'From', 'To', 'Status', 'Direction', 'CallSid'];
      const rows = filteredCallActivity.map(event => [
        new Date(event.Timestamp).toLocaleString(),
        event.From || '-',
        event.To || '-',
        event.CallStatus || '-',
        event.Direction || '-',
        event.CallSid || '-'
      ]);
      
      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `call-activity-${new Date().toISOString().slice(0,10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      enqueueSnackbar('Call activity exported successfully', { variant: 'success' });
    } catch (error) {
      console.error('Export error:', error);
      enqueueSnackbar('Failed to export call activity', { variant: 'error' });
    }
  }, [filteredCallActivity, enqueueSnackbar]);

  // View call details
  const handleViewCallDetails = useCallback((event) => {
    setSelectedCallEvent(event);
    setCallDetailsOpen(true);
  }, []);

  // Fetch recordings
  const fetchRecordings = useCallback(async () => {
    // Check user role
    if (!['admin', 'superadmin', 'manager'].includes(userRole)) {
      console.warn('[CallManagement] User does not have permission to view recordings');
      return;
    }
    
    console.log('[CallManagement] Fetching recordings...');
    setRecordingsLoading(true);
    setRecordings([]); // Clear existing recordings while loading
    
    try {
      const response = await axios.get('/voice/recordings', {
        params: { limit: 100, status: 'available' },
        timeout: 10000 // 10 second timeout
      });
      
      console.log('[CallManagement] Recordings API response:', response.data);
      
      if (response.data && response.data.success) {
        const recordingsData = response.data.data || [];
        setRecordings(recordingsData);
        console.log('[CallManagement] ✅ Loaded', recordingsData.length, 'recordings');
        
        if (recordingsData.length === 0) {
          console.log('[CallManagement] No recordings found in database');
        }
      } else {
        console.error('[CallManagement] Invalid response format:', response.data);
        enqueueSnackbar('Invalid response from server', { variant: 'error' });
      }
    } catch (err) {
      console.error('[CallManagement] ❌ Error fetching recordings:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      if (err.response?.status === 401) {
        enqueueSnackbar('Not authenticated. Please log in again.', { variant: 'error' });
      } else if (err.response?.status === 403) {
        enqueueSnackbar('You do not have permission to view recordings', { variant: 'error' });
      } else if (err.code === 'ECONNABORTED') {
        enqueueSnackbar('Request timeout. Please try again.', { variant: 'error' });
      } else {
        enqueueSnackbar('Failed to load recordings: ' + (err.message || 'Unknown error'), { variant: 'error' });
      }
    } finally {
      setRecordingsLoading(false);
    }
  }, [userRole, enqueueSnackbar]);

  const handleDeleteRecording = useCallback(async (callSid) => {
    if (!window.confirm('Are you sure you want to permanently delete this recording?')) {
      return;
    }

    try {
      setRecordingsLoading(true);
      await axios.delete(`/voice/recordings/${callSid}`);

      setRecordings(prev => prev.filter(r => r.callSid !== callSid));
      enqueueSnackbar('Recording deleted', { variant: 'success' });

      await fetchRecordings();
    } catch (error) {
      console.error('Delete error:', error);
      enqueueSnackbar('Failed to delete recording', { variant: 'error' });
    } finally {
      setRecordingsLoading(false);
    }
  }, [fetchRecordings, enqueueSnackbar]);
  
  // Fetch recordings when tab changes
  useEffect(() => {
    if (currentTab === 1 && ['admin', 'superadmin', 'manager'].includes(userRole)) {
      console.log('[CallManagement] Tab changed to Recordings, fetching data...');
      fetchRecordings();
    }
  }, [currentTab, userRole, fetchRecordings]);

  const getCallDuration = (call) => {
    if (call.status === 'active') {
      // Use callTime for active calls for more accurate duration
      const minutes = Math.floor(callTime / 60);
      const seconds = callTime % 60;
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    } else if (call.duration) {
      const minutes = Math.floor(call.duration / 60);
      const seconds = call.duration % 60;
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    return '0:00';
  };

  // UI Components
  const ConnectionStatusBadge = () => {
    let color;
    let text;

    switch (connectionStatus) {
      case 'connected':
        color = 'success';
        text = 'Connected';
        break;
      case 'connecting':
        color = 'warning';
        text = 'Connecting';
        break;
      case 'disconnected':
        color = 'error';
        text = 'Disconnected';
        break;
      case 'error':
        color = 'error';
        text = 'Connection Error';
        break;
      default:
        color = 'default';
        text = 'Unknown';
    }

    return (
      <Chip
        size="small"
        label={text}
        color={color}
        sx={{ ml: 1 }}
      />
    );
  };

  // Create audio element for the remote audio
  // const remoteAudioRef = useRef(null);

  useEffect(() => {
    if (remoteAudioRef.current) {
      voipService.setRemoteAudioElement(remoteAudioRef.current);
    }
  }, [remoteAudioRef]);

  // In useEffect or another appropriate place
  // useEffect(() => {
  //   // Set the remote audio element for VoIP service
  //   if (audioRef.current) {
  //     voipService.setRemoteAudioElement(audioRef.current);
  //   }
  // }, []);

  // Add this function
  const testAudioDevices = async () => {
    try {
      // Stop any existing test
      if (testAudioStream) {
        testAudioStream.getTracks().forEach(track => track.stop());
      }

      console.log('Requesting microphone permission...');

      // Get new audio stream with explicit constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      console.log('Microphone permission granted');

      // Log audio tracks for debugging
      const audioTracks = stream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = true;
        console.log(`Audio track: ${track.label}, enabled: ${track.enabled}, muted: ${track.muted}`);
      });

      setTestAudioStream(stream);

      // Create audio context and analyzer with better configuration
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      // Create source from the stream
      const source = audioContext.createMediaStreamSource(stream);
      audioSourceRef.current = source;

      // Create script processor for raw audio data - this is key for visualization
      const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);
      scriptProcessorRef.current = scriptProcessor;
      
      source.connect(scriptProcessor);
      // DON'T connect to destination - causes feedback and issues
      // Just connect to a dummy destination to keep it active
      const dummyGain = audioContext.createGain();
      dummyGain.gain.value = 0; // Silent
      scriptProcessor.connect(dummyGain);
      dummyGain.connect(audioContext.destination);

      // Process audio data for level detection
      scriptProcessor.onaudioprocess = (event) => {
        // Process continuously while dialog is open
        const input = event.inputBuffer.getChannelData(0);
        let sum = 0;

        // Calculate RMS (root mean square) - better for audio levels
        for (let i = 0; i < input.length; i++) {
          sum += input[i] * input[i];
        }

        const rms = Math.sqrt(sum / input.length);
        // Scale to percentage with logarithmic scaling (better for human perception)
        const volumeLevel = Math.min(100, Math.max(0, 100 * rms * 5));

        setAudioLevel(volumeLevel);
      };

    } catch (err) {
      console.error('Failed to test audio devices:', err);
      enqueueSnackbar('Failed to access audio devices: ' + err.message, { variant: 'error' });
    }
  };

  // Render
  return (
    <Page title="Call Management">
      <Container maxWidth="xl">
        <Box sx={{ mb: 5 }}>
          <Typography variant="h4" gutterBottom>
            Call Management
            <Box component="span" sx={{ ml: 2 }}>
              <ConnectionStatusBadge />
              
              {/* Socket.IO Live Indicator */}
              {socketConnected && (
                <Chip
                  size="small"
                  icon={
                    <FiberManualRecordIcon
                      sx={{
                        fontSize: '0.75rem',
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': {
                          '0%, 100%': { opacity: 1 },
                          '50%': { opacity: 0.5 }
                        }
                      }}
                    />
                  }
                  label="Live"
                  color="success"
                  variant="outlined"
                  sx={{ ml: 1 }}
                />
              )}
              
              {/* Voice Monitoring Active Badge (for admins) */}
              {['admin', 'superadmin', 'support', 'supervisor', 'manager'].includes(userRole) && socketConnected && (
                <Chip
                  size="small"
                  icon={<VisibilityIcon sx={{ fontSize: '0.875rem' }} />}
                  label="Monitoring"
                  color="info"
                  variant="outlined"
                  sx={{ ml: 1 }}
                />
              )}
              
              {testMode && (
                <Chip
                  size="small"
                  label="Test Mode"
                  color="warning"
                  sx={{ ml: 1 }}
                />
              )}
              
              {agentRegistered && ['admin', 'superadmin', 'support', 'supervisor', 'manager'].includes(userRole) && (
                <Tooltip title="You are registered to receive inbound calls">
                  <Chip
                    size="small"
                    icon={<PhoneIcon fontSize="small" />}
                    label="Agent Available"
                    color="success"
                    sx={{ ml: 1 }}
                  />
                </Tooltip>
              )}
            </Box>
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Real-time voice communication with Twilio
          </Typography>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Audio Permission Prompt */}
        <Box sx={{ mb: 3, display: !audioPermissionGranted ? 'block' : 'none' }}>
          <Alert
            severity="info"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={ensureAudioPermissions}
              >
                Enable Audio
              </Button>
            }
          >
            Click to enable audio for making and receiving calls
          </Alert>
        </Box>
        
        {/* Tabs for Call Monitor and Recordings */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
            <Tab label="Call Monitor" />
            {['admin', 'superadmin', 'manager'].includes(userRole) && (
              <Tab label="Recordings" />
            )}
          </Tabs>
        </Box>
        
        {/* Tab Panel 0: Call Monitor */}
        {currentTab === 0 && (
        <>
        <Grid container spacing={3}>
          {/* Agent presence + queue status */}
          <Grid item xs={12}>
            <Card 
              sx={{
                background: theme => theme.palette.mode === 'dark' 
                  ? 'linear-gradient(135deg, #4a5e8c 0%, #5a4d7c 100%)' 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Background decoration */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  zIndex: 0
                }}
              />
              
              <CardHeader
                title={
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
                    Agent Presence
                  </Typography>
                }
                subheader={
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    Control your availability for inbound calls
                  </Typography>
                }
                sx={{ position: 'relative', zIndex: 1 }}
              />
              
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Grid container spacing={2}>
                  {/* Status Control Card */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Card 
                      sx={{ 
                        bgcolor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        height: '100%'
                      }}
                    >
                      <CardContent>
                        <Typography variant="caption" color="text.secondary" gutterBottom sx={{ display: 'block' }}>
                          Your Status
                        </Typography>
                        <FormControl fullWidth size="small">
                          <Select
                            value={agentStatus}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            disabled={!agentRegistered}
                            sx={{ 
                              '& .MuiSelect-select': { 
                                display: 'flex', 
                                alignItems: 'center',
                                gap: 1
                              }
                            }}
                          >
                            <MenuItem value="available">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <FiberManualRecordIcon sx={{ fontSize: 12, color: 'success.main' }} />
                                Available
                              </Box>
                            </MenuItem>
                            <MenuItem value="away">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <FiberManualRecordIcon sx={{ fontSize: 12, color: 'warning.main' }} />
                                Away
                              </Box>
                            </MenuItem>
                            <MenuItem value="busy">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <FiberManualRecordIcon sx={{ fontSize: 12, color: 'error.main' }} />
                                Busy
                              </Box>
                            </MenuItem>
                          </Select>
                        </FormControl>
                        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
                          <Chip
                            size="small"
                            icon={<FiberManualRecordIcon sx={{ fontSize: 10 }} />}
                            label={agentStatus.charAt(0).toUpperCase() + agentStatus.slice(1)}
                            color={statusColorMap[agentStatus] || 'default'}
                            sx={{ fontSize: '0.75rem', fontWeight: 500 }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Connection Status Card */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Card 
                      sx={{ 
                        bgcolor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        height: '100%'
                      }}
                    >
                      <CardContent>
                        <Typography variant="caption" color="text.secondary" gutterBottom sx={{ display: 'block' }}>
                          Connection
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                          <Avatar
                            sx={{
                              width: 56,
                              height: 56,
                              bgcolor: agentRegistered ? 'success.light' : 'grey.300'
                            }}
                          >
                            <PhoneIcon sx={{ fontSize: 28 }} />
                          </Avatar>
                        </Box>
                        <Box sx={{ mt: 1.5, textAlign: 'center' }}>
                          <Chip
                            size="small"
                            label={agentRegistered ? '📱 Registered' : 'Offline'}
                            color={agentRegistered ? 'success' : 'default'}
                            variant={agentRegistered ? 'filled' : 'outlined'}
                            sx={{ fontWeight: 500 }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Activity Metrics Card */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Card 
                      sx={{ 
                        bgcolor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        height: '100%'
                      }}
                    >
                      <CardContent>
                        <Typography variant="caption" color="text.secondary" gutterBottom sx={{ display: 'block' }}>
                          Your Calls
                        </Typography>
                        <Box sx={{ textAlign: 'center', mt: 1 }}>
                          <Typography variant="h2" color="primary.main" sx={{ fontWeight: 700 }}>
                            {agentActiveCalls}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Active {agentActiveCalls !== 1 ? 'calls' : 'call'}
                          </Typography>
                        </Box>
                        {agentActiveCalls > 0 && (
                          <Box sx={{ mt: 1, textAlign: 'center' }}>
                            <Chip
                              size="small"
                              label="In Call"
                              color="warning"
                              icon={<PhoneInTalkIcon sx={{ fontSize: 14 }} />}
                            />
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Team Status Card */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Card 
                      sx={{ 
                        bgcolor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        height: '100%'
                      }}
                    >
                      <CardContent>
                        <Typography variant="caption" color="text.secondary" gutterBottom sx={{ display: 'block' }}>
                          Team Status
                        </Typography>
                        <Box sx={{ textAlign: 'center', mt: 1 }}>
                          <Typography variant="h2" sx={{ fontWeight: 700, color: 'success.main' }}>
                            {availableAgentCount}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Available agents
                          </Typography>
                        </Box>
                        {queueMetrics.size > 0 && (
                          <Box sx={{ mt: 1.5, textAlign: 'center' }}>
                            <Chip
                              size="small"
                              label={`${queueMetrics.size} waiting`}
                              color="warning"
                              variant="outlined"
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                              Oldest: {queueMetrics.oldestAgeSeconds}s
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          {/* Call Controls */}
          <Grid item xs={12} md={6} lg={6}>
            <Card>
              <CardHeader
                title="Call Controls"
                action={
                  <IconButton onClick={() => setSettingsOpen(true)}>
                    <SettingsIcon />
                  </IconButton>
                }
              />
              <CardContent>
                {activeCall ? (
                  <>
                    <Card
                      sx={{
                        bgcolor: activeCall.status === 'hold' ? 'warning.lighter' : 'success.lighter',
                        border: 2,
                        borderColor: activeCall.status === 'hold' ? 'warning.main' : 'success.main',
                        p: 3
                    }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      {/* Larger Avatar */}
                      <Avatar
                        sx={{
                          width: 120,
                          height: 120,
                          mx: 'auto',
                          mb: 2,
                          bgcolor: activeCall.direction === 'incoming' ? 'primary.main' : 'secondary.main'
                        }}
                      >
                        <PhoneIcon sx={{ fontSize: 60 }} />
                      </Avatar>

                      {/* Call Info */}
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {activeCall.direction === 'outgoing' ? 'Calling' : 'Call from'}
                      </Typography>
                      <Typography variant="h3" gutterBottom sx={{ fontWeight: 600 }}>
                        {activeCall.number}
                      </Typography>

                      {/* Call Duration Chip */}
                      <Chip
                        label={getCallDuration(activeCall)}
                        color={activeCall.status === 'hold' ? 'warning' : 'success'}
                        size="large"
                        sx={{
                          fontSize: '1.25rem',
                          py: 2.5,
                          px: 3,
                          fontWeight: 600,
                          mb: 2
                        }}
                      />

                      {/* Volume Control */}
                      <Box sx={{ px: 4, mb: 3 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Typography variant="body2" color="text.secondary">
                            Volume
                          </Typography>
                          <Box sx={{ flex: 1 }}>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={callVolume}
                              onChange={(e) => {
                                const vol = Number(e.target.value);
                                setCallVolume(vol);
                                localStorage.setItem('call_volume', vol.toString());
                                // Apply volume to audio element
                                if (remoteAudioRef.current) {
                                  remoteAudioRef.current.volume = vol / 100;
                                }
                              }}
                              style={{ width: '100%' }}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 45 }}>
                            {callVolume}%
                          </Typography>
                        </Stack>
                      </Box>

                      {/* Secondary Controls */}
                      <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 2 }}>
                        <Button
                          variant="outlined"
                          startIcon={<DialpadIcon />}
                          onClick={() => setDtmfDialogOpen(true)}
                          size="large"
                        >
                          Keypad
                        </Button>

                        <Button
                          variant="outlined"
                          startIcon={activeCall.status === 'hold' ? <ResumeIcon /> : <PauseIcon />}
                          onClick={activeCall.status === 'hold' ? handleResumeCall : handleHoldCall}
                          size="large"
                          color={activeCall.status === 'hold' ? 'warning' : 'primary'}
                        >
                          {activeCall.status === 'hold' ? 'Resume' : 'Hold'}
                        </Button>

                        <Button
                          variant="outlined"
                          startIcon={<TransferIcon />}
                          onClick={() => setTransferDialogOpen(true)}
                          size="large"
                        >
                          Transfer
                        </Button>
                      </Stack>

                      {/* Primary Hangup Button */}
                      <Button
                        variant="contained"
                        color="error"
                        size="large"
                        startIcon={<CallEndIcon />}
                        onClick={handleHangup}
                        fullWidth
                        sx={{
                          py: 2,
                          fontSize: '1.1rem',
                          fontWeight: 600
                        }}
                      >
                        End Call
                      </Button>
                    </Box>
                  </Card>
                  
                  {/* Customer Information Card (Phase 1.3) */}
                  <Card sx={{ mt: 2 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon color="primary" />
                          Customer Information
                        </Typography>
                        
                        {customerLoading ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 3 }}>
                            <CircularProgress size={24} sx={{ mr: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              Looking up customer...
                            </Typography>
                          </Box>
                        ) : customerInfo ? (
                          <Box>
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                              <Grid item xs={12}>
                                <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                  {customerInfo.firstName} {customerInfo.lastName}
                                </Typography>
                              </Grid>
                              
                              {customerInfo.email && (
                                <Grid item xs={12}>
                                  <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                                  <Typography variant="body2">{customerInfo.email}</Typography>
                                </Grid>
                              )}
                              
                              {customerInfo.phoneNumber && (
                                <Grid item xs={12}>
                                  <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                                  <Typography variant="body2">{customerInfo.phoneNumber}</Typography>
                                </Grid>
                              )}
                              
                              {customerInfo.address && (
                                <Grid item xs={12}>
                                  <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                                  <Typography variant="body2">{customerInfo.address}</Typography>
                                </Grid>
                              )}
                              
                              {customerInfo.customerType && (
                                <Grid item xs={12}>
                                  <Typography variant="subtitle2" color="text.secondary">Type</Typography>
                                  <Chip label={customerInfo.customerType}                              />
                                </Grid>
                              )}
                            </Grid>
                            
                            {customerCallHistory && customerCallHistory.length > 0 && (
                              <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Recent Call History ({customerCallHistory.length})
                                </Typography>
                                <List dense>
                                  {customerCallHistory.slice(0, 3).map((call, idx) => (
                                    <ListItem key={idx} sx={{ px: 0 }}>
                                      <ListItemText
                                        primary={`${call.direction || 'Unknown'} - ${call.status || 'Unknown'}`}
                                        secondary={`${new Date(call.createdAt).toLocaleDateString()} at ${new Date(call.createdAt).toLocaleTimeString()}`}
                                      />
                                    </ListItem>
                                  ))}
                                </List>
                              </Box>
                            )}
                          </Box>
                        ) : (
                          <Alert severity="info" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                              No customer found for this phone number
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                              Customer database may not have this number registered yet
                            </Typography>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Box sx={{ mt: 1 }}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      placeholder="Enter phone number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      sx={{ mb: 2 }}
                      disabled={loading || activeCall}
                      error={activeCall ? true : false}
                      helperText={activeCall ? 'Finish current call before making new calls' : ''}
                    />
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      disabled={connectionStatus !== 'connected' || loading}
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CallIcon />}
                      onClick={handleMakeCall}
                      sx={{ mb: 2 }}
                    >
                      {loading ? 'Connecting...' : 'Make Call'}
                    </Button>
                    {connectionStatus !== 'connected' && !loading && (
                      <Typography variant="caption" color="text.secondary">
                        You must be connected to make calls
                      </Typography>
                    )}
                    {loading && (
                      <Alert severity="info" sx={{ mt: 1 }}>
                        <Typography variant="caption">
                          Initiating call, please wait...
                        </Typography>
                      </Alert>
                    )}
                    <Box sx={{ mt: 2 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        color={connectionStatus === 'connected' ? 'success' : 'primary'}
                        disabled={testMode || loading}
                        onClick={async () => {
                          if (connectionStatus === 'connected') {
                            try {
                              setLoading(true);
                              await voipService.unregister();
                              setConnectionStatus('disconnected');
                              enqueueSnackbar('Disconnected from VoIP service', { variant: 'info' });
                            } catch (err) {
                              enqueueSnackbar('Failed to disconnect: ' + err.message, { variant: 'error' });
                            } finally {
                              setLoading(false);
                            }
                          } else {
                            try {
                              setLoading(true);
                              setError(null);
                              await voipService.initialize();
                              setConnectionStatus('connected');
                              enqueueSnackbar('Connected to voice service', { variant: 'success' });
                            } catch (err) {
                              setConnectionStatus('error');
                              setError(err.message);
                              enqueueSnackbar('Failed to connect: ' + err.message, { variant: 'error' });
                            } finally {
                              setLoading(false);
                            }
                          }
                        }}
                      >
                        {connectionStatus === 'connected' ? 'Disconnect' : 'Connect'}
                      </Button>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>

            <Box sx={{ mt: 3 }}>
              <Paper sx={{ p: 3, bgcolor: 'primary.lighter' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <InfoIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="subtitle1" fontWeight={600}>
                    Quick Tips
                  </Typography>
                </Box>
                <Typography variant="body2" paragraph sx={{ mb: 1 }}>
                  ✓ <strong>Making Calls:</strong> Enter phone number in international format (+44...)
                </Typography>
                <Typography variant="body2" paragraph sx={{ mb: 1 }}>
                  ✓ <strong>Inbound Calls:</strong> Answer calls directly from browser notifications
                </Typography>
                <Typography variant="body2" paragraph sx={{ mb: 1 }}>
                  ✓ <strong>Call Controls:</strong> Use hold, resume, transfer, and DTMF during active calls
                </Typography>
                <Typography variant="body2" paragraph sx={{ mb: 1 }}>
                  ✓ <strong>Audio Test:</strong> Test microphone and speakers before making calls
                </Typography>
                <Typography variant="body2" paragraph sx={{ mb: 1 }}>
                  ✓ <strong>Volume:</strong> Adjust call volume (0-100%) in settings
                </Typography>
                <Typography variant="body2" sx={{ mb: 0 }}>
                  ✓ <strong>Test Mode:</strong> Enable test mode for UI testing without real calls
                </Typography>
              </Paper>
            </Box>
          </Grid>

          <Grid item xs={12} md={6} lg={6}>
            <Card>
              <CardHeader
                title="Call History"
                action={
                  <IconButton onClick={() => setCallHistory(voipService.getCallHistory())}>
                    <RefreshIcon />
                  </IconButton>
                }
              />
              <Scrollbar sx={{ height: 400 }}>
                <List disablePadding>
                  {callHistory.length > 0 ? (
                    callHistory.map((call) => (
                      <ListItem
                        key={call.id}
                        divider
                        secondaryAction={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(call.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                            {call.duration > 0 && (
                              <Typography variant="caption" sx={{ display: 'block', textAlign: 'right' }}>
                                {Math.floor(call.duration / 60)}:{(call.duration % 60).toString().padStart(2, '0')}
                              </Typography>
                            )}
                          </Box>
                        }
                      >
                        <ListItemAvatar>
                          <Avatar sx={{
                            bgcolor:
                              call.direction === 'incoming'
                                ? call.status === 'ended' ? 'success.light' : 'primary.light'
                                : 'secondary.light'
                          }}>
                            {call.direction === 'incoming' ? <PhoneIcon /> : <CallIcon />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={call.number}
                          secondary={
                            <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.primary"
                                sx={{ mr: 1 }}
                              >
                                {call.direction === 'incoming' ? 'Incoming' : 'Outgoing'}
                              </Typography>
                              <Label
                                color={
                                  call.status === 'active' ? 'success' :
                                    call.status === 'ringing' ? 'warning' :
                                      call.status === 'hold' ? 'info' :
                                        call.status === 'ended' ? 'default' : 'error'
                                }
                              >
                                {call.status.charAt(0).toUpperCase() + call.status.slice(1)}
                              </Label>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemText
                        primary="No call history"
                        secondary="Call history will appear here"
                        sx={{ textAlign: 'center', py: 4 }}
                      />
                    </ListItem>
                  )}
                </List>
              </Scrollbar>
            </Card>
          </Grid>
        </Grid>

        {/* Live Call Activity Stream (Admin Only) */}
        {['admin', 'superadmin', 'support', 'supervisor', 'manager'].includes(userRole) && (
          <Card sx={{ mt: 3 }}>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6">Live Call Activity</Typography>
                  <Tooltip
                    title={
                      <Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Real-time call monitoring</strong>
                        </Typography>
                        <Typography variant="caption" component="div" sx={{ mb: 0.5 }}>
                          • Monitor all calls across your organization
                        </Typography>
                        <Typography variant="caption" component="div" sx={{ mb: 0.5 }}>
                          • See call status, direction, and timestamps
                        </Typography>
                        <Typography variant="caption" component="div" sx={{ mb: 0.5 }}>
                          • Track agent activity and performance
                        </Typography>
                        <Typography variant="caption" component="div">
                          • Available to admin roles only
                        </Typography>
                      </Box>
                    }
                    arrow
                    placement="top"
                  >
                    <InfoIcon sx={{ fontSize: 18, color: 'text.secondary', cursor: 'help' }} />
                  </Tooltip>
                </Box>
              }
              avatar={
                <Badge badgeContent={callActivity.length} color="primary" max={99}>
                  <NotificationsActiveIcon color="action" />
                </Badge>
              }
              action={
                <Chip
                  icon={<FiberManualRecordIcon sx={{ fontSize: '0.75rem' }} />}
                  label="Live"
                  size="small"
                  color="success"
                  variant="outlined"
                />
              }
            />
            <CardContent>
              {/* Filter Controls */}
              <Box sx={{ mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  {/* Search Bar */}
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Search by phone or CallSid..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      InputProps={{
                        startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  
                  {/* Status Filter */}
                  <Grid item xs={6} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={statusFilter}
                        label="Status"
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="initiated">Initiated</MenuItem>
                        <MenuItem value="ringing">Ringing</MenuItem>
                        <MenuItem value="in-progress">In-Progress</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="failed">Failed</MenuItem>
                        <MenuItem value="no-answer">No-Answer</MenuItem>
                        <MenuItem value="busy">Busy</MenuItem>
                        <MenuItem value="canceled">Canceled</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {/* Direction Filter */}
                  <Grid item xs={6} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Direction</InputLabel>
                      <Select
                        value={directionFilter}
                        label="Direction"
                        onChange={(e) => setDirectionFilter(e.target.value)}
                      >
                        <MenuItem value="all">All Directions</MenuItem>
                        <MenuItem value="inbound">Inbound</MenuItem>
                        <MenuItem value="outbound">Outbound</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {/* Time Range Filter */}
                  <Grid item xs={6} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Time Range</InputLabel>
                      <Select
                        value={timeRangeFilter}
                        label="Time Range"
                        onChange={(e) => setTimeRangeFilter(e.target.value)}
                      >
                        <MenuItem value="all">All Time</MenuItem>
                        <MenuItem value="1h">Last 1 Hour</MenuItem>
                        <MenuItem value="4h">Last 4 Hours</MenuItem>
                        <MenuItem value="today">Today</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {/* Action Buttons */}
                  <Grid item xs={6} md={2}>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Clear Filters">
                        <IconButton 
                          size="small"
                          onClick={() => {
                            setStatusFilter('all');
                            setDirectionFilter('all');
                            setSearchQuery('');
                            setTimeRangeFilter('all');
                          }}
                        >
                          <ClearIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Export to CSV">
                        <IconButton
                          size="small"
                          onClick={handleExportCallActivity}
                        >
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Grid>
                </Grid>
                
                {/* Results Summary */}
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Showing {filteredCallActivity.length} of {callActivity.length} events
                  </Typography>
                  
                  {(statusFilter !== 'all' || directionFilter !== 'all' || searchQuery || timeRangeFilter !== 'all') && (
                    <Chip
                      size="small"
                      label="Filters Active"
                      color="primary"
                      variant="outlined"
                      onDelete={() => {
                        setStatusFilter('all');
                        setDirectionFilter('all');
                        setSearchQuery('');
                        setTimeRangeFilter('all');
                      }}
                    />
                  )}
                </Box>
              </Box>
              
              {/* Call Activity List - Modern Design */}
              <Box sx={{ maxHeight: '500px', overflow: 'auto', px: 1 }}>
                {filteredCallActivity.length > 0 ? (
                  <Stack spacing={1.5}>
                  {filteredCallActivity.map((event, index) => (
                    <Paper
                      key={index}
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        background: theme => 
                          event.CallStatus === 'in-progress' ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(76, 175, 80, 0.02) 100%)' :
                          event.CallStatus === 'queued' ? 'linear-gradient(135deg, rgba(255, 152, 0, 0.05) 0%, rgba(255, 152, 0, 0.02) 100%)' :
                          event.CallStatus === 'ringing' ? 'linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, rgba(33, 150, 243, 0.02) 100%)' :
                          'transparent',
                        '&:hover': {
                          borderColor: 'primary.main',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                      onClick={() => handleViewCallDetails(event)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        {/* Status Indicator */}
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: theme =>
                              event.CallStatus === 'in-progress' ? 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)' :
                              event.CallStatus === 'queued' ? 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)' :
                              event.CallStatus === 'ringing' || event.CallStatus === 'initiated' ? 'linear-gradient(135deg, #2196F3 0%, #42A5F5 100%)' :
                              event.CallStatus === 'dequeued' ? 'linear-gradient(135deg, #00BCD4 0%, #26C6DA 100%)' :
                              event.CallStatus === 'completed' ? 'linear-gradient(135deg, #9E9E9E 0%, #BDBDBD 100%)' :
                              'linear-gradient(135deg, #F44336 0%, #EF5350 100%)',
                            color: 'white',
                            fontSize: '1.2rem',
                            flexShrink: 0,
                            animation: (event.CallStatus === 'ringing' || event.CallStatus === 'queued') ? 'pulse 2s ease-in-out infinite' : 'none',
                            '@keyframes pulse': {
                              '0%, 100%': { boxShadow: '0 0 0 0 rgba(33, 150, 243, 0.4)' },
                              '50%': { boxShadow: '0 0 0 8px rgba(33, 150, 243, 0)' }
                            }
                          }}
                        >
                          {event.From && event.From.startsWith('client:') ? '📤' : '📥'}
                        </Box>

                        {/* Call Details */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          {/* Primary Info */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="body1" fontWeight={600} sx={{ color: 'text.primary' }}>
                              {event.From?.replace('client:', '') || 'Unknown'}
                            </Typography>
                            <Box
                              sx={{
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'action.hover',
                                fontSize: '0.7rem'
                              }}
                            >
                              →
                            </Box>
                            <Typography variant="body1" fontWeight={600} sx={{ color: 'text.primary' }}>
                              {event.To || 'Unknown'}
                            </Typography>
                          </Box>

                          {/* Status and Badges */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', mb: 1 }}>
                            <Chip
                              label={event.CallStatus}
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                bgcolor: theme =>
                                  event.CallStatus === 'in-progress' ? 'success.main' :
                                  event.CallStatus === 'queued' ? 'warning.main' :
                                  event.CallStatus === 'ringing' || event.CallStatus === 'initiated' ? 'info.main' :
                                  event.CallStatus === 'dequeued' ? 'info.light' :
                                  event.CallStatus === 'completed' ? 'grey.400' : 'error.main',
                                color: 'white'
                              }}
                            />
                            
                            {event.CallStatus === 'completed' && event.Duration && Number(event.Duration) >= 3 && (
                              <Chip
                                icon={<MicIcon sx={{ fontSize: '0.65rem', color: 'white' }} />}
                                label="Recorded"
                                size="small"
                                sx={{
                                  height: 22,
                                  fontSize: '0.65rem',
                                  fontWeight: 600,
                                  bgcolor: '#4CAF50',
                                  color: 'white'
                                }}
                              />
                            )}
                            
                            {event.Duration && (
                              <Chip
                                label={`${Math.floor(Number(event.Duration) / 60)}:${String(Number(event.Duration) % 60).padStart(2, '0')}`}
                                size="small"
                                sx={{
                                  height: 22,
                                  fontSize: '0.65rem',
                                  fontWeight: 600,
                                  bgcolor: 'rgba(0,0,0,0.04)',
                                  color: 'text.secondary'
                                }}
                              />
                            )}
                          </Box>

                          {/* Metadata */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Box component="span" sx={{ fontSize: '0.9rem' }}>🕒</Box>
                              {new Date(event.Timestamp).toLocaleTimeString()}
                            </Typography>
                            {event.Agent && (
                              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Box component="span" sx={{ fontSize: '0.9rem' }}>👤</Box>
                                {event.Agent.replace('user_', '').split('@')[0]}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                  </Stack>
                ) : (
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 8,
                      px: 3
                    }}
                  >
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'action.hover',
                        mx: 'auto',
                        mb: 2,
                        fontSize: '2rem'
                      }}
                    >
                      📞
                    </Box>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      {callActivity.length > 0 ? 'No matching calls' : 'No call activity yet'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {callActivity.length > 0 
                        ? 'Try adjusting your filters' 
                        : 'Call events will appear here in real-time'}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        )}
        {/* End of Call Monitor Tab */}
        </>
        )}
        
        {/* Tab Panel 1: Recordings */}
        {currentTab === 1 && ['admin', 'superadmin', 'manager'].includes(userRole) && (
          <Box>
            <Card>
              <CardHeader
                title="Call Recordings"
                subheader={`${recordings?.length || 0} recordings available`}
                action={
                  <Button
                    startIcon={<RefreshIcon />}
                    onClick={fetchRecordings}
                    disabled={recordingsLoading}
                  >
                    Refresh
                  </Button>
                }
              />
              <CardContent>
                {recordingsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : !recordings || recordings.length === 0 ? (
                  <Alert severity="info">
                    No recordings available yet. Recordings appear here after calls are completed.
                  </Alert>
                ) : (
                  <List>
                    {(recordings || []).map((call) => (
                      <ListItem
                        key={call.callSid}
                        divider
                        sx={{
                          flexDirection: 'column',
                          alignItems: 'stretch',
                          py: 2
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, width: '100%' }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              <MicIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle1">
                                  {call.from && call.from.startsWith('client:') ? '📤 Outgoing' : '📥 Incoming'}
                                </Typography>
                                <Chip
                                  label={`${Math.floor(call.duration / 60)}:${(call.duration % 60).toString().padStart(2, '0')}`}
                                  size="small"
                                  sx={{ ml: 1 }}
                                />
                              </Box>
                            }
                            secondary={
                              <React.Fragment>
                                <Typography component="span" variant="body2" color="text.primary">
                                  From: {call.from} → To: {call.to}
                                </Typography>
                                <br />
                                <Typography component="span" variant="caption" color="text.secondary">
                                  {new Date(call.createdAt).toLocaleString()}
                                </Typography>
                              </React.Fragment>
                            }
                          />
                        </Box>
                        
                        {call.recording && call.recording.status === 'available' && call.recording.s3Url && (
                          <Box sx={{ width: '100%' }}>
                            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                label="Recording Available"
                                color="success"
                                size="small"
                                icon={<MicIcon />}
                              />
                              <Typography variant="caption" color="text.secondary">
                                Duration: {Math.floor(call.recording.duration / 60)}:{(call.recording.duration % 60).toString().padStart(2, '0')}
                              </Typography>
                            </Box>
                            <audio
                              controls
                              style={{ width: '100%', maxHeight: '40px', marginBottom: '8px' }}
                              src={call.recording.s3Url}
                            />
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<DownloadIcon />}
                                href={call.recording.s3Url}
                                download
                                target="_blank"
                                disabled={recordingsLoading}
                              >
                                Download Recording
                              </Button>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteRecording(call.callSid)}
                                title="Delete recording"
                                disabled={recordingsLoading}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </Box>
                        )}
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Unauthorized Access Message for Recordings Tab */}
        {currentTab === 1 && !['admin', 'superadmin', 'manager'].includes(userRole) && (
          <Card>
            <CardContent>
              <Alert severity="warning">
                <Typography variant="subtitle1" gutterBottom>
                  Access Restricted
                </Typography>
                <Typography variant="body2">
                  Call recordings are only accessible to Managers, Admins, and Super Admins.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Settings Dialog - Simplified for Twilio */}
        <Dialog
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          disableRestoreFocus={false}
          disableEnforceFocus={false}
          disableAutoFocus={false}
          keepMounted={false}
          aria-labelledby="settings-dialog-title"
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle id="settings-dialog-title">Voice Settings</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              {/* Test Mode Toggle */}
              <FormControlLabel
                control={
                  <Switch
                    checked={testMode}
                    onChange={(e) => handleTestModeToggle(e.target.checked)}
                  />
                }
                label="Test Mode (simulates calls without real connection)"
                sx={{ mb: 3, display: 'block' }}
              />

              {/* Volume Control */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Call Volume
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 40 }}>
                    0%
                  </Typography>
                  <Box sx={{ flex: 1 }}>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={callVolume}
                      onChange={(e) => {
                        const vol = Number(e.target.value);
                        setCallVolume(vol);
                        localStorage.setItem('call_volume', vol.toString());
                      }}
                      style={{ width: '100%' }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 40 }}>
                    100%
                  </Typography>
                  <Chip label={`${callVolume}%`} size="small" color="primary" />
                </Stack>
              </Box>

              {/* Audio Device Test */}
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  startIcon={<SettingsVoiceIcon />}
                  onClick={() => {
                    setShowDeviceTest(true);
                    testAudioDevices();
                  }}
                >
                  Test Audio Devices
                </Button>
              </Box>

              {/* Info Box */}
              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  Voice calls are powered by Twilio. No additional configuration needed.
                </Typography>
              </Alert>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSettingsOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* DTMF Dialog */}
        <Dialog
          open={dtmfDialogOpen}
          onClose={() => setDtmfDialogOpen(false)}
          aria-labelledby="dtmf-dialog-title"
        >
          <DialogTitle id="dtmf-dialog-title">Dial Pad</DialogTitle>
          <DialogContent>
            <Box sx={{ p: 2, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(key => (
                <Button
                  key={key}
                  variant="outlined"
                  sx={{ height: 60, fontSize: '1.2rem' }}
                  onClick={() => handleSendDTMF(key)}
                >
                  {key}
                </Button>
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDtmfDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Transfer Dialog */}
        <Dialog
          open={transferDialogOpen}
          onClose={() => setTransferDialogOpen(false)}
          aria-labelledby="transfer-dialog-title"
        >
          <DialogTitle id="transfer-dialog-title">Transfer Call</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              margin="dense"
              label="Transfer Number"
              value={transferNumber}
              onChange={(e) => setTransferNumber(e.target.value)}
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTransferDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleTransferCall} variant="contained">Transfer</Button>
          </DialogActions>
        </Dialog>

        {/* Audio Device Test Dialog */}
        <Dialog
          open={showDeviceTest}
          onClose={() => {
            // Cleanup audio test resources
            setShowDeviceTest(false);
            
            if (testAudioStream) {
              testAudioStream.getTracks().forEach(track => track.stop());
              setTestAudioStream(null);
            }
            
            if (audioContextRef.current) {
              try {
                if (scriptProcessorRef.current) {
                  scriptProcessorRef.current.onaudioprocess = null;
                  scriptProcessorRef.current.disconnect();
                  scriptProcessorRef.current = null;
                }
                if (audioSourceRef.current) {
                  audioSourceRef.current.disconnect();
                  audioSourceRef.current = null;
                }
                // Only close if not already closed
                if (audioContextRef.current.state !== 'closed') {
                  audioContextRef.current.close();
                }
                audioContextRef.current = null;
              } catch (e) {
                console.error('Error cleaning up audio test:', e);
              }
            }
            
            setAudioLevel(0);
          }}
          aria-labelledby="device-test-dialog-title"
          disableEnforceFocus // Prevents focus trapping issues
          keepMounted={false} // Ensures cleanup when closed
        >
          <DialogTitle id="device-test-dialog-title">Audio Device Test</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 2 }}>
              <Typography variant="body2">
                Speak into your microphone to test audio input.
                You should see the audio level indicator move.
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(audioLevel * 2, 100)}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                  <Typography variant="body2" color="text.secondary">
                    {Math.round(audioLevel)}%
                  </Typography>
                </Box>
              </Box>

              <Button
                variant="outlined"
                onClick={() => {
                  // Generate test tone programmatically instead of loading a file
                  try {
                    const audioContext = new AudioContext();

                    // Create a more pleasant sound than a simple beep
                    const oscillator1 = audioContext.createOscillator();
                    oscillator1.type = 'sine';
                    oscillator1.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note

                    const oscillator2 = audioContext.createOscillator();
                    oscillator2.type = 'sine';
                    oscillator2.frequency.setValueAtTime(550, audioContext.currentTime); // Approx C#5

                    // Set volume for both oscillators
                    const gainNode1 = audioContext.createGain();
                    gainNode1.gain.value = 0.5; // 50% volume

                    const gainNode2 = audioContext.createGain();
                    gainNode2.gain.value = 0.3; // 30% volume

                    // Connect everything
                    oscillator1.connect(gainNode1);
                    oscillator2.connect(gainNode2);
                    gainNode1.connect(audioContext.destination);
                    gainNode2.connect(audioContext.destination);

                    // Play a pleasant chord
                    oscillator1.start();
                    oscillator2.start();
                    setTimeout(() => {
                      oscillator1.stop();
                      oscillator2.stop();
                    }, 1000);

                    enqueueSnackbar('Playing test sound', { variant: 'info' });
                  } catch (err) {
                    console.error('Failed to play test sound:', err);
                    enqueueSnackbar('Failed to play test sound', { variant: 'error' });
                  }
                }}
              >
                Test Speakers
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                sx={{ mt: 1 }}
                onClick={() => {
                  if (!testAudioStream) {
                    enqueueSnackbar('No microphone available', { variant: 'error' });
                    return;
                  }

                  try {
                    const audioContext = new AudioContext();
                    if (audioContext.state === 'suspended') {
                      audioContext.resume().then(() => {
                        console.log('AudioContext resumed');
                      });
                    }

                    // Create a gain node to prevent feedback
                    const gainNode = audioContext.createGain();
                    gainNode.gain.value = 0.5; // 50% volume to prevent feedback

                    // Connect microphone to speakers
                    const source = audioContext.createMediaStreamSource(testAudioStream);
                    source.connect(gainNode);
                    gainNode.connect(audioContext.destination);

                    // Give user feedback
                    enqueueSnackbar('Now hearing your microphone (3 seconds)', { variant: 'info' });

                    // Auto disconnect after 3 seconds to prevent feedback
                    setTimeout(() => {
                      source.disconnect();
                      gainNode.disconnect();
                      enqueueSnackbar('Microphone test completed', { variant: 'info' });
                    }, 3000);
                  } catch (err) {
                    console.error('Failed to test microphone playback:', err);
                    enqueueSnackbar('Failed to test microphone', { variant: 'error' });
                  }
                }}
              >
                Hear My Microphone
              </Button>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', px: 3 }}>
              {testAudioStream ?
                `Microphone: ${testAudioStream.getAudioTracks().map(t => t.label || 'Default device').join(', ')}` :
                'No microphone detected'}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setShowDeviceTest(false);
              if (testAudioStream) {
                testAudioStream.getTracks().forEach(track => track.stop());
                setTestAudioStream(null);
              }
            }}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Call Details Dialog */}
        <Dialog
          open={callDetailsOpen}
          onClose={() => setCallDetailsOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Call Event Details
            <IconButton
              onClick={() => setCallDetailsOpen(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {selectedCallEvent && (
              <Box>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Call SID"
                      secondary={selectedCallEvent.CallSid}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="From"
                      secondary={selectedCallEvent.From}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="To"
                      secondary={selectedCallEvent.To}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Status"
                      secondary={
                        <Chip
                          label={selectedCallEvent.CallStatus}
                          size="small"
                          color={
                            selectedCallEvent.CallStatus === 'initiated' || selectedCallEvent.CallStatus === 'ringing' ? 'info' :
                            selectedCallEvent.CallStatus === 'in-progress' ? 'success' :
                            selectedCallEvent.CallStatus === 'completed' ? 'default' : 'warning'
                          }
                        />
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Direction"
                      secondary={
                        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                          {selectedCallEvent.Direction === 'inbound' ? '📥' : '📤'}
                          <Box component="span">
                            {selectedCallEvent.Direction === 'inbound' ? 'Incoming' : 'Outgoing'}
                          </Box>
                        </Box>
                      }
                      secondaryTypographyProps={{ component: 'span' }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Timestamp"
                      secondary={new Date(selectedCallEvent.Timestamp).toLocaleString()}
                    />
                  </ListItem>
                  {selectedCallEvent.Duration && (
                    <ListItem>
                      <ListItemText
                        primary="Duration"
                        secondary={`${Math.floor(selectedCallEvent.Duration / 60)}:${(selectedCallEvent.Duration % 60).toString().padStart(2, '0')}`}
                      />
                    </ListItem>
                  )}
                  
                  {/* Recording Section */}
                  {selectedCallEvent.recording && (
                    <>
                      <ListItem>
                        <ListItemIcon>
                          <MicIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Call Recording"
                          secondary={
                            <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                              {selectedCallEvent.recording.status === 'available' ? (
                                <Chip
                                  label="Available"
                                  size="small"
                                  color="success"
                                  icon={<MicIcon />}
                                />
                              ) : selectedCallEvent.recording.status === 'processing' ? (
                                <Chip
                                  label="Processing..."
                                  size="small"
                                  color="warning"
                                />
                              ) : (
                                <Chip
                                  label="Error"
                                  size="small"
                                  color="error"
                                />
                              )}
                            </Box>
                          }
                          secondaryTypographyProps={{ component: 'span' }}
                        />
                      </ListItem>
                      
                      {selectedCallEvent.recording.status === 'available' && selectedCallEvent.recording.s3Url && (
                        <ListItem>
                          <Box sx={{ width: '100%' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                              Recording Duration: {Math.floor(selectedCallEvent.recording.duration / 60)}:{(selectedCallEvent.recording.duration % 60).toString().padStart(2, '0')}
                            </Typography>
                            <audio
                              controls
                              style={{ width: '100%', maxHeight: '40px' }}
                              src={selectedCallEvent.recording.s3Url}
                            />
                            <Button
                              size="small"
                              startIcon={<GetAppIcon />}
                              href={selectedCallEvent.recording.s3Url}
                              download
                              sx={{ mt: 1 }}
                            >
                              Download Recording
                            </Button>
                          </Box>
                        </ListItem>
                      )}
                      
                      {selectedCallEvent.recording.status === 'error' && selectedCallEvent.recording.error && (
                        <ListItem>
                          <Alert severity="error" sx={{ width: '100%' }}>
                            <Typography variant="caption">
                              {selectedCallEvent.recording.error}
                            </Typography>
                          </Alert>
                        </ListItem>
                      )}
                    </>
                  )}
                  
                  {/* Show recording status badge if call is completed but no recording yet */}
                  {!selectedCallEvent.recording && selectedCallEvent.CallStatus === 'completed' && (
                    <ListItem>
                      <Alert severity="info" sx={{ width: '100%' }}>
                        <Typography variant="caption">
                          Recording is being processed. It will appear here with a play button once ready (30-60 seconds).
                        </Typography>
                      </Alert>
                    </ListItem>
                  )}
                </List>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCallDetailsOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

      </Container>
      <audio
        ref={remoteAudioRef}
        style={{ display: 'none' }}
        autoPlay
        playsInline
        controls={false}
      />
      <audio
        ref={audioRef}
        style={{ display: 'none' }}
        autoPlay
        playsInline
        controls={false}
      />
      <audio ref={audioTestRef} style={{ display: 'none' }} />
    </Page>
  );
}