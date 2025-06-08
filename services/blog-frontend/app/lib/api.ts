
import axios from 'axios'

const BLOG_API_BASE_URL = process.env.NEXT_PUBLIC_BLOG_API_URL || 'http://localhost:3004/api'

export const blogApi = axios.create({
  baseURL: BLOG_API_BASE_URL,
  timeout: 10000,
})

// Response interceptor for error handling
blogApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// Public API functions (no auth required)
export const publicApi = {
  // Posts
  getPosts: (params?: any) => blogApi.get('/public/posts', { params }),
  getPost: (slug: string) => blogApi.get(`/public/posts/${slug}`),
  getRecentPosts: (limit?: number) => blogApi.get('/public/recent', { params: { limit } }),
  getPopularPosts: (limit?: number) => blogApi.get('/public/popular', { params: { limit } }),
  
  // Categories
  getCategories: () => blogApi.get('/public/categories'),
  
  // Tags
  getTags: () => blogApi.get('/public/tags'),
  
  // RSS and Sitemap
  getRssFeed: () => blogApi.get('/rss'),
  getSitemap: () => blogApi.get('/sitemap'),
}

// SEO and metadata helpers
export const seoApi = {
  generateSitemap: () => blogApi.get('/sitemap'),
  generateRssFeed: () => blogApi.get('/rss'),
}

// Search functionality
export const searchApi = {
  searchPosts: (query: string, params?: any) => 
    blogApi.get('/public/posts', { 
      params: { search: query, ...params } 
    }),
}

// Newsletter subscription (if implemented)
export const newsletterApi = {
  subscribe: (email: string) => 
    blogApi.post('/newsletter/subscribe', { email }),
}

// Contact form (if implemented)
export const contactApi = {
  sendMessage: (data: any) => 
    blogApi.post('/contact', data),
}
