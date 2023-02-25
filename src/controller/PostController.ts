import { Request, Response } from "express";
import { PostBusiness } from "../business/PostBusiness";
import { PostDataBase } from "../database/PostDataBase";
import { CreatePostDTO, DeletePostInputDTO, EditPostInputDTO, GetPostInputDTO, GetPostOutputDTO, LikeOrDislikeDTO } from "../dto/userDTO";
import { BaseError } from "../errors/BaseErrors";
import { Post } from "../models/Post";
import { TPosts, TPostsLike } from "../models/types";

export class PostController {
    constructor(
        private postBusiness : PostBusiness
    ){}
    public createPost =  async (req: Request, res: Response) => {
        try {
            
            const input : CreatePostDTO =  {
                token: req.headers.authorization,
                content: req.body.content
            }

            
            await this.postBusiness.createPost(input)
          
            res.status(201).end()
    
        } catch (error: any) {
            console.log(error)
    
            if (error instanceof BaseError) {
                res.status(error.statusCode)
                .send(error.message)
            }else{
                res.send("Erro inesperado")
            }
        }
    }

    public getPost = async (req: Request, res: Response) => {
        try {
            const input : GetPostInputDTO = {
                token: req.headers.authorization
            }
    
            const output   = await this.postBusiness.getPost(input)
    
            res.status(200).send(output)
        }
        catch (error: any) {
            console.log(error)
    
            if (error instanceof BaseError) {
                res.status(error.statusCode)
                .send(error.message)
            }else{
                res.send("Erro inesperado")
            }
        }
    }

    public updatePost = async (req: Request, res: Response) => {
        try {
            
            
            const input : EditPostInputDTO =  {
                idParams: req.params.id,
                content: req.body.content,
                token: req.headers.authorization
            }

          
            await this.postBusiness.updatePost(input)
          

            res.status(200).end()
            } 
            catch (error) {
            console.log(error)
    
            if (req.statusCode === 200) {
                res.status(500)
            }
    
            if (error instanceof BaseError) {
                res.status(error.statusCode)
                .send(error.message)
            }else{
                res.send("Erro inesperado")
            }
        }
    }

    public deletePost = async (req: Request, res: Response) => {
        try {

            const input : DeletePostInputDTO = {
                id: req.params.id,
                token: req.headers.authorization
            }
            
            const output = await this.postBusiness.deletePost(input)
           
            res.status(200).end()
    
        } catch (error) {
            console.log(error)
    
            if (error instanceof BaseError) {
                res.status(error.statusCode)
                .send(error.message)
            }else{
                res.send("Erro inesperado")
            }
        }
    }

    public updatePostId = async (req: Request, res: Response) => {
        try {
            

            const input : LikeOrDislikeDTO = {
                idLikeOrDislike: req.params.id,
                token: req.headers.authorization,
                like: req.body.like
            }

          
            await this.postBusiness.updatePostId(input)
    
            res.status(200).end()
            
            }catch (error) {
            console.log(error)
    
            if (error instanceof BaseError) {
                res.status(error.statusCode)
                .send(error.message)
            }else{
                res.send("Erro inesperado")
            }
        }
    }
}