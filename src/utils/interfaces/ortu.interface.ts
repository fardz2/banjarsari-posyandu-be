// src/interfaces/ortu.interface.ts

export interface OrtuResponse {
  id: number;
  userId: string | null;
  nik: string | null;
  namaAyah: string | null;
  namaIbu: string | null;
  alamat: string | null;
  telepon: string | null;
  _count?: {
    anak: number;
  };
}


export interface CreateOrtuInput {
  nik?: string;
  alamat?: string;
  telepon?: string;
  userAyahId?: string;
  userIbuId?: string;
}

export interface UpdateOrtuInput {
  nik?: string;
  alamat?: string;
  telepon?: string;
  userAyahId?: string;
  userIbuId?: string;
}
