import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChefHat,
  Search,
  ShoppingBag,
  Clock,
  UtensilsCrossed,
  Calendar,
  DollarSign,
  Users,
  Star,
  Bell,
  Smartphone,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-6 text-4xl font-bold md:text-5xl">
            How Bring me Food Works
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-gray-200">
            Whether you&apos;re looking to enjoy homemade meals or share your
            culinary creations, we make it simple and rewarding
          </p>
        </div>
      </section>

      {/* For Customers Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <span className="font-medium text-orange-500">FOR CUSTOMERS</span>
            <h2 className="mt-2 text-3xl font-bold">
              Finding Your Perfect Meal
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              Discover and order delicious homemade meals from talented local
              chefs in just a few simple steps
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            <Card className="relative bg-white">
              <div className="absolute -top-6 left-6 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-2xl font-bold text-white">
                1
              </div>
              <CardHeader className="pt-8">
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-orange-500" />
                  Browse Local Chefs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Explore profiles and menus from talented home chefs in your
                  area. Read reviews and find your perfect match.
                </p>
              </CardContent>
            </Card>

            <Card className="relative bg-white">
              <div className="absolute -top-6 left-6 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-2xl font-bold text-white">
                2
              </div>
              <CardHeader className="pt-8">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-500" />
                  Choose & Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Select your meals from weekly menus and schedule your
                  preferred pickup time that works for you.
                </p>
              </CardContent>
            </Card>

            <Card className="relative bg-white">
              <div className="absolute -top-6 left-6 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-2xl font-bold text-white">
                3
              </div>
              <CardHeader className="pt-8">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-orange-500" />
                  Pick Up & Enjoy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Pick up your freshly prepared meals at the scheduled time and
                  enjoy authentic homemade food.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <Button
              size="lg"
              className="bg-orange-500 hover:bg-orange-600"
              asChild
            >
              <Link href="/explore">Start Ordering</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* For Chefs Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <span className="font-medium text-orange-500">FOR CHEFS</span>
            <h2 className="mt-2 text-3xl font-bold">
              Start Your Food Business
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              Turn your passion for cooking into a thriving business by sharing
              your culinary creations with local customers
            </p>
          </div>

          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100">
                  <UtensilsCrossed className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold">
                    Create Your Menu
                  </h3>
                  <p className="text-gray-600">
                    Add your signature dishes and set your own prices. Update
                    your menu weekly or as often as you&apos;d like.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100">
                  <Clock className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold">
                    Set Your Schedule
                  </h3>
                  <p className="text-gray-600">
                    Choose your own working hours and pickup times. Maintain
                    full control over your availability.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100">
                  <Bell className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold">Receive Orders</h3>
                  <p className="text-gray-600">
                    Get notified when customers place orders. Manage your orders
                    through our simple dashboard.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100">
                  <DollarSign className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold">Earn Money</h3>
                  <p className="text-gray-600">
                    Get paid for your culinary creations. Build a loyal customer
                    base and grow your business.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative h-[600px] overflow-hidden rounded-lg">
              <Image
                src="https://images.unsplash.com/photo-1507048331197-7d4ac70811cf"
                alt="Chef preparing food"
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="mt-16 text-center">
            <Button
              size="lg"
              className="bg-orange-500 hover:bg-orange-600"
              asChild
            >
              <Link href="/become-chef">Start Selling Today</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-16 text-center text-3xl font-bold">
            Why Choose Bring me Food?
          </h2>
          <div className="grid gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                <Users className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Local Community</h3>
              <p className="text-gray-600">
                Connect with food lovers in your neighborhood
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                <Star className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Quality Assured</h3>
              <p className="text-gray-600">
                Verified chefs and quality standards
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                <Smartphone className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Easy to Use</h3>
              <p className="text-gray-600">
                Simple ordering and management system
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                <CheckCircle className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Secure Platform</h3>
              <p className="text-gray-600">Safe and secure transactions</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-3xl font-bold">Ready to Get Started?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl">
            Join our community today and be part of the homemade food revolution
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
                Become a Chef <ChefHat className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
