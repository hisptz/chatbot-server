-- DropForeignKey
ALTER TABLE "Entry" DROP CONSTRAINT "Entry_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "Flow" DROP CONSTRAINT "Flow_FlowStateId_fkey";

-- DropForeignKey
ALTER TABLE "FlowState" DROP CONSTRAINT "FlowState_actionId_fkey";

-- DropForeignKey
ALTER TABLE "FlowState" DROP CONSTRAINT "FlowState_flowId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_FlowId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_connectionId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_stateId_fkey";

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
