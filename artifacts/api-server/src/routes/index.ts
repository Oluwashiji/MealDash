import { Router, type IRouter } from "express";
import healthRouter from "./health";
import restaurantsRouter from "./restaurants";
import menuRouter from "./menu";
import ordersRouter from "./orders";
import applicationsRouter from "./applications";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(restaurantsRouter);
router.use(menuRouter);
router.use(ordersRouter);
router.use(applicationsRouter);
router.use(dashboardRouter);

export default router;
