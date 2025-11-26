import { Response, Request } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const syncUser = async (req: Request, res: Response) => {
  try {
    const { email, userType, username, fullName, firstName, lastName, ...otherData } = req.body;

    // Email is required
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Validate user exists in Cognito (no token verification needed)
    try {
      // May need some configuration on AWS Cognito for this to work
      // await cognitoClient.send(
      //   new AdminGetUserCommand({
      //     UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID!,
      //     Username: email,
      //   }),
      // );

      // User exists in Cognito - proceed with profile creation
      // Find or create user in database
      let user = await prisma.user.findUnique({
        where: { email },
        include: { chef: true, customer: true },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            username: username || email.split("@")[0], // Use email prefix if no username
            emailVerified: false, // Will be updated when email is verified
            status: "CREATED",
          },
          include: { chef: true, customer: true },
        });
      }

      // Create Chef profile if needed
      if (userType === "chef" && !user.chef) {
        await prisma.chef.create({
          data: {
            userId: user!.id,
            username: username || email.split("@")[0],
            name: fullName,
            location: otherData.location,
            specialties: otherData.specialties || null,
          },
        });

        user = await prisma.user.findUnique({
          where: { id: user!.id },
          include: { chef: true, customer: true },
        });
      }

      // Create Customer profile if needed
      if (userType === "customer" && !user!.customer) {
        await prisma.customer.create({
          data: {
            userId: user!.id,
            firstName: firstName || email.split("@")[0],
            lastName: lastName || "",
            phoneNumber: otherData.phoneNumber,
            address: otherData.address,
            city: otherData.city,
            state: otherData.state,
            country: otherData.country,
            postalCode: otherData.postalCode,
          },
        });

        user = await prisma.user.findUnique({
          where: { id: user!.id },
          include: { chef: true, customer: true },
        });
      }

      return res.json({
        success: true,
        user: {
          id: user?.id,
          email: user?.email,
          username: user?.username,
          status: user?.status,
          emailVerified: user?.emailVerified,
          isChef: !!user?.chef,
          chef: user?.chef || null,
          customer: user?.customer || null,
        },
      });
    } catch (cognitoError: any) {
      console.error("Cognito validation error:", cognitoError);
      return res.status(403).json({
        success: false,
        message: "User not found in Cognito",
      });
    }
  } catch (error: any) {
    console.error("Sync user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to sync user",
      error: error.message,
    });
  }
};
