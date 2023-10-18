import User from '../models/userModel.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { v4  } from 'uuid'
const userService = {

    async getUserByEmail( email ){
        try {
            const user = await User.findOne({email})
            return user
        } catch (error) {
            throw new Error(error)
        }
    },
    async getUser(obj){
        try {
            const user = await User.findOne( obj )
            return user
        } catch (error) {
            throw new Error(error)
        }
    },
    async createUser( data ){
        try {
            const encriptPassword = this.hashPassword( data.password )
            data.password = encriptPassword
            const newUser = await User.create( data )
            return newUser
        } catch (error) {
            throw new Error(error)
        }
    },
    async update(id, update){
        try {
            const user = await User.findOneAndUpdate( {_id:id}, update, {new:true} )
            return user
        } catch (error) {
            console.log(error)
        }
    },
    generateToken(email){
        const token = jwt.sign( {email}, process.env.SECRET_KEY, { expiresIn: '1h' } ) 
        return token
    }
    ,
    verifyPassword( requestPassword, userPassword ){
        return bcrypt.compareSync( requestPassword, userPassword )
    },
    hashPassword( password ){
        return bcrypt.hashSync( password, 10 )
    },
    generateKey(){
        return v4()
    }
}

export default userService