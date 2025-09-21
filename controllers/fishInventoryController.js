import FishInventory from "../Models/fishInventory.js";

//Get all inventories
export const getAllFishInventory = async (req, res) => {
  try {
    const fishInventory = await FishInventory.find();
    res.status(200).json(fishInventory);
  } catch (error) {
    res.status(500).json({ message: "Error Fetching Inventory", error });
  }
};

// Get a single item stock by ID
export const getFishInventoryById = async (req, res) => {
  try {
    const fishInventory = await FishInventory.findById(req.params.id);
    if (!fishInventory) return res.status(404).json({ message: "Item not found" });
    res.status(200).json(fishInventory);
  } catch (error) {
    res.status(500).json({ message: "Error Fetching Item", error });
  }
};

// Create a new inventory item
export const createFishInventory = async (req, res) => {
  try {
    const { itemCode, itemName, stock, category } = req.body;

    const newFishItem = new FishInventory({ itemCode, itemName, stock, category });
    await newFishItem.save();
    res.status(201).json(newFishItem);
  } catch (error) {
    res.status(500).json({ message: "Error Creating Item", error });
  }
};

// Update an existing Item
export const updateFishInventoryItem = async (req, res) => {
  try {
    const { itemCode, itemName, stock, category } = req.body; 
    const updatedData = { itemCode, itemName, stock, category }; 

    const updatedItem = await FishInventory.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    if (!updatedItem) return res.status(404).json({ message: "Item Not Found" });
    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: "Error Updating Item", error });
  }
};

// Delete a Item
export const deleteFishInventoryItem = async (req, res) => {
  try {
    const deletedItem = await FishInventory.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ message: "Item Not Found" });
    res.status(200).json({ message: "Item Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error Deleting Item", error });
  }
};
