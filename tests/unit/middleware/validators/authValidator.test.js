import { jest } from '@jest/globals';
import { signInValidator, signUpValidator } from '../../../../middleware/validator/authValidator.js'; // Adjusted path

describe('Auth Validators', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = { body: {} };
    mockRes = {
      json: jest.fn().mockReturnThis(), // Chainable
      status: jest.fn().mockReturnThis(), // Chainable
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signInValidator Middleware', () => {
    it('should call next() for valid email and password', () => {
      mockReq.body = { email: 'test@example.com', password: 'password123' };
      signInValidator(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should return errors for missing email', () => {
      mockReq.body = { password: 'password123' };
      signInValidator(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({ message: '"email" is required' }),
        ]),
      }));
    });

    it('should return errors for missing password', () => {
      mockReq.body = { email: 'test@example.com' };
      signInValidator(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({ message: '"password" is required' }),
        ]),
      }));
    });

    it('should return errors for invalid email format', () => {
      mockReq.body = { email: 'invalid-email', password: 'password123' };
      signInValidator(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({ message: '"email" must be a valid email' }),
        ]),
      }));
    });

    it('should return errors for password too short (less than 8 chars)', () => {
      mockReq.body = { email: 'test@example.com', password: 'short' };
      signInValidator(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({ message: '"password" length must be at least 8 characters long' }),
        ]),
      }));
    });

    it('should return errors for password too long (more than 30 chars)', () => {
      mockReq.body = { email: 'test@example.com', password: 'a'.repeat(31) };
      signInValidator(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({ message: '"password" length must be less than or equal to 30 characters long' }),
        ]),
      }));
    });

    it('should return multiple errors if multiple fields are invalid', () => {
      mockReq.body = { email: 'invalid', password: 'short' };
      signInValidator(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({ message: '"email" must be a valid email' }),
          expect.objectContaining({ message: '"password" length must be at least 8 characters long' }),
        ]),
      }));
      const call = mockRes.json.mock.calls[0][0];
      expect(call.errors.length).toBe(2);
    });
  });

  describe('signUpValidator Middleware', () => {
    it('should call next() for valid name, email, and password (and optional google flag)', () => {
      mockReq.body = { name: 'Test User', email: 'test@example.com', password: 'password123' };
      signUpValidator(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockRes.json).not.toHaveBeenCalled();

      mockNext.mockClear(); // Clear for next assertion
      mockReq.body = { name: 'Google User', email: 'google@example.com', password: 'password123', google: true };
      signUpValidator(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockRes.json).not.toHaveBeenCalled();

      mockNext.mockClear();
      mockReq.body = { name: 'Google User False', email: 'googlefalse@example.com', password: 'password123', google: false };
      signUpValidator(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should return errors for missing name', () => {
      mockReq.body = { email: 'test@example.com', password: 'password123' };
      signUpValidator(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({ message: '"name" is required' }),
        ]),
      }));
    });

    it('should return errors for missing email', () => {
      mockReq.body = { name: 'Test User', password: 'password123' };
      signUpValidator(mockReq, mockRes, mockNext);
       expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({ message: '"email" is required' }),
        ]),
      }));
    });

    it('should return errors for missing password', () => {
      mockReq.body = { name: 'Test User', email: 'test@example.com' };
      signUpValidator(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({ message: '"password" is required' }),
        ]),
      }));
    });

    it('should return errors for invalid email format', () => {
      mockReq.body = { name: 'Test User', email: 'invalid-email', password: 'password123' };
      signUpValidator(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({ message: '"email" must be a valid email' }),
        ]),
      }));
    });

    it('should return errors for password too short', () => {
      mockReq.body = { name: 'Test User', email: 'test@example.com', password: 'short' };
      signUpValidator(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({ message: '"password" length must be at least 8 characters long' }),
        ]),
      }));
    });

    it('should return errors for invalid google flag type (not boolean)', () => {
      mockReq.body = { name: 'Test User', email: 'test@example.com', password: 'password123', google: 'not-a-boolean' };
      signUpValidator(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({ message: '"google" must be a boolean' }),
        ]),
      }));
    });

    it('should return multiple errors for multiple invalid fields', () => {
      mockReq.body = { email: 'invalid', password: 'short' }; // name also missing
      signUpValidator(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({ message: '"name" is required' }),
          expect.objectContaining({ message: '"email" must be a valid email' }),
          expect.objectContaining({ message: '"password" length must be at least 8 characters long' }),
        ]),
      }));
      const call = mockRes.json.mock.calls[0][0];
      expect(call.errors.length).toBe(3);
    });
  });
});
