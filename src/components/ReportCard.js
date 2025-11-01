import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Card,
  CardContent
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  EmojiEvents as TrophyIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { useLanguage, translations } from '../context/LanguageContext';

const ReportCard = ({ districtInfo, districtName, stateName }) => {
  const { language } = useLanguage();
  const text = translations.dashboard[language];

  // Calculate performance grade
  const calculateGrade = (districtData) => {
    if (!districtData) return { grade: 'N/A', color: 'grey', emoji: '📊', score: 0 };

    const { householdsEmployed, workersRegistered, totalExpenditure } = districtData.currentMonthData;

    // Simple scoring logic (can be enhanced)
    let score = 0;
    
    // Score based on households employed (0-40 points)
    if (householdsEmployed > 50000) score += 40;
    else if (householdsEmployed > 30000) score += 30;
    else if (householdsEmployed > 10000) score += 20;
    else score += 10;

    // Score based on workers registered (0-30 points)
    if (workersRegistered > 100000) score += 30;
    else if (workersRegistered > 50000) score += 20;
    else score += 10;

    // Score based on expenditure (0-30 points)
    if (totalExpenditure > 5000) score += 30;
    else if (totalExpenditure > 2000) score += 20;
    else score += 10;

    // Assign grade
    if (score >= 85) return { grade: 'A+', color: '#4caf50', emoji: '🏆', score, text: 'Excellent' };
    if (score >= 75) return { grade: 'A', color: '#66bb6a', emoji: '😊', score, text: 'Very Good' };
    if (score >= 65) return { grade: 'B', color: '#9ccc65', emoji: '👍', score, text: 'Good' };
    if (score >= 50) return { grade: 'C', color: '#ff9800', emoji: '😐', score, text: 'Average' };
    if (score >= 35) return { grade: 'D', color: '#ff5722', emoji: '😟', score, text: 'Below Average' };
    return { grade: 'F', color: '#f44336', emoji: '😢', score, text: 'Needs Improvement' };
  };

  const performance = calculateGrade(districtInfo);

  // Calculate key metrics status
  const getMetricStatus = (value, thresholds) => {
    if (value >= thresholds.good) return { status: 'High', color: '#4caf50', icon: <TrendingUpIcon /> };
    if (value >= thresholds.average) return { status: 'Medium', color: '#ff9800', icon: <TrendingFlatIcon /> };
    return { status: 'Low', color: '#f44336', icon: <TrendingDownIcon /> };
  };

  if (!districtInfo) return null;

  const { householdsEmployed, workersRegistered, totalExpenditure, womenParticipation } = districtInfo.currentMonthData;

  return (
    <Paper elevation={4} sx={{ p: { xs: 2.1, sm: 3 }, mb: { xs: 2, sm: 3 }, bgcolor: '#f8f9fa' }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h5" gutterBottom color="primary" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, fontWeight: 600 }}>
          📊 {language === 'hindi' ? 'जिला रिपोर्ट कार्ड' : 'District Report Card'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
          {districtName}, {stateName}
        </Typography>
      </Box>

      {/* Grade Card */}
      <Card 
        sx={{ 
          mb: 3, 
          background: `linear-gradient(135deg, ${performance.color}15, ${performance.color}05)`,
          border: `3px solid ${performance.color}`,
          textAlign: 'center'
        }}
      >
        <CardContent>
          <Typography variant="h1" sx={{ fontSize: { xs: '3rem', sm: '4rem' }, mb: 1 }}>
            {performance.emoji}
          </Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: '2.5rem', sm: '3rem' }, fontWeight: 700, color: performance.color }}>
            {performance.grade}
          </Typography>
          <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, mt: 1, color: 'text.secondary' }}>
            {performance.text}
          </Typography>
          <Box sx={{ mt: 2, px: { xs: 2, sm: 4 } }}>
            <LinearProgress 
              variant="determinate" 
              value={performance.score} 
              sx={{ 
                height: 10, 
                borderRadius: 5,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: performance.color
                }
              }} 
            />
            <Typography variant="caption" sx={{ mt: 0.5, display: 'block', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
              {language === 'hindi' ? 'प्रदर्शन स्कोर' : 'Performance Score'}: {performance.score}/100
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Grid container spacing={{ xs: 1.5, sm: 2 }}>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, textAlign: 'center' }}>
              <TrophyIcon sx={{ fontSize: { xs: 30, sm: 40 }, color: '#ffc107', mb: 1 }} />
              <Typography variant="h4" sx={{ fontSize: { xs: '1.25rem', sm: '1.75rem' }, fontWeight: 600, color: 'primary.main' }}>
                {householdsEmployed.toLocaleString('en-IN')}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                {language === 'hindi' ? 'परिवार कार्यरत' : 'Households'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, textAlign: 'center' }}>
              <CheckIcon sx={{ fontSize: { xs: 30, sm: 40 }, color: '#4caf50', mb: 1 }} />
              <Typography variant="h4" sx={{ fontSize: { xs: '1.25rem', sm: '1.75rem' }, fontWeight: 600, color: 'primary.main' }}>
                {workersRegistered.toLocaleString('en-IN')}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                {language === 'hindi' ? 'पंजीकृत श्रमिक' : 'Workers'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, textAlign: 'center' }}>
              <WarningIcon sx={{ fontSize: { xs: 30, sm: 40 }, color: '#ff9800', mb: 1 }} />
              <Typography variant="h4" sx={{ fontSize: { xs: '1.25rem', sm: '1.75rem' }, fontWeight: 600, color: 'primary.main' }}>
                ₹{(totalExpenditure / 100).toFixed(0)}Cr
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                {language === 'hindi' ? 'कुल व्यय' : 'Expenditure'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontSize: { xs: '1.25rem', sm: '1.75rem' }, fontWeight: 600, color: 'primary.main', mb: 1 }}>
                👩
              </Typography>
              <Typography variant="h4" sx={{ fontSize: { xs: '1.25rem', sm: '1.75rem' }, fontWeight: 600, color: 'primary.main' }}>
                {(parseFloat(womenParticipation) / 100000).toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                {language === 'hindi' ? 'महिला भागीदारी' : 'Women'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Key Insights */}
      <Box sx={{ mt: 3, p: 2, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e0e0e0' }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          💡 {language === 'hindi' ? 'मुख्य जानकारी' : 'Key Insights'}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
          {performance.score >= 75 && (
            <Chip 
              icon={<CheckIcon />} 
              label={language === 'hindi' ? 'उत्कृष्ट प्रदर्शन' : 'Excellent Performance'} 
              color="success" 
              size="small" 
              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
            />
          )}
          {performance.score < 50 && (
            <Chip 
              icon={<WarningIcon />} 
              label={language === 'hindi' ? 'सुधार की आवश्यकता' : 'Needs Improvement'} 
              color="warning" 
              size="small"
              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
            />
          )}
          {(parseFloat(womenParticipation) / 100000) > 40 && (
            <Chip 
              label={language === 'hindi' ? 'उच्च महिला भागीदारी' : 'High Women Participation'} 
              color="primary" 
              size="small"
              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
            />
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default ReportCard;
