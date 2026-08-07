import { Request } from 'express';

export interface TokenPayload {
  id: string;
  email: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}
