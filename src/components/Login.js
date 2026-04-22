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
  Tab,
  Tabs
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import GavelIcon from '@mui/icons-material/Gavel';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { language } = useLanguage();
  
  const [tabValue, setTabValue] = useState(0); // 0 = User, 1 = Admin, 2 = Head Officer
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const text = {
    english: {
      title: 'Login to MGNREGA Portal',
      userTab: 'User Login',
      adminTab: 'Admin Login',
      headOfficerTab: 'Head Officer Login',
      email: 'Email Address',
      emailPlaceholder: 'Enter your email',
      password: 'Password',
      passwordPlaceholder: 'Enter your password',
      loginButton: 'Login',
      loggingIn: 'Logging in...',
      invalidCredentials: 'Invalid email or password',
      userNote: 'Note: Users can apply for jobs without login. Login is optional.',
      adminNote: 'Admin access only. Please use your admin credentials.',
      headOfficerNote: 'Head Officer access only. Please use your Head Officer credentials.'
    },
    hindi: {
      title: 'मनरेगा पोर्टल में लॉगिन करें',
      userTab: 'उपयोगकर्ता लॉगिन',
      adminTab: 'प्रशासक लॉगिन',
      headOfficerTab: 'मुख्य अधिकारी लॉगिन',
      email: 'ईमेल पता',
      emailPlaceholder: 'अपना ईमेल दर्ज करें',
      password: 'पासवर्ड',
      passwordPlaceholder: 'अपना पासवर्ड दर्ज करें',
      loginButton: 'लॉगिन करें',
      loggingIn: 'लॉगिन हो रहा है...',
      invalidCredentials: 'अमान्य ईमेल या पासवर्ड',
      userNote: 'नोट: उपयोगकर्ता बिना लॉगिन के नौकरी के लिए आवेदन कर सकते हैं। लॉगिन वैकल्पिक है।',
      adminNote: 'केवल प्रशासक एक्सेस। कृपया अपना प्रशासक क्रेडेंशियल उपयोग करें।',
      headOfficerNote: 'केवल मुख्य अधिकारी एक्सेस। कृपया अपना मुख्य अधिकारी क्रेडेंशियल उपयोग करें।'
    }
  };

  const t = text[language] || text.english;

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
    setFormData({ email: '', password: '' });
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Store user role in localStorage
      const isAdmin = tabValue === 1;
      const isHeadOfficer = tabValue === 2;
      localStorage.setItem('userRole', isAdmin ? 'admin' : isHeadOfficer ? 'headOfficer' : 'user');
      localStorage.setItem('userEmail', userCredential.user.email);

      // Redirect based on role
      if (isAdmin) {
        navigate('/admin-dashboard');
      } else if (isHeadOfficer) {
        navigate('/head-officer-dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(t.invalidCredentials);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #b3e5fc 0%, #e1bee7 100%)',
      py: { xs: 4, sm: 6 },
      display: 'flex',
      alignItems: 'center'
    }}>
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            borderRadius: 4,
            background: 'linear-gradient(180deg, #FFFFFF 0%, #E0F2F1 100%)',
            border: '1px solid rgba(0,137,123,0.12)',
            boxShadow: '0 10px 40px rgba(0,137,123,0.15)'
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
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
              <LoginIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />
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
          </Box>

          {/* Tabs */}
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              mb: 3,
              '& .MuiTab-root': {
                fontWeight: 600,
                fontSize: '1rem'
              }
            }}
          >
            <Tab icon={<PersonIcon />} label={t.userTab} />
            <Tab icon={<AdminPanelSettingsIcon />} label={t.adminTab} />
            <Tab icon={<GavelIcon />} label={t.headOfficerTab} />
          </Tabs>

          {/* Info Note */}
          <Alert 
            severity="info" 
            sx={{ mb: 3, borderRadius: 2 }}
          >
            {tabValue === 0 ? t.userNote : tabValue === 1 ? t.adminNote : t.headOfficerNote}
          </Alert>

          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label={t.email}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t.emailPlaceholder}
                variant="outlined"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: 'white'
                  }
                }}
              />

              <TextField
                fullWidth
                label={t.password}
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t.passwordPlaceholder}
                variant="outlined"
                required
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
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
              >
                {loading ? t.loggingIn : t.loginButton}
              </Button>
            </Box>
          </form>

          {/* Demo Credentials */}
          <Box sx={{ mt: 3, p: 2, bgcolor: alpha(theme.palette.warning.main, 0.1), borderRadius: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              {language === 'hindi' ? 'डेमो क्रेडेंशियल्स:' : 'Demo Credentials:'}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
              <strong>{language === 'hindi' ? 'प्रशासक:' : 'Admin:'}</strong> rohit@gmail.com / admin123
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
              <strong>{language === 'hindi' ? 'मुख्य अधिकारी:' : 'Head Officer:'}</strong> headofficer@gmail.com / head1234
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
              <strong>{language === 'hindi' ? 'उपयोगकर्ता:' : 'User:'}</strong> kunal@gmail.com / pass1234
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;

