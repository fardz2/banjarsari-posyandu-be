// src/middlewares/error.middleware.ts
import { HTTPException } from 'hono/http-exception';
export const globalErrorHandler = (err, c) => {
    console.error('Unhandled Error:', err);
    if (err instanceof HTTPException) {
        return err.getResponse();
    }
    return c.json({
        success: false,
        message: 'Terjadi kesalahan pada server',
    }, 500);
};
