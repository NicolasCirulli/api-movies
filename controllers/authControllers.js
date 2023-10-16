import userService from '../services/userService.js'
import userDTO from '../DTO/userDTO.js'
import { sendEmail } from '../services/emailService.js'
const authRouter = {
    async login(req, res) {
        console.log( req.body )
        try {
            const userInDB = await userService.getUserByEmail(req.body.email)

            if (!userInDB) return res.status(401).json({ "message": "The provided credentials are invalid." })

            const validPassword = userService.verifyPassword( req.body.password, userInDB.password )

            if( !validPassword ) return res.status(401).json({ "message": "The provided credentials are invalid." })

            const user = userDTO( userInDB )

           
            res.status(200).json({ "message": "Login successful.", user })

        } catch (error) {

            res.status(500).json({ error })
        }
    },
    async register(req, res) {
        try {
            const userInDB = await userService.getUserByEmail(req.body.email)
            if (userInDB) return res.status(409).json({ "message": "Email already in use" })
            const newUser = await userService.createUser(req.body)
            sendEmail( newUser.email, newUser._id )
            res.status(202).json({status: "ok","message": "The account was created successfully. Please verify your email to activate your account." })
        } catch (error) {
            console.log(error)
            res.status(500).json({ error })
        }

    },

    async verifyAccount(req,res){
        console.log( 'llego' )
        res.redirect("https://localhost:5173/login")
    },

    async loginWithToken(req, res) {
        res.json('login with token')
    }
}

export default authRouter

