import express from "express";
import {
  getAllInventoryHistory,
  getInventoryHistoryById,
  createInventoryHistory,
  updateInventoryHistory,
  deleteInventoryHistory,
  getInventoryHistoryByUser,
  getInventoryHistoryByItem,
} from "../controllers/inventoryHistoryController.js";
import InventoryHistory from "../Models/inventoryHistory.js";

const inventoryHistoryRouter = express.Router();
const router = express.Router();

// Get all inventory history records
inventoryHistoryRouter.get("/", getAllInventoryHistory);

// Get inventory history by user
inventoryHistoryRouter.get("/user/:userId", getInventoryHistoryByUser);

// Get inventory history by item name
inventoryHistoryRouter.get("/item/:itemName", getInventoryHistoryByItem);

// Get a single inventory history record by ID
inventoryHistoryRouter.get("/:id", getInventoryHistoryById);

// Create inventory history record
inventoryHistoryRouter.post("/", createInventoryHistory);

// Update inventory history record
inventoryHistoryRouter.put("/:id", updateInventoryHistory);

// Delete inventory history record
inventoryHistoryRouter.delete("/:id", deleteInventoryHistory);


// Add history entry
router.post("/", async (req, res) => {
  try {
    const history = new InventoryHistory(req.body);
    await history.save();
    res.status(201).json(history);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all history (with optional filters)
router.get("/", async (req, res) => {
  try {
    const { itemName, user, action } = req.query;
    const filter = {};

    if (itemName) filter.itemName = new RegExp(itemName, "i");
    if (user) filter.user = new RegExp(user, "i");
    if (action) filter.action = action;

    const history = await InventoryHistory.find(filter).sort({ dateTime: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single history by ID
router.get("/:id", async (req, res) => {
  try {
    const history = await InventoryHistory.findById(req.params.id);
    if (!history) return res.status(404).json({ message: "Not found" });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a history record (optional)
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await InventoryHistory.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "History deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
export default router;

// export default inventoryHistoryRouter;
