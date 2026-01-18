import React, { useState } from 'react';
import {
  Container,
  Paper,
  Tabs,
  Tab,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import SkillAssessment from './SkillAssessment';
import JobRecommendations from './JobRecommendations';
import { useSkillContext } from '../context/SkillContext';
import { useLanguage } from '../context/LanguageContext';

const SkillMatchingDashboard = () => {
  const { language = 'en' } = useLanguage();
  const currentLanguage = language === 'hindi' ? 'hindi' : 'en';
  
  const tabLabels = {
    en: ['🎯 Skill Assessment', '💼 Job Recommendations', '📊 Your Profile'],
    hindi: ['🎯 कौशल मूल्यांकन', '💼 नौकरी की सिफारिशें', '📊 आपकी प्रोफाइल']
  };

  const [activeTab, setActiveTab] = useState(0);
  const {
    userProfile,
    jobRecommendations,
    assessmentResult,
    updateAssessmentResult,
    clearAssessment,
  } = useSkillContext();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAssessmentComplete = (assessment) => {
    updateAssessmentResult(assessment);
    setActiveTab(1); // Switch to results tab
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ mb: 1 }}>
          🚀 {currentLanguage === 'hindi' ? 'कृत्रिम बुद्धिमत्ता कौशल मिलान इंजन' : 'AI Skill Matching Engine'}
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          {currentLanguage === 'hindi' 
            ? 'बेहतर नौकरी के अवसरों और कैरियर विकास के लिए आपका व्यक्तिगत पथ'
            : 'Your personalized path to better job opportunities and career growth'
          }
        </Typography>

        <Paper elevation={3}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label={tabLabels[currentLanguage][0]} />
            <Tab label={tabLabels[currentLanguage][1]} disabled={!assessmentResult} />
            <Tab label={tabLabels[currentLanguage][2]} />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {/* Tab 1: Skill Assessment */}
            {activeTab === 0 && (
              <Box>
                <SkillAssessment onAssessmentComplete={handleAssessmentComplete} />
              </Box>
            )}

            {/* Tab 2: Job Recommendations */}
            {activeTab === 1 && jobRecommendations.length > 0 && (
              <JobRecommendations
                jobs={jobRecommendations}
                userSkills={userProfile?.skills || []}
                userExperience={userProfile?.experience || 0}
              />
            )}

            {/* Tab 3: User Profile */}
            {activeTab === 2 && userProfile && (
              <Box>
                <Typography variant="h5" gutterBottom>
                  {currentLanguage === 'hindi' ? 'आपकी प्रोफाइल' : 'Your Profile'}
                </Typography>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography><strong>{currentLanguage === 'hindi' ? 'नाम:' : 'Name:'}</strong> {userProfile.name}</Typography>
                    <Typography><strong>{currentLanguage === 'hindi' ? 'आयु:' : 'Age:'}</strong> {userProfile.age}</Typography>
                    <Typography><strong>{currentLanguage === 'hindi' ? 'शिक्षा:' : 'Education:'}</strong> {userProfile.education}</Typography>
                    <Typography><strong>{currentLanguage === 'hindi' ? 'अनुभव:' : 'Experience:'}</strong> {userProfile.experience} {currentLanguage === 'hindi' ? 'वर्ष' : 'years'}</Typography>
                    <Typography><strong>{currentLanguage === 'hindi' ? 'जिला:' : 'District:'}</strong> {userProfile.district}</Typography>
                    <Typography sx={{ mt: 2 }}>
                      <strong>{currentLanguage === 'hindi' ? 'वर्तमान कौशल:' : 'Current Skills:'}</strong> {userProfile.skills.join(', ')}
                    </Typography>
                  </CardContent>
                </Card>

                {assessmentResult && (
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {currentLanguage === 'hindi' ? 'कृत्रिम बुद्धिमत्ता मूल्यांकन परिणाम' : 'AI Assessment Result'}
                      </Typography>
                      <pre style={{ 
                        backgroundColor: '#f5f5f5', 
                        padding: '10px',
                        borderRadius: '4px',
                        overflow: 'auto'
                      }}>
                        {typeof assessmentResult === 'string' 
                          ? assessmentResult 
                          : JSON.stringify(assessmentResult, null, 2)
                        }
                      </pre>
                    </CardContent>
                  </Card>
                )}

                <Button
                  variant="contained"
                  color="error"
                  onClick={clearAssessment}
                  sx={{ mt: 2 }}
                >
                  {currentLanguage === 'hindi' ? 'फिर से शुरू करें' : 'Start Over'}
                </Button>
              </Box>
            )}

            {activeTab === 2 && !userProfile && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="textSecondary">
                  {currentLanguage === 'hindi' 
                    ? 'अपनी प्रोफाइल देखने के लिए पहले कौशल मूल्यांकन को पूरा करें'
                    : 'Complete the skill assessment first to see your profile'
                  }
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default SkillMatchingDashboard;

