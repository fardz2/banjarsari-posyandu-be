// src/interfaces/user.interface.ts

import { Role } from "@prisma/client";

export interface UserResponse {
  id: string;
  username: string | null;
  email: string;
  name: string;
  jenisKelamin?: string | null;
  role: Role;
  posyanduId: number | null;
  posyandu?: {
    id: number;
    nama: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  password: string;
  username: string;
  name: string;
  jenisKelamin?: string;
  role?: Role;
  posyanduId?: number;
}

export interface UpdateUserInput {
  name?: string;
  jenisKelamin?: string;
  username?: string;
  posyanduId?: number;
}

// Type alias for authenticated user (used in middleware and services)
export type User = UserResponse;

