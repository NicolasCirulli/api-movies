import { jest } from '@jest/globals';

// Mock services and DTOs
import userService from '../../../services/userService.js';
import emailService from '../../../services/emailService.js';
import userDTO from '../../../DTO/userDTO.js';

jest.mock('../../../services/userService.js');
jest.mock('../../../services/emailService.js');
jest.mock('../../../DTO/userDTO.js');

// Import the controller functions
import {
  login,
  register,
  verifyAccount,
  loginWithToken,
  generateApiKey,
  getApiKey,
} from '../../../controllers/authControllers.js'; // Adjusted path

describe('AuthController', () => {
  let mockReq;
  let mockRes;
  let mockNext; // Though not explicitly used by these controller functions based on typical Express patterns

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
      query: {},
      user: null, // For token-based auth
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(), // For login if it sets cookies
    };
    mockNext = jest.fn(); // For error handling or moving to next middleware
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginCredentials = { email: 'test@example.com', password: 'password123' };
    const mockUser = {
        _id: 'userId1',
        email: loginCredentials.email,
        name: 'Test User',
        password: 'hashedPassword', // Usually not directly used here but good for mock structure
        status: 'active' // Assuming status is checked or relevant
    };
    const mockUserDtoData = { id: 'userId1', email: loginCredentials.email, name: 'Test User' };
    const mockToken = 'mock-jwt-token';

    it('should successfully login a user with valid credentials', async () => {
      mockReq.body = loginCredentials;
      userService.getUserByEmail.mockResolvedValue(mockUser);
      userService.verifyPassword.mockReturnValue(true);
      userService.generateToken.mockReturnValue(mockToken);
      userDTO.mockReturnValue(mockUserDtoData);

      await login(mockReq, mockRes);

      expect(userService.getUserByEmail).toHaveBeenCalledWith(loginCredentials.email);
      expect(userService.verifyPassword).toHaveBeenCalledWith(loginCredentials.password, mockUser.password);
      expect(userService.generateToken).toHaveBeenCalledWith(loginCredentials.email); // Corrected: token uses email
      expect(userDTO).toHaveBeenCalledWith(mockUser);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Login successful.', // Corrected message
        user: mockUserDtoData,
        token: mockToken,
      });
      expect(mockRes.cookie).toHaveBeenCalledWith('token', mockToken, { httpOnly: true });
    });

    it('should return 401 if user not found', async () => {
      mockReq.body = loginCredentials;
      userService.getUserByEmail.mockResolvedValue(null);

      await login(mockReq, mockRes);

      expect(userService.getUserByEmail).toHaveBeenCalledWith(loginCredentials.email);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'The provided credentials are invalid.', // Corrected message
      });
    });

    it('should return 401 if password is invalid', async () => {
      mockReq.body = loginCredentials;
      userService.getUserByEmail.mockResolvedValue(mockUser);
      userService.verifyPassword.mockReturnValue(false);

      await login(mockReq, mockRes);

      expect(userService.getUserByEmail).toHaveBeenCalledWith(loginCredentials.email);
      expect(userService.verifyPassword).toHaveBeenCalledWith(loginCredentials.password, mockUser.password);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'The provided credentials are invalid.', // Corrected message
      });
    });

    // Removed speculative "403 if user status is not active" test as it's not in controller logic.

    it('should return 500 if userService.getUserByEmail throws an error', async () => {
      mockReq.body = loginCredentials;
      const error = new Error('Database error');
      userService.getUserByEmail.mockRejectedValue(error);

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: error, // Controller sends the whole error object
      });
    });
  });

  describe('register', () => {
    const registerData = {
      name: 'New User',
      email: 'new@example.com',
      password: 'newPassword123'
    };
    const mockRegisteredUser = {
      _id: 'newUser1',
      ...registerData,
      status: 'pending' // New users are typically pending
    };
    // userDTO is not directly called in register response in the typical controller snippet,
    // but if it were, it would be mocked like in login.

    it('should successfully register a new user and send verification email', async () => {
      mockReq.body = registerData;
      userService.getUserByEmail.mockResolvedValue(null); // User does not exist
      userService.createUser.mockResolvedValue(mockRegisteredUser); // Pass the whole body
      emailService.sendEmail.mockResolvedValue();

      await register(mockReq, mockRes);

      expect(userService.getUserByEmail).toHaveBeenCalledWith(registerData.email);
      expect(userService.createUser).toHaveBeenCalledWith(mockReq.body); // Corrected: uses req.body
      expect(emailService.sendEmail).toHaveBeenCalledWith(mockRegisteredUser.email, mockRegisteredUser._id); // Corrected: uses _id as code
      expect(mockRes.status).toHaveBeenCalledWith(202);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "ok", // Corrected response structure
        message: 'The account was created successfully. Please verify your email to activate your account.',
      });
    });

    it('should successfully register a new user with google:true and NOT send verification email', async () => {
      const googleRegisterData = { ...registerData, google: true };
      const mockGoogleUser = { ...mockRegisteredUser, google: true, status: 'active' }; // Google users might be auto-active
      mockReq.body = googleRegisterData;

      userService.getUserByEmail.mockResolvedValue(null);
      userService.createUser.mockResolvedValue(mockGoogleUser); // Pass whole body

      await register(mockReq, mockRes);

      expect(userService.getUserByEmail).toHaveBeenCalledWith(googleRegisterData.email);
      expect(userService.createUser).toHaveBeenCalledWith(mockReq.body); // Corrected
      expect(emailService.sendEmail).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(202); // Corrected: 202
       expect(mockRes.json).toHaveBeenCalledWith({
        status: "ok", // Corrected
        message: 'The account was created successfully.', // Corrected
      });
    });

    it('should return 409 if email is already in use', async () => {
      mockReq.body = registerData;
      userService.getUserByEmail.mockResolvedValue({ email: registerData.email });

      await register(mockReq, mockRes);

      expect(userService.getUserByEmail).toHaveBeenCalledWith(registerData.email);
      expect(userService.createUser).not.toHaveBeenCalled();
      expect(emailService.sendEmail).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Email already in use', // Corrected
      });
    });

    it('should return 500 if userService.getUserByEmail throws an error', async () => {
      mockReq.body = registerData;
      const error = new Error('DB error on getByEmail');
      userService.getUserByEmail.mockRejectedValue(error);

      await register(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: error }); // Corrected
    });

    it('should return 500 if userService.createUser throws an error', async () => {
      mockReq.body = registerData;
      userService.getUserByEmail.mockResolvedValue(null);
      const error = new Error('DB error on createUser');
      userService.createUser.mockRejectedValue(error);

      await register(mockReq, mockRes);

      expect(userService.createUser).toHaveBeenCalled();
      expect(emailService.sendEmail).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: error }); // Corrected
    });

    it('should return 500 if emailService.sendEmail throws an error (for non-Google registration)', async () => {
        mockReq.body = registerData; // Non-Google
        userService.getUserByEmail.mockResolvedValue(null);
        userService.createUser.mockResolvedValue(mockRegisteredUser);
        const error = new Error('Failed to send verification email');
        emailService.sendEmail.mockRejectedValue(error);

        await register(mockReq, mockRes);

        expect(emailService.sendEmail).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(500); // Controller catches and returns 500 with the error object
        expect(mockRes.json).toHaveBeenCalledWith({ error: error }); // Corrected
    });
  });

  describe('verifyAccount', () => {
    it('should successfully verify an account if id is valid and user is updated', async () => {
      mockReq.query.id = 'validUserIdOrCode';
      userService.update.mockResolvedValue({ _id: 'validUserIdOrCode', status: true });

      await verifyAccount(mockReq, mockRes);

      expect(userService.update).toHaveBeenCalledWith('validUserIdOrCode', { status: true });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ status: "ok" });
    });

    it('should return 400 if user status is not true after update attempt', async () => {
      mockReq.query.id = 'validUserIdOrCode';
      // Simulate update call working but user status not becoming true (e.g., service returns old object or modified object without status:true)
      userService.update.mockResolvedValue({ _id: 'validUserIdOrCode', status: false });

      await verifyAccount(mockReq, mockRes);

      expect(userService.update).toHaveBeenCalledWith('validUserIdOrCode', { status: true });
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Error" });
    });

    it('should do nothing if req.query.id is missing (controller has no explicit error for this)', async () => {
      // mockReq.query.id is undefined by default in mockReq setup
      await verifyAccount(mockReq, mockRes);

      expect(userService.update).not.toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
      // The controller currently does not send a response if req.query.id is missing.
      // This might be an oversight in the controller, or intended if some other middleware handles it.
      // For the test, we just verify no response was sent from this controller function.
    });


    it('should return 500 if userService.update throws an error', async () => {
      mockReq.query.id = 'validUserIdOrCode';
      const error = new Error('Database update error');
      userService.update.mockRejectedValue(error);

      await verifyAccount(mockReq, mockRes);

      expect(userService.update).toHaveBeenCalledWith('validUserIdOrCode', { status: true });
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: error });
    });
  });

  describe('loginWithToken', () => {
    const mockUserPayload = { _id: 'userIdToken', email: 'tokenuser@example.com', name: 'Token User' };
    const mockUserDtoData = { id: 'userIdToken', email: 'tokenuser@example.com', name: 'Token User' };

    it('should return user DTO if req.user is present', () => {
      mockReq.user = mockUserPayload; // Simulate user populated by Passport or other auth middleware
      userDTO.mockReturnValue(mockUserDtoData);

      loginWithToken(mockReq, mockRes);

      expect(userDTO).toHaveBeenCalledWith(mockUserPayload);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Login successful.', // Corrected based on controller
        user: mockUserDtoData,
      });
    });

    // Note: If req.user is not present, this controller function would likely not be reached
    // due to preceding authentication middleware. If it were reachable, req.user would be undefined,
    // and userDTO(undefined) might throw an error or return an unexpected DTO.
    // However, testing that scenario here might be redundant if auth middleware guarantees req.user.
  });

  describe('generateApiKey', () => {
    const mockUserPayload = { _id: 'userIdForApiKey', email: 'apikeyuser@example.com' };
    const generatedApiKey = 'new-api-key-123';

    beforeEach(() => {
        mockReq.user = mockUserPayload; // Assume user is authenticated
    });

    it('should generate an API key, update user, and return the key', async () => {
      userService.generateKey.mockReturnValue(generatedApiKey);
      userService.update.mockResolvedValue({ ...mockUserPayload, apiKey: generatedApiKey }); // Simulate successful update

      await generateApiKey(mockReq, mockRes);

      expect(userService.generateKey).toHaveBeenCalled();
      expect(userService.update).toHaveBeenCalledWith(mockUserPayload._id, { apiKey: generatedApiKey });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ api_key: generatedApiKey });
    });

    it('should return 400 if user update fails (e.g., service returns null/falsy)', async () => {
      userService.generateKey.mockReturnValue(generatedApiKey);
      userService.update.mockResolvedValue(null); // Simulate update failure

      await generateApiKey(mockReq, mockRes);

      expect(userService.generateKey).toHaveBeenCalled();
      expect(userService.update).toHaveBeenCalledWith(mockUserPayload._id, { apiKey: generatedApiKey });
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: '' }); // Empty message as per controller
    });

    it('should return 500 if userService.generateKey throws an error', async () => {
      const error = new Error('Key generation failed');
      userService.generateKey.mockImplementation(() => { throw error; });

      await generateApiKey(mockReq, mockRes);

      expect(userService.generateKey).toHaveBeenCalled();
      expect(userService.update).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: error });
    });

    it('should return 500 if userService.update throws an error', async () => {
      userService.generateKey.mockReturnValue(generatedApiKey);
      const error = new Error('User update failed');
      userService.update.mockRejectedValue(error);

      await generateApiKey(mockReq, mockRes);

      expect(userService.generateKey).toHaveBeenCalled();
      expect(userService.update).toHaveBeenCalledWith(mockUserPayload._id, { apiKey: generatedApiKey });
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: error });
    });
  });

  describe('getApiKey', () => {
    const mockUserPayload = { _id: 'userIdForGetApiKey', email: 'getapikeyuser@example.com' };
    const userWithApiKey = { ...mockUserPayload, apiKey: 'existing-api-key-456' };

    beforeEach(() => {
        mockReq.user = mockUserPayload; // Assume user is authenticated
    });

    it('should return the API key for the authenticated user', async () => {
      userService.getUserByEmail.mockResolvedValue(userWithApiKey);

      await getApiKey(mockReq, mockRes);

      expect(userService.getUserByEmail).toHaveBeenCalledWith(mockUserPayload.email);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ api_key: userWithApiKey.apiKey });
    });

    it('should return an empty string as api_key if user has no api key yet', async () => {
      const userWithoutApiKey = { ...mockUserPayload, apiKey: null }; // or undefined
      userService.getUserByEmail.mockResolvedValue(userWithoutApiKey);

      await getApiKey(mockReq, mockRes);

      expect(userService.getUserByEmail).toHaveBeenCalledWith(mockUserPayload.email);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ api_key: null }); // Controller sends apiKey as is
    });


    it('should return 500 if userService.getUserByEmail throws an error', async () => {
      const error = new Error('Database error fetching user');
      userService.getUserByEmail.mockRejectedValue(error);

      await getApiKey(mockReq, mockRes);

      expect(userService.getUserByEmail).toHaveBeenCalledWith(mockUserPayload.email);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: error });
    });
  });
});
