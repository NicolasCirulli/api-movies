import { jest } from '@jest/globals';
import { createMovieValidator } from '../../../../middleware/validator/movieValidator.js'; // Adjusted path

describe('Movie Validators', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = { body: {} };
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createMovieValidator Middleware', () => {
    const validMovieData = {
      image: 'http://example.com/image.jpg',
      genres: 'Action, Adventure', // Validator expects a string
      original_language: 'en',
      overview: 'A great movie overview.',
      popularity: 7.8,
      release_date: '2023-01-15', // Joi will attempt to convert this to a date
      title: 'Awesome Movie Title',
      vote_average: 8.5,
      vote_count: 1500,
      homepage: 'http://example.com/moviehome',
      revenue: 100000000,
      runtime: 120,
      status: 'Released',
      tagline: 'An awesome tagline!',
      budget: 50000000,
    };

    it('should call next() for valid movie data', () => {
      mockReq.body = { ...validMovieData };
      createMovieValidator(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should return errors for missing required field: image', () => {
      const data = { ...validMovieData };
      delete data.image;
      mockReq.body = data;
      createMovieValidator(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({ message: '"image" is required' }),
        ]),
      }));
    });

    it('should return errors for missing required field: genres', () => {
      const data = { ...validMovieData };
      delete data.genres;
      mockReq.body = data;
      createMovieValidator(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({ message: '"genres" is required' }),
        ]),
      }));
    });

    it('should return errors for missing required field: title', () => {
      const data = { ...validMovieData };
      delete data.title;
      mockReq.body = data;
      createMovieValidator(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({ message: '"title" is required' }),
        ]),
      }));
    });

    it('should return errors for missing required field: popularity', () => {
      const data = { ...validMovieData };
      delete data.popularity;
      mockReq.body = data;
      createMovieValidator(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({ message: '"popularity" is required' }),
        ]),
      }));
    });


    it('should return error if image is not a valid URI', () => {
      mockReq.body = { ...validMovieData, image: 'not-a-uri' };
      createMovieValidator(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({ message: '"image" must be a valid uri' }),
        ]),
      }));
    });

    it('should return error if popularity is not a number', () => {
      mockReq.body = { ...validMovieData, popularity: 'not-a-number' };
      createMovieValidator(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({ message: '"popularity" must be a number' }),
        ]),
      }));
    });

    it('should return error if release_date is not a valid date', () => {
      mockReq.body = { ...validMovieData, release_date: 'invalid-date-format' };
      createMovieValidator(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({ message: '"release_date" must be a valid date' }),
        ]),
      }));
    });

    it('should accept valid data even if optional fields are missing', () => {
      const minimalValidData = {
        image: 'http://example.com/minimal.jpg',
        genres: 'Drama',
        popularity: 5.0,
        title: 'Minimal Movie',
        vote_average: 6.0,
        revenue: 10000,
        runtime: 90,
        status: 'Released',
        tagline: 'Minimal tagline.',
        budget: 1000,
      };
      mockReq.body = minimalValidData;
      createMovieValidator(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should return multiple errors for multiple invalid fields', () => {
      mockReq.body = {
        ...validMovieData,
        title: 123, // Invalid type
        genres: undefined, // Missing required
        image: "not-a-uri", // Invalid format
      };
      delete mockReq.body.genres; // ensure it's missing
      createMovieValidator(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
      const call = mockRes.json.mock.calls[0][0];
      expect(call.success).toBe(false);
      expect(call.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ message: '"image" must be a valid uri' }),
          expect.objectContaining({ message: '"genres" is required' }),
          expect.objectContaining({ message: '"title" must be a string' }),
        ])
      );
      expect(call.errors.length).toBe(3); // Check that all errors are reported
    });
  });
});
