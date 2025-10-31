import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useLanguage } from '../context/LanguageContext';

// Icons
import CallIcon from '@mui/icons-material/Call';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

const EmergencyContacts = () => {
  const { language } = useLanguage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Contact data with icons and translations
  const contacts = [
    {
      id: 1,
      name: language === 'hindi' ? 'स्थानीय कार्यालय' : 'Local Office',
      number: '1800110707',
      icon: <HomeWorkIcon fontSize="large" />,
      color: '#1976d2'
    },
    {
      id: 2,
      name: language === 'hindi' ? 'शिकायत हेल्पलाइन' : 'Grievance Helpline',
      number: '18003450024',
      icon: <SupportAgentIcon fontSize="large" />,
      color: '#d32f2f'
    },
    {
      id: 3,
      name: language === 'hindi' ? 'नजदीकी बैंक' : 'Nearest Bank',
      number: '18004253800',
      icon: <AccountBalanceIcon fontSize="large" />,
      color: '#2e7d32'
    },
    {
      id: 4,
      name: language === 'hindi' ? 'कार्य स्थल पर्यवेक्षक' : 'Work Supervisor',
      number: '18001801511',
      icon: <SupervisorAccountIcon fontSize="large" />,
      color: '#ed6c02'
    }
  ];

  const handleCall = (number) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: { xs: 2, sm: 3 }, 
        mt: 3,
        borderRadius: 2,
        background: 'linear-gradient(145deg, #f5f5f5, #ffffff)',
      }}
    >
      <Typography 
        variant="h6" 
        gutterBottom 
        sx={{ 
          fontWeight: 600,
          color: theme.palette.primary.main,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 2,
          fontSize: { xs: '1.1rem', sm: '1.25rem' }
        }}
      >
        <CallIcon />
        {language === 'hindi' ? 'जरूरी संपर्क' : 'Emergency Contacts'}
      </Typography>
      
      <Grid container spacing={2}>
        {contacts.map((contact) => (
          <Grid item xs={12} sm={6} key={contact.id}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => handleCall(contact.number)}
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 2,
                textTransform: 'none',
                borderColor: 'rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                minHeight: 120,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: 3,
                  borderColor: contact.color,
                  background: `${contact.color}08`
                }
              }}
            >
              <Box 
                sx={{ 
                  color: contact.color,
                  mb: 1,
                  fontSize: { xs: '2rem', sm: '2.5rem' },
                  lineHeight: 1
                }}
              >
                {contact.icon}
              </Box>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 600, 
                  color: 'text.primary',
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  mb: 0.5
                }}
              >
                {contact.name}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  fontFamily: 'monospace',
                  mt: 'auto',
                  pt: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                <CallIcon sx={{ fontSize: '1rem', color: contact.color }} />
                {contact.number}
              </Typography>
            </Button>
          </Grid>
        ))}
      </Grid>
      
      <Typography 
        variant="caption" 
        sx={{ 
          display: 'block', 
          mt: 2, 
          textAlign: 'center',
          color: 'text.secondary',
          fontSize: '0.7rem'
        }}
      >
        {language === 'hindi' 
          ? 'कॉल करने के लिए बटन दबाएं (टोल-फ्री)' 
          : 'Tap to call (Toll-free)'}
      </Typography>
    </Paper>
  );
};

export default EmergencyContacts;
