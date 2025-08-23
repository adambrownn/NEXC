import axios from '../axiosConfig';

const MOCK_DATA = {
  data: [
    {
      _id: '1',
      title: 'Sample Blog Post',
      content: 'This is a sample blog post content.',
      excerpt: 'A brief excerpt of the blog post.',
      coverImage: '/static/mock-images/covers/cover_1.jpg',
      author: {
        name: 'John Doe',
        avatarUrl: '/static/mock-images/avatars/avatar_1.jpg'
      },
      createdAt: new Date().toISOString(),
      metadata: {
        views: 100,
        shares: 50,
        readTime: 5
      },
      categories: ['Technology'],
      tags: ['React', 'JavaScript']
    }
  ]
};

class BlogService {
  constructor() {
    this.useMockData = process.env.REACT_APP_USE_MOCK_DATA === 'true' || process.env.NODE_ENV === 'development';
  }

  async getBlogs(params = {}) {
    try {
      const response = await axios.get('/blogs', { params });
      return response.data;
    } catch (error) {
      if (this.useMockData) {
        console.info('Using mock data for blogs (development mode)');
        return MOCK_DATA;
      }
      console.error('Failed to fetch blogs:', error.message);
      throw error;
    }
  }

  async getBlog(id) {
    try {
      const response = await axios.get(`/blogs/${id}`);
      return response.data;
    } catch (error) {
      if (this.useMockData) {
        console.info('Using mock data for single blog (development mode)');
        return {
          data: MOCK_DATA.data[0]
        };
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch blog post');
    }
  }

  async createBlog(blogData) {
    try {
      const response = await axios.post('/blogs', blogData);
      return response.data;
    } catch (error) {
      if (this.useMockData) {
        console.info('Using mock data for blog creation (development mode)');
        return {
          success: true,
          data: {
            ...MOCK_DATA.data[0],
            ...blogData,
            _id: Date.now().toString(),
            createdAt: new Date().toISOString()
          }
        };
      }
      throw new Error(error.response?.data?.message || 'Failed to create blog post');
    }
  }

  async updateBlog(id, blogData) {
    try {
      const response = await axios.put(`/blogs/${id}`, blogData);
      return response.data;
    } catch (error) {
      if (this.useMockData) {
        console.info('Using mock data for blog update (development mode)');
        return {
          success: true,
          data: {
            ...MOCK_DATA.data[0],
            ...blogData,
            _id: id,
            updatedAt: new Date().toISOString()
          }
        };
      }
      throw new Error(error.response?.data?.message || 'Failed to update blog post');
    }
  }

  async deleteBlog(id) {
    try {
      const response = await axios.delete(`/blogs/${id}`);
      return response.data;
    } catch (error) {
      if (this.useMockData) {
        console.info('Using mock data for blog deletion (development mode)');
        return {
          success: true,
          message: 'Blog post deleted successfully'
        };
      }
      throw new Error(error.response?.data?.message || 'Failed to delete blog post');
    }
  }

  async togglePublishStatus(id) {
    try {
      const response = await axios.post(`/blogs/${id}/publish`);
      return response.data;
    } catch (error) {
      if (this.useMockData) {
        console.info('Using mock data for blog publish toggle (development mode)');
        return {
          success: true,
          message: 'Blog publish status toggled successfully'
        };
      }
      throw new Error(error.response?.data?.message || 'Failed to toggle publish status');
    }
  }

  async uploadImage(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload image');
    }
  }
}

export const blogService = new BlogService();
