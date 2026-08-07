import { Response } from 'express';

export interface StandardResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

export const sendSuccess = <T>(res: Response, message: string, data: T, statusCode = 200) => {
  const responseBody: StandardResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(responseBody);
};

export const sendError = (res: Response, message: string, errors: any[] = [], statusCode = 400) => {
  const responseBody: StandardResponse = {
    success: false,
    message,
    errors,
  };
  return res.status(statusCode).json(responseBody);
};
