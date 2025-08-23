import React, { useState, useEffect, useRef } from 'react';
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
    bottom: 90,
    right: 20,
    width: 350,
    height: 500,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1300,
    overflow: 'hidden',
    boxShadow: theme.shadows[6],
    [theme.breakpoints.down('sm')]: {
        width: '90%',
        height: '70%',
        bottom: 70,
        right: '5%',
    },
}));

const ChatHeader = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    background: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
}));

const ChatMessages = styled(Box)(({ theme }) => ({
    flexGrow: 1,
    overflowY: 'auto',
    padding: theme.spacing(2),
    background: theme.palette.background.default,
}));

const ChatInput = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    alignItems: 'center',
}));

const Message = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'sent'
})(({ theme, sent }) => ({
    display: 'flex',
    marginBottom: theme.spacing(1),
    flexDirection: sent ? 'row-reverse' : 'row',
}));

const MessageContent = styled(Paper, {
    shouldForwardProp: (prop) => prop !== 'sent'
})(({ theme, sent }) => ({
    padding: theme.spacing(1, 2),
    borderRadius: 16,
    maxWidth: '70%',
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',  // Add this to preserve whitespace and line breaks
    overflowWrap: 'break-word', // Ensure words break properly
    hyphens: 'auto', // Allow hyphenation for better text wrapping
    background: sent ? theme.palette.primary.light : theme.palette.grey[100],
    color: sent ? theme.palette.primary.contrastText : theme.palette.text.primary,
}));

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(25, 118, 210, 0); }
  100% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0); }
`;

const ChatFab = styled(Fab)(({ theme, hasNewMessages }) => ({
    position: 'fixed',
    bottom: 16,
    right: 16,
    zIndex: 1200,
    animation: hasNewMessages ?
        `${pulse} 1.5s infinite` :
        'none',
    '&:hover': {
        transform: 'scale(1.05)',
        transition: 'transform 0.2s'
    }
}));

export default function ChatWidget() {
    const { enqueueSnackbar } = useSnackbar();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [socket, setSocket] = useState(null);
    const [hasNewMessages, setHasNewMessages] = useState(false);
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

    // Add this component inside the ChatWidget component
    const FileMessage = ({ fileData }) => {
        // Determine icon based on file type
        let FileIcon = InsertDriveFileIcon;
        if (fileData.fileType.startsWith('image/')) {
            FileIcon = ImageIcon;
        } else if (fileData.fileType === 'application/pdf') {
            FileIcon = PictureAsPdfIcon;
        }

        const handleDownload = () => {
            window.open(fileData.fileUrl, '_blank');
        };

        return (
            <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
                <FileIcon sx={{ mr: 1 }} />
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" noWrap>{fileData.fileName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                        {Math.round(fileData.fileSize / 1024)} KB
                    </Typography>
                </Box>
                <IconButton onClick={handleDownload} size="small">
                    <FileDownloadIcon fontSize="small" />
                </IconButton>
            </Box>
        );
    };

    // Add to the start of the component
    useEffect(() => {
        // Try to restore session from localStorage
        const savedSessionId = localStorage.getItem('chatSessionId');

        if (savedSessionId) {
            setSessionId(savedSessionId);

            // Fetch previous messages if session exists
            const fetchPreviousMessages = async () => {
                try {
                    setLoading(true);
                    const response = await axiosInstance.get(`/v1/chat/history/${savedSessionId}`);
                    setMessages(response.data);
                } catch (error) {
                    console.error('Error fetching previous messages:', error);
                    // If error, probably session expired, so clear it
                    localStorage.removeItem('chatSessionId');
                    setSessionId(null);
                } finally {
                    setLoading(false);
                }
            };

            fetchPreviousMessages();
        }
    }, []);

    // Initialize socket connection
    useEffect(() => {
        if (isOpen && !socket) {
            const newSocket = io(SOCKET_URL, {
                auth: {
                    token: localStorage.getItem('accessToken')
                },
                transports: ['polling', 'websocket'],
                secure: true,
                rejectUnauthorized: false // Important for self-signed certs in development
            });

            newSocket.on('connect', () => {
                console.log('Connected to chat server');

                // Join session room if session already exists
                if (sessionId) {
                    newSocket.emit('join_session', { sessionId });
                }
            });

            newSocket.on('new_message', (msg) => {
                if (msg.sessionId === sessionId) {
                    setMessages(prev => [...prev, msg]);
                    if (!isOpen) {
                        setHasNewMessages(true);
                    }
                }
            });

            // Add to the socket initialization useEffect
            newSocket.on('user_typing', (data) => {
                if (data.sessionId === sessionId) {
                    setAgentTyping(data.isTyping);

                    // Auto-clear after 3 seconds in case the event gets lost
                    if (data.isTyping) {
                        setTimeout(() => {
                            setAgentTyping(false);
                        }, 3000);
                    }
                }
            });

            newSocket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                enqueueSnackbar('Connection to chat server failed', { variant: 'error' });
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        }
    }, [isOpen, sessionId, socket, enqueueSnackbar]);

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

    // Start a new chat session
    const startChatSession = async () => {
        try {
            setLoading(true);
            const customerData = isAuthenticated ? {
                id: user.userId,
                name: user.name,
                email: user.email
            } : {
                name: 'Guest User'
            };

            const response = await axiosInstance.post('/v1/chat/session', customerData);
            setSessionId(response.data.sessionId);
            // Save session ID to localStorage
            localStorage.setItem('chatSessionId', response.data.sessionId);

            if (socket) {
                socket.emit('join_session', { sessionId: response.data.sessionId });
            }

            // Add welcome message
            setMessages([{
                sessionId: response.data.sessionId,
                sender: { name: 'NEXC Support', role: 'agent' },
                content: 'Thanks for contacting us! How can we help you today?',
                timestamp: new Date()
            }]);
        } catch (error) {
            console.error('Error starting chat session:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = () => {
        setIsOpen(true);
        setHasNewMessages(false);
        if (!sessionId) {
            startChatSession();
        }
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleSendMessage = () => {
        if (!message.trim() || !sessionId || !socket || !socket.connected) {
            if (!socket?.connected) {
                enqueueSnackbar('Connection to chat server lost. Reconnecting...', { variant: 'warning' });
                // Attempt to reconnect
                socket?.connect();
            }
            return;
        }

        const newMessage = {
            sessionId: sessionId,
            sender: {
                id: user?.userId || 'anonymous',
                name: user?.name || 'Guest User',
                role: 'customer'
            },
            content: message,
            timestamp: new Date()
        };

        // Send the message through socket
        socket.emit('send_message', newMessage);

        // Add to local messages state
        setMessages(prev => [...prev, newMessage]);

        // Clear the input
        setMessage('');
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
            await axiosInstance.post(`/v1/chat/session/${sessionId}/feedback`, {
                rating: feedbackRating,
                comments: feedbackComment
            });

            // Thank the user and close the feedback dialog
            setShowFeedback(false);
            handleClose();
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('Failed to submit feedback');
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
                <Button onClick={() => setShowFeedback(false)}>Skip</Button>
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
                        <Box>
                            <IconButton
                                onClick={handleEndChat}
                                color="inherit"
                                sx={{ mr: 1 }}
                                title="End chat"
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                                onClick={handleClose}
                                color="inherit"
                                title="Minimize"
                            >
                                <RemoveIcon />
                            </IconButton>
                        </Box>
                    </ChatHeader>

                    <ChatMessages>
                        {loading ? (
                            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                {messages.map((msg, index) => (
                                    <Message key={index} sent={msg.sender.role === 'customer'}>
                                        {msg.sender.role !== 'customer' && (
                                            <Avatar
                                                sx={{ width: 32, height: 32, mr: 1, ml: 0 }}
                                            >
                                                {msg.sender.name?.charAt(0) || 'S'}
                                            </Avatar>
                                        )}
                                        <Box>
                                            <MessageContent sent={msg.sender.role === 'customer'}>
                                                {msg.fileData ? (
                                                    <FileMessage fileData={msg.fileData} />
                                                ) : (
                                                    <Typography variant="body2">{msg.content}</Typography>
                                                )}
                                            </MessageContent>
                                            <Typography
                                                variant="caption"
                                                color="textSecondary"
                                                sx={{
                                                    mt: 0.5,
                                                    display: 'block',
                                                    textAlign: msg.sender.role === 'customer' ? 'right' : 'left'
                                                }}
                                            >
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Typography>
                                        </Box>
                                    </Message>
                                ))}

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
                        />
                        <IconButton
                            onClick={() => fileInputRef.current?.click()}
                            disabled={fileUploading || loading || !sessionId}
                            sx={{ mr: 1 }}
                        >
                            <AttachFileIcon />
                        </IconButton>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Type a message..."
                            value={message}
                            onChange={(e) => {
                                setMessage(e.target.value);
                                handleTyping();
                            }}
                            onKeyDown={handleKeyDown}
                            size="small"
                            disabled={loading || !sessionId || fileUploading}
                        />
                        {fileUploading ? (
                            <CircularProgress size={24} sx={{ ml: 1 }} />
                        ) : (
                            <IconButton
                                color="primary"
                                onClick={handleSendMessage}
                                disabled={!message.trim() || loading || !sessionId}
                                sx={{ ml: 1 }}
                            >
                                <SendIcon />
                            </IconButton>
                        )}
                    </ChatInput>
                </ChatWindow>
            ) : (
                <Tooltip
                    open={showTooltip}
                    title="Need help? Chat with our support team!"
                    placement="left"
                    arrow
                >
                    <Badge
                        color="error"
                        variant="dot"
                        invisible={!hasNewMessages}
                        overlap="circular"
                    >
                        <ChatFab
                            color="primary"
                            onClick={handleOpen}
                            aria-label="chat"
                        >
                            <ChatIcon />
                        </ChatFab>
                    </Badge>
                </Tooltip>
            )}
            <FeedbackDialog />
        </>
    );
}