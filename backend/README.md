# Marketing Assistant Backend

This is the Node.js backend for the AI Marketing Assistant.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env`:
   - `PORT`: Server port (default: 3000)
   - `OPENAI_API_KEY`: Your OpenAI API key (optional, will use mock if missing)
   - `MONGODB_URI`: Your MongoDB connection string

3. Run in development mode:
   ```bash
   npm run dev
   ```

4. Build and start:
   ```bash
   npm run build
   npm start
   ```

## Endpoints

- `GET /health`: Health check
- `POST /api/generate-content`: Generates AI content for social media posts.
