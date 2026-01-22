import React, { useState, useEffect, useRef, useCallback } from 'react';
import axiosInstance from '../../../axiosConfig';
import {
    Container,
    Grid,
    Card,
    Typography,
    Paper,
    Box,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    TextField,
    Button,
    CircularProgress,
    LinearProgress,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    List as MUIList,
    Stack,
    alpha,
    Fade,
    Tooltip,
    AppBar,
    Toolbar,
    ListItemButton,
    IconButton
} from '@mui/material';
import {
    Send as SendIcon,
    Refresh as RefreshIcon,
    Chat as ChatIcon,
    TransferWithinAStation as TransferWithinAStationIcon,
    Search as SearchIcon,
    FiberManualRecord as OnlineIcon,
    Schedule as ScheduleIcon,
    CheckCircle as CheckCircleIcon,
    AttachFile as AttachFileIcon,
    GetApp as DownloadIcon,
    Visibility as ReadIcon,
    Schedule as PendingIcon,
    Inbox as AllChatsIcon,
    Timer as WaitingIcon,
    PhoneInTalk as ActiveIcon,
    TaskAlt as CompletedIcon,
    FilterList as FilterListIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useSnackbar } from 'notistack';
import { io } from 'socket.io-client';
import { styled, useTheme } from '@mui/material/styles';
import Page from '../../../components/Page';
// import Breadcrumbs from '../../../components/Breadcrumbs';
import { DEV_CONFIG } from '../../../config/development';
import { useAuth } from '../../../contexts/AuthContext';
import CreateTicketDialog from '../../../components/_dashboard/service/CreateTicketDialog';

// ----------------------------------------------------------------------
// Modern Styled Components for Better UX
// ----------------------------------------------------------------------

const ChatContainer = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[4],
  
  // Mobile: Full screen height minus header
  [theme.breakpoints.down('md')]: {
    height: 'calc(100vh - 200px)',
    minHeight: 400,
    borderRadius: 0,
  },
  
  // Tablet: Fixed comfortable height
  [theme.breakpoints.between('md', 'lg')]: {
    height: 550,
    minHeight: 450,
  },
  
  // Desktop: Fixed standard height - ensures input is always visible
  [theme.breakpoints.up('lg')]: {
    height: 600,
    minHeight: 500,
  },
}));

const SessionsList = styled(Box)(({ theme }) => ({
  height: '100%',
  borderRight: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  flexDirection: 'column',
  
  // Tablet: Optimize scrolling
  [theme.breakpoints.between('md', 'lg')]: {
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
    '&::-webkit-scrollbar': {
      width: 8,
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: theme.palette.grey[200],
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.grey[400],
      borderRadius: 4,
    },
  },
}));

const SessionItem = styled(ListItem, {
  shouldForwardProp: (prop) => prop !== 'isActive' && prop !== 'hasUnread',
})(({ theme, isActive, hasUnread }) => ({
  cursor: 'pointer',
  borderRadius: theme.shape.borderRadius,
  transition: 'all 0.2s ease-in-out',
  position: 'relative',
  
  // Mobile & Tablet: Touch-friendly padding
  [theme.breakpoints.down('lg')]: {
    margin: theme.spacing(0.5, 1),
    padding: theme.spacing(2),
    minHeight: 72, // Touch target minimum
  },
  
  // Desktop: Compact padding
  [theme.breakpoints.up('lg')]: {
    margin: theme.spacing(0.5, 1),
    padding: theme.spacing(1.5),
  },
  
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    transform: 'translateX(4px)',
  },
  ...(isActive && {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.16),
    },
  }),
  ...(hasUnread && {
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 8,
      right: 8,
      width: 8,
      height: 8,
      borderRadius: '50%',
      backgroundColor: theme.palette.error.main,
    },
  }),
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  // Use CSS Grid for reliable layout - header, messages, input
  display: 'grid',
  gridTemplateRows: 'auto 1fr auto', // header auto, messages flex, input auto
  height: '100%',
  flex: 1, // Take remaining space in flex parent
  overflow: 'hidden',
  minHeight: 0, // Important for nested flex/grid
}));

const MessagesList = styled(Box)(({ theme }) => ({
  overflow: 'auto',
  padding: theme.spacing(1),
  '&::-webkit-scrollbar': {
    width: 6,
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: alpha(theme.palette.grey[500], 0.1),
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: alpha(theme.palette.grey[500], 0.3),
    borderRadius: 3,
    '&:hover': {
      backgroundColor: alpha(theme.palette.grey[500], 0.5),
    },
  },
}));

// New: Dedicated input container with guaranteed visibility
const InputContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  // Ensure it's always visible
  position: 'relative',
  zIndex: 10,
}));

const MessageBubble = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isAgent',
})(({ theme, isAgent }) => ({
  maxWidth: '70%',
  marginBottom: theme.spacing(1),
  alignSelf: isAgent ? 'flex-end' : 'flex-start',
  padding: theme.spacing(1, 1.5),
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: isAgent 
    ? theme.palette.primary.main 
    : alpha(theme.palette.grey[500], 0.1),
  color: isAgent 
    ? theme.palette.primary.contrastText 
    : theme.palette.text.primary,
  wordWrap: 'break-word',
  position: 'relative',
  
  // Tablet: Larger text for readability
  [theme.breakpoints.between('md', 'lg')]: {
    fontSize: '0.95rem',
    lineHeight: 1.5,
    padding: theme.spacing(1.5, 2),
    maxWidth: '75%',
  },
  
  // Mobile: Even larger
  [theme.breakpoints.down('md')]: {
    fontSize: '1rem',
    lineHeight: 1.6,
    padding: theme.spacing(1.5, 2),
    maxWidth: '85%',
  },
  
  '&:hover .message-actions': {
    opacity: 1,
  },
}));

const TypingIndicator = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  color: theme.palette.text.secondary,
  fontStyle: 'italic',
  '& .dot': {
    width: 4,
    height: 4,
    borderRadius: '50%',
    backgroundColor: theme.palette.text.secondary,
    margin: '0 1px',
    animation: 'typing 1.4s infinite ease-in-out',
    '&:nth-of-type(1)': { animationDelay: '0s' },
    '&:nth-of-type(2)': { animationDelay: '0.2s' },
    '&:nth-of-type(3)': { animationDelay: '0.4s' },
  },
  '@keyframes typing': {
    '0%, 80%, 100%': { opacity: 0.3 },
    '40%': { opacity: 1 },
  },
}));

const StatsCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(1.5),
  textAlign: 'center',
  height: '100%',
  transition: 'all 0.3s ease-in-out',
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.dark, 0.05)} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
    borderColor: theme.palette.primary.main,
  },
}));

const FilterChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'isActive',
})(({ theme, isActive }) => ({
  margin: theme.spacing(0.5),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  border: `1.5px solid ${isActive ? theme.palette.primary.main : theme.palette.divider}`,
  backgroundColor: isActive ? theme.palette.primary.main : theme.palette.background.default,
  color: isActive ? theme.palette.primary.contrastText : theme.palette.text.primary,
  fontWeight: isActive ? 600 : 500,
  
  // Enhanced hover state
  '&:hover': {
    backgroundColor: isActive ? theme.palette.primary.dark : alpha(theme.palette.primary.main, 0.08),
    borderColor: theme.palette.primary.main,
    transform: 'translateY(-2px)',
    boxShadow: isActive 
      ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`
      : `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
  
  '& .MuiChip-icon': {
    color: isActive ? 'inherit' : theme.palette.text.secondary,
    transition: 'transform 0.3s ease-in-out',
  },
  
  '&:hover .MuiChip-icon': {
    transform: 'scale(1.1) rotate(5deg)',
  },
}));

const ChatHeader = styled(AppBar)(({ theme }) => ({
  position: 'static',
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: 'none',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

// ----------------------------------------------------------------------

export default function ChatManagement() {
    const { user, isAuthenticated } = useAuth();
    const theme = useTheme();
    const [activeSessions, setActiveSessions] = useState([]);
    const [closedSessions, setClosedSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [sessionMessages, setSessionMessages] = useState({});
    const [messageText, setMessageText] = useState('');
    const [tabValue, setTabValue] = useState(0);
    const [sessionsLoading, setSessionsLoading] = useState(false);
    const [closedSessionsLoading, setClosedSessionsLoading] = useState(false);
    const [unreadSessions, setUnreadSessions] = useState(new Set());
    const [transferDialogOpen, setTransferDialogOpen] = useState(false);
    const [availableAgents, setAvailableAgents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [realTimeStats, setRealTimeStats] = useState({
        activeChats: 0,
        pendingChats: 0,
        totalAgentsOnline: 0,
        totalMessagesToday: 0,
        averageWaitTime: 0,
        customerSatisfactionRate: 0
    });
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [agentTyping, setAgentTyping] = useState({});
    const [customerTyping, setCustomerTyping] = useState({});
    const [fileUpload, setFileUpload] = useState({ progress: 0, fileName: null });
    const [createTicketDialogOpen, setCreateTicketDialogOpen] = useState(false);

    const socketRef = useRef(null);
    const { enqueueSnackbar } = useSnackbar();
    const fileInputRef = useRef(null);

    // Enhanced Message Component with status and file support
    const EnhancedMessage = ({ message, index }) => {
        // Handle both old format (sender: 'agent') and new format (sender: { role: 'agent' })
        const isAgent = message.sender === 'agent' || message.sender?.role === 'agent';
        
        const getMessageStatus = () => {
            if (message.readBy && message.readBy.length > 0) {
                return <ReadIcon sx={{ fontSize: 12, color: 'success.main' }} />;
            }
            if (message.delivered) {
                return <CheckCircleIcon sx={{ fontSize: 12, color: 'info.main' }} />;
            }
            return <PendingIcon sx={{ fontSize: 12, color: 'warning.main' }} />;
        };

        const handleFileDownload = (file) => {
            const link = document.createElement('a');
            link.href = `/uploads/chat/${file.filename}`;
            link.download = file.originalName;
            link.click();
        };

        return (
            <MessageBubble key={message._id || index} isAgent={isAgent}>
                {message.files && message.files.length > 0 && (
                    <Box sx={{ mb: 1 }}>
                        {message.files.map((file, fileIndex) => (
                            <Box
                                key={fileIndex}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    borderRadius: 1,
                                    p: 1,
                                    mb: 0.5,
                                    cursor: 'pointer'
                                }}
                                onClick={() => handleFileDownload(file)}
                            >
                                <AttachFileIcon sx={{ fontSize: 16, mr: 1 }} />
                                <Typography variant="caption" sx={{ flex: 1 }}>
                                    {file.originalName}
                                </Typography>
                                <DownloadIcon sx={{ fontSize: 14 }} />
                            </Box>
                        ))}
                    </Box>
                )}
                
                <Typography variant="body2">
                    {message.content || message.text || message.message || '[No content]'}
                </Typography>
                
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mt: 0.5 
                }}>
                    <Typography variant="caption" color="text.secondary">
                        {formatTimeAgo(message.timestamp || message.createdAt)}
                    </Typography>
                    {isAgent && (
                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                            {getMessageStatus()}
                        </Box>
                    )}
                </Box>
            </MessageBubble>
        );
    };

    // Helper functions
    const formatTimeAgo = useCallback((date) => {
        if (!date) return 'Unknown';
        try {
            return format(new Date(date), 'HH:mm');
        } catch {
            return 'Invalid date';
        }
    }, []);

    const getFilteredSessions = useCallback(() => {
        let sessions = [];
        
        switch (tabValue) {
            case 0: // All sessions
                sessions = [...activeSessions, ...closedSessions];
                break;
            case 1: // Pending
                sessions = activeSessions.filter(s => s.status === 'pending');
                break;
            case 2: // Active
                sessions = activeSessions.filter(s => s.status === 'active');
                break;
            case 3: // Closed
                sessions = closedSessions;
                break;
            default:
                sessions = activeSessions;
        }

        if (searchTerm) {
            sessions = sessions.filter(session => 
                session.customerInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                session.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                session.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                session.sessionId?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return sessions;
    }, [activeSessions, closedSessions, tabValue, searchTerm]);

    // API functions
    const fetchActiveSessions = useCallback(async () => {
        try {
            setSessionsLoading(true);
            const response = await axiosInstance.get('/v1/chat/sessions/active');
            setActiveSessions(response.data || []);
        } catch (error) {
            console.error('Error fetching active sessions:', error);
            enqueueSnackbar('Failed to fetch active sessions', { variant: 'error' });
        } finally {
            setSessionsLoading(false);
        }
    }, [enqueueSnackbar]);

    const fetchClosedSessions = useCallback(async () => {
        try {
            setClosedSessionsLoading(true);
            const response = await axiosInstance.get('/v1/chat/sessions/closed');
            setClosedSessions(response.data || []);
        } catch (error) {
            console.error('Error fetching closed sessions:', error);
            enqueueSnackbar('Failed to fetch closed sessions', { variant: 'error' });
        } finally {
            setClosedSessionsLoading(false);
        }
    }, [enqueueSnackbar]);

    const fetchRealTimeStats = useCallback(async () => {
        try {
            setAnalyticsLoading(true);
            const response = await axiosInstance.get('/v1/chat/analytics/realtime');
            if (response.data && response.data.success) {
                setRealTimeStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching real-time stats:', error);
            // Don't show error notification for analytics as it's not critical
        } finally {
            setAnalyticsLoading(false);
        }
    }, []);

    const fetchSessionMessages = useCallback(async (sessionId) => {
        try {
            const response = await axiosInstance.get(`/v1/chat/history/${sessionId}`);
            setSessionMessages(prev => ({
                ...prev,
                [sessionId]: response.data || []
            }));
        } catch (error) {
            console.error('Error fetching session messages:', error);
            enqueueSnackbar('Failed to fetch session messages', { variant: 'error' });
        }
    }, [enqueueSnackbar]);

    const handleSendMessage = useCallback(async () => {
        if (!messageText.trim() || !selectedSession) return;

        try {
            // Auto-assign agent if session is pending
            if (selectedSession.status === 'pending') {
                await axiosInstance.put(`/v1/chat/session/${selectedSession.sessionId}/assign`);
                
                // Update local session status
                setActiveSessions(prev => prev.map(session => 
                    session.sessionId === selectedSession.sessionId 
                        ? { ...session, status: 'active', agent: { 
                            id: user?.id || user?._id, 
                            name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.name || 'Agent',
                            assignedAt: new Date()
                        }}
                        : session
                ));
                
                // Update selected session
                setSelectedSession(prev => prev ? { 
                    ...prev, 
                    status: 'active',
                    agent: {
                        id: user?.id || user?._id,
                        name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.name || 'Agent',
                        assignedAt: new Date()
                    }
                } : null);
            }

            const messageData = {
                _id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                sessionId: selectedSession.sessionId,
                content: messageText,
                sender: {
                    id: user?.id || user?._id || 'anonymous-agent',
                    name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.name || 'Agent',
                    role: 'agent'
                },
                timestamp: new Date()
            };

            // Immediately add to local state for instant UI feedback
            setSessionMessages(prev => ({
                ...prev,
                [selectedSession.sessionId]: [...(prev[selectedSession.sessionId] || []), messageData]
            }));
            
            // Send via Socket.IO for real-time delivery
            if (socketRef.current && DEV_CONFIG.ENABLE_SOCKET) {
                socketRef.current.emit('send_message', messageData);
            } else {
                // Fallback to API if socket not available
                await axiosInstance.post(`/v1/chat/history/${selectedSession.sessionId}`, messageData);
                fetchSessionMessages(selectedSession.sessionId);
            }
            
            setMessageText('');
        } catch (error) {
            console.error('Error sending message:', error);
            enqueueSnackbar('Failed to send message', { variant: 'error' });
        }
    }, [messageText, selectedSession, fetchSessionMessages, enqueueSnackbar, user]);

    const handleFileUpload = useCallback(async (event) => {
        const file = event.target.files[0];
        if (!file || !selectedSession) return;

        try {
            setFileUpload({ progress: 0, fileName: file.name });
            
            const formData = new FormData();
            formData.append('file', file);
            formData.append('sessionId', selectedSession.sessionId);

            const response = await axiosInstance.post('/v1/chat/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setFileUpload({ progress, fileName: file.name });
                }
            });

            if (response.data && response.data.success) {
                const fileMessage = {
                    sessionId: selectedSession.sessionId,
                    content: `[File: ${file.name}]`,
                    sender: {
                        id: user?.id || user?._id || 'anonymous-agent',
                        name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.name || 'Agent',
                        role: 'agent'
                    },
                    timestamp: new Date(),
                    files: [response.data.fileInfo],
                    messageType: 'file'
                };

                if (socketRef.current && DEV_CONFIG.ENABLE_SOCKET) {
                    socketRef.current.emit('send_message', fileMessage);
                }

                enqueueSnackbar('File uploaded successfully', { variant: 'success' });
                setFileUpload({ progress: 0, fileName: null }); // Reset upload state
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            enqueueSnackbar('Failed to upload file', { variant: 'error' });
            setFileUpload({ progress: 0, fileName: null }); // Reset on error
        }

        // Reset file input
    
        event.target.value = '';
    }, [selectedSession, enqueueSnackbar, user]);

    const handleTyping = useCallback((isTyping) => {
        if (socketRef.current && selectedSession) {
            socketRef.current.emit('typing', {
                sessionId: selectedSession.sessionId,
                from: 'agent',
                isTyping
            });
        }
    }, [selectedSession]);

    const handleSelectSession = useCallback((session) => {
        setSelectedSession(session);
        
        // Join the specific session room for real-time updates
        if (socketRef.current && DEV_CONFIG.ENABLE_SOCKET) {
            socketRef.current.emit('join_session', { sessionId: session.sessionId });
        }
        
        // Fetch messages if not already loaded
        if (!sessionMessages[session.sessionId]) {
            fetchSessionMessages(session.sessionId);
        }
        
        // Remove from unread sessions
        setUnreadSessions(prev => {
            const updated = new Set(prev);
            updated.delete(session.sessionId);
            return updated;
        });
    }, [sessionMessages, fetchSessionMessages]);

    const handleAssignChat = useCallback(async () => {
        if (!selectedSession) return;

        try {
            const response = await axiosInstance.put(`/v1/chat/session/${selectedSession.sessionId}/assign`);
            enqueueSnackbar('Chat assigned successfully', { variant: 'success' });
            
            const updatedAgent = response.data?.agent || {
                id: user?.id || user?._id,
                name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.name || 'Agent',
                assignedAt: new Date()
            };
            
            // Update selectedSession with new status to show message input immediately
            setSelectedSession(prev => ({
                ...prev,
                status: 'active',
                agent: updatedAgent
            }));
            
            // Also update the session in activeSessions list to keep UI consistent
            setActiveSessions(prev => prev.map(session => 
                session.sessionId === selectedSession.sessionId
                    ? { ...session, status: 'active', agent: updatedAgent }
                    : session
            ));
            
            // Don't call fetchActiveSessions() here - we've already updated local state
            // This prevents async re-fetch from causing UI flickering
        } catch (error) {
            console.error('Error assigning chat:', error);
            enqueueSnackbar('Failed to assign chat', { variant: 'error' });
        }
    }, [selectedSession, enqueueSnackbar, user]);

    const handleCloseChat = useCallback(async () => {
        if (!selectedSession) return;

        try {
            await axiosInstance.put(`/v1/chat/session/${selectedSession.sessionId}/close`);
            enqueueSnackbar('Chat closed successfully', { variant: 'success' });
            setSelectedSession(null);
            fetchActiveSessions();
            fetchClosedSessions();
        } catch (error) {
            enqueueSnackbar('Failed to close chat', { variant: 'error' });
        }
    }, [selectedSession, fetchActiveSessions, fetchClosedSessions, enqueueSnackbar]);

    const handleTransferDialogOpen = useCallback(async () => {
        setTransferDialogOpen(true);
        
        try {
            // Fetch available staff members for transfer
            // Since the API doesn't support comma-separated values, we'll fetch all and filter
            const response = await axiosInstance.get('/v1/user');
            const allUsers = response.data || [];
            
            // Filter for staff members (admin, superadmin, support)
            const staffUsers = allUsers.filter(user => 
                ['admin', 'superadmin', 'support'].includes(user.accountType)
            );
            
            setAvailableAgents(staffUsers.map(user => ({
                id: user.userId || user._id,
                name: user.name || `${user.firstName} ${user.lastName}`,
                department: user.department || user.accountType,
                status: user.status || 'active'
            })));
        } catch (error) {
            console.error('Error fetching available agents:', error);
            // Fallback to demo data if API fails
            setAvailableAgents([
                { id: 'demo1', name: 'Support Agent 1', department: 'Customer Support', status: 'active' },
                { id: 'demo2', name: 'Support Agent 2', department: 'Technical Support', status: 'active' },
            ]);
        }
    }, []);

    const handleTransferDialogClose = useCallback(() => {
        setTransferDialogOpen(false);
    }, []);

    const handleTransferToAgent = useCallback(async (agentId) => {
        if (!selectedSession) return;

        try {
            await axiosInstance.post(`/v1/chat/transfer/${selectedSession.sessionId}`, {
                toAgentId: agentId
            });
            enqueueSnackbar('Chat transferred successfully', { variant: 'success' });
            setTransferDialogOpen(false);
            fetchActiveSessions();
        } catch (error) {
            console.error('Error transferring chat:', error);
            enqueueSnackbar('Failed to transfer chat', { variant: 'error' });
        }
    }, [selectedSession, fetchActiveSessions, enqueueSnackbar]);

    // Handle create ticket dialog
    const handleOpenCreateTicket = useCallback(() => {
        if (selectedSession) {
            setCreateTicketDialogOpen(true);
        } else {
            enqueueSnackbar('Please select a chat session first', { variant: 'info' });
        }
    }, [selectedSession, enqueueSnackbar]);

    const handleCloseCreateTicket = useCallback(() => {
        setCreateTicketDialogOpen(false);
    }, []);

    const handleTicketCreated = useCallback((ticket) => {
        enqueueSnackbar(
            `Ticket ${ticket.ticketNumber} created successfully!`,
            { 
                variant: 'success',
                autoHideDuration: 5000
            }
        );
        // Optionally refresh sessions or add ticket reference to session
        if (selectedSession) {
            setSelectedSession(prev => ({
                ...prev,
                linkedTicket: ticket.ticketNumber
            }));
        }
    }, [selectedSession, enqueueSnackbar]);

    // Initialize
    useEffect(() => {
        fetchActiveSessions();
        fetchClosedSessions();
        fetchRealTimeStats();
        
        // Set up real-time stats refresh
        const statsInterval = setInterval(fetchRealTimeStats, 30000); // Refresh every 30 seconds
        
        return () => clearInterval(statsInterval);
    }, [fetchActiveSessions, fetchClosedSessions, fetchRealTimeStats]);

    // Socket connection
    useEffect(() => {
        if (DEV_CONFIG.ENABLE_SOCKET) {
            const socketUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
            
            // Parse token - it may be stored as JSON string (with quotes)
            let authToken = localStorage.getItem('accessToken');
            if (authToken) {
                try {
                    authToken = JSON.parse(authToken);
                } catch (e) {
                    // Token is already a raw string, use as-is
                }
            }
            
            console.log('[ChatManagement] Socket auth token:', authToken ? `${authToken.substring(0, 20)}...` : 'null');
            
            socketRef.current = io(socketUrl, {
                auth: {
                    token: authToken
                },
                transports: ['polling', 'websocket']
            });
            
            socketRef.current.on('connect', () => {
                console.log('✅ ChatManagement: Connected to socket server');
                console.log('📋 ChatManagement: Automatically joined staff room (by role)');
                
                // Join current session room if viewing a session
                if (selectedSession) {
                    console.log(`🔄 ChatManagement: Joining session room: ${selectedSession.sessionId}`);
                    socketRef.current.emit('join_session', { sessionId: selectedSession.sessionId });
                }
            });

            socketRef.current.on('connect_error', (error) => {
                console.error('❌ Socket connection error:', error);
                enqueueSnackbar('Real-time connection failed. Using fallback mode.', { variant: 'warning' });
            });

            socketRef.current.on('disconnect', (reason) => {

                if (reason === 'io server disconnect') {
                    // Server disconnected - will auto-reconnect
                    enqueueSnackbar('Connection lost. Attempting to reconnect...', { variant: 'info' });
                }
            });

            socketRef.current.on('new_message', (messageData) => {
                console.log('📥 ChatManagement: Received new_message:', {
                    sessionId: messageData.sessionId,
                    sender: messageData.sender,
                    contentPreview: messageData.content?.substring(0, 30)
                });
                
                // Avoid duplicating messages we just sent
                setSessionMessages(prev => {
                    const existingMessages = prev[messageData.sessionId] || [];
                    const isDuplicate = existingMessages.some(msg => 
                        msg.content === messageData.content && 
                        Math.abs(new Date(msg.timestamp) - new Date(messageData.timestamp)) < 1000
                    );
                    
                    if (isDuplicate) {

                        return prev;
                    }
                    
                    return {
                        ...prev,
                        [messageData.sessionId]: [...existingMessages, messageData]
                    };
                });
                
                // Mark as unread if not currently viewing this session
                if (messageData.sessionId !== selectedSession?.sessionId) {
                    setUnreadSessions(prev => new Set([...prev, messageData.sessionId]));
                    const customerName = messageData.customerInfo?.name || messageData.customer?.name || 'Customer';
                    enqueueSnackbar(`New message from ${customerName}`, { 
                        variant: 'info',
                        autoHideDuration: 3000 
                    });
                }
                
                // Clear typing indicator for this user
                if (messageData.sender === 'customer') {
                    setCustomerTyping(prev => ({
                        ...prev,
                        [messageData.sessionId]: false
                    }));
                }
            });

            socketRef.current.on('user_typing', (data) => {

                if (data.from === 'customer') {
                    setCustomerTyping(prev => ({
                        ...prev,
                        [data.sessionId]: data.isTyping
                    }));
                } else if (data.from === 'agent') {
                    setAgentTyping(prev => ({
                        ...prev,
                        [data.sessionId]: data.isTyping
                    }));
                }
            });

            socketRef.current.on('new_chat_session', (sessionData) => {
                console.log('🆕 ChatManagement: New chat session created:', {
                    sessionId: sessionData.sessionId,
                    customer: sessionData.customer?.name
                });
                
                setActiveSessions(prev => [sessionData, ...prev]);
                const customerName = sessionData.customerInfo?.name || sessionData.customer?.name || 'Customer';
                enqueueSnackbar(`New chat session from ${customerName}`, { 
                    variant: 'info',
                    autoHideDuration: 5000 
                });
            });

            socketRef.current.on('session_closed', (sessionData) => {
                console.log('📢 Session closed event received:', sessionData);
                
                // Move from active to closed sessions
                setActiveSessions(prev => prev.filter(s => s.sessionId !== sessionData.sessionId));
                setClosedSessions(prev => [{...sessionData, status: 'closed'}, ...prev]);
                
                // If the closed session is currently selected, update it
                setSelectedSession(prev => {
                    if (prev && prev.sessionId === sessionData.sessionId) {
                        return { ...prev, status: 'closed', endedAt: sessionData.closedAt };
                    }
                    return prev;
                });
                
                // Show notification based on who closed the chat
                const sessionLabel = sessionData.sessionId?.slice(-6) || '';
                if (sessionData.closedBy === 'customer') {
                    enqueueSnackbar(`Customer ended chat session ...${sessionLabel}`, { 
                        variant: 'info',
                        autoHideDuration: 5000 
                    });
                } else if (sessionData.closedBy === 'agent') {
                    enqueueSnackbar(`Chat session ...${sessionLabel} closed successfully`, { 
                        variant: 'success',
                        autoHideDuration: 3000 
                    });
                }
            });

            return () => {
                if (socketRef.current) {
                    // Clean up all event listeners to prevent memory leaks
                    socketRef.current.off('connect');
                    socketRef.current.off('connect_error');
                    socketRef.current.off('disconnect');
                    socketRef.current.off('new_message');
                    socketRef.current.off('user_typing');
                    socketRef.current.off('new_chat_session');
                    socketRef.current.off('session_closed');
                    socketRef.current.disconnect();
                }
            };
        }
    }, [selectedSession, enqueueSnackbar]);

    // Authentication check - after all hooks
    if (!isAuthenticated) {
        return (
            <Page title="Chat Management">
                <Container maxWidth="lg">
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="h6" color="error">
                            Authentication required to access chat management
                        </Typography>
                    </Paper>
                </Container>
            </Page>
        );
    }

    return (
        <Page title="Chat Management | NEXC Construction Platform">
            <Container maxWidth="xl" sx={{ py: 1 }}>
                {/* Compact Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        Chat Management
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={fetchActiveSessions}
                            size="small"
                        >
                            Refresh
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<ChatIcon />}
                            onClick={handleOpenCreateTicket}
                            size="small"
                            disabled={!selectedSession}
                        >
                            New Ticket
                        </Button>
                    </Stack>
                </Box>

                {/* Modern Session Statistics - Compact */}
                <Fade in timeout={600}>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={6} sm={6} md={3}>
                            <StatsCard>
                                <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5} sx={{ mb: 0.5 }}>
                                    <ScheduleIcon color="warning" fontSize="small" />
                                    {analyticsLoading ? (
                                        <CircularProgress size={20} color="warning" />
                                    ) : (
                                        <Typography variant="h5" color="warning.main" sx={{ fontWeight: 700 }}>
                                            {realTimeStats.pendingChats || activeSessions.filter(s => s.status === 'pending').length}
                                        </Typography>
                                    )}
                                </Stack>
                                <Typography variant="caption" color="text.secondary">
                                    Pending
                                </Typography>
                            </StatsCard>
                        </Grid>
                        <Grid item xs={6} sm={6} md={3}>
                            <StatsCard>
                                <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5} sx={{ mb: 0.5 }}>
                                    <OnlineIcon color="success" fontSize="small" />
                                    <Typography variant="h5" color="success.main" sx={{ fontWeight: 700 }}>
                                        {realTimeStats.activeChats || activeSessions.filter(s => s.status === 'active').length}
                                    </Typography>
                                </Stack>
                                <Typography variant="caption" color="text.secondary">
                                    Active
                                </Typography>
                            </StatsCard>
                        </Grid>
                        <Grid item xs={6} sm={6} md={3}>
                            <StatsCard>
                                <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5} sx={{ mb: 0.5 }}>
                                    <ChatIcon color="primary" fontSize="small" />
                                    <Typography variant="h5" color="primary.main" sx={{ fontWeight: 700 }}>
                                        {realTimeStats.totalMessagesToday || activeSessions.length}
                                    </Typography>
                                </Stack>
                                <Typography variant="caption" color="text.secondary">
                                    {realTimeStats.totalMessagesToday ? 'Messages' : 'Sessions'}
                                </Typography>
                            </StatsCard>
                        </Grid>
                        <Grid item xs={6} sm={6} md={3}>
                            <StatsCard>
                                <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5} sx={{ mb: 0.5 }}>
                                    <CheckCircleIcon color="info" fontSize="small" />
                                    <Typography variant="h5" color="info.main" sx={{ fontWeight: 700 }}>
                                        {realTimeStats.customerSatisfactionRate || closedSessions.length}
                                    </Typography>
                                </Stack>
                                <Typography variant="caption" color="text.secondary">
                                    Resolved
                                </Typography>
                            </StatsCard>
                        </Grid>
                    </Grid>
                </Fade>

                {/* Session Filters */}
                <Fade in timeout={900}>
                    <Box sx={{ mb: 2 }}>
                        <Box sx={{
                            p: 1.5,
                            borderRadius: 2,
                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.info.main, 0.04)} 100%)`,
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                            backdropFilter: 'blur(8px)'
                        }}>
                            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                                <Typography 
                                    variant="subtitle2" 
                                    sx={{ 
                                        fontWeight: 600,
                                        color: 'text.primary',
                                        mr: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.8
                                    }}
                                >
                                    <FilterListIcon sx={{ fontSize: 20 }} />
                                    Filter Sessions:
                                </Typography>
                                <FilterChip 
                                    label="All Sessions" 
                                    isActive={tabValue === 0}
                                    onClick={() => setTabValue(0)}
                                    icon={<AllChatsIcon />}
                                    variant="outlined"
                                />
                                <FilterChip 
                                    label="Pending" 
                                    isActive={tabValue === 1}
                                    onClick={() => setTabValue(1)}
                                    icon={<WaitingIcon />}
                                    variant="outlined"
                                />
                                <FilterChip 
                                    label="Active" 
                                    isActive={tabValue === 2}
                                    onClick={() => setTabValue(2)}
                                    icon={<ActiveIcon />}
                                    variant="outlined"
                                />
                                <FilterChip 
                                    label="Closed" 
                                    isActive={tabValue === 3}
                                    onClick={() => setTabValue(3)}
                                    icon={<CompletedIcon />}
                                    variant="outlined"
                                />
                            </Stack>
                        </Box>
                    </Box>
                </Fade>

                {/* Main Chat Interface - Modernized */}
                <Fade in timeout={1200}>
                    <ChatContainer>
                        <Grid container spacing={0} sx={{ height: '100%' }}>
                            {/* Sessions List - Wider on tablet for better usability */}
                            <Grid item xs={12} sm={5} md={4} lg={3}>
                                <SessionsList>
                                    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <SearchIcon color="action" />
                                            <TextField
                                                fullWidth
                                                placeholder="Search sessions..."
                                                size="small"
                                                variant="outlined"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                InputProps={{
                                                    sx: { 
                                                        bgcolor: 'background.paper',
                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                            border: 'none'
                                                        }
                                                    }
                                                }}
                                            />
                                        </Stack>
                                    </Box>
                                    
                                    <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                                        {sessionsLoading || closedSessionsLoading ? (
                                            <Box sx={{ p: 3, textAlign: 'center' }}>
                                                <CircularProgress size={24} />
                                            </Box>
                                        ) : (
                                            <List>
                                                {getFilteredSessions().map((session) => (
                                                    <SessionItem
                                                        key={session.sessionId}
                                                        isActive={selectedSession?.sessionId === session.sessionId}
                                                        hasUnread={unreadSessions.has(session.sessionId)}
                                                        onClick={() => handleSelectSession(session)}
                                                    >
                                                        <ListItemAvatar>
                                                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                                {session.customerInfo?.name?.[0] || session.customerName?.[0] || session.customer?.name?.[0] || 'U'}
                                                            </Avatar>
                                                        </ListItemAvatar>
                                                        <ListItemText
                                                            primary={
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Typography component="span" variant="body2" sx={{ fontWeight: 600 }}>
                                                                        {session.customerInfo?.name || session.customerName || session.customer?.name || 'Anonymous User'}
                                                                    </Typography>
                                                                    {session.isFirstChat === false ? (
                                                                        <Chip
                                                                            size="small"
                                                                            label="Returning"
                                                                            variant="filled"
                                                                            color="info"
                                                                            sx={{ height: 20, fontSize: '0.7rem' }}
                                                                        />
                                                                    ) : (
                                                                        <Chip
                                                                            size="small"
                                                                            label="New"
                                                                            variant="filled"
                                                                            color="success"
                                                                            sx={{ height: 20, fontSize: '0.7rem' }}
                                                                        />
                                                                    )}
                                                                </Box>
                                                            }
                                                            secondary={
                                                                <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                                                                    <Typography component="span" variant="caption" color="text.secondary" noWrap>
                                                                        {session.lastMessage?.content || session.lastMessage?.text || session.lastMessage || 'No messages yet'}
                                                                    </Typography>
                                                                    <Chip
                                                                        size="small"
                                                                        label={session.status}
                                                                        color={
                                                                            session.status === 'active' ? 'success' : 
                                                                            session.status === 'pending' ? 'warning' : 'default'
                                                                        }
                                                                    />
                                                                </Box>
                                                            }
                                                        />
                                                    </SessionItem>
                                                ))}
                                                {getFilteredSessions().length === 0 && (
                                                    <Box sx={{ p: 4, textAlign: 'center' }}>
                                                        <ChatIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.3 }} />
                                                        <Typography variant="body2" color="text.secondary">
                                                            No sessions found
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </List>
                                        )}
                                    </Box>
                                </SessionsList>
                            </Grid>

                            {/* Chat Messages Area - Adjust for tablet layout */}
                            <Grid item xs={12} sm={7} md={8} lg={9} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                {selectedSession ? (
                                    <MessagesContainer>
                                        {/* Chat Header */}
                                        <ChatHeader position="static" elevation={0}>
                                            <Toolbar>
                                                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                                    {selectedSession.customerInfo?.name?.[0] || selectedSession.customerName?.[0] || selectedSession.customer?.name?.[0] || 'U'}
                                                </Avatar>
                                                <Box sx={{ flexGrow: 1 }}>
                                                    <Typography variant="h6">
                                                        {selectedSession.customerInfo?.name || selectedSession.customerName || selectedSession.customer?.name || 'Anonymous User'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Session ID: {selectedSession.sessionId}
                                                    </Typography>
                                                </Box>
                                                <Stack direction="row" spacing={1}>
                                                    {selectedSession.status === 'pending' && (
                                                        <Button
                                                            variant="contained"
                                                            size="small"
                                                            onClick={handleAssignChat}
                                                        >
                                                            Take Chat
                                                        </Button>
                                                    )}
                                                    {selectedSession.status === 'active' && (
                                                        <>
                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                onClick={handleTransferDialogOpen}
                                                                startIcon={<TransferWithinAStationIcon />}
                                                            >
                                                                Transfer
                                                            </Button>
                                                            <Button
                                                                variant="outlined"
                                                                color="error"
                                                                size="small"
                                                                onClick={handleCloseChat}
                                                            >
                                                                Close
                                                            </Button>
                                                        </>
                                                    )}
                                                    {selectedSession.status === 'closed' && (
                                                        <Box sx={{
                                                            px: 2,
                                                            py: 1,
                                                            bgcolor: 'success.light',
                                                            borderRadius: 1,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1
                                                        }}>
                                                            <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                                                            <Typography variant="caption" sx={{ color: 'success.dark', fontWeight: 600 }}>
                                                                Chat Closed
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Stack>
                                            </Toolbar>
                                        </ChatHeader>

                                        {/* Messages List */}
                                        <MessagesList>
                                            
                                            {sessionMessages[selectedSession.sessionId]?.length > 0 ? (
                                                <>
                                                    {sessionMessages[selectedSession.sessionId].map((message, index) => (
                                                        <EnhancedMessage key={message._id || index} message={message} index={index} />
                                                    ))}
                                                    
                                                    {/* Typing Indicators */}
                                                    {customerTyping[selectedSession.sessionId] && (
                                                        <TypingIndicator>
                                                            <Typography variant="caption" sx={{ mr: 1 }}>
                                                                {selectedSession.customerInfo?.name || 'Customer'} is typing
                                                            </Typography>
                                                            <Box className="dot" />
                                                            <Box className="dot" />
                                                            <Box className="dot" />
                                                        </TypingIndicator>
                                                    )}
                                                    
                                                    {agentTyping[selectedSession.sessionId] && (
                                                        <TypingIndicator>
                                                            <Typography variant="caption" sx={{ mr: 1 }}>
                                                                Agent is typing
                                                            </Typography>
                                                            <Box className="dot" />
                                                            <Box className="dot" />
                                                            <Box className="dot" />
                                                        </TypingIndicator>
                                                    )}
                                                </>
                                            ) : (
                                                <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                                                    <ChatIcon sx={{ fontSize: 48, opacity: 0.3, mb: 2 }} />
                                                    <Typography variant="body2">
                                                        No messages in this conversation yet
                                                    </Typography>
                                                </Box>
                                            )}
                                        </MessagesList>

                                        {/* Message Input - Using dedicated InputContainer for guaranteed visibility */}
                                        {selectedSession && selectedSession.status !== 'closed' && (
                                            <InputContainer>
                                                {/* File Upload Progress */}
                                                {fileUpload.fileName && (
                                                    <Box sx={{ mb: 2 }}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Uploading: {fileUpload.fileName}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                                            <Box sx={{ width: '100%', mr: 1 }}>
                                                                <LinearProgress variant="determinate" value={fileUpload.progress} />
                                                            </Box>
                                                            <Box sx={{ minWidth: 35 }}>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {fileUpload.progress}%
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                )}
                                                
                                                <Stack direction="row" spacing={1} alignItems="flex-end">
                                                    <input
                                                        type="file"
                                                        ref={fileInputRef}
                                                        style={{ display: 'none' }}
                                                        onChange={handleFileUpload}
                                                        accept="image/*,.pdf,.doc,.docx,.txt"
                                                    />
                                                    
                                                    <Tooltip title="Attach file">
                                                        <IconButton
                                                            onClick={() => fileInputRef.current?.click()}
                                                            sx={{ mr: 1 }}
                                                        >
                                                            <AttachFileIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    
                                                    <TextField
                                                        fullWidth
                                                        multiline
                                                        maxRows={3}
                                                        placeholder="Type your message..."
                                                        value={messageText}
                                                        onChange={(e) => {
                                                            setMessageText(e.target.value);
                                                            // Send typing indicator
                                                            if (e.target.value.length > 0) {
                                                                handleTyping(true);
                                                            } else {
                                                                handleTyping(false);
                                                            }
                                                        }}
                                                        onKeyPress={(e) => {
                                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                                e.preventDefault();
                                                                handleTyping(false);
                                                                handleSendMessage();
                                                            }
                                                        }}
                                                        onFocus={() => handleTyping(true)}
                                                        onBlur={() => handleTyping(false)}
                                                    />
                                                    <Button
                                                        variant="contained"
                                                        onClick={() => {
                                                            handleTyping(false);
                                                            handleSendMessage();
                                                        }}
                                                        disabled={!messageText.trim()}
                                                        startIcon={<SendIcon />}
                                                    >
                                                        Send
                                                    </Button>
                                                </Stack>
                                            </InputContainer>
                                        )}
                                        
                                        {/* Closed session message */}
                                        {selectedSession && selectedSession.status === 'closed' && (
                                            <InputContainer sx={{ bgcolor: 'grey.100', display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <CheckCircleIcon sx={{ color: 'success.main' }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    This session is closed. Message input is not available for closed sessions.
                                                </Typography>
                                            </InputContainer>
                                        )}
                                    </MessagesContainer>
                                ) : (
                                    <Box
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexDirection: 'column',
                                            color: 'text.secondary'
                                        }}
                                    >
                                        <ChatIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                                        <Typography variant="h6" gutterBottom>
                                            Select a chat session
                                        </Typography>
                                        <Typography variant="body2">
                                            Choose a session from the left to start managing customer conversations
                                        </Typography>
                                    </Box>
                                )}
                            </Grid>
                        </Grid>
                    </ChatContainer>
                </Fade>

                {/* Transfer Dialog */}
                <Dialog
                    open={transferDialogOpen}
                    onClose={handleTransferDialogClose}
                    aria-labelledby="transfer-dialog-title"
                >
                    <DialogTitle id="transfer-dialog-title">
                        Transfer Chat to Another Agent
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Select an agent to transfer this conversation to:
                        </DialogContentText>
                        <MUIList sx={{ pt: 1 }}>
                            {availableAgents.length === 0 ? (
                                <ListItem>
                                    <ListItemText
                                        primary="No agents available"
                                        secondary="All agents may be offline or busy"
                                    />
                                </ListItem>
                            ) : (
                                availableAgents.map((agent) => (
                                    <ListItemButton 
                                        onClick={() => handleTransferToAgent(agent.id)} 
                                        key={agent.id}
                                        disabled={agent.status !== 'active'}
                                    >
                                        <ListItemAvatar>
                                            <Avatar sx={{ 
                                                bgcolor: agent.status === 'active' ? 'success.main' : 'grey.500'
                                            }}>
                                                {agent.name.charAt(0)}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={agent.name}
                                            secondary={`${agent.department} • ${agent.status === 'active' ? 'Available' : 'Unavailable'}`}
                                        />
                                    </ListItemButton>
                                ))
                            )}
                        </MUIList>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleTransferDialogClose}>Cancel</Button>
                    </DialogActions>
                </Dialog>

                {/* Create Ticket Dialog */}
                <CreateTicketDialog
                    open={createTicketDialogOpen}
                    onClose={handleCloseCreateTicket}
                    sessionData={selectedSession}
                    onTicketCreated={handleTicketCreated}
                />
            </Container>
        </Page>
    );
}