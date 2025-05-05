import { Request, Response, NextFunction } from "express";
import { CreateNoteData, NoteService, UpdateNoteData } from "../services/noteService";
import mongoose  from "mongoose";
import { BadRequestError} from "../utils/error";


const noteService = new NoteService();

export class NoteController {
  async createNotes(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const note = await noteService.createNote(req.body as CreateNoteData);
      res.status(201).json(note);
    } catch (err) {
      next(err);
    }
  }

  async getNotes(req: Request, res: Response, next: NextFunction): Promise<void>{
    try{
        const notes = await noteService.getAllNotes()
    res.status(201).json(notes)
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
        const note = await noteService.getNoteById(new mongoose.Types.ObjectId);
        res.status(200).json(note)
    }catch(err){
        next(err)
    }
  }

  async updateNote(req: Request, res:Response, next: NextFunction): Promise<void>{
const {id} = req.params
if(!mongoose.Types.ObjectId.isValid(id)){
  return next(new BadRequestError("Invalid note ID format"))
}
try{
  const note = await noteService.updateNoteById(new mongoose.Types.ObjectId(id), req.body as UpdateNoteData
)
res.status(200).json(note)
}catch(err){
  next(err)
}
  }

  async deleteNote(req: Request, res: Response, next: NextFunction): Promise<void>{
const {id} = req.params
if(!mongoose.Types.ObjectId.isValid(id)){
  return next(new BadRequestError("Invalid note ID format"))
}
try{
  await noteService.deleteNote(new mongoose.Types.ObjectId)
  res.status(204).send()
}catch(err){
  next(err)
}
  }
}
   
