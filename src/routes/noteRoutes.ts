import express from "express";
import { NoteController } from "../controllers/noteController";
import { authenticate } from "../auth/authMiddleware";

const router = express.Router();

const noteController = new NoteController();

router.post("/create", authenticate,noteController.createNotes);
router.get("/note", noteController.getNote);
router.get("/notes", noteController.getNotes);
router.put("/note/:id",authenticate, noteController.updateNote);
router.delete("/note/:id",authenticate, noteController.deleteNote);

export default router;
