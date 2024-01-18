import { MOVIES } from "../data/allMovies.js"
import Movies from '../models/moviesModel.js'
const moviesService = {

    async getAllMovies( querys ){
        try {
            const query = ['title'].reduce( ( query, key ) => {
                if( querys[key] ) query[key] = { $regex: querys[key] , $options: 'i'}
                return query
            }, {} )
            let movies = await Movies.find(query)
            const response = {}
            
            if( querys.genre ){
                movies = movies.filter( movie => movie.genres.some( genre => genre.toLowerCase() == querys.genre.toLowerCase() ) )
            }
            if( querys.page && querys.page > 0 ){
                response.totalCount = movies.length
                response.totalPages = Math.ceil( response.totalCount / 20 )
                response.currentPage = Number(querys.page)
                const start = ( querys.page - 1 ) * 20
                movies = movies.splice( start, 20 )
                if( movies.length == 0 ){
                    response.status = 400
                    response.message = 'There is nothing here'
                }
            }
            if( querys.sort && [ 'title', 'popularity', 'release_date', 'vote_average', 'budget', 'revenue' ].includes( querys.sort ) ){
                movies.sort( (a,b) => {
                    if( a[querys.sort] > b[querys.sort] ) return 1
                    if( a[querys.sort] < b[querys.sort] ) return -1
                    return 0
                } )
            }
            if( querys.order == 'des' ){
                movies.reverse()
            }
            response.count = movies.length
            response.movies = movies
            return response
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