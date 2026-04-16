import { Router, type IRouter } from "express";
import { eq, ilike, and } from "drizzle-orm";
import { db, restaurantsTable } from "@workspace/db";
import {
  ListRestaurantsQueryParams,
  ListRestaurantsResponse,
  GetRestaurantParams,
  GetRestaurantResponse,
  AdminCreateRestaurantBody,
  AdminUpdateRestaurantParams,
  AdminUpdateRestaurantBody,
  AdminUpdateRestaurantResponse,
  AdminDeleteRestaurantParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/restaurants", async (req, res): Promise<void> => {
  const query = ListRestaurantsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const conditions = [];
  if (query.data.category) {
    conditions.push(eq(restaurantsTable.category, query.data.category));
  }
  if (query.data.search) {
    conditions.push(ilike(restaurantsTable.name, `%${query.data.search}%`));
  }

  const restaurants = await db
    .select()
    .from(restaurantsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(restaurantsTable.name);

  res.json(ListRestaurantsResponse.parse(restaurants));
});

router.get("/restaurants/:id", async (req, res): Promise<void> => {
  const params = GetRestaurantParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [restaurant] = await db
    .select()
    .from(restaurantsTable)
    .where(eq(restaurantsTable.id, params.data.id));

  if (!restaurant) {
    res.status(404).json({ error: "Restaurant not found" });
    return;
  }

  res.json(GetRestaurantResponse.parse(restaurant));
});

router.post("/admin/restaurants", async (req, res): Promise<void> => {
  const parsed = AdminCreateRestaurantBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [restaurant] = await db
    .insert(restaurantsTable)
    .values({
      ...parsed.data,
      rating: parsed.data.rating ?? 4.0,
      isOpen: parsed.data.isOpen ?? true,
      tags: parsed.data.tags ?? [],
    })
    .returning();

  res.status(201).json(GetRestaurantResponse.parse(restaurant));
});

router.patch("/admin/restaurants/:id", async (req, res): Promise<void> => {
  const params = AdminUpdateRestaurantParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = AdminUpdateRestaurantBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [restaurant] = await db
    .update(restaurantsTable)
    .set(parsed.data)
    .where(eq(restaurantsTable.id, params.data.id))
    .returning();

  if (!restaurant) {
    res.status(404).json({ error: "Restaurant not found" });
    return;
  }

  res.json(AdminUpdateRestaurantResponse.parse(restaurant));
});

router.delete("/admin/restaurants/:id", async (req, res): Promise<void> => {
  const params = AdminDeleteRestaurantParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [restaurant] = await db
    .delete(restaurantsTable)
    .where(eq(restaurantsTable.id, params.data.id))
    .returning();

  if (!restaurant) {
    res.status(404).json({ error: "Restaurant not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
