import { verify, decode, JwtPayload } from "jsonwebtoken";
import axios from "axios";

interface CognitoJwtPayload extends JwtPayload {
  sub: string;
  email: string;
  email_verified: boolean;
  "cognito:username": string;
  "custom:userType"?: "chef" | "customer";
  name?: string; // Full name
  given_name?: string; // First name
  family_name?: string; // Last name
}

interface JwksKey {
  alg: string;
  kty: string;
  use: string;
  n: string;
  e: string;
  kid: string;
  x5t: string;
  x5c: string[];
}

interface JwksResponse {
  keys: JwksKey[];
}

// Cache for JWKS keys (expires every 24 hours)
let jwksCache: Map<string, JwksKey> | null = null;
let jwtsCacheExpire = 0;
const JWKS_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetch and cache JWKS public keys from Cognito
 * These keys are used to verify JWT signatures
 */
async function getJwksKeys(): Promise<Map<string, JwksKey>> {
  const now = Date.now();

  // Return cached keys if still valid
  if (jwksCache && jwtsCacheExpire > now) {
    return jwksCache;
  }

  try {
    const jwksUri = process.env.COGNITO_JWKS_URI;
    if (!jwksUri) {
      throw new Error("COGNITO_JWKS_URI environment variable not set");
    }

    const response = await axios.get<JwksResponse>(jwksUri);
    const keys = new Map<string, JwksKey>();

    response.data.keys.forEach((key) => {
      keys.set(key.kid, key);
    });

    // Update cache
    jwksCache = keys;
    jwtsCacheExpire = now + JWKS_CACHE_TTL;

    return keys;
  } catch (error) {
    console.error("Failed to fetch JWKS keys:", error);
    throw new Error("Unable to verify token: Could not fetch public keys");
  }
}

/**
 * Convert JWKS key to PEM format for verification
 * This allows using Node's verify() function with RSA keys from Cognito
 */
function jwkToPem(key: JwksKey): string {
  const crypto = require("crypto");

  // Create a public key object from the JWK parameters
  const publicKeyObject = crypto.createPublicKey({
    key: {
      kty: "RSA",
      n: key.n,
      e: key.e,
    },
    format: "jwk",
  });

  // Export as PEM format
  return publicKeyObject.export({ format: "pem", type: "spki" });
}

/**
 * Verify Cognito JWT token
 * Returns the decoded token payload if valid
 */
export async function verifyCognitoToken(token: string): Promise<CognitoJwtPayload> {
  try {
    // Decode without verifying first to check structure
    const decoded = decode(token, { complete: true });

    if (!decoded || !decoded.header || !decoded.payload) {
      throw new Error("Invalid token structure");
    }

    const header = decoded.header as { kid: string; alg: string };
    const kidToken = header.kid;

    if (!kidToken) {
      throw new Error("Token missing key ID");
    }

    // Get JWKS keys
    const keys = await getJwksKeys();
    const key = keys.get(kidToken);

    if (!key) {
      throw new Error(`Key ${kidToken} not found in JWKS`);
    }

    // Convert JWK to PEM format
    const pem = jwkToPem(key);

    // Verify the token
    const payload = verify(token, pem, {
      algorithms: ["RS256"],
    }) as CognitoJwtPayload;

    // Additional validation
    if (!payload.sub || !payload.email) {
      throw new Error("Token missing required claims (sub, email)");
    }

    return payload;
  } catch (error: any) {
    console.error("Token verification failed:", error.message);
    throw new Error(`Token verification failed: ${error.message}`);
  }
}

/**
 * Extract user info from verified JWT
 */
export function extractUserFromToken(payload: CognitoJwtPayload) {
  return {
    cognitoId: payload.sub,
    email: payload.email,
    emailVerified: payload.email_verified || false,
    username: payload["cognito:username"],
    userType: payload["custom:userType"] || "customer", // Default to customer if not specified
    fullName: payload.name || "", // Full name from Cognito
    firstName: payload.given_name || "", // First name from Cognito
    lastName: payload.family_name || "", // Last name from Cognito
  };
}
