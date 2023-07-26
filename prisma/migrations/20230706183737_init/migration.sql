-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('ROUTER', 'ASSIGN', 'FUNCTION', 'WEBHOOK', 'MENU', 'INPUT', 'QUIT');

-- CreateEnum
CREATE TYPE "ActionAPICallMethod" AS ENUM ('GET', 'POST');

-- CreateEnum
CREATE TYPE "SessionStateStep" AS ENUM ('WAITING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('group', 'individual');

-- CreateTable
CREATE TABLE "Action" (
    "id" TEXT NOT NULL,
    "type" "ActionType" NOT NULL,
    "nextState" TEXT,
    "text" TEXT,
    "params" TEXT,
    "dataKey" TEXT,
    "functionName" TEXT,
    "webhookURL" TEXT,
    "responseType" TEXT,
    "responseDataPath" TEXT,
    "headers" TEXT,
    "method" "ActionAPICallMethod",
    "body" TEXT,
    "messageFormat" TEXT,
    "options" TEXT,

    CONSTRAINT "Action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Route" (
    "id" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "expression" TEXT,
    "nextStateId" TEXT NOT NULL,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlowState" (
    "id" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "retries" INTEGER NOT NULL,
    "flowId" TEXT NOT NULL,

    CONSTRAINT "FlowState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Flow" (
    "id" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "rootState" TEXT NOT NULL,
    "FlowStateId" TEXT,

    CONSTRAINT "Flow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Connection" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,

    CONSTRAINT "Connection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "cancelled" BOOLEAN,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "connectionId" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "FlowId" TEXT NOT NULL,
    "tries" INTEGER NOT NULL,
    "data" TEXT NOT NULL,
    "step" "SessionStateStep",

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entry" (
    "id" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "text" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "Entry_pkey" PRIMARY KEY ("id")
);

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
CREATE UNIQUE INDEX "Flow_trigger_key" ON "Flow"("trigger");

-- CreateIndex
CREATE UNIQUE INDEX "Connection_identifier_key" ON "Connection"("identifier");

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
ALTER TABLE "Route" ADD CONSTRAINT "Route_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "Action"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowState" ADD CONSTRAINT "FlowState_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "Action"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowState" ADD CONSTRAINT "FlowState_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "Flow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flow" ADD CONSTRAINT "Flow_FlowStateId_fkey" FOREIGN KEY ("FlowStateId") REFERENCES "FlowState"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "Connection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "FlowState"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_FlowId_fkey" FOREIGN KEY ("FlowId") REFERENCES "Flow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
