-- AlterTable
ALTER TABLE "Menu" ADD COLUMN     "distributedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Subscriber" (
    "id" VARCHAR(50) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "name" VARCHAR(150),
    "chefId" VARCHAR(50) NOT NULL,
    "unsubscribed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscriber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Subscriber_chefId_idx" ON "Subscriber"("chefId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_email_chefId_key" ON "Subscriber"("email", "chefId");

-- AddForeignKey
ALTER TABLE "Subscriber" ADD CONSTRAINT "Subscriber_chefId_fkey" FOREIGN KEY ("chefId") REFERENCES "Chef"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
