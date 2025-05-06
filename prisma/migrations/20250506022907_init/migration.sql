-- CreateTable
CREATE TABLE "OBSERVATIONS" (
    "id" TEXT NOT NULL,
    "test_performed_id" TEXT NOT NULL,
    "analysis" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OBSERVATIONS_pkey" PRIMARY KEY ("id")
);
