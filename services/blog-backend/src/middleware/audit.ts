
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

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

export const auditMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  let responseBody: any;

  // Capture response body
  res.send = function(body: any) {
    responseBody = body;
    return originalSend.call(this, body);
  };

  // Store original request body
  const requestBody = { ...req.body };

  res.on('finish', async () => {
    try {
      // Only audit successful operations that modify data
      if (res.statusCode >= 200 && res.statusCode < 300 && 
          ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        
        const action = getActionFromMethod(req.method);
        const resource = getResourceFromPath(req.path);
        const resourceId = req.params.id || extractIdFromResponse(responseBody);

        await prisma.blogAuditLog.create({
          data: {
            userId: req.user?.id || 'unknown',
            action,
            resource,
            resourceId,
            oldValues: req.method === 'PUT' || req.method === 'PATCH' ? requestBody : null,
            newValues: req.method !== 'DELETE' ? responseBody : null,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
          }
        });

        logger.info('Blog audit log created', {
          userId: req.user?.id,
          action,
          resource,
          resourceId
        });
      }
    } catch (error) {
      logger.error('Failed to create blog audit log', { error });
    }
  });

  next();
};

function getActionFromMethod(method: string): string {
  switch (method) {
    case 'POST': return 'CREATE';
    case 'PUT':
    case 'PATCH': return 'UPDATE';
    case 'DELETE': return 'DELETE';
    default: return 'READ';
  }
}

function getResourceFromPath(path: string): string {
  const segments = path.split('/').filter(Boolean);
  return segments[1] || 'unknown'; // Skip 'api' segment
}

function extractIdFromResponse(responseBody: any): string | null {
  try {
    const parsed = typeof responseBody === 'string' ? JSON.parse(responseBody) : responseBody;
    return parsed?.data?.id || null;
  } catch {
    return null;
  }
}
