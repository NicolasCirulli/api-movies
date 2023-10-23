import userService from "../services/userService.js"
import moviesService from "../services/moviesService.js"
const commentController = {
    async createComment( req, res ){
        try {
            const { comment, name } = req.body
            const apiKey = req.headers['x-api-key']
            const user = await userService.getUser( { apiKey } )
            const aux = await moviesService.newComment( { id: req.params.id, comment, user: user._id, name } )
            res.status(200).json( { message: 'Comment created', update: aux} )
        } catch ( error ) {
            res.status(500).json( { message: 'Internal server error' } )
        }
    },
    async deleteComment(req, res){
        try {
            const apiKey = req.headers['x-api-key']
            const user = await userService.getUser( { apiKey } )
            const aux = await moviesService.deleteComment( { MovieID: req.params.id, userID: user._id, commentID: req.body.commentID} )
            res.json( { message: 'Comment deleted', aux } )
        } catch ( error ) {
            res.json( error )
        }
    }
}

export default commentController