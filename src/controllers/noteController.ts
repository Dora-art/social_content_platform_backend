import { Request, Response, NextFunction } from "express";
import {
  CreateNoteData,
  NoteService,
} from "../services/noteService";
import mongoose from "mongoose";
import { BadRequestError } from "../utils/error";
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
      const user = req.user as UserDocument;

      let author: AuthorDocument | null = await Author.findOne({
        user: user._id,
      });
      if (!author) {
        const name = user.username;
        const bio = user.bio || "";
        author = await authorService.createAuthorService(
          name,
          user._id.toString(),
          bio
        );
      }
const { ...noteData } = req.body;
      const createNoteData: CreateNoteData = {
        ...noteData,
      };
      const note = await noteService.createNote(createNoteData, author);
      res.status(201).json(note);
    } catch (err) {
      next(err);
    }
  }

  async getPublicNotes(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const notes = await noteService.getPublicNotes();
      res.status(200).json(notes);
    } catch (err) {
      next(err);
    }
  }

  async getPublicNote(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new BadRequestError("Invalid note ID format"));
    }
    
      const note = await noteService.getPublicNoteById(id);
      res.status(200).json(note);
    } catch (err) {
      next(err);
    }
  }

  async getNotesByAuthor( req: Request,
    res: Response,
    next: NextFunction): Promise<void>{try{
      const user = req.user as UserDocument
      const author: AuthorDocument | null = await Author.findOne({user: user._id})
      if(!author){
        res.status(200).json([])
        return
      }
      const notesByAuthor = await noteService.getNotesByAuthor(author._id.toString())
      res.status(200).json(notesByAuthor)
    }catch(err){
      next(err)
    }
}

async getAllNotesForAdmin(req: Request,
    res: Response,
    next: NextFunction): Promise<void>{try{
      const notes = await noteService.getNotesForAdmin()
      res.status(200).json(notes)
}catch(err){
  next(err)
}
    }
  async getNotesByCategory(req: Request, res: Response, next: NextFunction): Promise<void>{
try {

  const {categoryId} = req.params
  if(!mongoose.Types.ObjectId.isValid(categoryId)){
    return next(new BadRequestError("Invalid category ID format") )
  }
  const notesByCategory = await noteService.getNotesByCategoryId(categoryId)
  res.status(200).json(notesByCategory)
}catch(err){
  next(err)
}
  }

  async updateNoteUser(req: Request,
    res: Response,
    next: NextFunction): Promise<void>{
       try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new BadRequestError("Invalid note ID format"));
    }

    const updateData = req.body
  
    if(updateData.noteStatus && updateData.noteStatus !== "draft"){
      return next("Notes can only be set to draft for users")
    }
    const updatedNote = await noteService.updateNote(id, updateData)
    res.status(200).json(updatedNote)
    }catch(err){
      next(err)
    }
  }

    

  async updateNoteAdmin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
       try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new BadRequestError("Invalid note ID format"));
    }

    const UpdateNoteData = req.body
      const updatedNote = await noteService.updateNote(
        id,
      UpdateNoteData,true
      );
      res.status(200).json(updatedNote);
    } catch (err) {
      next(err);
    }
  }

  async deleteNote(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new BadRequestError("Invalid note ID format"));
    }
    try {
      const existingNote = await noteService.deleteNote(
       id);
      if (!existingNote) {
        return next(new BadRequestError("Note not found"));
      }
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
