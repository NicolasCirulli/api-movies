const movieDTO = ( obj ) => {
    const date = new Date( obj.release_date )
        return {
                id: obj._id,
                image : obj.image +'.jpg',
                genres : obj.genres,
                original_language : obj.original_language,
                overview : obj.overview,
                popularity: obj.popularity,
                release_date: date.toLocaleDateString(),
                title : obj.title,
                vote_average : obj.vote_average,
                vote_count : obj.vote_count,
                homepage : obj.homepage,
                revenue: obj.revenue,
                runtime: obj.runtime,
                status : obj.status,
                tagline : obj.tagline,
                budget : obj.budget 
        }
}

export default movieDTO