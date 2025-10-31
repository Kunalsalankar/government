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
        <Toolbar sx={{ 
          flexDirection: { xs: 'column', sm: 'row' },
          py: { xs: 1, sm: 0.5 },
          gap: { xs: 1, sm: 0 }
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'space-between', sm: 'flex-start' }
          }}>
            <Button 
              component={Link} 
              to="/" 
              color="inherit" 
              startIcon={<HomeIcon />}
              sx={{ 
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                minWidth: 'auto',
                px: { xs: 1, sm: 2 }
              }}
            >
              MGNREGA
            </Button>
            
            <Typography 
              variant="body2" 
              sx={{ 
                display: { xs: 'block', sm: 'none' },
                fontSize: '0.7rem'
              }}
            >
              Our Voice, Our Rights
            </Typography>
          </Box>
          
          <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }} />
          
          <Typography 
            variant="body1" 
            sx={{ 
              mr: 2,
              display: { xs: 'none', sm: 'block' }
            }}
          >
            Our Voice, Our Rights
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 1
          }}>
            <Tooltip title={language === 'hindi' ? 'सहायता' : 'Help'}>
              <IconButton 
                color="inherit" 
                onClick={() => setHelpOpen(true)}
                size="small"
              >
                <HelpOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <FormControlLabel
              control={
                <Switch 
                  checked={language === 'hindi'} 
                  onChange={toggleLanguage} 
                  color="default"
                  size="small"
                />
              }
              label={language === 'hindi' ? 'हिंदी' : 'English'}
              sx={{ 
                m: 0,
                '& .MuiFormControlLabel-label': {
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }
              }}
            />
          </Box>
        </Toolbar>
      </AppBar>
      
      <HelpResources open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
};

export default Header;