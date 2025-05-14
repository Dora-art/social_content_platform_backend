import { Request, Response, NextFunction } from "express";
import { CreateNoteData, NoteService, UpdateNoteData } from "../services/noteService";
import mongoose  from "mongoose";
import { AuthenticationError, BadRequestError} from "../utils/error";
import { UserDocument } from "../models/User";
import { Author, AuthorDocument } from "../models/Author";
import { AuthorService } from "../services/authorService";



const noteService = new NoteService();
const authorService = new AuthorService();

export class NoteController {
  async createNotes(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if(!req.user){
        return next(new AuthenticationError("User is not authenticated"))
      }
      const {...noteData} = req.body
      const user = req.user as UserDocument

      let author: AuthorDocument | null = await Author.findOne({user: user._id})
      if(!author){
        const {authorName, authorBio} = req.body
        const name = authorName || user.username 
        const bio = authorBio || ""
        author = await authorService.createAuthorService(name, user._id.toString(), bio)
      }

      const createNoteData: CreateNoteData = {
        ...noteData,

         categoryIds: noteData.categoryIds || []
      }
      const note = await noteService.createNote(createNoteData, author)
      res.status(200).json(note)
    }catch(err){
      next(err)
    }
  }

  async getNotes(req: Request, res: Response, next: NextFunction): Promise<void>{
    try{
        const notes = await noteService.getAllNotes()
    res.status(200).json(notes)
    }catch(err){
    next(err)
    }
  }

  async getNote(req: Request, res: Response, next: NextFunction): Promise<void>{
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
return next(new BadRequestError("Invalid note ID format"))
    }
    try{
        const note = await noteService.getNoteById(new mongoose.Types.ObjectId(id));
        res.status(200).json(note)
    }catch(err){
        next(err)
    }
  }

  async updateNote(req: Request, res:Response, next: NextFunction): Promise<void>{
const {id} = req.params

if(!req.user){
  return next(new AuthenticationError("User is not authenticated"))
}
if(!mongoose.Types.ObjectId.isValid(id)){
  return next(new BadRequestError("Invalid note ID format"))
}
try{
  const existingNote = await noteService.getNoteById(new mongoose.Types.ObjectId(id)) 
  if(!existingNote){
    return next(new BadRequestError("Note not found"))
  }

const user = req.user as UserDocument
const author = await Author.findOne({user: user._id})
if(!author || !existingNote.author.equals(author._id as mongoose.Types.ObjectId)){
  return next(new AuthenticationError("You are not allowed to access this route"))
}

  const note = await noteService.updateNoteById(new mongoose.Types.ObjectId(id), req.body as UpdateNoteData
)
res.status(200).json(note)
}catch(err){
  next(err)
}
  }

  async deleteNote(req: Request, res: Response, next: NextFunction): Promise<void>{
const {id} = req.params

if(!req.user){
  return next(new AuthenticationError("User is not authenticated"))
}
if(!mongoose.Types.ObjectId.isValid(id)){
  return next(new BadRequestError("Invalid note ID format"))
}
try{
  const existingNote = await noteService.getNoteById(new mongoose.Types.ObjectId(id))
  if(!existingNote){
    return next(new BadRequestError("Note not found"))
  }

  const user = req.user as UserDocument
  const author = await Author.findOne({user: user._id})
  if(!author || !existingNote.author.equals(author._id as mongoose.Types.ObjectId)){
    return next(new AuthenticationError("User can not access this route"))
  }
  await noteService.deleteNote(new mongoose.Types.ObjectId(id))
  res.status(204).send()
}catch(err){
  next(err)
}
  }
}
   
