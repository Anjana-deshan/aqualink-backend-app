// routes/transactionRouter.js
import { Router } from "express";
import { create, list, getOne, update, remove, summaryTotals } from "../controllers/transactionController.js";

const router = Router();

router.post("/", create);
router.get("/", list);
router.get("/summary/totals", summaryTotals);
router.get("/:id", getOne);
router.patch("/:id", update);
router.delete("/:id", remove);

export default router;
