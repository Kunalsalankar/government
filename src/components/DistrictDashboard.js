import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Container, Typography, Box, Grid, Paper, Card, CardContent, 
  Button, Tabs, Tab, CircularProgress, Divider 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { districtData } from '../data/mockData';
import { useLanguage, translations } from '../context/LanguageContext';

// Performance indicator component with color-coded rating
const PerformanceIndicator = ({ label, value }) => {
  let color = '#f44336'; // Red for low performance
  if (value >= 4) {
    color = '#4caf50'; // Green for high performance
  } else if (value >= 3) {
    color = '#ff9800'; // Orange for medium performance
  }
  
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body1" gutterBottom>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box
          sx={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            bgcolor: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            mr: 2
          }}
        >
          {value}
        </Box>
        <Box sx={{ flexGrow: 1, height: 10, bgcolor: '#e0e0e0', borderRadius: 5 }}>
          <Box
            sx={{
              height: '100%',
              width: `${(value / 5) * 100}%`,
              bgcolor: color,
              borderRadius: 5
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

const DistrictDashboard = () => {
  const { stateName, districtName } = useParams();
  const [tabValue, setTabValue] = useState(0);
  const [districtInfo, setDistrictInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();
  const text = translations.dashboard[language];

  useEffect(() => {
    // Simulate API call with loading state
    setLoading(true);
    
    // Find district data from our mock data
    setTimeout(() => {
      const data = districtData.find(
        district => district.districtName === districtName && district.stateName === stateName
      );
      
      setDistrictInfo(data);
      setLoading(false);
    }, 1000);
  }, [stateName, districtName]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          {text.loading}
        </Typography>
      </Container>
    );
  }

  if (!districtInfo) {
    return (
      <Container sx={{ textAlign: 'center', py: 5 }}>
        <Typography variant="h5" color="error" gutterBottom>
          {text.noData}
        </Typography>
        <Button 
          component={Link} 
          to="/" 
          variant="contained" 
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          {text.backButton}
        </Button>
      </Container>
    );
  }

  // Prepare data for charts
  const monthlyPersonDays = districtInfo.historicalData.slice().reverse().map(data => ({
    name: `${data.month.substring(0, 3)} ${data.year}`,
    personDays: data.personDaysGenerated,
  }));

  const participationData = [
     { name: text.women, value: districtInfo.currentMonthData.womenParticipation },
     { name: text.sc, value: districtInfo.currentMonthData.scParticipation },
     { name: text.st, value: districtInfo.currentMonthData.stParticipation },
     { name: text.others, value: 100 - districtInfo.currentMonthData.womenParticipation - 
       districtInfo.currentMonthData.scParticipation - districtInfo.currentMonthData.stParticipation }
   ];

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
        <Button 
          component={Link} 
          to="/" 
          startIcon={<ArrowBackIcon />}
          sx={{ textTransform: 'none' }}
        >
          {text.backButton}
        </Button>
      </Box>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {districtName}, {stateName}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {text.dashboardTitle}
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', bgcolor: '#e3f2fd' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom align="center">
                  {text.jobCardsIssued}
                </Typography>
                <Typography variant="h4" align="center" color="primary">
                  {districtInfo.currentMonthData.jobCardsIssued.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', bgcolor: '#e8f5e9' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom align="center">
                  {text.workersRegistered}
                </Typography>
                <Typography variant="h4" align="center" color="primary">
                  {districtInfo.currentMonthData.workersRegistered.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', bgcolor: '#fff8e1' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom align="center">
                  {text.householdsEmployed}
                </Typography>
                <Typography variant="h4" align="center" color="primary">
                  {districtInfo.currentMonthData.householdsEmployed.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', bgcolor: '#ffebee' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom align="center">
                  {text.totalExpenditure}
                </Typography>
                <Typography variant="h4" align="center" color="primary">
                  {(districtInfo.currentMonthData.totalExpenditure / 10000000).toFixed(2)} {text.crore}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
      
      <Box sx={{ mb: 4 }}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab label={text.performanceTab} />
          <Tab label={text.monthlyDataTab} />
          <Tab label={text.participationTab} />
        </Tabs>
        
        <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 1, mt: 2 }}>
          {tabValue === 0 && (
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom align="center">
                  {text.performanceIndicators}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4}>
                    <PerformanceIndicator 
                      label={text.employmentGeneration} 
                      value={districtInfo.performanceIndicators.employmentGeneration} 
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <PerformanceIndicator 
                      label={text.wagePayment} 
                      value={districtInfo.performanceIndicators.wagePaymentEfficiency} 
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <PerformanceIndicator 
                      label={text.inclusion} 
                      value={districtInfo.performanceIndicators.inclusionOfMarginalized} 
                    />
                  </Grid>
                  <Grid item xs={6} sm={6}>
                    <PerformanceIndicator 
                      label={text.workCompletion} 
                      value={districtInfo.performanceIndicators.workCompletion} 
                    />
                  </Grid>
                  <Grid item xs={6} sm={6}>
                    <PerformanceIndicator 
                      label={text.overallPerformance} 
                      value={districtInfo.performanceIndicators.overallPerformance} 
                    />
                  </Grid>
                </Grid>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body1" paragraph align="center">
                  {text.scaleDescription}
                </Typography>
              </Grid>
            </Grid>
          )}
          
          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom align="center">
                {text.personDaysTitle}
              </Typography>
              <Box sx={{ height: 400, mt: 3 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyPersonDays}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => value.toLocaleString()} />
                    <Legend />
                    <Bar dataKey="personDays" name={text.personDays} fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
              <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                {text.personDaysDesc}
              </Typography>
            </Box>
          )}
          
          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom align="center">
                {text.participationTitle}
              </Typography>
              <Box sx={{ height: 400, mt: 3 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={participationData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {participationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {text.additionalInfo}
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" paragraph>
              <strong>{text.wageRate}:</strong> ₹{districtInfo.currentMonthData.averageWageRate} {text.perDay}
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>{text.completedWorks}:</strong> {districtInfo.currentMonthData.completedWorks}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" paragraph>
              <strong>{text.ongoingWorks}:</strong> {districtInfo.currentMonthData.ongoingWorks}
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>{text.womenParticipation}:</strong> {districtInfo.currentMonthData.womenParticipation}%
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" paragraph>
              <strong>{text.scParticipation}:</strong> {districtInfo.currentMonthData.scParticipation}%
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>{text.stParticipation}:</strong> {districtInfo.currentMonthData.stParticipation}%
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default DistrictDashboard;