# AI Skill Matching Backend

This is the backend server for the AI Skill Matching Engine. It handles Gemini API calls to avoid CORS issues and provides personalized skill assessments.

## Setup Instructions

### 1. Get your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Create .env file

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your Gemini API key
# GEMINI_API_KEY=your_actual_api_key_here
```

### 4. Run the Backend Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start at `http://localhost:5000`

## API Endpoints

### POST `/api/ai-assessment`

Analyzes user skills and provides personalized AI recommendations.

**Request Body:**
```json
{
  "userProfile": {
    "name": "Kunal",
    "age": 25,
    "education": "12th pass",
    "experience": 2,
    "district": "Wardha",
    "skills": ["electrical wiring", "safety"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "assessment": {
    "aiAssessment": "Personalized analysis...",
    "topThreeJobs": [
      {
        "jobTitle": "Electrician",
        "matchPercentage": 75,
        "whyGoodFit": "Strong electrical background...",
        "salaryExpectation": "₹15000-22000 per month",
        "strengthsForThisRole": ["electrical wiring", "safety"],
        "areasToImprove": ["technical knowledge", "problem solving"]
      }
    ],
    "careerAdvice": "Focus on improving technical skills...",
    "recommendedLearningPath": ["technical knowledge", "problem solving", "leadership"],
    "estimatedTimeToMastery": "3-4 months",
    "motivationalMessage": "You have great potential..."
  },
  "timestamp": "2024-01-18T10:30:00.000Z"
}
```

### GET `/api/health`

Health check endpoint to verify server is running.

**Response:**
```json
{
  "status": "OK",
  "message": "AI Skill Matching Backend is running",
  "timestamp": "2024-01-18T10:30:00.000Z"
}
```

## Troubleshooting

### "GEMINI_API_KEY not configured"
- Make sure you created `.env` file in the `backend` folder
- Verify the API key is correctly copied from Google AI Studio

### "Backend API error"
- Check if backend server is running at `http://localhost:5000`
- Verify CORS is properly configured
- Check browser console for detailed error messages

### Connection refused
- Make sure both frontend (port 3000) and backend (port 5000) are running
- Use `npm run dev` for frontend in project root
- Use `npm start` in the backend folder for backend

## Architecture

```
Frontend (React) → Backend Server (Express) → Gemini API
     :3000                :5000              Google Cloud
```

This architecture avoids CORS issues and keeps your API key secure on the server.

## Features

✅ Real AI-powered skill assessment using Google Gemini
✅ Personalized job recommendations
✅ Career development advice
✅ Learning path suggestions
✅ Salary expectations
✅ Fallback to algorithm if AI fails
✅ CORS-safe API proxy

## Environment Variables

- `GEMINI_API_KEY` - Your Google Gemini API key (required)
- `PORT` - Server port (default: 5000)
