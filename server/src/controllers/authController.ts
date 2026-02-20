import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { signToken } from "../utils/jwt";
import type { AuthenticatedRequest } from "../middleware/auth";

const prisma = new PrismaClient();

function buildUserResponse(user: any) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    emailVerified: user.emailVerified,
    isChef: !!user.chef,
    chef: user.chef || null,
    customer: user.customer || null,
  };
}

// POST /auth/signup
export const signup = async (req: Request, res: Response) => {
  try {
    const {
      email, username, password, userType,
      // chef fields
      fullName, location, specialties,
      // customer fields
      firstName, lastName, phoneNumber, address, city, state, country, postalCode,
    } = req.body;

    if (!email || !password || !userType) {
      return res.status(400).json({ success: false, message: "email, password and userType are required" });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, ...(username ? [{ username }] : [])] },
    });
    if (existing) {
      const field = existing.email === email ? "Email" : "Username";
      return res.status(409).json({ success: false, message: `${field} is already in use` });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const normalizedUsername = (username || email.split("@")[0]).toLowerCase().trim();

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          username: normalizedUsername,
          passwordHash,
          emailVerified: true, // No email verification step
          status: "ACTIVE",
        },
      });

      if (userType === "chef") {
        await tx.chef.create({
          data: {
            userId: newUser.id,
            username: normalizedUsername,
            name: fullName || normalizedUsername,
            location: location || "",
            specialties: specialties || null,
          },
        });
      } else {
        await tx.customer.create({
          data: {
            userId: newUser.id,
            firstName: firstName || "",
            lastName: lastName || "",
            phoneNumber: phoneNumber || "",
            address: address || "",
            city: city || "",
            state: state || "",
            country: country || "AU",
            postalCode: postalCode || "",
          },
        });
      }

      return tx.user.findUnique({
        where: { id: newUser.id },
        include: { chef: true, customer: true },
      });
    });

    const token = signToken({ sub: user!.id, email: user!.email, isChef: !!user!.chef });

    return res.status(201).json({ success: true, token, user: buildUserResponse(user) });
  } catch (err: any) {
    console.error("signup error", err);
    return res.status(500).json({ success: false, message: "Signup failed" });
  }
};

// POST /auth/signin
export const signin = async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;
    const identifier = email || username;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: "Email/username and password are required" });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier.toLowerCase() },
        ],
      },
      include: { chef: true, customer: true },
    });

    if (!user || !user.passwordHash) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = signToken({ sub: user.id, email: user.email, isChef: !!user.chef });

    return res.status(200).json({ success: true, token, user: buildUserResponse(user) });
  } catch (err: any) {
    console.error("signin error", err);
    return res.status(500).json({ success: false, message: "Sign in failed" });
  }
};

// POST /auth/reset-password  (dev-mode: no email token — just email + new password)
// TODO production: generate a signed token, email it, validate before allowing reset
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: "Email and new password are required" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return 200 anyway to avoid email enumeration
      return res.status(200).json({ success: true, message: "If that email exists, the password has been reset" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

    return res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (err: any) {
    console.error("reset-password error", err);
    return res.status(500).json({ success: false, message: "Reset failed" });
  }
};

// GET /auth/me  (requires valid JWT)
export const me = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { chef: true, customer: true },
    });

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    return res.status(200).json({ success: true, user: buildUserResponse(user) });
  } catch (err: any) {
    console.error("me error", err);
    return res.status(500).json({ success: false, message: "Failed to fetch user" });
  }
};
