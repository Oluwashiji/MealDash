import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db, applicationsTable } from "@workspace/db";
import {
  ListApplicationsResponse,
  CreateApplicationBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/applications", async (_req, res): Promise<void> => {
  const applications = await db
    .select()
    .from(applicationsTable)
    .orderBy(desc(applicationsTable.createdAt));

  res.json(ListApplicationsResponse.parse(applications));
});

router.post("/applications", async (req, res): Promise<void> => {
  const parsed = CreateApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [application] = await db
    .insert(applicationsTable)
    .values({
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      role: parsed.data.role,
      portfolioLink: parsed.data.portfolioLink ?? null,
      message: parsed.data.message ?? null,
    })
    .returning();

  res.status(201).json(application);
});

export default router;
