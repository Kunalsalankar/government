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
import AssessmentIcon from '@mui/icons-material/Assessment';
import { loadMaharashtraData } from '../data/parseMahaCsv';
import { useLanguage, translations } from '../context/LanguageContext';

const HomePage = () => {
  // Maharashtra is the only state
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [districts, setDistricts] = useState([]);
  const [, setUserLocation] = useState(null); // Unused variable prefixed with underscore
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
      navigate(`/district/Maharashtra/${selectedDistrict}`);
    }
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f7ff 0%, #e3f2fd 50%, #ffffff 100%)',
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
            p: { xs: 2.5, sm: 3, md: 4 }, 
            borderRadius: 5, 
            mb: { xs: 2, sm: 3 },
            background: 'linear-gradient(180deg, #ffffff 0%, #f5f9ff 100%)',
            border: '1px solid rgba(25,118,210,0.12)',
            boxShadow: '0 10px 30px rgba(25,118,210,0.12)',
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
          <Box>
            {/* Hero banner image (abstract waves) */}
            <Box
              sx={{
                height: { xs: 140, sm: 180, md: 220 },
                mb: 3,
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(25,118,210,0.12), rgba(13,71,161,0.08))',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 400'%3E%3Cg fill='none' stroke='%231976d2' stroke-opacity='0.15' stroke-width='2'%3E%3Cpath d='M0 300 Q200 200 400 300 T800 300'/%3E%3Cpath d='M0 340 Q220 240 440 340 T880 340'/%3E%3C/g%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom 
              align="center" 
              sx={{ 
                fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
                fontWeight: 800,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
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
                mb: 3
              }}
            >
              {text.subtitle}
            </Typography>
          </Box>
          
          <Box>
            <Box sx={{ 
              mt: { xs: 2, sm: 4 }, 
              mb: 3,
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
              mt: 4, 
              mb: 2,
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
                      placeholder={language === 'hindi' ? 'जिले का नाम टाइप करें...' : 'Start typing district name...'}
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
                    />
                  )}
                />
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
              marginTop: 24,
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
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                boxShadow: '0 4px 14px rgba(25, 118, 210, 0.4)',
                '&:hover': {
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.dark})`,
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
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                '&:hover': {
                  borderWidth: 2,
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  borderColor: theme.palette.primary.dark,
                  color: theme.palette.primary.dark
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
          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: { xs: 280, sm: 300, md: 320 },
                display: 'flex', 
                flexDirection: 'column',
                borderRadius: 3,
                overflow: 'hidden',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)'
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
                p: { xs: 1.5, sm: 2, md: 2.5 },
                pt: { xs: 1.5, sm: 1.5, md: 2 },
                pb: { xs: 1.5, sm: 2, md: 2.5 },
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
                justifyContent: 'flex-start',
                '&:last-child': {
                  pb: { xs: 1.5, sm: 2, md: 2.5 }
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
                    mb: 1,
                    lineHeight: 1.3
                  }}
                >
                  {text.whatIsMgnrega}
                </Typography>
                <Typography 
                  variant="body1"
                  sx={{ 
                    fontSize: { xs: '0.875rem', sm: '0.95rem' },
                    lineHeight: 1.6,
                    color: 'text.secondary',
                    flexGrow: 1,
                    mb: 0
                  }}
                >
                  {text.whatIsMgnregaDesc}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 2 */}
          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: { xs: 280, sm: 300, md: 320 },
                display: 'flex', 
                flexDirection: 'column',
                borderRadius: 3,
                overflow: 'hidden',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)'
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
                p: { xs: 1.5, sm: 2, md: 2.5 },
                pt: { xs: 1.5, sm: 1.5, md: 2 },
                pb: { xs: 1.5, sm: 2, md: 2.5 },
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
                justifyContent: 'flex-start',
                '&:last-child': {
                  pb: { xs: 1.5, sm: 2, md: 2.5 }
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
                    mb: 1,
                    lineHeight: 1.3
                  }}
                >
                  {text.benefitsAndRights}
                </Typography>
                <Typography 
                  variant="body1"
                  sx={{ 
                    fontSize: { xs: '0.875rem', sm: '0.95rem' },
                    lineHeight: 1.6,
                    color: 'text.secondary',
                    flexGrow: 1,
                    mb: 0
                  }}
                >
                  {text.benefitsAndRightsDesc}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 3 */}
          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: { xs: 280, sm: 300, md: 320 },
                display: 'flex', 
                flexDirection: 'column',
                borderRadius: 3,
                overflow: 'hidden',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <Box 
                sx={{ 
                  height: 6,
                  background: `linear-gradient(90deg, ${theme.palette.warning.main}, ${theme.palette.error.main})`,
                  width: '100%'
                }}
              />
              <CardContent sx={{ 
                p: { xs: 1.5, sm: 2, md: 2.5 },
                pt: { xs: 1.5, sm: 1.5, md: 2 },
                pb: { xs: 1.5, sm: 2, md: 2.5 },
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
                justifyContent: 'flex-start',
                '&:last-child': {
                  pb: { xs: 1.5, sm: 2, md: 2.5 }
                }
              }}>
                <Box sx={{ 
                  width: { xs: 45, sm: 50 },
                  height: { xs: 45, sm: 50 },
                  borderRadius: '50%',
                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1.2,
                  color: theme.palette.warning.main
                }}>
                  <AssessmentIcon fontSize="large" />
                </Box>
                <Typography 
                  variant="h5" 
                  component="h3" 
                  sx={{ 
                    fontSize: { xs: '1.15rem', sm: '1.25rem' },
                    fontWeight: 700,
                    color: 'text.primary',
                    mb: 1,
                    lineHeight: 1.3
                  }}
                >
                  {text.districtPerformance}
                </Typography>
                <Typography 
                  variant="body1"
                  sx={{ 
                    fontSize: { xs: '0.875rem', sm: '0.95rem' },
                    lineHeight: 1.6,
                    color: 'text.secondary',
                    flexGrow: 1,
                    mb: 0
                  }}
                >
                  {text.districtPerformanceDesc}
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