// src/routes/v1/posyandu.routes.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { getAllPosyandu, getPosyanduById, createPosyandu, updatePosyandu, deletePosyandu, } from '../../controllers/posyandu.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { createPosyanduSchema, updatePosyanduSchema, } from '../../utils/validations/posyandu.validation.js';
const posyanduRoutes = new Hono();
// Semua routes butuh authentication
posyanduRoutes.use('*', authMiddleware);
// Read endpoints (semua authenticated user bisa akses)
posyanduRoutes.get('/', getAllPosyandu);
posyanduRoutes.get('/:id', getPosyanduById);
// Create, Update, Delete (hanya SUPER_ADMIN)
posyanduRoutes.post('/', requireRole('SUPER_ADMIN'), zValidator('json', createPosyanduSchema), createPosyandu);
posyanduRoutes.put('/:id', requireRole('SUPER_ADMIN'), zValidator('json', updatePosyanduSchema), updatePosyandu);
posyanduRoutes.delete('/:id', requireRole('SUPER_ADMIN'), deletePosyandu);
export default posyanduRoutes;
