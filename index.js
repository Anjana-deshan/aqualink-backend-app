import express from "express";
import morgan from "morgan";
import mongoose from "mongoose";
import userRouter from "./routes/userRouter.js";
import jwt from "jsonwebtoken";
import cors from "cors"
import productRouter from "./routes/productRouter.js";
import fishStockRouter from "./routes/fishStockRoutes.js";
import imageRoutes from './routes/imageRoutes.js';
import fishInventoryRouter from "./routes/fishInventoryRouter.js";
import userRoutes from "./routes/userRouter.js";

// NEW finance routers (create these files as shown earlier, and export default router)
import transactionRouter from "./routes/transactionRouter.js";
import salaryRouter from "./routes/salaryRouter.js";
import paymentRouter from "./routes/paymentRouter.js";
import financeRouter from "./routes/financeRouter.js";


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

        if (!req.user) req.user = {};
        if (!req.user.role) req.user.role = req.header("x-role") || "owner"; // 'owner' | 'buyer'
        if (!req.user.buyerId) req.user.buyerId = req.header("x-buyer-id") || null;


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

app.use("/api/users", userRouter)
app.use("/api/products", productRouter)
app.use("/api/fishstocks", fishStockRouter)
app.use('/api/images', imageRoutes);
app.use('/api/fishinventory', fishInventoryRouter);

// Finance:
app.use("/api/transactions", transactionRouter); // CRUD + /summary/totals
app.use("/api/salaries", salaryRouter);          // payroll + auto DR transaction
app.use("/api", paymentRouter);                  // /buyer/payments & /orders/:orderId/payments
app.use("/api/finance", financeRouter);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});