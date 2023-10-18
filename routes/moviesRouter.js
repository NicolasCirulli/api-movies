import express from "express";
import moviesController from '../controllers/moviesControllers.js'
import verifyApiKey from '../middleware/verifyApiKey.js'
import passport from "../middleware/verifyToken.js"; 
const moviesRouter = express.Router()

moviesRouter.get( "/", verifyApiKey,  moviesController.getMovies )
moviesRouter.get( "/:id", verifyApiKey ,  moviesController.getMovieById )
moviesRouter.post( "/", passport.authenticate( 'jwt', {session:false} ), moviesController.createMovie )
moviesRouter.post( "/allmovies", passport.authenticate( 'jwt', {session:false} ), moviesController.loadAllMovies )

export default moviesRouter