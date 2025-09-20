import express from "express";
import mongoose from "mongoose";
import userRouter from "./routes/userRouter.js";
import jwt from "jsonwebtoken";
import cors from "cors"
import productRouter from "./routes/productRouter.js";
import fishStockRouter from "./routes/fishStockRoutes.js";

const app = express()

app.use(cors())

app.use(express.json())

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
)

const connectionString = "mongodb+srv://admin:123@cluster0.yg47z6r.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

mongoose.connect(connectionString).then(
    ()=>{
        console.log("Database Connected.")
    }
).catch(
    ()=>{
        console.log("Database Connection Failed.")
    }
)

app.use("/api/users", userRouter)
app.use("/api/products", productRouter)
app.use("/api/fishstocks", fishStockRouter)

app.listen(5000,
    ()=>{
        console.log("Server is started on port 5000")
    }
)