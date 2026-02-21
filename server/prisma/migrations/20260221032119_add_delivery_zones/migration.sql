-- AlterTable
ALTER TABLE "Chef" ADD COLUMN     "deliveryCities" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "deliveryMode" TEXT NOT NULL DEFAULT 'ALL',
ADD COLUMN     "deliveryZones" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliverySuburb" VARCHAR(100),
ADD COLUMN     "outsideZone" BOOLEAN NOT NULL DEFAULT false;
