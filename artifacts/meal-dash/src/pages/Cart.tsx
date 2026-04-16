import { Link } from "wouter";
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Separator } from "@/components/ui/separator";

export default function Cart() {
  const { cart, updateQuantity, removeItem, clearCart, subtotal, total, itemCount } = useCart();

  if (itemCount === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Browse restaurants and add some delicious meals!</p>
        <Link href="/restaurants">
          <Button className="gap-2" data-testid="button-browse-restaurants">
            Browse Restaurants <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Your Cart</h1>
            <p className="text-muted-foreground mt-1">
              From <span className="text-primary font-medium">{cart.restaurantName}</span>
            </p>
          </div>
          <Button variant="ghost" size="sm" className="text-destructive" onClick={clearCart} data-testid="button-clear-cart">
            <Trash2 className="w-4 h-4 mr-1" /> Clear
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.menuItemId}
                className="flex items-center gap-4 p-4 rounded-xl border bg-card"
                data-testid={`cart-item-${item.menuItemId}`}
              >
                <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-card-foreground truncate">{item.name}</h3>
                  <p className="text-primary font-bold mt-1">N{item.price.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 rounded-full"
                    onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                    data-testid={`button-cart-decrease-${item.menuItemId}`}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="font-semibold w-6 text-center" data-testid={`text-cart-quantity-${item.menuItemId}`}>{item.quantity}</span>
                  <Button
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                    data-testid={`button-cart-increase-${item.menuItemId}`}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive h-8 w-8"
                  onClick={() => removeItem(item.menuItemId)}
                  data-testid={`button-remove-${item.menuItemId}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-xl border bg-card p-6 sticky top-24" data-testid="order-summary">
              <h3 className="font-semibold text-lg text-card-foreground mb-4">Order Summary</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                  <span className="font-medium" data-testid="text-subtotal">N{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-medium" data-testid="text-delivery-fee">N{cart.deliveryFee.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-primary" data-testid="text-total">N{total.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground bg-muted rounded-lg p-3">
                <Clock className="w-4 h-4 text-primary" />
                <span>Estimated delivery: {cart.deliveryTimeMin}-{cart.deliveryTimeMax} min</span>
              </div>

              <Link href="/checkout">
                <Button className="w-full mt-6 gap-2" size="lg" data-testid="button-checkout">
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
