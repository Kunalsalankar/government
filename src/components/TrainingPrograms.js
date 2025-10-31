import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  useTheme,
  alpha,
  Button
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InfoIcon from '@mui/icons-material/Info';
import SendIcon from '@mui/icons-material/Send';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useLanguage } from '../context/LanguageContext';

const TrainingPrograms = () => {
  const theme = useTheme();
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const text = {
    english: {
      title: 'Training Programs',
      subtitle: 'Skill Development Opportunities',
      noPrograms: 'No training programs available at the moment',
      loadError: 'Failed to load training programs',
      location: 'Location',
      description: 'Description',
      applyLink: 'Apply Link',
      apply: 'Apply for Training',
      totalPrograms: 'Total Programs'
    },
    hindi: {
      title: 'प्रशिक्षण कार्यक्रम',
      subtitle: 'कौशल विकास के अवसर',
      noPrograms: 'इस समय कोई प्रशिक्षण कार्यक्रम उपलब्ध नहीं हैं',
      loadError: 'प्रशिक्षण कार्यक्रम लोड करने में विफल',
      location: 'स्थान',
      description: 'विवरण',
      applyLink: 'आवेदन लिंक',
      apply: 'प्रशिक्षण के लिए आवेदन करें',
      totalPrograms: 'कुल कार्यक्रम'
    }
  };

  const t = text[language] || text.english;

  const fetchPrograms = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const q = query(collection(db, 'trainingPrograms'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const programsList = [];
      querySnapshot.forEach((doc) => {
        programsList.push({ id: doc.id, ...doc.data() });
      });
      setPrograms(programsList);
    } catch (err) {
      console.error('Error fetching programs:', err);
      setError(t.loadError);
    } finally {
      setLoading(false);
    }
  }, [t.loadError]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #b3e5fc 0%, #e1bee7 100%)',
      py: { xs: 3, sm: 5 }
    }}>
      <Container maxWidth="lg">
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            background: 'linear-gradient(180deg, #FFFFFF 0%, #E0F2F1 100%)',
            border: '1px solid rgba(0,137,123,0.12)',
            boxShadow: '0 10px 40px rgba(0,137,123,0.15)',
            mb: 4
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.secondary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                mb: 2
              }}
            >
              <SchoolIcon sx={{ fontSize: 48, color: theme.palette.secondary.main }} />
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                fontWeight: 700,
                color: theme.palette.secondary.main,
                mb: 1
              }}
            >
              {t.title}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '0.95rem', sm: '1.05rem' },
                color: 'text.secondary'
              }}
            >
              {t.subtitle}
            </Typography>
          </Box>

          {/* Stats */}
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Chip
              icon={<SchoolIcon />}
              label={`${t.totalPrograms}: ${programs.length}`}
              color="secondary"
              sx={{ fontWeight: 600, fontSize: '1rem', py: 2.5 }}
            />
          </Box>

          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Loading */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={60} />
            </Box>
          ) : programs.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              {t.noPrograms}
            </Alert>
          ) : (
            /* Programs Grid */
            <Grid container spacing={3}>
              {programs.map((program) => (
                <Grid item xs={12} md={6} key={program.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    <Box
                      sx={{
                        height: 6,
                        background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.success.main})`
                      }}
                    />
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      {/* Program Name */}
                      <Typography
                        variant="h5"
                        sx={{
                          fontSize: { xs: '1.25rem', sm: '1.4rem' },
                          fontWeight: 700,
                          color: theme.palette.secondary.main,
                          mb: 2
                        }}
                      >
                        {program.programName}
                      </Typography>

                      {/* Location */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <LocationOnIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {program.location}
                        </Typography>
                      </Box>

                      {/* Description */}
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <InfoIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                            {t.description}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                          {program.description}
                        </Typography>
                      </Box>

                      {/* Apply Button */}
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<SendIcon />}
                        onClick={() => navigate('/training-application')}
                        sx={{
                          mt: 2,
                          py: 1.5,
                          borderRadius: 2,
                          fontWeight: 600,
                          textTransform: 'none',
                          background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
                          '&:hover': {
                            background: `linear-gradient(45deg, ${theme.palette.secondary.dark}, ${theme.palette.secondary.dark})`
                          }
                        }}
                      >
                        {t.apply}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default TrainingPrograms;
