import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, ordersTable, menuItemsTable, restaurantsTable } from "@workspace/db";
import {
  ListOrdersResponse,
  CreateOrderBody,
  GetOrderParams,
  GetOrderResponse,
  UpdateOrderStatusParams,
  UpdateOrderStatusBody,
  UpdateOrderStatusResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/orders", async (_req, res): Promise<void> => {
  const orders = await db
    .select()
    .from(ordersTable)
    .orderBy(desc(ordersTable.createdAt));

  res.json(ListOrdersResponse.parse(orders));
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [restaurant] = await db
    .select()
    .from(restaurantsTable)
    .where(eq(restaurantsTable.id, parsed.data.restaurantId));

  if (!restaurant) {
    res.status(404).json({ error: "Restaurant not found" });
    return;
  }

  const menuItemIds = parsed.data.items.map((i) => i.menuItemId);
  const menuItems = await db
    .select()
    .from(menuItemsTable)
    .where(eq(menuItemsTable.restaurantId, parsed.data.restaurantId));

  const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));

  const orderItems = parsed.data.items.map((item) => {
    const menuItem = menuItemMap.get(item.menuItemId);
    if (!menuItem) {
      throw new Error(`Menu item ${item.menuItemId} not found`);
    }
    return {
      menuItemId: item.menuItemId,
      name: menuItem.name,
      price: menuItem.price,
      quantity: item.quantity,
    };
  });

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = restaurant.deliveryFee;
  const total = subtotal + deliveryFee;

  const estimatedDelivery = `${restaurant.deliveryTimeMin}-${restaurant.deliveryTimeMax} mins`;

  const [order] = await db
    .insert(ordersTable)
    .values({
      restaurantId: parsed.data.restaurantId,
      restaurantName: restaurant.name,
      items: orderItems,
      subtotal: Math.round(subtotal * 100) / 100,
      deliveryFee,
      total: Math.round(total * 100) / 100,
      status: "pending",
      deliveryAddress: parsed.data.deliveryAddress,
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      estimatedDelivery,
    })
    .returning();

  res.status(201).json(GetOrderResponse.parse(order));
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, params.data.id));

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(GetOrderResponse.parse(order));
});

router.patch("/orders/:id/status", async (req, res): Promise<void> => {
  const params = UpdateOrderStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [order] = await db
    .update(ordersTable)
    .set({ status: parsed.data.status })
    .where(eq(ordersTable.id, params.data.id))
    .returning();

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(UpdateOrderStatusResponse.parse(order));
});

export default router;
