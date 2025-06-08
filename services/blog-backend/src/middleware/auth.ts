
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createError } from './errorHandler';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies.blogToken;
    
    if (!token) {
      throw createError('Access denied. No token provided.', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    // Verify user still exists and is active
    const user = await prisma.blogUser.findUnique({
      where: { id: decoded.id }
    });

    if (!user || !user.isActive) {
      throw createError('Access denied. User not found or inactive.', 401);
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(createError('Invalid token.', 401));
    } else {
      next(error);
    }
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(createError('Access denied. Insufficient permissions.', 403));
    }
    next();
  };
};

export const requireAdmin = requireRole(['ADMIN']);
export const requireEditor = requireRole(['ADMIN', 'EDITOR']);
export const requireAuthor = requireRole(['ADMIN', 'EDITOR', 'AUTHOR']);
export const requireContributor = requireRole(['ADMIN', 'EDITOR', 'AUTHOR', 'CONTRIBUTOR']);
