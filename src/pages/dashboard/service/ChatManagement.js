import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    TextField,
    Button,
    Divider,
    Badge,
    Tabs,
    Tab,
    IconButton,
    Paper,
    CircularProgress,
    LinearProgress,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    List as MUIList,
    FormControl,
    Select,
    MenuItem
} from '@mui/material';
import {
    Send as SendIcon,
    Refresh as RefreshIcon,
    Chat as ChatIcon,
    Close as CloseIcon,
    Info as InfoIcon,
    AttachFile as AttachFileIcon,
    FileDownload as FileDownloadIcon,
    PictureAsPdf as PictureAsPdfIcon,
    Image as ImageIcon,
    InsertDriveFile as InsertDriveFileIcon,
    TransferWithinAStation as TransferWithinAStationIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useSnackbar } from 'notistack';
import { io } from 'socket.io-client';
import axios from '../../../axiosConfig';
import Page from '../../../components/Page';
import Label from '../../../components/Label';
import Scrollbar from '../../../components/Scrollbar';

// function TabPanel(props) {
//     const { children, value, index, ...other } = props;
//     return (
//         <div role="tabpanel" hidden={value !== index} {...other}>
//             {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
//         </div>
//     );
// }

// Update the AnalyticsPanel component
const AnalyticsPanel = () => {
    const [metrics, setMetrics] = useState({
        averageResponseTime: 0,
        resolvedChats: 0,
        satisfactionRate: 0,
        activeAgents: 0
    });
    const [period, setPeriod] = useState('today');
    const [loading, setLoading] = useState(false);
    // const { enqueueSnackbar } = useSnackbar();

    const fetchMetrics = useCallback(async () => {
        try {
            setLoading(true);

            // DEVELOPMENT MODE: Use mock data instead of actual API call
            // In production, you would use:
            // const response = await axios.get(`/v1/chat/analytics?period=${period}`);
            // setMetrics(response.data);

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));

            // Mock data based on period
            const mockData = {
                today: {
                    averageResponseTime: 45,
                    resolvedChats: 12,
                    satisfactionRate: 94,
                    activeAgents: 3
                },
                week: {
                    averageResponseTime: 52,
                    resolvedChats: 87,
                    satisfactionRate: 89,
                    activeAgents: 5
                },
                month: {
                    averageResponseTime: 58,
                    resolvedChats: 324,
                    satisfactionRate: 91,
                    activeAgents: 8
                }
            };

            setMetrics(mockData[period]);
        } catch (error) {
            console.error('Failed to load analytics:', error);
            // Don't show error notification in development for mock data
            // enqueueSnackbar('Failed to load analytics data', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    }, [period]); // Remove enqueueSnackbar from dependencies since we're not using it

    useEffect(() => {
        fetchMetrics();
    }, [fetchMetrics]);

    return (
        <Card sx={{ mb: 3 }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Chat Analytics</Typography>
                    <FormControl variant="standard" sx={{ minWidth: 120 }}>
                        <Select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            size="small"
                        >
                            <MenuItem value="today">Today</MenuItem>
                            <MenuItem value="week">This Week</MenuItem>
                            <MenuItem value="month">This Month</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                {loading ? (
                    <LinearProgress />
                ) : (
                    <Grid container spacing={2}>
                        <Grid item xs={3}>
                            <Box textAlign="center">
                                <Typography variant="h4">{metrics.averageResponseTime}s</Typography>
                                <Typography variant="caption" color="text.secondary">Avg. Response Time</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={3}>
                            <Box textAlign="center">
                                <Typography variant="h4">{metrics.resolvedChats}</Typography>
                                <Typography variant="caption" color="text.secondary">Resolved Chats</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={3}>
                            <Box textAlign="center">
                                <Typography variant="h4">{metrics.satisfactionRate}%</Typography>
                                <Typography variant="caption" color="text.secondary">Satisfaction Rate</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={3}>
                            <Box textAlign="center">
                                <Typography variant="h4">{metrics.activeAgents}</Typography>
                                <Typography variant="caption" color="text.secondary">Active Agents</Typography>
                            </Box>
                        </Grid>
                    </Grid>
                )}
            </CardContent>
        </Card>
    );
};

export default function ChatManagement() {
    // State declarations first
    const [activeSessions, setActiveSessions] = useState([]);
    const [closedSessions, setClosedSessions] = useState([]);
    const [closedSessionsLoading, setClosedSessionsLoading] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionsLoading, setSessionsLoading] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [socket, setSocket] = useState(null);
    const messagesEndRef = useRef(null);
    const { enqueueSnackbar } = useSnackbar();
    const [unreadSessions, setUnreadSessions] = useState(new Set());
    const [cannedResponses, setCannedResponses] = useState([
        { id: '1', title: 'Greeting', content: 'Hello! How can I help you today?' },
        { id: '2', title: 'Thanks', content: 'Thank you for reaching out to us. I appreciate your patience.' },
        { id: '3', title: 'Closing', content: 'Is there anything else I can help you with today?' },
        { id: '4', title: 'Wait', content: 'Please give me a moment to check that for you.' },
        // Add more predefined responses as needed
    ]);
    const [typingUsers, setTypingUsers] = useState({});
    const [showCustomerInfo, setShowCustomerInfo] = useState(false);
    const [customerData, setCustomerData] = useState(null);
    const [customerDataLoading, setCustomerDataLoading] = useState(false);

    // Add state for file handling
    const [fileUploading, setFileUploading] = useState(false);
    const fileInputRef = useRef(null);


    // Add states for transfer dialog
    const [transferDialogOpen, setTransferDialogOpen] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [availableAgents, setAvailableAgents] = useState([
        { id: 'agent1', name: 'John Smith', department: 'Technical Support' },
        { id: 'agent2', name: 'Maria Garcia', department: 'Billing' },
        { id: 'agent3', name: 'Alex Johnson', department: 'Sales' }
    ]);

    const SOCKET_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

    const fetchActiveSessions = useCallback(async () => {
        try {
            setSessionsLoading(true);

            // DEVELOPMENT MODE: Use mock data
            // In production: const response = await axios.get('/v1/chat/sessions/active');

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 300));

            // Mock active sessions data
            const mockActiveSessions = [
                {
                    sessionId: 'session-1',
                    status: 'pending',
                    startedAt: new Date(Date.now() - 5 * 60000).toISOString(),
                    lastActivity: new Date().toISOString(),
                    customer: {
                        id: 'cust-1',
                        name: 'John Doe',
                        email: 'john@example.com',
                        isAnonymous: false
                    }
                },
                {
                    sessionId: 'session-2',
                    status: 'active',
                    startedAt: new Date(Date.now() - 25 * 60000).toISOString(),
                    lastActivity: new Date(Date.now() - 2 * 60000).toISOString(),
                    customer: {
                        id: 'cust-2',
                        name: 'Jane Smith',
                        email: 'jane@example.com',
                        isAnonymous: false
                    },
                    agent: {
                        id: 'agent-1',
                        name: 'Support Agent'
                    }
                },
                {
                    sessionId: 'session-3',
                    status: 'pending',
                    startedAt: new Date(Date.now() - 2 * 60000).toISOString(),
                    lastActivity: new Date(Date.now() - 1 * 60000).toISOString(),
                    customer: {
                        id: 'anonymous',
                        name: 'Guest User',
                        isAnonymous: true
                    }
                }
            ];

            setActiveSessions(mockActiveSessions);
        } catch (error) {
            console.error('Error fetching active sessions:', error);
            enqueueSnackbar('Failed to load active chat sessions', { variant: 'error' });
        } finally {
            setSessionsLoading(false);
        }
    }, [enqueueSnackbar]);

    const fetchClosedSessions = useCallback(async () => {
        try {
            setClosedSessionsLoading(true);

            // DEVELOPMENT MODE: Use mock data
            // In production: const response = await axios.get('/v1/chat/sessions/closed');

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 300));

            // Mock closed sessions data
            const mockClosedSessions = [
                {
                    sessionId: 'session-4',
                    status: 'closed',
                    startedAt: new Date(Date.now() - 120 * 60000).toISOString(),
                    lastActivity: new Date(Date.now() - 90 * 60000).toISOString(),
                    endedAt: new Date(Date.now() - 90 * 60000).toISOString(),
                    customer: {
                        id: 'cust-3',
                        name: 'Mike Johnson',
                        email: 'mike@example.com',
                        isAnonymous: false
                    },
                    agent: {
                        id: 'agent-2',
                        name: 'Support Agent'
                    }
                },
                {
                    sessionId: 'session-5',
                    status: 'closed',
                    startedAt: new Date(Date.now() - 24 * 60 * 60000).toISOString(),
                    lastActivity: new Date(Date.now() - 23 * 60 * 60000).toISOString(),
                    endedAt: new Date(Date.now() - 23 * 60 * 60000).toISOString(),
                    customer: {
                        id: 'cust-4',
                        name: 'Sarah Williams',
                        email: 'sarah@example.com',
                        isAnonymous: false
                    },
                    agent: {
                        id: 'agent-1',
                        name: 'Support Agent'
                    }
                }
            ];

            setClosedSessions(mockClosedSessions);
        } catch (error) {
            console.error('Error fetching closed sessions:', error);
            enqueueSnackbar('Failed to load closed chat sessions', { variant: 'error' });
        } finally {
            setClosedSessionsLoading(false);
        }
    }, [enqueueSnackbar]);

    // Update the fetchCannedResponses function
    const fetchCannedResponses = useCallback(async () => {
        try {
            // For now, use mock data
            setCannedResponses([
                { id: '1', title: 'Greeting', content: 'Hello! How can I help you today?' },
                { id: '2', title: 'Thanks', content: 'Thank you for reaching out to us. I appreciate your patience.' },
                { id: '3', title: 'Closing', content: 'Is there anything else I can help you with today?' },
                { id: '4', title: 'Wait', content: 'Please give me a moment to check that for you.' },
                // Add more predefined responses as needed
            ]);

            // In future, this would be:
            // const response = await axios.get('/chat/canned-responses');
            // setCannedResponses(response.data);
        } catch (error) {
            console.error('Error fetching canned responses:', error);
        }
    }, []);

    // Define these functions with useCallback before they're used
    const fetchChatHistory = useCallback(async (sessionId) => {
        try {
            setLoading(true);

            // DEVELOPMENT MODE: Use mock data
            // In production: const response = await axios.get(`/v1/chat/history/${sessionId}`);

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));

            // Mock messages for the selected session
            const now = new Date();
            const mockMessages = [
                {
                    sessionId: sessionId,
                    sender: {
                        id: 'customer',
                        name: selectedSession?.customer.name || 'Customer',
                        role: 'customer'
                    },
                    content: 'Hello, I need help with my account',
                    timestamp: new Date(now.getTime() - 10 * 60000).toISOString()
                },
                {
                    sessionId: sessionId,
                    sender: {
                        id: 'agent',
                        name: 'Support Agent',
                        role: 'agent'
                    },
                    content: 'Hello! I\'d be happy to help. Could you please provide your account details?',
                    timestamp: new Date(now.getTime() - 9 * 60000).toISOString()
                },
                {
                    sessionId: sessionId,
                    sender: {
                        id: 'customer',
                        name: selectedSession?.customer.name || 'Customer',
                        role: 'customer'
                    },
                    content: 'My account number is ACC-12345',
                    timestamp: new Date(now.getTime() - 8 * 60000).toISOString()
                },
                {
                    sessionId: sessionId,
                    sender: {
                        id: 'agent',
                        name: 'Support Agent',
                        role: 'agent'
                    },
                    content: 'Thank you. I can see your account now. What specific issue are you experiencing?',
                    timestamp: new Date(now.getTime() - 7 * 60000).toISOString()
                }
            ];

            setMessages(mockMessages);
        } catch (error) {
            console.error('Error fetching chat history:', error);
            enqueueSnackbar('Failed to load chat history', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    }, [enqueueSnackbar, selectedSession]);

    const fetchCustomerDetails = useCallback(async (customerId) => {
        if (!customerId || customerId === 'anonymous') return;

        try {
            setCustomerDataLoading(true);
            // This would connect to your CRM or customer database
            // For now we'll use a mock response
            // const response = await axios.get(`/customers/${customerId}`);

            // Simulate API call with timeout
            await new Promise(resolve => setTimeout(resolve, 500));

            setCustomerData({
                id: customerId,
                joinDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
                orders: [
                    { id: 'ORD-123456', date: new Date(), total: 79.99, status: 'completed' },
                    { id: 'ORD-123123', date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), total: 129.99, status: 'completed' }
                ],
                activeServices: [
                    { id: 'SVC-1', name: 'Broadband 100Mbps' }
                ],
                supportHistory: [
                    { date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), issue: 'Connection issue', resolved: true }
                ]
            });
        } catch (error) {
            console.error('Error fetching customer details:', error);
            enqueueSnackbar('Failed to load customer details', { variant: 'error' });
        } finally {
            setCustomerDataLoading(false);
        }
    }, [enqueueSnackbar]);

    // Now you can safely define handleSelectSession which uses these functions
    const handleSelectSession = useCallback((session) => {
        setSelectedSession(session);
        fetchChatHistory(session.sessionId);

        // Clear unread state when selecting a session
        setUnreadSessions(prev => {
            const updated = new Set(prev);
            updated.delete(session.sessionId);
            return updated;
        });

        // Fetch customer details if available
        if (session.customer && session.customer.id && session.customer.id !== 'anonymous') {
            fetchCustomerDetails(session.customer.id);
        }
    }, [fetchChatHistory, fetchCustomerDetails]);

    // Initialize socket connection
    useEffect(() => {
        const newSocket = io(SOCKET_URL, {
            auth: {
                token: localStorage.getItem('accessToken')
            }
        });

        newSocket.on('connect', () => {
            console.log('Connected to chat server');
        });

        newSocket.on('new_message', (msg) => {
            if (selectedSession && msg.sessionId === selectedSession.sessionId) {
                setMessages(prev => [...prev, msg]);
            } else {
                // Mark session as unread if it's not the currently selected one
                setUnreadSessions(prev => new Set(prev).add(msg.sessionId));
            }

            // Refresh sessions list to update last activity
            fetchActiveSessions();
        });

        // Event listeners to your useEffect where socket is initialized
        newSocket.on('new_chat_session', (session) => {
            // New session to the list without needing a full refresh
            setActiveSessions(prev => [session, ...prev]);

            // Show notification
            enqueueSnackbar('New chat session received!', {
                variant: 'info',
                action: (key) => (
                    <Button size="small" onClick={() => handleSelectSession(session)}>
                        View
                    </Button>
                )
            });
        });

        newSocket.on('session_updated', (data) => {
            // Refresh the sessions list when any session is updated
            fetchActiveSessions();
        });

        newSocket.on('user_typing', (data) => {
            if (data.sessionId === selectedSession?.sessionId) {
                setTypingUsers(prev => ({
                    ...prev,
                    [data.from]: data.isTyping
                }));

                // Auto-clear typing indicator after 3 seconds in case the event gets lost
                setTimeout(() => {
                    setTypingUsers(prev => ({
                        ...prev,
                        [data.from]: false
                    }));
                }, 3000);
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
    }, [selectedSession, fetchActiveSessions, SOCKET_URL, handleSelectSession, enqueueSnackbar]);

    // Send a message
    const handleSendMessage = () => {
        if (!newMessage.trim() || !selectedSession || !socket) return;

        const messageData = {
            sessionId: selectedSession.sessionId,
            sender: {
                id: 'agent', // Replace with actual agent ID
                name: 'Support Agent', // Replace with actual agent name
                role: 'agent'
            },
            content: newMessage,
            timestamp: new Date()
        };

        socket.emit('send_message', messageData);
        setMessages(prev => [...prev, messageData]);
        setNewMessage('');
    };

    // Add file upload handler
    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file || !selectedSession || !socket) return;

        // Add file size check
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            enqueueSnackbar('File size must be less than 5MB', { variant: 'error' });
            return;
        }

        // Create FormData object
        const formData = new FormData();
        formData.append('file', file);
        formData.append('sessionId', selectedSession.sessionId);

        try {
            setFileUploading(true);

            // Upload the file to your server
            const response = await axios.post('/chat/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Create a file message
            const fileMessage = {
                sessionId: selectedSession.sessionId,
                sender: {
                    id: 'agent',
                    name: 'Support Agent',
                    role: 'agent'
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

            enqueueSnackbar('File uploaded successfully', { variant: 'success' });
        } catch (error) {
            console.error('Error uploading file:', error);
            enqueueSnackbar('Failed to upload file', { variant: 'error' });
        } finally {
            setFileUploading(false);
            // Clear the file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Assign yourself to a chat
    const handleAssignChat = async () => {
        if (!selectedSession) return;

        try {
            await axios.put(`/chat/session/${selectedSession.sessionId}/assign`);
            fetchActiveSessions();
            enqueueSnackbar('Chat assigned to you', { variant: 'success' });
        } catch (error) {
            console.error('Error assigning chat:', error);
            enqueueSnackbar('Failed to assign chat', { variant: 'error' });
        }
    };

    // Close a chat session
    const handleCloseSession = async () => {
        if (!selectedSession) return;

        try {
            await axios.put(`/chat/session/${selectedSession.sessionId}/close`);
            fetchActiveSessions();
            setSelectedSession(null);
            setMessages([]);
            enqueueSnackbar('Chat session closed', { variant: 'success' });
        } catch (error) {
            console.error('Error closing chat session:', error);
            enqueueSnackbar('Failed to close chat session', { variant: 'error' });
        }
    };

    // Handle chat transfer
    const handleChatTransfer = async (targetAgentId) => {
        try {
            await axios.post(`/chat/transfer/${selectedSession.sessionId}`, {
                toAgentId: targetAgentId
            });
            enqueueSnackbar('Chat transferred successfully', { variant: 'success' });
        } catch (error) {
            console.error('Error transferring chat:', error);
            enqueueSnackbar('Failed to transfer chat', { variant: 'error' });
        }
    };

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // Scroll to bottom when messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Initial data fetch
    useEffect(() => {
        if (tabValue === 0) {
            fetchActiveSessions();
        } else {
            fetchClosedSessions();
        }
    }, [tabValue, fetchActiveSessions, fetchClosedSessions]);

    useEffect(() => {
        fetchCannedResponses();
    }, [fetchCannedResponses]);

    // Add this in your first useEffect for initial data loading
    useEffect(() => {
        // Initial data fetch based on selected tab
        if (tabValue === 0) {
            fetchActiveSessions();
        } else {
            fetchClosedSessions();
        }

        // Show development mode notification
        if (process.env.NODE_ENV !== 'production') {
            enqueueSnackbar('Running in development mode with mock data', {
                variant: 'info',
                autoHideDuration: 5000,
                anchorOrigin: { vertical: 'top', horizontal: 'center' }
            });
        }
    }, [tabValue, fetchActiveSessions, fetchClosedSessions, enqueueSnackbar]);

    // Add a FileMessage component (you can place this outside the main component)
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

    // Handle transfer dialog open
    const handleTransferDialogOpen = () => {
        setTransferDialogOpen(true);
    };

    // Handle transfer dialog close
    const handleTransferDialogClose = () => {
        setTransferDialogOpen(false);
    };

    // Handle transfer to agent
    const handleTransferToAgent = (agentId) => {
        handleChatTransfer(agentId);
        handleTransferDialogClose();
    };

    return (
        <Page title="Chat Management">
            <Container maxWidth="xl">
                <Box sx={{ mb: 5 }}>
                    <Typography variant="h4" gutterBottom>
                        Chat Management
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Manage customer support chat sessions
                    </Typography>
                </Box>

                <AnalyticsPanel />

                {/* Session Statistics */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ bgcolor: 'primary.lighter', height: '100%' }}>
                            <CardContent>
                                <Typography variant="h3" color="primary.main">
                                    {activeSessions.filter(s => s.status === 'pending').length}
                                </Typography>
                                <Typography variant="subtitle2" sx={{ mt: 1 }}>
                                    Pending Sessions
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ bgcolor: 'success.lighter', height: '100%' }}>
                            <CardContent>
                                <Typography variant="h3" color="success.main">
                                    {activeSessions.filter(s => s.status === 'active').length}
                                </Typography>
                                <Typography variant="subtitle2" sx={{ mt: 1 }}>
                                    Active Sessions
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ bgcolor: 'warning.lighter', height: '100%' }}>
                            <CardContent>
                                <Typography variant="h3" color="warning.main">
                                    {activeSessions.length}
                                </Typography>
                                <Typography variant="subtitle2" sx={{ mt: 1 }}>
                                    Total Open Sessions
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Card>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={tabValue} onChange={handleTabChange}>
                            <Tab label="Active Chats" />
                            <Tab label="Closed Chats" />
                        </Tabs>
                    </Box>

                    <Grid container spacing={0}>
                        {/* Left sidebar - Sessions list */}
                        <Grid item xs={12} md={4} lg={3} sx={{ borderRight: '1px solid', borderColor: 'divider' }}>
                            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle1">Chat Sessions</Typography>
                                <IconButton onClick={fetchActiveSessions}>
                                    <RefreshIcon />
                                </IconButton>
                            </Box>
                            <Divider />

                            {tabValue === 0 ? (
                                sessionsLoading ? (
                                    <LinearProgress />
                                ) : (
                                    <Scrollbar sx={{ height: { md: 'calc(100vh - 400px)' } }}>
                                        <List>
                                            {activeSessions.length > 0 ? (
                                                activeSessions.map(session => (
                                                    <ListItem
                                                        key={session.sessionId}
                                                        button
                                                        selected={selectedSession?.sessionId === session.sessionId}
                                                        onClick={() => handleSelectSession(session)}
                                                        divider
                                                    >
                                                        <ListItemAvatar>
                                                            <Badge
                                                                color={
                                                                    unreadSessions.has(session.sessionId)
                                                                        ? 'error'
                                                                        : session.status === 'pending'
                                                                            ? 'warning'
                                                                            : 'primary'
                                                                }
                                                                variant="dot"
                                                                overlap="circular"
                                                            >
                                                                <Avatar>
                                                                    {session.customer.name.charAt(0).toUpperCase()}
                                                                </Avatar>
                                                            </Badge>
                                                        </ListItemAvatar>
                                                        <ListItemText
                                                            primary={session.customer.name}
                                                            secondary={
                                                                <>
                                                                    <Typography variant="caption" component="span" sx={{ display: 'block' }}>
                                                                        {format(new Date(session.lastActivity), 'HH:mm - dd MMM yy')}
                                                                    </Typography>
                                                                    <Label color={session.status === 'pending' ? 'error' : 'success'}>
                                                                        {session.status}
                                                                    </Label>
                                                                </>
                                                            }
                                                        />
                                                    </ListItem>
                                                ))
                                            ) : (
                                                <ListItem>
                                                    <ListItemText
                                                        primary="No active sessions"
                                                        secondary="All chat sessions will appear here"
                                                        sx={{ textAlign: 'center', py: 4 }}
                                                    />
                                                </ListItem>
                                            )}
                                        </List>
                                    </Scrollbar>
                                )
                            ) : (
                                closedSessionsLoading ? ( // Use closedSessionsLoading here
                                    <LinearProgress />
                                ) : (
                                    <Scrollbar sx={{ height: { md: 'calc(100vh - 400px)' } }}>
                                        <List>
                                            {closedSessions.length > 0 ? (
                                                closedSessions.map(session => (
                                                    <ListItem
                                                        key={session.sessionId}
                                                        button
                                                        selected={selectedSession?.sessionId === session.sessionId}
                                                        onClick={() => handleSelectSession(session)}
                                                        divider
                                                    >
                                                        <ListItemAvatar>
                                                            <Badge
                                                                color={session.status === 'pending' ? 'error' : 'primary'}
                                                                variant="dot"
                                                                overlap="circular"
                                                            >
                                                                <Avatar>
                                                                    {session.customer.name.charAt(0).toUpperCase()}
                                                                </Avatar>
                                                            </Badge>
                                                        </ListItemAvatar>
                                                        <ListItemText
                                                            primary={session.customer.name}
                                                            secondary={
                                                                <>
                                                                    <Typography variant="caption" component="span" sx={{ display: 'block' }}>
                                                                        {format(new Date(session.lastActivity), 'HH:mm - dd MMM yy')}
                                                                    </Typography>
                                                                    <Label color={session.status === 'pending' ? 'error' : 'success'}>
                                                                        {session.status}
                                                                    </Label>
                                                                </>
                                                            }
                                                        />
                                                    </ListItem>
                                                ))
                                            ) : (
                                                <ListItem>
                                                    <ListItemText
                                                        primary="No closed sessions"
                                                        secondary="All closed chat sessions will appear here"
                                                        sx={{ textAlign: 'center', py: 4 }}
                                                    />
                                                </ListItem>
                                            )}
                                        </List>
                                    </Scrollbar>
                                )
                            )}
                        </Grid>

                        {/* Right side - Chat messages */}
                        <Grid item xs={12} md={8} lg={9}>
                            {selectedSession ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', height: { md: 'calc(100vh - 400px)' } }}>
                                    {/* Chat header */}
                                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Box>
                                                <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                                                    {selectedSession.customer.name}
                                                    {selectedSession.customer.isAnonymous ? (
                                                        <Chip size="small" label="Guest" sx={{ ml: 1 }} color="default" />
                                                    ) : (
                                                        <Chip size="small" label="Registered" sx={{ ml: 1 }} color="success" />
                                                    )}
                                                </Typography>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', mt: 0.5 }}>
                                                    {selectedSession.customer.email && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            Email: {selectedSession.customer.email}
                                                        </Typography>
                                                    )}
                                                    <Typography variant="caption" color="text.secondary">
                                                        Started: {format(new Date(selectedSession.startedAt), 'PPpp')}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <IconButton size="small" onClick={() => setShowCustomerInfo(prev => !prev)}>
                                                <InfoIcon color={showCustomerInfo ? "primary" : "action"} />
                                            </IconButton>
                                        </Box>

                                        <Box>
                                            {selectedSession.status === 'pending' && (
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    size="small"
                                                    onClick={handleAssignChat}
                                                    sx={{ mr: 1 }}
                                                >
                                                    Take Chat
                                                </Button>
                                            )}

                                            {/* Add transfer button for active chats */}
                                            {selectedSession.status === 'active' && (
                                                <Button
                                                    variant="outlined"
                                                    color="info"
                                                    size="small"
                                                    onClick={handleTransferDialogOpen}
                                                    startIcon={<TransferWithinAStationIcon />}
                                                    sx={{ mr: 1 }}
                                                >
                                                    Transfer
                                                </Button>
                                            )}

                                            <Button
                                                variant="outlined"
                                                color="error"
                                                size="small"
                                                onClick={handleCloseSession}
                                                startIcon={<CloseIcon />}
                                            >
                                                End Chat
                                            </Button>
                                        </Box>
                                    </Box>

                                    {/* Customer info panel */}
                                    {showCustomerInfo && (
                                        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                                            <Typography variant="subtitle2" gutterBottom>Customer Information</Typography>

                                            {customerDataLoading ? (
                                                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                                                    <CircularProgress size={24} />
                                                </Box>
                                            ) : customerData ? (
                                                <>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={12} sm={6}>
                                                            <Typography variant="body2">
                                                                <strong>Customer Since:</strong> {customerData.joinDate ? format(new Date(customerData.joinDate), 'PP') : 'N/A'}
                                                            </Typography>
                                                        </Grid>
                                                        <Grid item xs={12} sm={6}>
                                                            <Typography variant="body2">
                                                                <strong>Order History:</strong> {customerData.orders?.length || 0} orders
                                                            </Typography>
                                                        </Grid>
                                                        <Grid item xs={12}>
                                                            <Typography variant="body2" gutterBottom>
                                                                <strong>Active Services:</strong>
                                                            </Typography>
                                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                {customerData.activeServices?.map(service => (
                                                                    <Chip
                                                                        key={service.id}
                                                                        label={service.name}
                                                                        size="small"
                                                                        color="primary"
                                                                    />
                                                                ))}
                                                                {!customerData.activeServices?.length && 'None'}
                                                            </Box>
                                                        </Grid>
                                                    </Grid>
                                                </>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    {selectedSession.customer.isAnonymous ?
                                                        'Limited information available for guest users' :
                                                        'No additional customer information found'}
                                                </Typography>
                                            )}
                                        </Box>
                                    )}

                                    {/* Messages area */}
                                    <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, bgcolor: 'background.default' }}>
                                        {loading ? (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                                                <CircularProgress />
                                            </Box>
                                        ) : (
                                            messages.map((msg, index) => (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        display: 'flex',
                                                        flexDirection: msg.sender.role === 'agent' ? 'row-reverse' : 'row',
                                                        mb: 2
                                                    }}
                                                >
                                                    <Avatar
                                                        sx={{
                                                            width: 32,
                                                            height: 32,
                                                            mr: msg.sender.role === 'agent' ? 0 : 1,
                                                            ml: msg.sender.role === 'agent' ? 1 : 0,
                                                            bgcolor: msg.sender.role === 'agent' ? 'primary.main' : 'grey.300'
                                                        }}
                                                    >
                                                        {msg.sender.name.charAt(0).toUpperCase()}
                                                    </Avatar>
                                                    <Box sx={{ maxWidth: '70%' }}>
                                                        <Paper
                                                            sx={{
                                                                p: 1.5,
                                                                bgcolor: msg.sender.role === 'agent' ? 'primary.light' : 'background.paper',
                                                                color: msg.sender.role === 'agent' ? 'primary.contrastText' : 'text.primary',
                                                                borderRadius: 2
                                                            }}
                                                        >
                                                            {msg.fileData ? (
                                                                <FileMessage fileData={msg.fileData} />
                                                            ) : (
                                                                <Typography variant="body2">{msg.content}</Typography>
                                                            )}
                                                        </Paper>
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                            sx={{
                                                                display: 'block',
                                                                mt: 0.5,
                                                                textAlign: msg.sender.role === 'agent' ? 'right' : 'left'
                                                            }}
                                                        >
                                                            {format(new Date(msg.timestamp), 'HH:mm')}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            ))
                                        )}
                                        {Object.keys(typingUsers).some(userId => typingUsers[userId]) && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
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
                                                    Customer is typing...
                                                </Typography>
                                            </Box>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </Box>

                                    <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                                        <Typography variant="caption" color="text.secondary">Quick Responses</Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                            {cannedResponses.map(response => (
                                                <Chip
                                                    key={response.id}
                                                    label={response.title}
                                                    size="small"
                                                    onClick={() => setNewMessage(response.content)}
                                                    sx={{ cursor: 'pointer' }}
                                                />
                                            ))}
                                        </Box>
                                    </Box>

                                    {/* Message input */}
                                    <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex' }}>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            style={{ display: 'none' }}
                                            onChange={handleFileUpload}
                                        />
                                        <IconButton
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={fileUploading || selectedSession?.status !== 'active'}
                                            sx={{ mr: 1 }}
                                        >
                                            <AttachFileIcon />
                                        </IconButton>
                                        <TextField
                                            fullWidth
                                            placeholder="Type your message..."
                                            variant="outlined"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                            disabled={selectedSession.status !== 'active' || loading || fileUploading}
                                            size="small"
                                            onFocus={() => socket.emit('typing', {
                                                sessionId: selectedSession.sessionId,
                                                isTyping: true,
                                                from: 'agent'
                                            })}
                                            onBlur={() => socket.emit('typing', {
                                                sessionId: selectedSession.sessionId,
                                                isTyping: false,
                                                from: 'agent'
                                            })}
                                        />
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            endIcon={<SendIcon />}
                                            onClick={handleSendMessage}
                                            disabled={(!newMessage.trim() || selectedSession.status !== 'active' || loading)}
                                            sx={{ ml: 1 }}
                                        >
                                            Send
                                        </Button>
                                    </Box>
                                </Box>
                            ) : (
                                <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                    <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
                                        <ChatIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                                        <Typography variant="h6" gutterBottom>
                                            No chat selected
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Select a chat session from the list to view the conversation
                                        </Typography>
                                    </Paper>
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                </Card>

                {/* Add the transfer dialog */}
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
                            {availableAgents.map((agent) => (
                                <ListItem button onClick={() => handleTransferToAgent(agent.id)} key={agent.id}>
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                                            {agent.name.charAt(0)}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={agent.name}
                                        secondary={agent.department}
                                    />
                                </ListItem>
                            ))}
                        </MUIList>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleTransferDialogClose}>Cancel</Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Page>
    );
}