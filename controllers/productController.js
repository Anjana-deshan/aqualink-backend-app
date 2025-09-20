import Product from "../Models/product.js";

// CREATE a new product
export const createProduct = async (req, res) => {
  try {
    const { productCode, title, price, image, fishCode } = req.body;

    const newProduct = new Product({
      productCode,
      title,
      price,
      image,
      fishCode,
    });

    await newProduct.save();

    res.status(201).json({ message: "Product added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to add Product", error: error.message });
  }
};

// READ all products
export const getAllProducts = async (req, res) => {
  try {
    // Remove .populate("fishCode") since fishCode is a String, not ObjectId
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ single product by productCode
export const getProductByCode = async (req, res) => {
  try {
    const { productCode } = req.params;
    const product = await Product.findOne({ productCode: productCode });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE product by productCode
export const updateProduct = async (req, res) => {
  try {
    const { productCode } = req.params;
    const { title, price, image, fishCode } = req.body;

    const updatedData = { title, price, image, fishCode };

    const updatedProduct = await Product.findOneAndUpdate(
      { productCode: productCode },
      updatedData,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE product by productCode
export const deleteProduct = async (req, res) => {
  try {
    const { productCode } = req.params;
    
    const deletedProduct = await Product.findOneAndDelete({ productCode: productCode });
    
    if (!deletedProduct) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};