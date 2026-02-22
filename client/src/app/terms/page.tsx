import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — Bring Me Food",
  description: "Terms and conditions for using Bring Me Food.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-xl font-semibold text-gray-900">{title}</h2>
      <div className="space-y-3 text-gray-600 leading-relaxed">{children}</div>
    </section>
  );
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Terms of Service</h1>
          <p className="mb-8 text-sm text-gray-400">Last updated: February 2026</p>

          <p className="mb-8 text-gray-600 leading-relaxed">
            Welcome to Bring Me Food ("we", "our", or "us"). By using our platform, you agree to
            these Terms of Service. Please read them carefully before placing an order or registering
            as a chef.
          </p>

          <Section title="1. Who We Are">
            <p>
              Bring Me Food is an online marketplace that connects home cooks ("Chefs") with
              customers looking for home-cooked meals. We are based in Australia and operate
              in accordance with Australian Consumer Law.
            </p>
          </Section>

          <Section title="2. Using the Platform">
            <p>To place an order or register as a chef, you must:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Be 18 years of age or older</li>
              <li>Provide accurate contact and delivery information</li>
              <li>Not use the platform for any unlawful purpose</li>
            </ul>
            <p>
              Guest orders (no account required) are permitted. Registered accounts give access
              to order history and chef dashboards.
            </p>
          </Section>

          <Section title="3. Chefs and Food Safety">
            <p>
              Chefs on our platform are independent home cooks, not employees of Bring Me Food.
              By listing on our platform, chefs confirm that they:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Comply with all applicable Australian food safety regulations</li>
              <li>Accurately describe their meals, including allergen information</li>
              <li>Prepare food in a safe and hygienic environment</li>
              <li>Hold any required licences or permits for food preparation in their state or territory</li>
            </ul>
            <p>
              Bring Me Food does not inspect chef kitchens and is not responsible for the quality
              or safety of food prepared by chefs. Customers order at their own risk and should
              contact chefs directly with any dietary concerns.
            </p>
          </Section>

          <Section title="4. Orders and Payments">
            <p>
              When you place an order, you are entering into an agreement with the chef, not
              with Bring Me Food. We provide the platform and payment infrastructure only.
            </p>
            <p>
              Payments are processed securely through Stripe. By providing payment details, you
              agree to Stripe's Terms of Service. Bring Me Food does not store your card details.
            </p>
            <p>
              Orders are subject to chef availability. If a chef cannot fulfil an order, you will
              be notified and any payment will be refunded promptly.
            </p>
          </Section>

          <Section title="5. Cancellations and Refunds">
            <p>
              Cancellation policies are set by individual chefs. Generally:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Orders cancelled before the chef begins preparation may receive a full refund</li>
              <li>Orders cancelled after preparation has started may receive a partial refund at the chef's discretion</li>
              <li>Refunds for quality issues should be raised with the chef first, and then with us at support@bringmefood.app</li>
            </ul>
          </Section>

          <Section title="6. Intellectual Property">
            <p>
              Meal photos, descriptions, and chef profiles belong to the respective chefs.
              Platform design, code, and branding belong to Bring Me Food. You may not reproduce
              or redistribute any content without permission.
            </p>
          </Section>

          <Section title="7. Limitation of Liability">
            <p>
              To the extent permitted by law, Bring Me Food's liability for any claim related to
              our platform is limited to the amount you paid for the order in question.
              We are not liable for indirect, incidental, or consequential damages.
            </p>
          </Section>

          <Section title="8. Changes to These Terms">
            <p>
              We may update these terms from time to time. Continued use of the platform after
              changes constitutes acceptance. We'll notify registered users of material changes
              by email.
            </p>
          </Section>

          <Section title="9. Contact Us">
            <p>
              Questions about these terms? Email us at{" "}
              <a href="mailto:support@bringmefood.app" className="text-orange-600 hover:underline">
                support@bringmefood.app
              </a>
            </p>
          </Section>

          <div className="mt-8 border-t pt-6 text-sm text-gray-400">
            <Link href="/privacy" className="text-orange-600 hover:underline">
              Privacy Policy
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
