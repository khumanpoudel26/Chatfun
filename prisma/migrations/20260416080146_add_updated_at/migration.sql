/*
  Add created_at and updated_at to User table safely
*/

-- 1. Add created_at with default (safe for existing rows)
ALTER TABLE "User" ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 2. Add updated_at as nullable first (so existing rows don't break)
ALTER TABLE "User" ADD COLUMN "updated_at" TIMESTAMP(3);

-- 3. Set updated_at = created_at for existing records (or use NOW())
UPDATE "User" SET "updated_at" = "created_at" WHERE "updated_at" IS NULL;

-- 4. Now make updated_at NOT NULL
ALTER TABLE "User" ALTER COLUMN "updated_at" SET NOT NULL;

-- 5. Add default for future records
ALTER TABLE "User" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- Optional: Add Prisma's automatic update behavior (recommended)
-- Note: This constraint is not needed if you're using @updatedAt in schema

-- Drop the old unique index on id if it exists (Prisma sometimes adds this)
DROP INDEX IF EXISTS "User_id_key";

-- Ensure primary key exists (usually already there, but safe)
ALTER TABLE "User" ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");