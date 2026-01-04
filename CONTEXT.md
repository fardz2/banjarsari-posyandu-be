# CONTEXT.md - Posyandu Backend API

## 1. Tech Stack

### Core Framework & Runtime

- **Framework**: [Hono](https://hono.dev/) v4.11.2 - Lightweight web framework untuk Edge/Node.js
- **Runtime**: Node.js dengan `@hono/node-server` v1.19.6
- **Language**: TypeScript v5.9.3 dengan strict mode enabled
- **Module System**: ES Modules (`"type": "module"`)

### Database & ORM

- **Database**: PostgreSQL
- **ORM**: Prisma v6.19.1
  - Client output: `src/generated/prisma`
  - Adapter: `@prisma/adapter-mariadb` v7.2.0 (dev dependency)

### Authentication

- **Library**: [Better Auth](https://www.better-auth.com/) v1.4.9
- **Adapter**: `prisma-adapter` untuk integrasi dengan Prisma
- **Plugins**:
  - `username` plugin (min: 3 chars, max: 30 chars)
- **Session Strategy**:
  - Cookie-based session
  - Short session: 15 menit (default)
  - Long session: 30 hari (dengan `cookieCache` untuk "Remember Me")
  - Session update interval: 5 menit
- **Authentication Methods**: Email & Password

### Development Tools

- **Dev Server**: `tsx watch` untuk hot reload
- **Build**: TypeScript compiler (`tsc`)
- **Other**: `csv-parser` v3.2.0 untuk parsing CSV

### Environment Configuration

- **dotenv**: Menggunakan `dotenv/config` untuk environment variables
- **Required ENV Variables**:
  - `DATABASE_URL`: Connection string PostgreSQL
  - `BETTER_AUTH_SECRET`: Secret key untuk Better Auth
  - `BETTER_AUTH_URL`: Base URL untuk Better Auth
  - `API_KEY`: Key untuk proteksi tambahan endpoint API
  - `PORT`: Port server (default: 3001)

---

## 2. Endpoint yang Sudah Ada

### Base URL

- **Development**: `http://localhost:3001`
- **API Prefix**: `/api`

### Authentication Endpoints (`/api/auth/*`)

> Dihandle otomatis oleh Better Auth

| Method | Endpoint                    | Deskripsi                                    |
| ------ | --------------------------- | -------------------------------------------- |
| POST   | `/api/auth/sign-up/email`   | Registrasi user baru dengan email & password |
| POST   | `/api/auth/sign-in/email`   | Login dengan email & password                |
| POST   | `/api/auth/sign-out`        | Logout user                                  |
| GET    | `/api/auth/session`         | Mendapatkan session user saat ini            |
| POST   | `/api/auth/forgot-password` | Request reset password                       |

### API Version 1 (`/api/v1`)

#### General

| Method | Endpoint   | Deskripsi           | Auth Required |
| ------ | ---------- | ------------------- | ------------- |
| GET    | `/api/v1/` | Health check API v1 | ❌            |

#### User Management (`/api/v1/users`)

| Method | Endpoint                 | Deskripsi                          | Roles Allowed           |
| ------ | ------------------------ | ---------------------------------- | ----------------------- |
| GET    | `/api/v1/users/me`       | Get profile user sendiri           | All authenticated users |
| PUT    | `/api/v1/users/me`       | Update profile user sendiri        | All authenticated users |
| POST   | `/api/v1/users`          | Create user baru                   | SUPER_ADMIN, ADMIN      |
| GET    | `/api/v1/users`          | Get all users (filtered by access) | SUPER_ADMIN, ADMIN      |
| GET    | `/api/v1/users/:id`      | Get user by ID                     | SUPER_ADMIN, ADMIN      |
| PUT    | `/api/v1/users/:id`      | Update user                        | SUPER_ADMIN, ADMIN      |
| DELETE | `/api/v1/users/:id`      | Delete user                        | SUPER_ADMIN, ADMIN      |
| PATCH  | `/api/v1/users/:id/role` | Assign role to user                | SUPER_ADMIN only        |

**Query Parameters** (GET `/api/v1/users`):

- `role` (string): Filter by user role (SUPER_ADMIN, ADMIN, etc.)
- `posyanduId` (number): Filter by posyandu ID (SUPER_ADMIN only)

#### Posyandu Management (`/api/v1/posyandu`)

| Method | Endpoint               | Deskripsi            | Roles Allowed           |
| ------ | ---------------------- | -------------------- | ----------------------- |
| GET    | `/api/v1/posyandu`     | Get all posyandu     | All authenticated users |
| GET    | `/api/v1/posyandu/:id` | Get posyandu by ID   | All authenticated users |
| POST   | `/api/v1/posyandu`     | Create posyandu baru | SUPER_ADMIN only        |
| PUT    | `/api/v1/posyandu/:id` | Update posyandu      | SUPER_ADMIN only        |
| DELETE | `/api/v1/posyandu/:id` | Delete posyandu      | SUPER_ADMIN only        |

> **Note**: `_count.users` pada response posyandu hanya menghitung user dengan role `KADER_POSYANDU`, bukan total semua user.

#### Anak (Balita) Management (`/api/v1/anak`)

| Method | Endpoint                   | Deskripsi                     | Roles Allowed                                        |
| ------ | -------------------------- | ----------------------------- | ---------------------------------------------------- |
| GET    | `/api/v1/anak/my-children` | Get anak sendiri (untuk ortu) | ORANG_TUA                                            |
| GET    | `/api/v1/anak`             | Get all anak (filtered)       | SUPER_ADMIN, ADMIN, TENAGA_KESEHATAN, KADER_POSYANDU |
| GET    | `/api/v1/anak/:nik`        | Get anak by NIK               | SUPER_ADMIN, ADMIN, TENAGA_KESEHATAN, KADER_POSYANDU |
| POST   | `/api/v1/anak`             | Create anak baru              | SUPER_ADMIN, ADMIN, TENAGA_KESEHATAN, KADER_POSYANDU |
| PUT    | `/api/v1/anak/:nik`        | Update anak                   | SUPER_ADMIN, ADMIN, TENAGA_KESEHATAN, KADER_POSYANDU |
| DELETE | `/api/v1/anak/:nik`        | Delete anak                   | SUPER_ADMIN, ADMIN                                   |

**Query Parameters** (GET `/api/v1/anak`):

- `posyanduId` (number): Filter by posyandu
- `rw` (string): Filter by RW

#### Pengukuran Anak (`/api/v1/pengukuran`)

| Method | Endpoint                       | Deskripsi                     | Roles Allowed                                        |
| ------ | ------------------------------ | ----------------------------- | ---------------------------------------------------- |
| GET    | `/api/v1/pengukuran`           | Get all pengukuran (filtered) | All authenticated users                              |
| GET    | `/api/v1/pengukuran/anak/:nik` | Get pengukuran by anak NIK    | All authenticated users (filtered by access)         |
| GET    | `/api/v1/pengukuran/:id`       | Get pengukuran by ID          | All authenticated users                              |
| POST   | `/api/v1/pengukuran`           | Create pengukuran baru        | SUPER_ADMIN, ADMIN, TENAGA_KESEHATAN, KADER_POSYANDU |
| PUT    | `/api/v1/pengukuran/:id`       | Update pengukuran             | SUPER_ADMIN, ADMIN, TENAGA_KESEHATAN, KADER_POSYANDU |
| DELETE | `/api/v1/pengukuran/:id`       | Delete pengukuran             | SUPER_ADMIN, ADMIN                                   |

**Query Parameters** (GET `/api/v1/pengukuran`):

- `anakNik` (string): Filter by NIK anak
- `startDate` (date): Filter by tanggal mulai
- `endDate` (date): Filter by tanggal akhir

#### Ibu Hamil Management (`/api/v1/ibu-hamil`)

| Method | Endpoint                | Deskripsi             | Roles Allowed                                        |
| ------ | ----------------------- | --------------------- | ---------------------------------------------------- |
| GET    | `/api/v1/ibu-hamil`     | Get all ibu hamil     | SUPER_ADMIN, ADMIN, TENAGA_KESEHATAN, KADER_POSYANDU |
| GET    | `/api/v1/ibu-hamil/:id` | Get ibu hamil by ID   | SUPER_ADMIN, ADMIN, TENAGA_KESEHATAN, KADER_POSYANDU |
| POST   | `/api/v1/ibu-hamil`     | Create ibu hamil baru | SUPER_ADMIN, ADMIN, TENAGA_KESEHATAN, KADER_POSYANDU |
| PUT    | `/api/v1/ibu-hamil/:id` | Update ibu hamil      | SUPER_ADMIN, ADMIN, TENAGA_KESEHATAN, KADER_POSYANDU |
| DELETE | `/api/v1/ibu-hamil/:id` | Delete ibu hamil      | SUPER_ADMIN, ADMIN                                   |

**Query Parameters** (GET `/api/v1/ibu-hamil`):

- `posyanduId` (number): Filter by posyandu
- `rw` (string): Filter by RW

#### Ortu Profile Management (`/api/v1/ortu`)

| Method | Endpoint           | Deskripsi                   | Roles Allowed                                        |
| ------ | ------------------ | --------------------------- | ---------------------------------------------------- |
| GET    | `/api/v1/ortu/me`  | Get profile ortu sendiri    | All authenticated users                              |
| PUT    | `/api/v1/ortu/me`  | Update profile ortu sendiri | All authenticated users                              |
| GET    | `/api/v1/ortu`     | Get all ortu                | SUPER_ADMIN, ADMIN, TENAGA_KESEHATAN, KADER_POSYANDU |
| GET    | `/api/v1/ortu/:id` | Get ortu by ID              | SUPER_ADMIN, ADMIN, TENAGA_KESEHATAN, KADER_POSYANDU |
| PUT    | `/api/v1/ortu/:id` | Update ortu                 | SUPER_ADMIN, ADMIN, TENAGA_KESEHATAN, KADER_POSYANDU |
| DELETE | `/api/v1/ortu/:id` | Delete ortu                 | SUPER_ADMIN, ADMIN                                   |

#### Export Data (`/api/v1/export`)

| Method | Endpoint                    | Deskripsi                         | Roles Allowed                                        |
| ------ | --------------------------- | --------------------------------- | ---------------------------------------------------- |
| GET    | `/api/v1/export/pengukuran` | Export pengukuran data to Excel   | SUPER_ADMIN, ADMIN, TENAGA_KESEHATAN, KADER_POSYANDU |
| GET    | `/api/v1/export/anak`       | Export anak (child) data to Excel | SUPER_ADMIN, ADMIN, TENAGA_KESEHATAN, KADER_POSYANDU |

**Query Parameters** (Both endpoints):

- `startDate` (date): Filter by start date
- `endDate` (date): Filter by end date
- `posyanduId` (string): Filter by specific posyandu (SUPER_ADMIN only, others restricted to their assigned posyandu)

**Response**: Excel file download (`.xlsx`)

**RBAC Rules**:

- **SUPER_ADMIN**: Can export from all posyandu or filter by specific posyandu
- **ADMIN, TENAGA_KESEHATAN, KADER_POSYANDU**: Can only export from their assigned posyandu

#### Forum / Q&A (`/api/v1/forum`)

| Method | Endpoint                     | Deskripsi                 | Roles Allowed                                |
| ------ | ---------------------------- | ------------------------- | -------------------------------------------- |
| GET    | `/api/v1/forum`              | Get all forums (filtered) | All authenticated users                      |
| GET    | `/api/v1/forum/:id`          | Get forum by ID           | All authenticated users (filtered by access) |
| POST   | `/api/v1/forum`              | Create forum baru         | ORANG_TUA, SUPER_ADMIN                       |
| PUT    | `/api/v1/forum/:id`          | Update forum              | Creator only                                 |
| DELETE | `/api/v1/forum/:id`          | Delete forum              | Creator only                                 |
| GET    | `/api/v1/forum/:id/comments` | Get forum comments        | All authenticated users (filtered by access) |
| POST   | `/api/v1/forum/:id/comments` | Add comment to forum      | All authenticated users                      |

**Query Parameters** (GET `/api/v1/forum`):

- `page` (number): Page number for pagination
- `limit` (number): Items per page
- `search` (string): Search in forum title and content
- `status` (string): Filter by forum status (OPEN, ANSWERED, CLOSED)
- `posyanduId` (number): Filter by posyandu ID (filter by creator's posyandu)

**Example**:

```
GET /api/v1/forum?status=OPEN&posyanduId=1&page=1&limit=10
```

**RBAC Rules**:

- **ORANG_TUA**: Can only see and create their own forums
- **TENAGA_KESEHATAN, ADMIN, SUPER_ADMIN**: Can see all forums, can filter by status and posyandu
- **Auto-status update**: When TENAGA_KESEHATAN adds a comment to an OPEN forum, status automatically changes to ANSWERED

---

## 3. Permission Matrix

### Role-Based Access Control

| Module              | SUPER_ADMIN | ADMIN               | TENAGA_KESEHATAN    | KADER_POSYANDU                    | ORANG_TUA           |
| ------------------- | ----------- | ------------------- | ------------------- | --------------------------------- | ------------------- |
| **User Management** | Full CRUD   | CRUD (own posyandu) | Read (all posyandu) | Create (Parent only) / Read (own) | Read/Update (self)  |
| **Posyandu**        | Full CRUD   | Read (own posyandu) | Read (all posyandu) | Read (own posyandu)               | Read (own posyandu) |
| **Anak**            | Full CRUD   | CRUD (own posyandu) | Full CRUD (all)     | Create/Update (own posyandu)      | Read (own children) |
| **Pengukuran**      | Full CRUD   | CRUD (own posyandu) | Full CRUD (all)     | Create/Update (own posyandu)      | Read (own children) |
| **Ibu Hamil**       | Full CRUD   | CRUD (own posyandu) | Full CRUD (all)     | Create/Update (own posyandu)      | ❌                  |
| **Ortu Profile**    | Full CRUD   | CRUD (own posyandu) | Read (all posyandu) | Read (own posyandu)               | Read/Update (self)  |

### Permission Rules

- **SUPER_ADMIN**: Full access ke semua data di semua posyandu.
- **ADMIN**: Full CRUD untuk data di posyandu yang ditugaskan (`user.posyanduId`). Dashboard menampilkan count sesuai posyandu.
- **TENAGA_KESEHATAN**: Full CRUD data medis (Anak, Pengukuran, Ibu Hamil) di **SEMUA** posyandu. Read-only untuk data User dan Posyandu.
- **KADER_POSYANDU**:
  - Create/Update data medis (Anak, Pengukuran, Ibu Hamil) di posyandu sendiri. **Tidak bisa DELETE**.
  - Bisa Create User baru khusus role **ORANG_TUA**.
- **ORANG_TUA**: Read-only untuk data anak sendiri, bisa update profile sendiri.

---

## 4. Middleware yang Digunakan

### Global Middleware

#### 1. CORS Middleware

**File**: `src/index.ts`  
**Scope**: Semua routes (`*`)

```typescript
cors({
  origin: "http://localhost:5174",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: true, // PENTING untuk cookie session
  maxAge: 600,
});
```

**Catatan**: `credentials: true` wajib untuk Better Auth agar cookie session terkirim dengan benar.

**Catatan**: `credentials: true` wajib untuk Better Auth agar cookie session terkirim dengan benar.

#### 2. API Key Middleware

**File**: `src/middlewares/api-key.middleware.ts`
**Scope**: Semua routes API (`/api/*`)

**Fungsi**: Memastikan setiap request memiliki header `x-api-key` yang valid.

```typescript
// Header request wajib:
// x-api-key: <API_KEY_VALUE>
```

#### 3. Global Error Handler

**File**: `src/middlewares/error.middleware.ts`  
**Scope**: Semua routes  
**Fungsi**: Menangani semua error yang tidak tertangani

**Behavior**:

- Jika error adalah `HTTPException` → return response dari exception
- Jika error lainnya → return JSON dengan status 500

```typescript
{
  success: false,
  message: 'Terjadi kesalahan pada server'
}
```

#### 3. Not Found Handler

**File**: `src/index.ts`  
**Scope**: Routes yang tidak ditemukan

```typescript
{
  success: false,
  message: 'Route tidak ditemukan'
}
```

### Route-Specific Middleware

#### Auth Middleware

**File**: `src/middlewares/auth.middleware.ts`  
**Scope**: Routes yang membutuhkan autentikasi

**Fungsi**:

- Validasi session menggunakan Better Auth
- Jika session tidak valid → return 401 Unauthorized
- Jika valid → simpan `user` dan `session` ke context

**Usage**:

```typescript
// Proteksi semua routes dalam file
userRoutes.use("*", authMiddleware);
```

**Context Variables**:

- `c.get('user')` → Data user dari session (includes `id`, `role`, `posyanduId`)
- `c.get('session')` → Data session

#### Role Middleware

**File**: `src/middlewares/role.middleware.ts`  
**Scope**: Routes yang membutuhkan role tertentu

**Functions**:

1. **`requireRole(...roles)`** - Require specific roles

```typescript
// Hanya SUPER_ADMIN dan ADMIN yang bisa akses
userRoutes.get("/", requireRole("SUPER_ADMIN", "ADMIN"), getAllUsers);
```

2. **`excludeRole(...roles)`** - Exclude specific roles

```typescript
// Semua role boleh kecuali ORANG_TUA
anakRoutes.get("/", excludeRole("ORANG_TUA"), getAllAnak);
```

3. **`requirePosyanduAssignment()`** - Require user punya posyanduId

```typescript
// User harus sudah di-assign ke posyandu
routes.use("*", requirePosyanduAssignment());
```

---

## 5. Aturan Coding & Konvensi

### Struktur Folder

```
src/
├── index.ts                 # Entry point aplikasi
├── auth.ts                  # Konfigurasi Better Auth
├── controllers/             # Request handlers
│   ├── user.controller.ts
│   ├── posyandu.controller.ts
│   ├── anak.controller.ts
│   ├── pengukuran.controller.ts
│   ├── ibu-hamil.controller.ts
│   └── ortu.controller.ts
├── services/                # Business logic
│   ├── user.service.ts
│   ├── posyandu.service.ts
│   ├── anak.service.ts
│   ├── pengukuran.service.ts
│   ├── ibu-hamil.service.ts
│   └── ortu.service.ts
├── middlewares/             # Custom middlewares
│   ├── auth.middleware.ts
│   ├── role.middleware.ts
│   └── error.middleware.ts
├── routes/                  # Route definitions
│   ├── index.ts            # Root router
│   ├── auth.routes.ts      # Auth routes
│   └── v1/                 # API v1 routes
│       ├── index.ts
│       ├── user.routes.ts
│       ├── posyandu.routes.ts
│       ├── anak.routes.ts
│       ├── pengukuran.routes.ts
│       ├── ibu-hamil.routes.ts
│       └── ortu.routes.ts
├── db/                      # Database configuration
│   └── prisma.ts
├── utils/                   # Helper functions & utilities
│   ├── interfaces/          # TypeScript interfaces
│   │   ├── user.interface.ts
│   │   ├── posyandu.interface.ts
│   │   ├── anak.interface.ts
│   │   ├── pengukuran.interface.ts
│   │   ├── ibu-hamil.interface.ts
│   │   └── ortu.interface.ts
│   ├── validations/         # Zod validation schemas
│   │   ├── user.validation.ts
│   │   ├── posyandu.validation.ts
│   │   ├── anak.validation.ts
│   │   ├── pengukuran.validation.ts
│   │   ├── ibu-hamil.validation.ts
│   │   └── ortu.validation.ts
│   ├── permission.helper.ts # Permission checking utilities
│   └── response.helper.ts   # Response formatting
└── generated/               # Auto-generated files (Prisma)
    └── prisma/
```

### Arsitektur Pattern

**Layered Architecture**:

1. **Routes** → Definisi endpoint dan routing
2. **Controllers** → Handle HTTP request/response
3. **Services** → Business logic dan database operations
4. **Utils/Helpers** → Reusable functions

### Naming Conventions

#### Files

- **Routes**: `*.routes.ts` (contoh: `user.routes.ts`)
- **Controllers**: `*.controller.ts` (contoh: `user.controller.ts`)
- **Services**: `*.service.ts` (contoh: `user.service.ts`)
- **Middlewares**: `*.middleware.ts` (contoh: `auth.middleware.ts`)

#### Functions

- **Controllers**: `<action><Entity>` (contoh: `getAllUsers`, `createUser`)
- **Services**: `<action><Entity>Service` (contoh: `getAllUsersService`)
- **Middlewares**: `<name>Middleware` (contoh: `authMiddleware`)

### Import Conventions

**PENTING**: Semua import harus menggunakan ekstensi `.js` (bukan `.ts`) karena menggunakan ES Modules:

```typescript
// ✅ BENAR
import routes from "./routes/index.js";
import { authMiddleware } from "./middlewares/auth.middleware.js";

// ❌ SALAH
import routes from "./routes/index";
import { authMiddleware } from "./middlewares/auth.middleware";
```

### Response Format

Gunakan helper functions dari `src/utils/response.helper.ts`:

#### Success Response

```typescript
successResponse(c, data, {
  message: "Success message",
  status: 200,
  meta: { count: 10 },
});
```

**Output**:

```json
{
  "success": true,
  "message": "Success message",
  "data": { ... },
  "meta": { "count": 10 }
}
```

#### Error Response

```typescript
errorResponse(c, 'Error message', {
  status: 400,
  code: 'ERROR_CODE',
  details: { ... }
});
```

**Output**:

```json
{
  "success": false,
  "message": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

### TypeScript Conventions

#### Strict Mode

- `strict: true` enabled
- `verbatimModuleSyntax: true`
- `skipLibCheck: true`

#### Type Definitions & Interfaces

**Organization**: All interfaces disimpan di `src/utils/interfaces/`

```typescript
// src/utils/interfaces/user.interface.ts
export interface UserResponse {
  id: string;
  username: string;
  name: string;
  role: Role;
  posyanduId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  password: string;
  username: string;
  name: string;
  role?: Role;
}

export interface UpdateUserInput {
  name?: string;
  username?: string;
  posyanduId?: number;
}
```

**Import Pattern**:

```typescript
// Service layer
import type {
  UserResponse,
  UpdateUserInput,
} from "../utils/interfaces/user.interface.js";

// Controller layer
import type { UpdateUserInput } from "../utils/interfaces/user.interface.js";
```

**Naming Conventions**:

- Response interfaces: `<Entity>Response`
- Create input: `Create<Entity>Input`
- Update input: `Update<Entity>Input`

### Request Validation with Zod

**Organization**: All validation schemas disimpan di `src/utils/validations/`

#### Zod Schema Definition

```typescript
// src/utils/validations/user.validation.ts
import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").optional(),
  username: z.string().min(3, "Username minimal 3 karakter").max(30).optional(),
  posyanduId: z.number().int().positive("Posyandu ID harus positif").optional(),
});

export const assignRoleSchema = z.object({
  role: z.enum(
    ["SUPER_ADMIN", "ADMIN", "TENAGA_KESEHATAN", "KADER_POSYANDU", "ORANG_TUA"],
    {
      message: "Role tidak valid",
    }
  ),
});
```

#### Usage in Routes

```typescript
// src/routes/v1/user.routes.ts
import { zValidator } from "@hono/zod-validator";
import {
  updateUserSchema,
  assignRoleSchema,
} from "../../utils/validations/user.validation.js";

// Apply validation middleware
userRoutes.put(
  "/:id",
  requireRole("SUPER_ADMIN", "ADMIN"),
  zValidator("json", updateUserSchema), // ← Zod validation
  updateUser
);

userRoutes.patch(
  "/:id/role",
  requireRole("SUPER_ADMIN"),
  zValidator("json", assignRoleSchema), // ← Zod validation
  assignRole
);
```

**Benefits**:

- ✅ Type-safe validation
- ✅ Automatic error messages dalam Bahasa Indonesia
- ✅ Request body validation sebelum masuk controller
- ✅ Consistent validation rules across endpoints

**Common Validation Patterns**:

```typescript
// String validation
z.string().min(1, "Wajib diisi");
z.string().length(16, "NIK harus 16 digit");
z.string().email("Email tidak valid");

// Number validation
z.number().positive("Harus positif");
z.number().int().positive("ID harus integer positif");

// Enum validation
z.enum(["Laki-laki", "Perempuan"], { message: "Jenis kelamin tidak valid" });

// Date transformation
z.string()
  .or(z.date())
  .transform((val) => new Date(val));

// Optional fields
z.string().optional();
z.number().optional();
```

### Error Handling

#### Controller Level

```typescript
try {
  const result = await service();
  return successResponse(c, result);
} catch (error) {
  console.error("Error:", error);
  return errorResponse(c, "Error message", { status: 500 });
}
```

#### Custom Error Class

```typescript
throw new AppError("Error message", 400, "ERROR_CODE");
```

### Database Access

#### Prisma Client

- Import dari `src/db/prisma.ts`
- Singleton pattern untuk production
- Hot reload friendly untuk development

```typescript
import { prisma } from "../db/prisma.js";

const users = await prisma.user.findMany({
  select: { id: true, username: true },
  orderBy: { createdAt: "desc" },
});
```

### Better Auth Configuration

#### User Model Extensions

```typescript
user: {
  additionalFields: {
    role: { type: "string", defaultValue: "ORANG_TUA" },
    displayUsername: { type: "string", required: false },
    posyanduId: { type: "number", required: false },
  }
}
```

#### Trusted Origins

```typescript
trustedOrigins: ["http://localhost:5173", "https://kms-banjarsari.vercel.app"];
```

**Note**: Untuk production deployment, tambahkan URL frontend production ke `trustedOrigins`.

#### Cross-Origin Cookie Configuration

Untuk mendukung cross-origin authentication (frontend dan backend di domain berbeda):

```typescript
advanced: {
  defaultCookieAttributes: {
    sameSite: "none",    // Allow cross-origin cookies
    secure: true,        // Required for sameSite: "none" (HTTPS only)
    httpOnly: true,      // Security best practice
  },
}
```

**Important Notes**:

- `sameSite: "none"` diperlukan untuk cross-origin requests
- `secure: true` wajib diset ketika menggunakan `sameSite: "none"` (hanya bekerja di HTTPS)
- `httpOnly: true` untuk keamanan tambahan (cookie tidak bisa diakses via JavaScript)
- Jangan gunakan `crossSubDomainCookies` untuk cross-origin (hanya untuk subdomain sharing)

### Route Organization

#### Versioning

- API versioning menggunakan folder: `v1/`, `v2/`, dst.
- Auth routes di luar versioning: `/api/auth/*`

#### Route Mounting

```typescript
const app = new Hono();

// Mount routes dengan prefix
app.route("/api", routes);

// Nested routing
routes.route("/v1", v1Routes);
v1Routes.route("/users", userRoutes);
```

### Comments & Documentation

- Gunakan komentar bahasa Indonesia untuk konsistensi
- Tambahkan komentar untuk konfigurasi penting
- Dokumentasikan endpoint yang tersedia di route files

```typescript
// CORS – WAJIB diatur dengan benar untuk Better Auth (cookie session)
app.use('*', cors({ ... }));

// Opsi 1: Proteksi SEMUA rute di file ini
userRoutes.use('*', authMiddleware);
```

---

## 5. Database Schema (Prisma)

### Models Utama

#### User

- Authentication & authorization
- Role-based access control (SUPER_ADMIN, ADMIN, TENAGA_KESEHATAN, KADER_POSYANDU, ORANG_TUA)
- Better Auth integration (sessions, accounts)

#### Posyandu

- Master data posyandu
- Relasi dengan User, Anak, IbuHamil

#### Anak

- Profil anak/balita
- Relasi dengan Ortu, Posyandu, PengukuranAnak

#### PengukuranAnak

- Data pengukuran antropometri
- Status gizi (BB/U, TB/U, BB/TB)
- Z-score calculations

#### IbuHamil & PemeriksaanBumil

- Data ibu hamil
- Riwayat pemeriksaan kehamilan

#### Ortu

- Data orang tua
- Relasi dengan User dan Anak

### Prisma Schema Field Mappings

**IMPORTANT**: The Prisma schema uses abbreviated field names. Always refer to the actual schema when writing queries.

#### Common Field Name Patterns

| Display Name (UI)  | Prisma Field Name | Model           |
| ------------------ | ----------------- | --------------- |
| Tanggal Lahir      | `tglLahir`        | Anak            |
| Tanggal Pengukuran | `tglUkur`         | PengukuranAnak  |
| Berat Badan        | `berat`           | PengukuranAnak  |
| Tinggi Badan       | `tinggi`          | PengukuranAnak  |
| Usia Saat Ukur     | `usiaSaatUkur`    | PengukuranAnak  |
| Status Gizi        | `status_bb_tb`    | PengukuranAnak  |
| Orang Tua          | `ortu`            | Anak (relation) |

#### Model: PengukuranAnak

```typescript
// ✅ CORRECT - Using actual Prisma field names
const data = await prisma.pengukuranAnak.findMany({
  where: {
    tglUkur: { gte: startDate, lte: endDate }
  },
  include: {
    anak: {
      include: {
        ortu: true,  // NOT orangTua
        posyandu: true
      }
    }
  },
  orderBy: { tglUkur: 'desc' }  // NOT tanggalPengukuran
});

// ❌ INCORRECT - Using display names
const data = await prisma.pengukuran.findMany({  // Wrong model name
  where: {
    tanggalPengukuran: { ... }  // Wrong field name
  }
});
```

#### Model: Anak

```typescript
// ✅ CORRECT
const anak = await prisma.anak.findUnique({
  where: { nik: "1234567890123456" },
  include: {
    ortu: true, // NOT orangTua
    posyandu: true,
  },
});

// Access fields
const tanggalLahir = anak.tglLahir; // NOT tanggalLahir
const beratLahir = anak.bbLahir; // NOT beratBadanLahir
const tinggiLahir = anak.tbLahir; // NOT tinggiBadanLahir
```

---

## 6. Development Workflow

### Running the Project

```bash
# Development mode (hot reload)
npm run dev

# Build for production
npm run build

# Run production build
# Run production build
npm start
```

### Seeding Data

Untuk mengisi database dengan data awal (termasuk relasi staff-posyandu dan ortu-anak):

```bash
npx prisma db seed
```

**Seeder Logic**:

- Import data dari CSV
- Auto-create user accounts untuk staff & parents via Better Auth
- Auto-assign valid Role & PosyanduId
- Auto-link Parents to Children & Posyandu

### Server Info

- Default port: `3001`
- Console logs menampilkan:
  - Server URL
  - API v1 URL
  - Auth endpoints URL

---

## 7. Best Practices

### Security

- ✅ CORS dikonfigurasi dengan `credentials: true` untuk cookie session
- ✅ Auth middleware untuk proteksi routes
- ✅ Environment variables untuk sensitive data
- ✅ Session expiration & auto-update

### Code Quality

- ✅ Separation of concerns (routes → controllers → services)
- ✅ Consistent error handling
- ✅ Type safety dengan TypeScript strict mode
- ✅ Reusable response helpers

### Performance

- ✅ Prisma singleton pattern
- ✅ Selective field selection di queries
- ✅ Session caching dengan Better Auth

---

**Last Updated**: 2026-01-01  
**API Version**: 1.0.0  
**Framework**: Hono v4.11.2  
**Validation**: Zod + @hono/zod-validator

**Recent Updates**:

- ✅ Added Zod validation to all CRUD endpoints
- ✅ Organized interfaces in `src/utils/interfaces/`
- ✅ Organized validation schemas in `src/utils/validations/`
- ✅ Implemented role-based access control with permission helpers
- ✅ Created 6 major CRUD modules (User, Posyandu, Anak, Pengukuran, IbuHamil, Ortu)
- ✅ 35+ endpoints with comprehensive permission matrix
- ✅ Enhanced dashboard services with strict data scoping for ORANG_TUA role
- ✅ Fixed dashboard summary queries to prevent schema mismatch errors
- ✅ Implemented entity-specific filters for dashboard statistics
- ✅ **NEW**: Implemented Excel export feature for Pengukuran and Anak data with RBAC filtering
- ✅ **NEW**: Added ExcelJS integration for generating `.xlsx` files
- ✅ **IMPORTANT**: Fixed type safety issues in export service - always use Prisma-generated types, not Better-Auth types

### Type Safety Best Practices

**Critical Rule**: When working with database models and enums, ALWAYS import types from Prisma-generated files, NOT from Better-Auth or other libraries.

```typescript
// ✅ CORRECT - Import Role from Prisma
import type { Role } from "../generated/prisma/index.js";
import { canAccessAllPosyandu } from "../utils/permission.helper.js";

// ❌ INCORRECT - Don't import Role from Better-Auth
import type { Role } from "better-auth/client";
```

**Why?** The `Role` enum is defined in your Prisma schema and generated by Prisma. Better-Auth has its own `Role` type that may not match your database schema, causing type mismatches when passing to functions that expect Prisma types.

**Common Type Imports**:

```typescript
// Prisma types
import type { Role } from "../generated/prisma/index.js";
import { prisma } from "../db/prisma.js";

// Permission helpers (expects Prisma types)
import {
  canAccessAllPosyandu,
  canManageUsers,
} from "../utils/permission.helper.js";
```
