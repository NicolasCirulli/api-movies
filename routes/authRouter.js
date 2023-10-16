import express from "express";
import authController from '../controllers/authControllers.js'

const authRouter = express.Router()

authRouter.post( "/login",  authController.login )
authRouter.post( "/register",  authController.register )
authRouter.post( "/login/token",  authController.loginWithToken )
authRouter.get( "/verify",  authController.verifyAccount )



export default authRouter