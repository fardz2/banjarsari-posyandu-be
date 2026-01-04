import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import csv from 'csv-parser';
import { prisma } from '../src/db/prisma.js';
import { auth } from '../src/auth.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Log untuk data baru yang dibuat dari file BB Kurang & Gizi Kurang
const dataBaruDibuat = [];
// --- HELPER FUNCTIONS ---
const parseNamaOrtu = (namaOrtu) => {
    if (!namaOrtu || namaOrtu.trim() === '' || namaOrtu === '-') {
        return { namaAyah: '-', namaIbu: '-' };
    }
    const parts = namaOrtu.split(/[/,]/).map(p => p.trim());
    return parts.length >= 2
        ? { namaAyah: parts[0] || '-', namaIbu: parts[1] || '-' }
        : { namaAyah: '-', namaIbu: parts[0] || '-' };
};
const parseDate = (dateStr) => {
    if (!dateStr)
        return null;
    const str = dateStr.trim();
    if (str.includes('/')) {
        const parts = str.split('/');
        if (parts.length === 3) {
            const date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            return isNaN(date.getTime()) ? null : date;
        }
    }
    const date = new Date(str);
    return isNaN(date.getTime()) ? null : date;
};
const fixMeasurement = (val) => {
    if (val === undefined || val === null || val === '')
        return 0;
    let num = parseFloat(val.toString().replace(',', '.'));
    return isNaN(num) ? 0 : num;
};
/**
 * Membuat atau mendapatkan akun untuk Ayah
 */
async function getOrCreateAyahAccount(namaAyah, posyanduId) {
    if (!namaAyah || namaAyah === '-' || namaAyah.trim() === '')
        return null;
    // Cek apakah user ayah sudah ada berdasarkan namaLengkap
    let userAyah = await prisma.user.findFirst({
        where: {
            name: namaAyah.trim(),
            role: 'ORANG_TUA',
        },
    });
    if (!userAyah) {
        const cleanName = namaAyah.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10);
        const randomSuffix = Math.floor(100 + Math.random() * 900);
        const username = `ayah_${cleanName}${randomSuffix}`;
        const email = `${username}@posyandu.local`;
        const password = 'Password123!';
        try {
            const signupResult = await auth.api.signUpEmail({
                body: {
                    email,
                    password,
                    username,
                    name: namaAyah.trim(),
                },
            });
            if (!signupResult || !signupResult.user) {
                throw new Error('Signup failed for Ayah');
            }
            // Update role dan posyanduId
            userAyah = await prisma.user.update({
                where: { id: signupResult.user.id },
                data: {
                    role: 'ORANG_TUA',
                    posyanduId: posyanduId || null,
                },
            });
            console.log(`✅ Created Ayah account: ${username} (${namaAyah})${posyanduId ? ` - Posyandu ID: ${posyanduId}` : ''}`);
        }
        catch (error) {
            console.error(`❌ Error creating Ayah account for ${namaAyah}:`, error);
            return null;
        }
    }
    else if (posyanduId && !userAyah.posyanduId) {
        // Update posyanduId jika user sudah ada tapi belum punya posyandu
        userAyah = await prisma.user.update({
            where: { id: userAyah.id },
            data: { posyanduId },
        });
    }
    return userAyah;
}
/**
 * Membuat atau mendapatkan akun untuk Ibu
 */
async function getOrCreateIbuAccount(namaIbu, posyanduId) {
    if (!namaIbu || namaIbu === '-' || namaIbu.trim() === '')
        return null;
    // Cek apakah user ibu sudah ada
    let userIbu = await prisma.user.findFirst({
        where: {
            name: namaIbu.trim(),
            role: 'ORANG_TUA',
        },
    });
    if (!userIbu) {
        const cleanName = namaIbu.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10);
        const randomSuffix = Math.floor(100 + Math.random() * 900);
        const username = `ibu_${cleanName}${randomSuffix}`;
        const email = `${username}@posyandu.local`;
        const password = 'Password123!';
        try {
            const signupResult = await auth.api.signUpEmail({
                body: {
                    email,
                    password,
                    username,
                    name: namaIbu.trim(),
                },
            });
            if (!signupResult || !signupResult.user) {
                throw new Error('Signup failed for Ibu');
            }
            // Update role dan posyanduId
            userIbu = await prisma.user.update({
                where: { id: signupResult.user.id },
                data: {
                    role: 'ORANG_TUA',
                    posyanduId: posyanduId || null,
                },
            });
            console.log(`✅ Created Ibu account: ${username} (${namaIbu})${posyanduId ? ` - Posyandu ID: ${posyanduId}` : ''}`);
        }
        catch (error) {
            console.error(`❌ Error creating Ibu account for ${namaIbu}:`, error);
            return null;
        }
    }
    else if (posyanduId && !userIbu.posyanduId) {
        // Update posyanduId jika user sudah ada tapi belum punya posyandu
        userIbu = await prisma.user.update({
            where: { id: userIbu.id },
            data: { posyanduId },
        });
    }
    return userIbu;
}
/**
 * Membuat atau mendapatkan profile Ortu (pasangan ayah-ibu)
 * userId TIDAK UNIQUE, jadi bisa ada beberapa Ortu dengan userId yang sama
 */
async function getOrCreateOrtuProfile(namaIbu, namaAyah, posyanduId) {
    if ((!namaIbu || namaIbu === '-') && (!namaAyah || namaAyah === '-'))
        return null;
    // Cek berdasarkan pasangan nama ayah-ibu
    let ortu = await prisma.ortu.findFirst({
        where: {
            namaIbu: { equals: namaIbu.trim() },
            namaAyah: { equals: namaAyah.trim() },
        },
        include: { userAyah: true, userIbu: true },
    });
    if (!ortu) {
        try {
            // Buat akun untuk ayah dan ibu dengan posyanduId
            const userAyah = await getOrCreateAyahAccount(namaAyah, posyanduId);
            const userIbu = await getOrCreateIbuAccount(namaIbu, posyanduId);
            // Buat profile ortu, link ke user ibu (atau ayah jika ibu tidak ada)
            // Karena userId TIDAK unique, bisa ada beberapa Ortu dengan userId yang sama
            ortu = await prisma.ortu.create({
                data: {
                    userAyahId: userAyah?.id || null,
                    userIbuId: userIbu?.id || null,
                    namaIbu: namaIbu.trim() || '-',
                    namaAyah: namaAyah.trim() || '-',
                },
                include: { userAyah: true, userIbu: true },
            });
            console.log(`✅ Created Ortu profile: ${namaAyah} & ${namaIbu}`);
        }
        catch (error) {
            console.error(`❌ Error creating Ortu profile for ${namaAyah} & ${namaIbu}:`, error);
            return null;
        }
    }
    return ortu;
}
// --- SEEDING FUNCTIONS ---
async function seedFileUtama() {
    console.log('📂 Memproses File Utama (Agustus 2025)...');
    const filePath = path.join(__dirname, '../public/csv/Data Stunting Desa Banjarsari Agustus 2025 (11092025).csv');
    if (!fs.existsSync(filePath)) {
        console.log('File tidak ditemukan:', filePath);
        return { berhasil: 0 };
    }
    const results = [];
    return new Promise((resolve) => {
        fs.createReadStream(filePath)
            .pipe(csv({ skipLines: 1, mapHeaders: ({ header }) => header.trim() }))
            .on('data', (data) => results.push(data))
            .on('end', async () => {
            let berhasil = 0;
            for (const row of results) {
                try {
                    const nik = row.NIK?.toString().replace(/[^\d]/g, '');
                    if (!nik)
                        continue;
                    const posyanduNama = row.Posyandu?.trim() || 'Default Posyandu';
                    const posyandu = await prisma.posyandu.upsert({
                        where: { nama: posyanduNama },
                        update: { rw: row.RW?.trim() || null },
                        create: {
                            nama: posyanduNama,
                            rw: row.RW?.trim() || null,
                        },
                    });
                    const { namaAyah, namaIbu } = parseNamaOrtu(row['Nama Ortu']);
                    const ortu = await getOrCreateOrtuProfile(namaIbu, namaAyah, posyandu.id);
                    const anak = await prisma.anak.upsert({
                        where: { nik },
                        update: {
                            ortuId: ortu?.id ?? null,
                            posyanduId: posyandu.id,
                            alamat: row.Alamat?.trim() || null,
                        },
                        create: {
                            nik,
                            nama: row.Nama?.trim() || 'Unknown',
                            jenisKelamin: row.JK === 'L' ? 'Laki-laki' : 'Perempuan',
                            tglLahir: parseDate(row['Tgl Lahir']) || new Date(),
                            bbLahir: fixMeasurement(row['BB Lahir']),
                            tbLahir: fixMeasurement(row['TB Lahir']),
                            alamat: row.Alamat?.trim() || null,
                            posyanduId: posyandu.id,
                            ortuId: ortu?.id ?? null,
                        },
                    });
                    await prisma.pengukuranAnak.create({
                        data: {
                            anakNik: anak.nik,
                            tglUkur: parseDate(row['Tanggal Pengukuran']) || new Date(),
                            berat: fixMeasurement(row.Berat),
                            tinggi: fixMeasurement(row.Tinggi),
                            lila: row['LiLA'] ? fixMeasurement(row['LiLA']) : null,
                            status_bb_u: row['BB/U'] || null,
                            status_tb_u: row['TB/U'] || null,
                            status_bb_tb: row['BB/TB'] || null,
                            zs_bb_u: row['ZS BB/U'] ? parseFloat(row['ZS BB/U'].toString().replace(',', '.')) : null,
                            zs_tb_u: row['ZS TB/U'] ? parseFloat(row['ZS TB/U'].toString().replace(',', '.')) : null,
                            zs_bb_tb: row['ZS BB/TB'] ? parseFloat(row['ZS BB/TB'].toString().replace(',', '.')) : null,
                            naikBeratBadan: row['Naik Berat Badan'] || null,
                        },
                    });
                    berhasil++;
                }
                catch (e) {
                    console.error('Error pada baris File Utama:', row.Nama, e);
                }
            }
            resolve({ berhasil });
        });
    });
}
async function seedFileBBKurang() {
    console.log('📂 Memproses File BB Kurang (BOK)...');
    const filePath = path.join(__dirname, '../public/csv/Desa Banjarsari (BB Kurang) 9 Orang (BOK).csv');
    if (!fs.existsSync(filePath)) {
        console.log('File tidak ditemukan:', filePath);
        return { berhasil: 0 };
    }
    const results = [];
    return new Promise((resolve) => {
        fs.createReadStream(filePath)
            .pipe(csv({ skipLines: 1, mapHeaders: ({ header }) => header.trim() }))
            .on('data', (data) => results.push(data))
            .on('end', async () => {
            let berhasil = 0;
            const defaultPosyandu = await prisma.posyandu.upsert({
                where: { nama: 'Default Posyandu' },
                update: {},
                create: { nama: 'Default Posyandu' },
            });
            for (const row of results) {
                try {
                    const namaAnak = row['Nama Lengkap Balita']?.trim();
                    const tglLahir = parseDate(row['Tgl Lahir Tgl/Bln/Thn']);
                    if (!namaAnak || !tglLahir)
                        continue;
                    const { namaAyah, namaIbu } = parseNamaOrtu(row['Nama Orang Tua']);
                    const ortu = await getOrCreateOrtuProfile(namaIbu, namaAyah, defaultPosyandu.id);
                    let anak = await prisma.anak.findFirst({
                        where: {
                            nama: { contains: namaAnak },
                            tglLahir: tglLahir,
                        },
                    });
                    if (!anak) {
                        const nikTemp = `TEMP${tglLahir.getTime().toString().slice(-8)}${Math.floor(Math.random() * 100)}`;
                        anak = await prisma.anak.create({
                            data: {
                                nik: nikTemp,
                                nama: namaAnak,
                                jenisKelamin: row.JK === 'L' ? 'Laki-laki' : 'Perempuan',
                                tglLahir,
                                alamat: row.Alamat?.trim() || null,
                                posyanduId: defaultPosyandu.id,
                                ortuId: ortu?.id ?? null,
                            },
                        });
                        console.log(`✅ Anak baru dibuat: ${namaAnak} (NIK: ${nikTemp})`);
                        dataBaruDibuat.push({
                            nama: namaAnak,
                            nik: nikTemp,
                            username: ortu?.userAyah?.username || ortu?.userIbu?.username || '-',
                        });
                    }
                    await prisma.pengukuranAnak.create({
                        data: {
                            anakNik: anak.nik,
                            tglUkur: new Date(),
                            berat: fixMeasurement(row['BB']),
                            tinggi: fixMeasurement(row['TB']),
                            lila: fixMeasurement(row['LiLA']),
                            status_bb_u: row['BB/U'] || null,
                            status_tb_u: row['PB-TB/U'] || null,
                            status_bb_tb: row['BB/PB-TB'] || null,
                        },
                    });
                    berhasil++;
                }
                catch (e) {
                    console.error('Error pada baris File BB Kurang:', row['Nama Lengkap Balita'], e);
                }
            }
            resolve({ berhasil });
        });
    });
}
async function seedFileGiziKurang() {
    console.log('📂 Memproses File Gizi Kurang (BOK)...');
    const filePath = path.join(__dirname, '../public/csv/Desa Banjarsari (Gizi Kurang) 3 Orang (BOK).csv');
    if (!fs.existsSync(filePath)) {
        console.log('File tidak ditemukan:', filePath);
        return { berhasil: 0 };
    }
    const results = [];
    return new Promise((resolve) => {
        fs.createReadStream(filePath)
            .pipe(csv({
            headers: false,
            skipLines: 0
        }))
            .on('data', (data) => results.push(data))
            .on('end', async () => {
            let berhasil = 0;
            const defaultPosyandu = await prisma.posyandu.upsert({
                where: { nama: 'Default Posyandu' },
                update: {},
                create: {
                    nama: 'Default Posyandu',
                    desa: 'BANJARSARI',
                    kecamatan: 'PANGALENGAN'
                },
            });
            for (let i = 3; i < results.length; i++) {
                const row = results[i];
                try {
                    const namaAnak = row['1']?.trim();
                    const tglLahirStr = row['2']?.trim();
                    const jenisKelamin = row['4']?.trim() === 'L' ? 'Laki-laki' : 'Perempuan';
                    const namaAyah = row['5']?.trim() || '-';
                    const namaIbu = row['6']?.trim() || '-';
                    const alamat = row['7']?.trim();
                    const bb = fixMeasurement(row['8']);
                    const tb = fixMeasurement(row['9']);
                    const lila = fixMeasurement(row['10']);
                    const statusBBU = row['11']?.trim();
                    const statusBBTB = row['12']?.trim();
                    const statusTBU = row['13']?.trim();
                    if (!namaAnak || namaAnak === '')
                        continue;
                    const tglLahir = parseDate(tglLahirStr);
                    if (!tglLahir) {
                        console.log(`⚠️ Tanggal lahir tidak valid untuk ${namaAnak}, skip...`);
                        continue;
                    }
                    const rwMatch = alamat?.match(/\/(\d+)/);
                    const rw = rwMatch ? rwMatch[1] : null;
                    const ortu = await getOrCreateOrtuProfile(namaIbu, namaAyah, defaultPosyandu.id);
                    let anak = await prisma.anak.findFirst({
                        where: {
                            nama: { contains: namaAnak },
                            tglLahir: tglLahir,
                        },
                    });
                    if (!anak) {
                        const nikTemp = `TEMP${tglLahir.getTime().toString().slice(-8)}${Math.floor(Math.random() * 100)}`;
                        anak = await prisma.anak.create({
                            data: {
                                nik: nikTemp,
                                nama: namaAnak,
                                jenisKelamin,
                                tglLahir,
                                alamat: alamat || null,
                                rw: rw,
                                posyanduId: defaultPosyandu.id,
                                ortuId: ortu?.id ?? null,
                            },
                        });
                        console.log(`✅ Anak baru dibuat: ${namaAnak} (NIK: ${nikTemp})`);
                        dataBaruDibuat.push({
                            nama: namaAnak,
                            nik: nikTemp,
                            username: ortu?.userAyah?.username || ortu?.userIbu?.username || '-',
                        });
                    }
                    else {
                        await prisma.anak.update({
                            where: { nik: anak.nik },
                            data: {
                                alamat: alamat || anak.alamat,
                                rw: rw || anak.rw,
                                ortuId: ortu?.id ?? anak.ortuId,
                            },
                        });
                        console.log(`📝 Update data anak: ${namaAnak}`);
                    }
                    await prisma.pengukuranAnak.create({
                        data: {
                            anakNik: anak.nik,
                            tglUkur: new Date(),
                            berat: bb > 0 ? bb : 0,
                            tinggi: tb > 0 ? tb : 0,
                            lila: lila > 0 ? lila : null,
                            status_bb_u: statusBBU || null,
                            status_bb_tb: statusBBTB || null,
                            status_tb_u: statusTBU || null,
                        },
                    });
                    berhasil++;
                }
                catch (e) {
                    console.error('Error pada baris File Gizi Kurang:', row['1'] || 'Unknown', e);
                }
            }
            resolve({ berhasil });
        });
    });
}
async function seedFileBumilKEK() {
    console.log('📂 Memproses File Bumil KEK (BOK)...');
    const filePath = path.join(__dirname, '../public/csv/Desa Banjarsari (Bumil KEK) 1 Orang (BOK).csv');
    if (!fs.existsSync(filePath)) {
        console.log('File tidak ditemukan:', filePath);
        return { berhasil: 0 };
    }
    const results = [];
    return new Promise((resolve) => {
        fs.createReadStream(filePath)
            .pipe(csv({
            headers: false,
            skipLines: 0
        }))
            .on('data', (data) => results.push(data))
            .on('end', async () => {
            let berhasil = 0;
            const defaultPosyandu = await prisma.posyandu.upsert({
                where: { nama: 'Default Posyandu' },
                update: {},
                create: {
                    nama: 'Default Posyandu',
                    desa: 'BANJARSARI',
                    kecamatan: 'PANGALENGAN',
                },
            });
            for (let i = 4; i < results.length; i++) {
                const row = results[i];
                try {
                    const nama = row['1']?.trim();
                    const alamat = row['2']?.trim();
                    const tglLahirStr = row['3']?.trim();
                    const umur = parseInt(row['4']) || null;
                    const bbSblmHamil = fixMeasurement(row['5']);
                    const tbSblmHamil = fixMeasurement(row['6']);
                    const usiaKehamilan = parseInt(row['11']) || null;
                    const lila = fixMeasurement(row['12']);
                    if (!nama || nama === '')
                        continue;
                    let tglLahir = tglLahirStr ? parseDate(tglLahirStr) : null;
                    if (!tglLahir && umur) {
                        const estimatedYear = new Date().getFullYear() - umur;
                        tglLahir = new Date(estimatedYear, 0, 1);
                    }
                    const rwMatch = alamat?.match(/\/(\d+)/);
                    const rw = rwMatch ? rwMatch[1] : null;
                    let ibuHamil = tglLahir
                        ? await prisma.ibuHamil.findFirst({
                            where: {
                                nama: { contains: nama },
                                tglLahir: tglLahir,
                            },
                        })
                        : await prisma.ibuHamil.findFirst({
                            where: {
                                nama: { contains: nama },
                            },
                        });
                    if (!ibuHamil) {
                        ibuHamil = await prisma.ibuHamil.create({
                            data: {
                                nama,
                                tglLahir,
                                alamat: alamat || null,
                                rw: rw,
                                posyanduId: defaultPosyandu.id,
                            },
                        });
                        console.log(`✅ Ibu hamil baru dibuat: ${nama}`);
                    }
                    else {
                        await prisma.ibuHamil.update({
                            where: { id: ibuHamil.id },
                            data: {
                                alamat: alamat || ibuHamil.alamat,
                                rw: rw || ibuHamil.rw,
                            },
                        });
                        console.log(`📝 Update data ibu hamil: ${nama}`);
                    }
                    const statusKasus = lila > 0 && lila < 23.5 ? 'KEK' : 'Normal';
                    await prisma.pemeriksaanBumil.create({
                        data: {
                            ibuHamilId: ibuHamil.id,
                            tglPeriksa: new Date(),
                            usiaKehamilan,
                            beratBadan: null,
                            lila: lila > 0 ? lila : null,
                            bbSblmHamil: bbSblmHamil > 0 ? bbSblmHamil : null,
                            tbSblmHamil: tbSblmHamil > 0 ? tbSblmHamil : null,
                            statusKasus,
                        },
                    });
                    console.log(`   Status: ${statusKasus}, LILA: ${lila} cm`);
                    berhasil++;
                }
                catch (e) {
                    console.error('Error pada baris File Bumil KEK:', row['1'] || 'Unknown', e);
                }
            }
            resolve({ berhasil });
        });
    });
}
// --- MAIN ---
async function main() {
    // Buat posyandu default terlebih dahulu untuk assign ke ADMIN
    const defaultPosyandu = await prisma.posyandu.upsert({
        where: { nama: 'CAMELIA 01' },
        update: {},
        create: {
            nama: 'CAMELIA 01',
            rw: '1',
            desa: 'BANJARSARI',
            kecamatan: 'PANGALENGAN',
            puskesmas: 'SUKAMANAH',
        },
    });
    // Buat akun staff default menggunakan Better Auth
    const staffAccounts = [
        { username: 'superadmin', role: 'SUPER_ADMIN', namaLengkap: 'Super Admin', posyanduId: null },
        { username: 'admin_desa', role: 'ADMIN', namaLengkap: 'Admin Desa', posyanduId: defaultPosyandu.id },
        { username: 'bidan_desa', role: 'TENAGA_KESEHATAN', namaLengkap: 'Bidan Desa', posyanduId: null },
        { username: 'kader_posyandu', role: 'KADER_POSYANDU', namaLengkap: 'Kader Posyandu', posyanduId: defaultPosyandu.id },
    ];
    const defaultPassword = 'Admin123!';
    for (const acc of staffAccounts) {
        try {
            const existingUser = await prisma.user.findUnique({
                where: { username: acc.username },
            });
            if (!existingUser) {
                const email = `${acc.username}@posyandu.local`;
                const signupResult = await auth.api.signUpEmail({
                    body: {
                        email,
                        password: defaultPassword,
                        username: acc.username,
                        name: acc.namaLengkap,
                    },
                });
                if (!signupResult || !signupResult.user) {
                    throw new Error('Signup failed');
                }
                // Update role dan posyanduId setelah user dibuat
                await prisma.user.update({
                    where: { id: signupResult.user.id },
                    data: {
                        role: acc.role,
                        posyanduId: acc.posyanduId,
                    },
                });
                console.log(`✅ Created staff account via Better Auth: ${acc.username} (${email}) - Role: ${acc.role}${acc.posyanduId ? ` - Posyandu: ${defaultPosyandu.nama}` : ''}`);
            }
            else {
                console.log(`ℹ️  Staff account already exists: ${acc.username}`);
            }
        }
        catch (error) {
            console.error(`❌ Error creating staff account ${acc.username}:`, error);
        }
    }
    console.log('\n⏳ Memulai seeding data...\n');
    const r1 = await seedFileUtama();
    const r2 = await seedFileBBKurang();
    const r3 = await seedFileGiziKurang();
    const r4 = await seedFileBumilKEK();
    console.log(`\n✅ Seeding selesai!`);
    console.log(`   File Utama          : ${r1.berhasil} data berhasil diproses`);
    console.log(`   File BB Kurang      : ${r2.berhasil} data berhasil diproses`);
    console.log(`   File Gizi Kurang    : ${r3.berhasil} data berhasil diproses`);
    console.log(`   File Bumil KEK      : ${r4.berhasil} data berhasil diproses`);
    if (dataBaruDibuat.length > 0) {
        console.log('\n📋 Anak & Akun Ortu baru yang dibuat dari File BB Kurang & Gizi Kurang:');
        console.table(dataBaruDibuat);
    }
    console.log('\n🔑 Kredensial Login Staff:');
    console.log('   Username: superadmin / admin_desa / bidan_desa / kader_posyandu');
    console.log('   Password: Admin123!');
    console.log('\n🔑 Kredensial Login Orang Tua:');
    console.log('   Username Ayah: ayah_xxxxx### | Username Ibu: ibu_xxxxx###');
    console.log('   Password: Password123!');
    console.log('   (Lihat log di atas untuk username lengkap yang dibuat)');
}
main()
    .catch((e) => {
    console.error('Error saat seeding:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
