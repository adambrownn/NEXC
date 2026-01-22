import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Avatar,
  Stack,
  Paper,
  InputBase,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
  Grid
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import Page from '../components/Page';
import Breadcrumbs, { BREADCRUMB_CONFIGS } from '../components/Breadcrumbs';
import applicationsService from '../services/applications.service';
import { useAuth } from '../contexts/AuthContext';

// Styled components
const StatsCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2.5),
  textAlign: 'center',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const SearchContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  marginBottom: theme.spacing(3),
  backgroundColor: alpha(theme.palette.grey[500], 0.04),
}));

const ActionButton = styled(Button)(({ theme, variant = 'contained' }) => ({
  minWidth: '120px',
  fontWeight: 600,
  textTransform: 'none',
  borderRadius: theme.shape.borderRadius,
}));

// Role-based access control helper
const useApplicationPermissions = () => {
  const { user } = useAuth();
  
  return {
    canCreateApplications: ['admin', 'superadmin', 'manager'].includes(user?.role || user?.accountType),
    canDeleteApplications: ['admin', 'superadmin'].includes(user?.role || user?.accountType),
    canEditApplications: ['admin', 'superadmin', 'manager'].includes(user?.role || user?.accountType),
    canViewAllApplications: ['admin', 'superadmin', 'manager', 'supervisor'].includes(user?.role || user?.accountType),
    isAdmin: ['admin', 'superadmin'].includes(user?.role || user?.accountType)
  };
};

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // Form state
  const [applicationForm, setApplicationForm] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    address: '',
    company: '',
    subject: '',
    message: '',
    appliedFor: '',
    applicationType: 'qualification',
    checkoutPoint: 0
  });

  const { enqueueSnackbar } = useSnackbar();
  const permissions = useApplicationPermissions();

  // Load applications function with useCallback to prevent dependency warnings
  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await applicationsService.getApplications();
      const formattedData = data.map(app => applicationsService.formatApplicationData(app));
      setApplications(formattedData);
      enqueueSnackbar(`Loaded ${formattedData.length} applications`, { variant: 'success' });
    } catch (error) {
      console.error('Error loading applications:', error);
      setError('Failed to load applications');
      enqueueSnackbar('Failed to load applications', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  // Filter applications function with useCallback
  const filterApplications = useCallback(() => {
    let filtered = applications;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app.name?.toLowerCase().includes(query) ||
        app.email?.toLowerCase().includes(query) ||
        app.company?.toLowerCase().includes(query) ||
        app.subject?.toLowerCase().includes(query) ||
        app.appliedFor?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.checkoutPoint === parseInt(statusFilter));
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(app => app.applicationType === typeFilter);
    }

    setFilteredApplications(filtered);
    setPage(0);
  }, [applications, searchQuery, statusFilter, typeFilter]);

  // Load applications
  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  // Filter applications
  useEffect(() => {
    filterApplications();
  }, [filterApplications]);

  // Access control check
  if (!permissions.canViewAllApplications) {
    return (
      <Page title="Applications | NEXC Construction Platform">
        <Container>
          <Alert severity="error" sx={{ mt: 3 }}>
            <Typography variant="h6">Access Denied</Typography>
            <Typography>
              You don't have permission to view applications. 
              Contact your administrator for access.
            </Typography>
          </Alert>
        </Container>
      </Page>
    );
  }

  const handleCreateApplication = async () => {
    if (!permissions.canCreateApplications) {
      enqueueSnackbar('Access denied: Only managers and admins can create applications', { variant: 'error' });
      return;
    }

    if (!applicationForm.name || !applicationForm.email || !applicationForm.applicationType) {
      enqueueSnackbar('Please fill in all required fields', { variant: 'error' });
      return;
    }

    try {
      const newApplication = await applicationsService.createApplication(applicationForm);
      const formattedApp = applicationsService.formatApplicationData(newApplication);
      setApplications(prev => [formattedApp, ...prev]);
      setCreateDialogOpen(false);
      resetForm();
      enqueueSnackbar('Application created successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to create application', { variant: 'error' });
    }
  };

  const handleUpdateApplication = async () => {
    if (!permissions.canEditApplications) {
      enqueueSnackbar('Access denied: Only managers and admins can edit applications', { variant: 'error' });
      return;
    }

    try {
      const updatedApp = await applicationsService.updateApplication(selectedApplication._id, applicationForm);
      const formattedApp = applicationsService.formatApplicationData(updatedApp);
      setApplications(prev => prev.map(app => 
        app._id === selectedApplication._id ? formattedApp : app
      ));
      setEditDialogOpen(false);
      enqueueSnackbar('Application updated successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to update application', { variant: 'error' });
    }
  };

  const handleDeleteApplication = async (applicationId) => {
    if (!permissions.canDeleteApplications) {
      enqueueSnackbar('Access denied: Only admins can delete applications', { variant: 'error' });
      return;
    }

    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await applicationsService.deleteApplication(applicationId);
        setApplications(prev => prev.filter(app => app._id !== applicationId));
        enqueueSnackbar('Application deleted successfully', { variant: 'success' });
      } catch (error) {
        enqueueSnackbar('Failed to delete application', { variant: 'error' });
      }
    }
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setViewDialogOpen(true);
  };

  const handleEditApplication = (application) => {
    setSelectedApplication(application);
    setApplicationForm({
      name: application.name || '',
      phoneNumber: application.phoneNumber || '',
      email: application.email || '',
      address: application.address || '',
      company: application.company || '',
      subject: application.subject || '',
      message: application.message || '',
      appliedFor: application.appliedFor || '',
      applicationType: application.applicationType || 'qualification',
      checkoutPoint: application.checkoutPoint || 0
    });
    setEditDialogOpen(true);
  };

  const resetForm = () => {
    setApplicationForm({
      name: '',
      phoneNumber: '',
      email: '',
      address: '',
      company: '',
      subject: '',
      message: '',
      appliedFor: '',
      applicationType: 'qualification',
      checkoutPoint: 0
    });
  };

  const getStatistics = () => {
    const total = applications.length;
    const unresolved = applications.filter(app => app.checkoutPoint === 0).length;
    const resolved = applications.filter(app => app.checkoutPoint === 1).length;
    const rejected = applications.filter(app => app.checkoutPoint === 2).length;

    return { total, unresolved, resolved, rejected };
  };

  const stats = getStatistics();

  if (loading) {
    return (
      <Page title="Applications | NEXC Construction Platform">
        <Container>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress size={40} />
          </Box>
        </Container>
      </Page>
    );
  }

  if (error) {
    return (
      <Page title="Applications | NEXC Construction Platform">
        <Container>
          <Alert severity="error" sx={{ mt: 3 }}>
            <Typography variant="h6">Error Loading Applications</Typography>
            <Typography>{error}</Typography>
            <Button onClick={loadApplications} sx={{ mt: 2 }}>
              Try Again
            </Button>
          </Alert>
        </Container>
      </Page>
    );
  }

  return (
    <Page title="Applications | NEXC Construction Platform">
      <Container maxWidth="xl">
        {/* Breadcrumb with actions */}
        <Breadcrumbs
          {...BREADCRUMB_CONFIGS.applications}
          action={
            <Stack direction="row" spacing={1}>
              <ActionButton
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadApplications}
              >
                Refresh
              </ActionButton>
              {permissions.canCreateApplications && (
                <ActionButton
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateDialogOpen(true)}
                >
                  New Application
                </ActionButton>
              )}
            </Stack>
          }
        />

        {/* Statistics */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard>
              <Typography variant="h3" color="primary" gutterBottom>
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Applications
              </Typography>
            </StatsCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard>
              <Typography variant="h3" color="warning.main" gutterBottom>
                {stats.unresolved}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Unresolved
              </Typography>
            </StatsCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard>
              <Typography variant="h3" color="success.main" gutterBottom>
                {stats.resolved}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Resolved
              </Typography>
            </StatsCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard>
              <Typography variant="h3" color="error.main" gutterBottom>
                {stats.rejected}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Rejected
              </Typography>
            </StatsCard>
          </Grid>
        </Grid>

        {/* Search and Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <SearchContainer>
                  <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                  <InputBase
                    placeholder="Search applications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ flex: 1 }}
                  />
                </SearchContainer>
              </Grid>
              <Grid item xs={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="0">Unresolved</MenuItem>
                    <MenuItem value="1">Resolved</MenuItem>
                    <MenuItem value="2">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    label="Type"
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="qualification">Qualification</MenuItem>
                    <MenuItem value="groupbooking">Group Booking</MenuItem>
                    <MenuItem value="contactus">Contact Us</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Showing {filteredApplications.length} of {applications.length} applications
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Applicant</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Applied For</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredApplications
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((application) => (
                    <TableRow key={application._id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            {application.name?.charAt(0)?.toUpperCase() || 'A'}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">
                              {application.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {application.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={application.typeLabel}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={application.statusLabel}
                          size="small"
                          color={application.statusColor}
                          variant="filled"
                        />
                      </TableCell>
                      <TableCell>{application.appliedFor || 'N/A'}</TableCell>
                      <TableCell>{application.formattedDate}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewApplication(application)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          {permissions.canEditApplications && (
                            <Tooltip title="Edit Application">
                              <IconButton
                                size="small"
                                onClick={() => handleEditApplication(application)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          {permissions.canDeleteApplications && (
                            <Tooltip title="Delete Application">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteApplication(application._id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                {filteredApplications.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body1" color="text.secondary" sx={{ py: 3 }}>
                        No applications found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredApplications.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Card>

        {/* Create Application Dialog */}
        <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Create New Application</DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name *"
                  value={applicationForm.name}
                  onChange={(e) => setApplicationForm({...applicationForm, name: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email *"
                  type="email"
                  value={applicationForm.email}
                  onChange={(e) => setApplicationForm({...applicationForm, email: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={applicationForm.phoneNumber}
                  onChange={(e) => setApplicationForm({...applicationForm, phoneNumber: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Company"
                  value={applicationForm.company}
                  onChange={(e) => setApplicationForm({...applicationForm, company: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={applicationForm.address}
                  onChange={(e) => setApplicationForm({...applicationForm, address: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Application Type *</InputLabel>
                  <Select
                    value={applicationForm.applicationType}
                    onChange={(e) => setApplicationForm({...applicationForm, applicationType: e.target.value})}
                    label="Application Type *"
                  >
                    {applicationsService.getApplicationTypes().map(type => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Applied For"
                  value={applicationForm.appliedFor}
                  onChange={(e) => setApplicationForm({...applicationForm, appliedFor: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subject"
                  value={applicationForm.subject}
                  onChange={(e) => setApplicationForm({...applicationForm, subject: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Message"
                  multiline
                  rows={4}
                  value={applicationForm.message}
                  onChange={(e) => setApplicationForm({...applicationForm, message: e.target.value})}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleCreateApplication}>
              Create Application
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Application Dialog */}
        <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Application Details</DialogTitle>
          <DialogContent>
            {selectedApplication && (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                  <Typography variant="body1">{selectedApplication.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{selectedApplication.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                  <Typography variant="body1">{selectedApplication.phoneNumber || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Company</Typography>
                  <Typography variant="body1">{selectedApplication.company || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                  <Typography variant="body1">{selectedApplication.address || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Application Type</Typography>
                  <Typography variant="body1">{selectedApplication.typeLabel}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip
                    label={selectedApplication.statusLabel}
                    color={selectedApplication.statusColor}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Applied For</Typography>
                  <Typography variant="body1">{selectedApplication.appliedFor || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Date Created</Typography>
                  <Typography variant="body1">{selectedApplication.formattedDateTime}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Subject</Typography>
                  <Typography variant="body1">{selectedApplication.subject || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Message</Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedApplication.message || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Edit Application Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Edit Application</DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name *"
                  value={applicationForm.name}
                  onChange={(e) => setApplicationForm({...applicationForm, name: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email *"
                  type="email"
                  value={applicationForm.email}
                  onChange={(e) => setApplicationForm({...applicationForm, email: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={applicationForm.phoneNumber}
                  onChange={(e) => setApplicationForm({...applicationForm, phoneNumber: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Company"
                  value={applicationForm.company}
                  onChange={(e) => setApplicationForm({...applicationForm, company: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={applicationForm.address}
                  onChange={(e) => setApplicationForm({...applicationForm, address: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Application Type *</InputLabel>
                  <Select
                    value={applicationForm.applicationType}
                    onChange={(e) => setApplicationForm({...applicationForm, applicationType: e.target.value})}
                    label="Application Type *"
                  >
                    {applicationsService.getApplicationTypes().map(type => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={applicationForm.checkoutPoint}
                    onChange={(e) => setApplicationForm({...applicationForm, checkoutPoint: parseInt(e.target.value)})}
                    label="Status"
                  >
                    {applicationsService.getApplicationStatuses().map(status => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Applied For"
                  value={applicationForm.appliedFor}
                  onChange={(e) => setApplicationForm({...applicationForm, appliedFor: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subject"
                  value={applicationForm.subject}
                  onChange={(e) => setApplicationForm({...applicationForm, subject: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Message"
                  multiline
                  rows={4}
                  value={applicationForm.message}
                  onChange={(e) => setApplicationForm({...applicationForm, message: e.target.value})}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleUpdateApplication}>
              Update Application
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Page>
  );
}
