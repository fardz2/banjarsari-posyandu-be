// src/interfaces/pengukuran.interface.ts

export interface PengukuranResponse {
  id: number;
  anakNik: string;
  anak: {
    nik: string;
    nama: string;
    posyanduId: number;
  };
  tglUkur: Date;
  berat: number;
  tinggi: number;
  lila: number | null;
  caraUkur: string | null;
  usiaSaatUkur: string | null;
  status_bb_u: string | null;
  zs_bb_u: number | null;
  status_tb_u: string | null;
  zs_tb_u: number | null;
  status_bb_tb: string | null;
  zs_bb_tb: number | null;
  lingkarKepala: number | null;
  status_lk_u: string | null;
  zs_lk_u: number | null;
  naikBeratBadan: string | null;
}

export interface CreatePengukuranInput {
  anakNik: string;
  tglUkur: Date | string;
  berat: number;
  tinggi: number;
  lila?: number;
  lingkarKepala?: number;
  caraUkur?: string;
  usiaSaatUkur?: string;
  status_bb_u?: string;
  zs_bb_u?: number;
  status_tb_u?: string;
  zs_tb_u?: number;
  status_bb_tb?: string;
  zs_bb_tb?: number;
  status_lk_u?: string;
  zs_lk_u?: number;
  naikBeratBadan?: string;
}

export interface UpdatePengukuranInput {
  tglUkur?: Date | string;
  berat?: number;
  tinggi?: number;
  lila?: number;
  lingkarKepala?: number;
  caraUkur?: string;
  usiaSaatUkur?: string;
  status_bb_u?: string;
  zs_bb_u?: number;
  status_tb_u?: string;
  zs_tb_u?: number;
  status_bb_tb?: string;
  zs_bb_tb?: number;
  status_lk_u?: string;
  zs_lk_u?: number;
  naikBeratBadan?: string;
}
