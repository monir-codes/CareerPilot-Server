# CareerPilot AI - Backend

<h1 align="center">CareerPilot AI (Server)</h1>

<p align="center">
  <strong>The scalable REST API powering CareerPilot AI.</strong>
</p>

## 🚀 Overview

The CareerPilot AI backend is a highly scalable RESTful API built with **Express.js**, **TypeScript**, and **MongoDB**. It serves as the core engine powering the CareerPilot frontend, handling everything from strict user authentication to direct interactions with the Google Gemini AI models for resume analysis and mock interviews.

### ✨ Core Features

- **Google Gemini Integration**: Secure, robust server-side processing for complex generative AI tasks.
- **Clerk Authentication API**: Middleware verification for JWT tokens seamlessly bridging the frontend sessions.
- **Advanced Data Storage**: A robust NoSQL schema implementation in MongoDB via Mongoose.
- **Career Bookmark Engine**: Endpoints supporting saving, tracking, and retrieving user career paths.
- **AI History Tracking**: Persistent logs of user AI chats, resume scorings, and interview data.
- **Secure by Default**: Configured with CORS, Helmet, rate limiting, and centralized error handling.

## 🛠️ Technology Stack

- **Framework**: [Express.js](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/)
- **Authentication Validation**: [@clerk/clerk-sdk-node](https://clerk.com/docs)
- **Generative AI**: [@google/generative-ai](https://ai.google.dev/)
- **File Parsing**: `multer` & `pdf-parse` for advanced Resume PDF scanning

## 📦 Getting Started

### Prerequisites

- **Node.js** (v18.17 or higher)
- **MongoDB Database URL** (e.g., MongoDB Atlas cluster)
- **Clerk Backend Secret Keys**
- **Google Gemini API Key**

### Installation

1. **Navigate to the backend folder:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root of the backend directory. Follow the `.env.example` structure if available:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/careerpilot?retryWrites=true&w=majority
   CLERK_SECRET_KEY=your_clerk_secret_key
   GEMINI_API_KEY=your_google_gemini_api_key
   FRONTEND_URL=http://localhost:3000
   ```

4. **Seed the database (Optional):**
   To populate the Explore page with stunning predefined career paths, run the seeder:
   ```bash
   npx ts-node seedCareers.ts
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

The server will typically start on `http://localhost:5000`.

## 📁 Project Structure

```
src/
├── config/               # Environment variables and DB connection logic
├── controllers/          # Business logic for handling requests and responses
├── middlewares/          # Custom middlewares (Auth, Security, Error Handler)
├── models/               # Mongoose schemas (User, Bookmark, AIChatSession)
├── routes/               # Express route definitions
├── services/             # Abstractions for complex operations (AI SDK calls)
└── utils/                # Helper functions, logger, response formatter
```

## 🔐 Security Guidelines

- Never expose your `.env` file or commit it to version control.
- Ensure CORS constraints are strict in production to prevent unauthorized domains from accessing the API.

## 📝 License

This project is licensed under the MIT License.
