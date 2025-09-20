import express from "express";
import { 
  createProduct, 
  getAllProducts, 
  getProductByCode, 
  updateProduct, 
  deleteProduct 
} from "../controllers/productController.js";

const productRouter = express.Router();

// Create a new product
productRouter.post("/", createProduct);

// Get all products
productRouter.get("/", getAllProducts);

// Get single product by productCode
productRouter.get("/:productCode", getProductByCode);

// Update product by productCode
productRouter.put("/:productCode", updateProduct);

// Delete product by productCode
productRouter.delete("/:productCode", deleteProduct);

export default productRouter;