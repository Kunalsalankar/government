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
import SchoolIcon from '@mui/icons-material/School';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useLanguage } from '../context/LanguageContext';

const TrainingApplicationForm = () => {
  const theme = useTheme();
  const { language } = useLanguage();
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    mobile: '',
    village: '',
    education: '',
    preferredSkill: '',
    experience: '',
    availability: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const text = {
    english: {
      title: 'MGNREGA Training Application',
      subtitle: 'Register for Skill Development Programs',
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
      trainingInfo: 'Training Preferences',
      education: 'Education Level',
      educationPlaceholder: 'e.g., 10th Pass, 12th Pass, Graduate',
      preferredSkill: 'Preferred Skill to Learn',
      preferredSkillPlaceholder: 'e.g., Masonry, Carpentry, Agriculture, Tailoring',
      experience: 'Previous Training / Experience',
      experiencePlaceholder: 'Describe any previous training or relevant experience...',
      availability: 'When can you start training?',
      immediate: 'Immediate (Can start now)',
      withinWeek: 'Within a Week',
      later: 'Later (After 1 week)',
      submit: 'Submit Application',
      submitting: 'Submitting...',
      successMessage: '✅ Your training application has been submitted successfully!',
      errorMessage: 'Failed to submit application. Please try again.',
      required: 'This field is required',
      invalidMobile: 'Mobile number must be 10 digits',
      invalidAge: 'Age must be between 18 and 100'
    },
    hindi: {
      title: 'मनरेगा प्रशिक्षण आवेदन',
      subtitle: 'कौशल विकास कार्यक्रमों के लिए पंजीकरण करें',
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
      trainingInfo: 'प्रशिक्षण प्राथमिकताएँ',
      education: 'शिक्षा स्तर',
      educationPlaceholder: 'जैसे: 10वीं पास, 12वीं पास, स्नातक',
      preferredSkill: 'सीखने के लिए पसंदीदा कौशल',
      preferredSkillPlaceholder: 'जैसे: राजमिस्त्री, बढ़ईगीरी, कृषि, सिलाई',
      experience: 'पिछला प्रशिक्षण / अनुभव',
      experiencePlaceholder: 'किसी भी पिछले प्रशिक्षण या प्रासंगिक अनुभव का विवरण दें...',
      availability: 'आप प्रशिक्षण कब शुरू कर सकते हैं?',
      immediate: 'तुरंत (अभी शुरू कर सकते हैं)',
      withinWeek: 'एक सप्ताह में',
      later: 'बाद में (1 सप्ताह के बाद)',
      submit: 'आवेदन जमा करें',
      submitting: 'जमा किया जा रहा है...',
      successMessage: '✅ आपका प्रशिक्षण आवेदन सफलतापूर्वक जमा किया गया है!',
      errorMessage: 'आवेदन जमा करने में विफल। कृपया पुनः प्रयास करें।',
      required: 'यह फ़ील्ड आवश्यक है',
      invalidMobile: 'मोबाइल नंबर 10 अंकों का होना चाहिए',
      invalidAge: 'आयु 18 से 100 के बीच होनी चाहिए'
    }
  };

  const t = text[language] || text.english;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = t.required;
    if (!formData.age) {
      errors.age = t.required;
    } else if (formData.age < 18 || formData.age > 100) {
      errors.age = t.invalidAge;
    }
    if (!formData.gender) errors.gender = t.required;
    if (!formData.mobile) {
      errors.mobile = t.required;
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      errors.mobile = t.invalidMobile;
    }
    if (!formData.village.trim()) errors.village = t.required;
    if (!formData.education.trim()) errors.education = t.required;
    if (!formData.preferredSkill.trim()) errors.preferredSkill = t.required;
    if (!formData.availability) errors.availability = t.required;

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
      await addDoc(collection(db, 'trainingApplications'), {
        name: formData.name.trim(),
        age: parseInt(formData.age),
        gender: formData.gender,
        mobile: formData.mobile,
        village: formData.village.trim(),
        education: formData.education.trim(),
        preferredSkill: formData.preferredSkill.trim(),
        experience: formData.experience.trim(),
        availability: formData.availability,
        timestamp: serverTimestamp()
      });

      setSuccess(true);
      setFormData({
        name: '',
        age: '',
        gender: '',
        mobile: '',
        village: '',
        education: '',
        preferredSkill: '',
        experience: '',
        availability: ''
      });

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
            borderRadius: 4,
            overflow: 'hidden',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F3E5F5 100%)',
            border: '1px solid rgba(126,87,194,0.12)',
            boxShadow: '0 10px 40px rgba(126,87,194,0.2)'
          }}
        >
          {/* Header */}
          <Box 
            sx={{ 
              background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
              color: 'white',
              p: { xs: 2, sm: 3, md: 4 },
              textAlign: 'center'
            }}
          >
            <SchoolIcon sx={{ fontSize: { xs: 48, sm: 60 }, mb: 2 }} />
            <Typography 
              variant="h4" 
              sx={{ 
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                fontWeight: 700,
                mb: 1
              }}
            >
              {t.title}
            </Typography>
            <Typography variant="body1" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' }, opacity: 0.95 }}>
              {t.subtitle}
            </Typography>
          </Box>

          {/* Form */}
          <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            {success && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                {t.successMessage}
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              {/* Personal Information */}
              <Box sx={{ 
                mb: 3,
                pb: 2,
                borderBottom: `2px solid ${alpha(theme.palette.secondary.main, 0.2)}`
              }}>
                <Typography variant="h6" sx={{ 
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  fontWeight: 700,
                  color: theme.palette.secondary.main,
                  mb: 2
                }}>
                  {t.personalInfo}
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t.fullName}
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      error={!!validationErrors.name}
                      helperText={validationErrors.name}
                      variant="outlined"
                      placeholder={t.fullNamePlaceholder}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: 'white'
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label={t.age}
                      name="age"
                      type="number"
                      value={formData.age}
                      onChange={handleChange}
                      error={!!validationErrors.age}
                      helperText={validationErrors.age}
                      variant="outlined"
                      placeholder={t.agePlaceholder}
                      inputProps={{ min: 18, max: 100 }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: 'white'
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={8}>
                    <FormControl 
                      fullWidth 
                      error={!!validationErrors.gender}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: 'white'
                        }
                      }}
                    >
                      <InputLabel>{t.gender}</InputLabel>
                      <Select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        label={t.gender}
                        sx={{ minWidth: 120 }}
                      >
                        <MenuItem value="male">{t.male}</MenuItem>
                        <MenuItem value="female">{t.female}</MenuItem>
                        <MenuItem value="other">{t.other}</MenuItem>
                      </Select>
                      {validationErrors.gender && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                          {validationErrors.gender}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>

              {/* Contact Details */}
              <Box sx={{ 
                mb: 3,
                pb: 2,
                borderBottom: `2px solid ${alpha(theme.palette.secondary.main, 0.2)}`
              }}>
                <Typography variant="h6" sx={{ 
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  fontWeight: 700,
                  color: theme.palette.secondary.main,
                  mb: 2
                }}>
                  {t.contactInfo}
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t.mobile}
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      error={!!validationErrors.mobile}
                      helperText={validationErrors.mobile}
                      variant="outlined"
                      placeholder={t.mobilePlaceholder}
                      inputProps={{ maxLength: 10 }}
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
                      label={t.village}
                      name="village"
                      value={formData.village}
                      onChange={handleChange}
                      error={!!validationErrors.village}
                      helperText={validationErrors.village}
                      variant="outlined"
                      placeholder={t.villagePlaceholder}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: 'white'
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Training Preferences */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ 
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  fontWeight: 700,
                  color: theme.palette.secondary.main,
                  mb: 2
                }}>
                  {t.trainingInfo}
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t.education}
                      name="education"
                      value={formData.education}
                      onChange={handleChange}
                      error={!!validationErrors.education}
                      helperText={validationErrors.education}
                      variant="outlined"
                      placeholder={t.educationPlaceholder}
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
                      label={t.preferredSkill}
                      name="preferredSkill"
                      value={formData.preferredSkill}
                      onChange={handleChange}
                      error={!!validationErrors.preferredSkill}
                      helperText={validationErrors.preferredSkill}
                      variant="outlined"
                      placeholder={t.preferredSkillPlaceholder}
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
                      label={t.experience}
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      variant="outlined"
                      multiline
                      rows={4}
                      placeholder={t.experiencePlaceholder}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: 'white'
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl 
                      fullWidth 
                      error={!!validationErrors.availability}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: 'white'
                        }
                      }}
                    >
                      <InputLabel>{t.availability}</InputLabel>
                      <Select
                        name="availability"
                        value={formData.availability}
                        onChange={handleChange}
                        label={t.availability}
                        sx={{ minWidth: 200 }}
                      >
                        <MenuItem value="immediate">{t.immediate}</MenuItem>
                        <MenuItem value="withinWeek">{t.withinWeek}</MenuItem>
                        <MenuItem value="later">{t.later}</MenuItem>
                      </Select>
                      {validationErrors.availability && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                          {validationErrors.availability}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SchoolIcon />}
                sx={{
                  py: 1.5,
                  fontSize: { xs: '0.95rem', sm: '1.1rem' },
                  fontWeight: 700,
                  borderRadius: 2,
                  textTransform: 'none',
                  background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
                  boxShadow: `0 4px 15px ${alpha(theme.palette.secondary.main, 0.4)}`,
                  '&:hover': {
                    background: `linear-gradient(45deg, ${theme.palette.secondary.dark}, ${theme.palette.secondary.dark})`,
                    boxShadow: `0 6px 20px ${alpha(theme.palette.secondary.main, 0.5)}`,
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? t.submitting : t.submit}
              </Button>
            </form>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default TrainingApplicationForm;
