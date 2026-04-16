import { Link } from "wouter";
import { Package, Clock, ChefHat, Truck, CheckCircle, XCircle } from "lucide-react";
import { useListOrders } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const statusConfig: Record<string, { label: string; icon: typeof Package; color: string }> = {
  pending: { label: "Pending", icon: Package, color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20" },
  preparing: { label: "Preparing", icon: ChefHat, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
  on_the_way: { label: "On the Way", icon: Truck, color: "text-primary bg-primary/10" },
  delivered: { label: "Delivered", icon: CheckCircle, color: "text-green-600 bg-green-50 dark:bg-green-900/20" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "text-destructive bg-destructive/10" },
};

export default function Orders() {
  const { data: orders, isLoading } = useListOrders();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Order History</h1>
        <p className="text-muted-foreground mb-8">Track your past and current orders</p>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : orders?.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">Start ordering from your favorite restaurants!</p>
            <Link href="/restaurants">
              <Button data-testid="button-start-ordering">Browse Restaurants</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders?.map((order) => {
              const config = statusConfig[order.status] || statusConfig.pending;
              const Icon = config.icon;
              return (
                <Link key={order.id} href={`/order-confirmation/${order.id}`} data-testid={`card-order-${order.id}`}>
                  <div className="rounded-xl border bg-card p-4 sm:p-6 hover:shadow-md transition-all duration-200 cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-card-foreground">Order #{order.id}</h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                            <Icon className="w-3 h-3" /> {config.label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{order.restaurantName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary text-lg">N{order.total.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end mt-1">
                          <Clock className="w-3 h-3" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-muted-foreground">
                      {order.items.map((item) => item.name).join(", ")}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
