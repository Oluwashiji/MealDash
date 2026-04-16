import { pgTable, text, serial, timestamp, integer, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull(),
  restaurantName: text("restaurant_name").notNull(),
  items: jsonb("items").notNull().$type<Array<{ menuItemId: number; name: string; price: number; quantity: number }>>(),
  subtotal: real("subtotal").notNull(),
  deliveryFee: real("delivery_fee").notNull(),
  total: real("total").notNull(),
  status: text("status").notNull().default("pending"),
  deliveryAddress: text("delivery_address").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  estimatedDelivery: text("estimated_delivery").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
