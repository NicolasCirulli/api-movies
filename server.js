import express from 'express';
import indexRouter from './routes/index.js'
import cors from 'cors'
const app = express()

app.use( cors() )

app.use( "/api", indexRouter )

app.listen( 8080, () => console.log( 'Servidor escuchando en puerto 8080' ))