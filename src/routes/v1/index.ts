// src/routes/v1/index.ts
import { Hono } from 'hono';
import userRoutes from './user.routes.js';
import posyanduRoutes from './posyandu.routes.js';
import anakRoutes from './anak.routes.js';
import pengukuranRoutes from './pengukuran.routes.js';
import ibuHamilRoutes from './ibu-hamil.routes.js';
import ortuRoutes from './ortu.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import forumRoutes from './forum.routes.js';
import exportRoutes from './export.routes.js';

const v1 = new Hono();

v1.route('/users', userRoutes);
v1.route('/posyandu', posyanduRoutes);
v1.route('/anak', anakRoutes);
v1.route('/pengukuran', pengukuranRoutes);
v1.route('/ibu-hamil', ibuHamilRoutes);
v1.route('/ortu', ortuRoutes);
v1.route('/dashboard', dashboardRoutes);
v1.route('/forum', forumRoutes);
v1.route('/export', exportRoutes);

v1.get('/', (c) => {
  return c.json({
    success: true,
    message: 'API Posyandu v1 siap digunakan!',
    version: '1.0.0',
  });
});

export default v1;