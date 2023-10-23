import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
  image: { type: String, required: true },
  genres: [{ type: String, required: true }],
  original_language: { type: String},
  overview: { type: String },
  popularity: { type: Number },
  release_date: { type: Date },
  title: { type: String, required: true },
  vote_average: { type: Number },
  vote_count: { type: Number },
  homepage: { type: String },
  revenue: { type: Number },
  runtime: { type: Number },
  status: { type: String },
  tagline: { type: String },
  budget: { type: Number },
  comments : [ {
      comment : { type : String },
      user : { type: mongoose.Schema.Types.ObjectId, ref : 'User' },
      name : { type : String }
   } ]
});

const Movie = mongoose.model('Movie', movieSchema);

export default Movie