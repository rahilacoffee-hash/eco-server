/*
  Warnings:

  - A unique constraint covering the columns `[jti]` on the table `RefreshSession` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `jti` to the `RefreshSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RefreshSession" ADD COLUMN     "jti" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "RefreshSession_jti_key" ON "RefreshSession"("jti");
