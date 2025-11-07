/*
  Warnings:

  - You are about to alter the column `image` on the `Meal` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(150)`.
  - The primary key for the `MealsOnOrders` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `MealsOnOrders` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `mealId` on the `MealsOnOrders` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `orderId` on the `MealsOnOrders` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - The primary key for the `Order` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `chefId` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `customerId` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - Added the required column `deliveryAddress` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."MealsOnOrders" DROP CONSTRAINT "MealsOnOrders_mealId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MealsOnOrders" DROP CONSTRAINT "MealsOnOrders_orderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_chefId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_customerId_fkey";

-- AlterTable
ALTER TABLE "Meal" ALTER COLUMN "image" SET DATA TYPE VARCHAR(150);

-- AlterTable
ALTER TABLE "MealsOnOrders" DROP CONSTRAINT "MealsOnOrders_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "mealId" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "orderId" SET DATA TYPE VARCHAR(50),
ADD CONSTRAINT "MealsOnOrders_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Order" DROP CONSTRAINT "Order_pkey",
ADD COLUMN     "deliveryAddress" VARCHAR(250) NOT NULL,
ADD COLUMN     "notes" VARCHAR(300),
ALTER COLUMN "id" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "chefId" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "customerId" SET DATA TYPE VARCHAR(50),
ADD CONSTRAINT "Order_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "MealsOnOrders" ADD CONSTRAINT "MealsOnOrders_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealsOnOrders" ADD CONSTRAINT "MealsOnOrders_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_chefId_fkey" FOREIGN KEY ("chefId") REFERENCES "Chef"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
