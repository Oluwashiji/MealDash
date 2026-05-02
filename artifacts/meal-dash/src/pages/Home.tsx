import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Clock, Star, Truck, ChefHat, Search, Flame, Leaf, Coffee, Pizza, ShoppingBag, ChevronRight, Zap, Gift, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { restaurants, popularMeals, menuItems } from "@/lib/data";

const CATEGORIES = [
  { label: "All", icon: ShoppingBag, filter: "" },
  { label: "Nigerian", icon: Flame, filter: "Nigerian" },
  { label: "Fast Food", icon: Zap, filter: "Fast Food" },
  { label: "Desserts", icon: Gift, filter: "Desserts" },
  { label: "Healthy", icon: Leaf, filter: "Healthy" },
  { label: "Snacks", icon: Coffee, filter: "Snacks" },
  { label: "Continental", icon: Pizza, filter: "Continental" },
];

const PROMOS = [
  { id: 1, title: "Free delivery on your first order", sub: "Sign up and save on delivery fees", color: "from-primary to-primary/70", emoji: "🎉" },
  { id: 2, title: "Campus special — 20% off", sub: "Every Tuesday for students", color: "from-violet-600 to-violet-400", emoji: "🎓" },
  { id: 3, title: "Cold Stone is now on MealDash!", sub: "Ice cream delivered in 30 min", color: "from-pink-500 to-rose-400", emoji: "🍦" },
  { id: 4, title: "Burger King is here 🍔", sub: "Whopper delivered to your door", color: "from-orange-600 to-amber-500", emoji: "👑" },
];

function HScroll({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
      {children}
    </div>
  );
}

function SectionHeader({ title, sub, href }: { title: string; sub?: string; href: string }) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">{title}</h2>
        {sub && <p className="text-muted-foreground text-sm mt-0.5">{sub}</p>}
      </div>
      <Link href={href}>
        <button className="flex items-center gap-1 text-primary text-sm font-semibold">
          See all <ChevronRight className="w-4 h-4" />
        </button>
      </Link>
    </div>
  );
}

function RestaurantCard({ r }: { r: typeof restaurants[0] }) {
  return (
    <Link href={`/restaurant/${r.id}`}>
      <div className="flex-shrink-0 w-64 sm:w-72 rounded-2xl border bg-card overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer snap-start">
        <div className="relative h-40 bg-muted overflow-hidden">
          <img src={r.image} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          {!r.isOpen && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><span className="text-white font-bold text-lg">Closed</span></div>}
          <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
            {r.tags.map((tag) => <span key={tag} className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">{tag}</span>)}
          </div>
        </div>
        <div className="p-3">
          <h3 className="font-bold text-card-foreground text-base">{r.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{r.cuisine} · {r.address}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" /><span className="font-semibold text-foreground">{r.rating}</span></span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-primary" />{r.deliveryTimeMin}–{r.deliveryTimeMax} min</span>
            <span className="flex items-center gap-1"><Truck className="w-3 h-3" />₦{r.deliveryFee.toLocaleString()}</span>
          </div>
          {r.minOrder && <p className="text-xs text-muted-foreground mt-1">Min. order ₦{r.minOrder.toLocaleString()}</p>}
        </div>
      </div>
    </Link>
  );
}

function MealCard({ meal }: { meal: typeof popularMeals[0] }) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const restaurant = restaurants.find((r) => r.id === meal.restaurantId)!;
  if (!restaurant) return null;
  return (
    <div className="flex-shrink-0 w-48 sm:w-56 rounded-2xl border bg-card overflow-hidden group hover:shadow-md transition-all duration-300 snap-start">
      <div className="relative h-32 bg-muted overflow-hidden">
        <img src={meal.image} alt={meal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {meal.isPopular && <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-400 text-amber-900 text-xs font-bold flex items-center gap-1"><Flame className="w-3 h-3" /> Popular</span>}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-card-foreground text-sm line-clamp-1">{meal.name}</h3>
        <p className="text-xs text-muted-foreground">{meal.restaurantName}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-primary text-sm">₦{meal.price.toLocaleString()}</span>
          <button
            onClick={() => {
              addItem(
                { menuItemId: meal.id, name: meal.name, price: meal.price, quantity: 1, image: meal.image },
                { id: restaurant.id, name: restaurant.name, deliveryFee: restaurant.deliveryFee, deliveryTimeMin: restaurant.deliveryTimeMin, deliveryTimeMax: restaurant.deliveryTimeMax }
              );
              toast({ title: "Added! 🛒", description: `${meal.name} added to cart` });
            }}
            className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/80 transition-colors text-lg font-bold leading-none"
          >+</button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  const filteredRestaurants = restaurants.filter((r) => {
    const matchesCat = activeCategory ? r.cuisine === activeCategory : true;
    const matchesSearch = searchQuery ? r.name.toLowerCase().includes(searchQuery.toLowerCase()) : true;
    return matchesCat && matchesSearch;
  });

  const topRestaurants = filteredRestaurants.filter((r) => r.category === "top");
  const campusRestaurants = filteredRestaurants.filter((r) => r.category === "campus");

  const lastOrder = (() => { try { const o = localStorage.getItem("md_orders"); return o ? JSON.parse(o)[0] : null; } catch { return null; } })();
  const reorderItems = lastOrder ? popularMeals.filter((m) => lastOrder.items.some((i: { menuItemId: number }) => i.menuItemId === m.id)).slice(0, 6) : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 relative">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 text-white/90 text-sm font-medium mb-4">
              <MapPin className="w-3.5 h-3.5" /> Delivering across Ibadan
            </div>
            <h1 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight">
              {user ? `Hey ${user.name.split(" ")[0]} 👋` : "Hungry?"}<br />
              <span className="text-white/90">Food is on its way.</span>
            </h1>
            <p className="mt-3 text-white/80 text-base sm:text-lg max-w-md">
              Order from Ibadan's best restaurants. Fresh meals delivered in 30 minutes or less.
            </p>
            <div className="mt-6 flex gap-2 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search restaurants or dishes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-white text-foreground border-0 h-12 rounded-xl shadow-lg" />
              </div>
              <Link href="/restaurants">
                <Button size="lg" variant="secondary" className="h-12 rounded-xl font-semibold shadow-lg"><Search className="w-4 h-4" /></Button>
              </Link>
            </div>
            <div className="flex items-center gap-6 mt-6 text-white/80 text-sm flex-wrap">
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> 30 min avg delivery</span>
              <span className="flex items-center gap-1.5"><ChefHat className="w-4 h-4" /> 9 restaurants</span>
              <span className="flex items-center gap-1.5"><Star className="w-4 h-4 fill-white" /> 4.4 avg rating</span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Promo banners */}
        <div className="py-5">
          <HScroll>
            {PROMOS.map((p) => (
              <div key={p.id} className={`flex-shrink-0 w-72 sm:w-80 rounded-2xl bg-gradient-to-r ${p.color} p-5 text-white snap-start cursor-pointer hover:scale-[1.02] transition-transform`}>
                <div className="text-3xl mb-2">{p.emoji}</div>
                <h3 className="font-bold text-lg leading-tight">{p.title}</h3>
                <p className="text-white/80 text-sm mt-1">{p.sub}</p>
              </div>
            ))}
          </HScroll>
        </div>

        {/* Category pills */}
        <div className="pb-5">
          <HScroll>
            {CATEGORIES.map(({ label, icon: Icon, filter }) => (
              <button key={label} onClick={() => setActiveCategory(filter)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm transition-all border-2 snap-start whitespace-nowrap ${activeCategory === filter ? "bg-primary text-primary-foreground border-primary shadow-md" : "bg-card text-foreground border-border hover:border-primary/50"}`}>
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </HScroll>
        </div>

        {/* Order Again */}
        {lastOrder && reorderItems.length > 0 && (
          <section className="pb-8">
            <SectionHeader title="🔄 Order Again" sub={`Your last order from ${lastOrder.restaurantName}`} href="/orders" />
            <HScroll>{reorderItems.map((meal) => <MealCard key={meal.id} meal={meal} />)}</HScroll>
          </section>
        )}

        {/* Popular Meals */}
        <section className="pb-8">
          <SectionHeader title="🔥 Popular Right Now" sub="Most ordered dishes in Ibadan" href="/restaurants" />
          <HScroll>{popularMeals.slice(0, 12).map((meal) => <MealCard key={meal.id} meal={meal} />)}</HScroll>
        </section>

        {/* Top Restaurants */}
        {topRestaurants.length > 0 && (
          <section className="pb-8">
            <SectionHeader title="Top Restaurants in Ibadan" sub="The city's finest dining experiences" href="/restaurants?category=top" />
            <HScroll>{topRestaurants.map((r) => <RestaurantCard key={r.id} r={r} />)}</HScroll>
          </section>
        )}

        {/* Featured deal banner */}
        <section className="pb-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-500 to-orange-500 p-6 sm:p-8">
            <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20" style={{ background: "radial-gradient(circle at 80% 50%, white 0%, transparent 70%)" }} />
            <div className="relative max-w-md">
              <p className="text-white/80 text-sm font-semibold uppercase tracking-wide">Limited time</p>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">Free delivery this weekend 🚀</h2>
              <p className="text-white/80 mt-2">No minimum order. All restaurants. Saturday & Sunday only.</p>
              <Link href="/restaurants">
                <Button className="mt-4 bg-white text-orange-600 hover:bg-white/90 font-bold gap-2">Order Now <ArrowRight className="w-4 h-4" /></Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Campus Restaurants */}
        {campusRestaurants.length > 0 && (
          <section className="pb-8">
            <SectionHeader title="🎓 Campus Restaurants" sub="Affordable bites near your campus" href="/restaurants?category=campus" />
            <HScroll>{campusRestaurants.map((r) => <RestaurantCard key={r.id} r={r} />)}</HScroll>
          </section>
        )}

        {/* Sweet Treats */}
        <section className="pb-8">
          <SectionHeader title="🍦 Sweet Treats" sub="Desserts and ice cream delivered fresh" href="/restaurant/9" />
          <HScroll>
            {popularMeals.filter((m) => [901, 902, 903, 905, 703, 805].includes(m.id)).map((meal) => <MealCard key={meal.id} meal={meal} />)}
          </HScroll>
        </section>

        {/* Careers CTA */}
        <section className="pb-10">
          <div className="rounded-3xl bg-card border p-6 sm:p-10 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0 shadow-lg">
              <ChefHat className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground">Want to become a delivery rider?</h2>
              <p className="text-muted-foreground mt-1">Earn up to ₦150,000/month delivering food across Ibadan. Flexible hours, great pay.</p>
            </div>
            <Link href="/careers">
              <Button size="lg" className="gap-2 flex-shrink-0">Apply Now <ArrowRight className="w-4 h-4" /></Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}