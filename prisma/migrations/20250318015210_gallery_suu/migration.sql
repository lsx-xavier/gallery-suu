-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userName" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "folders" (
    "id" TEXT NOT NULL,
    "folderName" TEXT NOT NULL,
    "slugFolder" TEXT NOT NULL,
    "folderId" TEXT NOT NULL,
    "parentName" TEXT,
    "slugParent" TEXT NOT NULL,
    "parentId" TEXT,
    "folderIdOfPhotos" TEXT NOT NULL,
    "thumbId" TEXT NOT NULL,
    "usersIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "folders_pkey" PRIMARY KEY ("id")
);
