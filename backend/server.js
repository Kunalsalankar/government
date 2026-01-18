const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Labor jobs reference data
const LABOR_JOBS = [
  { id: 1, title: 'Construction Worker', skills: ['physical labor', 'construction', 'brick laying', 'concrete work'], salary: '8000-12000' },
  { id: 2, title: 'Road Construction Worker', skills: ['road work', 'asphalt', 'compaction', 'physical fitness'], salary: '7000-10000' },
  { id: 3, title: 'Mason', skills: ['masonry', 'brick laying', 'concrete', 'carpentry'], salary: '12000-18000' },
  { id: 4, title: 'Electrician', skills: ['electrical wiring', 'safety', 'technical knowledge', 'problem solving'], salary: '15000-22000' },
  { id: 5, title: 'Plumber', skills: ['plumbing', 'pipe fitting', 'water systems', 'maintenance'], salary: '12000-18000' },
  { id: 6, title: 'Carpenter', skills: ['carpentry', 'woodwork', 'tool usage', 'precision'], salary: '13000-19000' },
  { id: 7, title: 'Supervisor', skills: ['leadership', 'communication', 'planning', 'team management'], salary: '18000-28000' },
  { id: 8, title: 'Welder', skills: ['welding', 'metal work', 'safety', 'technical skills'], salary: '14000-20000' },
  { id: 9, title: 'Painter', skills: ['painting', 'surface preparation', 'color knowledge', 'precision'], salary: '9000-14000' },
  { id: 10, title: 'Surveyor Assistant', skills: ['measurement', 'technical knowledge', 'attention to detail', 'math'], salary: '11000-16000' },
];

/**
 * AI Skill Assessment Endpoint
 * Analyzes user skills and provides personalized recommendations using Gemini AI
 */
app.post('/api/ai-assessment', async (req, res) => {
  try {
    const { userProfile } = req.body;

    if (!userProfile || !userProfile.skills || userProfile.skills.length === 0) {
      return res.status(400).json({ error: 'User profile with skills is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    // Prepare context for AI
    const jobsContext = LABOR_JOBS.map(job => 
      `${job.title}: requires ${job.skills.join(', ')} (Salary: ₹${job.salary}/month)`
    ).join('\n');

    const prompt = `You are an expert career counselor specializing in labor and MGNREGA job matching.

AVAILABLE JOBS:
${jobsContext}

USER PROFILE:
Name: ${userProfile.name || 'Anonymous'}
Age: ${userProfile.age || 'Not specified'}
Education: ${userProfile.education || 'Not specified'}
Years of Experience: ${userProfile.experience || 0}
District: ${userProfile.district || 'Not specified'}
Current Skills: ${userProfile.skills.join(', ')}

Please provide a DETAILED and PERSONALIZED assessment in JSON format with the following structure:
{
  "aiAssessment": "A paragraph-long personalized analysis of the user's skills and career potential",
  "topThreeJobs": [
    {
      "jobTitle": "Job Title",
      "matchPercentage": number (0-100),
      "whyGoodFit": "1-2 sentence explanation of why this is a good match",
      "salaryExpectation": "₹XXXX-YYYY per month",
      "strengthsForThisRole": ["strength1", "strength2"],
      "areasToImprove": ["area1", "area2"]
    },
    ...3 jobs total
  ],
  "careerAdvice": "Personalized career advice for the next 2-3 years based on their skills and experience",
  "recommendedLearningPath": ["skill to learn 1", "skill to learn 2", "skill to learn 3"],
  "estimatedTimeToMastery": "X months",
  "motivationalMessage": "An encouraging message about their potential and career prospects"
}

Provide ONLY valid JSON, no additional text.`;

    // Call Gemini API - using gemini-2.5-flash (latest available model)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse AI response
    let aiResponse;
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      aiResponse = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      return res.status(500).json({ 
        error: 'Failed to parse AI response',
        details: responseText.substring(0, 200)
      });
    }

    res.json({
      success: true,
      assessment: aiResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI Assessment Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate AI assessment',
      details: error.message 
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'AI Skill Matching Backend is running',
    timestamp: new Date().toISOString()
  });
});

/**
 * Server error handling
 */
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI Skill Matching Backend running on http://localhost:${PORT}`);
  console.log(`📝 API endpoint: http://localhost:${PORT}/api/ai-assessment`);
  console.log(`✅ Gemini API configured: ${process.env.GEMINI_API_KEY ? 'Yes' : 'No'}`);
});
