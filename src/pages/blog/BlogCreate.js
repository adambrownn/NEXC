import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  MenuItem
} from '@mui/material';
// components
import Page from '../../components/Page';
import { blogService } from '../../services/blog.service';
import { LoadingButton } from '@mui/lab';
import { QuillEditor } from '../../components/_dashboard/blog/editor';

// ----------------------------------------------------------------------

export default function BlogCreate() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    coverImage: '',
    categories: [],
    tags: [],
    status: 'draft'
  });

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

  return (
    <Page title="Blog: Create new post | NEXC">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Create new post
          </Typography>
        </Stack>

        <Card sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
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
              />

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
                options={[]}
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
                options={[]}
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
      </Container>
    </Page>
  );
}
