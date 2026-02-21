-- AlterTable
ALTER TABLE "Subscriber" ADD COLUMN     "phone" VARCHAR(20),
ADD COLUMN     "smsOptedOut" BOOLEAN NOT NULL DEFAULT false;
