import User from '../models/userModel.js'
import bcrypt from 'bcrypt'
const userService = {

    async getUserByEmail( email ){
        try {
            const user = await User.findOne({email})
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
    verifyPassword( requestPassword, userPassword ){
        return bcrypt.compareSync( requestPassword, userPassword )
    },
    hashPassword( password ){
        return bcrypt.hashSync( password, 10 )
    }
}

export default userService