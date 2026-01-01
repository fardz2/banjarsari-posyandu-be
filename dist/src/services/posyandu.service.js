// src/services/posyandu.service.ts
import { prisma } from '../db/prisma.js';
import { canAccessAllPosyandu, canManagePosyandu, requirePermission, } from '../utils/permission.helper.js';
// SERVICE: Get all posyandu (filtered by permission)
export const getAllPosyanduService = async (requestingUser) => {
    // Super admin bisa lihat semua posyandu
    // Role lain hanya bisa lihat posyandu sendiri
    const where = canAccessAllPosyandu(requestingUser.role)
        ? {}
        : { id: requestingUser.posyanduId || 0 }; // Default to invalid ID if null
    const posyandu = await prisma.posyandu.findMany({
        where,
        include: {
            _count: {
                select: {
                    anak: true,
                    ibuHamil: true,
                },
            },
        },
        orderBy: { nama: 'asc' },
    });
    // Manually count kader for each posyandu
    const posyanduWithKaderCount = await Promise.all(posyandu.map(async (p) => {
        const kaderCount = await prisma.user.count({
            where: {
                posyanduId: p.id,
                role: 'KADER_POSYANDU',
            },
        });
        return {
            ...p,
            _count: {
                ...p._count,
                users: kaderCount, // Only count kader
            },
        };
    }));
    return posyanduWithKaderCount;
};
// SERVICE: Get posyandu by ID
export const getPosyanduByIdService = async (id, requestingUser) => {
    const posyandu = await prisma.posyandu.findUnique({
        where: { id },
        include: {
            _count: {
                select: {
                    anak: true,
                    ibuHamil: true,
                },
            },
        },
    });
    if (!posyandu) {
        throw new Error('Posyandu tidak ditemukan');
    }
    // Check permission: non-super-admin hanya bisa lihat posyandu sendiri
    if (!canAccessAllPosyandu(requestingUser.role)) {
        if (posyandu.id !== requestingUser.posyanduId) {
            throw new Error('Anda tidak memiliki akses ke posyandu ini');
        }
    }
    // Manually count kader
    const kaderCount = await prisma.user.count({
        where: {
            posyanduId: posyandu.id,
            role: 'KADER_POSYANDU',
        },
    });
    return {
        ...posyandu,
        _count: {
            ...posyandu._count,
            users: kaderCount, // Only count kader
        },
    };
};
// SERVICE: Create posyandu (super admin only)
export const createPosyanduService = async (data, requestingUser) => {
    // Only super admin can create posyandu
    requirePermission(canManagePosyandu(requestingUser.role), 'Hanya Super Admin yang bisa membuat posyandu baru');
    const posyandu = await prisma.posyandu.create({
        data: {
            nama: data.nama,
            rw: data.rw || null,
            desa: data.desa || 'BANJARSARI',
            kecamatan: data.kecamatan || 'PANGALENGAN',
            puskesmas: data.puskesmas || 'SUKAMANAH',
        },
        include: {
            _count: {
                select: {
                    anak: true,
                    ibuHamil: true,
                },
            },
        },
    });
    // Manually count kader (will be 0 for new posyandu)
    const kaderCount = await prisma.user.count({
        where: {
            posyanduId: posyandu.id,
            role: 'KADER_POSYANDU',
        },
    });
    return {
        ...posyandu,
        _count: {
            ...posyandu._count,
            users: kaderCount,
        },
    };
};
// SERVICE: Update posyandu
export const updatePosyanduService = async (id, data, requestingUser) => {
    // Get existing posyandu
    await getPosyanduByIdService(id, requestingUser);
    // Only super admin can update posyandu
    requirePermission(canManagePosyandu(requestingUser.role), 'Hanya Super Admin yang bisa update posyandu');
    const updatedPosyandu = await prisma.posyandu.update({
        where: { id },
        data: {
            nama: data.nama,
            rw: data.rw,
            desa: data.desa,
            kecamatan: data.kecamatan,
            puskesmas: data.puskesmas,
        },
        include: {
            _count: {
                select: {
                    anak: true,
                    ibuHamil: true,
                },
            },
        },
    });
    // Manually count kader
    const kaderCount = await prisma.user.count({
        where: {
            posyanduId: updatedPosyandu.id,
            role: 'KADER_POSYANDU',
        },
    });
    return {
        ...updatedPosyandu,
        _count: {
            ...updatedPosyandu._count,
            users: kaderCount,
        },
    };
};
// SERVICE: Delete posyandu (super admin only)
export const deletePosyanduService = async (id, requestingUser) => {
    // Get existing posyandu
    await getPosyanduByIdService(id, requestingUser);
    // Only super admin can delete posyandu
    requirePermission(canManagePosyandu(requestingUser.role), 'Hanya Super Admin yang bisa delete posyandu');
    // Check if posyandu has users, anak, or ibu hamil
    const posyandu = await prisma.posyandu.findUnique({
        where: { id },
        include: {
            _count: {
                select: {
                    users: true,
                    anak: true,
                    ibuHamil: true,
                },
            },
        },
    });
    if (posyandu) {
        const totalData = posyandu._count.users +
            posyandu._count.anak +
            posyandu._count.ibuHamil;
        if (totalData > 0) {
            throw new Error(`Tidak bisa delete posyandu yang masih memiliki data (${posyandu._count.users} users, ${posyandu._count.anak} anak, ${posyandu._count.ibuHamil} ibu hamil)`);
        }
    }
    await prisma.posyandu.delete({
        where: { id },
    });
};
