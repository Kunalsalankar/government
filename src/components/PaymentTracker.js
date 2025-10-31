import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Divider
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  CheckCircle as CheckIcon,
  HourglassEmpty as PendingIcon,
  Error as ErrorIcon,
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material';
import { useLanguage, translations } from '../context/LanguageContext';

const PaymentTracker = () => {
  const { language } = useLanguage();
  const text = translations.dashboard[language];
  
  const [jobCardNumber, setJobCardNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState('');

  // Simulated payment data (in production, this would come from API)
  const simulatePaymentCheck = (cardNumber) => {
    setLoading(true);
    setError('');
    
    setTimeout(() => {
      // Validate job card number format
      if (cardNumber.length < 10) {
        setError(language === 'hindi' ? 'कृपया सही जॉब कार्ड नंबर दर्ज करें' : 'Please enter a valid job card number');
        setPaymentData(null);
        setLoading(false);
        return;
      }

      // Simulated data
      const mockData = {
        cardNumber: cardNumber,
        holderName: 'राजेश कुमार',
        districtName: 'Pune',
        totalDaysWorked: 67,
        totalEarnings: 18905,
        lastPaymentDate: '2025-10-15',
        lastPaymentAmount: 2835,
        pendingAmount: 945,
        nextPaymentDate: '2025-11-05',
        status: 'Processed',
        payments: [
          { date: '2025-10-15', amount: 2835, days: 15, status: 'Paid' },
          { date: '2025-09-20', amount: 3780, days: 20, status: 'Paid' },
          { date: '2025-08-18', amount: 2520, days: 14, status: 'Paid' },
          { date: '2025-07-22', amount: 4095, days: 21, status: 'Paid' },
        ],
        currentStatus: {
          step: 2,
          steps: ['Work Recorded', 'Payment Approved', 'Payment Processing', 'Payment Complete']
        }
      };

      setPaymentData(mockData);
      setLoading(false);
    }, 1500);
  };

  const handleSearch = () => {
    if (!jobCardNumber.trim()) {
      setError(language === 'hindi' ? 'कृपया जॉब कार्ड नंबर दर्ज करें' : 'Please enter job card number');
      return;
    }
    simulatePaymentCheck(jobCardNumber);
  };

  const getStatusColor = (status) => {
    if (status === 'Paid') return 'success';
    if (status === 'Processed') return 'info';
    if (status === 'Pending') return 'warning';
    return 'error';
  };

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <WalletIcon sx={{ fontSize: { xs: 30, sm: 40 }, color: 'primary.main', mr: 1.5 }} />
          <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, fontWeight: 600 }}>
            {language === 'hindi' ? '💰 भुगतान ट्रैकर' : '💰 Payment Tracker'}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
          {language === 'hindi' 
            ? 'अपने MGNREGA भुगतान की स्थिति जांचें' 
            : 'Check your MGNREGA payment status'}
        </Typography>
      </Box>

      {/* Search Box */}
      <Card variant="outlined" sx={{ mb: 3, bgcolor: '#f8f9fa' }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            <TextField
              fullWidth
              label={language === 'hindi' ? 'जॉब कार्ड नंबर' : 'Job Card Number'}
              placeholder="MH-01-001-001-012345"
              value={jobCardNumber}
              onChange={(e) => setJobCardNumber(e.target.value)}
              variant="outlined"
              size="small"
              sx={{ flex: 1 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearch}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
              sx={{ 
                minWidth: { xs: '100%', sm: 140 },
                height: { xs: 45, sm: 40 }
              }}
            >
              {loading ? (language === 'hindi' ? 'खोज रहे हैं...' : 'Searching...') : (language === 'hindi' ? 'खोजें' : 'Search')}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Payment Data */}
      {paymentData && (
        <>
          {/* Header Info Card */}
          <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    {language === 'hindi' ? 'कार्डधारक' : 'Card Holder'}
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    {paymentData.holderName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    {language === 'hindi' ? 'जॉब कार्ड नंबर' : 'Job Card Number'}
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    {paymentData.cardNumber}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={3}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', p: { xs: 1.5, sm: 2 } }}>
                  <CalendarIcon sx={{ fontSize: { xs: 30, sm: 40 }, color: '#2196f3', mb: 1 }} />
                  <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, fontWeight: 600, color: 'primary.main' }}>
                    {paymentData.totalDaysWorked}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                    {language === 'hindi' ? 'कुल दिन' : 'Total Days'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', p: { xs: 1.5, sm: 2 } }}>
                  <TrendingIcon sx={{ fontSize: { xs: 30, sm: 40 }, color: '#4caf50', mb: 1 }} />
                  <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, fontWeight: 600, color: 'primary.main' }}>
                    ₹{paymentData.totalEarnings.toLocaleString('en-IN')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                    {language === 'hindi' ? 'कुल कमाई' : 'Total Earned'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', p: { xs: 1.5, sm: 2 } }}>
                  <CheckIcon sx={{ fontSize: { xs: 30, sm: 40 }, color: '#4caf50', mb: 1 }} />
                  <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, fontWeight: 600, color: 'success.main' }}>
                    ₹{paymentData.lastPaymentAmount.toLocaleString('en-IN')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                    {language === 'hindi' ? 'अंतिम भुगतान' : 'Last Payment'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', p: { xs: 1.5, sm: 2 } }}>
                  <PendingIcon sx={{ fontSize: { xs: 30, sm: 40 }, color: '#ff9800', mb: 1 }} />
                  <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, fontWeight: 600, color: 'warning.main' }}>
                    ₹{paymentData.pendingAmount.toLocaleString('en-IN')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                    {language === 'hindi' ? 'लंबित' : 'Pending'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Payment Status Stepper */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 2, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                {language === 'hindi' ? '📍 भुगतान स्थिति' : '📍 Payment Status'}
              </Typography>
              <Stepper activeStep={paymentData.currentStatus.step} alternativeLabel>
                {paymentData.currentStatus.steps.map((label) => (
                  <Step key={label}>
                    <StepLabel sx={{ '& .MuiStepLabel-label': { fontSize: { xs: '0.7rem', sm: '0.875rem' } } }}>
                      {label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Chip 
                  label={`${language === 'hindi' ? 'अगला भुगतान' : 'Next Payment'}: ${paymentData.nextPaymentDate}`}
                  color="info"
                  size="small"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                />
              </Box>
            </CardContent>
          </Card>

          {/* Recent Payments */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 2, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                {language === 'hindi' ? '📜 हाल के भुगतान' : '📜 Recent Payments'}
              </Typography>
              {paymentData.payments.map((payment, index) => (
                <Box key={index}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                        ₹{payment.amount.toLocaleString('en-IN')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                        {payment.date} • {payment.days} {language === 'hindi' ? 'दिन' : 'days'}
                      </Typography>
                    </Box>
                    <Chip 
                      label={payment.status} 
                      color={getStatusColor(payment.status)} 
                      size="small"
                      sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
                    />
                  </Box>
                  {index < paymentData.payments.length - 1 && <Divider />}
                </Box>
              ))}
            </CardContent>
          </Card>

          {/* Help Section */}
          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
              {language === 'hindi' 
                ? '💡 भुगतान में देरी होने पर, कृपया 1800-345-4000 पर संपर्क करें या अपने ग्राम पंचायत कार्यालय में जाएं।'
                : '💡 For payment delays, please contact 1800-345-4000 or visit your Gram Panchayat office.'}
            </Typography>
          </Alert>
        </>
      )}

      {/* Demo Helper */}
      {!paymentData && !loading && !error && (
        <Alert severity="info">
          <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
            {language === 'hindi' 
              ? '💡 डेमो के लिए कोई भी 10+ अंकों का नंबर दर्ज करें (उदा: MH-01-001-001-012345)'
              : '💡 For demo, enter any 10+ digit number (e.g., MH-01-001-001-012345)'}
          </Typography>
        </Alert>
      )}
    </Paper>
  );
};

export default PaymentTracker;
