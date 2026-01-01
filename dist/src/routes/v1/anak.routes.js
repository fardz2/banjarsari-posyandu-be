// src/routes/v1/anak.routes.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { getAllAnak, getAnakByNik, getMyChildren, createAnak, updateAnak, deleteAnak, } from '../../controllers/anak.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { requireRole, excludeRole } from '../../middlewares/role.middleware.js';
import { createAnakSchema, updateAnakSchema, } from '../../utils/validations/anak.validation.js';
const anakRoutes = new Hono();
// Semua routes butuh authentication
anakRoutes.use('*', authMiddleware);
// Special endpoint untuk ORANG_TUA (lihat anak sendiri)
anakRoutes.get('/my-children', getMyChildren);
// Read endpoints (exclude ORANG_TUA, karena mereka pakai /my-children)
anakRoutes.get('/', excludeRole('ORANG_TUA'), getAllAnak);
anakRoutes.get('/:nik', getAnakByNik);
// Create & Update (SUPER_ADMIN, ADMIN, TENAGA_KESEHATAN, KADER_POSYANDU)
anakRoutes.post('/', requireRole('SUPER_ADMIN', 'ADMIN', 'TENAGA_KESEHATAN', 'KADER_POSYANDU'), zValidator('json', createAnakSchema), createAnak);
anakRoutes.put('/:nik', requireRole('SUPER_ADMIN', 'ADMIN', 'TENAGA_KESEHATAN', 'KADER_POSYANDU'), zValidator('json', updateAnakSchema), updateAnak);
// Delete (hanya SUPER_ADMIN dan ADMIN)
anakRoutes.delete('/:nik', requireRole('SUPER_ADMIN', 'ADMIN'), deleteAnak);
export default anakRoutes;
