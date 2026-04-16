import { Router, type IRouter } from "express";
import { desc, eq, sql } from "drizzle-orm";
import { db, restaurantsTable, menuItemsTable, ordersTable, applicationsTable } from "@workspace/db";
import { GetDashboardSummaryResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const [restaurantCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(restaurantsTable);

  const [menuItemCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(menuItemsTable);

  const [orderCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(ordersTable);

  const [applicationCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(applicationsTable);

  const recentOrders = await db
    .select()
    .from(ordersTable)
    .orderBy(desc(ordersTable.createdAt))
    .limit(5);

  const statusCounts = await db
    .select({
      status: ordersTable.status,
      count: sql<number>`count(*)::int`,
    })
    .from(ordersTable)
    .groupBy(ordersTable.status);

  const statusMap: Record<string, number> = {
    pending: 0,
    preparing: 0,
    on_the_way: 0,
    delivered: 0,
    cancelled: 0,
  };

  for (const row of statusCounts) {
    if (row.status in statusMap) {
      statusMap[row.status] = row.count;
    }
  }

  const summary = {
    totalRestaurants: restaurantCount.count,
    totalMenuItems: menuItemCount.count,
    totalOrders: orderCount.count,
    totalApplications: applicationCount.count,
    recentOrders,
    ordersByStatus: statusMap,
  };

  res.json(GetDashboardSummaryResponse.parse(summary));
});

export default router;
