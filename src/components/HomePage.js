import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent, Grid, Button, Paper, TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { useNavigate } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
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
        setDistricts(districtNames);
      } catch (error) {
        console.error("Error loading district data:", error);
      }
    };
    
    loadDistricts();
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

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 } }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: 2, mb: { xs: 2, sm: 4 } }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          align="center" 
          color="primary.main"
          sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}
        >
          {text.mainTitle}
        </Typography>
        <Typography 
          variant="h5" 
          component="h2" 
          gutterBottom 
          align="center"
          sx={{ fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' } }}
        >
          {text.subtitle}
        </Typography>
        <Box sx={{ mt: { xs: 2, sm: 4 }, mb: 2 }}>
          <Typography 
            variant="body1" 
            paragraph 
            align="center"
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            {text.description1}
          </Typography>
          <Typography 
            variant="body1" 
            paragraph 
            align="center"
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            {text.description2}
          </Typography>
        </Box>
        
        {/* District Selection */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ width: { xs: '100%', sm: '90%', md: '70%', lg: '60%' }, maxWidth: 600 }}>
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
                  maxHeight: '240px',
                  fontSize: '1rem'
                }
              }}
              sx={{ 
                width: '100%',
                '& .MuiInputBase-root': { 
                  minHeight: 56,
                  fontSize: '1rem'
                },
                '& .MuiInputLabel-root': {
                  fontSize: '1rem'
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={text.districtSelect}
                  placeholder="Start typing district name..."
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

        {/* Action Buttons */}
        <Box sx={{ 
          mt: 3, 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2,
          px: { xs: 0, sm: 2 }
        }}>
          <Button 
            variant="contained" 
            onClick={handleViewData}
            disabled={!selectedDistrict}
            size="large"
            sx={{ 
              minWidth: { xs: '100%', sm: 240 },
              py: 1.5,
              fontSize: '1rem !important',
              fontWeight: '600 !important',
              textTransform: 'none',
              color: '#ffffff !important',
              backgroundColor: '#1976d2 !important',
              '&:hover': {
                backgroundColor: '#1565c0 !important'
              },
              '&.Mui-disabled': {
                backgroundColor: '#e0e0e0 !important',
                color: '#9e9e9e !important'
              },
              '& .MuiButton-label': {
                color: '#ffffff !important'
              }
            }}
          >
            <span style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 600 }}>
              {text.viewData || 'View Information'}
            </span>
          </Button>
          
          <Grid size={{ xs: 12, sm: 6, md: 5 }}>
            <Button 
              variant="outlined" 
              color="secondary" 
              startIcon={<LocationOnIcon />}
              size="large"
              onClick={detectLocation}
              sx={{ 
                minWidth: { xs: '100%', sm: 240 },
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2
                }
              }}
            >
              {text.detectLocation}
            </Button>
          </Grid>
        </Box>
      </Paper>
      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mt: { xs: 1, sm: 2 } }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography 
                variant="h6" 
                component="h3" 
                gutterBottom 
                color="primary"
                sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
              >
                {text.whatIsMgnrega}
              </Typography>
              <Typography 
                variant="body2"
                sx={{ fontSize: { xs: '0.875rem', sm: '0.875rem' } }}
              >
                {text.whatIsMgnregaDesc}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography 
                variant="h6" 
                component="h3" 
                gutterBottom 
                color="primary"
                sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
              >
                {text.benefitsAndRights}
              </Typography>
              <Typography 
                variant="body2"
                sx={{ fontSize: { xs: '0.875rem', sm: '0.875rem' } }}
              >
                {text.benefitsAndRightsDesc}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography 
                variant="h6" 
                component="h3" 
                gutterBottom 
                color="primary"
                sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
              >
                {text.districtPerformance}
              </Typography>
              <Typography 
                variant="body2"
                sx={{ fontSize: { xs: '0.875rem', sm: '0.875rem' } }}
              >
                {text.districtPerformanceDesc}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage;