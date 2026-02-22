import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Bring Me Food",
  description: "How Bring Me Food collects, uses, and protects your personal information.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-xl font-semibold text-gray-900">{title}</h2>
      <div className="space-y-3 text-gray-600 leading-relaxed">{children}</div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="mb-8 text-sm text-gray-400">Last updated: February 2026</p>

          <p className="mb-8 text-gray-600 leading-relaxed">
            Bring Me Food ("we", "our", or "us") is committed to protecting your privacy. This
            policy explains what personal information we collect, how we use it, and your rights
            under the Australian Privacy Act 1988.
          </p>

          <Section title="1. Information We Collect">
            <p><strong>When you place an order (guest):</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Name, phone number, email address</li>
              <li>Delivery address</li>
              <li>Order details and payment confirmation (card details handled by Stripe)</li>
            </ul>
            <p className="mt-3"><strong>When you create an account:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Email address and password (hashed)</li>
              <li>Profile information (for chefs: business name, bio, location, specialties)</li>
              <li>Order history</li>
            </ul>
            <p className="mt-3"><strong>Automatically collected:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Server logs (IP address, browser type, pages visited)</li>
              <li>Usage data to improve our platform</li>
            </ul>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>We use your personal information to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Process and fulfil your orders</li>
              <li>Send order confirmation, status updates, and receipts</li>
              <li>Notify chefs of new orders</li>
              <li>Send weekly menu emails (if you subscribed to a chef)</li>
              <li>Improve our platform and services</li>
              <li>Respond to your enquiries and provide customer support</li>
              <li>Comply with legal obligations</li>
            </ul>
            <p>We do not sell your personal information to third parties.</p>
          </Section>

          <Section title="3. Sharing Your Information">
            <p>We share personal information only in limited circumstances:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>With the chef:</strong> Your name, phone, delivery address, and order
                details are shared with the chef to fulfil your order.
              </li>
              <li>
                <strong>With Stripe:</strong> Payment processing is handled by Stripe. We do not
                store card numbers. See{" "}
                <a href="https://stripe.com/au/privacy" className="text-orange-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  Stripe's Privacy Policy
                </a>.
              </li>
              <li>
                <strong>With service providers:</strong> We use trusted providers (e.g., Resend
                for emails, AWS for file storage) who are bound by confidentiality obligations.
              </li>
              <li>
                <strong>When required by law:</strong> We may disclose information if required by
                a court order or other legal obligation.
              </li>
            </ul>
          </Section>

          <Section title="4. Data Retention">
            <p>
              We retain your personal information for as long as your account is active or as
              needed to provide services. Order records are kept for 7 years for tax and legal
              purposes. You may request deletion of your account at any time.
            </p>
          </Section>

          <Section title="5. Your Rights">
            <p>Under the Australian Privacy Act, you have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access the personal information we hold about you</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your account and data</li>
              <li>Opt out of marketing communications</li>
              <li>Lodge a complaint with the Office of the Australian Information Commissioner (OAIC)</li>
            </ul>
            <p>
              To exercise these rights, contact us at{" "}
              <a href="mailto:privacy@bringmefood.app" className="text-orange-600 hover:underline">
                privacy@bringmefood.app
              </a>
            </p>
          </Section>

          <Section title="6. Cookies and Tracking">
            <p>
              We use session cookies to keep you logged in. We do not use third-party advertising
              trackers. Our analytics (if any) are privacy-respecting and aggregate-only.
            </p>
          </Section>

          <Section title="7. Security">
            <p>
              We use industry-standard security measures including HTTPS, password hashing (bcrypt),
              and JWT-based authentication. However, no system is 100% secure — we encourage you
              to use a strong, unique password.
            </p>
          </Section>

          <Section title="8. Children">
            <p>
              Our platform is not intended for children under 18. We do not knowingly collect
              personal information from minors.
            </p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p>
              We may update this privacy policy from time to time. We will notify registered users
              of material changes by email. Continued use of the platform constitutes acceptance.
            </p>
          </Section>

          <Section title="10. Contact">
            <p>
              Questions or concerns about your privacy? Contact us:
            </p>
            <ul className="list-none space-y-1">
              <li>📧 <a href="mailto:privacy@bringmefood.app" className="text-orange-600 hover:underline">privacy@bringmefood.app</a></li>
              <li>📍 Sydney, New South Wales, Australia</li>
            </ul>
          </Section>

          <div className="mt-8 border-t pt-6 text-sm text-gray-400">
            <Link href="/terms" className="text-orange-600 hover:underline">
              Terms of Service
            </Link>
            {" · "}
            <Link href="/" className="text-gray-500 hover:underline">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
