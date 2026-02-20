-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "stripePaymentIntentId" VARCHAR(200),
ADD COLUMN     "stripeSessionId" VARCHAR(200);
