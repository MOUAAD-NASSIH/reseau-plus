-- AlterTable
ALTER TABLE "users" ADD COLUMN     "password_reset_expires" TIMESTAMPTZ,
ADD COLUMN     "password_reset_token" TEXT,
ADD COLUMN     "verification_token" TEXT;
