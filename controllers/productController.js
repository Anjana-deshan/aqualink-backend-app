import Product from "../Models/product.js"; // adjust path if needed

// CREATE a new product
export const createProduct = async (req, res) => {
  try {
    const { title, price, stock, image } = req.body;

    // auto-set status based on stock
    const status = stock > 0 ? "In Stock" : "Out of Stock";

    const newProduct = new Product({
      title,
      price,
      stock,
      status,
      image,
    });

    const savedProduct = await newProduct.save().then(
        ()=>{
            res.json({
                message: "Product added successfully"
            })
        }
    )
  } catch (error) {
    ()=>{
            res.json({
                message: "Failed to add Product"
            })
        }
  }
};

// READ all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ single product by id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE product by id
export const updateProduct = async (req, res) => {
  try {
    const { title, price, stock, image } = req.body;

    // auto-set status based on stock if stock is provided
    const status = stock !== undefined ? (stock > 0 ? "In Stock" : "Out of Stock") : undefined;

    const updatedData = { title, price, stock, image };
    if (status) updatedData.status = status;

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    if (!updatedProduct) return res.status(404).json({ message: "Product not found" });

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE product by id
export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
