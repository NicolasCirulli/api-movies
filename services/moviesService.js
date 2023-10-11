import { MOVIES } from "../data/allMovies.js"

const moviesService = {

    async getAllMovies( bool ){
        return new Promise( (resolve, reject) => {
            if( bool ){
                resolve( MOVIES )
            }else{
                reject( 'sos boludo' )
            }
        } )
    }

}

export default moviesService