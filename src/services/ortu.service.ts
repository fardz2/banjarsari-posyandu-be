// src/services/ortu.service.ts

import { prisma } from '../db/prisma.js';
import {
  canCreateMedicalData,
  canUpdateMedicalData,
  canDeleteMedicalData,
  getPosyanduFilter,
  requirePermission,
  type UserContext,
} from '../utils/permission.helper.js';
import type {
  OrtuResponse,
  CreateOrtuInput,
  UpdateOrtuInput,
} from '../utils/interfaces/ortu.interface.js';

// Helper to map Prisma result to OrtuResponse
const mapOrtuToResponse = (ortu: any): OrtuResponse => {
  return {
    ...ortu,
    namaAyah: ortu.userAyah?.name || null,
    namaIbu: ortu.userIbu?.name || null,
  };
};

// SERVICE: Get all ortu (filtered by posyandu and must have user assigned)
export const getAllOrtuService = async (
  requestingUser: UserContext
): Promise<OrtuResponse[]> => {
  const posyanduFilter = getPosyanduFilter(requestingUser);

  // Build where clause based on role
  // Only show ortu that have at least one user assigned (userAyahId OR userIbuId not null)
  const whereClause = requestingUser.role === 'SUPER_ADMIN' 
    ? {
        OR: [
          { userAyahId: { not: null } },
          { userIbuId: { not: null } },
        ],
      }
    : {
        AND: [
          // Must have at least one user assigned
          {
            OR: [
              { userAyahId: { not: null } },
              { userIbuId: { not: null } },
            ],
          },
          // AND must have children in this posyandu OR no children yet
          {
            OR: [
              {
                anak: {
                  some: posyanduFilter,
                },
              },
              {
                anak: {
                  none: {},
                },
              },
            ],
          },
        ],
      };

  const ortu = await prisma.ortu.findMany({
    where: whereClause,
    include: {
      userAyah: { select: { name: true } },
      userIbu: { select: { name: true } },
      _count: {
        select: {
          anak: true,
        },
      },
    },
    orderBy: { id: 'desc' },
  });

  return ortu.map(mapOrtuToResponse);
};

// SERVICE: Get ortu by ID
export const getOrtuByIdService = async (
  id: number,
  requestingUser: UserContext
): Promise<OrtuResponse> => {
  const ortu = await prisma.ortu.findUnique({
    where: { id },
    include: {
      userAyah: { select: { name: true } },
      userIbu: { select: { name: true } },
      _count: {
        select: {
          anak: true,
        },
      },
    },
  });

  if (!ortu) {
    throw new Error('Data orang tua tidak ditemukan');
  }

  return mapOrtuToResponse(ortu);
};

// SERVICE: Get my ortu profile (untuk ORANG_TUA)
export const getMyOrtuProfileService = async (
  requestingUser: UserContext
): Promise<OrtuResponse | null> => {
  const ortu = await prisma.ortu.findFirst({
    where: {
      OR: [
        { userAyahId: requestingUser.id },
        { userIbuId: requestingUser.id }
      ]
    },
    include: {
      userAyah: { select: { name: true } },
      userIbu: { select: { name: true } },
      _count: {
        select: {
          anak: true,
        },
      },
    },
  });

  if (!ortu) return null;
  return mapOrtuToResponse(ortu);
};

// SERVICE: Create Ortu
export const createOrtuService = async (
  data: CreateOrtuInput,
  requestingUser: UserContext
): Promise<OrtuResponse> => {
   requirePermission(
    canCreateMedicalData(requestingUser.role),
    'Anda tidak memiliki permission untuk membuat data orang tua'
  );

  const ortu = await prisma.ortu.create({
    data: {
      nik: data.nik,
      alamat: data.alamat,
      telepon: data.telepon,
      userAyahId: data.userAyahId,
      userIbuId: data.userIbuId,
    },
    include: {
      userAyah: { select: { name: true } },
      userIbu: { select: { name: true } },
      _count: {
        select: {
          anak: true,
        },
      },
    },
  });

  return mapOrtuToResponse(ortu);
};

// SERVICE: Update ortu
export const updateOrtuService = async (
  id: number,
  data: UpdateOrtuInput,
  requestingUser: UserContext
): Promise<OrtuResponse> => {
  await getOrtuByIdService(id, requestingUser);

  requirePermission(
    canUpdateMedicalData(requestingUser.role),
    'Anda tidak memiliki permission untuk update data orang tua'
  );

  const updated = await prisma.ortu.update({
    where: { id },
    data: {
      nik: data.nik,
      alamat: data.alamat,
      telepon: data.telepon,
      userAyahId: data.userAyahId,
      userIbuId: data.userIbuId,
    },
    include: {
      userAyah: { select: { name: true } },
      userIbu: { select: { name: true } },
      _count: {
        select: {
          anak: true,
        },
      },
    },
  });

  return mapOrtuToResponse(updated);
};

// SERVICE: Update my ortu profile (untuk ORANG_TUA)
export const updateMyOrtuProfileService = async (
  data: UpdateOrtuInput,
  requestingUser: UserContext
): Promise<OrtuResponse> => {
  let ortu = await prisma.ortu.findFirst({
    where: {
      OR: [
        { userAyahId: requestingUser.id },
        { userIbuId: requestingUser.id }
      ]
    },
  });

  if (!ortu) {
    // Assumption: If creating profile, we assign current user as Ayah unless context implies otherwise?
    // Simplified: Just assign as Ayah for now as default, or we can check gender if User has it (Use doesn't have gender usually)
    // Or check if data.userIbuId matches requestingUser. But this input is restricted.
    // Let's assume userAyahId default.
    
    // Better: Allow user to be assigned as Ayah or Ibu depending on logic.
    // For now, if no profile, create one with userAyahId = me.
    
    // NOTE: This function `updateMyOrtuProfile` might be deprecated or need major rethink with new schema.
    // If we only use `userAyahId`, then we just update that?
    
    ortu = await prisma.ortu.create({
      data: {
        userAyahId: requestingUser.id,
        userIbuId: null, // Can be added later?
        nik: data.nik || null,
        alamat: data.alamat || null,
        telepon: data.telepon || null,
      },
    });
  } else {
    ortu = await prisma.ortu.update({
      where: { id: ortu.id },
      data: {
        nik: data.nik,
        alamat: data.alamat,
        telepon: data.telepon,
        // We don't update userAyahId/userIbuId here presumably, as it's "My Profile".
        // Or do we? The previous logic didn't.
      },
    });
  }

  // Reload with names
  const result = await getOrtuByIdService(ortu.id, requestingUser);
  return result;
};

// SERVICE: Delete ortu
export const deleteOrtuService = async (
  id: number,
  requestingUser: UserContext
): Promise<void> => {
  const ortu = await getOrtuByIdService(id, requestingUser);

  requirePermission(
    canDeleteMedicalData(requestingUser.role),
    'Hanya Admin dan Super Admin yang bisa delete data orang tua'
  );

  if (ortu._count && ortu._count.anak > 0) {
    throw new Error(
      `Tidak bisa delete data orang tua yang masih memiliki ${ortu._count.anak} anak terdaftar`
    );
  }

  await prisma.ortu.delete({
    where: { id },
  });
};
