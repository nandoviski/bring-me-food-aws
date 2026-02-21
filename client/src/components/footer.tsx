import Link from "next/link";
import { ChefHat, Mail, Smartphone, CreditCard } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="container-custom py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <ChefHat className="h-6 w-6 text-orange-400" />
              <span className="text-xl font-bold">Bring Me Food</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed max-w-sm">
              The easiest way for home chefs to sell weekly meal preps to their community.
              Send menus by email and SMS, accept online payments, and manage everything from one dashboard.
            </p>
            {/* Feature icons */}
            <div className="mt-6 flex gap-4">
              {[
                { icon: Mail, label: "Email menus" },
                { icon: Smartphone, label: "SMS menus" },
                { icon: CreditCard, label: "Stripe payments" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1 text-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                    <Icon className="h-4 w-4 text-orange-400" />
                  </div>
                  <span className="text-[10px] text-white/50">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-white/50">Platform</h3>
            <ul className="space-y-3 text-sm">
              {[
                { href: "/search", label: "Find a Chef" },
                { href: "/how-it-works", label: "How It Works" },
                { href: "/account/signin?type=chef", label: "Start Selling" },
              ].map(({ href, label }) => (
                <li key={label}>
                  <Link href={href} className="text-white/70 transition-colors hover:text-orange-400">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Chefs */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-white/50">For Chefs</h3>
            <ul className="space-y-3 text-sm">
              {[
                { href: "/account/chef/dashboard", label: "Dashboard" },
                { href: "/account/chef/menus", label: "Manage Menus" },
                { href: "/account/chef/subscribers", label: "Subscribers" },
                { href: "/account/chef/promo-codes", label: "Promo Codes" },
                { href: "mailto:hello@bringmefood.app", label: "Contact Support" },
              ].map(({ href, label }) => (
                <li key={label}>
                  <Link href={href} className="text-white/70 transition-colors hover:text-orange-400">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-custom flex flex-col items-center justify-between gap-3 py-6 md:flex-row">
          <p className="text-xs text-white/50">
            &copy; {new Date().getFullYear()} Bring Me Food. All rights reserved.
          </p>
          <p className="text-xs text-white/40">
            Built with ❤️ by{" "}
            <Link
              href="mailto:fmarostega@gmail.com"
              className="text-white/60 hover:text-orange-400 transition-colors"
            >
              Fernando Marostega
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
