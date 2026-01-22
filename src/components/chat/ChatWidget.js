import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    IconButton,
    Fab,
    Avatar,
    CircularProgress,
    Badge,
    Rating,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import RemoveIcon from '@mui/icons-material/Remove';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { useAuth } from '../../contexts/AuthContext';
import { io } from 'socket.io-client';
import axiosInstance from '../../axiosConfig';
import { keyframes } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import { useSnackbar } from 'notistack';

const getSocketUrl = () => {
    const apiUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

    // If we're using HTTPS frontend and API URL contains localhost
    if (window.location.protocol === 'https:') {
        // For localhost development with HTTPS
        if (apiUrl.includes('localhost')) {
            return 'https://localhost:8080';
        }
        // For production HTTPS
        return apiUrl.replace(/^http:/, 'https:');
    }

    return apiUrl;
};

const SOCKET_URL = getSocketUrl();

const ChatWindow = styled(Paper)(({ theme }) => ({
    position: 'fixed',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1300,
    overflow: 'hidden',
    boxShadow: theme.shadows[6],
    borderRadius: theme.spacing(2),
    
    // Mobile-first approach
    [theme.breakpoints.down('md')]: {
        // Mobile: Full screen overlay
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        borderRadius: 0,
        maxHeight: '100vh',
    },
    
    [theme.breakpoints.up('md')]: {
        // Tablet: Large chat window
        bottom: 90,
        right: 20,
        width: 400,
        height: 600,
        maxHeight: 'calc(100vh - 120px)',
    },
    
    [theme.breakpoints.up('lg')]: {
        // Desktop: Standard chat window
        width: 380,
        height: 500,
        maxHeight: 'calc(100vh - 120px)',
    }
}));

const ChatHeader = styled(Box)(({ theme }) => ({
    background: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56, // Touch-friendly minimum height
    
    [theme.breakpoints.down('md')]: {
        // Mobile: Full-width header with safe area
        padding: theme.spacing(1, 2),
        paddingTop: 'max(12px, env(safe-area-inset-top))',
        minHeight: 'max(56px, calc(44px + env(safe-area-inset-top)))',
        boxShadow: theme.shadows[2],
    },
    
    [theme.breakpoints.up('md')]: {
        // Desktop: Standard padding
        padding: theme.spacing(2),
    }
}));

const ChatMessages = styled(Box)(({ theme }) => ({
    flexGrow: 1,
    overflowY: 'auto',
    background: theme.palette.background.default,
    display: 'flex',
    flexDirection: 'column',
    
    [theme.breakpoints.down('md')]: {
        // Mobile: Touch-friendly scrolling and spacing
        padding: theme.spacing(1, 2),
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        // Enable momentum scrolling on iOS
        WebkitOverflowScrolling: 'touch',
        // Hide scrollbar on mobile for cleaner look
        '&::-webkit-scrollbar': {
            display: 'none',
        },
        scrollbarWidth: 'none', // Firefox
    },
    
    [theme.breakpoints.up('md')]: {
        // Desktop/Tablet: Standard padding with custom scrollbar
        padding: theme.spacing(2),
        '&::-webkit-scrollbar': {
            width: 6,
        },
        '&::-webkit-scrollbar-track': {
            backgroundColor: theme.palette.grey[200],
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.grey[400],
            borderRadius: 3,
        },
    }
}));

const ChatInput = styled(Box)(({ theme }) => ({
    borderTop: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    
    [theme.breakpoints.down('md')]: {
        // Mobile: Touch-friendly input with safe area
        padding: theme.spacing(1.5, 2),
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        minHeight: 56, // Minimum touch target
        // Add subtle shadow for mobile
        boxShadow: `0 -2px 8px ${theme.palette.grey[200]}`,
    },
    
    [theme.breakpoints.up('md')]: {
        // Desktop: Standard padding
        padding: theme.spacing(2),
    }
}));

const Message = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'sent'
})(({ theme, sent }) => ({
    display: 'flex',
    flexDirection: sent ? 'row-reverse' : 'row',
    alignItems: 'flex-start',
    width: '100%',
    justifyContent: sent ? 'flex-end' : 'flex-start',
    
    [theme.breakpoints.down('md')]: {
        marginBottom: theme.spacing(1.5),
    },
    
    [theme.breakpoints.up('md')]: {
        marginBottom: theme.spacing(1),
    }
}));

const MessageContent = styled(Paper, {
    shouldForwardProp: (prop) => prop !== 'sent'
})(({ theme, sent }) => ({
    borderRadius: 16,
    wordBreak: 'break-word',
    whiteSpace: 'normal',
    overflowWrap: 'anywhere',
    background: sent ? theme.palette.primary.main : theme.palette.grey[100],
    color: sent ? '#ffffff' : theme.palette.text.primary,
    boxShadow: theme.shadows[1],
    display: 'inline-block',
    width: 'auto',
    minWidth: 40,
    
    '& *': {
        whiteSpace: 'normal',
    },
    
    [theme.breakpoints.down('md')]: {
        padding: theme.spacing(1.5, 2),
        maxWidth: '85%',
        fontSize: '1rem',
        lineHeight: 1.5,
    },
    
    [theme.breakpoints.up('md')]: {
        padding: theme.spacing(1, 2),
        maxWidth: 280,
        fontSize: '0.875rem',
        lineHeight: 1.4,
    }
}));

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(25, 118, 210, 0); }
  100% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0); }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
`;

// const shake = keyframes`
//   0%, 100% { transform: rotate(0deg); }
//   25% { transform: rotate(-5deg); }
//   75% { transform: rotate(5deg); }
// `;

const glow = keyframes`
  0%, 100% { filter: drop-shadow(0 0 3px rgba(25, 118, 210, 0.3)); }
  50% { filter: drop-shadow(0 0 8px rgba(25, 118, 210, 0.8)); }
`;

const ChatFab = styled(Fab)(({ theme, hasNewMessages, showInitialAnimation, isAgentOnline }) => ({
    position: 'fixed',
    bottom: 20,
    right: 20,
    zIndex: 1200,
    width: 60,
    height: 60,
    background: hasNewMessages 
        ? `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`
        : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    boxShadow: hasNewMessages 
        ? `0 4px 20px rgba(244, 67, 54, 0.4)` 
        : theme.shadows[8],
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    
    // Pulse for new messages, bounce for initial attention
    animation: hasNewMessages ?
        `${pulse} 1.5s infinite` :
        showInitialAnimation ?
            `${bounce} 0.8s ease-in-out 3, ${glow} 2s ease-in-out infinite` :
            'none',
    
    '&:hover': {
        transform: 'scale(1.15) translateY(-4px)',
        boxShadow: hasNewMessages
            ? `0 8px 30px rgba(244, 67, 54, 0.6)`
            : theme.shadows[12],
        background: hasNewMessages 
            ? `linear-gradient(135deg, ${theme.palette.error.dark} 0%, ${theme.palette.error.main} 100%)`
            : `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
    },
    
    '&:active': {
        transform: 'scale(1.05)',
    },
    
    // Online indicator
    '&::after': isAgentOnline ? {
        content: '""',
        position: 'absolute',
        top: 8,
        right: 8,
        width: 12,
        height: 12,
        borderRadius: '50%',
        backgroundColor: theme.palette.success.main,
        border: `3px solid ${theme.palette.background.paper}`,
        boxShadow: `0 0 8px ${theme.palette.success.main}`,
        animation: `${glow} 2s ease-in-out infinite`,
    } : {},
}));

export default function ChatWidget() {
    const { enqueueSnackbar } = useSnackbar();
    // const { user, isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const messageQueueRef = useRef([]); // Queue for messages sent before socket ready
    const socketReadyRef = useRef(false); // Track actual socket readiness
    const [sessionId, setSessionId] = useState(null);
    const [sessionClosed, setSessionClosed] = useState(false); // Track if session is closed
    const [socket, setSocket] = useState(null);
    const [hasNewMessages, setHasNewMessages] = useState(false);
    const [showInitialAnimation, setShowInitialAnimation] = useState(true);
    const [isAgentOnline, setIsAgentOnline] = useState(false);
    const [showProactiveMessage, setShowProactiveMessage] = useState(false);
    const messagesEndRef = useRef(null);
    const { user, isAuthenticated } = useAuth?.() || { user: null, isAuthenticated: false };
    const [showTooltip, setShowTooltip] = useState(false);
    const [fileUploading, setFileUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Add these state variables
    const [isTyping, setIsTyping] = useState(false);
    const [agentTyping, setAgentTyping] = useState(false);
    const typingTimeoutRef = useRef(null);

    // Add these state variables
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackRating, setFeedbackRating] = useState(0);
    const [feedbackComment, setFeedbackComment] = useState('');

    // Helper to normalize sender format - handles both string and object formats
    const normalizeSender = (sender) => {
        if (typeof sender === 'string') {
            // Old format: sender is just a string like 'agent' or 'customer'
            return { role: sender, name: sender === 'agent' ? 'Support Agent' : 'Customer' };
        }
        return sender || { role: 'unknown', name: 'Unknown' };
    };

    // File message component with image preview
    const FileMessage = ({ fileData }) => {
        const isImage = fileData.fileType?.startsWith('image/');
        const isPDF = fileData.fileType === 'application/pdf';
        
        // Determine icon based on file type
        let FileIcon = InsertDriveFileIcon;
        if (isImage) {
            FileIcon = ImageIcon;
        } else if (isPDF) {
            FileIcon = PictureAsPdfIcon;
        }

        const handleDownload = () => {
            window.open(fileData.fileUrl, '_blank');
        };

        return (
            <Box sx={{ p: 1 }}>
                {/* Image Preview */}
                {isImage && fileData.fileUrl && (
                    <Box 
                        sx={{ 
                            mb: 1, 
                            borderRadius: 1, 
                            overflow: 'hidden',
                            cursor: 'pointer',
                            maxWidth: 200,
                            '&:hover': { opacity: 0.9 }
                        }}
                        onClick={handleDownload}
                    >
                        <img 
                            src={fileData.fileUrl} 
                            alt={fileData.fileName}
                            style={{ 
                                width: '100%', 
                                height: 'auto', 
                                display: 'block',
                                borderRadius: 4
                            }}
                        />
                    </Box>
                )}
                
                {/* File info row */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FileIcon sx={{ mr: 1, fontSize: 20 }} />
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="body2" noWrap sx={{ fontSize: '0.8rem' }}>
                            {fileData.fileName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {fileData.fileSize ? `${Math.round(fileData.fileSize / 1024)} KB` : ''}
                        </Typography>
                    </Box>
                    <Tooltip title="Download">
                        <IconButton onClick={handleDownload} size="small">
                            <FileDownloadIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
        );
    };

    // Restore session on component mount - for both authenticated and guest users
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        // Try to restore session from localStorage for ALL users (including guests)
        const savedSessionId = localStorage.getItem('chatSessionId');

        if (savedSessionId) {
            console.log('🔄 Restoring chat session:', savedSessionId);
            setSessionId(savedSessionId);

            // Fetch previous messages and check session status
            const restoreSession = async () => {
                try {
                    setLoading(true);
                    
                    // Fetch messages
                    const messagesResponse = await axiosInstance.get(`/v1/chat/history/${savedSessionId}`);
                    
                    if (messagesResponse.data.length > 0) {
                        setMessages(messagesResponse.data);
                        console.log('✅ Previous messages restored:', messagesResponse.data.length);
                        
                        // Check if session is still active by fetching active sessions
                        // This is a simple check - if we can't find session in active list, it might be closed
                        try {
                            const sessionsResponse = await axiosInstance.get('/v1/chat/sessions/active');
                            const activeSession = sessionsResponse.data?.find(s => s.sessionId === savedSessionId);
                            
                            if (!activeSession) {
                                // Session might be closed - check closed sessions
                                const closedResponse = await axiosInstance.get('/v1/chat/sessions/closed');
                                const closedSession = closedResponse.data?.find(s => s.sessionId === savedSessionId);
                                
                                if (closedSession) {
                                    console.log('⚠️ Session was closed');
                                    // Add system message about closed session
                                    const systemMessage = {
                                        content: 'This chat session has ended.',
                                        sender: { role: 'system', name: 'System' },
                                        timestamp: new Date().toISOString(),
                                        sessionId: savedSessionId
                                    };
                                    setMessages(prev => [...prev, systemMessage]);
                                    setSessionClosed(true);
                                    // Clear session after showing message
                                    setTimeout(() => {
                                        localStorage.removeItem('chatSessionId');
                                        setSessionId(null);
                                        setSessionClosed(false);
                                    }, 3000);
                                }
                            }
                        } catch (sessionCheckError) {
                            console.log('Could not verify session status:', sessionCheckError);
                        }
                    } else {
                        console.log('⚠️ Session exists but no messages');
                    }
                } catch (error) {
                    console.error('Error restoring session:', error);
                    // If 404 or session not found, clear it
                    if (error.response?.status === 404) {
                        localStorage.removeItem('chatSessionId');
                        setSessionId(null);
                    }
                } finally {
                    setLoading(false);
                }
            };

            restoreSession();
        }
    }, []); // Run once on mount - no dependencies needed

    // Show initial attention animation for first 10 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowInitialAnimation(false);
        }, 10000);
        
        return () => clearTimeout(timer);
    }, []);

    // Show proactive message after 15 seconds if not engaged
    useEffect(() => {
        if (!isOpen && !sessionId) {
            const timer = setTimeout(() => {
                setShowProactiveMessage(true);
            }, 15000);
            
            return () => clearTimeout(timer);
        }
    }, [isOpen, sessionId]);

    // Helper: Wait for socket to be connected and ready
    const ensureSocketReady = async () => {
        // If already ready, return immediately
        if (socketReadyRef.current && socket?.connected) {
            return true;
        }

        // Wait up to 3 seconds for socket to connect
        let attempts = 0;
        const maxAttempts = 30; // 30 * 100ms = 3 seconds

        while (attempts < maxAttempts) {
            if (socket?.connected) {
                socketReadyRef.current = true;
                console.log('✅ Socket ready for sending');
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        console.error('❌ Socket failed to connect after 3 seconds');
        enqueueSnackbar('Connection timeout. Please check your internet connection.', { variant: 'error' });
        return false;
    };

    // Helper: Process queued messages - wrapped in useCallback (no external deps to prevent infinite loops)
    const processMessageQueue = useCallback(async (currentSocket) => {
        if (!currentSocket || messageQueueRef.current.length === 0) return;

        console.log(`📋 Processing ${messageQueueRef.current.length} queued messages`);
        const queue = [...messageQueueRef.current];
        messageQueueRef.current = []; // Clear queue

        for (const messageData of queue) {
            if (currentSocket?.connected) {
                currentSocket.emit('send_message', messageData);
                console.log('📤 Sent queued message:', messageData.content?.substring(0, 30));
            }
        }
    }, []);

    // Use refs for values needed in socket handlers to avoid stale closures
    const sessionIdRef = useRef(sessionId);
    const isOpenRef = useRef(isOpen);
    
    // Keep refs in sync with state
    useEffect(() => {
        sessionIdRef.current = sessionId;
    }, [sessionId]);
    
    useEffect(() => {
        isOpenRef.current = isOpen;
    }, [isOpen]);

    // Initialize socket connection - ONLY depends on isOpen, not sessionId
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (isOpen && !socket) {
            console.log('🔌 Initializing socket connection...');
            
            // Parse token - it may be stored as JSON string (with quotes)
            let authToken = localStorage.getItem('accessToken');
            if (authToken) {
                try {
                    authToken = JSON.parse(authToken);
                } catch (e) {
                    // Token is already a raw string, use as-is
                }
            }
            
            const newSocket = io(SOCKET_URL, {
                auth: {
                    token: authToken
                },
                transports: ['polling', 'websocket'],
                secure: true,
                rejectUnauthorized: false // Important for self-signed certs in development
            });

            newSocket.on('connect', () => {
                console.log('✅ Connected to chat server');
                socketReadyRef.current = true;
                setIsAgentOnline(true);

                // Process any queued messages
                processMessageQueue(newSocket);

                // Join session room if session already exists (using ref for current value)
                if (sessionIdRef.current) {
                    console.log('📍 Joining session room on connect:', sessionIdRef.current);
                    newSocket.emit('join_session', { sessionId: sessionIdRef.current });
                }
            });

            newSocket.on('reconnect', () => {
                console.log('🔄 Reconnected to chat server');
                socketReadyRef.current = true;
                setIsAgentOnline(true);
                
                processMessageQueue(newSocket);
                
                if (sessionIdRef.current) {
                    console.log('📍 Re-joining session room on reconnect:', sessionIdRef.current);
                    newSocket.emit('join_session', { sessionId: sessionIdRef.current });
                }
            });

            newSocket.on('session_joined', (data) => {
                console.log('✅ Successfully joined session room:', data.sessionId);
            });

            newSocket.on('new_message', (msg) => {
                // Use ref to check current sessionId
                if (msg.sessionId === sessionIdRef.current) {
                    // Skip if this is our own message (already added locally for instant feedback)
                    // Check by sender role - only add messages from agents/system, not customers
                    const senderRole = msg.sender?.role || msg.sender;
                    if (senderRole === 'customer') {
                        console.log('📩 Skipping own message echo');
                        return; // Don't add - already in local state
                    }
                    
                    setMessages(prev => [...prev, msg]);
                    if (!isOpenRef.current) {
                        setHasNewMessages(true);
                    }
                }
            });

            newSocket.on('user_typing', (data) => {
                if (data.sessionId === sessionIdRef.current) {
                    setAgentTyping(data.isTyping);
                    if (data.isTyping) {
                        setTimeout(() => setAgentTyping(false), 3000);
                    }
                }
            });

            newSocket.on('session_assigned', (data) => {
                console.log('✅ Session assigned to agent:', data);
                if (data.sessionId === sessionIdRef.current) {
                    const agentName = data.agent?.name || 'An agent';
                    enqueueSnackbar(`${agentName} has joined the chat`, { variant: 'success' });
                    
                    const systemMessage = {
                        content: `${agentName} has joined the conversation`,
                        sender: { role: 'system', name: 'System' },
                        timestamp: new Date().toISOString(),
                        sessionId: sessionIdRef.current
                    };
                    setMessages(prev => [...prev, systemMessage]);
                }
            });

            newSocket.on('session_closed', (data) => {
                console.log('🚫 Session closed:', data);
                if (data.sessionId === sessionIdRef.current) {
                    // Mark session as closed immediately to disable input
                    setSessionClosed(true);
                    
                    // Show who closed the chat
                    const closedByAgent = data.closedBy === 'agent';
                    const message = closedByAgent 
                        ? 'The agent has ended this chat session.' 
                        : 'You have ended this chat session.';
                    
                    enqueueSnackbar(message, { variant: 'info' });
                    
                    const systemMessage = {
                        content: `${message} Thank you for contacting us!`,
                        sender: { role: 'system', name: 'System' },
                        timestamp: new Date().toISOString(),
                        sessionId: sessionIdRef.current
                    };
                    setMessages(prev => [...prev, systemMessage]);
                    
                    // Clear session after delay and show feedback
                    setTimeout(() => {
                        localStorage.removeItem('chatSessionId');
                        setSessionId(null);
                        setSessionClosed(false); // Reset for new chats
                        setShowFeedback(true);
                    }, 3000);
                }
            });

            newSocket.on('disconnect', (reason) => {
                console.log('❌ Disconnected from chat server:', reason);
                socketReadyRef.current = false;
                setIsAgentOnline(false);
            });

            newSocket.on('connect_error', (error) => {
                console.error('❌ Socket connection error:', error.message);
                socketReadyRef.current = false;
                setIsAgentOnline(false);
                
                setTimeout(() => {
                    if (!newSocket.connected) {
                        console.log('🔄 Attempting to reconnect...');
                        newSocket.connect();
                    }
                }, 2000);
            });

            setSocket(newSocket);

            // Cleanup ONLY when component unmounts or isOpen becomes false
            return () => {
                console.log('🧹 Socket cleanup running...');
                newSocket.off('connect');
                newSocket.off('reconnect');
                newSocket.off('session_joined');
                newSocket.off('new_message');
                newSocket.off('user_typing');
                newSocket.off('session_assigned');
                newSocket.off('session_closed');
                newSocket.off('disconnect');
                newSocket.off('connect_error');
                
                socketReadyRef.current = false;
                newSocket.disconnect();
                setSocket(null);
                console.log('🔌 Socket disconnected');
            };
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]); // Dependencies: isOpen only. socket, processMessageQueue, enqueueSnackbar are stable/refs
    
    // Separate effect to join session room when sessionId changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (socket?.connected && sessionId) {
            console.log('📍 Joining session room (sessionId changed):', sessionId);
            socket.emit('join_session', { sessionId });
        }
    }, [sessionId, socket]); // socket intentionally excluded - checked inside conditionally

    // Scroll to bottom when messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (!isOpen && !sessionId) {
            const timer = setTimeout(() => setShowTooltip(true), 3000);
            const hideTimer = setTimeout(() => setShowTooltip(false), 8000);
            return () => {
                clearTimeout(timer);
                clearTimeout(hideTimer);
            };
        }
    }, [isOpen, sessionId]);

    const handleOpen = () => {
        setIsOpen(true);
        setHasNewMessages(false);
        // Check if we have an existing session from localStorage
        const savedSessionId = localStorage.getItem('chatSessionId');
        if (savedSessionId && !sessionId) {
            setSessionId(savedSessionId);
            // Fetch session messages if needed
        }
        // Don't create session here - wait for first message
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleSendMessage = async () => {
        if (!message.trim()) {
            return;
        }

        let currentSessionId = sessionId;

        // Create session if it doesn't exist
        if (!currentSessionId) {
            try {
                setLoading(true);
                console.log('📝 Creating new chat session...');
                
                // Build customer name from various user object fields
                const customerName = user?.displayName || 
                    user?.name || 
                    (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}`.trim() : null) ||
                    user?.firstName ||
                    user?.email ||
                    'Customer';
                
                const response = await axiosInstance.post('/v1/chat/session', isAuthenticated ? {
                    id: user.userId || user.id || user._id,
                    name: customerName,
                    email: user.email,
                    phone: user.phone || user.phoneNumber || '',
                    isAuthenticated: true,
                } : {
                    name: 'Guest User',
                    isAuthenticated: false,
                });
                
                currentSessionId = response.data.sessionId;
                setSessionId(currentSessionId);
                localStorage.setItem('chatSessionId', currentSessionId);
                console.log('✅ Session created:', currentSessionId);
                
                // Join session room (socket may still be connecting)
                if (socket) {
                    socket.emit('join_session', { sessionId: currentSessionId });
                }
                
                setLoading(false);
            } catch (error) {
                console.error('Failed to create chat session:', error);
                enqueueSnackbar('Failed to start chat session. Please try again.', { variant: 'error' });
                setLoading(false);
                return;
            }
        }

        // Ensure socket is ready before sending
        const socketReady = await ensureSocketReady();
        if (!socketReady) {
            enqueueSnackbar('Chat connection failed. Please refresh and try again.', { variant: 'error' });
            return;
        }

        const newMessage = {
            sessionId: currentSessionId,
            sender: {
                id: user?.userId || 'anonymous',
                name: user?.name || 'Guest User',
                role: 'customer'
            },
            content: message,
            timestamp: new Date()
        };

        // Add to local messages state immediately for instant UI feedback
        setMessages(prev => [...prev, newMessage]);
        setMessage(''); // Clear input immediately

        // Send through socket with confirmation
        if (socket && socket.connected) {
            socket.emit('send_message', newMessage);
            console.log('📤 Message sent via socket:', newMessage.content?.substring(0, 30));
        } else {
            // Queue message if socket not connected
            messageQueueRef.current.push(newMessage);
            console.log('📋 Message queued (socket not ready), total in queue:', messageQueueRef.current.length);
            enqueueSnackbar('Message queued. Sending when connection ready...', { variant: 'info' });
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file || !sessionId || !socket) return;

        // File size validation (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        // File type validation
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif',
            'application/pdf',
            'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];

        if (!allowedTypes.includes(file.type)) {
            alert('This file type is not allowed');
            return;
        }

        // Create FormData object
        const formData = new FormData();
        formData.append('file', file);
        formData.append('sessionId', sessionId);

        try {
            setFileUploading(true);

            // Upload the file to your server
            const response = await axiosInstance.post('/v1/chat/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Create a file message
            const fileMessage = {
                sessionId: sessionId,
                sender: {
                    id: user?.userId || 'anonymous',
                    name: user?.name || 'Guest User',
                    role: 'customer'
                },
                content: `[File: ${file.name}]`,
                fileData: {
                    fileName: file.name,
                    fileType: file.type,
                    fileSize: file.size,
                    fileUrl: response.data.fileUrl
                },
                timestamp: new Date()
            };

            // Send the message through socket
            socket.emit('send_message', fileMessage);

            // Add to local messages state
            setMessages(prev => [...prev, fileMessage]);
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Failed to upload file');
        } finally {
            setFileUploading(false);
            // Clear the file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Add this function to handle typing events
    const handleTyping = () => {
        if (!isTyping && socket && sessionId) {
            socket.emit('typing', {
                sessionId: sessionId,
                isTyping: true,
                from: 'customer'
            });
            setIsTyping(true);
        }

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set timeout to stop typing indicator after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            if (socket && sessionId) {
                socket.emit('typing', {
                    sessionId: sessionId,
                    isTyping: false,
                    from: 'customer'
                });
                setIsTyping(false);
            }
        }, 2000);
    };

    // Add chat end function
    const handleEndChat = () => {
        // Prompt for feedback
        setShowFeedback(true);
    };

    // Add feedback submission function
    const handleSubmitFeedback = async () => {
        try {
            // Submit feedback
            await axiosInstance.post(`/v1/chat/session/${sessionId}/feedback`, {
                rating: feedbackRating,
                comments: feedbackComment
            });

            // Actually close the session in backend
            await axiosInstance.put(`/v1/chat/session/${sessionId}/close`);
            
            // Notify agents via socket that customer ended chat
            if (socket && socket.connected) {
                socket.emit('end_chat', { 
                    sessionId,
                    closedBy: 'customer',
                    feedback: {
                        rating: feedbackRating,
                        comments: feedbackComment
                    }
                });
            }

            // Clear session data
            localStorage.removeItem('chatSessionId');
            setSessionId(null);
            setMessages([]);

            // Thank the user and close the feedback dialog
            setShowFeedback(false);
            handleClose();
            
            enqueueSnackbar('Thank you for your feedback!', { variant: 'success' });
        } catch (error) {
            console.error('Error submitting feedback:', error);
            enqueueSnackbar('Failed to submit feedback', { variant: 'error' });
        }
    };

    // Add this component to render the feedback dialog
    const FeedbackDialog = () => (
        <Dialog open={showFeedback} onClose={() => setShowFeedback(false)}>
            <DialogTitle>How was your experience?</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 2 }}>
                    <Typography variant="body2" gutterBottom>
                        Please rate your chat experience
                    </Typography>
                    <Rating
                        name="feedback-rating"
                        value={feedbackRating}
                        onChange={(e, newValue) => setFeedbackRating(newValue)}
                        size="large"
                        sx={{ my: 2 }}
                    />
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Additional comments (optional)"
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={async () => {
                    setShowFeedback(false);
                    // End chat session without feedback
                    try {
                        await axiosInstance.put(`/v1/chat/session/${sessionId}/close`);
                        
                        // Clear session and close widget
                        localStorage.removeItem('chatSessionId');
                        setSessionId(null);
                        setMessages([]);
                        setIsOpen(false);
                        
                        if (socket) {
                            socket.disconnect();
                            setSocket(null);
                        }
                        
                        enqueueSnackbar('Chat ended', { variant: 'info' });
                    } catch (error) {
                        console.error('Error ending chat:', error);
                        enqueueSnackbar('Failed to end chat', { variant: 'error' });
                    }
                }}>Skip & End Chat</Button>
                <Button
                    onClick={handleSubmitFeedback}
                    variant="contained"
                    color="primary"
                    disabled={!feedbackRating}
                >
                    Submit Feedback
                </Button>
            </DialogActions>
        </Dialog>
    );

    return (
        <>
            {isOpen ? (
                <ChatWindow>
                    <ChatHeader>
                        <Box display="flex" alignItems="center">
                            <Avatar sx={{ bgcolor: 'primary.dark', mr: 1 }}>N</Avatar>
                            <Typography variant="subtitle1">NEXC Support</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1 } }}>
                            {/* Minimize button - hide on mobile */}
                            <IconButton 
                                color="inherit" 
                                size="small" 
                                onClick={() => setIsOpen(false)}
                                sx={{ 
                                    display: { xs: 'none', md: 'flex' },
                                    minWidth: 44,
                                    minHeight: 44
                                }}
                                title="Minimize chat"
                            >
                                <RemoveIcon fontSize="small" />
                            </IconButton>
                            {/* Close/End chat button */}
                            <Tooltip title="End chat">
                                <IconButton 
                                    color="inherit" 
                                    size="small" 
                                    onClick={handleEndChat}
                                    sx={{ 
                                        minWidth: 44, // Touch-friendly size
                                        minHeight: 44
                                    }}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </ChatHeader>

                    <ChatMessages>
                        {loading ? (
                            <Box display="flex" justifyContent="center" alignItems="center" height="100%" flexDirection="column" gap={2}>
                                <CircularProgress />
                                <Typography variant="body2" color="text.secondary">
                                    Connecting you to support...
                                </Typography>
                            </Box>
                        ) : (
                            <>
                                {/* Empty state - show when no messages yet OR no session */}
                                {messages.length === 0 && (
                                    <Box 
                                        display="flex" 
                                        justifyContent="center" 
                                        alignItems="center" 
                                        height="100%" 
                                        flexDirection="column" 
                                        gap={2}
                                        sx={{ p: 3, textAlign: 'center' }}
                                    >
                                        <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', mb: 1 }}>N</Avatar>
                                        <Typography variant="h6" color="text.primary">
                                            NEXC Support
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {sessionId ? (
                                                isAgentOnline 
                                                    ? '👋 Hi! An agent will be with you shortly. Feel free to describe your question below.'
                                                    : '📧 Our team is currently offline. Leave a message and we\'ll respond soon!'
                                            ) : (
                                                '👋 Welcome! Click the input field below to start chatting with our support team.'
                                            )}
                                        </Typography>
                                        {sessionId && (
                                            <Box sx={{ 
                                                display: 'flex', 
                                                gap: 1, 
                                                alignItems: 'center',
                                                mt: 2,
                                                px: 2,
                                                py: 1,
                                                bgcolor: 'action.hover',
                                                borderRadius: 2
                                            }}>
                                                <CircularProgress size={16} />
                                                <Typography variant="caption" color="text.secondary">
                                                    Waiting for agent to join...
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                )}

                                {messages.map((msg, index) => {
                                    const sender = normalizeSender(msg.sender);
                                    return (
                                    <Message key={index} sent={sender.role === 'customer'}>
                                        {sender.role === 'system' ? (
                                            // System messages (centered, styled differently)
                                            <Box sx={{ 
                                                width: '100%', 
                                                display: 'flex', 
                                                justifyContent: 'center',
                                                my: 2
                                            }}>
                                                <Box sx={{
                                                    px: 2,
                                                    py: 1,
                                                    bgcolor: 'action.hover',
                                                    borderRadius: 2,
                                                    maxWidth: '80%'
                                                }}>
                                                    <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                                                        {msg.content}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        ) : (
                                            // Regular messages
                                            <>
                                                {sender.role !== 'customer' && (
                                                    <Avatar
                                                        sx={{ width: 32, height: 32, mr: 1, ml: 0 }}
                                                    >
                                                        {sender.name?.charAt(0) || 'S'}
                                                    </Avatar>
                                                )}
                                                <Box>
                                                    <MessageContent sent={sender.role === 'customer'}>
                                                        {msg.fileData ? (
                                                            <FileMessage fileData={msg.fileData} />
                                                        ) : (
                                                            <Typography variant="body2" component="span">
                                                                {msg.content}
                                                            </Typography>
                                                        )}
                                                    </MessageContent>
                                                    <Typography
                                                        variant="caption"
                                                        color="textSecondary"
                                                        sx={{
                                                            mt: 0.5,
                                                            display: 'block',
                                                            textAlign: sender.role === 'customer' ? 'right' : 'left'
                                                        }}
                                                    >
                                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </Typography>
                                                </Box>
                                            </>
                                        )}
                                    </Message>
                                    );
                                })}

                                {/* Typing indicator */}
                                {agentTyping && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
                                        <Avatar sx={{ width: 24, height: 24, mr: 1 }}>N</Avatar>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <span
                                                style={{
                                                    width: '6px',
                                                    height: '6px',
                                                    background: 'gray',
                                                    borderRadius: '50%',
                                                    margin: '0 2px',
                                                    animation: 'pulse 1s infinite',
                                                    animationDelay: '0s',
                                                }}
                                            />
                                            <span
                                                style={{
                                                    width: '6px',
                                                    height: '6px',
                                                    background: 'gray',
                                                    borderRadius: '50%',
                                                    margin: '0 2px',
                                                    animation: 'pulse 1s infinite',
                                                    animationDelay: '0.2s'
                                                }}
                                            />
                                            <span
                                                style={{
                                                    width: '6px',
                                                    height: '6px',
                                                    background: 'gray',
                                                    borderRadius: '50%',
                                                    margin: '0 2px',
                                                    animation: 'pulse 1s infinite',
                                                    animationDelay: '0.4s'
                                                }}
                                            />
                                        </Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                            Agent is typing...
                                        </Typography>
                                    </Box>
                                )}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </ChatMessages>

                    <ChatInput>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileUpload}
                            accept="image/*,application/pdf,.doc,.docx,.txt"
                            multiple={false}
                        />
                        <Tooltip title="Attach file (Images, PDF, Documents)">
                            <IconButton
                                onClick={() => fileInputRef.current?.click()}
                                disabled={fileUploading || loading || !sessionId || sessionClosed}
                                sx={{ 
                                    minWidth: 44, // Touch-friendly size
                                    minHeight: 44,
                                    mr: { xs: 0.5, md: 1 }
                                }}
                            >
                                <AttachFileIcon />
                            </IconButton>
                        </Tooltip>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder={
                                sessionClosed 
                                    ? "Chat session ended" 
                                    : sessionId 
                                        ? "Type a message..." 
                                        : "Click to start chat..."
                            }
                            value={message}
                            onChange={(e) => {
                                setMessage(e.target.value);
                                if (sessionId) handleTyping();
                            }}
                            onKeyDown={handleKeyDown}
                            size="small"
                            disabled={fileUploading || sessionClosed}
                            multiline
                            maxRows={4}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    minHeight: { xs: 44, md: 40 }, // Touch-friendly on mobile
                                    fontSize: { xs: '1rem', md: '0.875rem' },
                                },
                                '& .MuiInputBase-input': {
                                    padding: { xs: '12px 14px', md: '8.5px 14px' },
                                }
                            }}
                        />
                        {fileUploading ? (
                            <CircularProgress size={24} sx={{ ml: { xs: 0.5, md: 1 } }} />
                        ) : (
                            <Tooltip title={sessionClosed ? "Session closed" : sessionId ? "Send message" : "Start chat first"}>
                                <span>
                                    <IconButton
                                        color="primary"
                                        onClick={handleSendMessage}
                                        disabled={!message.trim() || loading || sessionClosed}
                                        sx={{ 
                                            ml: { xs: 0.5, md: 1 },
                                            minWidth: 44, // Touch-friendly size
                                            minHeight: 44,
                                        }}
                                    >
                                        <SendIcon />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        )}
                    </ChatInput>
                </ChatWindow>
            ) : (
                <Tooltip
                    title={
                        showProactiveMessage 
                            ? "💬 Need help? Our team is here to help - Click to chat!" 
                            : "Chat with support"
                    }
                    open={showProactiveMessage || showTooltip}
                    onClose={() => setShowProactiveMessage(false)}
                    placement="left"
                    arrow
                    componentsProps={{
                        tooltip: {
                            sx: {
                                bgcolor: isAgentOnline ? 'success.main' : 'primary.main',
                                fontSize: '0.9rem',
                                px: 2.5,
                                py: 1.5,
                                fontWeight: 500,
                                maxWidth: 280,
                                boxShadow: 3,
                                '& .MuiTooltip-arrow': {
                                    color: isAgentOnline ? 'success.main' : 'primary.main',
                                },
                            },
                        },
                    }}
                >
                    <Badge
                        color="error"
                        variant="dot"
                        invisible={!hasNewMessages}
                        overlap="circular"
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        sx={{
                            // Fixed positioning for the badge container
                            position: 'fixed',
                            bottom: 20,
                            right: 20,
                            zIndex: 1200,
                            '& .MuiBadge-badge': {
                                animation: hasNewMessages ? `${pulse} 1.5s infinite` : 'none',
                            }
                        }}
                    >
                        <ChatFab
                            color="primary"
                            onClick={handleOpen}
                            aria-label="chat with support"
                            hasNewMessages={hasNewMessages}
                            showInitialAnimation={showInitialAnimation}
                            isAgentOnline={isAgentOnline}
                            variant="extended"
                            sx={{ 
                                // Remove fixed positioning from Fab since Badge handles it
                                position: 'relative',
                                bottom: 'auto',
                                right: 'auto',
                                gap: 1,
                                fontSize: { xs: '0.75rem', md: '0.875rem' },
                                fontWeight: 600,
                                textTransform: 'none',
                                minWidth: { xs: 'auto', md: 100 }
                            }}
                        >
                            <ChatIcon sx={{ fontSize: 28 }} />
                            <Box sx={{ display: { xs: 'none', md: 'block' } }}>Chat</Box>
                        </ChatFab>
                    </Badge>
                </Tooltip>
            )}
            <FeedbackDialog />
        </>
    );
}