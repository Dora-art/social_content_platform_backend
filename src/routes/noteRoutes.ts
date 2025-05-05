import express from "express";
import { NoteController } from "../controllers/noteController";

const router = express.Router();

const noteController = new NoteController();

router.post("/create", noteController.createNotes);
router.get("/note", noteController.getNote);
router.get("/notes", noteController.getNotes);
router.put("/note:/id", noteController.updateNote);
router.delete("/note:/id", noteController.deleteNote);
