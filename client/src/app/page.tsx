import { Button } from "@/components/ui/button";
import {
  Clock,
  Star,
  UtensilsCrossed,
  CheckCircle2,
  Mail,
  Smartphone,
  BarChart3,
  CreditCard,
  Share2,
  Users,
  ChefHat,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="section-padding bg-primary text-white">
        <div className="container-custom">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left side - Content */}
            <div className="space-y-8">
              <h1 className="text-4xl leading-tight font-bold text-white md:text-5xl lg:text-6xl xl:text-7xl">
                Make a Moment with
                <br />
                <span className="text-secondary">Home-Cooked Meals</span>
              </h1>
              <p className="text-body-large max-w-xl">
                Order weekly meal preps directly from local home chefs in your area.
                Fresh, authentic, and made with love — no restaurant markups.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button size="lg" variant="orange" asChild>
                  <Link href="/search">Find a Chef</Link>
                </Button>
                <Button size="lg" variant="green" asChild>
                  <Link href="/account/signin?type=chef">Start Selling</Link>
                </Button>
              </div>

              {/* Feature highlights — honest & specific */}
              <div className="grid grid-cols-2 gap-4 pt-4 md:grid-cols-4">
                {[
                  { icon: Mail, label: "Email & SMS menus" },
                  { icon: CreditCard, label: "Stripe payments" },
                  { icon: BarChart3, label: "Order dashboard" },
                  { icon: Share2, label: "Shareable profile" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-2 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-xs text-white/80 leading-tight">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Images */}
            <div className="relative">
              <div className="relative h-[400px] md:h-[500px] lg:h-[600px]">
                {/* Main circular image */}
                <div className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 md:h-[400px] md:w-[400px] lg:h-[500px] lg:w-[500px]">
                  <Image
                    src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80"
                    alt="Delicious home-cooked meal prep"
                    fill
                    className="rounded-full object-cover"
                    priority
                  />
                </div>

                {/* Testimonial card */}
                <div className="absolute top-0 right-0 max-w-[280px] rounded-2xl bg-white/95 p-6 shadow-xl backdrop-blur-sm md:max-w-[320px]">
                  <div className="mb-3 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="fill-secondary text-secondary h-4 w-4"
                      />
                    ))}
                  </div>
                  <p className="mb-4 text-sm text-gray-700 md:text-base">
                    "I used to text my menu to customers every week. Now I hit one button and everyone gets it by email and text. My customers love it!"
                  </p>
                  <p className="text-sm font-semibold text-gray-900">Claudia M.</p>
                  <p className="text-xs text-gray-500">Home chef, Sydney</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOR CHEFS Section — the pitch */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left: visual */}
            <div className="relative h-[380px] overflow-hidden rounded-2xl md:h-[460px]">
              <Image
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80"
                alt="Home chef cooking"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 rounded-xl bg-white/95 p-4 shadow-lg backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500">
                    <ChefHat className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Your weekly menu just reached 24 people</p>
                    <p className="text-xs text-slate-500">📧 18 emails · 💬 6 SMS — in one click</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: benefits */}
            <div className="space-y-6">
              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-orange-600">For Home Chefs</p>
                <h2 className="heading-section text-primary">
                  Turn your cooking into a real business
                </h2>
                <p className="mt-4 text-gray-600">
                  Do you cook meals for a circle of regular customers? Stop managing orders via WhatsApp and bank transfers. Bring Me Food gives you a professional storefront — free to get started.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    icon: Share2,
                    title: "Your own page — shareable in seconds",
                    desc: "Get a link like bringmefood.app/chef/yourname. Share it anywhere — WhatsApp, Instagram, word of mouth.",
                  },
                  {
                    icon: Mail,
                    title: "Send menus by email and SMS with one tap",
                    desc: "Publish your weekly menu and all subscribers get notified instantly — by email and text message.",
                  },
                  {
                    icon: CreditCard,
                    title: "Accept online payments via Stripe",
                    desc: "Customers pay securely at checkout. No more bank transfer reminders or chasing payments.",
                  },
                  {
                    icon: BarChart3,
                    title: "See your orders and revenue in real time",
                    desc: "Track every order, confirm deliveries, and see how much you're making — all in one dashboard.",
                  },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100">
                      <Icon className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{title}</p>
                      <p className="mt-0.5 text-sm text-gray-600">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" variant="orange" asChild>
                  <Link href="/account/signin?type=chef">
                    Create your chef page — free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section — for customers */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="mb-16 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-orange-600">For Customers</p>
            <h2 className="heading-section text-primary mb-4">
              Why Bring Me Food?
            </h2>
            <p className="text-body-large mx-auto max-w-2xl">
              Experience the convenience and warmth of home-cooked meals delivered to your door.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Genuine Home Cooking",
                description:
                  "Every meal is made by a real person in their home kitchen — not a factory. You taste the difference.",
                icon: UtensilsCrossed,
              },
              {
                number: "02",
                title: "Subscribe & Never Miss a Menu",
                description:
                  "Subscribe to your favourite chef and get their weekly menu delivered to your inbox and phone. Order in seconds.",
                icon: CheckCircle2,
              },
              {
                number: "03",
                title: "Pay Securely Online",
                description:
                  "No more bank transfers or PayID guessing. Pay at checkout with a card — fast, simple, and secure.",
                icon: CreditCard,
              },
            ].map((benefit, index) => (
              <div
                key={index}
                className="relative rounded-2xl bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="text-secondary/20 absolute top-6 right-6 text-6xl font-bold">
                  {benefit.number}
                </div>
                <div className="mb-6">
                  <div className="bg-secondary/10 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                    <benefit.icon className="text-secondary h-8 w-8" />
                  </div>
                  <h3 className="text-primary mb-3 text-2xl font-semibold md:text-3xl">
                    {benefit.title}
                  </h3>
                  <p className="text-body text-gray-600">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Button size="lg" variant="orange" asChild>
              <Link href="/search">Find chefs near you</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How it works — simple 3 steps */}
      <section className="section-padding bg-primary text-white">
        <div className="container-custom">
          <div className="mb-16 text-center">
            <h2 className="heading-section text-white mb-4">How it works</h2>
            <p className="text-body-large mx-auto max-w-xl text-white/80">
              From discovery to delivery in three simple steps.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Find a chef",
                desc: "Browse local home chefs in your area. Read their story, see this week's menu, and subscribe for weekly updates.",
                icon: Users,
              },
              {
                step: "2",
                title: "Place your order",
                desc: "Choose your meals, add your delivery address, and pay securely with a card — as a guest or with an account.",
                icon: UtensilsCrossed,
              },
              {
                step: "3",
                title: "Enjoy your meal",
                desc: "Your chef confirms the order and delivers on the scheduled day. Track your order status in real time.",
                icon: Clock,
              },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-2xl font-bold">
                  {step}
                </div>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/80">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">{title}</h3>
                <p className="text-sm text-white/70">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-16 text-center">
            <Button size="lg" variant="orange" asChild>
              <Link href="/search">Start exploring</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="mb-16 text-center">
            <h2 className="heading-section text-primary mb-4">
              What people are saying
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                rating: 5,
                text: "I used to text my menu to 30+ customers every Sunday. Now I publish once and everyone gets it — by email AND text message. Game changer.",
                author: "Claudia M.",
                role: "Home chef, Sydney",
              },
              {
                rating: 5,
                text: "Finally an app that feels like it was made for how real food businesses actually work. My customers love getting the SMS menu every week.",
                author: "Sandra R.",
                role: "Home chef, Melbourne",
              },
              {
                rating: 5,
                text: "I've been ordering from my neighbour's chef page for 3 months. Fresh, authentic, and I can pay online — no more bank transfers!",
                author: "James W.",
                role: "Regular customer",
              },
              {
                rating: 5,
                text: "The order tracking is brilliant — I always know when my meals are confirmed. Love supporting local home cooks.",
                author: "Emily C.",
                role: "Regular customer",
              },
              {
                rating: 5,
                text: "Setup took 20 minutes. I had my first order the same day I shared my link on WhatsApp. Could not be simpler.",
                author: "Maria T.",
                role: "Home chef, Brisbane",
              },
              {
                rating: 5,
                text: "As a Brazilian home cook, I love that this platform is built around the way we already work — weekly menus, personal relationships, real food.",
                author: "Ana P.",
                role: "Home chef, Sydney",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-body mb-4 text-gray-700">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                    <span className="text-primary font-semibold">
                      {testimonial.author.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-primary font-semibold">
                      {testimonial.author}
                    </p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Food Gallery Section */}
      <section className="bg-white py-12 md:py-16 lg:py-20">
        <div className="container-custom">
          <div className="mb-12 text-center">
            <h2 className="heading-section text-primary mb-4">
              Real food, real chefs
            </h2>
            <p className="text-body-large mx-auto max-w-2xl">
              Every dish is made by a local home cook, with fresh ingredients and personal care.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {[
              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80",
              "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80",
              "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&q=80",
              "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80",
              "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&q=80",
              "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&q=80",
              "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80",
              "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80",
            ].map((image, index) => (
              <div
                key={index}
                className="group relative aspect-square cursor-pointer overflow-hidden rounded-2xl"
              >
                <Image
                  src={image}
                  alt={`Home-cooked meal ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="section-padding bg-primary text-white">
        <div className="container-custom">
          <div className="mx-auto max-w-4xl space-y-8 text-center">
            <h2 className="heading-section text-white">
              Ready to get started?
            </h2>
            <p className="text-body-large mx-auto max-w-2xl text-white/90">
              Whether you&apos;re looking for great home-cooked meals or you&apos;re a cook ready to turn your kitchen into a business — Bring Me Food is for you.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" variant="orange" asChild>
                <Link href="/search">Find chefs near you</Link>
              </Button>
              <Button size="lg" variant="green" asChild>
                <Link href="/account/signin?type=chef">
                  <ChefHat className="mr-2 h-5 w-5" />
                  Start selling — it&apos;s free
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
