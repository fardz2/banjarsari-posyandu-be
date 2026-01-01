// src/services/ibu-hamil.service.ts

import { prisma } from '../db/prisma.js';
import {
  canCreateMedicalData,
  canUpdateMedicalData,
  canDeleteMedicalData,
  getPosyanduFilter,
  requirePermission,
  requirePosyanduAccess,
  type UserContext,
} from '../utils/permission.helper.js';
import type {
  IbuHamilResponse,
  CreateIbuHamilInput,
  UpdateIbuHamilInput,
} from '../utils/interfaces/ibu-hamil.interface.js';

// SERVICE: Get all ibu hamil (filtered by posyandu)
export const getAllIbuHamilService = async (
  requestingUser: UserContext,
  filters?: { posyanduId?: number; rw?: string }
): Promise<IbuHamilResponse[]> => {
  const posyanduFilter = getPosyanduFilter(requestingUser);

  const where = {
    ...posyanduFilter,
    ...(filters?.posyanduId && { posyanduId: filters.posyanduId }),
    ...(filters?.rw && { rw: filters.rw }),
  };

  const ibuHamil = await prisma.ibuHamil.findMany({
    where,
    include: {
      posyandu: {
        select: {
          id: true,
          nama: true,
        },
      },
      _count: {
        select: {
          pemeriksaan: true,
        },
      },
    },
    orderBy: { nama: 'asc' },
  });

  return ibuHamil;
};

// SERVICE: Get ibu hamil by ID
export const getIbuHamilByIdService = async (
  id: number,
  requestingUser: UserContext
): Promise<IbuHamilResponse> => {
  const ibuHamil = await prisma.ibuHamil.findUnique({
    where: { id },
    include: {
      posyandu: {
        select: {
          id: true,
          nama: true,
        },
      },
      _count: {
        select: {
          pemeriksaan: true,
        },
      },
    },
  });

  if (!ibuHamil) {
    throw new Error('Data ibu hamil tidak ditemukan');
  }

  requirePosyanduAccess(requestingUser, ibuHamil.posyanduId, 'data ibu hamil');

  return ibuHamil;
};

// SERVICE: Create ibu hamil
export const createIbuHamilService = async (
  data: CreateIbuHamilInput,
  requestingUser: UserContext
): Promise<IbuHamilResponse> => {
  requirePermission(
    canCreateMedicalData(requestingUser.role),
    'Anda tidak memiliki permission untuk menambah data ibu hamil'
  );

  requirePosyanduAccess(requestingUser, data.posyanduId, 'posyandu');

  const ibuHamil = await prisma.ibuHamil.create({
    data: {
      nama: data.nama,
      nik: data.nik || null,
      tglLahir: data.tglLahir ? new Date(data.tglLahir) : null,
      alamat: data.alamat || null,
      rw: data.rw || null,
      namaSuami: data.namaSuami || null,
      hp: data.hp || null,
      posyanduId: data.posyanduId,
    },
    include: {
      posyandu: {
        select: {
          id: true,
          nama: true,
        },
      },
      _count: {
        select: {
          pemeriksaan: true,
        },
      },
    },
  });

  return ibuHamil;
};

// SERVICE: Update ibu hamil
export const updateIbuHamilService = async (
  id: number,
  data: UpdateIbuHamilInput,
  requestingUser: UserContext
): Promise<IbuHamilResponse> => {
  const existing = await getIbuHamilByIdService(id, requestingUser);

  requirePermission(
    canUpdateMedicalData(requestingUser.role),
    'Anda tidak memiliki permission untuk update data ibu hamil'
  );

  if (data.posyanduId && data.posyanduId !== existing.posyanduId) {
    requirePosyanduAccess(requestingUser, data.posyanduId, 'posyandu baru');
  }

  const updated = await prisma.ibuHamil.update({
    where: { id },
    data: {
      nama: data.nama,
      nik: data.nik,
      tglLahir: data.tglLahir ? new Date(data.tglLahir) : undefined,
      alamat: data.alamat,
      rw: data.rw,
      namaSuami: data.namaSuami,
      hp: data.hp,
      posyanduId: data.posyanduId,
    },
    include: {
      posyandu: {
        select: {
          id: true,
          nama: true,
        },
      },
      _count: {
        select: {
          pemeriksaan: true,
        },
      },
    },
  });

  return updated;
};

// SERVICE: Delete ibu hamil
export const deleteIbuHamilService = async (
  id: number,
  requestingUser: UserContext
): Promise<void> => {
  await getIbuHamilByIdService(id, requestingUser);

  requirePermission(
    canDeleteMedicalData(requestingUser.role),
    'Hanya Admin dan Super Admin yang bisa delete data ibu hamil'
  );

  // Delete all pemeriksaan first
  await prisma.pemeriksaanBumil.deleteMany({
    where: { ibuHamilId: id },
  });

  await prisma.ibuHamil.delete({
    where: { id },
  });
};
