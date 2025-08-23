import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  FormControlLabel,
  Switch,
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
  Stack
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
  SettingsVoice as SettingsVoiceIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

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
  const [selectedGateway, setSelectedGateway] = useState('freeswitch');
  const [settings, setSettings] = useState({
    username: '1000',
    password: '1000',
    domain: 'sip.nexc.co.uk',  // Change from IP to domain name
    wsServer: 'sip.nexc.co.uk:7443' // Change from IP to domain name
  });
  const [incomingCall, setIncomingCall] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [callTime, setCallTime] = useState(0);
  const callTimerRef = useRef(null);
  const [testMode, setTestMode] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  // Add this to your component
  const audioRef = useRef(null);

  // Add these states to your component
  const [showDeviceTest, setShowDeviceTest] = useState(false);
  const [testAudioStream, setTestAudioStream] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const audioTestRef = useRef(null);

  // Add this to your CallManagement.js file (near the top of the component)
  const [audioPermissionGranted, setAudioPermissionGranted] = useState(false);

  useEffect(() => {
    // Create one-time permission element
    if (!audioPermissionGranted) {
      const unlockAudio = () => {
        // Create and play a silent audio element
        const silentAudio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA");
        silentAudio.play().then(() => {
          console.log("Audio playback unlocked by user interaction");
          setAudioPermissionGranted(true);
          // Remove event listeners after success
          document.removeEventListener('click', unlockAudio);
          document.removeEventListener('touchstart', unlockAudio);
        }).catch(err => {
          console.warn("Couldn't unlock audio:", err);
        });
      };

      // Add listeners for user interactions
      document.addEventListener('click', unlockAudio);
      document.addEventListener('touchstart', unlockAudio);

      return () => {
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
      };
    }
  }, [audioPermissionGranted]);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('voip_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Failed to parse saved settings:', e);
      }
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

  // Event handlers with useCallback
  const handleIncomingCall = useCallback((call) => {
    setIncomingCall(call);
    enqueueSnackbar(`Incoming call from ${call.number}`, {
      variant: 'info',
      autoHideDuration: 6000
    });
  }, [enqueueSnackbar]);

  const handleCallStatusChange = useCallback((call) => {
    if (call.status === 'active') {
      setActiveCall(call);
      setIncomingCall(null);
    } else if (call.status === 'ended') {
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
      // Don't try to connect if in test mode
      if (testMode) {
        setConnectionStatus('connected'); // Just pretend we're connected in test mode
        return;
      }

      if (!settings.username || !settings.domain || !settings.wsServer) {
        setError('VoIP settings are incomplete. Please configure them.');
        return;
      }

      try {
        setConnectionStatus('connecting');
        setLoading(true);

        console.log('Initializing VoIP service with settings:', settings);
        await voipService.initialize(settings);

        setConnectionStatus('connected');
        setCallHistory(voipService.getCallHistory());
        enqueueSnackbar('Connected to VoIP service', { variant: 'success' });
      } catch (err) {
        console.error('VoIP initialization failed:', err);
        setConnectionStatus('error');
        setError(err.message || 'Failed to connect to VoIP service');
        enqueueSnackbar('Failed to connect to VoIP service', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    initializeVoIP();

    // Set up event listeners
    voipService.on('incomingCall', handleIncomingCall);
    voipService.on('callStatusChanged', handleCallStatusChange);
    voipService.on('registrationStateChanged', handleRegistrationStateChange);

    return () => {
      voipService.removeListener('incomingCall', handleIncomingCall);
      voipService.removeListener('callStatusChanged', handleCallStatusChange);
      voipService.removeListener('registrationStateChanged', handleRegistrationStateChange);
    };
  }, [settings, testMode, enqueueSnackbar, handleIncomingCall, handleCallStatusChange, handleRegistrationStateChange]);

  //Gateway options
  const gatewayOptions = [
    { id: 'custom', name: 'Custom Settings' },
    {
      id: 'freeswitch',
      name: 'NEXC Voice Server', // More professional name
      domain: 'sip.nexc.co.uk',     // Change from IP to domain
      wsServer: 'sip.nexc.co.uk:7443',   // Add port number
      password: '1000'
    },
    {
      id: 'test',
      name: 'Test Mode (No Connection)',
      domain: 'test.local',
      wsServer: 'test.local'
    }
  ];

  // Function to handle gateway selection
  const handleGatewayChange = (event) => {
    const gatewayId = event.target.value;
    setSelectedGateway(gatewayId);

    if (gatewayId === 'test') {
      // Enable test mode when test gateway is selected
      setTestMode(true);
      setConnectionStatus('connected'); // Pretend we're connected in test mode
      return;
    }

    if (gatewayId !== 'custom') {
      const gateway = gatewayOptions.find(g => g.id === gatewayId);
      if (gateway) {
        // Configure settings based on the selected gateway
        setSettings(prev => ({
          ...prev,
          username: gatewayId === 'freeswitch' ? '1000' : prev.username,
          password: gatewayId === 'freeswitch' ? '1000' : prev.password,
          domain: gateway.domain,
          wsServer: gateway.wsServer
        }));
      }
    }
  };

  // Action handlers
  const logAudioState = () => {
    console.log('Audio element states:');
    console.log('remoteAudioRef:', remoteAudioRef.current ? {
      srcObject: remoteAudioRef.current.srcObject ? 'Set' : 'Not set',
      paused: remoteAudioRef.current.paused,
      muted: remoteAudioRef.current.muted,
      volume: remoteAudioRef.current.volume
    } : 'Not available');

    console.log('audioRef:', audioRef.current ? {
      srcObject: audioRef.current.srcObject ? 'Set' : 'Not set',
      paused: audioRef.current.paused,
      muted: audioRef.current.muted,
      volume: audioRef.current.volume
    } : 'Not available');
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

  const handleAnswerCall = async () => {
    try {
      setLoading(true);
      await voipService.answerCall();
      setIncomingCall(null);
    } catch (err) {
      console.error('Failed to answer call:', err);
      enqueueSnackbar(`Failed to answer: ${err.message}`, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectCall = async () => {
    try {
      setLoading(true);
      await voipService.hangupCall();
      setIncomingCall(null);
    } catch (err) {
      console.error('Failed to reject call:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleHangup = async () => {
    try {
      setLoading(true);

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
        await voipService.hangupCall();
      }
    } catch (err) {
      console.error('Failed to hang up:', err);
      enqueueSnackbar(`Hangup failed: ${err.message}`, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const previousTestMode = useRef(testMode);

  // Update when component mounts
  useEffect(() => {
    previousTestMode.current = testMode;
  }, [testMode]);

  // Replace your handleSaveSettings function with this improved version
  const handleSaveSettings = () => {
    // 1. Save settings first to avoid any async issues
    localStorage.setItem('voip_settings', JSON.stringify(settings));

    // 2. Store current values before dialog closes
    const currentTestMode = testMode;
    const previousMode = previousTestMode.current;
    const currentConnectionStatus = connectionStatus;

    // 3. Clear the button from focus to prevent focus issues
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    // 4. Focus a safe element outside the dialog
    document.body.focus();

    // 5. First close the dialog, then handle state updates
    // Using requestAnimationFrame to ensure DOM updates complete first
    requestAnimationFrame(() => {
      setSettingsOpen(false);

      // Once dialog is closing, schedule state updates next frame
      requestAnimationFrame(() => {
        // Handle test mode changes after dialog is fully closed
        if (currentTestMode !== previousMode) {
          if (currentTestMode) {
            // Switching TO test mode
            if (currentConnectionStatus === 'connected') {
              voipService.unregister().catch(err => {
                console.error('Error during disconnect:', err);
              });
            }
            setConnectionStatus('connected'); // Test mode always "connected"
          } else {
            // Switching FROM test mode
            setConnectionStatus('disconnected');
          }
        } else if (!currentTestMode) {
          // If settings changed but still in real mode, reconnect
          setConnectionStatus('disconnected');
        }

        previousTestMode.current = currentTestMode;
      });
    });
  };

  // Add this function to handle dialog keyboard events
  const handleDialogKeyDown = useCallback((e) => {
    // Prevent default behavior for Escape key to avoid focus issues
    if (e.key === 'Escape' && settingsOpen) {
      e.preventDefault();
      setSettingsOpen(false);
    }
  }, [settingsOpen]); // Include settingsOpen as a dependency

  // Update the useEffect with the proper dependency
  useEffect(() => {
    if (settingsOpen) {
      document.addEventListener('keydown', handleDialogKeyDown);
      return () => {
        document.removeEventListener('keydown', handleDialogKeyDown);
      };
    }
  }, [settingsOpen, handleDialogKeyDown]);

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
        setActiveCall(null);
        if (callTimerRef.current) {
          clearInterval(callTimerRef.current);
          callTimerRef.current = null;
        }
        const mockTransferredCall = {
          id: activeCall.id,
          number: activeCall.number,
          direction: activeCall.direction,
          status: 'ended',
          timestamp: activeCall.timestamp,
          duration: callTime,
          transferredTo: transferNumber
        };
        setCallHistory(prev => [mockTransferredCall, ...prev]);
        enqueueSnackbar(`Call transferred to ${transferNumber} (Test Mode)`, { variant: 'info' });
      } else {
        await voipService.transferCall(transferNumber);
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

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings(prevSettings => ({
      ...prevSettings,
      [name]: value
    }));
  };

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
  const remoteAudioRef = useRef(null);

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
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      // Create source from the stream
      const source = audioContext.createMediaStreamSource(stream);

      // Create script processor for raw audio data - this is key for visualization
      const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);
      source.connect(scriptProcessor);
      scriptProcessor.connect(audioContext.destination);

      // Process audio data for level detection
      scriptProcessor.onaudioprocess = (event) => {
        if (!showDeviceTest) return;

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

      // Clean up when dialog closes
      return () => {
        scriptProcessor.disconnect();
        source.disconnect();
        audioContext.close();
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
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
              {testMode && (
                <Chip
                  size="small"
                  label="Test Mode"
                  color="warning"
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Manage and track your calls with integrated WebRTC SIP client
          </Typography>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

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

        {!testMode && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              For WebRTC calls to work properly, please:
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => {
                  const certWindow = window.open('https://sip.nexc.co.uk:7443', '_blank');

                  // Set up a check to see if the user has confirmed the certificate
                  const checkInterval = setInterval(() => {
                    if (certWindow && certWindow.closed) {
                      clearInterval(checkInterval);
                      // Try connecting to VoIP service after certificate is accepted
                      voipService.initialize(settings).then(() => {
                        setConnectionStatus('connected');
                        enqueueSnackbar('Successfully connected to VoIP service', { variant: 'success' });
                      }).catch(err => {
                        console.error('Connection failed:', err);
                        enqueueSnackbar('Connection failed. Please try accepting the certificate again.', {
                          variant: 'error'
                        });
                      });
                    }
                  }, 1000);
                }}
              >
                Step 1: Accept Certificate
              </Button>
              <Typography variant="body2">
                After accepting the certificate in the new window, close it and return here
              </Typography>
            </Stack>
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Call Controls */}
          <Grid item xs={12} md={4}>
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
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" gutterBottom>
                      {activeCall.direction === 'outgoing' ? 'Call to:' : 'Call from:'}
                    </Typography>
                    <Typography variant="h4" gutterBottom>
                      {activeCall.number}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      Duration: {getCallDuration(activeCall)}
                    </Typography>
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                      {/* Additional call controls for active calls */}
                      <IconButton
                        color="primary"
                        sx={{ mx: 1 }}
                        onClick={() => setDtmfDialogOpen(true)}
                      >
                        <DialpadIcon />
                      </IconButton>

                      <IconButton
                        color="primary"
                        sx={{ mx: 1 }}
                        onClick={activeCall.status === 'hold' ? handleResumeCall : handleHoldCall}
                      >
                        {activeCall.status === 'hold' ? <ResumeIcon /> : <PauseIcon />}
                      </IconButton>

                      <IconButton
                        color="primary"
                        sx={{ mx: 1 }}
                        onClick={() => setTransferDialogOpen(true)}
                      >
                        <TransferIcon />
                      </IconButton>

                      {/* Hangup button */}
                      <IconButton
                        color="error"
                        size="large"
                        sx={{
                          width: 80,
                          height: 80,
                          backgroundColor: '#ffebee',
                          '&:hover': {
                            backgroundColor: '#ffcdd2',
                          },
                          ml: 2
                        }}
                        onClick={handleHangup}
                      >
                        <CallEndIcon fontSize="large" />
                      </IconButton>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ mt: 1 }}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      placeholder="Enter phone number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      disabled={connectionStatus !== 'connected' || loading}
                      startIcon={<CallIcon />}
                      onClick={handleMakeCall}
                      sx={{ mb: 2 }}
                    >
                      Make Call
                    </Button>
                    {connectionStatus !== 'connected' && (
                      <Typography variant="caption" color="text.secondary">
                        You must be connected to make calls
                      </Typography>
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
                              await voipService.initialize(settings);
                              setConnectionStatus('connected');
                              enqueueSnackbar('Connected to VoIP service', { variant: 'success' });
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
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Quick Tips
                </Typography>
                <Typography variant="body2" paragraph>
                  • Click the settings icon to configure your SIP credentials
                </Typography>
                <Typography variant="body2" paragraph>
                  • Use the format username@domain for external SIP calls
                </Typography>
                <Typography variant="body2" paragraph>
                  • Use the call controls for hold, resume and transfer features
                </Typography>
              </Paper>
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
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

        {/* Settings Dialog */}
        <Dialog
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          // These props are crucial for proper focus management
          disableRestoreFocus={false}
          disableEnforceFocus={false}
          disableAutoFocus={false}
          keepMounted={false}
          aria-labelledby="settings-dialog-title"
        >
          <DialogTitle id="settings-dialog-title">SIP Account Settings</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>

              <FormControlLabel
                control={
                  <Switch
                    checked={testMode}
                    onChange={(e) => {
                      const newTestMode = e.target.checked;

                      // If switching TO test mode while connected, ask for confirmation
                      if (newTestMode && connectionStatus === 'connected' && !testMode) {
                        if (window.confirm('Switching to test mode will disconnect your current call session. Continue?')) {
                          setTestMode(newTestMode);
                        }
                      } else {
                        setTestMode(newTestMode);
                      }
                    }}
                  />
                }
                label="Test Mode (simulates calls without real connection)"
                sx={{ mt: 2, mb: 1, display: 'block' }}
              />

              {/* Add gateway selector */}
              <FormControl fullWidth margin="dense" sx={{ mb: 3 }}>
                <InputLabel id="gateway-select-label">Gateway</InputLabel>
                <Select
                  labelId="gateway-select-label"
                  id="gateway-select"
                  value={selectedGateway}
                  label="Gateway"
                  onChange={handleGatewayChange}
                >
                  {gatewayOptions.map(option => (
                    <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  Select a preconfigured WebRTC gateway or use custom settings
                </FormHelperText>
              </FormControl>

              <TextField
                fullWidth
                margin="dense"
                label="SIP Username"
                name="username"
                value={settings.username}
                onChange={handleSettingsChange}
                sx={{ mb: 3 }}
              />
              <TextField
                fullWidth
                margin="dense"
                label="SIP Password"
                name="password"
                type="password"
                value={settings.password}
                onChange={handleSettingsChange}
                sx={{ mb: 3 }}
              />
              <TextField
                fullWidth
                margin="dense"
                label="SIP Domain"
                name="domain"
                value={settings.domain}
                onChange={handleSettingsChange}
                sx={{ mb: 3 }}
              />
              <TextField
                fullWidth
                margin="dense"
                label="Host"
                name="host"
                value={settings.host || ''}
                onChange={handleSettingsChange}
                sx={{ mb: 3 }}
              />
              <TextField
                fullWidth
                margin="dense"
                label="Port"
                name="port"
                type="number"
                value={settings.port || ''}
                onChange={handleSettingsChange}
                sx={{ mb: 3 }}
              />
              <TextField
                fullWidth
                margin="dense"
                label="WebSocket Server"
                name="wsServer"
                value={settings.wsServer}
                onChange={handleSettingsChange}
                helperText="Enter domain name only (e.g. sip.example.com) or domain:port (e.g. sip.example.com:8443)"
              />
            </Box>
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<SettingsVoiceIcon />}
                onClick={() => {
                  setShowDeviceTest(true);
                  testAudioDevices();
                }}
              >
                Test Audio Devices
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSettingsOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSettings} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={Boolean(incomingCall)}
          onClose={handleRejectCall}
          disableEscapeKeyDown
          aria-labelledby="incoming-call-title"
          disableRestoreFocus={false}
        >
          <DialogTitle id="incoming-call-title">Incoming Call</DialogTitle>
          <DialogContent>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              py: 2
            }}>
              <Avatar sx={{
                width: 80,
                height: 80,
                mb: 2,
                bgcolor: 'primary.main'
              }}>
                <PhoneIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {incomingCall?.number || 'Unknown'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                is calling you
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button
              variant="contained"
              color="error"
              startIcon={<CallEndIcon />}
              onClick={handleRejectCall}
              sx={{ mr: 2 }}
            >
              Reject
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<PhoneIcon />}
              onClick={handleAnswerCall}
            >
              Answer
            </Button>
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
            setShowDeviceTest(false);
            if (testAudioStream) {
              testAudioStream.getTracks().forEach(track => track.stop());
              setTestAudioStream(null);
            }
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