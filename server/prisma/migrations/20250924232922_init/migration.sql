-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('CREATED', 'PENDING', 'ACTIVE', 'INACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'PAID', 'REFUNDED', 'FAILED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" VARCHAR(50) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "status" "public"."UserStatus" NOT NULL DEFAULT 'CREATED',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Customer" (
    "id" VARCHAR(50) NOT NULL,
    "firstName" VARCHAR(150) NOT NULL,
    "middleName" VARCHAR(150),
    "lastName" VARCHAR(150) NOT NULL,
    "phoneNumber" VARCHAR(20) NOT NULL,
    "address" VARCHAR(250) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(10) NOT NULL,
    "country" VARCHAR(3) NOT NULL,
    "postalCode" VARCHAR(10) NOT NULL,
    "company" VARCHAR(150),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" VARCHAR(50) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Chef" (
    "id" VARCHAR(50) NOT NULL,
    "username" VARCHAR(200) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "location" VARCHAR(150) NOT NULL,
    "bio" TEXT,
    "specialties" VARCHAR(250),
    "phoneNumber" VARCHAR(20),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" VARCHAR(50) NOT NULL,

    CONSTRAINT "Chef_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Menu" (
    "id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(250) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "orderFrom" TIMESTAMP(3),
    "orderTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "chefId" VARCHAR(50) NOT NULL,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Meal" (
    "id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" VARCHAR(250) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "size" INTEGER,
    "image" TEXT,
    "ingredients" TEXT[],
    "allergens" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "chefId" VARCHAR(50) NOT NULL,

    CONSTRAINT "Meal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MealsOnOrders" (
    "id" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,

    CONSTRAINT "MealsOnOrders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Order" (
    "id" TEXT NOT NULL,
    "status" "public"."OrderStatus" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "chefId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_menu_meal" (
    "A" VARCHAR(50) NOT NULL,
    "B" VARCHAR(50) NOT NULL,

    CONSTRAINT "_menu_meal_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_userId_key" ON "public"."Customer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Chef_username_key" ON "public"."Chef"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Chef_userId_key" ON "public"."Chef"("userId");

-- CreateIndex
CREATE INDEX "Chef_username_idx" ON "public"."Chef"("username");

-- CreateIndex
CREATE INDEX "_menu_meal_B_index" ON "public"."_menu_meal"("B");

-- AddForeignKey
ALTER TABLE "public"."Customer" ADD CONSTRAINT "Customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Chef" ADD CONSTRAINT "Chef_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Menu" ADD CONSTRAINT "Menu_chefId_fkey" FOREIGN KEY ("chefId") REFERENCES "public"."Chef"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Meal" ADD CONSTRAINT "Meal_chefId_fkey" FOREIGN KEY ("chefId") REFERENCES "public"."Chef"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MealsOnOrders" ADD CONSTRAINT "MealsOnOrders_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "public"."Meal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MealsOnOrders" ADD CONSTRAINT "MealsOnOrders_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_chefId_fkey" FOREIGN KEY ("chefId") REFERENCES "public"."Chef"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_menu_meal" ADD CONSTRAINT "_menu_meal_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_menu_meal" ADD CONSTRAINT "_menu_meal_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;
