// src/utils/response.helper.ts
import type { Context } from 'hono';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: any;
  code?: string;
  details?: any;
}

// Success response
export const successResponse = <T>(
  c: Context,
  data: T,
  options?: {
    message?: string;
    status?: number;
    meta?: any;
  }
) => {
  const { message = 'Success', status = 200, meta } = options || {};

  const body: ApiResponse<T> = {
    success: true,
    message,
    data,
  };

  if (meta) body.meta = meta;

  return c.json(body, status as any); // Hono akan handle status dengan benar
};

// Error response
export const errorResponse = (
  c: Context,
  message: string,
  options?: {
    status?: number;
    code?: string;
    details?: any;
  }
) => {
  const { status = 400, code, details } = options || {};

  const body: ApiResponse = {
    success: false,
    message,
  };

  if (code) body.code = code;
  if (details) body.details = details;

  return c.json(body, status as any);
};

// Custom error class (opsional, tapi sangat direkomendasikan)
export class AppError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = 'AppError';
  }
}