import express from "express";
import morgan from "morgan";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import cors from "cors";

// Routers
import userRouter from "./routes/userRouter.js";
import reportRouter from "./routes/reportRouter.js";
import productRouter from "./routes/productRouter.js";
import fishStockRouter from "./routes/fishStockRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import fishInventoryRouter from "./routes/fishInventoryRouter.js";

// Finance routers
import transactionRouter from "./routes/transactionRouter.js";
import salaryRouter from "./routes/salaryRouter.js";
import paymentRouter from "./routes/paymentRouter.js";
import financeRouter from "./routes/financeRouter.js";
import reportRouter from "./routes/reportRouter.js";


// NEW: Cart + Orders
import cartRouter from "./routes/cartRoutes.js";
import orderRouter from "./routes/orderRoutes.js";

const app = express();

// ---------- Middlewares ----------
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Auth middleware
app.use((req, res, next) => {
  let token = req.header("Authorization");

  if (token) {
    token = token.replace("Bearer ", "");
    try {
      const decoded = jwt.verify(token, "jwt-secret-key");
      req.user = decoded;
    } catch (err) {
      console.warn("❌ Invalid token:", err.message);
      return res.status(401).json({ message: "Invalid token, please log in again." });
    }
  }

  // Ensure req.user always exists
  if (!req.user) req.user = {};
  if (!req.user.role) req.user.role = req.header("x-role") || "owner"; 
  if (!req.user.buyerId) req.user.buyerId = req.header("x-buyer-id") || null;

  next();
});

// ---------- DB ----------
const connectionString =
  "mongodb+srv://admin:123@cluster0.yg47z6r.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(connectionString)
  .then(() => console.log("✅ Database connected."))
  .catch((err) => {
    console.error("❌ Database connection failed:", err?.message);
    process.exit(1);
  });

<<<<<<< Updated upstream
// ---------- Routes ----------
app.use("/api/users", userRouter);
app.use("/api/users", reportRouter);
app.use("/api/products", productRouter);
app.use("/api/fishstocks", fishStockRouter);
app.use("/api/images", imageRoutes);
app.use("/api/fishinventory", fishInventoryRouter);
=======
app.use("/api/users", userRouter);
app.use("/api/users", reportRouter);
app.use("/api/products", productRouter)
app.use("/api/fishstocks", fishStockRouter);
app.use('/api/images', imageRoutes);
app.use('/api/fishinventory', fishInventoryRouter);
>>>>>>> Stashed changes

// Finance
app.use("/api/transactions", transactionRouter);
app.use("/api/salaries", salaryRouter);
app.use("/api", paymentRouter); // ⚠️ make sure this doesn't shadow others
app.use("/api/finance", financeRouter);

// Cart + Orders
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);

// ---------- Server ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
});
