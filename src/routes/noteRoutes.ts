import express from "express";
import { NoteController } from "../controllers/noteController";
import { authenticate } from "../middleware/auth/authenticationMiddleware";
import {
  requireEditorOrAdmin,
  requireSelf,
  requireSelfOrEditorOrAdmin,
} from "../middleware/authorizationMiddleware";

const router = express.Router();

const noteController = new NoteController();

router.post("/create", authenticate, noteController.createNotes);
router.get("/note/:id/public", noteController.getPublicNote);
router.get("/notes/public", noteController.getPublicNotes);
router.get("/mynotes", authenticate, requireSelf,noteController.getNotesByAuthor);
router.get(
  "/notes/private",
  authenticate,
  requireEditorOrAdmin,
  noteController.getAllNotesForAdmin
);

router.put(
  "/note/:id/user",
  authenticate,
  requireSelf,
  noteController.updateNoteUser
);

router.put(
  "/notes/:id/admin",
  authenticate,
  requireEditorOrAdmin,
  noteController.updateNoteAdmin
);


router.get(
  "/notes/category/:categoryId",
  authenticate,
  noteController.getNotesByCategory
);
router.delete(
  "/note/:id",
  authenticate,
  requireSelfOrEditorOrAdmin,
  noteController.deleteNote
);

export default router;
