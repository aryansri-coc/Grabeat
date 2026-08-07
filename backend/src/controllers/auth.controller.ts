import { Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { loginSchema } from '../validators';
import { AuthenticatedRequest } from '../types';

export const login = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const credentials = loginSchema.parse(req.body);
  const result = await AuthService.login(credentials.email, credentials.password);
  
  return sendSuccess(res, 'Login successful', result);
});

export const logout = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // In stateless JWT, logout is handled by client destroying the token.
  // We return a confirmation message.
  return sendSuccess(res, 'Logged out successfully', null);
});

export const me = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new Error('User not found on request'));
  }
  const user = await AuthService.me(req.user.id);
  return sendSuccess(res, 'Current user retrieved successfully', user);
});
