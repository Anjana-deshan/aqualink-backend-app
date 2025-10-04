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
import categoryRoutes from "./routes/categoryRoutes.js";
import inventoryHistoryRoutes from "./routes/inventoryHistoryRoutes.js";

// Finance routers
import transactionRouter from "./routes/transactionRouter.js";
import salaryRouter from "./routes/salaryRouter.js";
import paymentRouter from "./routes/paymentRouter.js";
import financeRouter from "./routes/financeRouter.js";

// NEW: Cart + Orders
import cartRouter from "./routes/cartRoutes.js";
import orderRouter from "./routes/orderRoutes.js";

// NEW: Feedback
import feedbackRouter from "./routes/feedbackRouter.js";


const app = express()

// ---------- Middlewares ----------
app.use(cors())
app.use(express.json())
app.use(morgan("dev"));

app.use(
    (req, res, next) => {
        let token = req.header("Authorization");
        if(token != null){
            token = token.replace("Bearer ","")
            console.log("#############################")
            console.log(token)
            jwt.verify(token,"jwt-secret-key",
                (err,decoded)=>{
                    if(decoded == null){
                        res.json(
                            {
                                message: "Invalid token please try again!"
                            }
                        )
                        return
                    }else{
                        req.user = decoded
                    }
                }    
            )
        }

        next()
    }    
);

const connectionString = "mongodb+srv://admin:123@cluster0.yg47z6r.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

mongoose
  .connect(connectionString)
  .then(() => console.log("Database connected."))
  .catch((err) => {
    console.error("Database connection failed.", err?.message);
    process.exit(1);
  });

  // Disable ETag globally (prevents 304 on conditional requests)
app.set('etag', false);

// Or, selectively disable cache on the endpoints the PDF calls:
app.use((req, res, next) => {
  const noStorePaths = [
    '/api/finance/overview',
    '/api/users',
    '/api/transactions',
    '/api/buyer/payments',
  ];
  if (req.method === 'GET' && noStorePaths.includes(req.path)) {
    res.set('Cache-Control', 'no-store'); // always fresh
  }
  next();
});

app.use("/api/users", userRouter)
app.use("/api/users", reportRouter);
app.use("/api/products", productRouter)
app.use("/api/fishstocks", fishStockRouter)
app.use('/api/images', imageRoutes);
app.use('/api/fishinventory', fishInventoryRouter);
app.use("/api/categories", categoryRoutes);
app.use("/api/inventory-history", inventoryHistoryRoutes);

// Finance:
app.use("/api/transactions", transactionRouter); // CRUD + /summary/totals
app.use("/api/salaries", salaryRouter);          // payroll + auto DR transaction
app.use("/api", paymentRouter);                  // /buyer/payments & /orders/:orderId/payments
app.use("/api/finance", financeRouter);

// Cart + Orders
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);

// Feedback
app.use("/api/feedback", feedbackRouter);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});