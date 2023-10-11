import moviesService from "../services/moviesService.js"
const moviesController = {
    getMovies : async (request, res) => { 
        try {
            const movies = await moviesService.getAllMovies(true)
            res.status( 200 ).json( { movies : movies } )
        } catch (error) {
            res.status( 500 ).json( {error:error} )
        }
    }
}

export default moviesController

