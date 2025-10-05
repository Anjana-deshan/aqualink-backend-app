import express from "express";
import {
  getAllFishInventory,
  getFishInventoryById,
  createFishInventory,
  updateFishInventoryItem,
  deleteFishInventoryItem,
} from "../controllers/fishInventoryController.js";

const fishInventoryRouter = express.Router();

// Get all / one inventory item
fishInventoryRouter.get("/", getAllFishInventory);
fishInventoryRouter.get("/:id", getFishInventoryById);

// Create inventory item
fishInventoryRouter.post("/", createFishInventory);

// Update inventory item
fishInventoryRouter.put("/:id", updateFishInventoryItem);

// Delete inventory item
fishInventoryRouter.delete("/:id", deleteFishInventoryItem);

export default fishInventoryRouter;