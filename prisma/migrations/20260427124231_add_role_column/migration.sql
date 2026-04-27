-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MEMBER', 'ADMIN');

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'MEMBER';
