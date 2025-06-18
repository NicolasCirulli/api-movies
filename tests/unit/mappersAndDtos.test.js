import { newMovie as mapNewMovie } from '../../mappers/movieMapper.js'; // Alias to avoid name clash
import movieDTO from '../../DTO/movieDTO.js';
import userDTO from '../../DTO/userDTO.js';
import { MOVIES } from '../../data/allMovies.js'; // Sample data for mapper

describe('Mappers and DTOs', () => {
  describe('movieMapper', () => {
    describe('newMovie', () => {
      const sampleRawMovie = {
        // Fields from MOVIES data structure that are used by the mapper
        new_image: "y5szbv8zju",
        genres: ["Horror", "Mystery", "Thriller"],
        original_language: "en",
        overview: "In 1956 France, a priest is violently murdered...",
        popularity: 4160.929,
        release_date: "2023-09-06",
        title: "The Nun II",
        vote_average: 6.986,
        vote_count: 794,
        homepage: "https://www.warnerbros.com/movies/nun2",
        revenue: 248010000,
        runtime: 110,
        status: "Released",
        tagline: "Confess your sins.",
        budget: 38500000,
        // Extra fields from MOVIES not used by this specific mapper
        id: 968051,
        image: "http://image.tmdb.org/t/p/w500/mRGmNnh6pBAGGp6fMBMwI8iTBUO.jpg",
        poster: "http://image.tmdb.org/t/p/w500/5gzzkR7y3hnY8AD1wXjCnVlHba5.jpg",
      };

      it('should correctly map all provided fields from raw data', () => {
        const mappedMovie = mapNewMovie(sampleRawMovie);

        expect(mappedMovie).toEqual({
          image: sampleRawMovie.new_image,
          genres: sampleRawMovie.genres, // Expecting it to be passed as is (array)
          original_language: sampleRawMovie.original_language,
          overview: sampleRawMovie.overview,
          popularity: sampleRawMovie.popularity,
          release_date: sampleRawMovie.release_date,
          title: sampleRawMovie.title,
          vote_average: sampleRawMovie.vote_average,
          vote_count: sampleRawMovie.vote_count,
          homepage: sampleRawMovie.homepage,
          revenue: sampleRawMovie.revenue,
          runtime: sampleRawMovie.runtime,
          status: sampleRawMovie.status,
          tagline: sampleRawMovie.tagline,
          budget: sampleRawMovie.budget,
        });
      });

      it('should handle missing optional fields by not including them or setting them to undefined', () => {
        const minimalRawData = {
          // Only fields explicitly in mapper, assume others are optional
          new_image: "minimal_image_id",
          genres: ["Test"],
          original_language: "xx",
          overview: "Minimal overview.",
          // popularity: undefined, // Example of a missing field
          release_date: "2024-01-01",
          title: "Minimal Movie",
          // vote_average: undefined,
          // vote_count: undefined,
          // homepage: undefined,
          // revenue: undefined,
          // runtime: undefined,
          // status: undefined,
          // tagline: undefined,
          // budget: undefined,
        };
        const mappedMovie = mapNewMovie(minimalRawData);

        expect(mappedMovie).toHaveProperty('image', minimalRawData.new_image);
        expect(mappedMovie).toHaveProperty('title', minimalRawData.title);
        expect(mappedMovie).toHaveProperty('genres', minimalRawData.genres);
        expect(mappedMovie).toHaveProperty('original_language', minimalRawData.original_language);
        expect(mappedMovie).toHaveProperty('overview', minimalRawData.overview);
        expect(mappedMovie).toHaveProperty('release_date', minimalRawData.release_date);

        // Fields that were not in minimalRawData should be undefined in the output
        // as the mapper does a direct property copy without defaults.
        expect(mappedMovie.popularity).toBeUndefined();
        expect(mappedMovie.vote_average).toBeUndefined();
        expect(mappedMovie.vote_count).toBeUndefined();
        expect(mappedMovie.homepage).toBeUndefined();
        expect(mappedMovie.revenue).toBeUndefined();
        expect(mappedMovie.runtime).toBeUndefined();
        expect(mappedMovie.status).toBeUndefined();
        expect(mappedMovie.tagline).toBeUndefined();
        expect(mappedMovie.budget).toBeUndefined();

        // The mapper doesn't add fields like 'id', 'comments', or 'original_title'
        expect(mappedMovie.id).toBeUndefined();
        expect(mappedMovie.comments).toBeUndefined();
        expect(mappedMovie.original_title).toBeUndefined();
      });

      it('should not add extra fields not present in the mapper logic', () => {
        const rawMovieDataWithExtra = {
          ...sampleRawMovie,
          extraField: 'should not be mapped',
          id: 12345, // id is not in the mapper's output list
        };
        const mappedMovie = mapNewMovie(rawMovieDataWithExtra);

        expect(mappedMovie).not.toHaveProperty('extraField');
        expect(mappedMovie).not.toHaveProperty('id');
        expect(mappedMovie).not.toHaveProperty('poster'); // poster is not in mapper
      });
    });
  });

  describe('movieDTO', () => {
    const sampleMovieFromDb = {
      _id: '65517a31117532b5a940e2f9', // Example MongoDB ObjectId
      image: 'y5szbv8zju', // Filename without extension
      genres: ['Horror', 'Mystery', 'Thriller'],
      original_language: 'en',
      overview: 'In 1956 France, a priest is violently murdered...',
      popularity: 4160.929,
      release_date: '2023-09-06T00:00:00.000Z', // Date object or ISO string from DB
      title: 'The Nun II',
      vote_average: 6.986,
      vote_count: 794,
      homepage: 'https://www.warnerbros.com/movies/nun2',
      revenue: 248010000,
      runtime: 110,
      status: 'Released',
      tagline: 'Confess your sins.',
      budget: 38500000,
      // DTO should not include fields like __v if they exist on DB object
      __v: 0
    };

    it('should transform a movie object to its DTO representation', () => {
      const dto = movieDTO(sampleMovieFromDb);

      expect(dto).toHaveProperty('id', sampleMovieFromDb._id.toString());
      expect(dto).toHaveProperty('image', `${sampleMovieFromDb.image}.jpg`);
      expect(dto).toHaveProperty('genres', sampleMovieFromDb.genres);
      expect(dto).toHaveProperty('original_language', sampleMovieFromDb.original_language);
      expect(dto).toHaveProperty('overview', sampleMovieFromDb.overview);
      expect(dto).toHaveProperty('popularity', sampleMovieFromDb.popularity);

      // Check release_date formatting (toLocaleDateString can be locale-specific)
      // For robustness, either mock toLocaleDateString or parse and compare date components.
      // Here, we'll check if it's a string, as precise format is locale-dependent.
      expect(typeof dto.release_date).toBe('string');
      // A more specific check could be:
      const expectedDate = new Date(sampleMovieFromDb.release_date).toLocaleDateString();
      expect(dto.release_date).toBe(expectedDate);

      expect(dto).toHaveProperty('title', sampleMovieFromDb.title);
      expect(dto).toHaveProperty('vote_average', sampleMovieFromDb.vote_average);
      expect(dto).toHaveProperty('vote_count', sampleMovieFromDb.vote_count);
      expect(dto).toHaveProperty('homepage', sampleMovieFromDb.homepage);
      expect(dto).toHaveProperty('revenue', sampleMovieFromDb.revenue);
      expect(dto).toHaveProperty('runtime', sampleMovieFromDb.runtime);
      expect(dto).toHaveProperty('status', sampleMovieFromDb.status);
      expect(dto).toHaveProperty('tagline', sampleMovieFromDb.tagline);
      expect(dto).toHaveProperty('budget', sampleMovieFromDb.budget);

      // Ensure fields not in DTO logic are excluded
      expect(dto).not.toHaveProperty('_id');
      expect(dto).not.toHaveProperty('__v');
    });

    it('should handle cases where optional fields might be missing in input', () => {
      const minimalMovieFromDb = {
        _id: 'someId123',
        image: 'minimal_img',
        genres: ['Test'],
        release_date: '2024-01-20T00:00:00.000Z',
        title: 'Minimal DTO Test',
        // overview, popularity etc., are missing
      };
      const dto = movieDTO(minimalMovieFromDb);

      expect(dto.id).toBe('someId123');
      expect(dto.image).toBe('minimal_img.jpg');
      expect(dto.title).toBe('Minimal DTO Test');
      expect(dto.release_date).toBe(new Date(minimalMovieFromDb.release_date).toLocaleDateString());

      // Check that fields not present in minimalMovieFromDb become undefined or default in DTO
      // based on DTO logic (which is direct mapping for these)
      expect(dto.overview).toBeUndefined();
      expect(dto.popularity).toBeUndefined();
      // ... and so on for other optional fields in the DTO's explicit list
    });
  });

  describe('userDTO', () => {
    const sampleUserFromDb = {
      _id: 'userId123',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedPassword!@#',
      apiKey: 'testApiKey12345',
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      __v: 0,
    };

    it('should transform a user object to its DTO representation, excluding sensitive info', () => {
      const dto = userDTO(sampleUserFromDb);

      expect(dto).toHaveProperty('name', sampleUserFromDb.name);
      expect(dto).toHaveProperty('email', sampleUserFromDb.email);
      expect(dto).toHaveProperty('api_key', sampleUserFromDb.apiKey);

      // Ensure sensitive and unnecessary fields are excluded
      expect(dto).not.toHaveProperty('password');
      expect(dto).not.toHaveProperty('_id');
      expect(dto).not.toHaveProperty('role');
      expect(dto).not.toHaveProperty('createdAt');
      expect(dto).not.toHaveProperty('updatedAt');
      expect(dto).not.toHaveProperty('__v');
    });

    it('should set api_key to empty string if not present in input object', () => {
      const userWithoutApiKey = {
        _id: 'userId456',
        name: 'No ApiKey User',
        email: 'noapikey@example.com',
        password: 'anotherPassword',
        // apiKey is missing
      };
      const dto = userDTO(userWithoutApiKey);

      expect(dto).toHaveProperty('name', userWithoutApiKey.name);
      expect(dto).toHaveProperty('email', userWithoutApiKey.email);
      expect(dto).toHaveProperty('api_key', ""); // Should default to empty string
      expect(dto).not.toHaveProperty('password');
    });

    it('should handle null or undefined apiKey by setting it to empty string', () => {
      const userWithNullApiKey = { ...sampleUserFromDb, apiKey: null };
      let dto = userDTO(userWithNullApiKey);
      expect(dto.api_key).toBe("");

      const userWithUndefinedApiKey = { ...sampleUserFromDb, apiKey: undefined };
      dto = userDTO(userWithUndefinedApiKey);
      expect(dto.api_key).toBe("");
    });
  });
});
