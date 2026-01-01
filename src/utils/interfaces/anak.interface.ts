// src/interfaces/anak.interface.ts

export interface AnakResponse {
  nik: string;
  nama: string;
  jenisKelamin: string;
  tglLahir: Date;
  bbLahir: number | null;
  tbLahir: number | null;
  alamat: string | null;
  rw: string | null;
  posyanduId: number;
  posyandu: {
    id: number;
    nama: string;
  };
  ortuId: number | null;
  ortu?: {
    id: number;
    namaAyah: string | null;
    namaIbu: string | null;
  } | null;
}

export interface CreateAnakInput {
  nik: string;
  nama: string;
  jenisKelamin: 'Laki-laki' | 'Perempuan';
  tglLahir: Date | string;
  bbLahir?: number;
  tbLahir?: number;
  alamat?: string;
  rw?: string;
  posyanduId: number;
  ortuId?: number;
}

export interface UpdateAnakInput {
  nama?: string;
  jenisKelamin?: 'Laki-laki' | 'Perempuan';
  tglLahir?: Date | string;
  bbLahir?: number;
  tbLahir?: number;
  alamat?: string;
  rw?: string;
  posyanduId?: number;
  ortuId?: number;
}
