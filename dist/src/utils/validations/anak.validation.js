// src/validations/anak.validation.ts
import { z } from 'zod';
// Schema untuk create anak
export const createAnakSchema = z.object({
    nik: z.string().min(16, 'NIK harus 16 digit').max(16, 'NIK harus 16 digit'),
    nama: z.string().min(1, 'Nama anak wajib diisi'),
    jenisKelamin: z.enum(['Laki-laki', 'Perempuan'], {
        message: 'Jenis kelamin harus Laki-laki atau Perempuan',
    }),
    tglLahir: z.string().or(z.date()).transform((val) => new Date(val)),
    bbLahir: z.number().positive('Berat badan lahir harus positif').optional(),
    tbLahir: z.number().positive('Tinggi badan lahir harus positif').optional(),
    alamat: z.string().optional(),
    rw: z.string().optional(),
    posyanduId: z.number().int().positive('Posyandu ID harus positif'),
    ortuId: z.number().int().positive('Ortu ID harus positif').optional(),
});
// Schema untuk update anak
export const updateAnakSchema = z.object({
    nama: z.string().min(1, 'Nama anak wajib diisi').optional(),
    jenisKelamin: z.enum(['Laki-laki', 'Perempuan']).optional(),
    tglLahir: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
    bbLahir: z.number().positive('Berat badan lahir harus positif').optional(),
    tbLahir: z.number().positive('Tinggi badan lahir harus positif').optional(),
    alamat: z.string().optional(),
    rw: z.string().optional(),
    posyanduId: z.number().int().positive('Posyandu ID harus positif').optional(),
    ortuId: z.number().int().positive('Ortu ID harus positif').optional(),
});
