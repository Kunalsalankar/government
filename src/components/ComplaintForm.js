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
  useTheme,
  alpha
} from '@mui/material';
import FeedbackIcon from '@mui/icons-material/Feedback';
import SendIcon from '@mui/icons-material/Send';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useLanguage } from '../context/LanguageContext';

const ComplaintForm = () => {
  const theme = useTheme();
  const { language } = useLanguage();
  
  const [formData, setFormData] = useState({
    district: '',
    issueType: '',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const text = {
    english: {
      title: 'Submit Complaint / Feedback',
      subtitle: 'Report issues or share feedback about MGNREGA services',
      district: 'District',
      districtPlaceholder: 'Enter your district name',
      issueType: 'Issue Type',
      issueTypePlaceholder: 'Select issue type',
      paymentDelay: 'Payment Delay',
      workNotProvided: 'Work Not Provided',
      corruption: 'Corruption',
      other: 'Other',
      description: 'Description',
      descriptionPlaceholder: 'Describe your issue in detail...',
      submit: 'Submit Complaint',
      submitting: 'Submitting...',
      successMessage: '✅ Your complaint has been submitted successfully. Our team will review it soon.',
      errorMessage: 'Failed to submit complaint. Please try again.',
      required: 'This field is required',
      confirmation: 'Thank you for reporting!',
      confirmationText: 'Your complaint ID will be used to track the status. Please save this ID for future reference.'
    },
    hindi: {
      title: 'शिकायत / प्रतिक्रिया जमा करें',
      subtitle: 'मनरेगा सेवाओं के बारे में समस्याओं की रिपोर्ट करें या प्रतिक्रिया साझा करें',
      district: 'जिला',
      districtPlaceholder: 'अपने जिले का नाम दर्ज करें',
      issueType: 'समस्या का प्रकार',
      issueTypePlaceholder: 'समस्या का प्रकार चुनें',
      paymentDelay: 'भुगतान में देरी',
      workNotProvided: 'काम नहीं मिला',
      corruption: 'भ्रष्टाचार',
      other: 'अन्य',
      description: 'विवरण',
      descriptionPlaceholder: 'अपनी समस्या का विस्तार से वर्णन करें...',
      submit: 'शिकायत जमा करें',
      submitting: 'जमा किया जा रहा है...',
      successMessage: '✅ आपकी शिकायत सफलतापूर्वक जमा कर दी गई है। हमारी टीम जल्द ही इसकी समीक्षा करेगी।',
      errorMessage: 'शिकायत जमा करने में विफल। कृपया पुनः प्रयास करें।',
      required: 'यह फ़ील्ड आवश्यक है',
      confirmation: 'रिपोर्ट करने के लिए धन्यवाद!',
      confirmationText: 'आपकी शिकायत ID का उपयोग स्थिति ट्रैक करने के लिए किया जाएगा। कृपया भविष्य के संदर्भ के लिए इस ID को सहेजें।'
    }
  };

  const t = text[language] || text.english;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };


  const validateForm = () => {
    const errors = {};
    if (!formData.district?.trim()) errors.district = t.required;
    if (!formData.issueType) errors.issueType = t.required;
    if (!formData.description?.trim()) errors.description = t.required;

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
      const userId = localStorage.getItem('userEmail') || 'anonymous';

      await addDoc(collection(db, 'complaints'), {
        district: formData.district.trim(),
        issueType: formData.issueType,
        description: formData.description.trim(),
        submittedBy: userId,
        status: 'Pending',
        submittedAt: serverTimestamp()
      });

      setSuccess(true);
      setFormData({
        district: '',
        issueType: '',
        description: ''
      });

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      console.error('Error submitting complaint:', err);
      setError(t.errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
      py: { xs: 3, sm: 5 }
    }}>
      <Container maxWidth="lg">
        <Paper
          elevation={6}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF8E1 100%)',
            border: '1px solid rgba(255,152,0,0.12)',
            boxShadow: '0 10px 40px rgba(255,152,0,0.2)'
          }}
        >
          {/* Header */}
          <Box 
            sx={{ 
              background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
              color: 'white',
              p: { xs: 2, sm: 3, md: 4 },
              textAlign: 'center'
            }}
          >
            <FeedbackIcon sx={{ fontSize: { xs: 48, sm: 60 }, mb: 2 }} />
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
              <Alert 
                severity="success" 
                sx={{ 
                  mb: 3, 
                  borderRadius: 2,
                  fontSize: '1rem'
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                  {t.confirmation}
                </Typography>
                <Typography variant="body2">
                  {t.successMessage}
                </Typography>
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  fullWidth
                  label={t.district}
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  error={!!validationErrors.district}
                  helperText={validationErrors.district}
                  variant="outlined"
                  placeholder={t.districtPlaceholder}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'white'
                    }
                  }}
                />

                <FormControl 
                  fullWidth 
                  error={!!validationErrors.issueType}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'white'
                    }
                  }}
                >
                  <InputLabel>{t.issueType}</InputLabel>
                  <Select
                    name="issueType"
                    value={formData.issueType}
                    onChange={handleChange}
                    label={t.issueType}
                  >
                    <MenuItem value="paymentDelay">{t.paymentDelay}</MenuItem>
                    <MenuItem value="workNotProvided">{t.workNotProvided}</MenuItem>
                    <MenuItem value="corruption">{t.corruption}</MenuItem>
                    <MenuItem value="other">{t.other}</MenuItem>
                  </Select>
                  {validationErrors.issueType && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                      {validationErrors.issueType}
                    </Typography>
                  )}
                </FormControl>

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
                  rows={8}
                  placeholder={t.descriptionPlaceholder}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'white'
                    }
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                  sx={{
                    py: 2.5,
                    fontSize: { xs: '1.05rem', sm: '1.15rem' },
                    fontWeight: 700,
                    borderRadius: 2,
                    textTransform: 'none',
                    background: `linear-gradient(45deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
                    boxShadow: `0 4px 15px ${alpha(theme.palette.warning.main, 0.4)}`,
                    '&:hover': {
                      background: `linear-gradient(45deg, ${theme.palette.warning.dark}, ${theme.palette.warning.dark})`,
                      boxShadow: `0 6px 20px ${alpha(theme.palette.warning.main, 0.5)}`,
                      transform: 'translateY(-2px)'
                    },
                    '&:disabled': {
                      background: '#ccc'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {loading ? t.submitting : t.submit}
                </Button>
              </Box>
            </form>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ComplaintForm;
