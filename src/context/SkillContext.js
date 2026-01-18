import React, { createContext, useState, useContext } from 'react';

const SkillContext = createContext();

export const SkillProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [jobRecommendations, setJobRecommendations] = useState([]);
  const [learningPaths, setLearningPaths] = useState([]);
  const [assessmentResult, setAssessmentResult] = useState(null);

  const updateUserProfile = (profile) => {
    setUserProfile(profile);
  };

  const updateRecommendations = (recommendations) => {
    setJobRecommendations(recommendations);
  };

  const updateLearningPaths = (paths) => {
    setLearningPaths(paths);
  };

  const updateAssessmentResult = (result) => {
    setAssessmentResult(result);
  };

  const clearAssessment = () => {
    setUserProfile(null);
    setJobRecommendations([]);
    setLearningPaths([]);
    setAssessmentResult(null);
  };

  const value = {
    userProfile,
    jobRecommendations,
    learningPaths,
    assessmentResult,
    updateUserProfile,
    updateRecommendations,
    updateLearningPaths,
    updateAssessmentResult,
    clearAssessment,
  };

  return (
    <SkillContext.Provider value={value}>
      {children}
    </SkillContext.Provider>
  );
};

export const useSkillContext = () => {
  const context = useContext(SkillContext);
  if (!context) {
    throw new Error('useSkillContext must be used within SkillProvider');
  }
  return context;
};
