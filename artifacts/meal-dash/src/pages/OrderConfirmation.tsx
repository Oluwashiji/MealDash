import { useParams } from "wouter";
import { Link } from "wouter";
import { CheckCircle, Clock, Truck, ChefHat, Package } from "lucide-react";
import { useGetOrder, getGetOrderQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const statusSteps = [
  { key: "pending", label: "Order Placed", icon: Package },
  { key: "preparing", label: "Preparing", icon: ChefHat },
  { key: "on_the_way", label: "On the Way", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

export default function OrderConfirmation() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || "0", 10);

  const { data: order, isLoading } = useGetOrder(id, {
    query: { enabled: !!id, queryKey: getGetOrderQueryKey(id), refetchInterval: 5000 },
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground text-lg">Order not found</p>
      </div>
    );
  }

  const currentStep = statusSteps.findIndex((s) => s.key === order.status);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground" data-testid="text-order-confirmed">
            {order.status === "delivered" ? "Order Delivered!" : "Order Confirmed!"}
          </h1>
          <p className="text-muted-foreground mt-2">Order #{order.id} from {order.restaurantName}</p>
        </div>

        <div className="rounded-xl border bg-card p-6 mb-6" data-testid="order-status-tracker">
          <h2 className="font-semibold text-lg text-card-foreground mb-6">Order Status</h2>
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
            <div
              className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500"
              style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
            />
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index <= currentStep;
              const isCurrent = index === currentStep;
              return (
                <div key={step.key} className="relative flex flex-col items-center z-10">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs mt-2 font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 mb-6">
          <h2 className="font-semibold text-lg text-card-foreground mb-4">Order Details</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.menuItemId} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-muted-foreground"> x{item.quantity}</span>
                </div>
                <span className="font-medium">N{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>N{order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span>N{order.deliveryFee.toLocaleString()}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">N{order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 mb-6">
          <h2 className="font-semibold text-lg text-card-foreground mb-4">Delivery Info</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer</span>
              <span className="font-medium">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-medium">{order.customerPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Address</span>
              <span className="font-medium">{order.deliveryAddress}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Estimated Delivery</span>
              <span className="flex items-center gap-1 font-medium text-primary">
                <Clock className="w-4 h-4" /> {order.estimatedDelivery}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Link href="/orders">
            <Button variant="outline" data-testid="button-view-orders">View All Orders</Button>
          </Link>
          <Link href="/restaurants">
            <Button data-testid="button-order-again">Order Again</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
