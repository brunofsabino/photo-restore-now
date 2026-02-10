-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "orderId" TEXT,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL DEFAULT 'restoration',
    "status" TEXT NOT NULL,
    "paymentIntentId" TEXT,
    "totalAmount" INTEGER NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobImage" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "originalUrl" TEXT,
    "restoredUrl" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Job_email_idx" ON "Job"("email");

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "Job"("status");

-- CreateIndex
CREATE INDEX "Job_orderId_idx" ON "Job"("orderId");

-- CreateIndex
CREATE INDEX "JobImage_jobId_idx" ON "JobImage"("jobId");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobImage" ADD CONSTRAINT "JobImage_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
