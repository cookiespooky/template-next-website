
import axios from 'axios'
import Cookies from 'js-cookie'

const API_BASE_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3002/api'

export const adminApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

// Request interceptor to add auth token
adminApi.interceptors.request.use(
  (config) => {
    const token = Cookies.get('adminToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('adminToken')
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  }
)

// API functions
export const authApi = {
  login: (email: string, password: string) =>
    adminApi.post('/auth/login', { email, password }),
  logout: () => adminApi.post('/auth/logout'),
  me: () => adminApi.get('/auth/me'),
  forgotPassword: (email: string) =>
    adminApi.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    adminApi.post('/auth/reset-password', { token, password }),
}

export const coursesApi = {
  getAll: (params?: any) => adminApi.get('/courses', { params }),
  getById: (id: string) => adminApi.get(`/courses/${id}`),
  create: (data: any) => adminApi.post('/courses', data),
  update: (id: string, data: any) => adminApi.put(`/courses/${id}`, data),
  delete: (id: string) => adminApi.delete(`/courses/${id}`),
  publish: (id: string, isPublished: boolean) =>
    adminApi.patch(`/courses/${id}/publish`, { isPublished }),
}

export const categoriesApi = {
  getAll: (params?: any) => adminApi.get('/categories', { params }),
  getById: (id: string) => adminApi.get(`/categories/${id}`),
  create: (data: any) => adminApi.post('/categories', data),
  update: (id: string, data: any) => adminApi.put(`/categories/${id}`, data),
  delete: (id: string) => adminApi.delete(`/categories/${id}`),
  reorder: (categoryOrders: Array<{ id: string; sortOrder: number }>) =>
    adminApi.patch('/categories/reorder', { categoryOrders }),
}

export const instructorsApi = {
  getAll: (params?: any) => adminApi.get('/instructors', { params }),
  getById: (id: string) => adminApi.get(`/instructors/${id}`),
  create: (data: any) => adminApi.post('/instructors', data),
  update: (id: string, data: any) => adminApi.put(`/instructors/${id}`, data),
  delete: (id: string) => adminApi.delete(`/instructors/${id}`),
  getStats: (id: string) => adminApi.get(`/instructors/${id}/stats`),
}

export const lessonsApi = {
  getByCourse: (courseId: string) => adminApi.get(`/lessons/course/${courseId}`),
  getById: (id: string) => adminApi.get(`/lessons/${id}`),
  create: (data: any) => adminApi.post('/lessons', data),
  update: (id: string, data: any) => adminApi.put(`/lessons/${id}`, data),
  delete: (id: string) => adminApi.delete(`/lessons/${id}`),
  reorder: (lessonOrders: Array<{ id: string; sortOrder: number }>) =>
    adminApi.patch('/lessons/reorder', { lessonOrders }),
}

export const tagsApi = {
  getAll: (params?: any) => adminApi.get('/tags', { params }),
  getById: (id: string) => adminApi.get(`/tags/${id}`),
  create: (data: any) => adminApi.post('/tags', data),
  update: (id: string, data: any) => adminApi.put(`/tags/${id}`, data),
  delete: (id: string) => adminApi.delete(`/tags/${id}`),
}

export const settingsApi = {
  getAll: (params?: any) => adminApi.get('/settings', { params }),
  getByKey: (key: string) => adminApi.get(`/settings/${key}`),
  update: (key: string, data: any) => adminApi.put(`/settings/${key}`, data),
  updateBulk: (settings: any[]) => adminApi.patch('/settings/bulk', { settings }),
  delete: (key: string) => adminApi.delete(`/settings/${key}`),
  initialize: () => adminApi.post('/settings/initialize'),
}

export const uploadsApi = {
  uploadSingle: (file: File, options?: any) => {
    const formData = new FormData()
    formData.append('file', file)
    if (options) {
      Object.keys(options).forEach(key => {
        formData.append(key, options[key])
      })
    }
    return adminApi.post('/uploads/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  uploadMultiple: (files: File[]) => {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })
    return adminApi.post('/uploads/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  delete: (filename: string) => adminApi.delete(`/uploads/${filename}`),
  getInfo: (filename: string) => adminApi.get(`/uploads/${filename}`),
}

export const analyticsApi = {
  getOverview: () => adminApi.get('/analytics/overview'),
  getCourses: (params?: any) => adminApi.get('/analytics/courses', { params }),
  getActivity: (params?: any) => adminApi.get('/analytics/activity', { params }),
}
