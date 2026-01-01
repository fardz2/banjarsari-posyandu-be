-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'TENAGA_KESEHATAN', 'KADER_POSYANDU', 'ORANG_TUA');

-- CreateEnum
CREATE TYPE "ForumStatus" AS ENUM ('OPEN', 'ANSWERED', 'CLOSED');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "username" TEXT,
    "displayUsername" TEXT,
    "role" "Role" NOT NULL DEFAULT 'ORANG_TUA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "posyanduId" INTEGER,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Posyandu" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "rw" TEXT,
    "desa" TEXT NOT NULL DEFAULT 'BANJARSARI',
    "kecamatan" TEXT NOT NULL DEFAULT 'PANGALENGAN',
    "puskesmas" TEXT NOT NULL DEFAULT 'SUKAMANAH',

    CONSTRAINT "Posyandu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IbuHamil" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "nik" TEXT,
    "tglLahir" TIMESTAMP(3),
    "alamat" TEXT,
    "rw" TEXT,
    "namaSuami" TEXT,
    "hp" TEXT,
    "posyanduId" INTEGER NOT NULL,

    CONSTRAINT "IbuHamil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PemeriksaanBumil" (
    "id" SERIAL NOT NULL,
    "ibuHamilId" INTEGER NOT NULL,
    "tglPeriksa" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usiaKehamilan" INTEGER,
    "beratBadan" DOUBLE PRECISION,
    "lila" DOUBLE PRECISION,
    "bbSblmHamil" DOUBLE PRECISION,
    "tbSblmHamil" DOUBLE PRECISION,
    "statusKasus" TEXT,

    CONSTRAINT "PemeriksaanBumil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ortu" (
    "id" SERIAL NOT NULL,
    "userAyahId" TEXT,
    "userIbuId" TEXT,
    "nik" TEXT,
    "namaAyah" TEXT,
    "namaIbu" TEXT,
    "alamat" TEXT,
    "telepon" TEXT,
    "userId" TEXT,

    CONSTRAINT "Ortu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Anak" (
    "nik" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jenisKelamin" TEXT NOT NULL,
    "tglLahir" TIMESTAMP(3) NOT NULL,
    "bbLahir" DOUBLE PRECISION,
    "tbLahir" DOUBLE PRECISION,
    "alamat" TEXT,
    "rw" TEXT,
    "ortuId" INTEGER,
    "posyanduId" INTEGER NOT NULL,

    CONSTRAINT "Anak_pkey" PRIMARY KEY ("nik")
);

-- CreateTable
CREATE TABLE "PengukuranAnak" (
    "id" SERIAL NOT NULL,
    "anakNik" TEXT NOT NULL,
    "tglUkur" TIMESTAMP(3) NOT NULL,
    "berat" DOUBLE PRECISION NOT NULL,
    "tinggi" DOUBLE PRECISION NOT NULL,
    "lila" DOUBLE PRECISION,
    "caraUkur" TEXT,
    "usiaSaatUkur" TEXT,
    "status_bb_u" TEXT,
    "zs_bb_u" DOUBLE PRECISION,
    "status_tb_u" TEXT,
    "zs_tb_u" DOUBLE PRECISION,
    "status_bb_tb" TEXT,
    "zs_bb_tb" DOUBLE PRECISION,
    "lingkarKepala" DOUBLE PRECISION,
    "status_lk_u" TEXT,
    "zs_lk_u" DOUBLE PRECISION,
    "naikBeratBadan" TEXT,

    CONSTRAINT "PengukuranAnak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Forum" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "ForumStatus" NOT NULL DEFAULT 'OPEN',
    "attachmentUrl" TEXT,
    "attachmentName" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Forum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumComment" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "forumId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ForumComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_displayUsername_key" ON "user"("displayUsername");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Posyandu_nama_key" ON "Posyandu"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "IbuHamil_nik_key" ON "IbuHamil"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "Ortu_nik_key" ON "Ortu"("nik");

-- CreateIndex
CREATE INDEX "Ortu_userAyahId_idx" ON "Ortu"("userAyahId");

-- CreateIndex
CREATE INDEX "Ortu_userIbuId_idx" ON "Ortu"("userIbuId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE INDEX "Forum_createdById_idx" ON "Forum"("createdById");

-- CreateIndex
CREATE INDEX "Forum_status_idx" ON "Forum"("status");

-- CreateIndex
CREATE INDEX "Forum_createdAt_idx" ON "Forum"("createdAt");

-- CreateIndex
CREATE INDEX "ForumComment_forumId_idx" ON "ForumComment"("forumId");

-- CreateIndex
CREATE INDEX "ForumComment_userId_idx" ON "ForumComment"("userId");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_posyanduId_fkey" FOREIGN KEY ("posyanduId") REFERENCES "Posyandu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IbuHamil" ADD CONSTRAINT "IbuHamil_posyanduId_fkey" FOREIGN KEY ("posyanduId") REFERENCES "Posyandu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PemeriksaanBumil" ADD CONSTRAINT "PemeriksaanBumil_ibuHamilId_fkey" FOREIGN KEY ("ibuHamilId") REFERENCES "IbuHamil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ortu" ADD CONSTRAINT "Ortu_userAyahId_fkey" FOREIGN KEY ("userAyahId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ortu" ADD CONSTRAINT "Ortu_userIbuId_fkey" FOREIGN KEY ("userIbuId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ortu" ADD CONSTRAINT "Ortu_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anak" ADD CONSTRAINT "Anak_ortuId_fkey" FOREIGN KEY ("ortuId") REFERENCES "Ortu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anak" ADD CONSTRAINT "Anak_posyanduId_fkey" FOREIGN KEY ("posyanduId") REFERENCES "Posyandu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengukuranAnak" ADD CONSTRAINT "PengukuranAnak_anakNik_fkey" FOREIGN KEY ("anakNik") REFERENCES "Anak"("nik") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Forum" ADD CONSTRAINT "Forum_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumComment" ADD CONSTRAINT "ForumComment_forumId_fkey" FOREIGN KEY ("forumId") REFERENCES "Forum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumComment" ADD CONSTRAINT "ForumComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
