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
 *
 * Request body: { email: string }
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

    const { email } = req.body;

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
          username: userInfo.username,
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
          username: userInfo.username,
          cognitoId: userInfo.cognitoId,
          emailVerified: userInfo.emailVerified,
        },
        include: {
          chef: true,
          customer: true,
        },
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
