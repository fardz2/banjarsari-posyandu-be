// src/validations/ibu-hamil.validation.ts
import { z } from 'zod';
// Schema untuk create ibu hamil
export const createIbuHamilSchema = z.object({
    nama: z.string().min(1, 'Nama ibu hamil wajib diisi'),
    nik: z.string().length(16, 'NIK harus 16 digit').optional(),
    tglLahir: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
    alamat: z.string().optional(),
    rw: z.string().optional(),
    namaSuami: z.string().optional(),
    hp: z.string().optional(),
    posyanduId: z.number().int().positive('Posyandu ID harus positif'),
});
// Schema untuk update ibu hamil
export const updateIbuHamilSchema = z.object({
    nama: z.string().min(1, 'Nama ibu hamil wajib diisi').optional(),
    nik: z.string().length(16, 'NIK harus 16 digit').optional(),
    tglLahir: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
    alamat: z.string().optional(),
    rw: z.string().optional(),
    namaSuami: z.string().optional(),
    hp: z.string().optional(),
    posyanduId: z.number().int().positive('Posyandu ID harus positif').optional(),
});
