// src/services/anak.service.ts

import { prisma } from '../db/prisma.js';
import {
  canAccessAllPosyandu,
  canCreateMedicalData,
  canUpdateMedicalData,
  canDeleteMedicalData,
  getPosyanduFilter,
  requirePermission,
  requirePosyanduAccess,
  type UserContext,
} from '../utils/permission.helper.js';
import type {
  AnakResponse,
  CreateAnakInput,
  UpdateAnakInput,
} from '../utils/interfaces/anak.interface.js';

// SERVICE: Get all anak (filtered by permission & posyandu)
export const getAllAnakService = async (
  requestingUser: UserContext,
  filters?: { posyanduId?: number; rw?: string }
): Promise<AnakResponse[]> => {
  const posyanduFilter = getPosyanduFilter(requestingUser);

  // Apply additional filters
  const where = {
    ...posyanduFilter,
    ...(filters?.posyanduId && { posyanduId: filters.posyanduId }),
    ...(filters?.rw && { rw: filters.rw }),
  };

  const anak = await prisma.anak.findMany({
    where,
    include: {
      posyandu: {
        select: {
          id: true,
          nama: true,
        },
      },
      ortu: {
        select: {
          id: true,
          namaAyah: true,
          namaIbu: true,
        },
      },
    },
    orderBy: { nama: 'asc' },
  });

  return anak;
};

// SERVICE: Get anak by NIK
export const getAnakByNikService = async (
  nik: string,
  requestingUser: UserContext
): Promise<AnakResponse> => {
  const anak = await prisma.anak.findUnique({
    where: { nik },
    include: {
      posyandu: {
        select: {
          id: true,
          nama: true,
        },
      },
      ortu: {
        select: {
          id: true,
          namaAyah: true,
          namaIbu: true,
        },
      },
    },
  });

  if (!anak) {
    throw new Error('Data anak tidak ditemukan');
  }

  // Check permission
  if (requestingUser.role === 'ORANG_TUA') {
    // 1. Find Ortu profile for this user
    const ortuProfile = await prisma.ortu.findFirst({
      where: {
        OR: [
          { userAyahId: requestingUser.id },
          { userIbuId: requestingUser.id }
        ]
      },
    });

    // 2. Check if this is their child
    if (!ortuProfile || anak.ortuId !== ortuProfile.id) {
      throw new Error('Anda tidak memiliki akses ke data anak ini');
    }
  } else {
    // For other roles, check posyandu access
    requirePosyanduAccess(requestingUser, anak.posyanduId, 'data anak');
  }

  return anak;
};

// SERVICE: Get anak by orang tua (untuk ORANG_TUA role)
export const getMyChildrenService = async (
  requestingUser: UserContext
): Promise<AnakResponse[]> => {
  // 1. Find ortu profile linked to this user (as Ayah OR Ibu)
  let ortuProfile = await prisma.ortu.findFirst({
    where: {
      OR: [
        { userAyahId: requestingUser.id },
        { userIbuId: requestingUser.id }
      ]
    },
  });

  // 2. If no profile found, try to auto-link with existing Orphaned Ortu data (by name)
  // This handles cases where data was imported/created before the parent registered account
  if (!ortuProfile) {
    // Need to fetch user details to get the name (as UserContext doesn't have it)
    const user = await prisma.user.findUnique({
      where: { id: requestingUser.id },
      select: { name: true },
    });

    if (user && user.name) {
      // Search logic: Match name to Ayah OR Ibu field
      // AND ensure the corresponding user slot is empty
      ortuProfile = await prisma.ortu.findFirst({
        where: {
          OR: [
            {
              AND: [
                { userAyahId: null },
                { namaAyah: { equals: user.name, mode: 'insensitive' } },
              ],
            },
            {
              AND: [
                { userIbuId: null },
                { namaIbu: { equals: user.name, mode: 'insensitive' } },
              ],
            },
          ],
        },
      });

      // If matches, link it to this user
      if (ortuProfile) {
        // Determine whether to link as Ayah or Ibu based on name match
        const isAyah = ortuProfile.namaAyah?.toLowerCase() === user.name.toLowerCase();
        
        ortuProfile = await prisma.ortu.update({
          where: { id: ortuProfile.id },
          data: isAyah 
            ? { userAyahId: requestingUser.id }
            : { userIbuId: requestingUser.id },
        });
      }
    }
  }

  if (!ortuProfile) {
    return []; // Belum ada profile ortu dan tidak ada data yang cocok
  }

  const anak = await prisma.anak.findMany({
    where: { ortuId: ortuProfile.id },
    include: {
      posyandu: {
        select: {
          id: true,
          nama: true,
        },
      },
      ortu: {
        select: {
          id: true,
          namaAyah: true,
          namaIbu: true,
        },
      },
    },
    orderBy: { nama: 'asc' },
  });

  return anak;
};

// SERVICE: Create anak
export const createAnakService = async (
  data: CreateAnakInput,
  requestingUser: UserContext
): Promise<AnakResponse> => {
  // Check permission: harus bisa create medical data
  requirePermission(
    canCreateMedicalData(requestingUser.role),
    'Anda tidak memiliki permission untuk menambah data anak'
  );

  // Check permission: user harus punya akses ke posyandu target
  requirePosyanduAccess(requestingUser, data.posyanduId, 'posyandu');

  const anak = await prisma.anak.create({
    data: {
      nik: data.nik,
      nama: data.nama,
      jenisKelamin: data.jenisKelamin,
      tglLahir: new Date(data.tglLahir),
      bbLahir: data.bbLahir || null,
      tbLahir: data.tbLahir || null,
      alamat: data.alamat || null,
      rw: data.rw || null,
      posyanduId: data.posyanduId,
      ortuId: data.ortuId || null,
    },
    include: {
      posyandu: {
        select: {
          id: true,
          nama: true,
        },
      },
      ortu: {
        select: {
          id: true,
          namaAyah: true,
          namaIbu: true,
        },
      },
    },
  });

  return anak;
};

// SERVICE: Update anak
export const updateAnakService = async (
  nik: string,
  data: UpdateAnakInput,
  requestingUser: UserContext
): Promise<AnakResponse> => {
  // Get existing anak
  const existingAnak = await getAnakByNikService(nik, requestingUser);

  // Check permission
  requirePermission(
    canUpdateMedicalData(requestingUser.role),
    'Anda tidak memiliki permission untuk update data anak'
  );

  // If changing posyanduId, check access to new posyandu
  if (data.posyanduId && data.posyanduId !== existingAnak.posyanduId) {
    requirePosyanduAccess(requestingUser, data.posyanduId, 'posyandu baru');
  }

  const updatedAnak = await prisma.anak.update({
    where: { nik },
    data: {
      nama: data.nama,
      jenisKelamin: data.jenisKelamin,
      tglLahir: data.tglLahir ? new Date(data.tglLahir) : undefined,
      bbLahir: data.bbLahir,
      tbLahir: data.tbLahir,
      alamat: data.alamat,
      rw: data.rw,
      posyanduId: data.posyanduId,
      ortuId: data.ortuId,
    },
    include: {
      posyandu: {
        select: {
          id: true,
          nama: true,
        },
      },
      ortu: {
        select: {
          id: true,
          namaAyah: true,
          namaIbu: true,
        },
      },
    },
  });

  return updatedAnak;
};

// SERVICE: Delete anak
export const deleteAnakService = async (
  nik: string,
  requestingUser: UserContext
): Promise<void> => {
  // Get existing anak
  await getAnakByNikService(nik, requestingUser);

  // Check permission: only admin and super admin can delete
  requirePermission(
    canDeleteMedicalData(requestingUser.role),
    'Hanya Admin dan Super Admin yang bisa delete data anak'
  );

  // Delete all pengukuran first
  await prisma.pengukuranAnak.deleteMany({
    where: { anakNik: nik },
  });

  // Then delete anak
  await prisma.anak.delete({
    where: { nik },
  });
};
