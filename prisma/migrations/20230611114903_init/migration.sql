/*
  Warnings:

  - You are about to drop the column `params` on the `Job` table. All the data in the column will be lost.
  - Added the required column `data` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "JobStatus" DROP CONSTRAINT "JobStatus_jobId_fkey";

-- DropForeignKey
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_jobId_fkey";

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "params",
ADD COLUMN     "data" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "JobStatus" ADD CONSTRAINT "JobStatus_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
