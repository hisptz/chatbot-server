-- CreateTable
CREATE TABLE "Action" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "nextState" TEXT,
    "text" TEXT,
    "params" TEXT,
    "dataKey" TEXT,
    "functionName" TEXT,
    "webhookURL" TEXT,
    "responseType" TEXT,
    "responseDataPath" TEXT,
    "headers" TEXT,
    "method" TEXT,
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
    "step" TEXT,

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

-- CreateIndex
CREATE UNIQUE INDEX "Flow_trigger_key" ON "Flow"("trigger");

-- CreateIndex
CREATE UNIQUE INDEX "Connection_identifier_key" ON "Connection"("identifier");

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "Action"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowState" ADD CONSTRAINT "FlowState_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "Action"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowState" ADD CONSTRAINT "FlowState_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "Flow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flow" ADD CONSTRAINT "Flow_FlowStateId_fkey" FOREIGN KEY ("FlowStateId") REFERENCES "FlowState"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "Connection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "FlowState"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_FlowId_fkey" FOREIGN KEY ("FlowId") REFERENCES "Flow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
