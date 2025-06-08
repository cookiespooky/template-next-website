
// Type definitions for the Course Shop Platform

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN' | 'SUPER_ADMIN';
  avatar?: string;
  phone?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  id: string;
  name: string;
  description?: string;
  document?: string;
  doc_expire?: string;
  hours?: string;
  for_whom?: string;
  for_whom_detailed?: string;
  price?: number;
  embedding?: string;
  title: string;
  slug: string;
  shortDescription?: string;
  duration?: string;
  hoursInt?: number;
  oldPrice?: number;
  format: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  type: 'QUALIFICATION' | 'DIPLOMA';
  categoryId: string;
  category?: Category;
  isPopular: boolean;
  isFeatured: boolean;
  isActive: boolean;
  features: string[];
  certificate?: string;
  instructorId?: string;
  instructor?: Instructor;
  imageUrl?: string;
  videoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  enrollments?: Enrollment[];
  reviews?: Review[];
  _count?: {
    enrollments: number;
    reviews: number;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  courses?: Course[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    courses: number;
  };
}

export interface Instructor {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  avatar?: string;
  experience?: string;
  education?: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  courses?: Course[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Enrollment {
  id: string;
  userId: string;
  user?: User;
  courseId: string;
  course?: Course;
  status: 'ACTIVE' | 'COMPLETED' | 'SUSPENDED' | 'CANCELLED';
  progress: number;
  startedAt: Date;
  completedAt?: Date;
  certificateUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  user?: User;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  totalAmount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  billingAddress?: string;
  billingCity?: string;
  billingZip?: string;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
  payments?: Payment[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  order?: Order;
  courseId: string;
  course?: Course;
  quantity: number;
  price: number;
  createdAt: Date;
}

export interface Payment {
  id: string;
  orderId: string;
  order?: Order;
  yookassaId?: string;
  status: 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'CANCELLED' | 'REFUNDED' | 'FAILED';
  amount: number;
  currency: string;
  paymentMethod?: string;
  description?: string;
  metadata?: any;
  paidAt?: Date;
  cancelledAt?: Date;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  userId: string;
  user?: User;
  courseId: string;
  course?: Course;
  rating: number;
  comment?: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactForm {
  id: string;
  userId?: string;
  user?: User;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  formType: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  response?: string;
  respondedAt?: Date;
  respondedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  formType?: string;
}

export interface CheckoutForm {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  billingAddress?: string;
  billingCity?: string;
  billingZip?: string;
}

// Course Filter types
export interface CourseFilters {
  category?: string;
  type?: CourseType;
  level?: CourseLevel;
  format?: CourseFormat;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export type CourseType = 'QUALIFICATION' | 'DIPLOMA';
export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type CourseFormat = 'ONLINE' | 'OFFLINE' | 'HYBRID';

// YooKassa types
export interface YooKassaPayment {
  id: string;
  status: string;
  amount: {
    value: string;
    currency: string;
  };
  description?: string;
  recipient?: {
    account_id: string;
    gateway_id: string;
  };
  payment_method?: {
    type: string;
    id: string;
    saved: boolean;
    title?: string;
  };
  captured_at?: string;
  created_at: string;
  expires_at?: string;
  confirmation?: {
    type: string;
    confirmation_url?: string;
  };
  test: boolean;
  refunded_amount?: {
    value: string;
    currency: string;
  };
  paid: boolean;
  refundable: boolean;
  metadata?: Record<string, any>;
}

export interface YooKassaCreatePayment {
  amount: {
    value: string;
    currency: string;
  };
  confirmation: {
    type: 'redirect';
    return_url: string;
  };
  capture: boolean;
  description?: string;
  metadata?: Record<string, any>;
}
