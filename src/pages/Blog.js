import { useState, useEffect } from "react";
// material
import {
  Box,
  Card,
  Grid,
  Container,
  Typography,
  CircularProgress,
  Stack,
  TextField,
  Autocomplete,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tab
} from "@mui/material";
import { LoadingButton, TabContext, TabList, TabPanel } from '@mui/lab';
// components
import Page from "../components/Page";
import { BlogPostCard } from "../components/_dashboard/blog";
import { QuillEditor } from "../components/_dashboard/blog/editor";
// services
import { blogService } from "../services/blog.service";
import AlertDialog from "../components/AlertDialog";

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    coverImage: '',
    categories: [],
    tags: [],
    status: 'draft'
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await blogService.getBlogs();
      setPosts(response.data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

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
      const response = await blogService.createBlog(formData);
      const newPost = response.data;
      setPosts([newPost, ...posts]);
      setActiveTab('1');
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        coverImage: '',
        categories: [],
        tags: [],
        status: 'draft'
      });
    } catch (error) {
      console.error('Error creating blog:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await blogService.deleteBlog(selectedPost._id);
      fetchPosts();
    } catch (error) {
      console.error('Error deleting blog post:', error);
    } finally {
      setOpenDialog(false);
      setSelectedPost(null);
    }
  };

  const handleImageUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await blogService.uploadImage(formData);
      return response.data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      return '';
    }
  };

  return (
    <Page title="Blog Management | NEXC">
      <Container>
        <Typography variant="h4" sx={{ mb: 5 }}>
          Blog Management
        </Typography>

        <TabContext value={activeTab}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList onChange={(_, value) => setActiveTab(value)}>
              <Tab label="All Posts" value="1" />
              <Tab label="Create New Post" value="2" />
            </TabList>
          </Box>

          <TabPanel value="1">
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                {posts.map((post, index) => (
                  <BlogPostCard 
                    key={post._id} 
                    post={post} 
                    index={index} 
                    onDelete={() => {
                      setSelectedPost(post);
                      setOpenDialog(true);
                    }}
                  />
                ))}
              </Grid>
            )}
          </TabPanel>

          <TabPanel value="2">
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
          </TabPanel>
        </TabContext>

        <AlertDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          title="Delete Blog Post"
          content="Are you sure you want to delete this blog post? This action cannot be undone."
          onConfirm={handleDelete}
        />
      </Container>
    </Page>
  );
}
