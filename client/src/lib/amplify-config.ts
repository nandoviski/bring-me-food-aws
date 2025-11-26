import { Amplify } from "aws-amplify";
import {
  signUp,
  signIn,
  confirmSignUp,
  resendSignUpCode,
  getCurrentUser,
  fetchAuthSession,
  signOut,
} from "@aws-amplify/auth";

/**
 * Configure AWS Amplify with Cognito credentials
 * This happens synchronously at module load time on the client
 */
export function initializeAmplify() {
  // Only configure if we're in the browser
  if (typeof window === "undefined") return;

  try {
    const userPoolId = process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID;
    const appClientId = process.env.NEXT_PUBLIC_AWS_COGNITO_APP_CLIENT_ID;

    if (!userPoolId || !appClientId) {
      console.error(
        "Missing Cognito configuration:",
        "NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID or NEXT_PUBLIC_AWS_COGNITO_APP_CLIENT_ID",
      );
      return;
    }

    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId,
          userPoolClientId: appClientId,
        },
      },
    });

    console.log("Amplify configured successfully with UserPool:", userPoolId);
  } catch (error) {
    console.error("Failed to configure Amplify:", error);
  }
}

// Initialize Amplify immediately when this module loads
initializeAmplify();

export type SignUpInput = {
  email: string;
  username: string;
  password: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  userType?: "chef" | "customer";
};

export type SignUpResult = {
  userSub: string;
};

export type SignInInput = {
  emailOrUsername: string;
  password: string;
};

export type SignInResult = {
  isSignedIn: boolean;
  nextStep: {
    signInStep: string;
    additionalDetails?: Record<string, unknown>;
  };
};

/**
 * Sign up a new user with Cognito
 * Sends verification email automatically
 * Note: Cognito username is set to the user's chosen username (not email)
 */
export async function handleSignUp(input: SignUpInput): Promise<SignUpResult> {
  try {
    const result = await signUp({
      username: input.username,
      password: input.password,
      options: {
        userAttributes: {
          email: input.email,
          name: input.fullName, // Required by Cognito
          preferred_username: input.username,
          given_name: input.firstName || input.fullName.split(" ")[0] || "",
          family_name:
            input.lastName ||
            input.fullName.split(" ").slice(1).join(" ") ||
            "",
          "custom:userType": input.userType || "customer", // Store user type as custom attribute
        },
      },
    });

    return {
      userSub: result.userId || "",
    };
  } catch (error) {
    console.error("Sign up error:", error);
    throw error;
  }
}

/**
 * Confirm user email with verification code
 * Called after user receives confirmation email
 * Note: username parameter must be the same username used during sign-up, not email
 */
export async function handleConfirmSignUp(
  username: string,
  code: string,
): Promise<void> {
  try {
    await confirmSignUp({
      username: username,
      confirmationCode: code,
    });
  } catch (error) {
    console.error("Confirm sign up error:", error);
    throw error;
  }
}

/**
 * Sign in user with username or email and password
 * Returns session tokens for API access
 * Cognito allows login with either the username or email (if configured with email alias)
 */
export async function handleSignIn(input: SignInInput): Promise<SignInResult> {
  try {
    const result = await signIn({
      username: input.emailOrUsername,
      password: input.password,
    });

    return {
      isSignedIn: result.isSignedIn,
      nextStep: result.nextStep,
    };
  } catch (error: any) {
    // Provide helpful error messages for common Cognito errors
    const message = error?.message || error?.toString() || "Sign in failed";

    // Map common Cognito error codes to user-friendly messages
    if (message.includes("User is not confirmed")) {
      console.error("Sign in error: User not confirmed", error);
      throw new Error(
        "Email not confirmed. Please check your inbox for a verification email and confirm your email before signing in.",
      );
    }

    if (message.includes("Incorrect username or password")) {
      console.error("Sign in error: Invalid credentials", error);
      throw new Error(
        "Incorrect email/username or password. Please try again.",
      );
    }

    if (message.includes("User does not exist")) {
      console.error("Sign in error: User not found", error);
      throw new Error("No account found with that email or username.");
    }

    if (message.includes("User account is disabled")) {
      console.error("Sign in error: Account disabled", error);
      throw new Error(
        "Your account has been disabled. Please contact support.",
      );
    }

    // For any other error, provide the original message
    console.error("Sign in error:", error);
    throw new Error(message);
  }
}

/**
 * Get current authenticated user
 * Returns null if not authenticated
 */
export async function handleGetCurrentUser() {
  try {
    return await getCurrentUser();
  } catch (error) {
    // User not authenticated
    return null;
  }
}

/**
 * Get current user's ID token
 * This token is sent with API requests for authentication
 */
export async function getIdToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString() || null;
  } catch (error) {
    console.error("Get ID token error:", error);
    return null;
  }
}

/**
 * Get current user's access token
 * More commonly used for API access
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.accessToken?.toString() || null;

    if (!token) {
      console.warn("No access token available. Session state:", {
        hasTokens: !!session.tokens,
        hasAccessToken: !!session.tokens?.accessToken,
      });
    }

    return token;
  } catch (error) {
    console.error("Get access token error:", error);
    return null;
  }
}

/**
 * Sign out current user
 * Clears session and tokens
 */
export async function handleSignOut(): Promise<void> {
  try {
    await signOut();
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
}

/**
 * Resend confirmation code to user's email
 * Called if user didn't receive initial verification email
 * Note: username parameter must be the same username used during sign-up, not email
 */
export async function handleResendSignUpCode(username: string): Promise<void> {
  try {
    await resendSignUpCode({
      username: username,
    });
  } catch (error) {
    console.error("Resend confirmation code error:", error);
    throw error;
  }
}
