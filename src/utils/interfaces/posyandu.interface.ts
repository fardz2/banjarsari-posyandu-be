// src/interfaces/posyandu.interface.ts

export interface PosyanduResponse {
  id: number;
  nama: string;
  rw: string | null;
  desa: string;
  kecamatan: string;
  puskesmas: string;
  _count?: {
    users: number;
    anak: number;
    ibuHamil: number;
  };
}

export interface CreatePosyanduInput {
  nama: string;
  rw?: string;
  desa?: string;
  kecamatan?: string;
  puskesmas?: string;
}

export interface UpdatePosyanduInput {
  nama?: string;
  rw?: string;
  desa?: string;
  kecamatan?: string;
  puskesmas?: string;
}
