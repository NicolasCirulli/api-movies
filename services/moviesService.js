import { MOVIES } from "../data/allMovies.js"
import Movies from '../models/moviesModel.js'
const moviesService = {

    async getAllMovies(){
        try {
            const movies = await Movies.find()
            return movies
        } catch (error) {
            throw new Error(error)
        }
    },

    async getById( id ){
        try {
            const movie = await Movies.findById( id )
            return movie
        } catch (error) {
            throw new Error(error)
        }
    },

    async getMoviesPagination( start, end ){
        try {
            const movies = await Movies.find().skip(start).limit(end)
            return movies
        } catch (error) {
            console.log(error)
            throw new Error(error)
        }
    },

    async createMovie( data ){
        try {
            const newMovie = await Movies.create( data )
            return newMovie
        } catch (error) {
            throw new Error(error)
        }
    },

    async newComment( { id, comment, user, name } ){
        try {
            const update = {  $push: {comments: { comment ,user, name } } }
            const movie = await Movies.findOneAndUpdate( {_id:id}, update, {new:true} )
            return movie
        }catch(error){
            throw new Error(error)
        }
    },

    async deleteComment( { MovieID, userID, commentID} ){
        try{
            const movie = await Movies.findById( MovieID )
             let aux = movie.comments.find( comment => comment._id == `${commentID}` && comment.user == `${userID}` )
             if( aux ){
                 movie.comments = movie.comments.filter( coment => coment._id != commentID )
                 await movie.save()
             }
            return movie
        }catch(error){
            throw new Error(error)
        }
    },

    async createAllMovies( data ) {
        try {
            const aux = await Movies.insertMany( data )
            return aux
        } catch (error) {
            throw new Error(error)
        }
    }

}

export default moviesService