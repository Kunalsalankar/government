// Common labor/MGNREGA job categories
const LABOR_JOBS = [
  { id: 1, title: 'Construction Worker', skillsRequired: ['physical labor', 'construction', 'brick laying', 'concrete work'], salary: '8000-12000' },
  { id: 2, title: 'Road Construction Worker', skillsRequired: ['road work', 'asphalt', 'compaction', 'physical fitness'], salary: '7000-10000' },
  { id: 3, title: 'Mason', skillsRequired: ['masonry', 'brick laying', 'concrete', 'carpentry'], salary: '12000-18000' },
  { id: 4, title: 'Electrician', skillsRequired: ['electrical wiring', 'safety', 'technical knowledge', 'problem solving'], salary: '15000-22000' },
  { id: 5, title: 'Plumber', skillsRequired: ['plumbing', 'pipe fitting', 'water systems', 'maintenance'], salary: '12000-18000' },
  { id: 6, title: 'Carpenter', skillsRequired: ['carpentry', 'woodwork', 'tool usage', 'precision'], salary: '13000-19000' },
  { id: 7, title: 'Supervisor', skillsRequired: ['leadership', 'communication', 'planning', 'team management'], salary: '18000-28000' },
  { id: 8, title: 'Welder', skillsRequired: ['welding', 'metal work', 'safety', 'technical skills'], salary: '14000-20000' },
  { id: 9, title: 'Painter', skillsRequired: ['painting', 'surface preparation', 'color knowledge', 'precision'], salary: '9000-14000' },
  { id: 10, title: 'Surveyor Assistant', skillsRequired: ['measurement', 'technical knowledge', 'attention to detail', 'math'], salary: '11000-16000' },
];

// Training programs for skill development
const TRAINING_PROGRAMS = [
  { id: 1, title: 'Basic Construction Skills', duration: '30 days', skills: ['construction', 'safety', 'tool usage'], difficulty: 'beginner' },
  { id: 2, title: 'Advanced Masonry', duration: '60 days', skills: ['masonry', 'brick laying', 'concrete'], difficulty: 'intermediate' },
  { id: 3, title: 'Electrical Wiring Basics', duration: '45 days', skills: ['electrical wiring', 'safety', 'circuits'], difficulty: 'beginner' },
  { id: 4, title: 'Leadership & Supervision', duration: '30 days', skills: ['leadership', 'communication', 'team management'], difficulty: 'advanced' },
  { id: 5, title: 'Welding Techniques', duration: '60 days', skills: ['welding', 'metal work', 'safety'], difficulty: 'intermediate' },
  { id: 6, title: 'Plumbing Systems', duration: '45 days', skills: ['plumbing', 'pipe fitting', 'maintenance'], difficulty: 'beginner' },
  { id: 7, title: 'Carpentry Essentials', duration: '50 days', skills: ['carpentry', 'woodwork', 'precision'], difficulty: 'intermediate' },
  { id: 8, title: 'Painting & Finishing', duration: '30 days', skills: ['painting', 'surface preparation', 'precision'], difficulty: 'beginner' },
];

/**
 * Calculate skill match percentage
 */
const calculateSkillMatch = (userSkills, jobSkillsRequired) => {
  if (!userSkills || userSkills.length === 0) return 0;
  
  const matchedSkills = userSkills.filter(userSkill =>
    jobSkillsRequired.some(jobSkill =>
      userSkill.toLowerCase() === jobSkill.toLowerCase() ||
      jobSkill.toLowerCase().includes(userSkill.toLowerCase()) ||
      userSkill.toLowerCase().includes(jobSkill.toLowerCase())
    )
  );
  
  return Math.round((matchedSkills.length / jobSkillsRequired.length) * 100);
};

/**
 * Calculate success probability based on skills and experience
 */
const calculateSuccessProbability = (skillMatch, experience) => {
  const skillWeight = skillMatch * 0.6; // 60% weight on skills
  const experienceBonus = Math.min(experience * 5, 40); // 40% weight on experience
  
  return Math.min(Math.round(skillWeight + experienceBonus), 95);
};

/**
 * Get job recommendations based on user skills
 */
export const getJobRecommendations = (userSkills, experience = 0) => {
  const recommendations = LABOR_JOBS.map(job => {
    const skillMatch = calculateSkillMatch(userSkills, job.skillsRequired);
    const successProbability = calculateSuccessProbability(skillMatch, experience);
    
    return {
      ...job,
      skillMatch,
      successProbability,
      matchLevel: successProbability >= 80 ? 'excellent' : successProbability >= 60 ? 'good' : successProbability >= 40 ? 'fair' : 'low'
    };
  });

  // Sort by success probability
  return recommendations.sort((a, b) => b.successProbability - a.successProbability);
};

/**
 * Generate personalized learning path
 */
export const generateLearningPath = (userSkills, targetJobId) => {
  const targetJob = LABOR_JOBS.find(j => j.targetJobId === targetJobId);
  if (!targetJob) return null;

  const skillsToLearn = targetJob.skillsRequired.filter(skill =>
    !userSkills.some(userSkill =>
      userSkill.toLowerCase().includes(skill.toLowerCase())
    )
  );

  const recommendedTrainings = TRAINING_PROGRAMS.filter(program =>
    skillsToLearn.some(skill =>
      program.skills.some(progSkill =>
        progSkill.toLowerCase().includes(skill.toLowerCase())
      )
    )
  );

  return {
    targetJob,
    skillsToLearn,
    recommendedTrainings,
    estimatedDuration: recommendedTrainings.reduce((acc, t) => {
      const days = parseInt(t.duration.split(' ')[0]);
      return acc + days;
    }, 0),
    progressPercentage: calculateSkillMatch(userSkills, targetJob.skillsRequired)
  };
};

/**
 * Get AI-powered skill assessment and recommendations using Gemini API via backend
 */
export const getAISkillAssessment = async (userProfile) => {
  try {
    // Call backend API for AI assessment
    const response = await fetch('http://localhost:5000/api/ai-assessment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userProfile })
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.success && data.assessment) {
      return data.assessment;
    }

    // Fallback to algorithm if AI fails
    console.warn('AI assessment failed, falling back to algorithm');
    return getFallbackAssessment(userProfile);

  } catch (error) {
    console.error('AI Assessment Error:', error);
    // Fallback to algorithm-based assessment
    return getFallbackAssessment(userProfile);
  }
};

/**
 * Fallback assessment using algorithm (if AI fails)
 */
const getFallbackAssessment = (userProfile) => {
  try {
    // Get recommendations using our matching algorithm
    const recommendations = getJobRecommendations(userProfile.skills, parseInt(userProfile.experience) || 0);
    
    // Generate assessment response
    const topRecommendations = recommendations.slice(0, 3);
    
    const response = {
      recommendations: topRecommendations.map(job => ({
        jobTitle: job.title,
        probability: job.successProbability,
        reasoning: `Based on your ${job.skillMatch}% skill match and ${userProfile.experience} years of experience, you have a ${job.successProbability}% success probability for this role.`
      })),
      skillGaps: topRecommendations[0]?.skillsRequired.filter(skill =>
        !userProfile.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
      ) || [],
      trainingNeeded: matchTrainingPrograms(
        topRecommendations[0]?.skillsRequired.filter(skill =>
          !userProfile.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
        ) || []
      ).map(program => ({
        program: program.title,
        duration: program.duration,
        importance: 'high'
      })),
      timeline: `${Math.ceil(matchTrainingPrograms(topRecommendations[0]?.skillsRequired || []).reduce((acc, t) => acc + parseInt(t.duration.split(' ')[0]), 0) / 30)} months`,
      strengths: userProfile.skills,
      nextSteps: [
        `Enroll in ${matchTrainingPrograms(topRecommendations[0]?.skillsRequired || [])[0]?.title || 'a training program'}`,
        `Target ${topRecommendations[0]?.title || 'your preferred job'}`,
        'Complete recommended training within timeline',
        'Apply for job positions in your district'
      ]
    };
    
    return response;
  } catch (error) {
    console.error('Error getting AI assessment:', error);
    return null;
  }
};

/**
 * Get all available jobs
 */
export const getAllJobs = () => LABOR_JOBS;

/**
 * Get all training programs
 */
export const getAllTrainingPrograms = () => TRAINING_PROGRAMS;

/**
 * Match training programs to target skills
 */
export const matchTrainingPrograms = (skillsToLearn) => {
  const matched = TRAINING_PROGRAMS.filter(program =>
    skillsToLearn.some(skill =>
      program.skills.some(progSkill =>
        progSkill.toLowerCase().includes(skill.toLowerCase())
      )
    )
  );

  return matched.sort((a, b) => {
    const durationA = parseInt(a.duration.split(' ')[0]);
    const durationB = parseInt(b.duration.split(' ')[0]);
    return durationA - durationB;
  });
};

/**
 * Calculate career progression path
 */
export const getCareerProgression = (userSkills, experience) => {
  const startingJobs = getJobRecommendations(userSkills, experience).slice(0, 3);
  
  return startingJobs.map(job => ({
    currentRole: job.title,
    nextLevelRole: 'Supervisor',
    requiredSkills: ['leadership', 'communication', 'team management'],
    estimatedTimeToPromotion: '2-3 years',
    salaryProgression: {
      current: job.salary,
      nextLevel: '22000-32000',
      growth: '+30-50%'
    }
  }));
};
