// src/interfaces/ibu-hamil.interface.ts

export interface IbuHamilResponse {
  id: number;
  nama: string;
  nik: string | null;
  tglLahir: Date | null;
  alamat: string | null;
  rw: string | null;
  namaSuami: string | null;
  hp: string | null;
  posyanduId: number;
  posyandu: {
    id: number;
    nama: string;
  };
  _count?: {
    pemeriksaan: number;
  };
}

export interface CreateIbuHamilInput {
  nama: string;
  nik?: string;
  tglLahir?: Date | string;
  alamat?: string;
  rw?: string;
  namaSuami?: string;
  hp?: string;
  posyanduId: number;
}

export interface UpdateIbuHamilInput {
  nama?: string;
  nik?: string;
  tglLahir?: Date | string;
  alamat?: string;
  rw?: string;
  namaSuami?: string;
  hp?: string;
  posyanduId?: number;
}
