import twilio from "twilio";

/**
 * Twilio SMS client — gracefully skips if env vars are not set.
 * Required env vars:
 *   TWILIO_ACCOUNT_SID  — from console.twilio.com
 *   TWILIO_AUTH_TOKEN   — from console.twilio.com
 *   TWILIO_FROM_NUMBER  — your Twilio phone number (E.164, e.g. +61298765432)
 *                         OR a Messaging Service SID (starts with MG...)
 */

const SID = process.env.TWILIO_ACCOUNT_SID;
const TOKEN = process.env.TWILIO_AUTH_TOKEN;
const FROM = process.env.TWILIO_FROM_NUMBER;

let client: ReturnType<typeof twilio> | null = null;

function getClient(): ReturnType<typeof twilio> | null {
  if (client) return client;
  if (SID && TOKEN && FROM) {
    client = twilio(SID, TOKEN);
    return client;
  }
  return null;
}

export function isSmsConfigured(): boolean {
  return !!(SID && TOKEN && FROM);
}

export interface MenuSmsData {
  chefName: string;
  chefUsername: string;
  menuName: string;
  startDate: string;
  endDate: string;
  orderTo?: string;
  orderLink: string;
  meals: Array<{ name: string; price: number }>;
}

/**
 * Build a concise SMS body for menu distribution.
 * Kept under 320 chars to avoid multipart split costs.
 */
function buildMenuSmsBody(data: MenuSmsData): string {
  const mealList = data.meals
    .slice(0, 4) // cap at 4 meals to stay concise
    .map((m) => `• ${m.name} — $${m.price.toFixed(2)}`)
    .join("\n");

  const deadlineText = data.orderTo
    ? `Order by ${data.orderTo}.`
    : `Available ${data.startDate}–${data.endDate}.`;

  return [
    `🍽️ ${data.chefName}'s weekly menu is ready!`,
    "",
    `${data.menuName}`,
    mealList,
    "",
    deadlineText,
    `👉 ${data.orderLink}`,
    "",
    "Reply STOP to unsubscribe from SMS.",
  ].join("\n");
}

export async function sendMenuSms(
  to: string,
  data: MenuSmsData,
): Promise<{ success: boolean; error?: string }> {
  const twClient = getClient();

  if (!twClient || !FROM) {
    console.warn("[sms] Twilio not configured — skipping SMS to", to);
    return { success: false, error: "Twilio not configured" };
  }

  try {
    // FROM can be a phone number (+61...) or a Messaging Service SID (MG...)
    const params: Record<string, string> = {
      to,
      body: buildMenuSmsBody(data),
    };

    if (FROM.startsWith("MG")) {
      params.messagingServiceSid = FROM;
    } else {
      params.from = FROM;
    }

    await twClient.messages.create(params as any);
    return { success: true };
  } catch (err: any) {
    console.error("[sms] Failed to send to", to, err?.message ?? err);
    return { success: false, error: err?.message ?? "Unknown error" };
  }
}
