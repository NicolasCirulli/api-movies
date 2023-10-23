import express from "express";
import commentController from '../controllers/commentControllers.js'
import verifyApiKey from '../middleware/verifyApiKey.js'

const commentRouter = express.Router()

commentRouter.post( '/:id', verifyApiKey, commentController.createComment)
commentRouter.delete( '/:id', verifyApiKey, commentController.deleteComment)

export default commentRouter