import React, { useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Button,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import { generateLearningPath, getCareerProgression } from '../services/skillMatchingService';
import { useLanguage } from '../context/LanguageContext';

const JobRecommendations = ({ jobs, userSkills, userExperience }) => {
  const { language = 'en' } = useLanguage();
  const currentLanguage = language === 'hindi' ? 'hindi' : 'en';
  const [selectedJobPath, setSelectedJobPath] = useState(null);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);

  const jobTitlesHi = {
    'Electrician': 'विद्युतकार',
    'Construction Worker': 'निर्माण कार्यकर्ता',
    'Road Construction Worker': 'सड़क निर्माण कार्यकर्ता',
    'Mason': 'राजमिस्त्री',
    'Plumber': 'नल-जल मिस्त्री',
    'Carpenter': 'बढ़ई',
    'Supervisor': 'पर्यवेक्षक',
    'Welder': 'वेल्डर',
    'Painter': 'पेंटर',
    'Surveyor Assistant': 'सर्वेयर सहायक',
  };

  const handleViewPath = (jobId) => {
    const path = generateLearningPath(userSkills, jobId);
    setSelectedJobPath(path);
  };

  const handleApplyClick = (job) => {
    setSelectedJobForApply(job);
    setApplyDialogOpen(true);
  };

  const handleApplyConfirm = () => {
    if (selectedJobForApply) {
      alert(`${currentLanguage === 'hindi' ? 'आपने ' : 'You have applied for '} ${currentLanguage === 'hindi' ? jobTitlesHi[selectedJobForApply.title] || selectedJobForApply.title : selectedJobForApply.title} ${currentLanguage === 'hindi' ? 'के लिए आवेदन किया है' : ''}`);
      setApplyDialogOpen(false);
      setSelectedJobForApply(null);
    }
  };

  const getMatchLevelColor = (level) => {
    const colors = {
      'excellent': '#4caf50',
      'good': '#2196f3',
      'fair': '#ff9800',
      'low': '#f44336'
    };
    return colors[level] || '#2196f3';
  };

  const getMatchLevelLabel = (level) => {
    if (currentLanguage === 'hindi') {
      const labels = {
        'excellent': 'उत्कृष्ट',
        'good': 'अच्छा',
        'fair': 'उचित',
        'low': 'कम'
      };
      return labels[level] || level;
    }
    return level.toUpperCase();
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          {currentLanguage === 'hindi' ? '🎯 आपकी नौकरी की सिफारिशें' : '🎯 Your Job Recommendations'}
        </Typography>

        {/* Top 3 Recommendations */}
        {jobs.slice(0, 3).map((job, index) => (
          <Card key={job.id} sx={{ mb: 2, borderLeft: `5px solid ${getMatchLevelColor(job.matchLevel)}` }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, sm: 8 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="h6">
                      #{index + 1} {currentLanguage === 'hindi' ? jobTitlesHi[job.title] || job.title : job.title}
                    </Typography>
                    <Chip
                      label={getMatchLevelLabel(job.matchLevel)}
                      size="small"
                      sx={{
                        backgroundColor: getMatchLevelColor(job.matchLevel),
                        color: 'white'
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {currentLanguage === 'hindi' ? 'वेतन सीमा' : 'Salary Range'}: {job.salary} {currentLanguage === 'hindi' ? 'प्रति माह' : 'per month'}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                    <Typography variant="h5" sx={{ color: getMatchLevelColor(job.matchLevel) }}>
                      {job.successProbability}%
                    </Typography>
                    <Typography variant="caption">
                      {currentLanguage === 'hindi' ? 'सफलता की संभावना' : 'Success Probability'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" gutterBottom>
                    {currentLanguage === 'hindi' ? 'कौशल मिलान' : 'Skill Match'}: {job.skillMatch}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={job.skillMatch}
                    sx={{ mb: 2 }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {language === 'hindi' ? 'आवश्यक कौशल:' : 'Required Skills:'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {job.skillsRequired.map(skill => {
                      const hasSkill = userSkills.some(s =>
                        s.toLowerCase().includes(skill.toLowerCase())
                      );
                      return (
                        <Chip
                          key={skill}
                          label={skill}
                          size="small"
                          variant={hasSkill ? 'filled' : 'outlined'}
                          sx={{
                            backgroundColor: hasSkill ? '#e8f5e9' : 'transparent',
                            borderColor: hasSkill ? '#4caf50' : '#ccc',
                            color: hasSkill ? '#2e7d32' : '#666',
                          }}
                          icon={hasSkill ? <Typography>✓</Typography> : undefined}
                        />
                      );
                    })}
                  </Box>
                  {job.skillMatch < 100 && (
                    <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#ff9800' }}>
                      {language === 'hindi' 
                        ? `${100 - job.skillMatch}% कौशल सीखने की जरूरत है` 
                        : `${100 - job.skillMatch}% skills to learn`
                      }
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} sx={{ pt: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleViewPath(job.id)}
                    startIcon={<SchoolIcon />}
                    sx={{ mr: 1 }}
                  >
                    {language === 'hindi' ? 'सीखने का पथ देखें' : 'View Learning Path'}
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => handleApplyClick(job)}
                    startIcon={<WorkIcon />}
                  >
                    {language === 'hindi' ? 'अभी आवेदन करें' : 'Apply Now'}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}

        {/* Learning Path Modal */}
        {selectedJobPath && (
          <Card sx={{ mt: 3, backgroundColor: '#f5f5f5' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📚 {language === 'hindi' ? selectedJobPath.targetJob.title + ' के लिए सीखने का पथ' : `Learning Path for ${selectedJobPath.targetJob.title}`}
              </Typography>

              <Box sx={{ my: 2 }}>
                <Typography variant="subtitle2">
                  {language === 'hindi' ? 'प्रगति' : 'Progress'}: {selectedJobPath.progressPercentage}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={selectedJobPath.progressPercentage}
                  sx={{ mb: 2 }}
                />
              </Box>

              {selectedJobPath.skillsToLearn.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {language === 'hindi' ? 'सीखने के लिए कौशल:' : 'Skills to Learn:'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {selectedJobPath.skillsToLearn.map(skill => (
                      <Chip key={skill} label={skill} variant="outlined" color="error" />
                    ))}
                  </Box>
                </Box>
              )}

              {selectedJobPath.recommendedTrainings.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    {language === 'hindi' 
                      ? `अनुशंसित प्रशिक्षण कार्यक्रम (कुल ${selectedJobPath.estimatedDuration} दिन):`
                      : `Recommended Training Programs (${selectedJobPath.estimatedDuration} days total):`
                    }
                  </Typography>
                  <List dense>
                    {selectedJobPath.recommendedTrainings.map((training, idx) => (
                      <ListItem key={idx}>
                        <ListItemIcon>
                          <SchoolIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={training.title}
                          secondary={`${language === 'hindi' ? 'अवधि' : 'Duration'}: ${training.duration} | ${language === 'hindi' ? 'स्तर' : 'Level'}: ${training.difficulty}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              <Button
                variant="text"
                onClick={() => setSelectedJobPath(null)}
                sx={{ mt: 2 }}
              >
                {language === 'hindi' ? 'बंद करें' : 'Close'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Career Progression */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            📈 {language === 'hindi' ? 'कैरियर प्रगति पथ' : 'Career Progression Path'}
          </Typography>
          <Card>
            <CardContent>
              <List>
                {getCareerProgression(userSkills, userExperience).map((progression, idx) => (
                  <ListItem key={idx}>
                    <ListItemIcon>
                      <TrendingUpIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${language === 'hindi' ? jobTitlesHi[progression.currentRole] || progression.currentRole : progression.currentRole} → ${language === 'hindi' ? jobTitlesHi[progression.nextLevelRole] || progression.nextLevelRole : progression.nextLevelRole}`}
                      secondary={`${language === 'hindi' ? 'समयरेखा' : 'Timeline'}: ${progression.estimatedTimeToPromotion} | ${language === 'hindi' ? 'वेतन वृद्धि' : 'Salary Growth'}: ${progression.salaryProgression.growth}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>

        {/* Apply Dialog */}
        <Dialog
          open={applyDialogOpen}
          onClose={() => setApplyDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {currentLanguage === 'hindi' ? 'नौकरी के लिए आवेदन करें' : 'Apply for Job'}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" paragraph sx={{ mt: 2 }}>
              {currentLanguage === 'hindi' 
                ? `आप ${selectedJobForApply ? jobTitlesHi[selectedJobForApply.title] || selectedJobForApply.title : ''} के लिए आवेदन कर रहे हैं।`
                : `You are applying for ${selectedJobForApply ? selectedJobForApply.title : ''}.`
              }
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {currentLanguage === 'hindi' 
                ? 'आप आगे बढ़ने के लिए तैयार हैं। शुभकामनाएं!'
                : 'You are ready to move forward. Good luck!'
              }
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setApplyDialogOpen(false)}>
              {currentLanguage === 'hindi' ? 'रद्द करें' : 'Cancel'}
            </Button>
            <Button onClick={handleApplyConfirm} variant="contained" color="primary">
              {currentLanguage === 'hindi' ? 'आवेदन करें' : 'Apply'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default JobRecommendations;

