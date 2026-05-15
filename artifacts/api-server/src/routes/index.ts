// artifacts/api-server/src/routes/index.ts
// Replace your existing routes/index.ts with this
import { Router } from "express";
import restaurantsRouter from "./restaurants";
import menuRouter from "./menu";
import ordersRouter from "./orders";
import healthRouter from "./health";
import adminRouter from "./admin";

const router = Router();

router.use("/health", healthRouter);
router.use("/restaurants", restaurantsRouter);
router.use("/menu", menuRouter);
router.use("/orders", ordersRouter);
router.use("/admin", adminRouter);

export default router;