/*
  Warnings:

  - The `method` column on the `Action` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `step` column on the `Session` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Job` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `JobStatus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Schedule` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `type` on the `Action` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('ROUTER', 'ASSIGN', 'FUNCTION', 'WEBHOOK', 'MENU', 'INPUT', 'QUIT');

-- CreateEnum
CREATE TYPE "ActionAPICallMethod" AS ENUM ('GET', 'POST');

-- CreateEnum
CREATE TYPE "SessionStateStep" AS ENUM ('WAITING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('GROUP', 'INDIVIDUAL');

-- DropForeignKey
ALTER TABLE "JobStatus" DROP CONSTRAINT "JobStatus_jobId_fkey";

-- DropForeignKey
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_jobId_fkey";

-- AlterTable
ALTER TABLE "Action" DROP COLUMN "type",
ADD COLUMN     "type" "ActionType" NOT NULL,
DROP COLUMN "method",
ADD COLUMN     "method" "ActionAPICallMethod";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "step",
ADD COLUMN     "step" "SessionStateStep";

-- DropTable
DROP TABLE "Job";

-- DropTable
DROP TABLE "JobStatus";

-- DropTable
DROP TABLE "Schedule";

-- CreateTable
CREATE TABLE "Visualization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,

    CONSTRAINT "Visualization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "type" "ContactType" NOT NULL,
    "number" TEXT NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsPushJob" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "AnalyticsPushJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsPushJobStatus" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "response" TEXT,

    CONSTRAINT "AnalyticsPushJobStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsPushJobSchedule" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "cron" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,

    CONSTRAINT "AnalyticsPushJobSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AnalyticsPushJobToContact" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_AnalyticsPushJobToVisualization" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Visualization_id_key" ON "Visualization"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_id_key" ON "Contact"("id");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsPushJobSchedule_id_key" ON "AnalyticsPushJobSchedule"("id");

-- CreateIndex
CREATE UNIQUE INDEX "_AnalyticsPushJobToContact_AB_unique" ON "_AnalyticsPushJobToContact"("A", "B");

-- CreateIndex
CREATE INDEX "_AnalyticsPushJobToContact_B_index" ON "_AnalyticsPushJobToContact"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AnalyticsPushJobToVisualization_AB_unique" ON "_AnalyticsPushJobToVisualization"("A", "B");

-- CreateIndex
CREATE INDEX "_AnalyticsPushJobToVisualization_B_index" ON "_AnalyticsPushJobToVisualization"("B");

-- AddForeignKey
ALTER TABLE "AnalyticsPushJobStatus" ADD CONSTRAINT "AnalyticsPushJobStatus_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "AnalyticsPushJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsPushJobSchedule" ADD CONSTRAINT "AnalyticsPushJobSchedule_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "AnalyticsPushJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnalyticsPushJobToContact" ADD CONSTRAINT "_AnalyticsPushJobToContact_A_fkey" FOREIGN KEY ("A") REFERENCES "AnalyticsPushJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnalyticsPushJobToContact" ADD CONSTRAINT "_AnalyticsPushJobToContact_B_fkey" FOREIGN KEY ("B") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnalyticsPushJobToVisualization" ADD CONSTRAINT "_AnalyticsPushJobToVisualization_A_fkey" FOREIGN KEY ("A") REFERENCES "AnalyticsPushJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnalyticsPushJobToVisualization" ADD CONSTRAINT "_AnalyticsPushJobToVisualization_B_fkey" FOREIGN KEY ("B") REFERENCES "Visualization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
