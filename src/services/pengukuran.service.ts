// src/services/pengukuran.service.ts

import { prisma } from '../db/prisma.js';
import {
  canCreatePengukuran,
  canUpdatePengukuran,
  canDeletePengukuran,
  getPosyanduFilter,
  requirePermission,
  requirePosyanduAccess,
  type UserContext,
} from '../utils/permission.helper.js';
import { getAnakByNikService } from './anak.service.js';
import type {
  PengukuranResponse,
  CreatePengukuranInput,
  UpdatePengukuranInput,
} from '../utils/interfaces/pengukuran.interface.js';
import { calculateNutritionalStatus } from '../utils/calculation.helper.js';

// SERVICE: Get all pengukuran (filtered by posyandu access)
export const getAllPengukuranService = async (
  requestingUser: UserContext,
  filters?: { anakNik?: string; startDate?: Date; endDate?: Date }
): Promise<PengukuranResponse[]> => {
  const posyanduFilter = getPosyanduFilter(requestingUser);

  const where: any = {
    anak: posyanduFilter,
  };

  if (filters?.anakNik) {
    where.anakNik = filters.anakNik;
  }

  if (filters?.startDate || filters?.endDate) {
    where.tglUkur = {};
    if (filters.startDate) {
      where.tglUkur.gte = filters.startDate;
    }
    if (filters.endDate) {
      // Set to end of day to include all records for that day
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      where.tglUkur.lte = endDate;
    }
  }

  const pengukuran = await prisma.pengukuranAnak.findMany({
    where,
    include: {
      anak: {
        select: {
          nik: true,
          nama: true,
          posyanduId: true,
        },
      },
    },
    orderBy: { tglUkur: 'desc' },
  });

  return pengukuran;
};

// SERVICE: Get pengukuran by ID
export const getPengukuranByIdService = async (
  id: number,
  requestingUser: UserContext
): Promise<PengukuranResponse> => {
  const pengukuran = await prisma.pengukuranAnak.findUnique({
    where: { id },
    include: {
      anak: {
        select: {
          nik: true,
          nama: true,
          posyanduId: true,
        },
      },
    },
  });

  if (!pengukuran) {
    throw new Error('Data pengukuran tidak ditemukan');
  }

  // Check permission: user harus punya akses ke posyandu anak
  requirePosyanduAccess(
    requestingUser,
    pengukuran.anak.posyanduId,
    'data pengukuran'
  );

  return pengukuran;
};

// SERVICE: Get pengukuran by anak NIK
export const getPengukuranByAnakService = async (
  anakNik: string,
  requestingUser: UserContext
): Promise<PengukuranResponse[]> => {
  // Verify access to anak first
  await getAnakByNikService(anakNik, requestingUser);

  const pengukuran = await prisma.pengukuranAnak.findMany({
    where: { anakNik },
    include: {
      anak: {
        select: {
          nik: true,
          nama: true,
          posyanduId: true,
        },
      },
    },
    orderBy: { tglUkur: 'desc' },
  });

  return pengukuran;
};

// SERVICE: Create pengukuran
export const createPengukuranService = async (
  data: CreatePengukuranInput,
  requestingUser: UserContext
): Promise<PengukuranResponse> => {
  // Check permission
  requirePermission(
    canCreatePengukuran(requestingUser.role),
    'Anda tidak memiliki permission untuk menambah data pengukuran'
  );

  // Verify access to anak
  const anak = await getAnakByNikService(data.anakNik, requestingUser);

  // Calculate Nutritional Status automatically
  const calculation = calculateNutritionalStatus({
    gender: anak.jenisKelamin.startsWith('P') ? 'P' : 'L',
    birthDate: new Date(anak.tglLahir),
    measurementDate: new Date(data.tglUkur),
    weight: data.berat,
    height: data.tinggi,
    headCircumference: data.lingkarKepala,
  });

  const pengukuran = await prisma.pengukuranAnak.create({
    data: {
      anakNik: data.anakNik,
      tglUkur: new Date(data.tglUkur),
      berat: data.berat,
      tinggi: data.tinggi,
      lila: data.lila || null,
      lingkarKepala: data.lingkarKepala || null,
      caraUkur: data.caraUkur || null,
      usiaSaatUkur: `${calculation.ageMonths.toFixed(1)} bulan`,
      
      // Auto-calculated fields
      status_bb_u: calculation.wfa.status,
      zs_bb_u: calculation.wfa.zScore,
      
      status_tb_u: calculation.lhfa.status,
      zs_tb_u: calculation.lhfa.zScore,
      
      status_bb_tb: calculation.wfl.status,
      zs_bb_tb: calculation.wfl.zScore,

      status_lk_u: calculation.hcfa.status,
      zs_lk_u: calculation.hcfa.zScore,

      naikBeratBadan: data.naikBeratBadan || null,
    },
    include: {
      anak: {
        select: {
          nik: true,
          nama: true,
          posyanduId: true,
        },
      },
    },
  });

  return pengukuran;
};

// SERVICE: Update pengukuran
export const updatePengukuranService = async (
  id: number,
  data: UpdatePengukuranInput,
  requestingUser: UserContext
): Promise<PengukuranResponse> => {
  // Get existing pengukuran
  const existing = await getPengukuranByIdService(id, requestingUser);

  // Check permission
  requirePermission(
    canUpdatePengukuran(requestingUser.role),
    'Anda tidak memiliki permission untuk update data pengukuran'
  );

  // Fetch full anak data for calculation (DOB, Gender)
  // existing.anak from findUnique only has limited fields, so we fetch again or assume existing.anak.nik is available
  // Actually getPengukuranByIdService includes anak with limited select. We need date of birth.
  const anak = await getAnakByNikService(existing.anak.nik, requestingUser);

  // Values for calculation (prefer new data, fallback to existing)
  const weight = data.berat !== undefined ? data.berat : existing.berat;
  const height = data.tinggi !== undefined ? data.tinggi : existing.tinggi;
  const headCircumference = data.lingkarKepala !== undefined ? data.lingkarKepala : (existing.lingkarKepala || undefined);
  const tglUkur = data.tglUkur ? new Date(data.tglUkur) : new Date(existing.tglUkur);

  // Recalculate
  const calculation = calculateNutritionalStatus({
    gender: anak.jenisKelamin.startsWith('P') ? 'P' : 'L',
    birthDate: new Date(anak.tglLahir),
    measurementDate: tglUkur,
    weight,
    height,
    headCircumference,
  });

  const updatedPengukuran = await prisma.pengukuranAnak.update({
    where: { id },
    data: {
      tglUkur: data.tglUkur ? new Date(data.tglUkur) : undefined,
      berat: data.berat,
      tinggi: data.tinggi,
      lila: data.lila,
      lingkarKepala: data.lingkarKepala,
      caraUkur: data.caraUkur,
      usiaSaatUkur: `${calculation.ageMonths.toFixed(1)} bulan`,
      
      // Update calculated fields
      status_bb_u: calculation.wfa.status,
      zs_bb_u: calculation.wfa.zScore,
      status_tb_u: calculation.lhfa.status,
      zs_tb_u: calculation.lhfa.zScore,
      status_bb_tb: calculation.wfl.status,
      zs_bb_tb: calculation.wfl.zScore,
      status_lk_u: calculation.hcfa.status,
      zs_lk_u: calculation.hcfa.zScore,

      naikBeratBadan: data.naikBeratBadan,
    },
    include: {
      anak: {
        select: {
          nik: true,
          nama: true,
          posyanduId: true,
        },
      },
    },
  });

  return updatedPengukuran;
};

// SERVICE: Delete pengukuran
export const deletePengukuranService = async (
  id: number,
  requestingUser: UserContext
): Promise<void> => {
  // Get existing pengukuran
  await getPengukuranByIdService(id, requestingUser);

  // Check permission: only admin and super admin can delete
  requirePermission(
    canDeletePengukuran(requestingUser.role),
    'Hanya Admin dan Super Admin yang bisa delete data pengukuran'
  );

  await prisma.pengukuranAnak.delete({
    where: { id },
  });
};
