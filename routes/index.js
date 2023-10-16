import express from "express";
import moviesRouter from "./moviesRouter.js";
import authRouter from "./authRouter.js";
const indexRouter = express.Router()

indexRouter.get( "/", (req, res) => res.send( "api amazin" ) )


indexRouter.use( "/movies", moviesRouter )
indexRouter.use( "/auth", authRouter )

export default indexRouter
