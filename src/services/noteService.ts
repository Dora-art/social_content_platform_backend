import mongoose from "mongoose";
import { NoteDocument } from "../models/Note";
import Note from "../models/Note";
import { z } from "zod";
import {
  BadRequestError,
  NotFoundError,
} from "../utils/error";
import { Author, AuthorDocument } from "../models/Author";
import { CategoryService } from "./categoryService";
import logger from "../config/logger";

interface DeleteNoteResponse {
  message: string
}

const noteSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  content: z.string().min(1, "Content is required"),
  imgUrl: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  noteStatus: z.enum(["draft", "pending", "published", "rejected"]).optional().default("draft")
});

const updateSchema = z.object({
  title: z.string().min(1, "Title is rquired").max(255).optional(),
  content: z.string().min(1, "Content is required").optional(),
  imgUrl: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  noteStatus: z.enum(["draft", "pending", "published", "rejected"]).optional(),
  rejectionReason: z.string().optional(),
  publishedAt: z.date().optional(),
});

export type CreateNoteData = z.infer<typeof noteSchema>;
export type UpdateNoteData = z.infer<typeof updateSchema>;

export class NoteService {
  private categoryService: CategoryService;

  constructor() {
    this.categoryService = new CategoryService();
  }
  async createNote(
    data: CreateNoteData,
    author: AuthorDocument
  ): Promise<NoteDocument> {
    const parsedData = noteSchema.safeParse(data);
    if (!parsedData.success) {
      throw new BadRequestError(
        "Invalid note data: " + parsedData.error.message
      );
    }
    const validatedData = parsedData.data;

    const { title, content, imgUrl, tags } = validatedData;
    const noteStatus = "draft"

    const categoryIds = await this.categoryService.assignCategories(content);
    try {
      const noteData = {
        title,
        content,
        author: author._id,
        noteStatus,
        categories: categoryIds,
        imgUrl,
        tags
      };

const newNote = new Note(noteData)
      const savedNote = await newNote.save()

      await savedNote.populate([{
        path: "author",
        select: "name -_id"
      },{
        path: "categories",
        select: "name -_id"
      }])
      return savedNote;
    } catch (error: unknown) {
      if (error instanceof mongoose.Error.ValidationError) {
        throw new BadRequestError(`Validation error: ${error.message}`);
      }
      logger.error(
        "An unexpected internal server error occured during note creation: ", {
          originalErrorDetails: error, operation: "createNote"
        }
      );
      throw error
    }
  }

  async getPublicNotes(): Promise<NoteDocument[]> {
    try {
      const notes = await Note.find({noteStatus: "published"})
        .populate({
          path: "author",
          select: "name -_id",
        })
        .populate({
          path: "categories",
          select: "name -_id",
        }).sort({publishedAt: -1}).select("-_v")
        .exec();
      return notes;
    } catch (error: unknown) {
      logger.error(
        "An unexpected internal error occured while retrieving notes:", {
          originalErrorDetails: error, operation: "getNotes"
        }
      );
      throw error
    }
  }

  async getPublicNoteById(id: string): Promise<NoteDocument | null> {
    try {
      const note = await Note.findOne({_id:id,noteStatus: "published"})
        .populate({
          path: "author",
          select: "username -_id",
        })
        .populate({
          path: "categories",
          select: "name -_id",
        })
        .populate({
          path: "likes",
          select: "username -_id",
        })
        .populate({
          path: "saves",
          select: "username -_id",
        }).select("-__v")
        .exec();
      if (!note) {
        throw new NotFoundError("Note not found");
      }
      return note;
    } catch (error: unknown) {
      if (error instanceof mongoose.Error.CastError) {
        throw new BadRequestError("Invalid Note ID format");
      }
     logger.error(
        "An unexpected internal error occured while retrieving note:", {
          originalErrorDetails: error, operation: "getNote"
        }
      );
      throw error
    }
  }

  async getNotesByAuthor(authorId: string): Promise<NoteDocument[]> {
    try{const notes = await Note.find({author: authorId }).populate({path:"author", select: "name -_id"}) .populate({ path: "categories", select: "name -_id" }).sort({createdAt: -1}).select("-__v").exec();
  return notes}
   catch (error: unknown) {
      logger.error(
        "An unexpected internal error occured while retrieving notes:", {
          originalErrorDetails: error, operation: "getNotes"
        }
      );
      throw error
    }
  }

  async getNotesForAdmin():Promise<NoteDocument[]> {
    try{const notes = await Note.find({}).populate({path:"author", select: "name email"}) .populate({ path: "categories", select: "name" }).populate({
          path: "categories",
          select: "name",
        })
        .populate({
          path: "likes",
          select: "_id username",
        })
        .populate({
          path: "saves",
          select: "_id username",
        }).sort({createdAt: -1}).exec();
  return notes}
   catch (error: unknown) {
      logger.error(
        "An unexpected internal error occured while retrieving notes:", {
          originalErrorDetails: error, operation: "getNotes"
        }
      );
      throw error
    }
  }

  async getNotesByCategoryId(categoryId: string): Promise<NoteDocument[]> {
    try {
      const notes = await Note.find({ categories: categoryId })
        .populate({ path: "author", select: "name" })
        .populate({ path: "categories", select: "name" })

        .populate({
          path: "likes",
          select: "username",
        })
        .populate({
          path: "saves",
          select: "username",
        })
        .exec();
      if (notes.length === 0) {
        throw new NotFoundError("No note in this category");
      }
      return notes;
    } catch (error: unknown) {
      if (error instanceof mongoose.Error.CastError) {
        throw new BadRequestError("Invalid Category Id");
      }
      logger.error(
        "Failed to retrieve notes by category due to an unexpected internal error:", {
           originalErrorDetails: error, operation: "getNotesByCategory"
        }
      );
      throw error
    }
  }

  async updateNote(
    id: string,
    data: UpdateNoteData,
    isAdminOrEditor: boolean = false
  ): Promise<NoteDocument | null> {

    const parsedData = updateSchema.safeParse(data);
    if (!parsedData.success) {
      throw new BadRequestError(
        "Invalid update data: " + parsedData.error.message
      );
    }
    const validatedData = parsedData.data;
    if(!isAdminOrEditor){
      delete validatedData.noteStatus;
      delete validatedData.rejectionReason
    }
    try {
      const existingNote = await Note.findById(id)
      if(!existingNote){
        throw new NotFoundError("Note not found")
      }
      let categoryIds: string[] | undefined;
      if (validatedData.content) {
        categoryIds = await this.categoryService.assignCategories(
          validatedData.content
        );
      }

      const updateObject = {
        ...validatedData,
        updatedAt: new Date(),
        ...(categoryIds && { categories: categoryIds }),
      };

      if(validatedData.noteStatus === "published" && existingNote.noteStatus !== "published" && !existingNote.publishedAt ){
        updateObject.publishedAt = new Date()
      }
      const updatedNote = await Note.findByIdAndUpdate(id, updateObject, {
        new: true,
        runValidators: true,
      })
        .populate({
          path: "author",
          select: "name email",
        })
        .populate({
          path: "categories",
          select: "name",
        })
        .exec();

      if (!updatedNote) {
        throw new NotFoundError("Note not found");
      }
      
      if (validatedData.noteStatus === "published" && existingNote.noteStatus !== "published") {
        const author = await Author.findById(updatedNote.author)
        if(author){
          author.numberOfPublications = (author.numberOfPublications ||0) + 1
          await author.save()
        }
      }
      return updatedNote;
    } catch (error: unknown) {
      if (error instanceof mongoose.Error.ValidationError) {
        throw new BadRequestError(`Validation error: ${error.message}`);
      }
      logger.error(
        "Failed to update note due to internal server error:", {
          originalErrorDetails: error, operation: "updateNote"
        }
      );
      throw error
    }
  }

  async deleteNote(id: string): Promise<DeleteNoteResponse> {
   
      const note = await Note.findByIdAndDelete(id);
      if(!note){
        throw new NotFoundError("Note not found")
      }
      return {message: "Note successfully deleted"}
    } 
  }

