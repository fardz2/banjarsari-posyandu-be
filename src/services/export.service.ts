/**
 * Export Service
 * Handles data export functionality with RBAC filtering and Excel generation
 */

import { prisma } from "../db/prisma.js";
import { Role } from "@prisma/client";
import { canAccessAllPosyandu } from "../utils/permission.helper.js";
import ExcelJS from "exceljs";


interface ExportFilters {
  startDate?: string;
  endDate?: string;
  posyanduId?: string;
}

interface UserContext {
  id: string;
  role: Role;
  posyanduId: number | null;
}

/**
 * Export Pengukuran Data to Excel
 * SUPER_ADMIN: Can export from all posyandu or specific posyandu
 * ADMIN: Can only export from their assigned posyandu
 */
export const exportPengukuranService = async (
  user: UserContext,
  filters: ExportFilters
): Promise<Buffer> => {
  // Build where clause based on user role and filters
  const where: any = {};

  // Apply posyandu filter based on role
  if (canAccessAllPosyandu(user.role)) {
    // SUPER_ADMIN: Can filter by specific posyandu or get all
    if (filters.posyanduId) {
      where.anak = {
        posyanduId: filters.posyanduId,
      };
    }
  } else {
    // ADMIN: Only their assigned posyandu
    if (!user.posyanduId) {
      throw new Error("User tidak memiliki posyandu yang ditugaskan");
    }
    where.anak = {
      posyanduId: user.posyanduId,
    };
  }

  // Apply date range filter
  if (filters.startDate || filters.endDate) {
    where.tglUkur = {};
    if (filters.startDate) {
      where.tglUkur.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      where.tglUkur.lte = new Date(filters.endDate);
    }
  }

  // Fetch data with relations
  const data = await prisma.pengukuranAnak.findMany({
    where,
    include: {
      anak: {
        include: {
          posyandu: {
            select: {
              nama: true,
            },
          },
          ortu: {
            select: {
              userIbu: {
                select: { name: true },
              },
              userAyah: {
                select: { name: true },
              },
            },
          },
        },
      },
    },
    orderBy: {
      tglUkur: "desc",
    },
  });

  // Create workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Data Pengukuran");

  // Define columns
  worksheet.columns = [
    { header: "NIK Anak", key: "nik", width: 20 },
    { header: "Nama Anak", key: "namaAnak", width: 25 },
    { header: "Tanggal Pengukuran", key: "tanggalPengukuran", width: 20 },
    { header: "Umur (Bulan)", key: "umurBulan", width: 15 },
    { header: "Berat Badan (kg)", key: "beratBadan", width: 18 },
    { header: "Tinggi Badan (cm)", key: "tinggiBadan", width: 18 },
    { header: "Lingkar Kepala (cm)", key: "lingkarKepala", width: 20 },
    { header: "Status Gizi", key: "statusGizi", width: 20 },
    { header: "Posyandu", key: "posyandu", width: 25 },
    { header: "Nama Ibu", key: "namaIbu", width: 25 },
    { header: "Nama Ayah", key: "namaAyah", width: 25 },
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  };

  // Add data rows
  data.forEach((item) => {
    worksheet.addRow({
      nik: item.anak.nik,
      namaAnak: item.anak.nama,
      tanggalPengukuran: item.tglUkur.toISOString().split("T")[0],
      umurBulan: item.usiaSaatUkur || "-",
      beratBadan: item.berat,
      tinggiBadan: item.tinggi,
      lingkarKepala: item.lingkarKepala || "-",
      statusGizi: item.status_bb_tb || "-",
      posyandu: item.anak.posyandu.nama,
      namaIbu: item.anak.ortu?.userIbu?.name || "-",
      namaAyah: item.anak.ortu?.userAyah?.name || "-",
    });
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
};

/**
 * Export Anak Data to Excel
 * SUPER_ADMIN: Can export from all posyandu or specific posyandu
 * ADMIN: Can only export from their assigned posyandu
 */
export const exportAnakService = async (
  user: UserContext,
  filters: ExportFilters
): Promise<Buffer> => {
  // Build where clause based on user role and filters
  const where: any = {};

  // Apply posyandu filter based on role
  if (canAccessAllPosyandu(user.role)) {
    // SUPER_ADMIN: Can filter by specific posyandu or get all
    if (filters.posyanduId) {
      where.posyanduId = filters.posyanduId;
    }
  } else {
    // ADMIN: Only their assigned posyandu
    if (!user.posyanduId) {
      throw new Error("User tidak memiliki posyandu yang ditugaskan");
    }
    where.posyanduId = user.posyanduId;
  }

  // Apply date range filter (based on registration date)
  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) {
      where.createdAt.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      where.createdAt.lte = new Date(filters.endDate);
    }
  }

  // Fetch data with relations
  const data = await prisma.anak.findMany({
    where,
    include: {
      posyandu: {
        select: {
          nama: true,
        },
      },
      ortu: {
        select: {
          userIbu: {
            select: { name: true },
          },
          userAyah: {
            select: { name: true },
          },
          alamat: true,
        },
      },
    },
    orderBy: {
      nik: "desc",
    },
  });

  // Create workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Data Anak");

  // Define columns
  worksheet.columns = [
    { header: "NIK", key: "nik", width: 20 },
    { header: "Nama", key: "nama", width: 25 },
    { header: "Jenis Kelamin", key: "jenisKelamin", width: 15 },
    { header: "Tanggal Lahir", key: "tanggalLahir", width: 18 },
    { header: "Nama Ibu", key: "namaIbu", width: 25 },
    { header: "Nama Ayah", key: "namaAyah", width: 25 },
    { header: "Alamat", key: "alamat", width: 40 },
    { header: "Posyandu", key: "posyandu", width: 25 },
    { header: "Tanggal Registrasi", key: "tanggalRegistrasi", width: 20 },
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  };

  // Add data rows
  data.forEach((item) => {
    worksheet.addRow({
      nik: item.nik,
      nama: item.nama,
      jenisKelamin: item.jenisKelamin === "L" ? "Laki-laki" : "Perempuan",
      tanggalLahir: item.tglLahir.toISOString().split("T")[0],
      namaIbu: item.ortu?.userIbu?.name || "-",
      namaAyah: item.ortu?.userAyah?.name || "-",
      alamat: item.ortu?.alamat || "-",
      posyandu: item.posyandu.nama,
      tanggalRegistrasi: new Date().toISOString().split("T")[0],
    });
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
};
