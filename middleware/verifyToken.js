import { Strategy,ExtractJwt } from 'passport-jwt'
import passport from 'passport'
import dotenv from 'dotenv'
import userService from '../services/userService.js'
dotenv.config()
const options = {
    jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey : process.env.SECRET_KEY
}
const fn = async ( jwt_payload, done ) => {
    try{
        const user = await userService.getUserByEmail( jwt_payload.email )
        if( !user ){
            done( null, false )
        }
        done( null, user )
    }catch(err){
        done( err, false )
    }
}
export default passport.use( new Strategy( options, fn ) )