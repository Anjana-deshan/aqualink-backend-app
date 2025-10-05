import InventoryHistory from "../Models/inventoryHistory.js";

// Get all inventory history records
export const getAllInventoryHistory = async (req, res) => {
  try {
    const inventoryHistory = await InventoryHistory.find()
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.status(200).json(inventoryHistory);
  } catch (error) {
    res.status(500).json({ message: "Error Fetching Inventory History", error });
  }
};

// Get a single inventory history record by ID
export const getInventoryHistoryById = async (req, res) => {
  try {
    const inventoryHistory = await InventoryHistory.findById(req.params.id)
      .populate('user', 'firstName lastName email');
    if (!inventoryHistory) return res.status(404).json({ message: "Inventory history record not found" });
    res.status(200).json(inventoryHistory);
  } catch (error) {
    res.status(500).json({ message: "Error Fetching Inventory History Record", error });
  }
};

// Create a new inventory history record
export const createInventoryHistory = async (req, res) => {
  try {
    const { itemName, assignedSection, quantity, date, time, user } = req.body;

    const newInventoryHistory = new InventoryHistory({ 
      itemName, 
      assignedSection, 
      quantity, 
      date, 
      time, 
      user 
    });
    await newInventoryHistory.save();
    
    // Populate user data before sending response
    await newInventoryHistory.populate('user', 'firstName lastName email');
    res.status(201).json(newInventoryHistory);
  } catch (error) {
    res.status(500).json({ message: "Error Creating Inventory History Record", error });
  }
};

// Update an existing inventory history record
export const updateInventoryHistory = async (req, res) => {
  try {
    const { itemName, assignedSection, quantity, date, time, user } = req.body;
    const updatedData = { itemName, assignedSection, quantity, date, time, user };

    const updatedRecord = await InventoryHistory.findByIdAndUpdate(
      req.params.id, 
      updatedData, 
      { new: true }
    ).populate('user', 'firstName lastName email');
    
    if (!updatedRecord) return res.status(404).json({ message: "Inventory History Record Not Found" });
    res.status(200).json(updatedRecord);
  } catch (error) {
    res.status(500).json({ message: "Error Updating Inventory History Record", error });
  }
};

// Delete an inventory history record
export const deleteInventoryHistory = async (req, res) => {
  try {
    const deletedRecord = await InventoryHistory.findByIdAndDelete(req.params.id);
    if (!deletedRecord) return res.status(404).json({ message: "Inventory History Record Not Found" });
    res.status(200).json({ message: "Inventory History Record Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error Deleting Inventory History Record", error });
  }
};

// Get inventory history by user
export const getInventoryHistoryByUser = async (req, res) => {
  try {
    const inventoryHistory = await InventoryHistory.find({ user: req.params.userId })
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.status(200).json(inventoryHistory);
  } catch (error) {
    res.status(500).json({ message: "Error Fetching User Inventory History", error });
  }
};

// Get inventory history by item name
export const getInventoryHistoryByItem = async (req, res) => {
  try {
    const inventoryHistory = await InventoryHistory.find({ 
      itemName: { $regex: req.params.itemName, $options: 'i' } 
    })
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.status(200).json(inventoryHistory);
  } catch (error) {
    res.status(500).json({ message: "Error Fetching Item Inventory History", error });
  }
};
