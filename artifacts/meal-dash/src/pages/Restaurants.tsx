import { useState } from "react";
import { Link, useSearch } from "wouter";
import { Clock, Star, Truck, Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { restaurants } from "@/lib/data";

const CUISINES = ["All", "Nigerian", "Fast Food", "Continental", "Desserts", "Healthy", "Snacks"];

export default function Restaurants() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const initialCategory = params.get("category") || "";
  const [category, setCategory] = useState(initialCategory);
  const [cuisine, setCuisine] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = restaurants.filter((r) => {
    const matchesCategory = category ? r.category === category : true;
    const matchesCuisine = cuisine !== "All" ? r.cuisine === cuisine : true;
    const matchesSearch = search ? r.name.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase()) : true;
    return matchesCategory && matchesCuisine && matchesSearch;
  });

  const topOnes = filtered.filter((r) => r.category === "top");
  const campusOnes = filtered.filter((r) => r.category === "campus");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search restaurants..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          {/* Category toggle */}
          <div className="flex gap-2">
            {[{ v: "", label: "All" }, { v: "top", label: "Top Restaurants" }, { v: "campus", label: "Campus" }].map(({ v, label }) => (
              <Button key={v} variant={category === v ? "default" : "outline"} size="sm" onClick={() => setCategory(v)}>{label}</Button>
            ))}
          </div>
          {/* Cuisine pills — horizontal scroll */}
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {CUISINES.map((c) => (
              <button key={c} onClick={() => setCuisine(c)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${cuisine === c ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-transparent hover:border-primary/40"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No restaurants found</p>
            <Button className="mt-4" onClick={() => { setSearch(""); setCuisine("All"); setCategory(""); }}>Clear filters</Button>
          </div>
        ) : (
          <>
            {/* Top section */}
            {topOnes.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Top Restaurants</h2>
                    <p className="text-sm text-muted-foreground">{topOnes.length} restaurants</p>
                  </div>
                </div>
                {/* Horizontal scroll on mobile, grid on desktop */}
                <div className="sm:hidden">
                  <div className="flex gap-4 overflow-x-auto pb-2 snap-x" style={{ scrollbarWidth: "none" }}>
                    {topOnes.map((r) => <RestaurantCard key={r.id} r={r} compact />)}
                  </div>
                </div>
                <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {topOnes.map((r) => <RestaurantCard key={r.id} r={r} />)}
                </div>
              </section>
            )}

            {/* Campus section */}
            {campusOnes.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">🎓 Campus Restaurants</h2>
                    <p className="text-sm text-muted-foreground">{campusOnes.length} restaurants</p>
                  </div>
                </div>
                <div className="sm:hidden">
                  <div className="flex gap-4 overflow-x-auto pb-2 snap-x" style={{ scrollbarWidth: "none" }}>
                    {campusOnes.map((r) => <RestaurantCard key={r.id} r={r} compact />)}
                  </div>
                </div>
                <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {campusOnes.map((r) => <RestaurantCard key={r.id} r={r} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function RestaurantCard({ r, compact }: { r: typeof restaurants[0]; compact?: boolean }) {
  return (
    <Link href={`/restaurant/${r.id}`}>
      <div className={`${compact ? "flex-shrink-0 w-64 snap-start" : "w-full"} rounded-2xl border bg-card overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full`}>
        <div className="relative h-44 bg-muted overflow-hidden">
          <img src={r.image} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          {!r.isOpen && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><span className="text-white font-bold text-lg">Closed</span></div>}
          <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
            {r.tags.map((tag) => <span key={tag} className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">{tag}</span>)}
          </div>
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${r.category === "top" ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"}`}>
              {r.category === "top" ? "Top Pick" : "Campus"}
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-card-foreground text-lg">{r.name}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{r.cuisine} · {r.address}</p>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{r.description}</p>
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /><span className="font-semibold text-foreground">{r.rating}</span></span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-primary" />{r.deliveryTimeMin}–{r.deliveryTimeMax} min</span>
            <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" />₦{r.deliveryFee.toLocaleString()}</span>
          </div>
          {r.minOrder && <p className="text-xs text-muted-foreground mt-1.5">Min. order ₦{r.minOrder.toLocaleString()}</p>}
          <div className="flex items-center gap-1 mt-3 text-primary text-sm font-semibold">
            View Menu <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}