import mongoose, { Types } from "mongoose";
import { NoteDocument } from "../models/Note";
import Note from "../models/Note";
import { z } from "zod";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "../utils/error";
import { AuthorDocument } from "../models/Author";


const noteSchema = z.object({
  title: z.string().min(1, "Title is rquired").max(255),
  content: z.string().min(1, "Content is required"),
  imgUrl: z.string().url().optional(),
   categoryIds: z.array(
    z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
      message: "Invalid category ID",
    })
  ).optional(),
  tags: z.array(z.string()).optional(),
});

const updateSchema = z.object({
  title: z.string().min(1, "Title is rquired").max(255).optional(),
  content: z.string().min(1, "Content is required").optional(),
  categoryIds: z
    .array(
      z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
        message: "Invalid category ID",
      })
    ),
  imgUrl: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["draft", "pending", "published", "rejected"]).optional(),
  rejectionReason: z.string().optional(),
  publishedAt: z.date().optional(),
});

export type CreateNoteData = z.infer<typeof noteSchema>;
export type UpdateNoteData = z.infer<typeof updateSchema>;

export class NoteService {
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

    const { title, content,imgUrl, tags,categoryIds } =
      validatedData;

    try {
      const newNote = new Note({
        title,
        content,
        author: author._id,
        status: "draft",
        category: categoryIds ||null,
        imgUrl,
        tags,
      });

      const savedNote = await newNote.save();
      
      if(savedNote.status === "published"){
        
        author.numberOfPublications = (author.numberOfPublications || 0) + 1;
      await author.save();
    }
      return savedNote;
    } catch (error: unknown) {
      if (error instanceof mongoose.Error.ValidationError) {
        throw new BadRequestError(`Validation error: ${error.message}`);
      }
      throw new InternalServerError(
        `Failed to create note: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
    
  }

  async getAllNotes(): Promise<NoteDocument[]> {
    try {
      const notes = await Note.find()
        .populate({
          path: "author",
          select: "username email",
        })
        .populate({
          path: "category",
          select: "name",
        })
        .exec();
      return notes;
    } catch (error: unknown) {
      throw new InternalServerError(
        `Failed to retrieve note: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  async getNoteById(id: Types.ObjectId): Promise<NoteDocument | null> {
    try {
      const note = await Note.findById(id)
        .populate({
          path: "author",
          select: "username email",
        })
        .populate({
          path: "category",
          select: "name",
        })
        .populate({
          path: "likes",
          select: "_id username",
        })
        .populate({
          path: "saves",
          select: "_id username",
        })
        .exec();
      if (!note) {
        throw new NotFoundError("Note not found");
      }
      return note;
    } catch (error: unknown) {
      if (error instanceof mongoose.Error.CastError) {
        throw new BadRequestError("Invalid Note ID");
      }
      throw new InternalServerError(
        `Failed to retrieve note: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  async updateNoteById(
    id: Types.ObjectId,
    data: UpdateNoteData
  ): Promise<NoteDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError("Invalid Note id");
    }

    const parsedData = updateSchema.safeParse(data);
    if (!parsedData.success) {
      throw new BadRequestError(
        "Invalid update data: " + parsedData.error.message
      );
    }
    const validatedData = parsedData.data;
    try {
      const updatedNote = await Note.findByIdAndUpdate(
        id,
        { ...validatedData, updateAt: new Date() },
        { new: true, runValidators: true }
      )
        .populate({
          path: "author",
          select: "username email",
        })
        .populate({
          path: "category",
          select: "name",
        })
        .exec();

      if (!updatedNote) {
        throw new NotFoundError("Note not found");
      }
      return updatedNote;
    } catch (error: unknown) {
      if (error instanceof mongoose.Error.ValidationError) {
        throw new BadRequestError(`Validation error: ${error.message}`);
      }
      throw new InternalServerError(
        `: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async deleteNote(id: Types.ObjectId): Promise<NoteDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError("Invalid Note ID");
    }
    try {
      return await Note.findByIdAndDelete(id);
    } catch (error: unknown) {
      if (error instanceof mongoose.Error.CastError) {
        throw new BadRequestError("Invalid Note ID");
      }
      throw new InternalServerError(
        `Failed to delete note: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
