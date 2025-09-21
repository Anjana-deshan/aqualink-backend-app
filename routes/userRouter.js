import express from 'express';
import { createUser, loginUser, updateUser, deleteUser,listUsers } from '../controllers/userController.js';
const userRouter = express.Router();

// NEW: list users, supports ?role=Staff
userRouter.get("/", listUsers);

userRouter.post("/", createUser)
userRouter.post("/login", loginUser)
userRouter.put("/update", updateUser)
userRouter.delete("/delete", deleteUser)

export default userRouter;