import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import GavelIcon from '@mui/icons-material/Gavel';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useLanguage, translations } from '../context/LanguageContext';

const HelpResources = ({ open, onClose }) => {
  const { language } = useLanguage();
  const isHindi = language === 'hindi';

  const helpSections = [
    {
      title: isHindi ? 'महत्वपूर्ण संपर्क' : 'Important Contacts',
      icon: <PhoneIcon color="primary" />,
      items: [
        {
          label: isHindi ? 'टोल-फ्री हेल्पलाइन' : 'Toll-Free Helpline',
          value: '1800-111-555 (MGNREGA)',
          action: 'tel:1800111555'
        },
        {
          label: isHindi ? 'ईमेल सहायता' : 'Email Support',
          value: 'support@mgnrega.gov.in',
          action: 'mailto:support@mgnrega.gov.in'
        }
      ]
    },
    {
      title: isHindi ? 'शिकायत दर्ज करें' : 'Lodge a Complaint',
      icon: <GavelIcon color="error" />,
      items: [
        {
          label: isHindi ? 'ऑनलाइन शिकायत' : 'Online Complaint',
          value: isHindi ? 'nrega.nic.in पर जाएं' : 'Visit nrega.nic.in',
          action: 'https://nrega.nic.in'
        },
        {
          label: isHindi ? 'शिकायत हेल्पलाइन' : 'Grievance Helpline',
          value: '1800-345-6789',
          action: 'tel:1800345  6789'
        }
      ]
    },
    {
      title: isHindi ? 'अपने अधिकार जानें' : 'Know Your Rights',
      icon: <AssignmentIcon color="success" />,
      items: [
        isHindi ? '15 दिनों के भीतर काम का अधिकार' : 'Right to work within 15 days',
        isHindi ? 'समय पर मजदूरी भुगतान' : 'Timely wage payment',
        isHindi ? 'बेरोजगारी भत्ता (यदि काम नहीं मिलता)' : 'Unemployment allowance (if work not provided)',
        isHindi ? 'कार्यस्थल पर सुविधाएं (पानी, छाया, प्राथमिक चिकित्सा)' : 'Worksite facilities (water, shade, first-aid)',
        isHindi ? 'सामाजिक लेखा परीक्षा में भागीदारी' : 'Participation in social audit'
      ]
    }
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f5f5f5' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <HelpOutlineIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h5" component="div">
            {isHindi ? 'सहायता और संसाधन' : 'Help & Resources'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ mt: 2 }}>
        {helpSections.map((section, index) => (
          <Card key={index} sx={{ mb: 3, boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {section.icon}
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {section.title}
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {Array.isArray(section.items[0]) || typeof section.items[0] === 'string' ? (
                <List dense>
                  {section.items.map((item, idx) => (
                    <ListItem key={idx}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
                      </ListItemIcon>
                      <ListItemText primary={item} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                section.items.map((item, idx) => (
                  <Box key={idx} sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {item.label}
                    </Typography>
                    {item.action ? (
                      <Button
                        variant="outlined"
                        size="small"
                        href={item.action}
                        target={item.action.startsWith('http') ? '_blank' : undefined}
                        sx={{ mt: 0.5 }}
                      >
                        {item.value}
                      </Button>
                    ) : (
                      <Typography variant="body1" fontWeight="bold">
                        {item.value}
                      </Typography>
                    )}
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        ))}
        
        <Card sx={{ bgcolor: '#e3f2fd', boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              {isHindi ? '💡 क्या आप जानते हैं?' : '💡 Did You Know?'}
            </Typography>
            <Typography variant="body2">
              {isHindi
                ? 'MGNREGA के तहत, यदि आपको आवेदन के 15 दिनों के भीतर काम नहीं मिलता है, तो आप बेरोजगारी भत्ते के हकदार हैं। अपने अधिकारों को जानें और उनका दावा करें!'
                : 'Under MGNREGA, if you are not provided work within 15 days of application, you are entitled to unemployment allowance. Know your rights and claim them!'}
            </Typography>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default HelpResources;
