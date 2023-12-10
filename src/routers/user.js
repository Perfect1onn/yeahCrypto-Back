import Router from "express"
import userController from "../controllers/users.js"
import {authMiddleware} from "../middleware/auth-middleware.js";

const { registerUser , getUserById, getAllUsers, loginUser, logout, activate , refresh} = userController
const user = new Router()

user.post("/registration", registerUser)
user.post("/login", loginUser)
user.post("/logout", logout)
user.get("/activate/:link", activate)
user.get("/refresh", refresh)
user.get("/users/:id", authMiddleware, getUserById)
user.get("/users",authMiddleware,getAllUsers)

export default user;