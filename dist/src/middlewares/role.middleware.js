// src/middlewares/role.middleware.ts
import { createMiddleware } from 'hono/factory';
import { Role } from "@prisma/client";
/**
 * Middleware untuk require specific roles
 * Usage: requireRole('SUPER_ADMIN', 'ADMIN')
 */
export const requireRole = (...allowedRoles) => {
    return createMiddleware(async (c, next) => {
        const user = c.get('user');
        if (!user) {
            return c.json({
                success: false,
                message: 'Unauthorized: Silakan login terlebih dahulu',
            }, 401);
        }
        const userRole = user.role;
        if (!allowedRoles.includes(userRole)) {
            return c.json({
                success: false,
                message: `Forbidden: Role ${userRole} tidak memiliki akses ke resource ini`,
                requiredRoles: allowedRoles,
            }, 403);
        }
        await next();
    });
};
/**
 * Middleware untuk require user punya posyanduId (tidak null)
 */
export const requirePosyanduAssignment = () => {
    return createMiddleware(async (c, next) => {
        const user = c.get('user');
        if (!user) {
            return c.json({
                success: false,
                message: 'Unauthorized: Silakan login terlebih dahulu',
            }, 401);
        }
        // Super admin tidak perlu posyanduId
        if (user.role === 'SUPER_ADMIN') {
            await next();
            return;
        }
        if (!user.posyanduId) {
            return c.json({
                success: false,
                message: 'Forbidden: User belum di-assign ke posyandu. Silakan hubungi administrator.',
            }, 403);
        }
        await next();
    });
};
/**
 * Middleware untuk exclude role tertentu
 * Usage: excludeRole('ORANG_TUA') - semua role boleh kecuali ORANG_TUA
 */
export const excludeRole = (...excludedRoles) => {
    return createMiddleware(async (c, next) => {
        const user = c.get('user');
        if (!user) {
            return c.json({
                success: false,
                message: 'Unauthorized: Silakan login terlebih dahulu',
            }, 401);
        }
        const userRole = user.role;
        if (excludedRoles.includes(userRole)) {
            return c.json({
                success: false,
                message: `Forbidden: Role ${userRole} tidak memiliki akses ke resource ini`,
            }, 403);
        }
        await next();
    });
};
