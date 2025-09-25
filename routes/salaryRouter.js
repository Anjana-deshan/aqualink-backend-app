// routes/salaryRouter.js
import { Router } from "express";
import { create, list, getOne, update, remove,  events} from "../controllers/salaryController.js";

const router = Router();

router.post("/", create);
router.get("/", list);
router.get("/events", events);
router.get("/:id", getOne);
router.patch("/:id", update);
router.delete("/:id", remove);

export default router;
