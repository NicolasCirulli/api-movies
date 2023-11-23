import joi from 'joi'

export const signInValidator = (req, res, next) =>{
    const schema = joi.object( {
        email: joi.string().email().required(),
        password: joi.string().min(8).max(30).required()
    })
    
    const validate = schema.validate( req.body, {abortEarly : false} )
    
    if( validate.error ){
        return res.json( {success:false, errors : validate.error.details } )
    }
    
    next()
}

export const signUpValidator = (req, res, next) =>{
    const schema = joi.object( {
        name: joi.string().required(),
        email: joi.string().email().required(),
        password: joi.string().min(8).max(30).required(),
        google: joi.boolean(),
    })
    
    const validate = schema.validate( req.body, {abortEarly : false} )
    
    if( validate.error ){
        return res.json( {success:false, errors : validate.error.details } )
    }
    
    next()
}


