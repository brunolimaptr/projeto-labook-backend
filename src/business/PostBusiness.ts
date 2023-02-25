import { PostDataBase } from "../database/PostDataBase";
import { UserDataBase } from "../database/UserDataBase";
import { CreatePostDTO, DeletePostInputDTO, EditPostInputDTO, GetPostInputDTO, GetPostOutputDTO, LikeOrDislikeDTO } from "../dto/userDTO";
import { BadRequestError } from "../errors/BadRequestError";
import { NotFoundError } from "../errors/NotFoundError";
import { Post } from "../models/Post";
import { TPosts,  LikeorDislikeDB } from "../models/types";
import { User } from "../models/User";
import { HashManager } from "../services/HashManager";
import { IdGenerator } from "../services/idGenerator";
import { TokenManager } from "../services/TokenManager";

export class PostBusiness{
    constructor(
        private postDataBase: PostDataBase,
        private idGenerator: IdGenerator,
        private tokenManager: TokenManager,
        private hashManager: HashManager
    ){}
    public createPost = async (input: CreatePostDTO): Promise<void>=>{
        const { token, content } = input;
            
        if(token === undefined){
            throw new BadRequestError("token ausente")
        }

        const payload = this.tokenManager.getPayload(token)
        

        if(payload === null){
            throw new BadRequestError("token inválido")
        }

        if (content !== undefined) {

            if (typeof content !== "string") {
    
                throw new BadRequestError("'content' deve ser string")
                }
            }

        const postagem = content as string 

        const postIntance = new Post(
            this.idGenerator.generate(),
            payload.id,
            postagem,
            0,
            0,
            new Date().toISOString(),
            new Date().toISOString()
        )

        
        const newProduct: TPosts = {
            id: postIntance.getId(),
            creator_id: postIntance.getCreatorId(),
            content: postIntance.getContent(),
            likes: postIntance.getLikes(),
            dislikes: postIntance.getDislikes(),
            created_at: postIntance.getCreatedAt(),
            updated_at: postIntance.getUpdateAt()
        }

       await this.postDataBase.insertPost(newProduct)

       
    }

    public getPost = async (input: GetPostInputDTO) =>{

        const { token } = input

        if(token === undefined){
            throw new BadRequestError("token ausente")
        }

        const payload = this.tokenManager.getPayload(token)

        if(payload === null){
            throw new BadRequestError("token inválido")
        }

    
        const resultPosts = await this.postDataBase.findGetPost()

        const userDataBase = new UserDataBase()

        const resultUsers = await userDataBase.findGetUsers()


        const resultPost = resultPosts.map((item)=>{
            return {
                id: item.id,
                content: item.content,
                likes: item.likes,
                dislikes: item.dislikes,
                created_at: item.created_at,
                updated_at: item.updated_at,
                creator: 
                  resultado(item.creator_id)  

            }
        })

        function resultado (item: string){
           const resultTable = resultUsers.find((result)=>{
            
            return item === result.id

           })
           
           return {id: resultTable?.id, 
        name: resultTable?.name}
        }
       
        return ({Post: resultPost})
    }

    public updatePost = async (input: EditPostInputDTO ):Promise<void>=>{
       
    
        const { idParams, content, token } = input 


        if(token === undefined){
            throw new BadRequestError("token ausente")
        }

        const payload = this.tokenManager.getPayload(token)

        if(payload === null){
            throw new BadRequestError("token inválido")
        }
       

        if (content !== undefined) {

            if (typeof content !== "string") {
                throw new BadRequestError("'content' deve ser string")
            }

            if (content.length < 1) {
                throw new BadRequestError("'description' deve possuir no mínimo 1 caractere")
            }
        }

       
        const post = await this.postDataBase.findPostId(idParams)
       

        if (!post) {
        throw new BadRequestError("'id' não encontrada")
        }
        
        if(post.creator_id !== payload.id){
        throw new BadRequestError("somente quem criou o post, pode editar")

    
        
        }else {
       

            const postInstance = new Post(
               post.id,
               post.creator_id,
               post.content,
               post.likes,
               post.dislikes,
               post.created_at,
               post.updated_at
            )



            const updatePosts: TPosts  = {
                id: postInstance.getId(),
                creator_id:  postInstance.getCreatorId(),
                likes:  postInstance.getLikes(),
                content: content || postInstance.getContent(),
                dislikes: postInstance.getDislikes(),
                created_at: postInstance.getCreatedAt(),
                updated_at: postInstance.getUpdateAt()
            }
        
        

        await this.postDataBase.findUpdatePost(updatePosts, idParams)


    }}

    public deletePost = async (input: DeletePostInputDTO): Promise<void>=>{

        const { id, token } = input
     

        if(token === undefined){
            throw new BadRequestError("token ausente")
        }

        const payload = this.tokenManager.getPayload(token)

        if(payload === null){
            throw new BadRequestError("token inválido")
        }
       
        const post = await this.postDataBase.findPostId(id)


        if (!post) {
            throw new BadRequestError("id não encontrada")
        }

        const deletePost = new Post(
            post.id,
            post.creator_id,
            post.content,
            post.likes,
            post.dislikes,
            post.created_at,
            post.updated_at
        )

        await this.postDataBase.deletePostId(deletePost.getId())

    }

    public updatePostId = async (input: LikeOrDislikeDTO):Promise<void>=>{
        
        const { idLikeOrDislike, token, like } = input

        
        if(token === undefined){
            throw new BadRequestError("token ausente")
        }

        const payload = this.tokenManager.getPayload(token)

        if(payload === null){
            throw new BadRequestError("token inválido")
        }
           
    
        if (like !== undefined) {

            if (typeof like !== "boolean") {
                throw new BadRequestError("'like' deve ser boolean")
            }
        }
        
        const post = await this.postDataBase.findPostLikeOrDislike(idLikeOrDislike)

        if(!post){
            throw new NotFoundError("id não encontrada")
        }

      
        const creatorId = payload.id
        const likeSQL = like ? 1 : 0

        const likeOrDislike : LikeorDislikeDB = {
            user_id: creatorId,
            post_id: post.id,
            like: likeSQL
        }

        const postLikeDis = new Post(
            post.id,
            post.creator_id,
            post.content,
            post.likes,
            post.dislikes,
            post.created_at,
            post.updated_at
        ) 

        const likeDislikeExist = await this.postDataBase.findLikeDislike(likeOrDislike)

        if(likeDislikeExist === "já foi curtido"){
            if(like) {
                await this.postDataBase.removeLikeDislike(likeOrDislike)
                postLikeDis.removeLike()
            }else{
                await this.postDataBase.updateLikeDislike(likeOrDislike)
                postLikeDis.removeLike()
                postLikeDis.addDislike()
            }

        }else if(likeDislikeExist === "já foi descurtido"){
            if(like) {
                await this.postDataBase.removeLikeDislike(likeOrDislike)
                postLikeDis.removeDislike()
                postLikeDis.addLike()
            }else{
                await this.postDataBase.updateLikeDislike(likeOrDislike)
                postLikeDis.removeDislike()
            }
        }else{

        await this.postDataBase.likeOrDislikePost(likeOrDislike)   

        like ? postLikeDis.addLike() : postLikeDis.addDislike()
        }
        
        const updatePosts  = {
            id: postLikeDis.getId(),
            creator_id:  postLikeDis.getCreatorId(),
            likes:  postLikeDis.getLikes(),
            content: postLikeDis.getContent(),
            dislikes: postLikeDis.getDislikes(),
            created_at: postLikeDis.getCreatedAt(),
            updated_at: postLikeDis.getUpdateAt()
        }
       
        await this.postDataBase.findUpdatePost(updatePosts, idLikeOrDislike)
    }
    }
