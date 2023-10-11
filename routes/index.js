import express from "express";
import moviesRouter from "./moviesRouter.js";
const indexRouter = express.Router()

indexRouter.get( "/", (req, res) => res.send( "api amazin" ) )

indexRouter.use( "/movies", moviesRouter )

export default indexRouter
