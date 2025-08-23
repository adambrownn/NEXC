import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// material
import {
  Box,
  Card,
  Container,
  Typography,
  Skeleton,
  Divider,
  Stack,
  Avatar,
  Chip,
  IconButton
} from '@mui/material';
import { Icon } from '@iconify/react';
import editFill from '@iconify/icons-eva/edit-fill';
import trash2Fill from '@iconify/icons-eva/trash-2-fill';
import arrowBackFill from '@iconify/icons-eva/arrow-back-fill';
// components
import Page from '../../components/Page';
import { blogService } from '../../services/blog.service';
import { fDate } from '../../utils/formatTime';
import { fShortenNumber } from '../../utils/formatNumber';
import AlertDialog from '../../components/AlertDialog';

// ----------------------------------------------------------------------

export default function BlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await blogService.getBlog(id);
        setPost(response.data);
      } catch (error) {
        console.error('Error fetching blog post:', error);
        navigate('/dashboard/blog');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, navigate]);

  const handleEdit = () => {
    navigate(`/dashboard/blog/${id}/edit`);
  };

  const handleDelete = async () => {
    try {
      await blogService.deleteBlog(id);
      navigate('/dashboard/blog');
    } catch (error) {
      console.error('Error deleting blog post:', error);
    }
  };

  if (loading) {
    return (
      <Page title="Blog: Post | NEXC">
        <Container>
          <Skeleton variant="rectangular" width="100%" height={300} />
          <Skeleton variant="text" height={80} sx={{ mt: 3 }} />
          <Skeleton variant="text" height={40} sx={{ mt: 1 }} />
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="text" width={100} />
          </Stack>
        </Container>
      </Page>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <Page title={`Blog: ${post.title} | NEXC`}>
      <Container>
        <Card>
          <Box sx={{ p: { xs: 3, md: 5 } }}>
            <Stack direction="row" alignItems="center" sx={{ mb: 5 }}>
              <IconButton onClick={() => navigate('/dashboard/blog')} sx={{ mr: 2 }}>
                <Icon icon={arrowBackFill} width={20} height={20} />
              </IconButton>

              <Typography variant="h4" sx={{ flexGrow: 1 }}>
                {post.title}
              </Typography>

              <Stack direction="row" spacing={1}>
                <IconButton color="primary" onClick={handleEdit}>
                  <Icon icon={editFill} width={20} height={20} />
                </IconButton>
                <IconButton color="error" onClick={() => setOpenDialog(true)}>
                  <Icon icon={trash2Fill} width={20} height={20} />
                </IconButton>
              </Stack>
            </Stack>

            {post.coverImage && (
              <Box
                component="img"
                src={post.coverImage}
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 2,
                  mb: 5
                }}
              />
            )}

            <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
              {post.categories.map((category) => (
                <Chip key={category} label={category} />
              ))}
            </Stack>

            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 5 }}>
              <Avatar src={post.author.avatar} alt={post.author.name} />
              <Box>
                <Typography variant="subtitle2">{post.author.name}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {fDate(post.createdAt)}
                  {post.status === 'draft' && (
                    <Chip
                      label="Draft"
                      size="small"
                      color="warning"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ mb: 5 }} />

            <div dangerouslySetInnerHTML={{ __html: post.content }} />

            <Divider sx={{ mt: 5, mb: 3 }} />

            <Stack direction="row" spacing={2}>
              {post.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  variant="outlined"
                  size="small"
                />
              ))}
            </Stack>

            <Stack direction="row" spacing={3} sx={{ mt: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="subtitle2">Views:</Typography>
                <Typography color="text.secondary">
                  {fShortenNumber(post.metadata.views)}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="subtitle2">Shares:</Typography>
                <Typography color="text.secondary">
                  {fShortenNumber(post.metadata.shares)}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="subtitle2">Read time:</Typography>
                <Typography color="text.secondary">
                  {post.metadata.readTime} min
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Card>

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
