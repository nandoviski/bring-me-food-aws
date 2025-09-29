import { Button } from "@/components/ui/button";
import {
  ChefHat,
  Clock,
  DollarSign,
  Search,
  ShieldCheck,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    // items-center justify-center bg-linear-to-b from-[#2e026d] to-[#15162c] text-white
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="hero-pattern relative py-32 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-5xl font-bold md:text-6xl">
              Connect with
              <br />
              <span className="text-orange-500">Local Home Chefs</span>
            </h1>
            <p className="mb-8 text-xl text-gray-200 md:text-2xl">
              Your marketplace for authentic homemade meals from talented local
              chefs
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="bg-orange-500 hover:bg-orange-600"
                asChild
              >
                <Link href="/explore">
                  Find Meals <Search className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white bg-white/10 hover:bg-white/20"
                asChild
              >
                <Link href="/become-chef">
                  Start Selling <ChefHat className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* For Customers Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold">Find Your Perfect Meal</h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              Discover delicious homemade meals from talented local chefs in
              your area
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                <Search className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Browse Local Chefs</h3>
              <p className="text-gray-600">
                Explore menus from talented home chefs in your neighborhood
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                <UtensilsCrossed className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Order Fresh Meals</h3>
              <p className="text-gray-600">
                Choose from a variety of authentic homemade dishes
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Pick Up & Enjoy</h3>
              <p className="text-gray-600">
                Schedule pickup times that work for your schedule
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button
              size="lg"
              className="bg-orange-500 hover:bg-orange-600"
              asChild
            >
              <Link href="/explore">Find Local Chefs</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* For Chefs Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="mb-6 text-4xl font-bold">
                Start Your Food Business
              </h2>
              <p className="mb-8 text-xl text-gray-600">
                Turn your passion for cooking into a thriving business. Join our
                platform and start selling your homemade meals to local
                customers.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100">
                    <ShieldCheck className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-lg font-semibold">Simple Setup</h3>
                    <p className="text-gray-600">
                      Create your profile, add your meals, and set your own
                      schedule
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100">
                    <Users className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-lg font-semibold">
                      Reach More Customers
                    </h3>
                    <p className="text-gray-600">
                      Connect with local customers looking for authentic
                      homemade meals
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100">
                    <DollarSign className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-lg font-semibold">Earn Money</h3>
                    <p className="text-gray-600">
                      Set your own prices and grow your business on your terms
                    </p>
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                className="mt-8 bg-orange-500 hover:bg-orange-600"
                asChild
              >
                <Link href="/become-chef">Start Selling Today</Link>
              </Button>
            </div>

            <div className="relative h-[600px] overflow-hidden rounded-lg">
              <Image
                src="https://images.unsplash.com/photo-1556910103-1c02745aae4d"
                alt="Chef preparing food"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 text-center md:grid-cols-3">
            <div>
              <div className="mb-2 text-4xl font-bold">500+</div>
              <p className="text-gray-200">Active Chefs</p>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold">10k+</div>
              <p className="text-gray-200">Happy Customers</p>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold">50k+</div>
              <p className="text-gray-200">Meals Served</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-4xl font-bold">Ready to Get Started?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl">
            Join our community today and discover the amazing world of homemade
            food
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="bg-orange-500 hover:bg-orange-600"
              asChild
            >
              <Link href="/explore">
                Find Meals <Search className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/become-chef">
                Become a Chef <ChefHat className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
