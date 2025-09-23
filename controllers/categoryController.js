// backend: controllers/categoryController.js
import Category from "../Models/Category.js";

// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const cats = await Category.find().sort({ name: 1 });
    res.status(200).json(cats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch categories", error: err.message });
  }
};

// Create category (name, lowStockThreshold)
export const createCategory = async (req, res) => {
  try {
    const { name, lowStockThreshold } = req.body;
    if (!name) return res.status(400).json({ message: "Category name required" });

    // Normalize
    const normalized = String(name).trim().toLowerCase();

    // Validation: start with a letter, can contain letters/numbers (no symbols)
    if (!/^[A-Za-z][A-Za-z0-9]*$/.test(normalized)) {
      return res.status(400).json({
        message: "Category must start with a letter and contain only letters and numbers (no symbols)",
      });
    }

    const existing = await Category.findOne({ name: normalized });
    if (existing) return res.status(409).json({ message: "Category already exists" });

    const threshold = typeof lowStockThreshold === "number" ? lowStockThreshold : Number(lowStockThreshold || 10);
    const cat = await Category.create({ name: normalized, lowStockThreshold: threshold });
    res.status(201).json(cat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create category", error: err.message });
  }
};

// Update category (optional)
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { lowStockThreshold } = req.body;

    const updated = await Category.findByIdAndUpdate(id, { lowStockThreshold }, { new: true });
    if (!updated) return res.status(404).json({ message: "Category not found" });
    res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update category", error: err.message });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Category not found" });
    res.status(200).json({ message: "Category deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete", error: err.message });
  }
};
