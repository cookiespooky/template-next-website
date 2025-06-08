
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format price in rubles
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// Format duration
export function formatDuration(hours: number): string {
  if (hours < 24) {
    return `${hours} ч.`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (remainingHours === 0) {
    return `${days} дн.`;
  }
  return `${days} дн. ${remainingHours} ч.`;
}

// Generate slug from string
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9а-я]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone number (Russian format)
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Format phone number
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('8')) {
    return `+7${cleaned.slice(1)}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith('7')) {
    return `+${cleaned}`;
  }
  if (cleaned.length === 10) {
    return `+7${cleaned}`;
  }
  return phone;
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

// Calculate discount percentage
export function calculateDiscount(originalPrice: number, salePrice: number): number {
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

// Get course level label
export function getCourseLevelLabel(level: string): string {
  switch (level) {
    case 'BEGINNER':
      return 'Начальный';
    case 'INTERMEDIATE':
      return 'Средний';
    case 'ADVANCED':
      return 'Продвинутый';
    default:
      return level;
  }
}

// Get course format label
export function getCourseFormatLabel(format: string): string {
  switch (format) {
    case 'ONLINE':
      return 'Онлайн';
    case 'OFFLINE':
      return 'Очно';
    case 'HYBRID':
      return 'Смешанный';
    default:
      return format;
  }
}

// Get course type label
export function getCourseTypeLabel(type: string): string {
  switch (type) {
    case 'QUALIFICATION':
      return 'Повышение квалификации';
    case 'DIPLOMA':
      return 'Переподготовка';
    default:
      return type;
  }
}

// Get order status label
export function getOrderStatusLabel(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'Ожидает оплаты';
    case 'PROCESSING':
      return 'Обрабатывается';
    case 'COMPLETED':
      return 'Завершен';
    case 'CANCELLED':
      return 'Отменен';
    case 'REFUNDED':
      return 'Возвращен';
    default:
      return status;
  }
}

// Get payment status label
export function getPaymentStatusLabel(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'Ожидает оплаты';
    case 'PROCESSING':
      return 'Обрабатывается';
    case 'SUCCEEDED':
      return 'Оплачено';
    case 'CANCELLED':
      return 'Отменено';
    case 'REFUNDED':
      return 'Возвращено';
    case 'FAILED':
      return 'Ошибка';
    default:
      return status;
  }
}

// Get enrollment status label
export function getEnrollmentStatusLabel(status: string): string {
  switch (status) {
    case 'ACTIVE':
      return 'Активно';
    case 'COMPLETED':
      return 'Завершено';
    case 'SUSPENDED':
      return 'Приостановлено';
    case 'CANCELLED':
      return 'Отменено';
    default:
      return status;
  }
}

// Generate random password
export function generatePassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Format date
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }).format(dateObj);
}

// Format relative time
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'только что';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} мин. назад`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ч. назад`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} дн. назад`;
  }

  return formatDate(dateObj);
}
