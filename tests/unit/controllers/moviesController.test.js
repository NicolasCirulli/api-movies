import { jest } from '@jest/globals';

// Mock services, DTOs, and Mappers
import moviesService from '../../../services/moviesService.js';
import movieDTO from '../../../DTO/movieDTO.js';
import movieMapper from '../../../mappers/movieMapper.js'; // Assuming default export for mapper
import { MOVIES } from '../../../data/allMovies.js'; // For loadAllMovies

jest.mock('../../../services/moviesService.js');
jest.mock('../../../DTO/movieDTO.js');
jest.mock('../../../mappers/movieMapper.js');
// MOVIES is static data, no need to mock unless its usage changes.

// Import the controller functions
import {
  getMovies,
  getMovieById,
  createMovie,
  loadAllMovies,
  // Assuming comment controllers are separate and not being tested here
} from '../../../controllers/moviesControllers.js'; // Adjusted path

describe('MoviesController', () => {
  let mockReq;
  let mockRes;
  // let mockNext; // Not typically used in these controller actions unless for specific error passing

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
      query: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(), // For loadAllMovies which uses res.send
    };
    // mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMovies', () => {
    const mockRawMovies = [
      { _id: '1', title: 'Movie 1 Raw' }, { _id: '2', title: 'Movie 2 Raw' }
    ];
    const mockDtoMovies = [
      { id: '1', title: 'Movie 1 DTO' }, { id: '2', title: 'Movie 2 DTO' }
    ];
    const mockServiceResponse = {
      movies: mockRawMovies,
      currentPage: 1,
      totalPages: 1,
      totalCount: 2,
      // other pagination fields if present in actual service response...
    };

    it('should fetch movies, map them to DTOs, and return them with pagination details', async () => {
      mockReq.query = { page: '1', limit: '10' };
      moviesService.getAllMovies.mockResolvedValue(mockServiceResponse);
      // Setup movieDTO mock to transform each movie
      movieDTO.mockImplementation(movie => mockDtoMovies.find(m => m.id === movie._id));

      await getMovies(mockReq, mockRes);

      expect(moviesService.getAllMovies).toHaveBeenCalledWith(mockReq.query);
      expect(movieDTO).toHaveBeenCalledTimes(mockRawMovies.length);
      expect(movieDTO).toHaveBeenCalledWith(mockRawMovies[0]);
      expect(movieDTO).toHaveBeenCalledWith(mockRawMovies[1]);

      // The controller sends the whole service response back, with 'movies' field updated
      const expectedResponse = {
        ...mockServiceResponse,
        movies: mockDtoMovies, // Movies are mapped to DTOs
      };
      expect(mockRes.status).toHaveBeenCalledWith(200); // Default status if not in serviceResponse
      expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
    });

    it('should return 500 if moviesService.getAllMovies throws an error', async () => {
      mockReq.query = { page: '1' };
      const error = new Error('Service failure');
      moviesService.getAllMovies.mockRejectedValue(error);

      await getMovies(mockReq, mockRes);

      expect(moviesService.getAllMovies).toHaveBeenCalledWith(mockReq.query);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(error); // Sends the raw error object
    });

    it('should use status from service response if provided', async () => {
        const serviceResponseWithStatus = {
            status: 206, // Partial Content or any custom status
            message: 'Partial data returned',
            movies: mockRawMovies, // Assuming some movies are returned
            currentPage: 1,
            totalPages: 1,
            totalCount: 2
        };
        moviesService.getAllMovies.mockResolvedValue(serviceResponseWithStatus);
        movieDTO.mockImplementation(movie => mockDtoMovies.find(m => m.id === movie._id));

        await getMovies(mockReq, mockRes);

        expect(moviesService.getAllMovies).toHaveBeenCalledWith(mockReq.query);
        expect(mockRes.status).toHaveBeenCalledWith(serviceResponseWithStatus.status);
        expect(mockRes.json).toHaveBeenCalledWith({
            ...serviceResponseWithStatus,
            movies: mockDtoMovies
        });
    });
  });

  describe('getMovieById', () => {
    const movieId = 'testMovieId123';
    const mockMovieFromService = { _id: movieId, title: 'Test Movie', director: 'Test Director' };
    // Note: Controller does NOT use movieDTO for getMovieById

    it('should return a movie if found by service', async () => {
      mockReq.params.id = movieId;
      moviesService.getById.mockResolvedValue(mockMovieFromService);

      await getMovieById(mockReq, mockRes);

      expect(moviesService.getById).toHaveBeenCalledWith(movieId);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockMovieFromService);
    });

    it('should return the service response (e.g. null) if movie not found', async () => {
      mockReq.params.id = 'nonExistentId';
      moviesService.getById.mockResolvedValue(null); // Simulate movie not found

      await getMovieById(mockReq, mockRes);

      expect(moviesService.getById).toHaveBeenCalledWith('nonExistentId');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(null);
    });

    it('should return 500 and error object if moviesService.getById throws an error', async () => {
      mockReq.params.id = movieId;
      const error = new Error('Service error finding by ID');
      moviesService.getById.mockRejectedValue(error);

      await getMovieById(mockReq, mockRes);

      expect(moviesService.getById).toHaveBeenCalledWith(movieId);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: error });
    });
  });

  describe('createMovie', () => {
    const movieRequestBody = { title: 'New Movie Raw', genres: 'Raw Genre String', new_image: 'raw_image_id' /* other fields */ };
    const mappedMovieData = { title: 'New Movie Mapped', genres: ['Mapped Genre'], image: 'mapped_image.jpg' };
    const createdMovieFromService = { _id: 'newMovieId', ...mappedMovieData };

    it('should map request body, create movie using service, and return 201 with new movie', async () => {
      mockReq.body = movieRequestBody;
      // movieMapper is a default export, so its methods are on movieMapper.default if not destructured.
      // However, the controller imports it as `import movieMapper from ...` so methods are directly on `movieMapper`.
      movieMapper.newMovie.mockReturnValue(mappedMovieData);
      moviesService.createMovie.mockResolvedValue(createdMovieFromService);

      await createMovie(mockReq, mockRes);

      expect(movieMapper.newMovie).toHaveBeenCalledWith(movieRequestBody);
      expect(moviesService.createMovie).toHaveBeenCalledWith(mappedMovieData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        new_movie: createdMovieFromService,
      });
    });

    it('should return 500 if movieMapper.newMovie throws an error', async () => {
      mockReq.body = movieRequestBody;
      const error = new Error('Mapper error');
      movieMapper.newMovie.mockImplementation(() => { throw error; });

      await createMovie(mockReq, mockRes);

      expect(movieMapper.newMovie).toHaveBeenCalledWith(movieRequestBody);
      expect(moviesService.createMovie).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });

    it('should return 500 if moviesService.createMovie throws an error', async () => {
      mockReq.body = movieRequestBody;
      movieMapper.newMovie.mockReturnValue(mappedMovieData);
      const error = new Error('Service error creating movie');
      moviesService.createMovie.mockRejectedValue(error);

      await createMovie(mockReq, mockRes);

      expect(movieMapper.newMovie).toHaveBeenCalledWith(movieRequestBody);
      expect(moviesService.createMovie).toHaveBeenCalledWith(mappedMovieData);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  describe('loadAllMovies', () => {
    // MOVIES is imported directly by the controller. We don't mock MOVIES itself,
    // but we mock the mapper and service that process it.
    const mappedMoviesData = [ // Simulates output of MOVIES.map(movieMapper.newMovie)
      { title: 'Mapped Movie 1', image: 'img1.jpg' },
      { title: 'Mapped Movie 2', image: 'img2.jpg' }
    ];
    const serviceResponseFromCreateAll = { createdCount: 2, data: mappedMoviesData };

    it('should map static MOVIES data, call service to create all, and return service response', async () => {
      // Setup movieMapper.newMovie to return a predictable structure for each item in MOVIES
      // This mock needs to be robust enough if MOVIES has many items or varied structures.
      // For simplicity, assume it's called and returns a consistent object for each movie.
      movieMapper.newMovie.mockImplementation(movie => ({
        title: movie.title, // Keep original title for easier assertion
        image: movie.new_image + '.mapped', // Mark as mapped
        // other mapped fields...
      }));

      moviesService.createAllMovies.mockResolvedValue(serviceResponseFromCreateAll);

      await loadAllMovies(mockReq, mockRes);

      expect(movieMapper.newMovie).toHaveBeenCalledTimes(MOVIES.length);
      // Example check for the first movie in MOVIES
      if (MOVIES.length > 0) {
        expect(movieMapper.newMovie).toHaveBeenCalledWith(MOVIES[0]);
      }

      // The argument to createAllMovies will be an array of mapped movies
      // We can check if it was called with an array of the correct length,
      // and that each item has been processed by the (mocked) mapper.
      expect(moviesService.createAllMovies).toHaveBeenCalledWith(
        expect.arrayContaining(MOVIES.map(m => ({ title: m.title, image: m.new_image + '.mapped' })))
      );

      expect(mockRes.json).toHaveBeenCalledWith(serviceResponseFromCreateAll);
      expect(mockRes.status).not.toHaveBeenCalled(); // Uses default status
    });

    it('should return 500 if movieMapper.newMovie throws an error during map', async () => {
      const error = new Error('Error during mapping MOVIES');
      movieMapper.newMovie.mockImplementation(() => { throw error; });

      await loadAllMovies(mockReq, mockRes);

      expect(movieMapper.newMovie).toHaveBeenCalled(); // It will be called at least once
      expect(moviesService.createAllMovies).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Internal server error', error: error });
    });

    it('should return 500 if moviesService.createAllMovies throws an error', async () => {
      movieMapper.newMovie.mockImplementation(movie => ({ title: movie.title, image: movie.new_image })); // Simple pass-through for this test
      const error = new Error('Service error during createAllMovies');
      moviesService.createAllMovies.mockRejectedValue(error);

      await loadAllMovies(mockReq, mockRes);

      expect(moviesService.createAllMovies).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Internal server error', error: error });
    });
  });
});
