import { Router, type IRouter } from "express";
import { eq, and, ilike } from "drizzle-orm";
import { db, menuItemsTable, restaurantsTable } from "@workspace/db";
import {
  GetMenuParams,
  GetMenuQueryParams,
  GetMenuResponse,
  GetPopularMealsResponse,
  AdminCreateMenuItemBody,
  AdminUpdateMenuItemParams,
  AdminUpdateMenuItemBody,
  AdminUpdateMenuItemResponse,
  AdminDeleteMenuItemParams,
  SearchMealsQueryParams,
  SearchMealsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/restaurants/:restaurantId/menu", async (req, res): Promise<void> => {
  const params = GetMenuParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const query = GetMenuQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const conditions = [eq(menuItemsTable.restaurantId, params.data.restaurantId)];
  if (query.data.category) {
    conditions.push(eq(menuItemsTable.category, query.data.category));
  }

  const items = await db
    .select()
    .from(menuItemsTable)
    .where(and(...conditions))
    .orderBy(menuItemsTable.name);

  res.json(GetMenuResponse.parse(items));
});

router.get("/popular-meals", async (_req, res): Promise<void> => {
  const items = await db
    .select({
      id: menuItemsTable.id,
      name: menuItemsTable.name,
      description: menuItemsTable.description,
      price: menuItemsTable.price,
      image: menuItemsTable.image,
      category: menuItemsTable.category,
      restaurantId: menuItemsTable.restaurantId,
      restaurantName: restaurantsTable.name,
      deliveryTimeMin: restaurantsTable.deliveryTimeMin,
      deliveryTimeMax: restaurantsTable.deliveryTimeMax,
    })
    .from(menuItemsTable)
    .innerJoin(restaurantsTable, eq(menuItemsTable.restaurantId, restaurantsTable.id))
    .where(eq(menuItemsTable.isPopular, true))
    .limit(12);

  res.json(GetPopularMealsResponse.parse(items));
});

router.get("/search/meals", async (req, res): Promise<void> => {
  const query = SearchMealsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const items = await db
    .select({
      id: menuItemsTable.id,
      name: menuItemsTable.name,
      description: menuItemsTable.description,
      price: menuItemsTable.price,
      image: menuItemsTable.image,
      category: menuItemsTable.category,
      restaurantId: menuItemsTable.restaurantId,
      restaurantName: restaurantsTable.name,
      deliveryTimeMin: restaurantsTable.deliveryTimeMin,
      deliveryTimeMax: restaurantsTable.deliveryTimeMax,
    })
    .from(menuItemsTable)
    .innerJoin(restaurantsTable, eq(menuItemsTable.restaurantId, restaurantsTable.id))
    .where(ilike(menuItemsTable.name, `%${query.data.q}%`))
    .limit(20);

  res.json(SearchMealsResponse.parse(items));
});

router.post("/admin/menu-items", async (req, res): Promise<void> => {
  const parsed = AdminCreateMenuItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [item] = await db
    .insert(menuItemsTable)
    .values({
      ...parsed.data,
      isAvailable: parsed.data.isAvailable ?? true,
      isPopular: parsed.data.isPopular ?? false,
    })
    .returning();

  res.status(201).json(item);
});

router.patch("/admin/menu-items/:id", async (req, res): Promise<void> => {
  const params = AdminUpdateMenuItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = AdminUpdateMenuItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [item] = await db
    .update(menuItemsTable)
    .set(parsed.data)
    .where(eq(menuItemsTable.id, params.data.id))
    .returning();

  if (!item) {
    res.status(404).json({ error: "Menu item not found" });
    return;
  }

  res.json(AdminUpdateMenuItemResponse.parse(item));
});

router.delete("/admin/menu-items/:id", async (req, res): Promise<void> => {
  const params = AdminDeleteMenuItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [item] = await db
    .delete(menuItemsTable)
    .where(eq(menuItemsTable.id, params.data.id))
    .returning();

  if (!item) {
    res.status(404).json({ error: "Menu item not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
