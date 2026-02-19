import { Button } from "@/components/ui/button";
import { Clock, Star, UtensilsCrossed, CheckCircle2 } from "lucide-react";
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
                Embark on a gastronomic journey with Bring Me Food. Our curated
                selection of homemade meal preps from local chefs will tantalize
                your taste buds and transport you to culinary bliss.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button size="lg" variant="orange" asChild>
                  <Link href="/search">Order Now</Link>
                </Button>
                <Button size="lg" variant="green" asChild>
                  <Link href="/account/signin?type=chef">Become a Chef</Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-6 pt-8 md:grid-cols-4">
                <div>
                  <div className="text-3xl font-bold md:text-4xl">500+</div>
                  <p className="text-sm text-white/80 md:text-base">
                    Active Chefs
                  </p>
                </div>
                <div>
                  <div className="text-3xl font-bold md:text-4xl">10k+</div>
                  <p className="text-sm text-white/80 md:text-base">
                    Happy Customers
                  </p>
                </div>
                <div>
                  <div className="text-3xl font-bold md:text-4xl">50k+</div>
                  <p className="text-sm text-white/80 md:text-base">
                    Meals Served
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-3xl font-bold md:text-4xl">
                    4.9
                    <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                  </div>
                  <p className="text-sm text-white/80 md:text-base">
                    Star Rating
                  </p>
                </div>
              </div>
            </div>

            {/* Right side - Images */}
            <div className="relative">
              <div className="relative h-[400px] md:h-[500px] lg:h-[600px]">
                {/* Main circular image */}
                <div className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 md:h-[400px] md:w-[400px] lg:h-[500px] lg:w-[500px]">
                  <Image
                    src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80"
                    alt="Delicious meal prep"
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
                    "I've been ordering from Bring Me Food for months, and I've
                    never been disappointed. The meal preps are always fresh,
                    flavorful, and perfectly portioned. Highly recommended!"
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    Sarah Johnson
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="mb-16 text-center">
            <h2 className="heading-section text-primary mb-4">
              Benefits of Bring Me Food
            </h2>
            <p className="text-body-large mx-auto max-w-2xl">
              Experience the convenience, quality, and taste of homemade meals
              delivered right to your doorstep.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Ultimate Convenience",
                description:
                  "Enjoy the convenience of having your favorite homemade meals delivered right to your doorstep, ready to heat and enjoy.",
                icon: Clock,
              },
              {
                number: "02",
                title: "Fresh & Healthy",
                description:
                  "All our meal preps are made with fresh, locally-sourced ingredients, ensuring you get the best nutrition and flavor.",
                icon: CheckCircle2,
              },
              {
                number: "03",
                title: "Wide Variety",
                description:
                  "Explore a wide variety of delicious meal selections from diverse cuisines, designed to satisfy all your cravings.",
                icon: UtensilsCrossed,
              },
            ].map((benefit, index) => (
              <div
                key={index}
                className="relative rounded-2xl bg-gray-50 p-8 transition-colors hover:bg-gray-100"
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
              <Link href="/how-it-works">How it works</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="section-padding bg-primary text-white">
        <div className="container-custom">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="relative h-[400px] overflow-hidden rounded-2xl md:h-[500px]">
              <Image
                src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80"
                alt="About Bring Me Food"
                fill
                className="image-rounded-lg"
              />
            </div>
            <div className="space-y-6">
              <h2 className="heading-section text-white">
                At Bring Me Food, we joyfully celebrate flavor and connect you
                with the best local home chefs.
              </h2>
              <p className="text-body-large text-white/90">
                Our mission is to bring authentic, homemade meals to your table
                while supporting local culinary talent. Every meal prep is
                crafted with care, using fresh ingredients and traditional
                recipes passed down through generations.
              </p>
              <Button size="lg" variant="orange" asChild>
                <Link href="/how-it-works">How We Work</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="mb-16 text-center">
            <h2 className="heading-section text-primary mb-4">
              What Our Customers Say
            </h2>
            <p className="text-body-large mx-auto max-w-2xl">
              From busy professionals to families, our platform has helped
              thousands enjoy delicious homemade meals with convenience.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                rating: 4.9,
                text: "The meal preps are always fresh and perfectly portioned. It's transformed how I eat during the week. No more meal planning stress!",
                author: "Bessie Cooper",
                role: "Software Engineer",
              },
              {
                rating: 4.8,
                text: "I love the variety of cuisines available. The flavors are authentic and the ingredients are top quality. Highly recommend!",
                author: "Michael Brown",
                role: "Marketing Manager",
              },
              {
                rating: 5.0,
                text: "The customer service is exceptional, always responsive and helpful. The chefs are talented and the meals never disappoint.",
                author: "Sarah Martinez",
                role: "Teacher",
              },
              {
                rating: 4.7,
                text: "As a busy parent, this service has been a lifesaver. Healthy, delicious meals that my whole family enjoys. Worth every penny!",
                author: "David Johnson",
                role: "Entrepreneur",
              },
              {
                rating: 4.9,
                text: "The customization options are great. I can choose meals based on my dietary preferences and the quality is consistently excellent.",
                author: "Emily Chen",
                role: "Nutritionist",
              },
              {
                rating: 4.8,
                text: "Since I started using Bring Me Food, I've saved so much time and still eat healthy, home-cooked meals. It's a game-changer!",
                author: "James Wilson",
                role: "Consultant",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex items-center gap-1">
                  <span className="text-primary text-2xl font-bold">
                    {testimonial.rating}
                  </span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(testimonial.rating)
                            ? "fill-secondary text-secondary"
                            : "fill-gray-200 text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-body mb-4 text-gray-700">
                  "{testimonial.text}"
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

      {/* Gallery Section */}
      <section className="bg-white py-12 md:py-16 lg:py-20">
        <div className="container-custom">
          <div className="mb-12 text-center">
            <h2 className="heading-section text-primary mb-4">
              Our Food Gallery
            </h2>
            <p className="text-body-large mx-auto max-w-2xl">
              Get a glimpse of the passion and dedication that goes into every
              meal. From the freshest ingredients to beautiful presentation.
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
                  alt={`Gallery image ${index + 1}`}
                  fill
                  className="image-rounded-lg transition-transform duration-300 group-hover:scale-110"
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
            <h2 className="heading-section text-white">Hungry? Order Now!</h2>
            <p className="text-body-large mx-auto max-w-2xl text-white/90">
              Whether you're craving a quick bite, a gourmet meal, or something
              in between, Bring Me Food has you covered. From classic comfort
              food to exotic flavors, discover your next favorite meal today.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" variant="orange" asChild>
                <Link href="/search">Explore Chefs</Link>
              </Button>
              <Button size="lg" variant="green" asChild>
                <Link href="/account/signin?type=chef">Start Selling</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
