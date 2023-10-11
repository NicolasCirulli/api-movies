import express from "express";
import moviesController from '../controllers/moviesControllers.js'

const moviesRouter = express.Router()

moviesRouter.get( "/",  moviesController.getMovies )

export default moviesRouter