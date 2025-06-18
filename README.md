# Movie API

A Node.js application for managing movies. This API allows users to register, log in, browse movies, and comment on them.

## API Endpoints

### Authentication

*   **POST /auth/register**
    *   Description: Registers a new user.
    *   Request Body: `email`, `password`, `name`
    *   Response: Success message or error.
*   **POST /auth/login**
    *   Description: Logs in an existing user.
    *   Request Body: `email`, `password`
    *   Response: JWT token or error.
*   **POST /auth/login/token**
    *   Description: Logs in a user with a JWT token.
    *   Headers: `Authorization: Bearer <token>`
    *   Response: User information or error.
*   **GET /auth/verify**
    *   Description: Verifies a user's account.
    *   Query Parameters: `token`
    *   Response: Success message or error.
*   **POST /auth/apikey**
    *   Description: Generates an API key for the authenticated user.
    *   Headers: `Authorization: Bearer <token>`
    *   Response: API key or error.
*   **GET /auth/apikey**
    *   Description: Retrieves the API key for the authenticated user.
    *   Headers: `Authorization: Bearer <token>`
    *   Response: API key or error.

### Movies

*   **GET /movies**
    *   Description: Retrieves a list of all movies.
    *   Headers: `X-API-Key: <apikey>`
    *   Response: Array of movie objects or error.
*   **GET /movies/:id**
    *   Description: Retrieves a specific movie by ID.
    *   Headers: `X-API-Key: <apikey>`
    *   Response: Movie object or error.
*   **POST /movies**
    *   Description: Creates a new movie.
    *   Headers: `Authorization: Bearer <token>`
    *   Request Body: `title`, `director`, `year`, etc. (refer to `movieValidator.js`)
    *   Response: Created movie object or error.
*   **POST /movies/allmovies**
    *   Description: Loads all movies from the data file.
    *   Headers: `Authorization: Bearer <token>`
    *   Response: Success message or error.

### Comments

*   **POST /movies/comment/:id**
    *   Description: Adds a comment to a movie.
    *   Headers: `X-API-Key: <apikey>`
    *   Request Body: `text`
    *   Response: Created comment object or error.
*   **DELETE /movies/comment/:id**
    *   Description: Deletes a comment.
    *   Headers: `X-API-Key: <apikey>`
    *   Response: Success message or error.

## Setup and Running the Project

### Prerequisites

*   Node.js (v14 or higher recommended)
*   npm (comes with Node.js)
*   MongoDB (ensure you have a running instance or a connection string to a cloud-hosted MongoDB)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the root of the project and add the following environment variables:
    ```env
    PORT=3000 # Or any port you prefer
    MONGO_URI=<your_mongodb_connection_string>
    JWT_SECRET=<your_jwt_secret_key>
    EMAIL_USER=<your_email_address_for_sending_verification_emails>
    EMAIL_PASS=<your_email_password_or_app_password>
    ```
    *Replace placeholders with your actual configuration.*

### Running the Application

*   **Development mode (with hot-reloading):**
    ```bash
    npm run dev
    ```
*   **Production mode:**
    ```bash
    npm start
    ```

The API will be accessible at `http://localhost:<PORT>`.

## Project Structure

```
.
├── config/           # Configuration files (e.g., database connection)
├── controllers/      # Request handlers and business logic
├── data/             # Static data files (e.g., initial movie list)
├── DTO/              # Data Transfer Objects
├── images/           # Movie poster images
├── mappers/          # Data mappers
├── middleware/       # Express middleware (e.g., authentication, validation)
├── models/           # Database schemas and models
├── routes/           # API route definitions
├── services/         # Services (e.g., email service)
├── .env              # Environment variables (create this file based on .env.example or instructions)
├── .gitignore        # Specifies intentionally untracked files that Git should ignore
├── package.json      # Project metadata and dependencies
├── package-lock.json # Records exact versions of dependencies
├── server.js         # Main entry point of the application
└── README.md         # This file
```

### Key Directories

*   **`config/`**: Contains configuration files, such as database connection settings (`db.js`).
*   **`controllers/`**: Houses the controllers that handle incoming requests, interact with services and models, and send responses.
*   **`data/`**: May contain initial or sample data for the application.
*   **`DTO/`**: Data Transfer Objects are used to shape data for responses or internal use.
*   **`middleware/`**: Custom middleware functions for Express, such as authentication (`verifyToken.js`, `verifyApiKey.js`) and input validation (`validator/`).
*   **`models/`**: Defines Mongoose schemas and models for interacting with the MongoDB database.
*   **`routes/`**: Contains the Express router definitions, mapping API endpoints to controller functions.
*   **`services/`**: Includes services that encapsulate specific business logic or interact with external APIs (e.g., `emailService.js`).
*   **`server.js`**: The main entry point that sets up the Express application, connects to the database, and starts the server.

## Contributing

Contributions are welcome! If you'd like to contribute to this project, please follow these general guidelines:

1.  **Fork the repository.**
2.  **Create a new branch** for your feature or bug fix:
    ```bash
    git checkout -b feature/your-feature-name
    ```
    or
    ```bash
    git checkout -b fix/your-bug-fix-name
    ```
3.  **Make your changes.**
4.  **Ensure your code follows the existing style and conventions.**
5.  **Test your changes thoroughly.**
6.  **Commit your changes** with a clear and descriptive commit message:
    ```bash
    git commit -m "feat: Implement X feature" -m "Detailed description of changes."
    ```
    (See [Conventional Commits](https://www.conventionalcommits.org/) for more on commit message formatting).
7.  **Push your branch** to your forked repository:
    ```bash
    git push origin feature/your-feature-name
    ```
8.  **Open a Pull Request (PR)** to the `main` branch of the original repository.
9.  **Clearly describe your changes** in the PR description.

### Reporting Bugs

If you find a bug, please open an issue in the GitHub repository. Include the following information:

*   A clear and descriptive title.
*   Steps to reproduce the bug.
*   What you expected to happen.
*   What actually happened.
*   Your environment (e.g., Node.js version, OS).

### Feature Requests

If you have an idea for a new feature, feel free to open an issue to discuss it. Provide a clear description of the proposed feature and why it would be beneficial.
