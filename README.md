
# TaskFlow — Interactive Task Dashboard

TaskFlow is a responsive full-stack task management application
built with HTML, CSS, Vanilla JavaScript, Node.js, Express.js,
and SQLite.

## Features

- Create, view, update, and delete tasks
- Persistent task storage using SQLite
- Task status and priority management
- Search and filtering
- Responsive dashboard interface
- REST API with input validation
- Automated CRUD API tests

## Technologies

- Frontend: HTML5, CSS3, Vanilla JavaScript
- Backend: Node.js and Express.js
- Database: SQLite with better-sqlite3
- Communication: REST API using Fetch and async/await

## Project Structure

- client/ — frontend application
- server/src/controllers/ — request handlers
- server/src/database/ — database connection
- server/src/middleware/ — error handling
- server/src/routes/ — API routes
- server/src/services/ — database operations
- server/src/validators/ — input validation
- server/test-api.js — automated API tests

## Setup

### 1. Install dependencies

Open a terminal in the server directory:

    npm install

### 2. Start the backend

    npm run dev

The API runs at http://localhost:3000 by default.

### 3. Open the frontend

Open client/index.html with VS Code Live Server.

### 4. Run automated tests

Keep the backend running and open another terminal in server:

    npm test

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/health | Check API status |
| GET | /api/tasks | Retrieve all tasks |
| GET | /api/tasks/:id | Retrieve one task |
| POST | /api/tasks | Create a task |
| PATCH | /api/tasks/:id | Update a task |
| DELETE | /api/tasks/:id | Delete a task |

## Database

Tasks are stored in the local SQLite database.
Records persist when the browser is refreshed or the server restarts.

## Project Status

The backend CRUD API and automated API tests have been verified.
Frontend and responsive behavior should be verified before final submission.
