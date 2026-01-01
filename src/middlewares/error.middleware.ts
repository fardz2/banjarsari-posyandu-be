// src/middlewares/error.middleware.ts

import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

export const globalErrorHandler = (err: Error, c: Context) => {
  console.error('Unhandled Error:', err);

  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  return c.json(
    {
      success: false,
      message: 'Terjadi kesalahan pada server',
    },
    500
  );
};