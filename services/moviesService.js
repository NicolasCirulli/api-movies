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
            const movie = await Movies.find( {_id: id} )
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