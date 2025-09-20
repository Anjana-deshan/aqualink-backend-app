// index.js  (ESM)
import express from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

// existing routers (must be ESM with `export default router`)
import userRouter from "./routes/userRouter.js";
import productRouter from "./routes/productRouter.js";

// NEW finance routers (create these files as shown earlier, and export default router)
import transactionRouter from "./routes/transactionRouter.js";
import salaryRouter from "./routes/salaryRouter.js";
import paymentRouter from "./routes/paymentRouter.js";

const app = express();

// ---------- Middlewares ----------
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

/**
 * Auth context:
 * - If Authorization: Bearer <token> is present, verify and set req.user from JWT.
 * - Otherwise, allow dev headers x-role / x-buyer-id to simulate roles.
 * - Routes can check req.user.role === 'owner' or 'buyer'.
 */
app.use((req, res, next) => {
  const auth = req.header("Authorization");
  if (auth?.startsWith("Bearer ")) {
    const token = auth.replace("Bearer ", "");
    try {
      const decoded = jwt.verify(token, "jwt-secret-key"); // TODO: move to env var
      req.user = decoded || {};
    } catch (err) {
      // Invalid token -> optional: return 401, or continue as guest.
      // Here we continue, but without req.user from JWT.
      // return res.status(401).json({ message: "Invalid token" });
    }
  }

  // Dev fallback for role-based pages (remove when real auth is wired)
  if (!req.user) req.user = {};
  if (!req.user.role) req.user.role = req.header("x-role") || "owner"; // 'owner' | 'buyer'
  if (!req.user.buyerId) req.user.buyerId = req.header("x-buyer-id") || null;

  next();
});

// ---------- Routes ----------
app.use("/api/users", userRouter);
app.use("/api/products", productRouter);

// Finance:
app.use("/api/transactions", transactionRouter); // CRUD + /summary/totals
app.use("/api/salaries", salaryRouter);          // payroll + auto DR transaction
app.use("/api", paymentRouter);                  // /buyer/payments & /orders/:orderId/payments

// ---------- DB & Server ----------
const connectionString =
  process.env.MONGO_URI ||
  "mongodb+srv://admin:123@cluster0.yg47z6r.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(connectionString)
  .then(() => console.log("Database connected."))
  .catch((err) => {
    console.error("Database connection failed.", err?.message);
    process.exit(1);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
