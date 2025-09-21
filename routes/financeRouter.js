// routes/financeRouter.js
import { Router } from "express";
import { overview, events } from "../controllers/financeController.js";

const router = Router();

router.get("/overview", overview);
router.get("/events", events); // SSE live updates

export default router;
