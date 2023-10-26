import userService from '../services/userService.js'
import userDTO from '../DTO/userDTO.js'
import { sendEmail } from '../services/emailService.js'
const authRouter = {
    async login(req, res) {
        try {
            const userInDB = await userService.getUserByEmail(req.body.email)

            if (!userInDB) return res.status(401).json({ "message": "The provided credentials are invalid." })

            const validPassword = userService.verifyPassword(req.body.password, userInDB.password)

            if (!validPassword) return res.status(401).json({ "message": "The provided credentials are invalid." })

            const user = userDTO(userInDB)

            const token = userService.generateToken( userInDB.email )

            return res.status(200).json({ "message": "Login successful.", user, token })
        } catch (error) {
            return res.status(500).json({ error })
        }
    },
    async register(req, res) {
        try {
            const userInDB = await userService.getUserByEmail(req.body.email)
            if (userInDB) return res.status(409).json({ "message": "Email already in use" })
            const newUser = await userService.createUser(req.body)
            if( req.body.google ) {
                return res.status(202).json({ status: "ok", "message": "The account was created successfully." })
            }
            sendEmail(newUser.email, newUser._id)
            return res.status(202).json({ status: "ok", "message": "The account was created successfully. Please verify your email to activate your account." })
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error })
        }
    },
    async verifyAccount(req, res) {
        try {
            if (req.query.id) {
                const user = await userService.update(req.query.id, { status: true })
                if (user.status) {
                    return res.status(200).json({ status: "ok" })
                } else {
                    return res.status(400).json({ message: "Error" })
                }
            }
        } catch (error) {
            return res.status(500).json({ error })
        }
    },
    async loginWithToken(req, res) {
        const user = userDTO(req.user)
        return res.status(200).json({ "message": "Login successful.", user})
    },

    async generateApiKey(req, res){
        try {
            const apiKey = userService.generateKey()
            const updateUser = userService.update( req.user._id, {apiKey} )
            if( updateUser ){
               return res.status(201).json( { api_key : apiKey } )
            }
            return res.status(400).json( {message : ''} )
        } catch (error) {
            return res.status(500).json({ error })
        }
    },
    async getApiKey(req, res){
        try {
           const user = await userService.getUserByEmail( req.user.email )
           res.status(200).json( { api_key : user.apiKey } )
        } catch (error) {
            return res.status(500).json({ error })
        }
    }
}

export default authRouter

