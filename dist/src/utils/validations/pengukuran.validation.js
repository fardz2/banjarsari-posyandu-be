// src/validations/pengukuran.validation.ts
import { z } from 'zod';
// Schema untuk create pengukuran
export const createPengukuranSchema = z.object({
    anakNik: z.string().min(1, 'NIK anak wajib diisi'),
    tglUkur: z.string().or(z.date()).transform((val) => new Date(val)),
    berat: z.number().positive('Berat badan harus positif'),
    tinggi: z.number().positive('Tinggi badan harus positif'),
    lila: z.number().positive('LILA harus positif').optional(),
    caraUkur: z.string().optional(),
    usiaSaatUkur: z.string().optional(),
    status_bb_u: z.string().optional(),
    zs_bb_u: z.number().optional(),
    status_tb_u: z.string().optional(),
    zs_tb_u: z.number().optional(),
    status_bb_tb: z.string().optional(),
    zs_bb_tb: z.number().optional(),
    lingkarKepala: z.number().positive('Lingkar Kepala harus positif').optional(),
    status_lk_u: z.string().optional(),
    zs_lk_u: z.number().optional(),
    naikBeratBadan: z.string().optional(),
});
// Schema untuk update pengukuran
export const updatePengukuranSchema = z.object({
    tglUkur: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
    berat: z.number().positive('Berat badan harus positif').optional(),
    tinggi: z.number().positive('Tinggi badan harus positif').optional(),
    lila: z.number().positive('LILA harus positif').optional(),
    caraUkur: z.string().optional(),
    usiaSaatUkur: z.string().optional(),
    status_bb_u: z.string().optional(),
    zs_bb_u: z.number().optional(),
    status_tb_u: z.string().optional(),
    zs_tb_u: z.number().optional(),
    status_bb_tb: z.string().optional(),
    zs_bb_tb: z.number().optional(),
    lingkarKepala: z.number().positive('Lingkar Kepala harus positif').optional(),
    status_lk_u: z.string().optional(),
    zs_lk_u: z.number().optional(),
    naikBeratBadan: z.string().optional(),
});
