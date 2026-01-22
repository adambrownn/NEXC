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
      formData.append('files', file); // Media endpoint expects 'files' plural
      formData.append('category', 'blog');
      
      const response = await axios.post('/media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Media API returns array of uploaded files
      const uploadedFile = response.data.data[0];
      return {
        url: uploadedFile.url,
        ...uploadedFile
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload image');
    }
  }

  async getBlogBySlug(slug) {
    try {
      const response = await axios.get(`/blogs/slug/${slug}`);
      return response.data;
    } catch (error) {
      if (this.useMockData) {
        console.info('Using mock data for blog by slug (development mode)');
        return {
          data: MOCK_DATA.data[0]
        };
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch blog post');
    }
  }

  async analyzeSEO(id) {
    try {
      const response = await axios.post(`/blogs/${id}/seo-analyze`);
      return response.data;
    } catch (error) {
      if (this.useMockData) {
        console.info('Using mock data for SEO analysis (development mode)');
        return {
          success: true,
          data: {
            score: 75,
            issues: ['Meta description could be longer'],
            suggestions: ['Add more relevant keywords', 'Include Open Graph metadata'],
            keywords: ['construction', 'safety', 'training']
          }
        };
      }
      throw new Error(error.response?.data?.message || 'Failed to analyze SEO');
    }
  }

  async generateStructuredData(blog) {
    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": blog.title,
      "description": blog.excerpt,
      "image": blog.coverImage,
      "author": {
        "@type": "Person",
        "name": blog.author.name
      },
      "datePublished": blog.publishedAt || blog.createdAt,
      "dateModified": blog.updatedAt,
      "publisher": {
        "@type": "Organization",
        "name": "NEXC",
        "logo": {
          "@type": "ImageObject",
          "url": "https://nexc.com/logo.png"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://nexc.com/blog/${blog.slug}`
      }
    };
  }

  async getCalendarPosts(startDate, endDate) {
    try {
      const response = await axios.get('/blogs/calendar', {
        params: { start: startDate, end: endDate }
      });
      return response.data;
    } catch (error) {
      if (this.useMockData) {
        console.info('Using mock data for calendar posts (development mode)');
        return {
          success: true,
          data: [
            {
              ...MOCK_DATA.data[0],
              scheduledAt: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
              status: 'scheduled'
            }
          ]
        };
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch calendar posts');
    }
  }

  async scheduleBlog(id, scheduledAt, schedulingSettings = {}) {
    try {
      const response = await axios.patch(`/blogs/${id}/schedule`, {
        scheduledAt,
        schedulingSettings
      });
      return response.data;
    } catch (error) {
      if (this.useMockData) {
        console.info('Using mock data for blog scheduling (development mode)');
        return {
          success: true,
          data: {
            ...MOCK_DATA.data[0],
            _id: id,
            status: 'scheduled',
            scheduledAt,
            schedulingSettings
          }
        };
      }
      throw new Error(error.response?.data?.message || 'Failed to schedule blog post');
    }
  }

  async updateWorkflow(id, workflowData) {
    try {
      const response = await axios.patch(`/blogs/${id}/workflow`, workflowData);
      return response.data;
    } catch (error) {
      if (this.useMockData) {
        console.info('Using mock data for workflow update (development mode)');
        return {
          success: true,
          data: {
            ...MOCK_DATA.data[0],
            _id: id,
            workflow: {
              currentStage: workflowData.stage || 'draft',
              assignedTo: workflowData.assignedTo,
              reviewNotes: [
                {
                  author: 'mock-user-id',
                  note: workflowData.note || 'Workflow updated',
                  timestamp: new Date().toISOString()
                }
              ]
            }
          }
        };
      }
      throw new Error(error.response?.data?.message || 'Failed to update workflow');
    }
  }

  async processScheduledPosts() {
    try {
      const response = await axios.post('/blogs/process-scheduled');
      return response.data;
    } catch (error) {
      if (this.useMockData) {
        console.info('Using mock data for processing scheduled posts (development mode)');
        return {
          success: true,
          message: 'No scheduled posts to process (development mode)',
          data: []
        };
      }
      throw new Error(error.response?.data?.message || 'Failed to process scheduled posts');
    }
  }
}

export const blogService = new BlogService();
