import express, { Request, Response } from "express"
import cors from "cors"
import { TUser, TPosts, TPostsLike } from "./types";
import { User } from "./User";
import { Post } from "./Post";
import { UserDataBase } from "../database/UserDataBase";
import { PostDataBase } from "../database/PostDataBase";
import { UserController } from "../controller/UserController";
import { PostController } from "../controller/PostController";
import { userRouter } from "../Router/userRouter";
import { postRouter } from "../Router/postRouter";
import dotenv from "dotenv"



dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())


app.listen(process.env.PORT, () => {
    console.log(`Servidor rodando na porta ${process.env.PORT}`);
})


app.use("/users", userRouter)

app.use("/posts", postRouter)

