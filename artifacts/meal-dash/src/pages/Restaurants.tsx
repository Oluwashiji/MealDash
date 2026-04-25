import { useState } from "react";
import { Link, useSearch } from "wouter";
import { Clock, Star, Truck, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { restaurants } from "@/lib/data";

export default function Restaurants() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const initialCategory = params.get("category") || "";
  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState("");

  const filtered = restaurants.filter((r) => {
    const matchesCategory = category ? r.category === category : true;
    const matchesSearch = search
      ? r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Restaurants</h1>
          <p className="text-muted-foreground mt-1">Browse all restaurants in Ibadan</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search restaurants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              data-testid="input-search-restaurants"
            />
          </div>
          <div className="flex gap-2">
            {[
              { value: "", label: "All" },
              { value: "top", label: "Top Restaurants" },
              { value: "campus", label: "Campus" },
            ].map((cat) => (
              <Button
                key={cat.value}
                variant={category === cat.value ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory(cat.value)}
                data-testid={`button-filter-${cat.value || "all"}`}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No restaurants found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((r) => (
              <Link key={r.id} href={`/restaurant/${r.id}`} data-testid={`card-restaurant-${r.id}`}>
                <div className="rounded-xl border bg-card overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
                  <div className="relative h-48 bg-muted overflow-hidden">
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
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-card-foreground text-lg">{r.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${r.category === "top" ? "bg-accent/20 text-accent-foreground" : "bg-secondary/20 text-secondary"}`}>
                        {r.category === "top" ? "Top" : "Campus"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{r.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-accent fill-accent" /> {r.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-primary" /> {r.deliveryTimeMin}-{r.deliveryTimeMax} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5" /> ₦{r.deliveryFee}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}