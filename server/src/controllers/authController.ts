import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { signToken } from "../utils/jwt";
import type { AuthenticatedRequest } from "../middleware/auth";
import { Resend } from "resend";

const prisma = new PrismaClient();

function buildUserResponse(user: any) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    emailVerified: user.emailVerified,
    isChef: !!user.chef,
    isAdmin: user.isAdmin ?? false,
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

    // Send welcome email to new chefs (non-blocking)
    if (user!.chef && process.env.RESEND_API_KEY) {
      const chefName = user!.chef.name || user!.chef.username;
      const dashboardUrl = `${APP_URL}/account/chef/dashboard`;
      const profileUrl = `${APP_URL}/chef/${user!.chef.username}`;
      resend.emails.send({
        from: process.env.EMAIL_FROM_ORDERS || "onboarding@resend.dev",
        to: user!.email,
        subject: `Welcome to Bring Me Food, ${chefName}! 🍽️`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#fff">
            <img src="${APP_URL}/logo.png" alt="Bring Me Food" style="height:40px;margin-bottom:24px" />
            <h2 style="color:#1a2e25;margin:0 0 8px">Welcome, ${chefName}! 🎉</h2>
            <p style="color:#444;line-height:1.6">Your chef account is ready. Here's how to get started:</p>
            <ol style="color:#444;line-height:2;padding-left:20px">
              <li><strong>Add your meals</strong> — upload photos, set prices, add ingredients</li>
              <li><strong>Create a weekly menu</strong> — group meals into a menu for ordering</li>
              <li><strong>Share your page</strong> — send your chef link to customers: <a href="${profileUrl}" style="color:#f97316">${profileUrl}</a></li>
              <li><strong>Set up Stripe</strong> (optional) — accept online payments from your dashboard</li>
            </ol>
            <a href="${dashboardUrl}"
               style="display:inline-block;margin:24px 0;padding:14px 28px;background:#f97316;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px">
              Go to Dashboard →
            </a>
            <p style="color:#888;font-size:13px;margin-top:24px;border-top:1px solid #eee;padding-top:16px">
              Questions? Just reply to this email. We're here to help.<br/>
              <span style="color:#bbb">Bring Me Food · Sydney, Australia</span>
            </p>
          </div>
        `,
      }).catch((err: unknown) => console.error("Welcome email error:", err));
    }

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

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.APP_BASE_URL || "http://localhost:3000";

// POST /auth/forgot-password — generates a secure token, emails a reset link
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Always return 200 to avoid email enumeration
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(200).json({ success: true, message: "If that email is registered, you'll receive a reset link shortly." });
    }

    // Generate a cryptographically secure token (48 hex chars = 24 bytes)
    const token = crypto.randomBytes(24).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });

    const resetLink = `${APP_URL}/reset-password?token=${token}`;

    await resend.emails.send({
      from: process.env.EMAIL_FROM_ORDERS || "onboarding@resend.dev",
      to: user.email,
      subject: "Reset your Bring Me Food password",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
          <h2 style="color:#1a2e25">Reset your password</h2>
          <p>We received a request to reset your password. Click the link below — it expires in 1 hour.</p>
          <a href="${resetLink}" style="display:inline-block;margin:24px 0;padding:12px 24px;background:#1a2e25;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">
            Reset Password
          </a>
          <p style="color:#666;font-size:14px">If you didn't request this, you can safely ignore this email.</p>
          <p style="color:#999;font-size:12px">Link: ${resetLink}</p>
        </div>
      `,
    });

    return res.status(200).json({ success: true, message: "If that email is registered, you'll receive a reset link shortly." });
  } catch (err: any) {
    console.error("forgot-password error", err);
    return res.status(500).json({ success: false, message: "Failed to send reset email" });
  }
};

// POST /auth/reset-password — validates token, sets new password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: "Token and new password are required" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }, // token not expired
      },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Reset link is invalid or has expired. Please request a new one." });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExpiry: null },
    });

    return res.status(200).json({ success: true, message: "Password reset successfully. You can now sign in." });
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
