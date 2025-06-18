import { jest } from '@jest/globals'; // Import jest object

import userService from '../../../services/userService.js'; // Corrected path
import User from '../../../models/userModel.js'; // Corrected path
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

jest.mock('../../../models/userModel.js'); // Corrected path
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('uuidv4', () => ({
  uuid: jest.fn(() => 'mock-uuid-string') // Default mock for all tests
}));

describe('UserService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserByEmail', () => {
    it('should return a user if found', async () => {
      const mockUser = { email: 'test@example.com', name: 'Test User' };
      User.findOne.mockResolvedValue(mockUser);

      const user = await userService.getUserByEmail('test@example.com');
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(user).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      User.findOne.mockResolvedValue(null);

      const user = await userService.getUserByEmail('nonexistent@example.com');
      expect(User.findOne).toHaveBeenCalledWith({ email: 'nonexistent@example.com' });
      expect(user).toBeNull();
    });
  });

  describe('getUser', () => {
    it('should return a user if found by id', async () => {
      const mockUser = { _id: 'someUserId', name: 'Test User' };
      User.findOne.mockResolvedValue(mockUser); // Assuming getUser uses findOne with id

      const user = await userService.getUser('someUserId');
      expect(User.findOne).toHaveBeenCalledWith({ _id: 'someUserId' });
      expect(user).toEqual(mockUser);
    });

    it('should return null if user not found by id', async () => {
      User.findOne.mockResolvedValue(null);

      const user = await userService.getUser('nonexistentUserId');
      expect(User.findOne).toHaveBeenCalledWith({ _id: 'nonexistentUserId' });
      expect(user).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create and return a new user', async () => {
      const userData = { email: 'new@example.com', password: 'password123', name: 'New User' };
      const hashedPassword = 'hashedPassword123';
      const createdUser = { ...userData, password: hashedPassword, _id: 'newUserId' };

      User.findOne.mockResolvedValue(null); // Simulate user not existing
      bcrypt.hashSync.mockReturnValue(hashedPassword);
      User.create.mockResolvedValue(createdUser);

      const user = await userService.createUser(userData.name, userData.email, userData.password);

      expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(bcrypt.hashSync).toHaveBeenCalledWith(userData.password, 10);
      expect(User.create).toHaveBeenCalledWith({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
      });
      expect(user).toEqual(createdUser);
    });

    it('should throw an error if user already exists', async () => {
      const userData = { email: 'existing@example.com', password: 'password123', name: 'Existing User' };
      User.findOne.mockResolvedValue({ email: userData.email }); // Simulate user existing

      await expect(userService.createUser(userData.name, userData.email, userData.password))
        .rejects
        .toThrow('User already exists');
      expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(bcrypt.hashSync).not.toHaveBeenCalled();
      expect(User.create).not.toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    it('should update and return the user', async () => {
      const userId = 'someUserId';
      const updateData = { name: 'Updated Name' };
      const updatedUser = { _id: userId, name: 'Updated Name', email: 'test@example.com' };

      User.findOneAndUpdate.mockResolvedValue(updatedUser);

      const user = await userService.updateUser(userId, updateData);

      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: userId },
        { $set: updateData },
        { new: true }
      );
      expect(user).toEqual(updatedUser);
    });

    it('should return null if user to update is not found', async () => {
      const userId = 'nonExistentUserId';
      const updateData = { name: 'Updated Name' };

      User.findOneAndUpdate.mockResolvedValue(null);

      const user = await userService.updateUser(userId, updateData);

      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: userId },
        { $set: updateData },
        { new: true }
      );
      expect(user).toBeNull();
    });
  });

  describe('generateToken', () => {
    it('should generate a JWT token', () => {
      const user = { _id: 'userId123', email: 'test@example.com' };
      const mockToken = 'mockTokenString';
      process.env.JWT_SECRET = 'testsecret'; // Mock environment variable

      jwt.sign.mockReturnValue(mockToken);

      const token = userService.generateToken(user);

      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: user._id, email: user.email },
        'testsecret',
        { expiresIn: '1h' }
      );
      expect(token).toBe(mockToken);
    });
  });

  describe('verifyPassword', () => {
    it('should return true if passwords match', () => {
      const plainPassword = 'password123';
      const hashedPassword = 'hashedPassword123';
      bcrypt.compareSync.mockReturnValue(true);

      const result = userService.verifyPassword(plainPassword, hashedPassword);

      expect(bcrypt.compareSync).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false if passwords do not match', () => {
      const plainPassword = 'password123';
      const hashedPassword = 'differentHashedPassword123';
      bcrypt.compareSync.mockReturnValue(false);

      const result = userService.verifyPassword(plainPassword, hashedPassword);

      expect(bcrypt.compareSync).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(result).toBe(false);
    });
  });

  describe('hashPassword', () => {
    it('should return a hashed password', () => {
      const plainPassword = 'password123';
      const hashedPassword = 'hashedPassword123';
      const saltRounds = 10;
      bcrypt.hashSync.mockReturnValue(hashedPassword);

      const result = userService.hashPassword(plainPassword);

      expect(bcrypt.hashSync).toHaveBeenCalledWith(plainPassword, saltRounds);
      expect(result).toBe(hashedPassword);
    });
  });

  describe('generateKey', () => {
    it('should generate a key string', () => {
      const key = userService.generateKey();
      expect(typeof key).toBe('string');
      // Check if the mocked uuid function was called and returned the mockUuid
      expect(key).toBe('mock-uuid-string');
    });
    // Remove the regex test as we are now mocking uuidv4
    // it('should generate a key that matches UUID format', () => {
    //   const key = userService.generateKey();
    //   expect(key).toMatch(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i);
    // });
  });
});
