/*
  Warnings:

  - You are about to drop the column `profile_picture` on the `workers` table. All the data in the column will be lost.
  - You are about to drop the `_ConversationParticipant` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ConversationParticipant" DROP CONSTRAINT "_ConversationParticipant_A_fkey";

-- DropForeignKey
ALTER TABLE "_ConversationParticipant" DROP CONSTRAINT "_ConversationParticipant_B_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "profile_picture" VARCHAR(500);

-- AlterTable
ALTER TABLE "workers" DROP COLUMN "profile_picture";

-- DropTable
DROP TABLE "_ConversationParticipant";
