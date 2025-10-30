import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Switch, FormControlLabel } from '@mui/material';
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import { useLanguage } from '../context/LanguageContext';

const Header = () => {
  const { language, toggleLanguage } = useLanguage();
  
  return (
    <AppBar position="static">
      <Toolbar>
        <Button 
          component={Link} 
          to="/" 
          color="inherit" 
          startIcon={<HomeIcon />}
        >
          MGNREGA Information
        </Button>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Typography variant="body1" sx={{ mr: 2 }}>
          Our Voice, Our Rights
        </Typography>
        
        <FormControlLabel
          control={
            <Switch 
              checked={language === 'en'} 
              onChange={toggleLanguage} 
              color="default" 
            />
          }
          label={language === 'en' ? 'English' : 'हिंदी'}
        />
      </Toolbar>
    </AppBar>
  );
};

export default Header;