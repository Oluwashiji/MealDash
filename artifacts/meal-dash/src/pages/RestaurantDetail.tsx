import { useState } from "react";
import { useParams } from "wouter";
import { Clock, Star, Truck, MapPin, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { restaurants, menuItems } from "@/lib/data";

export default function RestaurantDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || "0", 10);
  const [menuCategory, setMenuCategory] = useState("");

  const restaurant = restaurants.find((r) => r.id === id);
  const allItems = menuItems.filter((m) => m.restaurantId === id && m.isAvailable);
  const filtered = menuCategory ? allItems.filter((m) => m.category === menuCategory) : allItems;
  const categories = [...new Set(allItems.map((m) => m.category))];

  const { addItem, cart, updateQuantity } = useCart();
  const { toast } = useToast();

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-lg">Restaurant not found</p>
      </div>
    );
  }

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
            <Truck className="w-4 h-4" /> ₦{restaurant.deliveryFee} delivery
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
            <Button variant={menuCategory === "" ? "default" : "outline"} size="sm" onClick={() => setMenuCategory("")} data-testid="button-menu-all">
              All
            </Button>
            {categories.map((cat) => (
              <Button key={cat} variant={menuCategory === cat ? "default" : "outline"} size="sm" onClick={() => setMenuCategory(cat)} data-testid={`button-menu-${cat}`}>
                {cat}
              </Button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => {
            const cartItem = cart.items.find((ci) => ci.menuItemId === item.id);
            return (
              <div key={item.id} className="rounded-xl border bg-card overflow-hidden group hover:shadow-md transition-all duration-200" data-testid={`card-menu-item-${item.id}`}>
                <div className="relative h-40 bg-muted overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  {item.isPopular && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-xs font-medium">Popular</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-card-foreground">{item.name}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-bold text-primary">₦{item.price.toLocaleString()}</span>
                    {cartItem ? (
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="outline" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(item.id, cartItem.quantity - 1)} data-testid={`button-decrease-${item.id}`}>
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="font-semibold w-6 text-center" data-testid={`text-quantity-${item.id}`}>{cartItem.quantity}</span>
                        <Button size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(item.id, cartItem.quantity + 1)} data-testid={`button-increase-${item.id}`}>
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
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}