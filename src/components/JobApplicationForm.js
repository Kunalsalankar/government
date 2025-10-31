import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  Grid,
  useTheme,
  alpha
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useLanguage } from '../context/LanguageContext';

const JobApplicationForm = () => {
  const theme = useTheme();
  const { language } = useLanguage();
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    mobile: '',
    village: '',
    workType: '',
    skills: '',
    availability: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const text = {
    english: {
      title: 'MGNREGA Job Application',
      subtitle: 'Register for Local Employment Opportunities',
      personalInfo: 'Personal Information',
      fullName: 'Full Name',
      fullNamePlaceholder: 'Enter your full name',
      age: 'Age',
      agePlaceholder: 'Your age',
      gender: 'Gender',
      male: 'Male',
      female: 'Female',
      other: 'Other',
      contactInfo: 'Contact Details',
      mobile: 'Mobile Number',
      mobilePlaceholder: 'Enter 10-digit mobile number',
      village: 'Village / District',
      villagePlaceholder: 'Enter your village or district name',
      workInfo: 'Work Preferences',
      workType: 'Type of Work Interested In',
      workTypePlaceholder: 'e.g., Road Construction, Water Conservation, Agriculture',
      skills: 'Skills / Experience',
      skillsPlaceholder: 'Describe your skills and previous work experience...',
      availability: 'When can you start work?',
      immediate: 'Immediate (Can start now)',
      withinWeek: 'Within a Week',
      later: 'Later (After 1 week)',
      submit: 'Submit Application',
      submitting: 'Submitting...',
      successMessage: '✅ Your job application has been submitted successfully!',
      errorMessage: 'Failed to submit application. Please try again.',
      required: 'This field is required',
      invalidMobile: 'Mobile number must be 10 digits',
      invalidAge: 'Age must be between 18 and 100'
    },
    hindi: {
      title: 'मनरेगा नौकरी आवेदन',
      subtitle: 'स्थानीय रोजगार के अवसरों के लिए पंजीकरण करें',
      personalInfo: 'व्यक्तिगत जानकारी',
      fullName: 'पूरा नाम',
      fullNamePlaceholder: 'अपना पूरा नाम दर्ज करें',
      age: 'आयु',
      agePlaceholder: 'आपकी आयु',
      gender: 'लिंग',
      male: 'पुरुष',
      female: 'महिला',
      other: 'अन्य',
      contactInfo: 'संपर्क विवरण',
      mobile: 'मोबाइल नंबर',
      mobilePlaceholder: '10 अंकों का मोबाइल नंबर दर्ज करें',
      village: 'गाँव / जिला',
      villagePlaceholder: 'अपने गाँव या जिले का नाम दर्ज करें',
      workInfo: 'कार्य प्राथमिकताएँ',
      workType: 'किस प्रकार के कार्य में रुचि है',
      workTypePlaceholder: 'जैसे: सड़क निर्माण, जल संरक्षण, कृषि',
      skills: 'कौशल / अनुभव',
      skillsPlaceholder: 'अपने कौशल और पिछले कार्य अनुभव का विवरण दें...',
      availability: 'आप कब काम शुरू कर सकते हैं?',
      immediate: 'तुरंत (अभी शुरू कर सकते हैं)',
      withinWeek: 'एक सप्ताह के भीतर',
      later: 'बाद में (1 सप्ताह के बाद)',
      submit: 'आवेदन जमा करें',
      submitting: 'जमा हो रहा है...',
      successMessage: '✅ आपका नौकरी आवेदन सफलतापूर्वक जमा किया गया है!',
      errorMessage: 'आवेदन जमा करने में विफल। कृपया पुनः प्रयास करें।',
      required: 'यह फ़ील्ड आवश्यक है',
      invalidMobile: 'मोबाइल नंबर 10 अंकों का होना चाहिए',
      invalidAge: 'आयु 18 से 100 के बीच होनी चाहिए'
    }
  };

  const t = text[language] || text.english;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Required fields validation
    if (!formData.name.trim()) errors.name = t.required;
    if (!formData.age) errors.age = t.required;
    if (!formData.gender) errors.gender = t.required;
    if (!formData.mobile.trim()) errors.mobile = t.required;
    if (!formData.village.trim()) errors.village = t.required;
    if (!formData.workType.trim()) errors.workType = t.required;
    if (!formData.skills.trim()) errors.skills = t.required;
    if (!formData.availability) errors.availability = t.required;

    // Mobile number validation (10 digits)
    if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) {
      errors.mobile = t.invalidMobile;
    }

    // Age validation (18-100)
    if (formData.age && (formData.age < 18 || formData.age > 100)) {
      errors.age = t.invalidAge;
    }

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
      // Store data in Firestore
      await addDoc(collection(db, 'jobApplications'), {
        name: formData.name.trim(),
        age: parseInt(formData.age),
        gender: formData.gender,
        mobile: formData.mobile.trim(),
        village: formData.village.trim(),
        workType: formData.workType.trim(),
        skills: formData.skills.trim(),
        availability: formData.availability,
        timestamp: serverTimestamp()
      });

      setSuccess(true);
      // Reset form
      setFormData({
        name: '',
        age: '',
        gender: '',
        mobile: '',
        village: '',
        workType: '',
        skills: '',
        availability: ''
      });

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);

    } catch (err) {
      console.error('Error submitting application:', err);
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
              {/* Personal Information Section */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                    fontWeight: 700,
                    color: theme.palette.primary.main,
                    mb: 1,
                    mt: 0
                  }}
                >
                  {t.personalInfo}
                </Typography>
                <Box sx={{ height: 2, width: 60, bgcolor: theme.palette.primary.main, mb: 2 }} />
              </Grid>

              {/* Full Name */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t.fullName}
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!validationErrors.name}
                  helperText={validationErrors.name}
                  placeholder={t.fullNamePlaceholder}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'white'
                    }
                  }}
                />
              </Grid>

              {/* Age */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t.age}
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  error={!!validationErrors.age}
                  helperText={validationErrors.age}
                  placeholder={t.agePlaceholder}
                  variant="outlined"
                  InputProps={{ inputProps: { min: 18, max: 100 } }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'white'
                    }
                  }}
                />
              </Grid>

              {/* Gender */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!validationErrors.gender}>
                  <InputLabel>{t.gender}</InputLabel>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    label={t.gender}
                    sx={{ 
                      borderRadius: 2, 
                      bgcolor: 'white',
                      minWidth: 200
                    }}
                  >
                    <MenuItem value="male">{t.male}</MenuItem>
                    <MenuItem value="female">{t.female}</MenuItem>
                    <MenuItem value="other">{t.other}</MenuItem>
                  </Select>
                  {validationErrors.gender && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {validationErrors.gender}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Contact Details Section */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                    fontWeight: 700,
                    color: theme.palette.primary.main,
                    mb: 1,
                    mt: 2
                  }}
                >
                  {t.contactInfo}
                </Typography>
                <Box sx={{ height: 2, width: 60, bgcolor: theme.palette.primary.main, mb: 2 }} />
              </Grid>

              {/* Mobile Number */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t.mobile}
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  error={!!validationErrors.mobile}
                  helperText={validationErrors.mobile}
                  placeholder={t.mobilePlaceholder}
                  variant="outlined"
                  inputProps={{ maxLength: 10 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'white'
                    }
                  }}
                />
              </Grid>

              {/* Village / District */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t.village}
                  name="village"
                  value={formData.village}
                  onChange={handleChange}
                  error={!!validationErrors.village}
                  helperText={validationErrors.village}
                  placeholder={t.villagePlaceholder}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'white'
                    }
                  }}
                />
              </Grid>

              {/* Work Preferences Section */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                    fontWeight: 700,
                    color: theme.palette.primary.main,
                    mb: 1,
                    mt: 2
                  }}
                >
                  {t.workInfo}
                </Typography>
                <Box sx={{ height: 2, width: 60, bgcolor: theme.palette.primary.main, mb: 2 }} />
              </Grid>

              {/* Type of Work */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t.workType}
                  name="workType"
                  value={formData.workType}
                  onChange={handleChange}
                  error={!!validationErrors.workType}
                  helperText={validationErrors.workType}
                  variant="outlined"
                  placeholder={t.workTypePlaceholder}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'white'
                    }
                  }}
                />
              </Grid>

              {/* Skills / Experience */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t.skills}
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  error={!!validationErrors.skills}
                  helperText={validationErrors.skills}
                  variant="outlined"
                  multiline
                  rows={4}
                  placeholder={t.skillsPlaceholder}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'white'
                    }
                  }}
                />
              </Grid>

              {/* Availability */}
              <Grid item xs={12}>
                <FormControl fullWidth error={!!validationErrors.availability}>
                  <InputLabel>{t.availability}</InputLabel>
                  <Select
                    name="availability"
                    value={formData.availability}
                    onChange={handleChange}
                    label={t.availability}
                    sx={{ 
                      borderRadius: 2, 
                      bgcolor: 'white',
                      minWidth: 200 
                    }}
                  >
                    <MenuItem value="immediate">{t.immediate}</MenuItem>
                    <MenuItem value="withinWeek">{t.withinWeek}</MenuItem>
                    <MenuItem value="later">{t.later}</MenuItem>
                  </Select>
                  {validationErrors.availability && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {validationErrors.availability}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Submit Button */}
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
            </Grid>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default JobApplicationForm;
