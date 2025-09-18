import express from "express";
import {
  getAllFishStocks,
  getFishStockById,
  createFishStock,
  updateFishStock,
  deleteFishStock,
} from "../controllers/fishStockController.js";

import { upload } from "../utils/upload.js";

const fishStockRouter = express.Router();

// Get all / one fish
fishStockRouter.get("/", getAllFishStocks);
fishStockRouter.get("/:id", getFishStockById);

// Create fish stock with optional image
fishStockRouter.post("/", upload.single("image"), createFishStock);

// Update fish stock with optional image
fishStockRouter.put("/:id", upload.single("image"), updateFishStock);

// Delete fish
fishStockRouter.delete("/:id", deleteFishStock);

export default fishStockRouter;
