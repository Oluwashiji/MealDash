import { useState } from "react";
import { Link } from "wouter";
import { Search, Clock } from "lucide-react";
import { useSearchMeals, getSearchMealsQueryKey } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: results, isLoading } = useSearchMeals(
    { q: searchTerm },
    { query: { enabled: searchTerm.length > 0, queryKey: getSearchMealsQueryKey({ q: searchTerm }) } }
  );

  const { addItem } = useCart();
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchTerm(query.trim());
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">Search Meals</h1>

        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search for jollof rice, amala, chicken..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-meals"
            />
          </div>
          <Button type="submit" data-testid="button-search">Search</Button>
        </form>

        {!searchTerm ? (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">Search for your favorite meals across all restaurants</p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : results?.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No meals found for "{searchTerm}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {results?.map((meal) => (
              <div key={meal.id} className="flex gap-4 rounded-xl border bg-card p-4 hover:shadow-md transition-all duration-200" data-testid={`search-result-${meal.id}`}>
                <img src={meal.image} alt={meal.name} className="w-24 h-24 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-card-foreground truncate">{meal.name}</h3>
                  <Link href={`/restaurant/${meal.restaurantId}`}>
                    <p className="text-sm text-primary hover:underline">{meal.restaurantName}</p>
                  </Link>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" /> {meal.deliveryTimeMin}-{meal.deliveryTimeMax} min
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-primary">N{meal.price.toLocaleString()}</span>
                    <Button
                      size="sm"
                      onClick={() => {
                        addItem(
                          { menuItemId: meal.id, name: meal.name, price: meal.price, quantity: 1, image: meal.image },
                          { id: meal.restaurantId, name: meal.restaurantName, deliveryFee: 500, deliveryTimeMin: meal.deliveryTimeMin, deliveryTimeMax: meal.deliveryTimeMax }
                        );
                        toast({ title: "Added to cart", description: `${meal.name} added` });
                      }}
                      data-testid={`button-add-search-${meal.id}`}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
