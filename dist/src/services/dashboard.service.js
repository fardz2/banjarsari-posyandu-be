import { prisma } from '../db/prisma.js';
export const getDashboardSummaryService = async (user) => {
    // Define scope based on user role
    // Define specific filters
    let userFilter = {};
    let anakFilter = {};
    let ibuHamilFilter = {};
    let pengukuranFilter = {};
    let ortuFilter = {};
    let posyanduFilter = {};
    if (user.role === 'SUPER_ADMIN' || user.role === 'TENAGA_KESEHATAN') {
        // No filters for Super Admin & Tenaga Kesehatan
    }
    else if (user.role === 'ORANG_TUA') {
        // Strict scope for Parents
        userFilter = { id: user.id }; // Only see themselves? Or maybe restricted completely. For Dashboard, maybe just themselves or 0.
        anakFilter = { ortu: { userId: user.id } };
        ibuHamilFilter = { id: -1 }; // Parents cannot see Ibu Hamil
        pengukuranFilter = { anak: { ortu: { userId: user.id } } };
        ortuFilter = { userId: user.id };
        posyanduFilter = { id: -1 }; // Parents don't manage posyandu
    }
    else {
        // KADER_POSYANDU, ADMIN (assigned to posyandu)
        // Must have posyanduId. If not, they see nothing.
        if (user.posyanduId) {
            const posyanduScope = { posyanduId: user.posyanduId };
            userFilter = posyanduScope;
            anakFilter = posyanduScope;
            ibuHamilFilter = posyanduScope;
            pengukuranFilter = { anak: posyanduScope };
            ortuFilter = { anak: { some: posyanduScope } };
            posyanduFilter = { id: user.posyanduId };
        }
        else {
            // Fallback for staff without posyanduId: return 0
            userFilter = { id: '0' };
            anakFilter = { id: '0' }; // impossible ID
            ibuHamilFilter = { id: -1 };
            pengukuranFilter = { id: -1 };
            ortuFilter = { id: -1 };
            posyanduFilter = { id: -1 };
        }
    }
    const [usersCount, posyanduCount, anakCount, ibuHamilCount, pengukuranCount, ortuCount] = await Promise.all([
        prisma.user.count({ where: userFilter }),
        prisma.posyandu.count({ where: posyanduFilter }),
        prisma.anak.count({ where: anakFilter }),
        prisma.ibuHamil.count({ where: ibuHamilFilter }),
        prisma.pengukuranAnak.count({ where: pengukuranFilter }),
        prisma.ortu.count({ where: ortuFilter }),
    ]);
    return {
        users: usersCount,
        posyandu: posyanduCount,
        anak: anakCount,
        ibuHamil: ibuHamilCount,
        pengukuran: pengukuranCount,
        ortu: ortuCount
    };
};
export const getGenderStatsService = async (user) => {
    let wherePosyandu = {};
    if (user.role === 'SUPER_ADMIN' || user.role === 'TENAGA_KESEHATAN') {
        wherePosyandu = {};
    }
    else if (user.role === 'ORANG_TUA') {
        wherePosyandu = { ortu: { userId: user.id } };
    }
    else if (user.posyanduId) {
        wherePosyandu = { posyanduId: user.posyanduId };
    }
    const stats = await prisma.anak.groupBy({
        by: ['jenisKelamin'],
        where: wherePosyandu,
        _count: {
            nik: true
        }
    });
    return stats.map(s => ({
        gender: s.jenisKelamin,
        count: s._count.nik
    }));
};
export const getNutritionalStatsService = async (user) => {
    let wherePosyandu = {};
    if (user.role === 'SUPER_ADMIN' || user.role === 'TENAGA_KESEHATAN') {
        wherePosyandu = {};
    }
    else if (user.role === 'ORANG_TUA') {
        wherePosyandu = { anak: { ortu: { userId: user.id } } };
    }
    else if (user.posyanduId) {
        wherePosyandu = { anak: { posyanduId: user.posyanduId } };
    }
    const [bb_u, tb_u, bb_tb, lk_u] = await Promise.all([
        prisma.pengukuranAnak.groupBy({
            by: ['status_bb_u'],
            where: wherePosyandu,
            _count: { id: true }
        }),
        prisma.pengukuranAnak.groupBy({
            by: ['status_tb_u'],
            where: wherePosyandu,
            _count: { id: true }
        }),
        prisma.pengukuranAnak.groupBy({
            by: ['status_bb_tb'],
            where: wherePosyandu,
            _count: { id: true }
        }),
        prisma.pengukuranAnak.groupBy({
            by: ['status_lk_u'],
            where: wherePosyandu,
            _count: { id: true }
        }),
    ]);
    return {
        bb_u: bb_u.map(i => ({ status: i.status_bb_u, count: i._count.id })),
        tb_u: tb_u.map(i => ({ status: i.status_tb_u, count: i._count.id })),
        gizi: bb_tb.map(i => ({ status: i.status_bb_tb, count: i._count.id })),
        lk_u: lk_u.map(i => ({ status: i.status_lk_u, count: i._count.id })),
    };
};
export const getNutritionalStatsByPosyanduService = async (user) => {
    let wherePosyandu = {};
    if (user.role === 'SUPER_ADMIN' || user.role === 'TENAGA_KESEHATAN') {
        wherePosyandu = {};
    }
    else if (user.role === 'ORANG_TUA') {
        wherePosyandu = { anak: { ortu: { userId: user.id } } };
    }
    else if (user.posyanduId) {
        wherePosyandu = { anak: { posyanduId: user.posyanduId } };
    }
    // Fetch all measurements with relevant statuses and posyandu name
    // Note: Optimally we would use raw query for aggregation, but for now we'll aggregate in JS
    const measurements = await prisma.pengukuranAnak.findMany({
        where: wherePosyandu,
        select: {
            status_bb_tb: true,
            status_bb_u: true,
            status_tb_u: true,
            status_lk_u: true,
            anak: {
                select: {
                    posyandu: {
                        select: {
                            nama: true
                        }
                    }
                }
            }
        }
    });
    // Helper to init posyandu stats structure
    const initStats = () => ({
        bb_tb: {},
        bb_u: {},
        tb_u: {},
        lk_u: {},
    });
    const statsByPosyandu = {};
    measurements.forEach(m => {
        const posyanduName = m.anak.posyandu.nama;
        if (!statsByPosyandu[posyanduName]) {
            statsByPosyandu[posyanduName] = initStats();
        }
        if (m.status_bb_tb) {
            statsByPosyandu[posyanduName].bb_tb[m.status_bb_tb] = (statsByPosyandu[posyanduName].bb_tb[m.status_bb_tb] || 0) + 1;
        }
        if (m.status_bb_u) {
            statsByPosyandu[posyanduName].bb_u[m.status_bb_u] = (statsByPosyandu[posyanduName].bb_u[m.status_bb_u] || 0) + 1;
        }
        if (m.status_tb_u) {
            statsByPosyandu[posyanduName].tb_u[m.status_tb_u] = (statsByPosyandu[posyanduName].tb_u[m.status_tb_u] || 0) + 1;
        }
        if (m.status_lk_u) {
            statsByPosyandu[posyanduName].lk_u[m.status_lk_u] = (statsByPosyandu[posyanduName].lk_u[m.status_lk_u] || 0) + 1;
        }
    });
    // Transform to list for frontend
    return Object.entries(statsByPosyandu).map(([posyandu, stats]) => ({
        posyandu,
        stats: {
            bb_tb: Object.entries(stats.bb_tb).map(([status, count]) => ({ status, count })),
            bb_u: Object.entries(stats.bb_u).map(([status, count]) => ({ status, count })),
            tb_u: Object.entries(stats.tb_u).map(([status, count]) => ({ status, count })),
            lk_u: Object.entries(stats.lk_u).map(([status, count]) => ({ status, count })),
        }
    }));
};
export const getVisitTrendsService = async (user) => {
    let wherePosyandu = {};
    if (user.role === 'SUPER_ADMIN' || user.role === 'TENAGA_KESEHATAN') {
        wherePosyandu = {};
    }
    else if (user.role === 'ORANG_TUA') {
        wherePosyandu = { anak: { ortu: { userId: user.id } } };
    }
    else if (user.posyanduId) {
        wherePosyandu = { anak: { posyanduId: user.posyanduId } };
    }
    const visits = await prisma.pengukuranAnak.findMany({
        where: {
            ...wherePosyandu,
            tglUkur: {
                gte: new Date(new Date().setMonth(new Date().getMonth() - 11)) // Last 12 months
            }
        },
        select: {
            tglUkur: true
        }
    });
    // Client-side grouping (Node.js)
    const monthlyCounts = {};
    visits.forEach((v) => {
        const month = v.tglUkur.toISOString().slice(0, 7); // YYYY-MM
        monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
    });
    return Object.entries(monthlyCounts)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([month, count]) => ({ month, count }));
};
