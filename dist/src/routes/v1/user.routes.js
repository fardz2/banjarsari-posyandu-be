// src/routes/v1/user.routes.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createUser, getAllUsers, getUserById, updateUser, deleteUser, assignRole, getUserProfile, updateUserProfile, } from '../../controllers/user.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { createUserSchema, updateUserSchema, updateProfileSchema, assignRoleSchema, } from '../../utils/validations/user.validation.js';
const userRoutes = new Hono();
// Semua routes butuh authentication
userRoutes.use('*', authMiddleware);
// Profile endpoints (semua role bisa akses profile sendiri)
userRoutes.get('/me', getUserProfile);
userRoutes.put('/me', zValidator('json', updateProfileSchema), updateUserProfile);
// User management endpoints (hanya SUPER_ADMIN dan ADMIN)
userRoutes.post('/', requireRole('SUPER_ADMIN', 'ADMIN'), zValidator('json', createUserSchema), createUser);
userRoutes.get('/', requireRole('SUPER_ADMIN', 'ADMIN'), getAllUsers);
userRoutes.get('/:id', requireRole('SUPER_ADMIN', 'ADMIN'), getUserById);
userRoutes.put('/:id', requireRole('SUPER_ADMIN', 'ADMIN'), zValidator('json', updateUserSchema), updateUser);
userRoutes.delete('/:id', requireRole('SUPER_ADMIN', 'ADMIN'), deleteUser);
// Role assignment (hanya SUPER_ADMIN)
userRoutes.patch('/:id/role', requireRole('SUPER_ADMIN'), zValidator('json', assignRoleSchema), assignRole);
export default userRoutes;
