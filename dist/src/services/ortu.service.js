// src/services/ortu.service.ts
import { prisma } from '../db/prisma.js';
import { canManageMedicalData, canDeleteData, getPosyanduFilter, requirePermission, isResourceOwner, } from '../utils/permission.helper.js';
// SERVICE: Get all ortu (filtered by posyandu via anak)
export const getAllOrtuService = async (requestingUser) => {
    const posyanduFilter = getPosyanduFilter(requestingUser);
    const ortu = await prisma.ortu.findMany({
        where: {
            anak: {
                some: posyanduFilter,
            },
        },
        include: {
            _count: {
                select: {
                    anak: true,
                },
            },
        },
        orderBy: { id: 'desc' },
    });
    return ortu;
};
// SERVICE: Get ortu by ID
export const getOrtuByIdService = async (id, requestingUser) => {
    const ortu = await prisma.ortu.findUnique({
        where: { id },
        include: {
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
    return ortu;
};
// SERVICE: Get my ortu profile (untuk ORANG_TUA)
export const getMyOrtuProfileService = async (requestingUser) => {
    const ortu = await prisma.ortu.findFirst({
        where: {
            OR: [
                { userAyahId: requestingUser.id },
                { userIbuId: requestingUser.id }
            ]
        },
        include: {
            _count: {
                select: {
                    anak: true,
                },
            },
        },
    });
    return ortu;
};
// SERVICE: Update ortu
export const updateOrtuService = async (id, data, requestingUser) => {
    const existing = await getOrtuByIdService(id, requestingUser);
    requirePermission(canManageMedicalData(requestingUser.role), 'Anda tidak memiliki permission untuk update data orang tua');
    const updated = await prisma.ortu.update({
        where: { id },
        data: {
            nik: data.nik,
            namaAyah: data.namaAyah,
            namaIbu: data.namaIbu,
            alamat: data.alamat,
            telepon: data.telepon,
        },
        include: {
            _count: {
                select: {
                    anak: true,
                },
            },
        },
    });
    return updated;
};
// SERVICE: Update my ortu profile (untuk ORANG_TUA)
export const updateMyOrtuProfileService = async (data, requestingUser) => {
    let ortu = await prisma.ortu.findFirst({
        where: {
            OR: [
                { userAyahId: requestingUser.id },
                { userIbuId: requestingUser.id }
            ]
        },
    });
    if (!ortu) {
        // Need to decide whether to assign as Ayah or Ibu
        // Default to Ayah unless name suggests otherwise or data.namaIbu matches user
        const user = await prisma.user.findUnique({
            where: { id: requestingUser.id },
            select: { name: true }
        });
        const isIbu = user?.name && data.namaIbu &&
            user.name.toLowerCase() === data.namaIbu.toLowerCase();
        // Create ortu profile if not exists
        ortu = await prisma.ortu.create({
            data: {
                userAyahId: !isIbu ? requestingUser.id : null,
                userIbuId: isIbu ? requestingUser.id : null,
                nik: data.nik || null,
                namaAyah: data.namaAyah || null,
                namaIbu: data.namaIbu || null,
                alamat: data.alamat || null,
                telepon: data.telepon || null,
            },
        });
    }
    else {
        ortu = await prisma.ortu.update({
            where: { id: ortu.id },
            data: {
                nik: data.nik,
                namaAyah: data.namaAyah,
                namaIbu: data.namaIbu,
                alamat: data.alamat,
                telepon: data.telepon,
            },
        });
    }
    const result = await getOrtuByIdService(ortu.id, requestingUser);
    return result;
};
// SERVICE: Delete ortu
export const deleteOrtuService = async (id, requestingUser) => {
    await getOrtuByIdService(id, requestingUser);
    requirePermission(canDeleteData(requestingUser.role), 'Hanya Admin dan Super Admin yang bisa delete data orang tua');
    // Check if ortu has anak
    const ortu = await prisma.ortu.findUnique({
        where: { id },
        include: {
            _count: {
                select: {
                    anak: true,
                },
            },
        },
    });
    if (ortu && ortu._count.anak > 0) {
        throw new Error(`Tidak bisa delete data orang tua yang masih memiliki ${ortu._count.anak} anak terdaftar`);
    }
    await prisma.ortu.delete({
        where: { id },
    });
};
