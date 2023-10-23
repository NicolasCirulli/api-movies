import userService from "../services/userService.js"
async function verifyApiKey( req, res, next){
    try {
        const apiKey = req.headers['x-api-key']
        const validKey = await userService.getUser( { apiKey : apiKey } )
        if( validKey ){
            return next()
        }
        return res.status(401).send('Unauthorized')
    } catch (error) {
        return res.status( 500 ).send( 'Internal Server Error' )
    }
}

export default verifyApiKey