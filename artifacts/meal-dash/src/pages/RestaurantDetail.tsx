import { useState } from "react";
import { useParams } from "wouter";
import { Clock, Star, Truck, MapPin, Plus, Minus } from "lucide-react";
import { useGetRestaurant, getGetRestaurantQueryKey, useGetMenu, getGetMenuQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

export default function RestaurantDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || "0", 10);
  const [menuCategory, setMenuCategory] = useState("");

  const { data: restaurant, isLoading: loadingRestaurant } = useGetRestaurant(id, {
    query: { enabled: !!id, queryKey: getGetRestaurantQueryKey(id) },
  });

  const { data: menuItems, isLoading: loadingMenu } = useGetMenu(id, { category: menuCategory || undefined }, {
    query: { enabled: !!id, queryKey: getGetMenuQueryKey(id, { category: menuCategory || undefined }) },
  });

  const { addItem, cart, updateQuantity } = useCart();
  const { toast } = useToast();

  if (loadingRestaurant) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-lg">Restaurant not found</p>
      </div>
    );
  }

  const categories = menuItems
    ? [...new Set(menuItems.map((item) => item.category))]
    : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-64 sm:h-80 bg-muted overflow-hidden">
        <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-2 mb-2 flex-wrap">
              {restaurant.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">{tag}</span>
              ))}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white" data-testid="text-restaurant-name">{restaurant.name}</h1>
            <p className="text-white/80 mt-1 max-w-xl">{restaurant.description}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-b border-border pb-6 mb-6">
          <span className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-accent fill-accent" /> {restaurant.rating} rating
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-primary" /> {restaurant.deliveryTimeMin}-{restaurant.deliveryTimeMax} min
          </span>
          <span className="flex items-center gap-1.5">
            <Truck className="w-4 h-4" /> N{restaurant.deliveryFee} delivery
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" /> {restaurant.address}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${restaurant.isOpen ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"}`}>
            {restaurant.isOpen ? "Open" : "Closed"}
          </span>
        </div>

        {categories.length > 0 && (
          <div className="flex gap-2 mb-6 flex-wrap">
            <Button
              variant={menuCategory === "" ? "default" : "outline"}
              size="sm"
              onClick={() => setMenuCategory("")}
              data-testid="button-menu-all"
            >
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={menuCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setMenuCategory(cat)}
                data-testid={`button-menu-${cat}`}
              >
                {cat}
              </Button>
            ))}
          </div>
        )}

        {loadingMenu ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : menuItems?.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No menu items available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems?.map((item) => {
              const cartItem = cart.items.find((ci) => ci.menuItemId === item.id);
              return (
                <div
                  key={item.id}
                  className="rounded-xl border bg-card overflow-hidden group hover:shadow-md transition-all duration-200"
                  data-testid={`card-menu-item-${item.id}`}
                >
                  <div className="relative h-40 bg-muted overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    {item.isPopular && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-xs font-medium">Popular</span>
                    )}
                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
                        <span className="text-background font-bold">Unavailable</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-card-foreground">{item.name}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-bold text-primary">N{item.price.toLocaleString()}</span>
                      {item.isAvailable && (
                        cartItem ? (
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 rounded-full"
                              onClick={() => updateQuantity(item.id, cartItem.quantity - 1)}
                              data-testid={`button-decrease-${item.id}`}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="font-semibold w-6 text-center" data-testid={`text-quantity-${item.id}`}>{cartItem.quantity}</span>
                            <Button
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              onClick={() => updateQuantity(item.id, cartItem.quantity + 1)}
                              data-testid={`button-increase-${item.id}`}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => {
                              addItem(
                                { menuItemId: item.id, name: item.name, price: item.price, quantity: 1, image: item.image },
                                { id: restaurant.id, name: restaurant.name, deliveryFee: restaurant.deliveryFee, deliveryTimeMin: restaurant.deliveryTimeMin, deliveryTimeMax: restaurant.deliveryTimeMax }
                              );
                              toast({ title: "Added to cart", description: `${item.name} added to your cart` });
                            }}
                            data-testid={`button-add-${item.id}`}
                          >
                            <Plus className="w-4 h-4 mr-1" /> Add
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
