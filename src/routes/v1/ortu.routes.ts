// src/routes/v1/ortu.routes.ts

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import {
  getAllOrtu,
  getOrtuById,
  getMyOrtuProfile,
  updateOrtu,
  updateMyOrtuProfile,
  deleteOrtu,
} from '../../controllers/ortu.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { updateOrtuSchema } from '../../utils/validations/ortu.validation.js';

const ortuRoutes = new Hono();

ortuRoutes.use('*', authMiddleware);

// Profile endpoints untuk ORANG_TUA
ortuRoutes.get('/me', getMyOrtuProfile);
ortuRoutes.put('/me', zValidator('json', updateOrtuSchema), updateMyOrtuProfile);

// Management endpoints
ortuRoutes.get(
  '/',
  requireRole('SUPER_ADMIN', 'ADMIN', 'TENAGA_KESEHATAN', 'KADER_POSYANDU'),
  getAllOrtu
);
ortuRoutes.get(
  '/:id',
  requireRole('SUPER_ADMIN', 'ADMIN', 'TENAGA_KESEHATAN', 'KADER_POSYANDU'),
  getOrtuById
);
ortuRoutes.put(
  '/:id',
  requireRole('SUPER_ADMIN', 'ADMIN', 'TENAGA_KESEHATAN', 'KADER_POSYANDU'),
  zValidator('json', updateOrtuSchema),
  updateOrtu
);
ortuRoutes.delete('/:id', requireRole('SUPER_ADMIN', 'ADMIN'), deleteOrtu);

export default ortuRoutes;
