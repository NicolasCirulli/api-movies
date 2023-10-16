import express from "express";
import moviesController from '../controllers/moviesControllers.js'

const moviesRouter = express.Router()

moviesRouter.get( "/",  moviesController.getMovies )
moviesRouter.get( "/:id",  moviesController.getMovieById )
moviesRouter.post( "/",  moviesController.createMovie )
moviesRouter.post( "/allmovies",  moviesController.loadAllMovies )

export default moviesRouter