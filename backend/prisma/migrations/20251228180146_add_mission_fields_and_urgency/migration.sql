-- CreateEnum
CREATE TYPE "Urgency" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- AlterTable
ALTER TABLE "missions" ADD COLUMN     "budget" DECIMAL(10,2),
ADD COLUMN     "location" VARCHAR(100),
ADD COLUMN     "urgency" "Urgency" NOT NULL DEFAULT 'MEDIUM';
