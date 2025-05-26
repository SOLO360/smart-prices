-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "category" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "bulkPrice" DOUBLE PRECISION NOT NULL,
    "turnaroundTime" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);
