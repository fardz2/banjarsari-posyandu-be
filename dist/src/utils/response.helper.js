// Success response
export const successResponse = (c, data, options) => {
    const { message = 'Success', status = 200, meta } = options || {};
    const body = {
        success: true,
        message,
        data,
    };
    if (meta)
        body.meta = meta;
    return c.json(body, status); // Hono akan handle status dengan benar
};
// Error response
export const errorResponse = (c, message, options) => {
    const { status = 400, code, details } = options || {};
    const body = {
        success: false,
        message,
    };
    if (code)
        body.code = code;
    if (details)
        body.details = details;
    return c.json(body, status);
};
// Custom error class (opsional, tapi sangat direkomendasikan)
export class AppError extends Error {
    status;
    code;
    constructor(message, status, code) {
        super(message);
        this.status = status;
        this.code = code;
        this.name = 'AppError';
    }
}
