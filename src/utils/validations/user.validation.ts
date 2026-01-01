// src/validations/user.validation.ts

import { z } from 'zod';

// Schema untuk create user
export const createUserSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  username: z.string().min(3, 'Username minimal 3 karakter').max(30, 'Username maksimal 30 karakter'),
  name: z.string().min(1, 'Nama wajib diisi'),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'TENAGA_KESEHATAN', 'KADER_POSYANDU', 'ORANG_TUA'], {
    message: 'Role tidak valid',
  }).optional(),
  posyanduId: z.number().int().positive('Posyandu ID harus positif').optional(),
});

// Schema untuk update user
export const updateUserSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').optional(),
  username: z.string().min(3, 'Username minimal 3 karakter').max(30, 'Username maksimal 30 karakter').optional(),
  posyanduId: z.number().int().positive('Posyandu ID harus positif').optional(),
});

// Schema untuk update profile
export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').optional(),
  username: z.string().min(3, 'Username minimal 3 karakter').max(30, 'Username maksimal 30 karakter').optional(),
});

// Schema untuk assign role
export const assignRoleSchema = z.object({
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'TENAGA_KESEHATAN', 'KADER_POSYANDU', 'ORANG_TUA'], {
    message: 'Role tidak valid',
  }),
});
