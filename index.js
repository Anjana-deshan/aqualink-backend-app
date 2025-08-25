import express from "express";
import mongoose from "mongoose";
import userRouter from "./routes/userRouter.js";
import jwt from "jsonwebtoken";


const app = express()

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

const connectionString = ""

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


app.listen(5000,
    ()=>{
        console.log("Server is started on port 5000")
    }
)