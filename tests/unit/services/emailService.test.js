import { jest } from '@jest/globals';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import emailService from '../../../services/emailService.js'; // Adjusted path

// Mock nodemailer
const mockSendMail = jest.fn();
const mockCreateTransport = jest.fn().mockReturnValue({
  sendMail: mockSendMail,
});
nodemailer.createTransport = mockCreateTransport;

// Mock google.auth.OAuth2
const mockGetAccessToken = jest.fn().mockResolvedValue({ token: 'mock-access-token' });
google.auth.OAuth2 = jest.fn().mockImplementation(() => {
  return {
    setCredentials: jest.fn(),
    getAccessToken: mockGetAccessToken,
  };
});

// Set dummy environment variables for testing
process.env.CLIENT_ID = 'test-client-id';
process.env.CLIENT_SECRET = 'test-client-secret';
process.env.REFRESH_TOKEN = 'test-refresh-token';
process.env.USER_EMAIL = 'test-user-email@example.com';
process.env.URL_BASE = 'http://localhost:3000'; // For verification link

describe('EmailService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendEmail', () => {
    const testEmail = 'recipient@example.com';
    const testCode = 'verificationCode123';

    it('should create a transport and send an email with correct parameters', async () => {
      mockSendMail.mockResolvedValueOnce({ messageId: 'test-message-id' });

      await emailService.sendEmail(testEmail, testCode);

      expect(google.auth.OAuth2).toHaveBeenCalledWith(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        expect.any(String) // redirect_uri can be flexible or checked if static
      );

      // Check calls on the mocked OAuth2 client instance
      // google.auth.OAuth2 is the mock constructor
      // google.auth.OAuth2.mock.instances[0] is the first instance created by this constructor
      expect(google.auth.OAuth2.mock.instances.length).toBe(1);
      const oauth2ClientInstance = google.auth.OAuth2.mock.instances[0];
      expect(oauth2ClientInstance.setCredentials).toHaveBeenCalledWith({
        refresh_token: process.env.REFRESH_TOKEN,
      });
      expect(oauth2ClientInstance.getAccessToken).toHaveBeenCalled(); // getAccessToken is a method of the instance

      expect(mockCreateTransport).toHaveBeenCalledWith({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.USER_EMAIL,
          clientId: process.env.CLIENT_ID,
          clientSecret: process.env.CLIENT_SECRET,
          refreshToken: process.env.REFRESH_TOKEN,
          accessToken: 'mock-access-token',
        },
      });

      expect(mockSendMail).toHaveBeenCalledWith({
        from: `"Verify Account" <${process.env.USER_EMAIL}>`,
        to: testEmail,
        subject: 'Verify Account ✔',
        html: expect.stringContaining(`href="${process.env.URL_BASE}/auth/verify/${testCode}"`),
      });
    });

    it('should log an error if sendMail fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const errorMessage = 'Failed to send email';
      mockSendMail.mockRejectedValueOnce(new Error(errorMessage));

      // The service function catches the error and logs it, doesn't rethrow.
      await emailService.sendEmail(testEmail, testCode);

      expect(mockSendMail).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error)); // or specific error

      consoleErrorSpy.mockRestore();
    });

    it('should log an error if getAccessToken fails', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const errorMessage = 'Failed to get access token';
        mockGetAccessToken.mockRejectedValueOnce(new Error(errorMessage));

        await emailService.sendEmail(testEmail, testCode);

        expect(google.auth.OAuth2.mock.instances.length).toBe(1);
        const oauth2ClientInstance = google.auth.OAuth2.mock.instances[0];
        expect(oauth2ClientInstance.getAccessToken).toHaveBeenCalled();
        // createTransport should not be called if getAccessToken fails
        expect(mockCreateTransport).not.toHaveBeenCalled();
        expect(mockSendMail).not.toHaveBeenCalled();
        expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error)); // Or new Error(errorMessage)

        consoleErrorSpy.mockRestore();
    });
  });
});
