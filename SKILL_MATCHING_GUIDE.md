# 🚀 AI Skill Matching Engine - Implementation Guide

## Overview
The AI Skill Matching Engine is a personalized job recommendation system that analyzes user skills and provides intelligent job recommendations, learning paths, and career progression guidance for labor and MGNREGA workers.

## Folder Structure

```
src/
├── services/
│   └── skillMatchingService.js          # Core matching logic & AI integration
├── components/
│   ├── SkillMatchingDashboard.js        # Main dashboard component
│   ├── SkillAssessment.js               # User skill assessment form
│   └── JobRecommendations.js            # Display recommendations & learning paths
├── context/
│   └── SkillContext.js                  # Global state management for skills
└── App.js                               # Updated with skill matching route
```

## Components Description

### 1. **skillMatchingService.js** (services/)
Core business logic for skill matching and AI recommendations.

**Key Functions:**
- `getJobRecommendations(userSkills, experience)` - Returns ranked job recommendations with match scores
- `generateLearningPath(userSkills, targetJobId)` - Creates personalized learning path
- `getAISkillAssessment(userProfile)` - Uses Gemini API for intelligent assessment
- `getCareerProgression(userSkills, experience)` - Shows career advancement paths

**Features:**
- Skill matching algorithm (0-100%)
- Success probability calculation
- Career progression tracking
- Training program matching

### 2. **SkillAssessment.js** (components/)
User-facing form for skill assessment.

**Inputs:**
- Full name, age, education, experience, district
- Available skills (checkboxes for 14+ labor skills)

**Features:**
- Form validation
- AI-powered assessment via Gemini API
- Loading states & error handling
- Success feedback

### 3. **JobRecommendations.js** (components/)
Displays job recommendations and learning paths.

**Shows:**
- Top 3 job recommendations with match scores
- Skill match percentage & success probability
- Required skills with visual indicators
- Personalized learning paths
- Training program recommendations
- Career progression timeline

**Interactive Features:**
- View learning path for each job
- Apply now buttons
- Salary progression tracking

### 4. **SkillMatchingDashboard.js** (components/)
Main dashboard component combining all features.

**Tabs:**
1. 🎯 Skill Assessment - Form for user to input skills
2. 💼 Job Recommendations - View job matches & paths
3. 📊 Your Profile - View assessment results & profile info

**Features:**
- Tab-based navigation
- Context integration
- Start over functionality

### 5. **SkillContext.js** (context/)
Global state management for skill matching data.

**State:**
- `userProfile` - User information
- `jobRecommendations` - Ranked job suggestions
- `learningPaths` - Personalized training paths
- `assessmentResult` - AI assessment output

**Functions:**
- `updateUserProfile()`
- `updateRecommendations()`
- `updateLearningPaths()`
- `updateAssessmentResult()`
- `clearAssessment()`

## How to Use

### For Users:
1. Navigate to `/skill-matching` route
2. Fill out skill assessment form
3. Review AI-powered recommendations
4. Click "View Learning Path" for specific jobs
5. See personalized training programs
6. Track career progression

### For Developers:

**Import and use the service:**
```javascript
import { getJobRecommendations, generateLearningPath } from './services/skillMatchingService';

// Get recommendations
const recommendations = getJobRecommendations(['construction', 'carpentry'], 2);

// Get learning path
const path = generateLearningPath(['construction'], 1);
```

**Use context in components:**
```javascript
import { useSkillContext } from '../context/SkillContext';

const MyComponent = () => {
  const { userProfile, jobRecommendations, updateRecommendations } = useSkillContext();
  // Use context values
};
```

## Labor/MGNREGA Integration

### Supported Jobs:
1. Construction Worker (₹8000-12000/month)
2. Road Construction Worker (₹7000-10000/month)
3. Mason (₹12000-18000/month)
4. Electrician (₹15000-22000/month)
5. Plumber (₹12000-18000/month)
6. Carpenter (₹13000-19000/month)
7. Supervisor (₹18000-28000/month)
8. Welder (₹14000-20000/month)
9. Painter (₹9000-14000/month)
10. Surveyor Assistant (₹11000-16000/month)

### Supported Skills:
- construction
- brick laying
- concrete work
- electrical wiring
- plumbing
- carpentry
- welding
- painting
- masonry
- leadership
- communication
- physical fitness
- problem solving
- attention to detail

### Training Programs:
- Basic Construction Skills (30 days)
- Advanced Masonry (60 days)
- Electrical Wiring Basics (45 days)
- Leadership & Supervision (30 days)
- Welding Techniques (60 days)
- Plumbing Systems (45 days)
- Carpentry Essentials (50 days)
- Painting & Finishing (30 days)

## Algorithm Details

### Skill Matching Score:
```
Match % = (Matched Skills / Required Skills) × 100
```

### Success Probability:
```
Success % = (Skill Match × 0.6) + (Experience × 0.05 × 100 capped at 0.4)
Min: 0%, Max: 95%
```

### Career Level Classification:
- **Excellent**: 80-95% probability
- **Good**: 60-79% probability
- **Fair**: 40-59% probability
- **Low**: Below 40% probability

## AI Integration (Gemini API)

The system integrates with Gemini API for intelligent assessment:
- Analyzes user profile holistically
- Provides contextual recommendations
- Identifies skill gaps
- Creates personalized advice
- Outputs structured JSON with recommendations

## Features for Hackathon

✅ **Unique Selling Points:**
1. **AI-Powered** - Uses Gemini API for intelligent matching
2. **Personalized** - Custom learning paths per user
3. **Labor-Specific** - Designed for MGNREGA workers
4. **Career Progression** - Shows advancement opportunities
5. **Success Probability** - Data-driven job matching
6. **Mobile-Friendly** - Responsive Material-UI design
7. **Accessible** - Works with text-to-speech features

## Future Enhancements

- [ ] Real-time job market data integration
- [ ] Video-based skill verification
- [ ] WhatsApp/SMS notifications
- [ ] Offline mode support
- [ ] Skill certification tracking
- [ ] Government impact analytics
- [ ] Mock interview feature
- [ ] Resume generation & ATS optimization

## Dependencies

- React 18+
- Material-UI (@mui/material)
- Gemini API (for AI assessment)
- Context API (for state management)

## Testing

Test the feature:
1. Go to `/skill-matching`
2. Fill form with sample data
3. Select skills from checkboxes
4. Submit and view recommendations
5. Check learning paths
6. View career progression

## Support

For issues or improvements, refer to:
- [skillMatchingService.js](../services/skillMatchingService.js)
- [SkillAssessment.js](../components/SkillAssessment.js)
- [SkillContext.js](../context/SkillContext.js)
