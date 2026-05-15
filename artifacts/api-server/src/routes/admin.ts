// artifacts/api-server/src/routes/admin.ts
import { Router } from "express";
import { db, restaurantsTable, menuItemsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// ── Restaurants ──────────────────────────────────────────────

// GET all restaurants
router.get("/restaurants", async (_req, res) => {
  try {
    const rows = await db.select().from(restaurantsTable);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch restaurants" });
  }
});

// PUT update a restaurant (image, name, description, etc.)
router.put("/restaurants/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, description, image, isOpen, deliveryFee, deliveryTimeMin, deliveryTimeMax, tags, address, category } = req.body;
    const updated = await db
      .update(restaurantsTable)
      .set({ name, description, image, isOpen, deliveryFee, deliveryTimeMin, deliveryTimeMax, tags, address, category })
      .where(eq(restaurantsTable.id, id))
      .returning();
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update restaurant" });
  }
});

// ── Menu Items ────────────────────────────────────────────────

// GET all menu items (optionally filter by restaurantId)
router.get("/menu", async (req, res) => {
  try {
    const restaurantId = req.query.restaurantId ? parseInt(req.query.restaurantId as string) : null;
    const rows = restaurantId
      ? await db.select().from(menuItemsTable).where(eq(menuItemsTable.restaurantId, restaurantId))
      : await db.select().from(menuItemsTable);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch menu items" });
  }
});

// POST add a new menu item
router.post("/menu", async (req, res) => {
  try {
    const { restaurantId, name, description, price, image, category, isAvailable, isPopular } = req.body;
    const inserted = await db
      .insert(menuItemsTable)
      .values({ restaurantId, name, description, price, image, category, isAvailable: isAvailable ?? true, isPopular: isPopular ?? false })
      .returning();
    res.json(inserted[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to add menu item" });
  }
});

// PUT update a menu item
router.put("/menu/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, description, price, image, category, isAvailable, isPopular } = req.body;
    const updated = await db
      .update(menuItemsTable)
      .set({ name, description, price, image, category, isAvailable, isPopular })
      .where(eq(menuItemsTable.id, id))
      .returning();
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update menu item" });
  }
});

// DELETE a menu item
router.delete("/menu/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(menuItemsTable).where(eq(menuItemsTable.id, id));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete menu item" });
  }
});

export default router;