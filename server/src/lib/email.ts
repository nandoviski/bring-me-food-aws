import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");

export interface MenuEmailData {
  chefName: string;
  chefUsername: string;
  menuName: string;
  menuDescription: string;
  startDate: string;
  endDate: string;
  orderFrom?: string;
  orderTo?: string;
  meals: Array<{
    name: string;
    description: string;
    price: number;
    allergens: string[];
    ingredients: string[];
    imageUrl?: string;
  }>;
  orderLink: string;
  unsubscribeLink: string;
}

function buildMenuEmailHtml(data: MenuEmailData): string {
  const { chefName, menuName, menuDescription, startDate, endDate, orderFrom, orderTo, meals, orderLink, unsubscribeLink } = data;

  const mealsHtml = meals.map((meal) => `
    <tr>
      <td style="padding: 16px 0; border-bottom: 1px solid #f0f0f0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <h3 style="margin: 0 0 4px; font-size: 16px; color: #1a1a1a;">${meal.name}</h3>
              <p style="margin: 0 0 8px; font-size: 14px; color: #666;">${meal.description}</p>
              ${meal.allergens.length > 0 ? `<p style="margin: 0 0 4px; font-size: 12px; color: #999;">⚠️ Allergens: ${meal.allergens.join(", ")}</p>` : ""}
            </td>
            <td style="text-align: right; vertical-align: top; white-space: nowrap; padding-left: 16px;">
              <span style="font-size: 18px; font-weight: bold; color: #e85d04;">$${meal.price.toFixed(2)}</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${menuName} – ${chefName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f9f9f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; padding: 32px 16px;">
    <tr>
      <td>
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #e85d04 0%, #dc2f02 100%); padding: 32px 40px; text-align: center;">
              <p style="margin: 0 0 4px; font-size: 13px; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 1px;">Weekly Menu from</p>
              <h1 style="margin: 0; font-size: 28px; color: #ffffff; font-weight: 700;">${chefName}</h1>
            </td>
          </tr>

          <!-- Menu info -->
          <tr>
            <td style="padding: 32px 40px 0;">
              <h2 style="margin: 0 0 8px; font-size: 22px; color: #1a1a1a;">${menuName}</h2>
              <p style="margin: 0 0 16px; font-size: 15px; color: #555;">${menuDescription}</p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background: #fff8f4; border: 1px solid #ffe0cc; border-radius: 8px; padding: 12px 20px;">
                    <p style="margin: 0; font-size: 13px; color: #666;">📅 Available: <strong style="color: #1a1a1a;">${startDate} – ${endDate}</strong></p>
                    ${orderFrom && orderTo ? `<p style="margin: 4px 0 0; font-size: 13px; color: #666;">🕐 Order window: <strong style="color: #1a1a1a;">${orderFrom} – ${orderTo}</strong></p>` : ""}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Meals -->
          <tr>
            <td style="padding: 24px 40px 0;">
              <h3 style="margin: 0 0 16px; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; color: #999;">This Week's Menu</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${mealsHtml}
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding: 32px 40px; text-align: center;">
              <a href="${orderLink}" style="display: inline-block; background: #e85d04; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 14px 40px; border-radius: 8px;">
                Order Now →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f5f5f5; padding: 20px 40px; text-align: center; border-top: 1px solid #eee;">
              <p style="margin: 0; font-size: 12px; color: #999;">
                You're receiving this because you subscribed to ${chefName}'s weekly menu.<br />
                <a href="${unsubscribeLink}" style="color: #e85d04; text-decoration: none;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendMenuEmail(
  to: string,
  data: MenuEmailData,
): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_placeholder") {
    console.warn("[email] RESEND_API_KEY not set — skipping email send");
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  try {
    await resend.emails.send({
      from: `${data.chefName} via Bring Me Food <menu@bringmefood.app>`,
      to,
      subject: `🍽️ ${data.menuName} is here — order by ${data.orderTo ?? data.endDate}`,
      html: buildMenuEmailHtml(data),
    });
    return { success: true };
  } catch (err: any) {
    console.error("[email] Failed to send:", err);
    return { success: false, error: err.message };
  }
}
