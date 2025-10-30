import React from 'react';
import { Box, Typography, Link as MuiLink, Container } from '@mui/material';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { language } = useLanguage();
  const currentYear = new Date().getFullYear();
  
  return (
    <Box component="footer" sx={{ bgcolor: '#f5f5f5', py: 3, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          © {currentYear} MGNREGA Information | Our Voice, Our Rights
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
          {language === 'en' ? 'Data Source:' : 'डेटा स्रोत:'} 
          <MuiLink href="https://data.gov.in" target="_blank" rel="noopener" sx={{ ml: 1 }}>
            data.gov.in
          </MuiLink>
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;