// src/validations/ortu.validation.ts

import { z } from 'zod';

// Schema untuk create ortu
export const createOrtuSchema = z.object({
  nik: z.string().length(16, 'NIK harus 16 digit').optional(),
  alamat: z.string().optional(),
  telepon: z.string().optional(),
  userAyahId: z.string().optional(),
  userIbuId: z.string().optional(),
}).refine((data) => data.userAyahId || data.userIbuId, {
  message: 'Minimal pilih akun User untuk Ayah atau Ibu',
  path: ['userAyahId'],
});

// Schema untuk update ortu
export const updateOrtuSchema = z.object({
  nik: z.string().length(16, 'NIK harus 16 digit').optional(),
  alamat: z.string().optional(),
  telepon: z.string().optional(),
  userAyahId: z.string().optional(),
  userIbuId: z.string().optional(),
});
