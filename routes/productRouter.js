import express from 'express';
import { 
  createProduct, 
  getAllProducts, 
  getProductById, 
  updateProduct, 
  deleteProduct 
} from '../controllers/productController.js';

const productRouter = express.Router();

// Create a new product
productRouter.post("/", createProduct);

// Get all products
productRouter.get("/", getAllProducts);

// Get single product by id
productRouter.get("/:id", getProductById);

// Update product by id
productRouter.put("/:id", updateProduct);

// Delete product by id
productRouter.delete("/:id", deleteProduct);

export default productRouter;
