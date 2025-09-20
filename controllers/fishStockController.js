import FishStock from "../Models/fishStock.js";

// Get all fish stocks
export const getAllFishStocks = async (req, res) => {
  try {
    const fishStocks = await FishStock.find();
    res.status(200).json(fishStocks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching fish stocks", error });
  }
};

// Get a single fish stock by ID
export const getFishStockById = async (req, res) => {
  try {
    const fishStock = await FishStock.findById(req.params.id);
    if (!fishStock) return res.status(404).json({ message: "Fish not found" });
    res.status(200).json(fishStock);
  } catch (error) {
    res.status(500).json({ message: "Error fetching fish", error });
  }
};

// Create a new fish stock
export const createFishStock = async (req, res) => {
  try {
    const { fishCode, title, stock, image } = req.body; // 👈 image comes from frontend payload

    const newFishStock = new FishStock({ fishCode, title, stock, image });
    await newFishStock.save();
    res.status(201).json(newFishStock);
  } catch (error) {
    res.status(500).json({ message: "Error creating fish stock", error });
  }
};


// Update an existing fish stock
export const updateFishStock = async (req, res) => {
  try {
    const { fishCode, title, stock, image } = req.body; 
    const updatedData = { fishCode, title, stock };

    if (image) updatedData.image = image; 

    const updatedFish = await FishStock.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    if (!updatedFish) return res.status(404).json({ message: "Fish not found" });
    res.status(200).json(updatedFish);
  } catch (error) {
    res.status(500).json({ message: "Error updating fish stock", error });
  }
};


// Delete a fish stock
export const deleteFishStock = async (req, res) => {
  try {
    const deletedFish = await FishStock.findByIdAndDelete(req.params.id);
    if (!deletedFish) return res.status(404).json({ message: "Fish not found" });
    res.status(200).json({ message: "Fish deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting fish stock", error });
  }
};
