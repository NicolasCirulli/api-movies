import movieDTO from '../DTO/movieDTO.js'
import moviesService from "../services/moviesService.js"
import movieMapper from '../mappers/movieMapper.js'
import { MOVIES } from '../data/allMovies.js'
const moviesController = {
    async getMovies(req, res){ 
        try {
            const movies = await moviesService.getAllMovies()
            const response = {}
            const moviesResponse = movies.map( movieDTO )
            response.movies = moviesResponse
            response.count = moviesResponse.length
            res.status( 200 ).json( response )
        } catch (error) {
            res.status( 500 ).json( {error:error} )
        }
    },

    async getMovieById(req, res){
       try {
            const movie = await moviesService.getById(req.params.id)
            res.status(200).json( movie )
       } catch (error) {
            res.status( 500 ).json( {error:error} )
       }
    },

    async createMovie( req, res){
        try {
            const movieData = movieMapper.newMovie( req.body )
            const newMovie = await moviesService.createMovie( movieData )
            res.status(201).json( { success:true, new_movie:newMovie } )
        } catch (error) {
            res.status(500).json( {message:'Internal server error'} )
        }
    },

    async loadAllMovies(req, res){
        try {
            const mapper = MOVIES.map( movie => movieMapper.newMovie( movie ) )
            const aux = await moviesService.createAllMovies( mapper )
            res.json( aux )
        } catch (error) {
            res.status(500).json( {message:'Internal server error', error : error} )
        }
    },

    updateMovie(req, res){
      
    },
    deleteMovie(req, res){

    }
}

export default moviesController

