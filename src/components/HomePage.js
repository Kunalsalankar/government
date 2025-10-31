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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" color="primary.main">
          {text.mainTitle}
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom align="center">
          {text.subtitle}
        </Typography>
        <Box sx={{ mt: 4, mb: 2 }}>
          <Typography variant="body1" paragraph align="center">
            {text.description1}
          </Typography>
          <Typography variant="body1" paragraph align="center">
            {text.description2}
          </Typography>
        </Box>
        <Grid container spacing={3} justifyContent="center" sx={{ mt: 2 }}>
          {/* State dropdown removed, Maharashtra is only state */}
          <Grid item xs={12} md={8} lg={6}>
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
              sx={{ 
                width: { xs: '100%', sm: '100%', md: 480 },
                '& .MuiInputBase-root': { height: 56, fontSize: '1.05rem' },
                '& .MuiInputBase-input': { padding: '16px 14px' }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={text.districtSelect}
                  placeholder="Type to search districts"
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
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={handleViewData}
            disabled={!selectedDistrict}
          >
            {text.viewData}
          </Button>
          <Button 
            variant="outlined" 
            color="secondary" 
            size="large"
            startIcon={<LocationOnIcon />}
            onClick={detectLocation}
          >
            {text.detectLocation}
          </Button>
        </Box>
      </Paper>
      <Grid container spacing={4} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom color="primary">
                {text.whatIsMgnrega}
              </Typography>
              <Typography variant="body2">
                {text.whatIsMgnregaDesc}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom color="primary">
                {text.benefitsAndRights}
              </Typography>
              <Typography variant="body2">
                {text.benefitsAndRightsDesc}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom color="primary">
                {text.districtPerformance}
              </Typography>
              <Typography variant="body2">
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