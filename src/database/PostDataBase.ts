import { Post } from "../models/Post";
import { LikeorDislikeDB, TPosts } from "../models/types";
import { BaseDatabase } from "./BaseDataBase";


export class PostDataBase extends BaseDatabase{

    public static TABLE_POSTS = "posts"
    public static TABLE_LIKES_DISLIKES = "likes_dislikes"
     
    public async findGetPostId(id: string){
        const [idExists]: TPosts[] | undefined[] = await BaseDatabase
        .conection(PostDataBase.TABLE_POSTS)
        .where({ id });

        return idExists
    }


    public async insertPost(newProduct: TPosts){
        await BaseDatabase
        .conection(PostDataBase.TABLE_POSTS)
        .insert(newProduct)
    }


    public async findGetPost(){
        const result: TPosts[] = await BaseDatabase
        .conection(PostDataBase.TABLE_POSTS)

        return result
    }


    public async findPostId(idParams: string):Promise<TPosts | undefined>{
        const post: TPosts[] = await BaseDatabase
       .conection(PostDataBase.TABLE_POSTS).select()
       .where({ id: idParams })


    return post[0]
    }


    public async findUpdatePost(updatePost: TPosts, id: string):Promise<void>{
        await BaseDatabase
        .conection(PostDataBase.TABLE_POSTS)
        .update(updatePost)
        .where({id: id})
    }
    


    public async deletePostId( deletePost: string):Promise<void>{
        await BaseDatabase.conection(PostDataBase.TABLE_POSTS)
        .delete()
        .where({id: deletePost})
    }


    public likeOrDislikePost = async (likeDislike: LikeorDislikeDB): Promise<void> => {
        await BaseDatabase.conection(PostDataBase.TABLE_LIKES_DISLIKES)
        .insert(likeDislike)
    }

    public findPostLikeOrDislike = async (postId: string): Promise<TPosts | undefined> => {
        const result: TPosts[] = 
        await BaseDatabase.conection(PostDataBase.TABLE_POSTS)
        .select(
            "posts.id",
            "posts.creator_id",
            "posts.content",
            "posts.likes",
            "posts.dislikes",
            "posts.created_at",
            "posts.updated_at"
        )
        .join("users", "posts.creator_id", "=", "users.id")
        .where("posts.id", postId)

        
        return result[0]
    }

    public findLikeDislike = async (likeDislike: LikeorDislikeDB): Promise<"já foi curtido" 
    | "já foi descurtido" | null> => {
        const [likesDislikeFind] : LikeorDislikeDB[] = await BaseDatabase
        .conection(PostDataBase.TABLE_LIKES_DISLIKES)
        .select()
        .where({
            user_id: likeDislike.user_id,
            post_id: likeDislike.post_id
        })

        if(likesDislikeFind){
            return likesDislikeFind.like === 1 ? "já foi curtido" : "já foi descurtido"
        }else{
            return null
        }
    }

     public removeLikeDislike = async (likeDislike: LikeorDislikeDB): Promise<void> => {
        await BaseDatabase.conection(PostDataBase.TABLE_LIKES_DISLIKES)
        .delete()
        .where({
            user_id: likeDislike.user_id,
            post_id: likeDislike.post_id
        })
    }

    public updateLikeDislike = async (likeDislike: LikeorDislikeDB): Promise<void> => {
        await BaseDatabase.conection(PostDataBase.TABLE_LIKES_DISLIKES)
        .update(likeDislike)
        .where({
            user_id: likeDislike.user_id,
            post_id: likeDislike.post_id
        })
    }

        
    }
