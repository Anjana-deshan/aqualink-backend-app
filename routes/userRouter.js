import express from 'express';
import { createUser, loginUser, updateUser, deleteUser } from '../controllers/userController.js';
const userRouter = express.Router();

userRouter.post("/", createUser)
userRouter.post("/login", loginUser)
userRouter.put("/update", updateUser)
userRouter.delete("/delete", deleteUser)

export default userRouter;