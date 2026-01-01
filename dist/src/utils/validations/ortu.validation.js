// src/validations/ortu.validation.ts
import { z } from 'zod';
// Schema untuk update ortu
export const updateOrtuSchema = z.object({
    nik: z.string().length(16, 'NIK harus 16 digit').optional(),
    namaAyah: z.string().optional(),
    namaIbu: z.string().optional(),
    alamat: z.string().optional(),
    telepon: z.string().optional(),
});
