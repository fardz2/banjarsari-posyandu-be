// src/validations/posyandu.validation.ts

import { z } from 'zod';

// Schema untuk create posyandu
export const createPosyanduSchema = z.object({
  nama: z.string().min(1, 'Nama posyandu wajib diisi'),
  rw: z.string().optional(),
  desa: z.string().default('BANJARSARI'),
  kecamatan: z.string().default('PANGALENGAN'),
  puskesmas: z.string().default('SUKAMANAH'),
});

// Schema untuk update posyandu
export const updatePosyanduSchema = z.object({
  nama: z.string().min(1, 'Nama posyandu wajib diisi').optional(),
  rw: z.string().optional(),
  desa: z.string().optional(),
  kecamatan: z.string().optional(),
  puskesmas: z.string().optional(),
});
