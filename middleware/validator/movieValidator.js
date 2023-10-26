import joi from 'joi'

export const createMovieValidator = (req, res, next) =>{

    const schema = joi.object( {
        image: joi.string().required().uri(),
        genres: joi.string().required(),
        original_language: joi.string(),
        overview: joi.string(),
        popularity: joi.number().required(),
        release_date: joi.date(),
        title: joi.string().required(),
        vote_average: joi.number().required(),
        vote_count: joi.number(),
        homepage: joi.string().uri(),
        revenue: joi.number().required(),
        runtime: joi.number().required(),
        status: joi.string().required(),
        tagline: joi.string().required(),
        budget: joi.number().required(),
    })
    
    const validate = schema.validate( req.body, {abortEarly : false} )
    
    if( validate.error ){
        return res.json( {success:false, errors : validate.error.details } )
    }
    
    next()
}