import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../axiosConfig';
// material
import {
  Card,
  Stack,
  Button,
  Container,
  Typography,
  TextField,
  Box,
  Autocomplete,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
// components
import Page from '../../components/Page';
import { blogService } from '../../services/blog.service';
import { LoadingButton } from '@mui/lab';
import { QuillEditor } from '../../components/_dashboard/blog/editor';
import SEOMetadata from '../../components/_dashboard/blog/SEOMetadata';
import SEOPreview from '../../components/_dashboard/blog/SEOPreview';
import ContentScheduling from '../../components/_dashboard/blog/ContentScheduling';
import MediaGallery from '../../components/_dashboard/blog/MediaGallery';
import ImageEditor from '../../components/_dashboard/blog/ImageEditor';
import { useAuth } from '../../contexts/AuthContext';

// ----------------------------------------------------------------------

export default function BlogCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewers, setReviewers] = useState([]);
  const [loadingReviewers, setLoadingReviewers] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    coverImage: '',
    categories: [],
    tags: [],
    status: 'draft',
    seo: {},
    schedulingSettings: {},
    workflow: {}
  });

  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [selectedMediaForEdit, setSelectedMediaForEdit] = useState(null);

  // Fetch available reviewers on mount
  useEffect(() => {
    const fetchReviewers = async () => {
      try {
        setLoadingReviewers(true);
        // Fetch users with editor, admin, or manager roles
        const response = await axios.get('/users', {
          params: {
            accountType: 'admin,manager,staff',
            limit: 50
          }
        });
        
        if (response.data?.data) {
          // Filter to only users who can review (editors, admins, managers)
          const potentialReviewers = response.data.data
            .filter(u => u._id !== user?._id) // Exclude current user
            .map(u => ({
              _id: u._id,
              name: u.name || u.displayName || u.email,
              avatar: u.profileImage || u.photoURL || ''
            }));
          setReviewers(potentialReviewers);
        }
      } catch (error) {
        console.error('Failed to fetch reviewers:', error);
        // Set empty array on error, component will handle gracefully
        setReviewers([]);
      } finally {
        setLoadingReviewers(false);
      }
    };

    fetchReviewers();
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContentChange = (content) => {
    setFormData((prev) => ({
      ...prev,
      content
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await blogService.createBlog(formData);
      navigate('/dashboard/blog');
    } catch (error) {
      console.error('Error creating blog:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (file) => {
    try {
      const response = await blogService.uploadImage(file);
      setFormData((prev) => ({
        ...prev,
        coverImage: response.url
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleSEOChange = (seoData) => {
    setFormData((prev) => ({
      ...prev,
      seo: seoData
    }));
  };

  const handleSchedulingChange = (schedulingData) => {
    setFormData((prev) => ({
      ...prev,
      schedulingSettings: schedulingData.schedulingSettings || {},
      workflow: schedulingData.workflow || {},
      scheduledAt: schedulingData.scheduledAt,
      status: schedulingData.status || prev.status
    }));
  };

  const handleStatusChange = (newStatus, schedulingData) => {
    setFormData((prev) => ({
      ...prev,
      status: newStatus,
      ...schedulingData
    }));
  };

  const handleSelectMedia = (media) => {
    setFormData((prev) => ({
      ...prev,
      coverImage: media.url
    }));
    setShowMediaGallery(false);
  };

  const handleEditImage = (media) => {
    setSelectedMediaForEdit(media);
    setShowImageEditor(true);
  };

  const handleSaveEditedImage = async (editedFile, editData) => {
    try {
      // Upload the edited image as a new media item
      const response = await blogService.uploadImage(editedFile);
      setFormData((prev) => ({
        ...prev,
        coverImage: response.url
      }));
      setShowImageEditor(false);
      setSelectedMediaForEdit(null);
    } catch (error) {
      console.error('Failed to save edited image:', error);
    }
  };

  return (
    <Page title="Blog: Create new post | NEXC">
      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Create new post
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {/* Main Content Form */}
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 3 }}>
              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <Typography variant="h6" gutterBottom>
                    Blog Content
                  </Typography>

                  <TextField
                    fullWidth
                    label="Post Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />

                  <TextField
                    fullWidth
                    label="Excerpt"
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    required
                    helperText="Brief summary that appears in blog listings and SEO descriptions"
                  />

                  {/* Cover Image Selection */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Cover Image
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      {formData.coverImage && (
                        <Box
                          component="img"
                          src={formData.coverImage}
                          alt="Cover"
                          sx={{
                            width: 100,
                            height: 60,
                            objectFit: 'cover',
                            borderRadius: 1,
                            border: 1,
                            borderColor: 'divider'
                          }}
                        />
                      )}
                      <Stack spacing={1}>
                        <Button
                          variant="outlined"
                          onClick={() => setShowMediaGallery(true)}
                        >
                          Select from Gallery
                        </Button>
                        {formData.coverImage && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleEditImage({ url: formData.coverImage, originalName: 'cover-image.jpg', mimeType: 'image/jpeg' })}
                          >
                            Edit Image
                          </Button>
                        )}
                      </Stack>
                    </Stack>
                  </Box>

                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      label="Status"
                    >
                      <MenuItem value="draft">Draft</MenuItem>
                      <MenuItem value="published">Published</MenuItem>
                    </Select>
                  </FormControl>

                  <Autocomplete
                    multiple
                    freeSolo
                    value={formData.categories}
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        categories: newValue
                      }));
                    }}
                    options={['Safety Training', 'CISRS', 'CPCS', 'CSCS', 'Industry News', 'Best Practices']}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip label={option} {...getTagProps({ index })} />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField {...params} label="Categories" placeholder="Add categories" />
                    )}
                  />

                  <Autocomplete
                    multiple
                    freeSolo
                    value={formData.tags}
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        tags: newValue
                      }));
                    }}
                    options={['construction', 'safety', 'training', 'certification', 'scaffolding', 'crane-operator']}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip label={option} {...getTagProps({ index })} />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField {...params} label="Tags" placeholder="Add tags" />
                    )}
                  />

                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Content
                    </Typography>
                    <QuillEditor
                      value={formData.content}
                      onChange={handleContentChange}
                      onImageUpload={handleImageUpload}
                    />
                  </Box>

                  <Divider />

                  {/* SEO Metadata */}
                  <SEOMetadata
                    blogData={formData}
                    seoData={formData.seo}
                    title={formData.title}
                    excerpt={formData.excerpt}
                    content={formData.content}
                    onSEOChange={handleSEOChange}
                  />

                  {/* Content Scheduling */}
                  <ContentScheduling
                    blogData={formData}
                    onSchedulingChange={handleSchedulingChange}
                    onStatusChange={handleStatusChange}
                    currentUser={user ? {
                      _id: user._id || user.userId,
                      name: user.name || user.displayName || user.email
                    } : null}
                    availableReviewers={reviewers}
                    loadingReviewers={loadingReviewers}
                  />

                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type="button"
                      variant="outlined"
                      color="inherit"
                      sx={{ mr: 1.5 }}
                      onClick={() => navigate('/dashboard/blog')}
                    >
                      Cancel
                    </Button>
                    <LoadingButton
                      type="submit"
                      variant="contained"
                      loading={isSubmitting}
                    >
                      Create Post
                    </LoadingButton>
                  </Box>
                </Stack>
              </form>
            </Card>
          </Grid>

          {/* SEO Preview Sidebar */}
          <Grid item xs={12} md={4}>
            <Box sx={{ position: 'sticky', top: 24 }}>
              <Stack spacing={3}>
                <SEOPreview
                  blogData={formData}
                  seoData={formData.seo}
                  title={formData.title}
                  excerpt={formData.excerpt}
                />
              </Stack>
            </Box>
          </Grid>
        </Grid>

        {/* Media Gallery Dialog */}
        <Dialog open={showMediaGallery} onClose={() => setShowMediaGallery(false)} maxWidth="lg" fullWidth>
          <DialogTitle>Select Cover Image</DialogTitle>
          <DialogContent>
            <MediaGallery
              onSelectMedia={handleSelectMedia}
              selectionMode={true}
              allowMultiple={false}
              allowedTypes={['image']}
              category="blog"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowMediaGallery(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>

        {/* Image Editor Dialog */}
        <ImageEditor
          open={showImageEditor}
          onClose={() => {
            setShowImageEditor(false);
            setSelectedMediaForEdit(null);
          }}
          mediaItem={selectedMediaForEdit}
          onSave={handleSaveEditedImage}
        />
      </Container>
    </Page>
  );
}
