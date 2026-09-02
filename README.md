# Syntecxhub Chat Application

## Overview
This is a real-time chat application built for the Syntecxhub internship (Task 4 — Project 3). It features a modern, responsive user interface with real-time messaging, chat rooms, online/offline presence tracking, typing indicators, and persistent chat history.

## Features
- **User authentication** (Registration, Login, Protected Routes)
- **JWT authentication** with bcrypt password hashing
- **Chat rooms** (Create, view, join, leave, and delete rooms)
- **Real-time messaging** powered by Socket.io
- **MongoDB chat history** for persistent messaging across sessions
- **Online/offline presence** to see who is currently active in the room
- **Typing indicators** to see when others are drafting a message
- **Responsive interface** that adapts beautifully to both desktop and mobile devices

## Screenshots
*(Add your project screenshots here)*

<details>
<summary>Click to view screenshots</summary>

### 1. Registration / Login
![Login Screen](placeholder-link-to-login-image)

### 2. Chat Interface (Desktop)
![Chat Interface](placeholder-link-to-chat-image)

### 3. Real-Time Messaging & Typing Indicator
![Typing Indicator](placeholder-link-to-typing-image)

### 4. Mobile View
![Mobile View](placeholder-link-to-mobile-image)

</details>

## Tech Stack
**Frontend:**
- React
- Vite
- Axios
- Socket.io-client
- Tailwind CSS

**Backend:**
- Node.js
- Express
- Socket.io
- Mongoose

**Database:**
- MongoDB Atlas

**Authentication:**
- JWT (JSON Web Tokens)
- bcryptjs

## Project Structure
```
Syntecxhub_Chat_Application/
├── client/              # React + Vite frontend application
│   ├── src/
│   │   ├── components/  # Reusable UI components (RoomList, MessageInput, etc.)
│   │   ├── context/     # React Context for global state (AuthContext)
│   │   ├── hooks/       # Custom React hooks (useSocket)
│   │   ├── pages/       # Page components (Login, Register, Chat)
│   │   └── services/    # API and Socket.io clients
├── server/              # Node.js + Express backend application
│   ├── config/          # Database configuration
│   ├── controllers/     # Route handlers for auth, rooms, messages
│   ├── middleware/      # Auth middleware for protected routes
│   ├── models/          # Mongoose schemas (User, Room, Message)
│   ├── routes/          # Express API routes
│   └── socket/          # Socket.io event handlers (presence, typing, messaging)
└── README.md
```

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/Gurusaiprasadreddy/Syntecxhub_Chat_Application.git
cd Syntecxhub_Chat_Application
```

### 2. Server Installation
```bash
cd server
npm install
```

### 3. Client Installation
```bash
cd ../client
npm install
```

## Environment Variables
*Note: Never commit your actual `.env` files to version control.*

Create a `.env` file in the **server** directory with the following variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

Create a `.env` file in the **client** directory with the following variables:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Run Locally

Open two separate terminals to run the frontend and backend concurrently.

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health

## How Chat Works
```
User
  ↓
JWT Authentication
  ↓
React Frontend
  ↓
Socket.io (Real-time events)
  ↓
Express/Node Backend
  ↓
MongoDB Atlas
  ↓
Chat History Persistence
```
Socket.io handles the fast, bidirectional real-time communication (messages, typing indicators, presence), while MongoDB safely stores the users, rooms, and message history so it can be retrieved across sessions.

## Testing
To test the application:
- **Authentication:** Register a new user, login, and verify access to the `/chat` route.
- **Two-user messaging:** Open the application in two different browsers (or an Incognito window). Log in as two different users, join the same room, and send messages back and forth.
- **Persistence test:** Refresh the page to verify that message history is successfully loaded from MongoDB.
- **Typing test:** Begin typing in one window and observe the animated typing indicator in the other.
- **Online/offline test:** Close one of the windows and observe the user's presence indicator change from green (online) to gray (offline).
- **Room isolation:** Join different rooms in different windows and verify that messages/typing events in Room A are not broadcast to Room B.

## Deployment

**Project:** Syntecxhub Chat Application
**Repository:** [Syntecxhub_Chat_Application](https://github.com/Gurusaiprasadreddy/Syntecxhub_Chat_Application)

- **Frontend URL:** `<DEPLOYED_FRONTEND_URL>`
- **Backend URL:** `<DEPLOYED_BACKEND_URL>`
- **Health Check:** `<DEPLOYED_BACKEND_URL>/api/health`
- **GitHub:** [https://github.com/Gurusaiprasadreddy/Syntecxhub_Chat_Application](https://github.com/Gurusaiprasadreddy/Syntecxhub_Chat_Application)
