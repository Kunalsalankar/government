import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
  Grid
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

const AdminAddJob = () => {
  const theme = useTheme();
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    jobTitle: '',
    location: '',
    description: '',
    startTime: '',
    endTime: '',
    contactInfo: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const text = {
    english: {
      title: 'Add New Job Opportunity',
      subtitle: 'Post a Local Employment Opportunity',
      jobTitle: 'Job Title',
      jobTitlePlaceholder: 'e.g., Road Construction Worker',
      location: 'Location',
      locationPlaceholder: 'e.g., Village Name, District',
      description: 'Job Description',
      descriptionPlaceholder: 'Describe the job responsibilities, requirements, duration, etc.',
      startTime: 'Start Date',
      endTime: 'End Date',
      contactInfo: 'Contact Information',
      contactInfoPlaceholder: 'Phone number, email, or office address',
      submit: 'Add Job Opportunity',
      submitting: 'Adding...',
      successMessage: '✅ Job opportunity added successfully!',
      errorMessage: 'Failed to add job opportunity. Please try again.',
      required: 'This field is required',
      backToDashboard: 'Back to Dashboard'
    },
    hindi: {
      title: 'नया नौकरी अवसर जोड़ें',
      subtitle: 'स्थानीय रोजगार अवसर पोस्ट करें',
      jobTitle: 'नौकरी का शीर्षक',
      jobTitlePlaceholder: 'जैसे: सड़क निर्माण कार्यकर्ता',
      location: 'स्थान',
      locationPlaceholder: 'जैसे: गाँव का नाम, जिला',
      description: 'नौकरी विवरण',
      descriptionPlaceholder: 'नौकरी की जिम्मेदारियां, आवश्यकताएं, अवधि आदि का वर्णन करें',
      startTime: 'आरंभ तिथि',
      endTime: 'समाप्ति तिथि',
      contactInfo: 'संपर्क जानकारी',
      contactInfoPlaceholder: 'फोन नंबर, ईमेल, या कार्यालय का पता',
      submit: 'नौकरी अवसर जोड़ें',
      submitting: 'जोड़ा जा रहा है...',
      successMessage: '✅ नौकरी का अवसर सफलतापूर्वक जोड़ा गया!',
      errorMessage: 'नौकरी का अवसर जोड़ने में विफल। कृपया पुनः प्रयास करें।',
      required: 'यह फ़ील्ड आवश्यक है',
      backToDashboard: 'डैशबोर्ड पर वापस जाएं'
    }
  };

  const t = text[language] || text.english;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.jobTitle.trim()) errors.jobTitle = t.required;
    if (!formData.location.trim()) errors.location = t.required;
    if (!formData.description.trim()) errors.description = t.required;
    if (!formData.startTime) errors.startTime = t.required;
    if (!formData.endTime) errors.endTime = t.required;
    if (!formData.contactInfo.trim()) errors.contactInfo = t.required;

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const adminEmail = localStorage.getItem('userEmail') || 'admin@mgnrega.gov.in';
      
      await addDoc(collection(db, 'jobs'), {
        jobTitle: formData.jobTitle.trim(),
        location: formData.location.trim(),
        description: formData.description.trim(),
        startTime: formData.startTime,
        endTime: formData.endTime,
        contactInfo: formData.contactInfo.trim(),
        createdBy: adminEmail,
        createdAt: serverTimestamp()
      });

      setSuccess(true);
      setFormData({
        jobTitle: '',
        location: '',
        description: '',
        startTime: '',
        endTime: '',
        contactInfo: ''
      });

      setTimeout(() => {
        setSuccess(false);
      }, 5000);

    } catch (err) {
      console.error('Error adding job:', err);
      setError(t.errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #b3e5fc 0%, #e1bee7 100%)',
      py: { xs: 3, sm: 5 }
    }}>
      <Container maxWidth="md">
        <Paper
          elevation={6}
          sx={{
            p: { xs: 2.5, sm: 3.5, md: 4 },
            borderRadius: 4,
            background: 'linear-gradient(180deg, #FFFFFF 0%, #E0F2F1 100%)',
            border: '1px solid rgba(0,137,123,0.12)',
            boxShadow: '0 10px 40px rgba(0,137,123,0.15)'
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
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
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
                fontSize: { xs: '0.9rem', sm: '1rem' },
                color: 'text.secondary'
              }}
            >
              {t.subtitle}
            </Typography>
          </Box>

          {/* Success Message */}
          {success && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              {t.successMessage}
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t.jobTitle}
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  error={!!validationErrors.jobTitle}
                  helperText={validationErrors.jobTitle}
                  placeholder={t.jobTitlePlaceholder}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'white'
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t.location}
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  error={!!validationErrors.location}
                  helperText={validationErrors.location}
                  placeholder={t.locationPlaceholder}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'white'
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t.description}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  error={!!validationErrors.description}
                  helperText={validationErrors.description}
                  variant="outlined"
                  multiline
                  rows={5}
                  placeholder={t.descriptionPlaceholder}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'white'
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t.startTime}
                  name="startTime"
                  type="date"
                  value={formData.startTime}
                  onChange={handleChange}
                  error={!!validationErrors.startTime}
                  helperText={validationErrors.startTime}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'white'
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t.endTime}
                  name="endTime"
                  type="date"
                  value={formData.endTime}
                  onChange={handleChange}
                  error={!!validationErrors.endTime}
                  helperText={validationErrors.endTime}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'white'
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t.contactInfo}
                  name="contactInfo"
                  value={formData.contactInfo}
                  onChange={handleChange}
                  error={!!validationErrors.contactInfo}
                  helperText={validationErrors.contactInfo}
                  placeholder={t.contactInfoPlaceholder}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'white'
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{
                    py: 1.75,
                    borderRadius: 3,
                    fontSize: '1.05rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    boxShadow: '0 4px 14px rgba(0,137,123,0.4)',
                    '&:hover': {
                      background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.dark})`,
                      boxShadow: '0 6px 20px rgba(0,137,123,0.4)'
                    },
                    '&:disabled': {
                      background: theme.palette.action.disabledBackground
                    }
                  }}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <WorkIcon />}
                >
                  {loading ? t.submitting : t.submit}
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/admin-dashboard')}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none'
                  }}
                >
                  {t.backToDashboard}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminAddJob;
