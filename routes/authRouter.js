import express from "express";
import authController from '../controllers/authControllers.js'
import passport from "../middleware/verifyToken.js";
const authRouter = express.Router()

authRouter.post( "/login", authController.login )
authRouter.post( "/register", authController.register )
authRouter.post( "/login/token", passport.authenticate( 'jwt', {session: false} ), authController.loginWithToken )
authRouter.get(  "/verify",  authController.verifyAccount )
authRouter.post( "/apikey", passport.authenticate( 'jwt', {session: false} ), authController.generateApiKey )
authRouter.get( "/apikey", passport.authenticate( 'jwt', {session: false} ), authController.getApiKey )


export default authRouter