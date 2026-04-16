import { Link } from "wouter";
import { ArrowRight, Clock, Star, Truck, ChefHat, Users } from "lucide-react";
import { useListRestaurants, useGetPopularMeals } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 sm:py-24" data-testid="hero-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Truck className="w-4 h-4" /> Fast delivery in Ibadan
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight">
            Delicious food,{" "}
            <span className="text-primary">delivered</span> to your door
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-lg">
            Order from the best restaurants and campus eateries in Ibadan. Fresh meals, fast delivery, great prices.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/restaurants">
              <Button size="lg" className="gap-2 text-base" data-testid="button-order-now">
                Order Now <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/careers">
              <Button size="lg" variant="outline" className="gap-2 text-base" data-testid="button-join-team">
                <Users className="w-4 h-4" /> Join Our Team
              </Button>
            </Link>
          </div>
          <div className="mt-10 flex items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>20-40 min delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-accent" />
              <span>Top rated meals</span>
            </div>
            <div className="flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-secondary" />
              <span>7+ restaurants</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PopularMealsSection() {
  const { data: meals, isLoading } = useGetPopularMeals();
  const { addItem } = useCart();
  const { toast } = useToast();

  return (
    <section className="py-16 bg-background" data-testid="popular-meals-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Popular Meals</h2>
            <p className="text-muted-foreground mt-1">Most ordered dishes in Ibadan</p>
          </div>
          <Link href="/restaurants">
            <Button variant="ghost" className="gap-1" data-testid="link-view-all-meals">
              View all <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border bg-card overflow-hidden">
                <Skeleton className="h-40 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {meals?.slice(0, 8).map((meal) => (
              <div
                key={meal.id}
                className="rounded-xl border bg-card overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                data-testid={`card-meal-${meal.id}`}
              >
                <div className="relative h-40 bg-muted overflow-hidden">
                  <img
                    src={meal.image}
                    alt={meal.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-background/90 text-xs font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3 text-primary" />
                    {meal.deliveryTimeMin}-{meal.deliveryTimeMax} min
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-card-foreground truncate">{meal.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{meal.restaurantName}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-bold text-primary">
                      N{meal.price.toLocaleString()}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => {
                        addItem(
                          { menuItemId: meal.id, name: meal.name, price: meal.price, quantity: 1, image: meal.image },
                          { id: meal.restaurantId, name: meal.restaurantName, deliveryFee: 500, deliveryTimeMin: meal.deliveryTimeMin, deliveryTimeMax: meal.deliveryTimeMax }
                        );
                        toast({ title: "Added to cart", description: `${meal.name} added to your cart` });
                      }}
                      data-testid={`button-add-meal-${meal.id}`}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function RestaurantSection({ title, subtitle, category }: { title: string; subtitle: string; category: string }) {
  const { data: restaurants, isLoading } = useListRestaurants({ category });

  return (
    <section className="py-16" data-testid={`restaurants-section-${category}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{title}</h2>
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          </div>
          <Link href={`/restaurants?category=${category}`}>
            <Button variant="ghost" className="gap-1" data-testid={`link-view-${category}`}>
              View all <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border bg-card overflow-hidden">
                <Skeleton className="h-44 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {restaurants?.map((r) => (
              <Link key={r.id} href={`/restaurant/${r.id}`} data-testid={`card-restaurant-${r.id}`}>
                <div className="rounded-xl border bg-card overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <div className="relative h-44 bg-muted overflow-hidden">
                    <img src={r.image} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    {!r.isOpen && (
                      <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
                        <span className="text-background font-bold text-lg">Closed</span>
                      </div>
                    )}
                    <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                      {r.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-card-foreground text-lg">{r.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{r.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-accent fill-accent" /> {r.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-primary" /> {r.deliveryTimeMin}-{r.deliveryTimeMax} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5" /> N{r.deliveryFee}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-16 bg-primary" data-testid="cta-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground">Ready to join our team?</h2>
        <p className="mt-4 text-primary-foreground/80 text-lg max-w-2xl mx-auto">
          We're always looking for talented chefs, delivery riders, and managers to join the MealDash family.
        </p>
        <Link href="/careers">
          <Button size="lg" variant="secondary" className="mt-8 gap-2 text-base" data-testid="button-cta-careers">
            View Open Positions <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div>
      <HeroSection />
      <PopularMealsSection />
      <RestaurantSection title="Top Restaurants in Ibadan" subtitle="The city's finest dining experiences" category="top" />
      <RestaurantSection title="Campus Restaurants" subtitle="Quick bites near your campus" category="campus" />
      <CTASection />
    </div>
  );
}
