import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Switch, FormControlLabel, IconButton, Tooltip } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import { useLanguage } from '../context/LanguageContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import HelpResources from './HelpResources';

const Header = () => {
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const [helpOpen, setHelpOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setIsLoggedIn(!!role);
    setUserRole(role);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('userRole');
      localStorage.removeItem('userEmail');
      setIsLoggedIn(false);
      setUserRole(null);
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };
  
  return (
    <>
      <AppBar position="static" sx={{ background: 'linear-gradient(90deg, #00897B 0%, #4FC3F7 100%)' }}>
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

            {isLoggedIn ? (
              <>
                {userRole === 'admin' && (
                  <Button
                    component={Link}
                    to="/admin-dashboard"
                    color="inherit"
                    size="small"
                    sx={{ 
                      fontSize: { xs: '0.7rem', sm: '0.8rem' },
                      textTransform: 'none',
                      display: { xs: 'none', sm: 'inline-flex' }
                    }}
                  >
                    {language === 'hindi' ? 'डैशबोर्ड' : 'Dashboard'}
                  </Button>
                )}
                <IconButton
                  color="inherit"
                  onClick={handleLogout}
                  size="small"
                  title={language === 'hindi' ? 'लॉगआउट' : 'Logout'}
                >
                  <LogoutIcon fontSize="small" />
                </IconButton>
              </>
            ) : (
              <IconButton
                component={Link}
                to="/login"
                color="inherit"
                size="small"
                title={language === 'hindi' ? 'लॉगिन' : 'Login'}
              >
                <LoginIcon fontSize="small" />
              </IconButton>
            )}
            
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