import express from "express";
import moviesRouter from "./moviesRouter.js";
import authRouter from "./authRouter.js";
import commentRouter from "./commentRouter.js";
import petshopRouter from './petshop.js';
const indexRouter = express.Router()

indexRouter.get( "/", (req, res) => res.send( "Api Movies" ) )


indexRouter.use( "/movies", moviesRouter )
indexRouter.use( "/movies/comment", commentRouter )
indexRouter.use( "/auth", authRouter )
indexRouter.use( "/petshop", petshopRouter )


export default indexRouter
