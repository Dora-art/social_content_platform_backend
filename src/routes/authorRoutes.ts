import express from "express"
import { AuthorController } from "../controllers/authorController"

const router = express.Router()

const authorController = new AuthorController()

router.get("/author", authorController.getAuthorById)
router.get("/authors", authorController.getAllAuthors)