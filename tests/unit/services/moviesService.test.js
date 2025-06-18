import { jest } from '@jest/globals';

import moviesService from '../../../services/moviesService.js'; // Corrected path
import Movies from '../../../models/moviesModel.js'; // Corrected path

jest.mock('../../../models/moviesModel.js'); // Corrected path

describe('MoviesService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllMovies', () => {
    const mockMovies = [
      { _id: '1', title: 'Inception', genre: ['Sci-Fi', 'Action'], year: 2010, rating: 8.8 },
      { _id: '2', title: 'The Dark Knight', genre: ['Action', 'Crime', 'Drama'], year: 2008, rating: 9.0 },
      { _id: '3', title: 'Pulp Fiction', genre: ['Crime', 'Drama'], year: 1994, rating: 8.9 },
      { _id: '4', title: 'Forrest Gump', genre: ['Drama', 'Romance'], year: 1994, rating: 8.8 },
    ];

    let mockQuery;

    beforeEach(() => {
    });

    // Re-writing tests for getAllMovies based on actual service implementation
    it('should return all movies with default pagination (page 1, limit 20) and default sort (title asc)', async () => {
      Movies.find.mockResolvedValue([...mockMovies]); // find returns all initially

      const result = await moviesService.getAllMovies({});

      expect(Movies.find).toHaveBeenCalledWith({});
      // Default sort is by title ascending (implicit in service, or explicit if added)
      const sortedMockMovies = [...mockMovies].sort((a,b) => a.title.localeCompare(b.title));
      const paginatedMovies = sortedMockMovies.slice(0, 20); // Default page 1, limit 20

      expect(result.movies).toEqual(paginatedMovies);
      expect(result.totalCount).toBe(mockMovies.length);
      expect(result.totalPages).toBe(Math.ceil(mockMovies.length / 20));
      expect(result.currentPage).toBe(1); // Default page is 1
      expect(result.count).toBe(paginatedMovies.length);
    });

    it('should filter movies by title (regex, case-insensitive)', async () => {
      const titleQuery = 'knight';
      const expectedFiltered = mockMovies.filter(m => new RegExp(titleQuery, 'i').test(m.title));
      Movies.find.mockResolvedValue(expectedFiltered);

      const result = await moviesService.getAllMovies({ title: titleQuery });

      expect(Movies.find).toHaveBeenCalledWith({ title: { $regex: titleQuery, $options: 'i' } });
      // Service default sorts by title, then paginates
      const sorted = expectedFiltered.sort((a,b) => a.title.localeCompare(b.title));
      const paginated = sorted.slice(0, 20);
      expect(result.movies).toEqual(paginated);
      expect(result.totalCount).toBe(expectedFiltered.length);
    });

    it('should filter movies by genre (case-insensitive, after title filter)', async () => {
      const genreQuery = 'drama';
      // Simulate Movies.find initially returning all, then service filters by genre
      Movies.find.mockResolvedValue([...mockMovies]);

      const result = await moviesService.getAllMovies({ genre: genreQuery });

      expect(Movies.find).toHaveBeenCalledWith({}); // Initial find might be empty or based on other query like title
      const genreFiltered = mockMovies.filter(m => m.genre.some(g => g.toLowerCase() === genreQuery.toLowerCase()));
      const sorted = genreFiltered.sort((a,b) => a.title.localeCompare(b.title));
      const paginated = sorted.slice(0, 20);

      expect(result.movies).toEqual(paginated);
      expect(result.totalCount).toBe(genreFiltered.length);
    });

    it('should handle pagination correctly (page 2, limit 20)', async () => {
      Movies.find.mockResolvedValue([...mockMovies]); // Find returns all

      const result = await moviesService.getAllMovies({ page: 2 }); // Uses default limit 20

      const sorted = [...mockMovies].sort((a,b) => a.title.localeCompare(b.title));
      const paginated = sorted.slice(20, 40); // Page 2: (2-1)*20 = 20, up to 20+20=40

      expect(result.movies).toEqual(paginated);
      expect(result.currentPage).toBe(2);
      expect(result.totalCount).toBe(mockMovies.length);
      expect(result.totalPages).toBe(Math.ceil(mockMovies.length / 20));
    });

    it('should return message if page requested has no movies', async () => {
        Movies.find.mockResolvedValue([...mockMovies]);
        const result = await moviesService.getAllMovies({ page: 100 }); // A page far beyond existing movies
        expect(result.movies).toEqual([]);
        expect(result.message).toBe('There is nothing here');
        expect(result.status).toBe(400);
        expect(result.currentPage).toBe(100);
    });

    it('should sort movies by specified field (e.g., rating) and order (desc)', async () => {
      Movies.find.mockResolvedValue([...mockMovies]);

      const result = await moviesService.getAllMovies({ sort: 'rating', order: 'des' });

      // Service sorts in JS. Default pagination applies.
      const sortedMovies = [...mockMovies].sort((a, b) => b.rating - a.rating); // rating desc
      const paginatedMovies = sortedMovies.slice(0, 20);

      expect(result.movies).toEqual(paginatedMovies);
    });

    it('should sort movies by specified field (e.g., year) and order (asc)', async () => {
      Movies.find.mockResolvedValue([...mockMovies]);

      const result = await moviesService.getAllMovies({ sort: 'year', order: 'asc' }); // asc is default if order not 'des'

      const sortedMovies = [...mockMovies].sort((a, b) => a.year - b.year); // year asc
      const paginatedMovies = sortedMovies.slice(0, 20);

      expect(result.movies).toEqual(paginatedMovies);
    });


    it('should return empty movies array if no movies match title filter', async () => {
      Movies.find.mockResolvedValue([]); // No movies found by title

      const result = await moviesService.getAllMovies({ title: 'NonExistent' });

      expect(Movies.find).toHaveBeenCalledWith({ title: { $regex: 'NonExistent', $options: 'i' } });
      expect(result.movies).toEqual([]);
      expect(result.totalCount).toBe(0);
      expect(result.count).toBe(0);
    });

    it('should ignore invalid page number (e.g., -1 or 0) and use page 1', async () => {
        Movies.find.mockResolvedValue([...mockMovies]);
        const resultForNegativePage = await moviesService.getAllMovies({ page: -1 });
        const sorted = [...mockMovies].sort((a,b) => a.title.localeCompare(b.title));
        const paginated = sorted.slice(0, 20);

        expect(resultForNegativePage.movies).toEqual(paginated);
        expect(resultForNegativePage.currentPage).toBe(1); // Service logic defaults invalid page to 1

        const resultForZeroPage = await moviesService.getAllMovies({ page: 0 });
        expect(resultForZeroPage.movies).toEqual(paginated);
        expect(resultForZeroPage.currentPage).toBe(1); // Service logic defaults invalid page to 1
    });

    // Note: The service does not have a 'limit' query parameter in its current form for getAllMovies.
    // Pagination is fixed at 20 items per page if a page query is provided.
    // If no page query, it returns all (potentially sorted/filtered) movies. Let's test that.
     it('should return all movies if no page query is provided (respecting filters and sort)', async () => {
        Movies.find.mockResolvedValue([...mockMovies]);
        const genreQuery = 'Drama';
        const result = await moviesService.getAllMovies({ genre: genreQuery, sort: 'year', order: 'des' });

        const genreFiltered = mockMovies.filter(m => m.genre.some(g => g.toLowerCase() === genreQuery.toLowerCase()));
        const sorted = genreFiltered.sort((a,b) => b.year - a.year); // year desc

        expect(Movies.find).toHaveBeenCalledWith({}); // Title query was empty
        expect(result.movies).toEqual(sorted);
        expect(result.count).toBe(sorted.length);
        // totalCount, totalPages, currentPage should not be set if page is not in query
        expect(result.totalCount).toBeUndefined();
        expect(result.totalPages).toBeUndefined();
        expect(result.currentPage).toBeUndefined();
    });

  });

  describe('getById', () => {
    const mockMovie = { _id: '1', title: 'Inception', genre: ['Sci-Fi', 'Action'], year: 2010, rating: 8.8 };

    it('should return a movie if found by id', async () => {
      Movies.findById.mockResolvedValue(mockMovie);

      const result = await moviesService.getById('1');

      expect(Movies.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockMovie);
    });

    it('should return null if movie not found by id', async () => {
      Movies.findById.mockResolvedValue(null);

      const result = await moviesService.getById('nonexistent');

      expect(Movies.findById).toHaveBeenCalledWith('nonexistent');
      expect(result).toBeNull();
    });

    it('should throw an error if Movies.findById rejects', async () => {
      const errorMessage = 'Database error';
      Movies.findById.mockRejectedValue(new Error(errorMessage));

      await expect(moviesService.getById('1')).rejects.toThrow(errorMessage);
    });
  });

  describe('getMoviesPagination', () => {
    const mockMovies = [
      { _id: '1', title: 'Inception' },
      { _id: '2', title: 'The Dark Knight' },
    ];
    let mockQuery;

    beforeEach(() => {
      mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockMovies) // Default to resolving with mockMovies
      };
      Movies.find.mockReturnValue(mockQuery);
    });

    it('should return paginated movies', async () => {
      const start = 0;
      const end = 2; // This 'end' param in service is used as 'limit'

      const result = await moviesService.getMoviesPagination(start, end);

      expect(Movies.find).toHaveBeenCalledWith(); // find() is called without args
      expect(mockQuery.skip).toHaveBeenCalledWith(start);
      expect(mockQuery.limit).toHaveBeenCalledWith(end);
      expect(result).toEqual(mockMovies);
    });

    it('should throw an error if Movies.find().skip().limit() rejects', async () => {
      const errorMessage = 'Database error during pagination';
      // Ensure the chained mock setup correctly simulates a promise rejection
      // One way is to make exec() reject:
      mockQuery.exec.mockRejectedValue(new Error(errorMessage));
      Movies.find.mockReturnValue(mockQuery);


      await expect(moviesService.getMoviesPagination(0, 5)).rejects.toThrow(errorMessage);
    });
  });

  describe('createMovie', () => {
    const movieData = { title: 'New Movie', genre: ['Test'], year: 2023, rating: 5 };
    const createdMovie = { ...movieData, _id: 'newId' };

    it('should create and return a new movie', async () => {
      Movies.create.mockResolvedValue(createdMovie);

      const result = await moviesService.createMovie(movieData);

      expect(Movies.create).toHaveBeenCalledWith(movieData);
      expect(result).toEqual(createdMovie);
    });

    it('should throw an error if Movies.create rejects', async () => {
      const errorMessage = 'Error creating movie';
      Movies.create.mockRejectedValue(new Error(errorMessage));

      await expect(moviesService.createMovie(movieData)).rejects.toThrow(errorMessage);
    });
  });

  describe('newComment', () => {
    const commentData = { id: 'movieId1', comment: 'Great movie!', user: 'userId1', name: 'Test User' };
    const movieWithNewComment = {
      _id: 'movieId1',
      title: 'Test Movie',
      comments: [{ comment: 'Great movie!', user: 'userId1', name: 'Test User', _id: 'commentId1' }]
    };

    it('should add a new comment and return the updated movie', async () => {
      Movies.findOneAndUpdate.mockResolvedValue(movieWithNewComment);

      const result = await moviesService.newComment(commentData);

      expect(Movies.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: commentData.id },
        { $push: { comments: { comment: commentData.comment, user: commentData.user, name: commentData.name } } },
        { new: true }
      );
      expect(result).toEqual(movieWithNewComment);
    });

    it('should throw an error if Movies.findOneAndUpdate rejects', async () => {
      const errorMessage = 'Error adding comment';
      Movies.findOneAndUpdate.mockRejectedValue(new Error(errorMessage));

      await expect(moviesService.newComment(commentData)).rejects.toThrow(errorMessage);
    });
  });

  describe('deleteComment', () => {
    const movieData = {
      _id: 'movieId1',
      title: 'Test Movie',
      comments: [
        { _id: 'commentId1', user: 'userId1', text: 'Comment 1' },
        { _id: 'commentId2', user: 'userId2', text: 'Comment 2' },
        { _id: 'commentId3', user: 'userId1', text: 'Comment 3' },
      ],
      save: jest.fn().mockResolvedValue(true) // Mock save method
    };

    beforeEach(() => {
      // Reset the top-level movieData.save mock for safety, though not directly used by findById mock below
      movieData.save = jest.fn().mockResolvedValue(true);

      Movies.findById.mockImplementation(async (id) => { // Make it async
        if (id === movieData._id) {
          // Create a deep copy of movieData for each call to ensure test isolation
          const freshMovieData = JSON.parse(JSON.stringify(movieData));
          // Attach a new jest.fn() as the save method to this fresh copy
          freshMovieData.save = jest.fn().mockResolvedValue(true);
          return freshMovieData; // Return the fresh, mutable object with a mock save
        }
        return null; // Or Promise.resolve(null)
      });
    });

    it('should delete a comment if found and user matches, then save and return the movie', async () => {
      const deleteParams = { MovieID: 'movieId1', userID: 'userId1', commentID: 'commentId1' };
      // findById will now return a fresh object with its own save mock
      const movieInstance = await Movies.findById(deleteParams.MovieID);
      // To verify save on this specific instance, we need to get it from the mock setup,
      // or trust the mockImplementation correctly attaches it.
      // For simplicity, we'll get the instance from the service call's effect.

      const result = await moviesService.deleteComment(deleteParams);

      expect(Movies.findById).toHaveBeenCalledWith(deleteParams.MovieID);
      // The 'save' method is on the instance `result` (if successful) or the object fetched by findById.
      // We need to ensure the save mock on *that specific instance* was called.
      // The current `movieInstance` above is not the one that `save` would be called on inside the service.
      // The service fetches its own instance.
      // So, we check the result and its state.
      expect(result.save).toHaveBeenCalled(); // Check if the save method on the returned (and modified) movie was called.
      expect(result.comments.find(c => c._id === 'commentId1')).toBeUndefined();
      // The initial number of comments was movieData.comments.length.
      // We need to compare against that, or the length of comments on the *original* mock before deletion.
      expect(result.comments.length).toBe(movieData.comments.length - 1);
    });

    it('should not modify comments if commentID does not exist, and still return the movie', async () => {
      const deleteParams = { MovieID: 'movieId1', userID: 'userId1', commentID: 'nonExistentCommentId' };
      const result = await moviesService.deleteComment(deleteParams);

      expect(Movies.findById).toHaveBeenCalledWith(deleteParams.MovieID);
      expect(result.save).not.toHaveBeenCalled(); // Save should not be called if no comment is deleted
      expect(result.comments.length).toBe(movieData.comments.length);
    });

    it('should not modify comments if userID does not match comment user, and still return the movie', async () => {
      const deleteParams = { MovieID: 'movieId1', userID: 'wrongUserId', commentID: 'commentId1' };
      const result = await moviesService.deleteComment(deleteParams);

      expect(Movies.findById).toHaveBeenCalledWith(deleteParams.MovieID);
      expect(result.save).not.toHaveBeenCalled();
      expect(result.comments.find(c => c._id === 'commentId1')).toBeDefined(); // Comment still there
      expect(result.comments.length).toBe(movieData.comments.length);
    });

    it('should throw an error if movie not found (as it tries to access movie.comments)', async () => {
      Movies.findById.mockResolvedValue(null); // findById returns null
      const deleteParams = { MovieID: 'nonExistentMovieId', userID: 'userId1', commentID: 'commentId1' };

      await expect(moviesService.deleteComment(deleteParams)).rejects.toThrow(TypeError); // Expecting TypeError from accessing 'comments' on null
    });

    it('should throw an error if movie.save() rejects', async () => {
      // Modify the mockImplementation for this specific test case
      Movies.findById.mockImplementation(async (id) => {
        if (id === movieData._id) {
          const freshMovieData = JSON.parse(JSON.stringify(movieData));
          freshMovieData.save = jest.fn().mockRejectedValue(new Error('Save failed')); // This save will reject
          return freshMovieData;
        }
        return null;
      });

      const deleteParams = { MovieID: 'movieId1', userID: 'userId1', commentID: 'commentId1' };
      await expect(moviesService.deleteComment(deleteParams)).rejects.toThrow('Save failed');
      // We can also check if the save was attempted on the instance that would have been returned by findById
      const movieInstance = await Movies.findById(deleteParams.MovieID); // Re-fetch to check the mock on it
      expect(movieInstance.save).toHaveBeenCalled();
    });
  });

  describe('createAllMovies', () => {
    const moviesData = [
      { title: 'Movie 1', genre: ['Action'], year: 2020 },
      { title: 'Movie 2', genre: ['Comedy'], year: 2021 },
    ];
    const createdMovies = moviesData.map((m, i) => ({ ...m, _id: `id${i}` }));

    it('should insert multiple movies and return them', async () => {
      Movies.insertMany.mockResolvedValue(createdMovies);

      const result = await moviesService.createAllMovies(moviesData);

      expect(Movies.insertMany).toHaveBeenCalledWith(moviesData);
      expect(result).toEqual(createdMovies);
    });

    it('should throw an error if Movies.insertMany rejects', async () => {
      const errorMessage = 'Error inserting many movies';
      Movies.insertMany.mockRejectedValue(new Error(errorMessage));

      await expect(moviesService.createAllMovies(moviesData)).rejects.toThrow(errorMessage);
    });
  });
});
