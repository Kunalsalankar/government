import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Switch, FormControlLabel, IconButton, Tooltip } from '@mui/material';
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useLanguage } from '../context/LanguageContext';
import HelpResources from './HelpResources';

const Header = () => {
  const { language, toggleLanguage } = useLanguage();
  const [helpOpen, setHelpOpen] = useState(false);
  
  return (
    <>
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
          
          <Tooltip title={language === 'hindi' ? 'सहायता' : 'Help'}>
            <IconButton 
              color="inherit" 
              onClick={() => setHelpOpen(true)}
              sx={{ mr: 1 }}
            >
              <HelpOutlineIcon />
            </IconButton>
          </Tooltip>
          
          <FormControlLabel
            control={
              <Switch 
                checked={language === 'hindi'} 
                onChange={toggleLanguage} 
                color="default" 
              />
            }
            label={language === 'hindi' ? 'हिंदी' : 'English'}
          />
        </Toolbar>
      </AppBar>
      
      <HelpResources open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
};

export default Header;