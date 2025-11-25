import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../middleware/auth";
import { verifyCognitoToken, extractUserFromToken } from "../utils/cognito-verify";

const prisma = new PrismaClient();

/**
 * POST /api/auth/sync-user
 * Sync Cognito user with database
 *
 * Called after successful sign-up or login
 * Creates/updates User record in database
 * Optionally creates Chef or Customer profile based on userType
 *
 * Request body: {
 *   email: string,
 *   userType?: "chef" | "customer",
 *   username?: string,
 *   // Chef fields (required if userType === "chef"):
 *   fullName?: string,
 *   location?: string,
 *   specialties?: string,
 *   // Customer fields (required if userType === "customer"):
 *   firstName?: string,
 *   lastName?: string,
 *   phoneNumber?: string,
 *   address?: string,
 *   city?: string,
 *   state?: string,
 *   country?: string,
 *   postalCode?: string,
 *   // Optional signup data object (passed during signup flow)
 *   signupData?: { ... } (full signup form data)
 * }
 * Requires: Authorization: Bearer <jwt_token>
 */
export const syncUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      email,
      userType: bodyUserType,
      username: bodyUsername,
      fullName: bodyFullName,
      firstName: bodyFirstName,
      lastName: bodyLastName,
      location,
      specialties,
      phoneNumber,
      address,
      city,
      state,
      country,
      postalCode,
      signupData,
    } = req.body;

    console.log("Sync user request body:", req.body);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Verify email matches authenticated user
    if (email !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: "Email does not match authenticated user",
      });
    }

    // Get Cognito token from header
    const authHeader = req.headers.authorization || "";
    const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/);

    if (!tokenMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    const token = tokenMatch[1];
    const payload = await verifyCognitoToken(token);
    const userInfo = extractUserFromToken(payload);

    // Determine data source: prefer signupData (from signup), then token, then request body
    const userType = signupData?.userType || userInfo.userType || bodyUserType;
    const username = signupData?.username || userInfo.username || bodyUsername;
    const firstName = signupData?.firstName || userInfo.firstName || bodyFirstName;
    const lastName = signupData?.lastName || userInfo.lastName || bodyLastName;

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: userInfo.email },
      include: {
        chef: true,
        customer: true,
      },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: userInfo.email,
          username: username || userInfo.username,
          cognitoId: userInfo.cognitoId,
          emailVerified: userInfo.emailVerified,
          status: "CREATED",
        },
        include: {
          chef: true,
          customer: true,
        },
      });
    } else {
      // Update existing user with Cognito info
      user = await prisma.user.update({
        where: { email: userInfo.email },
        data: {
          username: username || userInfo.username,
          cognitoId: userInfo.cognitoId,
          emailVerified: userInfo.emailVerified,
        },
        include: {
          chef: true,
          customer: true,
        },
      });
    }

    // Create Chef profile if requested
    if (userType === "chef" && !user.chef) {
      // Use location from signupData first, then from body
      let chefLocation = signupData?.location || location;
      if (!chefLocation) {
        chefLocation = "Unknown";
      }

      await prisma.chef.create({
        data: {
          userId: user.id,
          username: username || userInfo.username,
          name: signupData?.fullName || userInfo.email.split("@")[0],
          location: chefLocation,
          specialties: signupData?.specialties || specialties || null,
        },
      });

      user = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          chef: true,
          customer: true,
        },
      });
    }

    // Create Customer profile if requested
    if (userType === "customer" && !user?.customer) {
      // Use values from signupData first, then fall back to body/token
      const customerFirstName = signupData?.firstName || firstName;
      const customerLastName = signupData?.lastName || lastName;
      const customerPhoneNumber = signupData?.phoneNumber || phoneNumber;
      const customerAddress = signupData?.address || address;
      const customerCity = signupData?.city || city;
      const customerState = signupData?.state || state;
      const customerCountry = signupData?.country || country;
      const customerPostalCode = signupData?.postalCode || postalCode;

      if (
        !customerFirstName ||
        !customerLastName ||
        !customerPhoneNumber ||
        !customerAddress ||
        !customerCity ||
        !customerState ||
        !customerCountry ||
        !customerPostalCode
      ) {
        return res.status(400).json({
          success: false,
          message: "All customer profile fields are required",
        });
      }

      await prisma.customer.create({
        data: {
          userId: user!.id,
          firstName: customerFirstName,
          lastName: customerLastName,
          phoneNumber: customerPhoneNumber,
          address: customerAddress,
          city: customerCity,
          state: customerState,
          country: customerCountry,
          postalCode: customerPostalCode,
        },
      });

      user = await prisma.user.findUnique({
        where: { id: user!.id },
        include: {
          chef: true,
          customer: true,
        },
      });
    }

    if (!user) {
      return res.status(500).json({
        success: false,
        message: "Failed to create user profile",
      });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        status: user.status,
        emailVerified: user.emailVerified,
        isChef: !!user.chef,
        chef: user.chef || null,
        customer: user.customer || null,
      },
    });
  } catch (error: any) {
    console.error("Sync user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to sync user",
      error: error.message,
    });
  }
};
