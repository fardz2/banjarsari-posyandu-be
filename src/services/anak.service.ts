// src/services/anak.service.ts

import { prisma } from '../db/prisma.js';
import {
  getPosyanduFilter,
  requirePermission,
  requirePosyanduAccess,
  canCreateMedicalData,
  canUpdateMedicalData,
  canDeleteMedicalData,
  type UserContext,
} from '../utils/permission.helper.js';
import type {
  AnakResponse,
  CreateAnakInput,
  UpdateAnakInput,
} from '../utils/interfaces/anak.interface.js';

// Helper to map Prisma Anak result to AnakResponse
const mapAnakToResponse = (anak: any): AnakResponse => {
  const respons: AnakResponse = {
    ...anak,
    ortu: anak.ortu
      ? {
          id: anak.ortu.id,
          namaAyah: anak.ortu.userAyah?.name || null,
          namaIbu: anak.ortu.userIbu?.name || null,
        }
      : null,
  };
  return respons;
};

// Common include for Anak queries to get Ortu names via relation
const anakInclude = {
  posyandu: {
    select: {
      id: true,
      nama: true,
    },
  },
  ortu: {
    include: {
      userAyah: { select: { name: true } },
      userIbu: { select: { name: true } },
    },
  },
};

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
    include: anakInclude,
    orderBy: { nama: 'asc' },
  });

  return anak.map(mapAnakToResponse);
};

// SERVICE: Get anak by NIK
export const getAnakByNikService = async (
  nik: string,
  requestingUser: UserContext
): Promise<AnakResponse> => {
  const anak = await prisma.anak.findUnique({
    where: { nik },
    include: anakInclude,
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

  return mapAnakToResponse(anak);
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

  // 2. If no profile found, we used to try match by name columns - BUT COLUMNS ARE GONE.
  // So we only rely on strict ID match now.
  // We cannot fallback to name matching because Names are no longer stored in Ortu table.

  if (!ortuProfile) {
    return []; 
  }

  const anak = await prisma.anak.findMany({
    where: { ortuId: ortuProfile.id },
    include: anakInclude,
    orderBy: { nama: 'asc' },
  });

  return anak.map(mapAnakToResponse);
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

  // Handle Ortu Creation/Linking
  let ortuId = data.ortuId;

  if (data.ortuData) {
    const { nik: nikKK, ...ortuDetails } = data.ortuData;
    
    // If NIK KK is provided, try to find existing Ortu
    if (nikKK) {
      const existingOrtu = await prisma.ortu.findUnique({
        where: { nik: nikKK },
      });

      if (existingOrtu) {
        ortuId = existingOrtu.id;
        // Check if we need to link user IDs (if provided in ortuDetails)
        if (ortuDetails.userAyahId || ortuDetails.userIbuId) {
             await prisma.ortu.update({
               where: { id: existingOrtu.id },
               data: {
                 ...(ortuDetails.userAyahId && { userAyahId: ortuDetails.userAyahId }),
                 ...(ortuDetails.userIbuId && { userIbuId: ortuDetails.userIbuId }),
                 ...(ortuDetails.alamat && { alamat: ortuDetails.alamat }),
                 ...(ortuDetails.telepon && { telepon: ortuDetails.telepon }),
               }
             });
        }
      } else {
        // Create new Ortu with NIK
        const newOrtu = await prisma.ortu.create({
          data: {
            nik: nikKK,
            alamat: ortuDetails.alamat,
            telepon: ortuDetails.telepon,
            userAyahId: ortuDetails.userAyahId,
            userIbuId: ortuDetails.userIbuId,
          },
        });
        ortuId = newOrtu.id;
      }
    } else {
      // Create new Ortu without NIK
      const newOrtu = await prisma.ortu.create({
        data: {
          alamat: ortuDetails.alamat,
          telepon: ortuDetails.telepon,
          userAyahId: ortuDetails.userAyahId,
          userIbuId: ortuDetails.userIbuId,
        },
      });
      ortuId = newOrtu.id;
    }
  }

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
      ortuId: ortuId || null,
    },
    include: anakInclude,
  });

  return mapAnakToResponse(anak);
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
    include: anakInclude,
  });

  return mapAnakToResponse(updatedAnak);
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
