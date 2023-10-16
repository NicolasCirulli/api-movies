const movieMapper = {
    newMovie(obj) {
        return {
            image : obj.new_image,
            genres : obj.genres,
            original_language : obj.original_language,
            overview : obj.overview,
            popularity: obj.popularity,
            release_date: obj.release_date,
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
}

export default movieMapper