import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Grid, 
  Button, 
  Paper, 
  TextField, 
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { useNavigate } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InfoIcon from '@mui/icons-material/Info';
import GavelIcon from '@mui/icons-material/Gavel';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import CampaignIcon from '@mui/icons-material/Campaign';
import FeedbackIcon from '@mui/icons-material/Feedback';
import MicIcon from '@mui/icons-material/Mic';
import { loadMaharashtraData } from '../data/parseMahaCsv';
import { useLanguage, translations } from '../context/LanguageContext';

const HomePage = () => {
  // Maharashtra is the only state
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [districts, setDistricts] = useState([]);
  const [, setUserLocation] = useState(null); // Unused variable prefixed with underscore
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const navigate = useNavigate();
  const { language } = useLanguage();
  const text = translations.homePage[language];

  // Load real Maharashtra districts from CSV data
  useEffect(() => {
    let isMounted = true;
    const loadDistricts = async () => {
      try {
        const data = await loadMaharashtraData();
        // Extract unique, cleaned district names (strings only)
        const districtNames = Array.from(
          new Set(
            (Array.isArray(data) ? data : [])
              .map(item => (typeof item?.districtName === 'string' ? item.districtName.trim() : ''))
              .filter(name => name && name.length > 0)
          )
        ).sort((a, b) => a.localeCompare(b));
        if (isMounted) {
          setDistricts(districtNames);
        }
      } catch (error) {
        console.error("Error loading district data:", error);
      }
    };
    
    loadDistricts();
    return () => { isMounted = false; };
  }, []);

  // Function to detect user's location
  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert(text.browserError);
      return;
    }

    import('../services/geolocationService').then(module => {
      const geolocationService = module.default;
      setUserLocation({ loading: true });
      
      geolocationService.getCurrentPosition()
        .then(coordinates => {
          console.log('GPS Coordinates:', coordinates);
          setUserLocation(coordinates);
          const location = geolocationService.findNearestDistrict(coordinates);
          console.log('Nearest district found:', location);
          
          if (location.district) {
            // Find matching district (case-insensitive)
            const matchedDistrict = districts.find(
              d => d.toUpperCase() === location.district.toUpperCase()
            );
            
            if (matchedDistrict) {
              setSelectedDistrict(matchedDistrict);
              const message = `📍 Location Detected:\n\n` +
                `District: ${matchedDistrict}, Maharashtra\n\n` +
                `Your GPS Coordinates:\n` +
                `Latitude: ${coordinates.lat.toFixed(4)}°\n` +
                `Longitude: ${coordinates.lng.toFixed(4)}°\n\n` +
                `Note: If this seems incorrect, your browser may be using approximate location (IP-based). ` +
                `For accurate detection, enable "Precise Location" in browser settings.`;
              alert(message);
            } else {
              alert(text.locationError);
            }
          } else {
            alert(text.locationError);
          }
        })
        .catch(error => {
          console.error("Error getting location:", error);
          if (error.code === 1) {
            alert("Location access denied. Please enable location permissions in your browser settings.");
          } else {
            alert(text.locationError);
          }
          setUserLocation(null);
        });
    }).catch(error => {
      console.error("Error importing geolocation service:", error);
      alert(text.locationError);
    });
  };

  const handleViewData = () => {
    if (selectedDistrict) {
      localStorage.setItem('selectedDistrict', selectedDistrict);
      // Navigate to data view
      // navigate('/data-view');
    }
  };

  const handleVoiceInput = () => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setVoiceError(language === 'hindi' 
        ? 'आपका ब्राउज़र वॉयस इनपुट का समर्थन नहीं करता'
        : 'Your browser does not support voice input');
      setTimeout(() => setVoiceError(''), 3000);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'hindi' ? 'hi-IN' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true; // Show interim results
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceError(language === 'hindi' 
        ? '🎤 बोलें... सुन रहा हूं'
        : '🎤 Listening... Speak now');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('Voice input:', transcript);
      
      // Try to match the spoken text with district names
      const spokenText = transcript.toLowerCase().trim();
      const matchedDistrict = districts.find(d => 
        d.toLowerCase().includes(spokenText) || 
        spokenText.includes(d.toLowerCase())
      );

      if (matchedDistrict) {
        setSelectedDistrict(matchedDistrict);
        setVoiceError(language === 'hindi' 
          ? `✓ ${matchedDistrict} चुना गया`
          : `✓ ${matchedDistrict} selected`);
      } else {
        setSelectedDistrict(transcript);
        setVoiceError(language === 'hindi' 
          ? `आपने कहा: "${transcript}"`
          : `You said: "${transcript}"`);
      }
      
      setTimeout(() => setVoiceError(''), 3000);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      
      // Don't show error for common/expected issues
      if (event.error === 'no-speech') {
        console.log('Voice input: No speech detected (user did not speak)');
        setVoiceError(language === 'hindi' 
          ? '⚠️ कोई आवाज़ नहीं सुनी गई। कृपया पुनः प्रयास करें।'
          : '⚠️ No speech heard. Please try again and speak clearly.');
        setTimeout(() => setVoiceError(''), 4000);
        return;
      }
      
      if (event.error === 'aborted') {
        console.log('Voice input: Aborted by user');
        return;
      }
      
      console.warn('Speech recognition error:', event.error);
      
      let errorMsg = '';
      if (event.error === 'not-allowed') {
        errorMsg = language === 'hindi' 
          ? '❌ माइक्रोफ़ोन की अनुमति नहीं। ब्राउज़र सेटिंग्स जांचें।' 
          : '❌ Microphone permission denied. Check browser settings.';
      } else if (event.error === 'audio-capture') {
        errorMsg = language === 'hindi' 
          ? '❌ माइक्रोफ़ोन नहीं मिला। कृपया माइक कनेक्ट करें।' 
          : '❌ No microphone found. Please connect a microphone.';
      } else if (event.error === 'network') {
        errorMsg = language === 'hindi' ? '❌ नेटवर्क त्रुटि' : '❌ Network error';
      } else {
        errorMsg = language === 'hindi' 
          ? `⚠️ त्रुटि: ${event.error}` 
          : `⚠️ Error: ${event.error}`;
      }
      
      setVoiceError(errorMsg);
      setTimeout(() => setVoiceError(''), 5000);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #b3e5fc 0%, #e1bee7 100%)',
      py: { xs: 2, sm: 4 },
      opacity: 1,
      willChange: 'auto'
    }}>
      <Container 
        maxWidth="lg" 
        sx={{ 
          px: { xs: 2, sm: 3 },
          position: 'relative'
        }}
      >
      {/* Decorative elements */}
      <Box 
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0)} 70%)`,
          zIndex: -1,
          display: { xs: 'none', md: 'block' }
        }}
      />
      
      <Box>
        <Paper 
          elevation={4} 
          sx={{ 
            p: { xs: 2, sm: 2.5, md: 3 }, 
            borderRadius: 5, 
            mb: { xs: 2, sm: 3 },
            background: 'linear-gradient(180deg, #FFFFFF 0%, #E0F2F1 100%)',
            border: '1px solid rgba(0,137,123,0.12)',
            boxShadow: '0 10px 30px rgba(0,137,123,0.12)',
            position: 'relative',
            overflow: 'hidden',
            opacity: 1,
            visibility: 'visible',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
            }
          }}
        >
          <Box sx={{ pt: 0 }}>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom 
              align="center" 
              sx={{ 
                fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
                fontWeight: 700,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
                mt: 0,
                lineHeight: 1.2
              }}
            >
              {text.mainTitle}
            </Typography>
            <Typography 
              variant="h5" 
              component="h2" 
              gutterBottom 
              align="center"
              sx={{ 
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                fontWeight: 500,
                color: 'text.secondary',
                mb: 2
              }}
            >
              {text.subtitle}
            </Typography>
          </Box>
          
          <Box>
            <Box sx={{ 
              mt: { xs: 1.5, sm: 2.5 }, 
              mb: 2,
              '& > * + *': { mt: 2 }
            }}>
              <Typography 
                variant="body1" 
                align="center"
                sx={{ 
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  lineHeight: 1.7,
                  color: 'text.primary',
                  maxWidth: '800px',
                  mx: 'auto',
                  '&:not(:last-child)': {
                    mb: 2
                  }
                }}
              >
                {text.description1}
              </Typography>
              <Typography 
                variant="body1" 
                align="center"
                sx={{ 
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  lineHeight: 1.7,
                  color: 'text.primary',
                  maxWidth: '800px',
                  mx: 'auto',
                  fontWeight: 500
                }}
              >
                {text.description2}
              </Typography>
            </Box>
          </Box>
        
          {/* District Selection */}
          <Box>
            <Box sx={{ 
              mt: 3, 
              mb: 1.5,
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2
            }}>
              <Box sx={{ 
                width: '100%', 
                maxWidth: 700,
                position: 'relative',
                bgcolor: alpha(theme.palette.primary.main, 0.02),
                p: { xs: 1, sm: 1.5 },
                borderRadius: 3,
                border: '1px solid #b2dfdb',
                '& .MuiAutocomplete-root': {
                  width: '100%',
                },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  boxShadow: '0 6px 20px rgba(0,0,0,0.10)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 10px 28px rgba(0,0,0,0.12)'
                  },
                  '&.Mui-focused': {
                    boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.18)}`
                  }
                },
                '& .MuiInputLabel-root': {
                  color: 'text.secondary',
                  fontWeight: 500,
                  transform: 'translate(14px, 16px) scale(1)',
                  '&.MuiInputLabel-shrink': {
                    transform: 'translate(14px, -9px) scale(0.85)',
                  }
                },
                '& .MuiOutlinedInput-input': {
                  fontSize: '1rem',
                  padding: '14px 16px',
                  [theme.breakpoints.up('sm')]: {
                    fontSize: '1.05rem',
                    padding: '16px 20px',
                  }
                }
              }}>
                <Autocomplete
                  options={districts}
                  value={selectedDistrict || null}
                  onChange={(e, val) => setSelectedDistrict(val || '')}
                  onInputChange={(e, val, reason) => {
                    if (reason === 'input') {
                      const exact = districts.find(d => d.toLowerCase() === (val || '').toLowerCase());
                      if (exact) setSelectedDistrict(exact);
                    }
                  }}
                  filterSelectedOptions
                  ListboxProps={{
                    style: {
                      maxHeight: '280px',
                      fontSize: '1rem',
                      padding: '8px 0'
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={text.districtSelect}
                      placeholder={language === 'hindi' ? 'जिले का नाम टाइप करें या बोलें...' : 'Type or speak district name...'}
                      variant="outlined"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const inputVal = e.currentTarget.value || selectedDistrict;
                          const match = districts.find(d => d.toLowerCase() === (inputVal || '').toLowerCase());
                          if (match) {
                            setSelectedDistrict(match);
                            handleViewData();
                          }
                        }
                      }}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {params.InputProps.endAdornment}
                            <Box
                              component="button"
                              type="button"
                              onClick={handleVoiceInput}
                              disabled={isListening}
                              sx={{
                                border: 'none',
                                background: 'transparent',
                                cursor: isListening ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                p: 1,
                                mr: -1,
                                borderRadius: '50%',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  bgcolor: !isListening ? alpha(theme.palette.primary.main, 0.1) : 'transparent'
                                },
                                '&:active': {
                                  transform: !isListening ? 'scale(0.95)' : 'none'
                                }
                              }}
                            >
                              {isListening ? (
                                <MicIcon 
                                  sx={{ 
                                    color: 'error.main',
                                    fontSize: 28,
                                    animation: 'pulse 1.5s ease-in-out infinite',
                                    '@keyframes pulse': {
                                      '0%, 100%': { opacity: 1 },
                                      '50%': { opacity: 0.5 }
                                    }
                                  }} 
                                />
                              ) : (
                                <MicIcon 
                                  sx={{ 
                                    color: theme.palette.primary.main,
                                    fontSize: 28,
                                    '&:hover': {
                                      color: theme.palette.primary.dark
                                    }
                                  }} 
                                />
                              )}
                            </Box>
                          </>
                        ),
                      }}
                    />
                  )}
                />
                {voiceError && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: voiceError.startsWith('✓') 
                        ? alpha(theme.palette.success.main, 0.1)
                        : voiceError.startsWith('🎤')
                        ? alpha(theme.palette.info.main, 0.1)
                        : alpha(theme.palette.warning.main, 0.1),
                      border: `2px solid ${
                        voiceError.startsWith('✓') 
                          ? theme.palette.success.main
                          : voiceError.startsWith('🎤')
                          ? theme.palette.info.main
                          : theme.palette.warning.main
                      }`
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        textAlign: 'center',
                        color: voiceError.startsWith('✓') 
                          ? 'success.main'
                          : voiceError.startsWith('🎤')
                          ? 'info.main'
                          : 'warning.main',
                        fontWeight: 600,
                        fontSize: '1rem'
                      }}
                    >
                      {voiceError}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box 
            sx={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 16,
              marginTop: { xs: 2, sm: 3 },
              width: '100%',
              flexWrap: 'wrap'
            }}
          >
            <Button 
              variant="contained" 
              onClick={handleViewData}
              disabled={!selectedDistrict}
              size="large"
              sx={{
                minWidth: { xs: '100%', sm: 240 },
                py: 1.75,
                px: 4,
                borderRadius: 3,
                fontSize: '1.05rem',
                fontWeight: 600,
                textTransform: 'none',
                background: selectedDistrict ? '#00897b' : `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                boxShadow: '0 4px 14px rgba(25, 118, 210, 0.4)',
                '&:hover': {
                  background: selectedDistrict ? '#00695c' : `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.dark})`,
                  boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)'
                },
                '&.Mui-disabled': {
                  background: theme.palette.action.disabledBackground,
                  color: theme.palette.action.disabled,
                  boxShadow: 'none'
                }
              }}
            >
              {text.viewData || 'View Information'}
            </Button>
            
            <Button 
              variant="outlined"
              color="primary"
              startIcon={<LocationOnIcon />}
              size="large"
              onClick={detectLocation}
              sx={{
                minWidth: { xs: '100%', sm: 240 },
                py: 1.75,
                px: 4,
                borderRadius: 3,
                fontSize: '1.05rem',
                fontWeight: 600,
                textTransform: 'none',
                borderWidth: 2,
                borderColor: '#00796b',
                color: '#00796b',
                '&:hover': {
                  borderWidth: 2,
                  backgroundColor: alpha('#00796b', 0.08),
                  borderColor: '#00695c',
                  color: '#00695c',
                  boxShadow: '0 0 15px rgba(0,121,107,0.5)'
                },
                '& .MuiButton-startIcon': {
                  marginRight: 1
                }
              }}
            >
              {text.detectLocation}
            </Button>
          </Box>
        </Paper>
      </Box>
      
      {/* MGNREGA Workers Image Gallery */}
      <Box sx={{ mb: { xs: 4, sm: 5 }, px: { xs: 0, sm: 2 } }}>
        <Typography 
          variant="h4" 
          align="center"
          sx={{
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
            fontWeight: 700,
            mb: { xs: 3, sm: 4 },
            color: theme.palette.primary.main
          }}
        >
          {language === 'hindi' ? 'मनरेगा में काम करते लोग' : 'MGNREGA Workers in Action'}
        </Typography>
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Box
              sx={{
                overflow: 'hidden',
                height: { xs: 220, sm: 260, md: 280 },
                position: 'relative',
                boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.2)'
                }
              }}
            >
              <img
                src="/images/mgnrega-worker-1.png"
                alt="MGNREGA workers at construction site"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              <Box sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.3))',
                p: { xs: 1.5, sm: 2 }
              }}>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 700, fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
                  {language === 'hindi' ? 'सड़क निर्माण कार्य' : 'Road Construction Work'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box
              sx={{
                overflow: 'hidden',
                height: { xs: 220, sm: 260, md: 280 },
                position: 'relative',
                boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.2)'
                }
              }}
            >
              <img
                src="/images/mgnrega-worker-2.png"
                alt="MGNREGA women workers"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              <Box sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.3))',
                p: { xs: 1.5, sm: 2 }
              }}>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 700, fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
                  {language === 'hindi' ? 'जल संरक्षण कार्य' : 'Water Conservation Work'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box
              sx={{
                overflow: 'hidden',
                height: { xs: 220, sm: 260, md: 280 },
                position: 'relative',
                boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.2)'
                }
              }}
            >
              <img
                src="/images/mgnrega-worker-3.png"
                alt="MGNREGA road construction work"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              <Box sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.3))',
                p: { xs: 1.5, sm: 2 }
              }}>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 700, fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
                  {language === 'hindi' ? 'ग्रामीण विकास कार्य' : 'Rural Development Work'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box
              sx={{
                overflow: 'hidden',
                height: { xs: 220, sm: 260, md: 280 },
                position: 'relative',
                boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.2)'
                }
              }}
            >
              <img
                src="/images/mgnrega-worker-4.png"
                alt="MGNREGA canal construction work"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              <Box sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.3))',
                p: { xs: 1.5, sm: 2 }
              }}>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 700, fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
                  {language === 'hindi' ? 'नहर निर्माण कार्य' : 'Canal Construction Work'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box
              sx={{
                overflow: 'hidden',
                height: { xs: 220, sm: 260, md: 280 },
                position: 'relative',
                boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.2)'
                }
              }}
            >
              <img
                src="/images/mgnrega-worker-5.png"
                alt="MGNREGA field work"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              <Box sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.3))',
                p: { xs: 1.5, sm: 2 }
              }}>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 700, fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
                  {language === 'hindi' ? 'कृषि विकास कार्य' : 'Agricultural Development Work'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box
              sx={{
                overflow: 'hidden',
                height: { xs: 220, sm: 260, md: 280 },
                position: 'relative',
                boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.2)'
                }
              }}
            >
              <img
                src="/images/mgnrega-worker-6.png"
                alt="MGNREGA worker with job card"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              <Box sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.3))',
                p: { xs: 1.5, sm: 2 }
              }}>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 700, fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
                  {language === 'hindi' ? 'जॉब कार्ड धारक' : 'Job Card Holder'}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
      
      {/* Apply for Job CTA */}
      <Box sx={{ mb: { xs: 3, sm: 4 }, textAlign: 'center' }}>
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            color: 'white',
            maxWidth: 800,
            margin: '0 auto',
            boxShadow: '0 10px 30px rgba(25,118,210,0.3)'
          }}
        >
          <WorkIcon sx={{ fontSize: { xs: 48, sm: 60 }, mb: 2 }} />
          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
              fontWeight: 700,
              mb: 2
            }}
          >
            {language === 'hindi' ? 'रोजगार के लिए आवेदन करें' : 'Apply for Employment'}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '0.95rem', sm: '1.05rem' },
              mb: 3,
              opacity: 0.95
            }}
          >
            {language === 'hindi' 
              ? 'मनरेगा के तहत स्थानीय नौकरी के अवसरों के लिए अभी पंजीकरण करें'
              : 'Register now for local job opportunities under MGNREGA'}
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/job-application')}
            startIcon={<WorkIcon />}
            sx={{
              py: 1.75,
              px: 4,
              borderRadius: 3,
              fontSize: '1.1rem',
              fontWeight: 600,
              textTransform: 'none',
              background: 'white',
              color: theme.palette.primary.main,
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
              '&:hover': {
                background: 'rgba(255,255,255,0.95)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {language === 'hindi' ? 'आवेदन पत्र भरें' : 'Fill Application Form'}
          </Button>
        </Paper>
      </Box>
      
      {/* Job Opportunities and Training */}
      <Box sx={{ mb: { xs: 4, sm: 5 } }}>
        <Grid container spacing={{ xs: 2, sm: 3 }} justifyContent="center">
          <Grid item xs={12} sm={6} md={5}>
            <Paper
              elevation={4}
              sx={{
                p: 4,
                borderRadius: 4,
                background: 'linear-gradient(135deg, #00897B 0%, #4DB6AC 100%)',
                color: 'white',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0 8px 20px rgba(0,137,123,0.25)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 30px rgba(0,137,123,0.35)'
                }
              }}
              onClick={() => navigate('/job-opportunities')}
            >
              <WorkIcon sx={{ fontSize: { xs: 40, sm: 50 }, mb: 1.5 }} />
              <Typography
                variant="h5"
                sx={{
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                  fontWeight: 700,
                  mb: 1
                }}
              >
                {language === 'hindi' ? 'नौकरी के अवसर देखें' : 'View Job Opportunities'}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: '0.85rem', sm: '0.95rem' },
                  opacity: 0.95
                }}
              >
                {language === 'hindi' 
                  ? 'स्थानीय रोजगार के अवसर ब्राउज़ करें'
                  : 'Browse local employment opportunities'}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={5}>
            <Paper
              elevation={4}
              sx={{
                p: 4,
                borderRadius: 4,
                background: 'linear-gradient(135deg, #7E57C2 0%, #9575CD 100%)',
                color: 'white',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0 8px 20px rgba(126,87,194,0.25)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 30px rgba(126,87,194,0.35)'
                }
              }}
              onClick={() => navigate('/training-programs')}
            >
              <SchoolIcon sx={{ fontSize: { xs: 40, sm: 50 }, mb: 1.5 }} />
              <Typography
                variant="h5"
                sx={{
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                  fontWeight: 700,
                  mb: 1
                }}
              >
                {language === 'hindi' ? 'प्रशिक्षण कार्यक्रम देखें' : 'View Training Programs'}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: '0.85rem', sm: '0.95rem' },
                  opacity: 0.95
                }}
              >
                {language === 'hindi' 
                  ? 'कौशल विकास के अवसर खोजें'
                  : 'Explore skill development opportunities'}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={5}>
            <Paper
              elevation={4}
              sx={{
                p: 4,
                borderRadius: 4,
                background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
                color: 'white',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0 8px 20px rgba(76,175,80,0.25)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 30px rgba(76,175,80,0.35)'
                }
              }}
              onClick={() => navigate('/success-stories')}
            >
              <CampaignIcon sx={{ fontSize: { xs: 40, sm: 50 }, mb: 1.5 }} />
              <Typography
                variant="h5"
                sx={{
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                  fontWeight: 700,
                  mb: 1
                }}
              >
                {language === 'hindi' ? 'सफलता की कहानियां' : 'Success Stories'}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: '0.85rem', sm: '0.95rem' },
                  opacity: 0.95
                }}
              >
                {language === 'hindi' 
                  ? 'प्रेरक सफलता की कहानियां पढ़ें'
                  : 'Read inspiring success stories'}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={5}>
            <Paper
              elevation={4}
              sx={{
                p: 4,
                borderRadius: 4,
                background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
                color: 'white',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0 8px 20px rgba(255,152,0,0.25)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 30px rgba(255,152,0,0.35)'
                }
              }}
              onClick={() => navigate('/complaint-form')}
            >
              <FeedbackIcon sx={{ fontSize: { xs: 40, sm: 50 }, mb: 1.5 }} />
              <Typography
                variant="h5"
                sx={{
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                  fontWeight: 700,
                  mb: 1
                }}
              >
                {language === 'hindi' ? 'शिकायत दर्ज करें' : 'Submit Complaint'}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: '0.85rem', sm: '0.95rem' },
                  opacity: 0.95
                }}
              >
                {language === 'hindi' 
                  ? 'अपनी शिकायत या प्रतिक्रिया साझा करें'
                  : 'Share your complaints or feedback'}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      
      {/* Feature Cards */}
      <Box>
        <Grid 
          container 
          spacing={{ xs: 2, sm: 2.5, md: 3 }} 
          sx={{ 
            mt: { xs: 1, sm: 2 },
            mb: { xs: 2, sm: 3 },
            alignItems: 'stretch'
          }}
        >
          {/* Card 1 */}
          <Grid item xs={12} md={6}>
            <Card 
              sx={{ 
                minHeight: { xs: 180, sm: 200, md: 220 },
                display: 'flex', 
                flexDirection: 'column',
                overflow: 'hidden',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease',
                background: 'rgba(255,255,255,0.9)',
                borderRadius: '12px',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                }
              }}
            >
              <Box 
                sx={{ 
                  height: 6,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  width: '100%'
                }}
              />
              <CardContent sx={{ 
                p: { xs: 2, sm: 2.5, md: 3 },
                pt: { xs: 1.5, sm: 1.5, md: 2 },
                pb: { xs: 2, sm: 2.5, md: 3 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                '&:last-child': {
                  pb: { xs: 2, sm: 2.5, md: 3 }
                }
              }}>
                <Box sx={{ 
                  width: { xs: 45, sm: 50 },
                  height: { xs: 45, sm: 50 },
                  borderRadius: '50%',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1.2,
                  color: theme.palette.primary.main
                }}>
                  <InfoIcon fontSize="large" />
                </Box>
                <Typography 
                  variant="h5" 
                  component="h3" 
                  sx={{ 
                    fontSize: { xs: '1.15rem', sm: '1.25rem' },
                    fontWeight: 700,
                    color: 'text.primary',
                    mb: 1.2,
                    lineHeight: 1.3
                  }}
                >
                  {text.whatIsMgnrega}
                </Typography>
                <Typography 
                  variant="body1"
                  sx={{ 
                    fontSize: { xs: '0.875rem', sm: '0.95rem' },
                    lineHeight: 1.55,
                    color: 'text.secondary',
                    mb: 0
                  }}
                >
                  {text.whatIsMgnregaDesc}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 2 */}
          <Grid item xs={12} md={6}>
            <Card 
              sx={{ 
                minHeight: { xs: 180, sm: 200, md: 220 },
                display: 'flex', 
                flexDirection: 'column',
                overflow: 'hidden',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease',
                background: 'rgba(255,255,255,0.9)',
                borderRadius: '12px',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                }
              }}
            >
              <Box 
                sx={{ 
                  height: 6,
                  background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.success.main})`,
                  width: '100%'
                }}
              />
              <CardContent sx={{ 
                p: { xs: 2, sm: 2.5, md: 3 },
                pt: { xs: 1.5, sm: 1.5, md: 2 },
                pb: { xs: 2, sm: 2.5, md: 3 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                '&:last-child': {
                  pb: { xs: 2, sm: 2.5, md: 3 }
                }
              }}>
                <Box sx={{ 
                  width: { xs: 45, sm: 50 },
                  height: { xs: 45, sm: 50 },
                  borderRadius: '50%',
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1.2,
                  color: theme.palette.success.main
                }}>
                  <GavelIcon fontSize="large" />
                </Box>
                <Typography 
                  variant="h5" 
                  component="h3" 
                  sx={{ 
                    fontSize: { xs: '1.15rem', sm: '1.25rem' },
                    fontWeight: 700,
                    color: 'text.primary',
                    mb: 1.2,
                    lineHeight: 1.3
                  }}
                >
                  {text.benefitsAndRights}
                </Typography>
                <Typography 
                  variant="body1"
                  sx={{ 
                    fontSize: { xs: '0.875rem', sm: '0.95rem' },
                    lineHeight: 1.55,
                    color: 'text.secondary',
                    mb: 0
                  }}
                >
                  {text.benefitsAndRightsDesc}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
    </Box>
  );
};

export default HomePage;