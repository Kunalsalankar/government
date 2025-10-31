import React, { useState, useEffect } from 'react';
import { 
  Snackbar, 
  Alert, 
  Button,
  Box,
  Typography 
} from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import CloseIcon from '@mui/icons-material/Close';
import { useLanguage } from '../context/LanguageContext';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Check if user has dismissed the prompt before
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setShowInstallPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showInstallPrompt) return null;

  return (
    <Snackbar
      open={showInstallPrompt}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ 
        bottom: { xs: 70, sm: 24 },
        '& .MuiSnackbarContent-root': {
          minWidth: { xs: '90vw', sm: 'auto' }
        }
      }}
    >
      <Alert
        severity="info"
        variant="filled"
        sx={{ 
          width: '100%',
          bgcolor: '#1976d2',
          color: 'white',
          '& .MuiAlert-icon': {
            color: 'white'
          }
        }}
        action={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              color="inherit"
              size="small"
              onClick={handleInstallClick}
              startIcon={<GetAppIcon />}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.3)'
                },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                px: { xs: 1, sm: 2 }
              }}
            >
              {language === 'hindi' ? 'इंस्टॉल करें' : 'Install'}
            </Button>
            <Button
              color="inherit"
              size="small"
              onClick={handleDismiss}
              sx={{ 
                minWidth: 'auto',
                p: 0.5
              }}
            >
              <CloseIcon fontSize="small" />
            </Button>
          </Box>
        }
      >
        <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
          📱 {language === 'hindi' 
            ? 'ऑफलाइन उपयोग के लिए ऐप इंस्टॉल करें!' 
            : 'Install app for offline access!'}
        </Typography>
      </Alert>
    </Snackbar>
  );
};

export default PWAInstallPrompt;
