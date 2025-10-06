import express from 'express';
import { createUser, loginUser, updateUser, deleteUser,listUsers, getAllUsers, changePassword } from '../controllers/userController.js';
const userRouter = express.Router();

// NEW: list users, supports ?role=Staff
userRouter.get("/", listUsers);

userRouter.post("/", createUser)
userRouter.post("/login", loginUser)
userRouter.put("/update", updateUser)
userRouter.delete("/delete", deleteUser)
userRouter.get("/", getAllUsers);
userRouter.put("/:email", updateUser)
userRouter.delete("/:email", deleteUser);
userRouter.post('/change-password', changePassword);

export default userRouter;