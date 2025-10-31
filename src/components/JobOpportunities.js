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
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InfoIcon from '@mui/icons-material/Info';
import PhoneIcon from '@mui/icons-material/Phone';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

const JobOpportunities = () => {
  const theme = useTheme();
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const text = {
    english: {
      title: 'Available Job Opportunities',
      subtitle: 'Local Employment Under MGNREGA',
      noJobs: 'No job opportunities available at the moment',
      loadError: 'Failed to load job opportunities',
      location: 'Location',
      description: 'Description',
      contact: 'Contact Information',
      applyNow: 'Apply Now',
      totalJobs: 'Total Opportunities'
    },
    hindi: {
      title: 'उपलब्ध नौकरी के अवसर',
      subtitle: 'मनरेगा के तहत स्थानीय रोजगार',
      noJobs: 'इस समय कोई नौकरी के अवसर उपलब्ध नहीं हैं',
      loadError: 'नौकरी के अवसर लोड करने में विफल',
      location: 'स्थान',
      description: 'विवरण',
      contact: 'संपर्क जानकारी',
      applyNow: 'अभी आवेदन करें',
      totalJobs: 'कुल अवसर'
    }
  };

  const t = text[language] || text.english;

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const jobsList = [];
      querySnapshot.forEach((doc) => {
        jobsList.push({ id: doc.id, ...doc.data() });
      });
      setJobs(jobsList);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(t.loadError);
    } finally {
      setLoading(false);
    }
  }, [t.loadError]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

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
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                mb: 2
              }}
            >
              <WorkIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                fontWeight: 700,
                color: theme.palette.primary.main,
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
              icon={<WorkIcon />}
              label={`${t.totalJobs}: ${jobs.length}`}
              color="primary"
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
          ) : jobs.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              {t.noJobs}
            </Alert>
          ) : (
            /* Jobs Grid */
            <Grid container spacing={3}>
              {jobs.map((job) => (
                <Grid item xs={12} md={6} key={job.id}>
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
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                      }}
                    />
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      {/* Job Title */}
                      <Typography
                        variant="h5"
                        sx={{
                          fontSize: { xs: '1.25rem', sm: '1.4rem' },
                          fontWeight: 700,
                          color: theme.palette.primary.main,
                          mb: 2
                        }}
                      >
                        {job.jobTitle}
                      </Typography>

                      {/* Location */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <LocationOnIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {job.location}
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
                          {job.description}
                        </Typography>
                      </Box>

                      {/* Contact Info */}
                      {job.contactInfo && (
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <PhoneIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                              {t.contact}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {job.contactInfo}
                          </Typography>
                        </Box>
                      )}

                      {/* Apply Button */}
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => navigate('/job-application')}
                        sx={{
                          mt: 2,
                          py: 1.5,
                          borderRadius: 2,
                          fontWeight: 600,
                          textTransform: 'none',
                          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                          '&:hover': {
                            background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.dark})`
                          }
                        }}
                      >
                        {t.applyNow}
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

export default JobOpportunities;
