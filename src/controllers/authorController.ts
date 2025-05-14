import {Request,Response, NextFunction } from "express";
import { AuthorService } from "../services/authorService";
import { UserDocument } from "../models/User";


const authorService = new AuthorService()

export class AuthorController{
    async createAuthor(req: Request, res: Response, next: NextFunction){
        try{
            const  {name,bio} = req.body;
            const userId = (req.user as UserDocument)._id.toString();

            const author = authorService.createAuthorService(name, userId,bio)
            res.status(201).json(author)
        }catch(err){
            next(err)
        }
    }

    async getAuthorById(req: Request, res: Response, next: NextFunction): Promise<void>{
        try{
            const author = await authorService.getAuthor(req.params.id)
             res.status(200).json(author)
        }catch(err){
            next(err)
        }
    }

    async getAllAuthors(req: Request, res:Response, next: NextFunction): Promise<void>{
        try{
            const authors = authorService.getAuthors()
             res.status(200).json(authors)
        }
        catch(err){
            next(err)
        }
    }
}