import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Box,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { getAISkillAssessment, getJobRecommendations } from '../services/skillMatchingService';
import { useSkillContext } from '../context/SkillContext';
import { useLanguage } from '../context/LanguageContext';

const SkillAssessment = ({ onAssessmentComplete }) => {
  const { updateUserProfile, updateRecommendations, updateAssessmentResult } = useSkillContext();
  const { language = 'en' } = useLanguage();
  const currentLanguage = language === 'hindi' ? 'hindi' : 'en';
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    education: '',
    experience: '',
    district: '',
    skills: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const availableSkills = [
    'construction',
    'brick laying',
    'concrete work',
    'electrical wiring',
    'plumbing',
    'carpentry',
    'welding',
    'painting',
    'masonry',
    'leadership',
    'communication',
    'physical fitness',
    'problem solving',
    'attention to detail',
  ];

  const skillLabels = {
    en: {
      'construction': 'Construction',
      'brick laying': 'Brick Laying',
      'concrete work': 'Concrete Work',
      'electrical wiring': 'Electrical Wiring',
      'plumbing': 'Plumbing',
      'carpentry': 'Carpentry',
      'welding': 'Welding',
      'painting': 'Painting',
      'masonry': 'Masonry',
      'leadership': 'Leadership',
      'communication': 'Communication',
      'physical fitness': 'Physical Fitness',
      'problem solving': 'Problem Solving',
      'attention to detail': 'Attention to Detail',
    },
    hindi: {
      'construction': 'निर्माण',
      'brick laying': 'ईंट बिछाना',
      'concrete work': 'कंक्रीट कार्य',
      'electrical wiring': 'विद्युत तारकाएं',
      'plumbing': 'नल-जल',
      'carpentry': 'बढ़ईगिरी',
      'welding': 'वेल्डिंग',
      'painting': 'पेंटिंग',
      'masonry': 'राजमिस्त्री',
      'leadership': 'नेतृत्व',
      'communication': 'संचार',
      'physical fitness': 'शारीरिक फिटनेस',
      'problem solving': 'समस्या समाधान',
      'attention to detail': 'विस्तार पर ध्यान',
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillToggle = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.age || !formData.education || !formData.experience || !formData.district) {
      setError(currentLanguage === 'hindi' ? 'कृपया सभी आवश्यक क्षेत्र भरें' : 'Please fill in all required fields');
      return;
    }

    if (formData.skills.length === 0) {
      setError(currentLanguage === 'hindi' ? 'कृपया कम से कम एक कौशल चुनें' : 'Please select at least one skill');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Update context with user profile
      updateUserProfile(formData);
      
      // Get job recommendations
      const recommendations = getJobRecommendations(formData.skills, parseInt(formData.experience) || 0);
      updateRecommendations(recommendations);
      
      // Get AI assessment
      const assessment = await getAISkillAssessment(formData);
      
      if (assessment) {
        updateAssessmentResult(assessment);
        setSuccess(true);
        onAssessmentComplete && onAssessmentComplete(assessment);
        
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(currentLanguage === 'hindi' ? 'मूल्यांकन करने में विफल। कृपया पुनः प्रयास करें।' : 'Failed to process assessment. Please try again.');
      }
    } catch (err) {
      setError(err.message || (currentLanguage === 'hindi' ? 'एक त्रुटि हुई' : 'An error occurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          {currentLanguage === 'hindi' ? '💼 कौशल मूल्यांकन' : '💼 AI Skill Assessment'}
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          {currentLanguage === 'hindi' 
            ? 'अपने कौशल के आधार पर व्यक्तिगत नौकरी की सिफारिशें प्राप्त करें'
            : 'Get personalized job recommendations based on your skills'
          }
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>
          {currentLanguage === 'hindi' ? 'मूल्यांकन पूर्ण! नीचे सिफारिशें देखें' : 'Assessment completed! Check recommendations below'}
        </Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label={currentLanguage === 'hindi' ? 'पूरा नाम' : 'Full Name'}
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label={currentLanguage === 'hindi' ? 'आयु' : 'Age'}
            name="age"
            type="number"
            value={formData.age}
            onChange={handleInputChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label={currentLanguage === 'hindi' ? 'शिक्षा स्तर' : 'Education Level'}
            name="education"
            value={formData.education}
            onChange={handleInputChange}
            placeholder={currentLanguage === 'hindi' ? 'उदा. 10वीं पास, 12वीं पास' : 'e.g., 10th pass, 12th pass'}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label={currentLanguage === 'hindi' ? 'अनुभव के वर्ष' : 'Years of Experience'}
            name="experience"
            type="number"
            value={formData.experience}
            onChange={handleInputChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label={currentLanguage === 'hindi' ? 'जिला' : 'District'}
            name="district"
            value={formData.district}
            onChange={handleInputChange}
            placeholder={currentLanguage === 'hindi' ? 'उदा. पुणे, मुंबई' : 'e.g., Pune, Mumbai'}
            margin="normal"
            required
          />

          <Box sx={{ my: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              {currentLanguage === 'hindi' ? 'अपने वर्तमान कौशल चुनें:' : 'Select Your Current Skills:'}
            </Typography>
            <FormGroup>
              {availableSkills.map(skill => (
                <FormControlLabel
                  key={skill}
                  control={
                    <Checkbox
                      checked={formData.skills.includes(skill)}
                      onChange={() => handleSkillToggle(skill)}
                    />
                  }
                  label={skillLabels[currentLanguage][skill] || skill}
                />
              ))}
            </FormGroup>
          </Box>

          <Button
            fullWidth
            variant="contained"
            color="primary"
            type="submit"
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : (currentLanguage === 'hindi' ? 'कौशल मूल्यांकन प्राप्त करें' : 'Get AI Assessment')}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default SkillAssessment;

