import express from "express";
import products from "../data/data.js"; 
const petshopRouter = express.Router()

petshopRouter.get( '/', (_, res) => {
    res.json( products )
} )

export default petshopRouter


