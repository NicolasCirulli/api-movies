import { jest } from '@jest/globals';
import verifyApiKey from '../../../middleware/verifyApiKey.js'; // Adjusted path
import userService from '../../../services/userService.js'; // Adjusted path

jest.mock('../../../services/userService.js');

describe('verifyApiKey Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {},
      query: {}, // Though not used by this middleware, good to have for completeness
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(), // Though send is used, good to have common mocks
      send: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call next() if API key is valid and user is found', async () => {
    const apiKey = 'valid-api-key';
    mockReq.headers['x-api-key'] = apiKey;
    const mockUser = { _id: 'userId1', apiKey: apiKey, name: 'API User' };
    userService.getUser.mockResolvedValue(mockUser);

    await verifyApiKey(mockReq, mockRes, mockNext);

    expect(userService.getUser).toHaveBeenCalledWith({ apiKey: apiKey });
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.send).not.toHaveBeenCalled();
    expect(mockReq.user).toBeUndefined(); // Middleware does not attach user to req
  });

  it('should return 401 "Unauthorized" if API key is invalid (user not found)', async () => {
    const apiKey = 'invalid-api-key';
    mockReq.headers['x-api-key'] = apiKey;
    userService.getUser.mockResolvedValue(null); // No user found for this key

    await verifyApiKey(mockReq, mockRes, mockNext);

    expect(userService.getUser).toHaveBeenCalledWith({ apiKey: apiKey });
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.send).toHaveBeenCalledWith('Unauthorized');
  });

  it('should return 401 "Unauthorized" if API key is missing from headers', async () => {
    // No 'x-api-key' in mockReq.headers
    // userService.getUser might be called with { apiKey: undefined } by the middleware
    // If getUser( {apiKey:undefined} ) is expected to return null:
    userService.getUser.mockResolvedValue(null);


    await verifyApiKey(mockReq, mockRes, mockNext);

    // Depending on how robust userService.getUser is, it might be called with undefined.
    // Or, if the middleware had a check for apiKey presence *before* calling service:
    // expect(userService.getUser).not.toHaveBeenCalled();
    // Based on current middleware code, it WILL call userService.getUser({apiKey: undefined})
    expect(userService.getUser).toHaveBeenCalledWith({ apiKey: undefined });

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.send).toHaveBeenCalledWith('Unauthorized');
  });

  // No user status check is performed by this middleware based on its code.
  // So, a test for "user found but not active" is not applicable here.

  it('should return 500 "Internal Server Error" if userService.getUser throws an error', async () => {
    const apiKey = 'valid-key-but-service-fails';
    mockReq.headers['x-api-key'] = apiKey;
    const error = new Error('Database connection error');
    userService.getUser.mockRejectedValue(error);

    await verifyApiKey(mockReq, mockRes, mockNext);

    expect(userService.getUser).toHaveBeenCalledWith({ apiKey: apiKey });
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith('Internal Server Error');
  });
});
