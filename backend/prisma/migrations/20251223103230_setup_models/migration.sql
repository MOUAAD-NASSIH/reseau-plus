/*
  Warnings:

  - The values [PENDING] on the enum `UserStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `createdAt` on the `institutions` table. All the data in the column will be lost.
  - You are about to drop the column `institutionName` on the `institutions` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `institutions` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `roles` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `users` table. All the data in the column will be lost.
  - You are about to alter the column `email` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `password` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to drop the column `createdAt` on the `workers` table. All the data in the column will be lost.
  - You are about to drop the column `experienceYears` on the `workers` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `workers` table. All the data in the column will be lost.
  - You are about to drop the column `isApproved` on the `workers` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `workers` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `workers` table. All the data in the column will be lost.
  - You are about to drop the column `speciality` on the `workers` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `workers` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `institutions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `workers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `institution_name` to the `institutions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `institutions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role_id` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_name` to the `workers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `workers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `workers` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "WorkerStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "MissionStatus" AS ENUM ('OPEN', 'ONGOING', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('SUBMITTED', 'REJECTED', 'ACCEPTED');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('ACTIVE', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- AlterEnum
BEGIN;
CREATE TYPE "UserStatus_new" AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED');
ALTER TABLE "public"."users" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "status" TYPE "UserStatus_new" USING ("status"::text::"UserStatus_new");
ALTER TYPE "UserStatus" RENAME TO "UserStatus_old";
ALTER TYPE "UserStatus_new" RENAME TO "UserStatus";
DROP TYPE "public"."UserStatus_old";
ALTER TABLE "users" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- DropForeignKey
ALTER TABLE "institutions" DROP CONSTRAINT "institutions_userId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_roleId_fkey";

-- DropForeignKey
ALTER TABLE "workers" DROP CONSTRAINT "workers_userId_fkey";

-- DropIndex
DROP INDEX "institutions_userId_key";

-- DropIndex
DROP INDEX "workers_userId_key";

-- AlterTable
ALTER TABLE "institutions" DROP COLUMN "createdAt",
DROP COLUMN "institutionName",
DROP COLUMN "userId",
ADD COLUMN     "city" VARCHAR(100),
ADD COLUMN     "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "institution_name" VARCHAR(255) NOT NULL,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "user_id" INTEGER NOT NULL,
ALTER COLUMN "address" DROP NOT NULL;

-- AlterTable
ALTER TABLE "roles" ALTER COLUMN "name" SET DATA TYPE VARCHAR(50);

-- AlterTable
ALTER TABLE "users" DROP COLUMN "createdAt",
DROP COLUMN "roleId",
ADD COLUMN     "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "role_id" INTEGER NOT NULL,
ALTER COLUMN "email" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "password" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "workers" DROP COLUMN "createdAt",
DROP COLUMN "experienceYears",
DROP COLUMN "firstName",
DROP COLUMN "isApproved",
DROP COLUMN "lastName",
DROP COLUMN "location",
DROP COLUMN "speciality",
DROP COLUMN "userId",
ADD COLUMN     "birth_date" DATE,
ADD COLUMN     "city" VARCHAR(100),
ADD COLUMN     "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "experience_years" INTEGER,
ADD COLUMN     "first_name" VARCHAR(100) NOT NULL,
ADD COLUMN     "gender" VARCHAR(20),
ADD COLUMN     "last_name" VARCHAR(100) NOT NULL,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "rejection_reason" TEXT,
ADD COLUMN     "speciality_id" INTEGER,
ADD COLUMN     "status" "WorkerStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "user_id" INTEGER NOT NULL,
ADD COLUMN     "zip_code" VARCHAR(20);

-- CreateTable
CREATE TABLE "specialities" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,

    CONSTRAINT "specialities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "domains" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,

    CONSTRAINT "domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_documents" (
    "id" SERIAL NOT NULL,
    "worker_id" INTEGER NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "file_url" VARCHAR(500) NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "admin_comment" TEXT,
    "uploaded_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMPTZ,

    CONSTRAINT "worker_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_experiences" (
    "id" SERIAL NOT NULL,
    "worker_id" INTEGER NOT NULL,
    "job_title" VARCHAR(255) NOT NULL,
    "organization" VARCHAR(255) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_availabilities" (
    "id" SERIAL NOT NULL,
    "worker_id" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_domains" (
    "id" SERIAL NOT NULL,
    "worker_id" INTEGER NOT NULL,
    "domain_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "missions" (
    "id" SERIAL NOT NULL,
    "institution_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "start_date" TIMESTAMPTZ NOT NULL,
    "end_date" TIMESTAMPTZ NOT NULL,
    "required_speciality_id" INTEGER,
    "status" "MissionStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "missions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mission_domains" (
    "id" SERIAL NOT NULL,
    "mission_id" INTEGER NOT NULL,
    "domain_id" INTEGER NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mission_domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mission_applications" (
    "id" SERIAL NOT NULL,
    "mission_id" INTEGER NOT NULL,
    "worker_id" INTEGER NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "applied_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mission_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mission_assignments" (
    "id" SERIAL NOT NULL,
    "mission_id" INTEGER NOT NULL,
    "worker_id" INTEGER NOT NULL,
    "institution_id" INTEGER NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "assigned_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mission_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" SERIAL NOT NULL,
    "mission_assignment_id" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "mission_assignment_id" INTEGER NOT NULL,
    "institution_id" INTEGER NOT NULL,
    "worker_id" INTEGER NOT NULL,
    "amount_total" DOUBLE PRECISION NOT NULL,
    "platform_fee" DOUBLE PRECISION NOT NULL,
    "worker_amount" DOUBLE PRECISION NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paid_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" VARCHAR(100) NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_logs" (
    "id" SERIAL NOT NULL,
    "admin_id" INTEGER NOT NULL,
    "target_user_id" INTEGER,
    "target_document_id" INTEGER,
    "target_review_id" INTEGER,
    "target_mission_id" INTEGER,
    "action_type" VARCHAR(100) NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "specialities_name_key" ON "specialities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "domains_name_key" ON "domains"("name");

-- CreateIndex
CREATE INDEX "worker_documents_worker_id_idx" ON "worker_documents"("worker_id");

-- CreateIndex
CREATE INDEX "worker_documents_status_idx" ON "worker_documents"("status");

-- CreateIndex
CREATE INDEX "worker_experiences_worker_id_idx" ON "worker_experiences"("worker_id");

-- CreateIndex
CREATE INDEX "worker_availabilities_worker_id_idx" ON "worker_availabilities"("worker_id");

-- CreateIndex
CREATE INDEX "worker_availabilities_start_date_end_date_idx" ON "worker_availabilities"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "worker_domains_worker_id_idx" ON "worker_domains"("worker_id");

-- CreateIndex
CREATE INDEX "worker_domains_domain_id_idx" ON "worker_domains"("domain_id");

-- CreateIndex
CREATE UNIQUE INDEX "worker_domains_worker_id_domain_id_key" ON "worker_domains"("worker_id", "domain_id");

-- CreateIndex
CREATE INDEX "missions_institution_id_idx" ON "missions"("institution_id");

-- CreateIndex
CREATE INDEX "missions_status_idx" ON "missions"("status");

-- CreateIndex
CREATE INDEX "missions_required_speciality_id_idx" ON "missions"("required_speciality_id");

-- CreateIndex
CREATE INDEX "missions_start_date_end_date_idx" ON "missions"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "mission_domains_mission_id_idx" ON "mission_domains"("mission_id");

-- CreateIndex
CREATE INDEX "mission_domains_domain_id_idx" ON "mission_domains"("domain_id");

-- CreateIndex
CREATE UNIQUE INDEX "mission_domains_mission_id_domain_id_key" ON "mission_domains"("mission_id", "domain_id");

-- CreateIndex
CREATE INDEX "mission_applications_mission_id_idx" ON "mission_applications"("mission_id");

-- CreateIndex
CREATE INDEX "mission_applications_worker_id_idx" ON "mission_applications"("worker_id");

-- CreateIndex
CREATE INDEX "mission_applications_status_idx" ON "mission_applications"("status");

-- CreateIndex
CREATE UNIQUE INDEX "mission_applications_mission_id_worker_id_key" ON "mission_applications"("mission_id", "worker_id");

-- CreateIndex
CREATE INDEX "mission_assignments_mission_id_idx" ON "mission_assignments"("mission_id");

-- CreateIndex
CREATE INDEX "mission_assignments_worker_id_idx" ON "mission_assignments"("worker_id");

-- CreateIndex
CREATE INDEX "mission_assignments_institution_id_idx" ON "mission_assignments"("institution_id");

-- CreateIndex
CREATE INDEX "mission_assignments_status_idx" ON "mission_assignments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_mission_assignment_id_key" ON "reviews"("mission_assignment_id");

-- CreateIndex
CREATE INDEX "reviews_mission_assignment_id_idx" ON "reviews"("mission_assignment_id");

-- CreateIndex
CREATE INDEX "reviews_rating_idx" ON "reviews"("rating");

-- CreateIndex
CREATE INDEX "payments_mission_assignment_id_idx" ON "payments"("mission_assignment_id");

-- CreateIndex
CREATE INDEX "payments_institution_id_idx" ON "payments"("institution_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_is_read_idx" ON "notifications"("is_read");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateIndex
CREATE INDEX "admin_logs_admin_id_idx" ON "admin_logs"("admin_id");

-- CreateIndex
CREATE INDEX "admin_logs_target_user_id_idx" ON "admin_logs"("target_user_id");

-- CreateIndex
CREATE INDEX "admin_logs_target_document_id_idx" ON "admin_logs"("target_document_id");

-- CreateIndex
CREATE INDEX "admin_logs_target_review_id_idx" ON "admin_logs"("target_review_id");

-- CreateIndex
CREATE INDEX "admin_logs_target_mission_id_idx" ON "admin_logs"("target_mission_id");

-- CreateIndex
CREATE INDEX "admin_logs_action_type_idx" ON "admin_logs"("action_type");

-- CreateIndex
CREATE INDEX "admin_logs_created_at_idx" ON "admin_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "institutions_user_id_key" ON "institutions"("user_id");

-- CreateIndex
CREATE INDEX "institutions_user_id_idx" ON "institutions"("user_id");

-- CreateIndex
CREATE INDEX "institutions_city_idx" ON "institutions"("city");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_id_idx" ON "users"("role_id");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE UNIQUE INDEX "workers_user_id_key" ON "workers"("user_id");

-- CreateIndex
CREATE INDEX "workers_user_id_idx" ON "workers"("user_id");

-- CreateIndex
CREATE INDEX "workers_speciality_id_idx" ON "workers"("speciality_id");

-- CreateIndex
CREATE INDEX "workers_status_idx" ON "workers"("status");

-- CreateIndex
CREATE INDEX "workers_city_idx" ON "workers"("city");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workers" ADD CONSTRAINT "workers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workers" ADD CONSTRAINT "workers_speciality_id_fkey" FOREIGN KEY ("speciality_id") REFERENCES "specialities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_documents" ADD CONSTRAINT "worker_documents_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_experiences" ADD CONSTRAINT "worker_experiences_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_availabilities" ADD CONSTRAINT "worker_availabilities_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_domains" ADD CONSTRAINT "worker_domains_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_domains" ADD CONSTRAINT "worker_domains_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institutions" ADD CONSTRAINT "institutions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missions" ADD CONSTRAINT "missions_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missions" ADD CONSTRAINT "missions_required_speciality_id_fkey" FOREIGN KEY ("required_speciality_id") REFERENCES "specialities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_domains" ADD CONSTRAINT "mission_domains_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "missions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_domains" ADD CONSTRAINT "mission_domains_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_applications" ADD CONSTRAINT "mission_applications_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "missions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_applications" ADD CONSTRAINT "mission_applications_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_assignments" ADD CONSTRAINT "mission_assignments_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "missions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_assignments" ADD CONSTRAINT "mission_assignments_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_assignments" ADD CONSTRAINT "mission_assignments_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_mission_assignment_id_fkey" FOREIGN KEY ("mission_assignment_id") REFERENCES "mission_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_mission_assignment_id_fkey" FOREIGN KEY ("mission_assignment_id") REFERENCES "mission_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_logs" ADD CONSTRAINT "admin_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_logs" ADD CONSTRAINT "admin_logs_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_logs" ADD CONSTRAINT "admin_logs_target_document_id_fkey" FOREIGN KEY ("target_document_id") REFERENCES "worker_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_logs" ADD CONSTRAINT "admin_logs_target_review_id_fkey" FOREIGN KEY ("target_review_id") REFERENCES "reviews"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_logs" ADD CONSTRAINT "admin_logs_target_mission_id_fkey" FOREIGN KEY ("target_mission_id") REFERENCES "missions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
