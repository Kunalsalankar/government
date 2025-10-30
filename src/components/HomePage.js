import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent, Grid, Button, FormControl, InputLabel, Select, MenuItem, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { states } from '../data/mockData';
import { useLanguage, translations } from '../context/LanguageContext';

const HomePage = () => {
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [districts, setDistricts] = useState([]);
  const [, setUserLocation] = useState(null); // Unused variable prefixed with underscore
  const navigate = useNavigate();
  const { language } = useLanguage();
  const text = translations.homePage[language];

  useEffect(() => {
    // Reset district when state changes
    setSelectedDistrict('');
    
    // Update districts based on selected state
    if (selectedState) {
      const stateData = states.find(state => state.name === selectedState);
      if (stateData) {
        setDistricts(stateData.districts);
      }
    } else {
      setDistricts([]);
    }
  }, [selectedState]);

  // Function to detect user's location
  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          // In a real app, we would use reverse geocoding to find the district
          // For demo purposes, we'll just select a random district from UP
          const randomState = states[0].name;
          const randomDistrict = states[0].districts[Math.floor(Math.random() * states[0].districts.length)];
          setSelectedState(randomState);
          setTimeout(() => setSelectedDistrict(randomDistrict), 300);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert(text.locationError);
        }
      );
    } else {
      alert(text.browserError);
    }
  };

  const handleViewData = () => {
    if (selectedState && selectedDistrict) {
      navigate(`/districts/${selectedState}/${selectedDistrict}`);
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
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="state-select-label">{text.stateSelect}</InputLabel>
              <Select
                labelId="state-select-label"
                id="state-select"
                value={selectedState}
                label={text.stateSelect}
                onChange={(e) => setSelectedState(e.target.value)}
              >
                {states.map((state) => (
                  <MenuItem key={state.id} value={state.name}>
                    {state.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth disabled={!selectedState}>
              <InputLabel id="district-select-label">{text.districtSelect}</InputLabel>
              <Select
                labelId="district-select-label"
                id="district-select"
                value={selectedDistrict}
                label={text.districtSelect}
                onChange={(e) => setSelectedDistrict(e.target.value)}
              >
                {districts.map((district) => (
                  <MenuItem key={district} value={district}>
                    {district}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={handleViewData}
            disabled={!selectedState || !selectedDistrict}
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