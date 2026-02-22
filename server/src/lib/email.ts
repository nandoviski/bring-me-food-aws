import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");

// Configurable sender addresses — override in .env for your verified domain
const SENDER_MENU = process.env.EMAIL_FROM_MENU || "menu@bringmefood.app";
const SENDER_ORDERS = process.env.EMAIL_FROM_ORDERS || "orders@bringmefood.app";

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

export interface OrderConfirmationEmailData {
  guestName: string;
  chefName: string;
  chefPhone?: string;
  orderId: string;
  total: number;
  deliveryFee: number;
  deliveryAddress: string;
  notes?: string;
  payLink?: string;       // Stripe pay-later link e.g. /order/pay/:id
  trackingLink?: string;  // Order tracking page e.g. /order/track/:id
  items: Array<{ name: string; quantity: number; price: number }>;
}

function buildOrderConfirmationHtml(data: OrderConfirmationEmailData): string {
  const grandTotal = data.total + data.deliveryFee;
  const itemsHtml = data.items.map((item) => `
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #f5f5f5; font-size: 14px; color: #333;">
        ${item.name} × ${item.quantity}
      </td>
      <td style="padding: 8px 0; border-bottom: 1px solid #f5f5f5; font-size: 14px; color: #333; text-align: right;">
        $${(item.price * item.quantity).toFixed(2)}
      </td>
    </tr>
  `).join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>Order Confirmed – Bring Me Food</title></head>
<body style="margin: 0; padding: 0; background-color: #f9f9f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; padding: 32px 16px;">
    <tr>
      <td>
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background: linear-gradient(135deg, #e85d04 0%, #dc2f02 100%); padding: 28px 40px; text-align: center;">
              <p style="margin: 0 0 4px; font-size: 13px; color: rgba(255,255,255,0.8);">Your order is in</p>
              <h1 style="margin: 0; font-size: 26px; color: #ffffff; font-weight: 700;">Order Confirmed 🎉</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 40px 0;">
              <p style="margin: 0 0 16px; font-size: 15px; color: #333;">Hi ${data.guestName},</p>
              <p style="margin: 0 0 16px; font-size: 15px; color: #555;">
                Your order with <strong>${data.chefName}</strong> has been received. Complete your payment below to confirm your spot.
              </p>
              <p style="margin: 0 0 24px; font-size: 13px; color: #888;">Order ID: <code style="background: #f5f5f5; padding: 2px 6px; border-radius: 4px;">${data.orderId.slice(0, 8)}</code></p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemsHtml}
                <tr>
                  <td style="padding: 8px 0; font-size: 14px; color: #666;">Delivery fee</td>
                  <td style="padding: 8px 0; font-size: 14px; color: #666; text-align: right;">$${data.deliveryFee.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0 0; font-size: 16px; font-weight: 700; color: #1a1a1a; border-top: 2px solid #eee;">Total</td>
                  <td style="padding: 12px 0 0; font-size: 16px; font-weight: 700; color: #e85d04; text-align: right; border-top: 2px solid #eee;">$${grandTotal.toFixed(2)}</td>
                </tr>
              </table>
              ${data.deliveryAddress ? `<p style="margin: 16px 0 0; font-size: 13px; color: #888;">📍 ${data.deliveryAddress}</p>` : ""}
              ${data.notes ? `<p style="margin: 8px 0 0; font-size: 13px; color: #888;">📝 Note: ${data.notes}</p>` : ""}
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px; text-align: center; background: #fff8f4;">
              ${data.payLink ? `
              <a href="${data.payLink}" style="display: inline-block; background: linear-gradient(135deg, #e85d04 0%, #dc2f02 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 36px; border-radius: 8px; letter-spacing: 0.3px; margin-bottom: 12px;">
                💳 Pay Now — $${(data.total + data.deliveryFee).toFixed(2)}
              </a>
              <p style="margin: 0 0 12px; font-size: 12px; color: #aaa;">Secure payment powered by Stripe</p>` : ""}
              ${data.trackingLink ? `
              <a href="${data.trackingLink}" style="display: inline-block; border: 2px solid #e85d04; color: #e85d04; text-decoration: none; font-size: 13px; font-weight: 600; padding: 10px 24px; border-radius: 8px;">
                📦 Track your order
              </a>` : ""}
            </td>
          </tr>
          ${data.chefPhone ? `
          <tr>
            <td style="background: #fff8f4; border-top: 1px solid #ffe0cc; padding: 20px 40px;">
              <p style="margin: 0; font-size: 13px; color: #888;">The chef may reach out to you at: <strong style="color: #333;">${data.chefPhone}</strong></p>
            </td>
          </tr>` : ""}
          <tr>
            <td style="background: #f5f5f5; padding: 20px 40px; text-align: center; border-top: 1px solid #eee;">
              <p style="margin: 0; font-size: 12px; color: #999;">Bring Me Food · Questions? Contact your chef directly.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export interface NewOrderNotificationData {
  chefName: string;
  chefEmail: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  total: number;
  deliveryFee: number;
  deliveryAddress: string;
  notes?: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  dashboardLink: string;
  paymentStatus?: "PENDING" | "PAID" | "REFUNDED" | "FAILED"; // Set after Stripe session is created
}

function buildNewOrderNotificationHtml(data: NewOrderNotificationData): string {
  const grandTotal = data.total + data.deliveryFee;
  const itemsHtml = data.items.map((item) => `
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #f5f5f5; font-size: 14px; color: #333;">
        ${item.name} × ${item.quantity}
      </td>
      <td style="padding: 8px 0; border-bottom: 1px solid #f5f5f5; font-size: 14px; color: #333; text-align: right;">
        $${(item.price * item.quantity).toFixed(2)}
      </td>
    </tr>
  `).join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>New Order – Bring Me Food</title></head>
<body style="margin: 0; padding: 0; background-color: #f9f9f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; padding: 32px 16px;">
    <tr>
      <td>
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 28px 40px; text-align: center;">
              <p style="margin: 0 0 4px; font-size: 13px; color: rgba(255,255,255,0.8);">🔔 You have a</p>
              <h1 style="margin: 0; font-size: 26px; color: #ffffff; font-weight: 700;">New Order!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 40px 0;">
              <p style="margin: 0 0 8px; font-size: 15px; color: #333;">Hi ${data.chefName},</p>
              <p style="margin: 0 0 20px; font-size: 15px; color: #555;">You have a new order from <strong>${data.customerName}</strong>.</p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8fffe; border: 1px solid #d1fae5; border-radius: 8px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0 0 4px; font-size: 13px; color: #666;">Customer: <strong style="color: #1a1a1a;">${data.customerName}</strong></p>
                    <p style="margin: 0 0 4px; font-size: 13px; color: #666;">Phone: <strong style="color: #1a1a1a;">${data.customerPhone}</strong></p>
                    ${data.customerEmail ? `<p style="margin: 0 0 4px; font-size: 13px; color: #666;">Email: <strong style="color: #1a1a1a;">${data.customerEmail}</strong></p>` : ""}
                    ${data.deliveryAddress ? `<p style="margin: 0 0 4px; font-size: 13px; color: #666;">Delivery to: <strong style="color: #1a1a1a;">${data.deliveryAddress}</strong></p>` : ""}
                    ${data.notes ? `<p style="margin: 0; font-size: 13px; color: #666;">Notes: <strong style="color: #1a1a1a;">${data.notes}</strong></p>` : ""}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemsHtml}
                <tr>
                  <td style="padding: 8px 0; font-size: 14px; color: #666;">Delivery fee</td>
                  <td style="padding: 8px 0; font-size: 14px; color: #666; text-align: right;">$${data.deliveryFee.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0 0; font-size: 16px; font-weight: 700; color: #1a1a1a; border-top: 2px solid #eee;">Total</td>
                  <td style="padding: 12px 0 0; font-size: 16px; font-weight: 700; color: #16a34a; text-align: right; border-top: 2px solid #eee;">$${grandTotal.toFixed(2)}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 40px 32px; text-align: center;">
              <a href="${data.dashboardLink}" style="display: inline-block; background: #16a34a; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 12px 32px; border-radius: 8px;">
                View in Dashboard →
              </a>
              <p style="margin: 12px 0 0; font-size: 12px; color: #888;">
                Order ID: ${data.orderId.slice(0, 8)}
              </p>
            </td>
          </tr>
          <tr>
            <td style="background: #f5f5f5; padding: 16px 40px; text-align: center; border-top: 1px solid #eee;">
              <p style="margin: 0; font-size: 12px; color: #999;">Bring Me Food · Contact the customer directly to confirm and arrange payment.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendNewOrderNotification(
  data: NewOrderNotificationData,
): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_placeholder") {
    console.warn("[email] RESEND_API_KEY not set — skipping new order notification");
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  try {
    await resend.emails.send({
      from: `Bring Me Food Orders <${SENDER_ORDERS}>`,
      to: data.chefEmail,
      subject: `🆕 New order from ${data.customerName} — $${(data.total + data.deliveryFee).toFixed(2)}`,
      html: buildNewOrderNotificationHtml(data),
    });
    return { success: true };
  } catch (err: any) {
    console.error("[email] New order notification failed:", err);
    return { success: false, error: err.message };
  }
}

export async function sendOrderConfirmationEmail(
  to: string,
  data: OrderConfirmationEmailData,
): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_placeholder") {
    console.warn("[email] RESEND_API_KEY not set — skipping order confirmation email");
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  try {
    await resend.emails.send({
      from: `Bring Me Food <${SENDER_ORDERS}>`,
      to,
      subject: `✅ Your order with ${data.chefName} is confirmed`,
      html: buildOrderConfirmationHtml(data),
    });
    return { success: true };
  } catch (err: any) {
    console.error("[email] Order confirmation failed:", err);
    return { success: false, error: err.message };
  }
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
      from: `${data.chefName} via Bring Me Food <${SENDER_MENU}>`,
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

export interface OrderStatusUpdateEmailData {
  customerName: string;
  chefName: string;
  chefPhone?: string;
  orderId: string;
  newStatus: "CONFIRMED" | "DELIVERED" | "CANCELLED";
  total: number;
  trackingLink?: string;
}

function buildOrderStatusUpdateHtml(data: OrderStatusUpdateEmailData): string {
  const statusConfig = {
    CONFIRMED: {
      emoji: "✅",
      headline: "Order Confirmed!",
      message: `Great news! <strong>${data.chefName}</strong> has confirmed your order. They'll start preparing your food soon.`,
      color: "#16a34a",
    },
    DELIVERED: {
      emoji: "🎉",
      headline: "Order Delivered!",
      message: `Your order from <strong>${data.chefName}</strong> has been marked as delivered. Enjoy your meal!`,
      color: "#f97316",
    },
    CANCELLED: {
      emoji: "❌",
      headline: "Order Cancelled",
      message: `Your order with <strong>${data.chefName}</strong> has been cancelled. If you paid by card, your refund will appear within 5–10 business days.`,
      color: "#dc2626",
    },
  };

  const cfg = statusConfig[data.newStatus];

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>${cfg.headline} – Bring Me Food</title></head>
<body style="margin:0;padding:0;background:#f9f9f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;padding:32px 16px;">
    <tr><td>
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:${cfg.color};padding:28px 40px;text-align:center;">
            <p style="margin:0 0 4px;font-size:28px;">${cfg.emoji}</p>
            <h1 style="margin:0;font-size:24px;color:#fff;font-weight:700;">${cfg.headline}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 40px;">
            <p style="margin:0 0 16px;font-size:15px;color:#333;">Hi ${data.customerName},</p>
            <p style="margin:0 0 16px;font-size:15px;color:#555;">${cfg.message}</p>
            <p style="margin:0;font-size:13px;color:#999;">Order ID: <code style="background:#f5f5f5;padding:2px 6px;border-radius:4px;">${data.orderId.slice(0, 8).toUpperCase()}</code></p>
            ${data.chefPhone && data.newStatus === "CONFIRMED" ? `
            <p style="margin:16px 0 0;font-size:13px;color:#888;">
              Questions? Contact ${data.chefName} directly: <strong>${data.chefPhone}</strong>
            </p>` : ""}
          </td>
        </tr>
        ${data.trackingLink && data.newStatus !== "CANCELLED" ? `
        <tr>
          <td style="padding:0 40px 28px;text-align:center;">
            <a href="${data.trackingLink}" style="display:inline-block;background:${cfg.color};color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;">
              View Order Details →
            </a>
          </td>
        </tr>` : ""}
        <tr>
          <td style="background:#f5f5f5;padding:16px 40px;text-align:center;border-top:1px solid #eee;">
            <p style="margin:0;font-size:12px;color:#999;">Bring Me Food · Thanks for supporting local home cooks!</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendOrderStatusUpdateEmail(
  to: string,
  data: OrderStatusUpdateEmailData,
): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_placeholder") {
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  const subjects: Record<string, string> = {
    CONFIRMED: `✅ ${data.chefName} confirmed your order!`,
    DELIVERED: `🎉 Your order has been delivered — enjoy!`,
    CANCELLED: `Your order has been cancelled`,
  };

  try {
    await resend.emails.send({
      from: `Bring Me Food Orders <${SENDER_ORDERS}>`,
      to,
      subject: subjects[data.newStatus] ?? `Order update from ${data.chefName}`,
      html: buildOrderStatusUpdateHtml(data),
    });
    return { success: true };
  } catch (err: any) {
    console.error("[email] Order status update email failed:", err);
    return { success: false, error: err.message };
  }
}
