import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Button,
  Typography,
  useTheme,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Box,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  Container,
  alpha,
  Fade,
  Grid,
  CircularProgress,
} from "@mui/material";

import {
  Save as SaveIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Help as HelpIcon,
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterListIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';

import { styled } from '@mui/material/styles';
import Page from '../../../components/Page';
import Breadcrumbs, { BREADCRUMB_CONFIGS } from '../../../components/Breadcrumbs';
import axiosInstance from "../../../axiosConfig";

// Styled components for modern UI
const SearchCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  background: alpha(theme.palette.background.neutral || theme.palette.grey[100], 0.4),
  border: `1px solid ${theme.palette.divider}`,
}));

const CategoryChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  fontWeight: 500,
  textTransform: 'capitalize',
  '&.MuiChip-colorPrimary': {
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  },
}));

const FAQAccordion = styled(Accordion)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  '&:before': {
    display: 'none',
  },
  '&.Mui-expanded': {
    margin: `${theme.spacing(1)} 0`,
    boxShadow: theme.shadows[4],
  },
}));

const AddFAQButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(1.5, 3),
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: theme.shadows[2],
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-2px)',
  },
}));

const EmptyStateBox = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(6),
  color: theme.palette.text.secondary,
  '& .MuiSvgIcon-root': {
    fontSize: 64,
    color: theme.palette.action.disabled,
    marginBottom: theme.spacing(2),
  },
}));

const FAQCard = ({ faq, onEdit, onDelete, onView }) => {
  const theme = useTheme();
  
  if (!faq) return null;
  const { _id, title, description, category } = faq;

  const getCategoryColor = (category) => {
    const colors = {
      test: theme.palette.info.main,
      qualification: theme.palette.success.main,
      course: theme.palette.warning.main,
      center: theme.palette.error.main,
      card: theme.palette.primary.main,
      trade: theme.palette.secondary.main,
      payment: theme.palette.info.dark,
      info: theme.palette.text.primary,
      other: theme.palette.text.secondary,
    };
    return colors[category] || theme.palette.text.secondary;
  };

  return (
    <Fade in timeout={300}>
      <FAQAccordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            '& .MuiAccordionSummary-content': {
              alignItems: 'center',
              justifyContent: 'space-between',
              margin: theme.spacing(1, 0),
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <HelpIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
              {title}
            </Typography>
            <CategoryChip
              label={category}
              size="small"
              sx={{
                backgroundColor: alpha(getCategoryColor(category), 0.1),
                color: getCategoryColor(category),
                fontWeight: 600,
              }}
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
              {description}
            </Typography>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <IconButton
                size="small"
                onClick={() => onView(faq)}
                sx={{
                  backgroundColor: alpha(theme.palette.info.main, 0.1),
                  color: theme.palette.info.main,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.info.main, 0.2),
                  },
                }}
              >
                <ViewIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => onEdit(faq)}
                sx={{
                  backgroundColor: alpha(theme.palette.warning.main, 0.1),
                  color: theme.palette.warning.main,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.warning.main, 0.2),
                  },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => onDelete(_id)}
                sx={{
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                  color: theme.palette.error.main,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.error.main, 0.2),
                  },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>
        </AccordionDetails>
      </FAQAccordion>
    </Fade>
  );
};

const Faqs = (props) => {
  const [faqList, setFaqList] = useState([]);
  const [filteredFaqs, setFilteredFaqs] = useState([]);
  const [formInput, setFormInput] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  // Fetch FAQ list with enhanced error handling
  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const resp = await axiosInstance.get("/v1/faqs");
      setFaqList(resp.data);
      setFormInput({});
      setIsOfflineMode(false);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      setIsOfflineMode(true);
      // Enhanced mock data for better demonstration
      const mockFaqs = [
        {
          _id: 'mock-1',
          title: 'How do I book a CSCS test?',
          description: 'You can book your CSCS test through our online booking system. Select your preferred test center, date, and time slot. We offer flexible scheduling with multiple locations across the UK.',
          category: 'test'
        },
        {
          _id: 'mock-2',
          title: 'What documents do I need for CISRS scaffolding card?',
          description: 'You will need valid ID, proof of training, and any existing certifications. Check our documentation guide for full requirements. Original certificates must be provided for verification.',
          category: 'card'
        },
        {
          _id: 'mock-3',
          title: 'How long does it take to process my application?',
          description: 'Most applications are processed within 5-10 working days. Complex applications may take longer. You will receive email updates throughout the process.',
          category: 'info'
        },
        {
          _id: 'mock-4',
          title: 'Can I reschedule my course booking?',
          description: 'Yes, you can reschedule up to 48 hours before the course start date. Contact our support team for assistance. Rescheduling fees may apply for short notice changes.',
          category: 'course'
        },
        {
          _id: 'mock-5',
          title: 'What payment methods do you accept?',
          description: 'We accept all major credit cards, debit cards, PayPal, and bank transfers. Group bookings can be invoiced. Payment plans are available for larger purchases.',
          category: 'payment'
        },
        {
          _id: 'mock-6',
          title: 'How do I find a local test center?',
          description: 'Use our test center locator tool to find the nearest location. We have over 100 centers across the UK. You can filter by services offered and availability.',
          category: 'center'
        },
        {
          _id: 'mock-7',
          title: 'What qualifications do I need for CPCS registration?',
          description: 'CPCS requirements vary by machine type. You need relevant training, health and safety certificates, and practical experience. Check our qualification matrix for specific requirements.',
          category: 'qualification'
        },
        {
          _id: 'mock-8',
          title: 'Can I transfer my certification to another trade?',
          description: 'Some certifications allow cross-trade transfers with additional training. Contact our support team to discuss your specific situation and available pathways.',
          category: 'trade'
        }
      ];
      setFaqList(mockFaqs);
      setFormInput({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, [props]);

  // Filter FAQs based on search and category
  useEffect(() => {
    let filtered = faqList;

    if (searchTerm) {
      filtered = filtered.filter(faq =>
        faq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(faq => faq.category === categoryFilter);
    }

    setFilteredFaqs(filtered);
  }, [faqList, searchTerm, categoryFilter]);

  // Enhanced handlers with modern UX patterns
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormInput({
      ...formInput,
      [name]: value,
    });
  };

  const handleOpenDialog = () => {
    setIsEditing(false);
    setFormInput({});
    setDialogOpen(true);
  };

  const handleEditFaq = (faq) => {
    setIsEditing(true);
    setFormInput(faq);
    setDialogOpen(true);
  };

  const handleViewFaq = (faq) => {
    setSelectedFaq(faq);
    setViewDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormInput({});
    setIsEditing(false);
  };

  const handleDeleteFaq = async (faqId) => {
    if (window.confirm('Are you sure you want to delete this FAQ? This action cannot be undone.')) {
      try {
        await axiosInstance.delete(`/v1/faqs/${faqId}`);
        await fetchFaqs();
      } catch (error) {
        console.error("Error deleting FAQ:", error);
        // For offline mode, remove locally
        setFaqList(prevList => prevList.filter(faq => faq._id !== faqId));
      }
    }
  };

  const getUniqueCategories = () => {
    const categories = [...new Set(faqList.map(faq => faq.category))];
    return categories.filter(Boolean).sort();
  };

  const handleSaveFaq = async () => {
    if (!formInput.title || !formInput.description || !formInput.category) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        const resp = await axiosInstance.put(`/v1/faqs/${formInput._id}`, formInput);
        if (resp.data?.err) {
          alert(resp.data.err);
        } else {
          await fetchFaqs();
          handleCloseDialog();
        }
      } else {
        const resp = await axiosInstance.post("/v1/faqs", formInput);
        if (resp.data?.err) {
          alert(resp.data.err);
        } else {
          await fetchFaqs();
          handleCloseDialog();
        }
      }
    } catch (error) {
      console.error('Error saving FAQ:', error);
      // For offline mode, handle locally
      if (isEditing) {
        const updatedList = faqList.map(faq => 
          faq._id === formInput._id ? formInput : faq
        );
        setFaqList(updatedList);
      } else {
        const newFaq = {
          _id: `mock-${Date.now()}`,
          ...formInput
        };
        setFaqList([...faqList, newFaq]);
      }
      handleCloseDialog();
      alert(`FAQ ${isEditing ? 'updated' : 'added'} locally (API endpoint not available)`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page title="FAQ Management | NEXC Construction Platform">
      <Container maxWidth="xl">
        {/* Breadcrumb with action */}
        <Breadcrumbs
          {...BREADCRUMB_CONFIGS.faqs}
          action={
            <AddFAQButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
              size="large"
            >
              Add New FAQ
            </AddFAQButton>
          }
        />

        {/* Offline Mode Alert */}
        {isOfflineMode && (
          <Alert 
            severity="info" 
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={fetchFaqs}>
                Retry Connection
              </Button>
            }
          >
            <Typography variant="body2">
              <strong>Development Mode:</strong> FAQ API endpoints are not available. 
              Operating with enhanced mock data. Changes will not be persisted.
            </Typography>
          </Alert>
        )}

        {/* Search and Filter Section */}
        <SearchCard>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Category Filter</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Category Filter"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  startAdornment={<FilterListIcon sx={{ mr: 1, color: 'action.active' }} />}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {getUniqueCategories().map((category) => (
                    <MenuItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="body2" color="text.secondary" align="center">
                {filteredFaqs.length} of {faqList.length} FAQs
              </Typography>
            </Grid>
          </Grid>
        </SearchCard>

        {/* FAQ List */}
        <Card>
          <CardContent>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <Stack alignItems="center" spacing={2}>
                  <CircularProgress />
                  <Typography variant="body2" color="text.secondary">
                    Loading FAQs...
                  </Typography>
                </Stack>
              </Box>
            ) : filteredFaqs.length > 0 ? (
              <Box sx={{ '& > *': { mb: 1 } }}>
                {filteredFaqs.map((faq) => (
                  <FAQCard
                    key={faq._id}
                    faq={faq}
                    onEdit={handleEditFaq}
                    onDelete={handleDeleteFaq}
                    onView={handleViewFaq}
                  />
                ))}
              </Box>
            ) : (
              <EmptyStateBox>
                <HelpIcon />
                <Typography variant="h6" gutterBottom>
                  {searchTerm || categoryFilter !== 'all' 
                    ? 'No FAQs match your search criteria' 
                    : 'No FAQs available'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 3 }}>
                  {searchTerm || categoryFilter !== 'all'
                    ? 'Try adjusting your search terms or filters'
                    : 'Get started by adding your first FAQ'}
                </Typography>
                {(!searchTerm && categoryFilter === 'all') && (
                  <AddFAQButton
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenDialog}
                  >
                    Add First FAQ
                  </AddFAQButton>
                )}
              </EmptyStateBox>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit FAQ Dialog */}
        <Dialog 
          open={dialogOpen} 
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 2 }
          }}
        >
          <DialogTitle>
            <Stack direction="row" alignItems="center" spacing={1}>
              <HelpIcon color="primary" />
              <Typography variant="h6">
                {isEditing ? 'Edit FAQ' : 'Add New FAQ'}
              </Typography>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="FAQ Question"
                name="title"
                value={formInput.title || ""}
                onChange={handleInputChange}
                required
                placeholder="Enter the FAQ question..."
              />
              
              <TextField
                fullWidth
                label="FAQ Answer"
                name="description"
                value={formInput.description || ""}
                onChange={handleInputChange}
                required
                multiline
                rows={4}
                placeholder="Provide a detailed answer to the question..."
              />
              
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formInput.category || ""}
                  label="Category"
                  onChange={handleInputChange}
                >
                  <MenuItem value="test">Test</MenuItem>
                  <MenuItem value="qualification">Qualification</MenuItem>
                  <MenuItem value="course">Course</MenuItem>
                  <MenuItem value="center">Center</MenuItem>
                  <MenuItem value="card">Card</MenuItem>
                  <MenuItem value="trade">Trade</MenuItem>
                  <MenuItem value="payment">Payment</MenuItem>
                  <MenuItem value="info">Information</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveFaq}
              startIcon={<SaveIcon />}
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEditing ? 'Update FAQ' : 'Save FAQ')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View FAQ Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HelpIcon color="primary" />
                <Typography variant="h6">FAQ Details</Typography>
              </Box>
              {selectedFaq && (
                <CategoryChip
                  label={selectedFaq.category}
                  size="small"
                  color="primary"
                />
              )}
            </Stack>
          </DialogTitle>
          <DialogContent>
            {selectedFaq && (
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Question
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    {selectedFaq.title}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Answer
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                    {selectedFaq.description}
                  </Typography>
                </Box>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            {selectedFaq && (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => {
                  setViewDialogOpen(false);
                  handleEditFaq(selectedFaq);
                }}
              >
                Edit FAQ
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </Page>
  );
};

export default Faqs;
