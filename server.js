import dotenv from 'dotenv'
import express from 'express';
import indexRouter from './routes/index.js'
import cors from 'cors'
import './config/db.js'
dotenv.config()
const app = express()
app.use( express.json() )
app.use( cors() )

app.use( '/static', express.static('images') )

app.use( "/api", indexRouter )

app.listen( process.env.PORT, () => console.log( 'Servidor escuchando en puerto ' + process.env.PORT ))