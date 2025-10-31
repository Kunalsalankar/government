import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Container, Typography, Box, Grid, Paper, Card, CardContent, 
  Button, Tabs, Tab, CircularProgress, Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import BadgeIcon from '@mui/icons-material/Badge';
import GroupsIcon from '@mui/icons-material/Groups';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import mgnregaApi from '../services/mgnregaApi';
import { useLanguage, translations } from '../context/LanguageContext';
import DistrictComparison from './DistrictComparison';
import ShareButton from './ShareButton';

// Add this constant array after the imports and before the PerformanceIndicator component
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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

  const [compareDistricts, setCompareDistricts] = useState([]);
  const [nearbyDistricts, setNearbyDistricts] = useState([]);
  const [comparativeData, setComparativeData] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

  // Fetch district data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get district data using our API service
        const data = await mgnregaApi.getDistrictData(stateName, districtName);
        setDistrictInfo(data);
        
        // Get list of districts and pick 3 others randomly
        const allDistricts = await mgnregaApi.getDistrictList();
        const otherDistricts = Array.isArray(allDistricts) 
          ? allDistricts
              .filter(district => 
                district && 
                typeof district === 'string' && 
                district.trim() !== '' &&
                district !== districtName
              )
              .sort(() => 0.5 - Math.random())
              .slice(0, 3)
          : [];
        
        setNearbyDistricts(otherDistricts);
        setCompareDistricts([
          districtName,
          ...otherDistricts.slice(0, 2).filter(Boolean)
        ]);
      } catch (error) {
        console.error("Error fetching district data:", error);
        setNearbyDistricts([]);
        setCompareDistricts([districtName]);
      } finally {
        setLoading(false);
      }
    };
    
    if (stateName && districtName) {
      fetchData();
    }
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
  const monthlyPersonDays = (districtInfo?.historicalData || [])
    .slice()
    .reverse()
    .map(data => ({
      name: data?.month ? `${data.month.substring(0, 3)} ${data.year}` : '',
      personDays: data?.personDaysGenerated || 0,
    }));

  const participationData = districtInfo ? [
    { name: text.women, value: districtInfo.currentMonthData?.womenParticipation || 0 },
    { name: text.sc, value: districtInfo.currentMonthData?.scParticipation || 0 },
    { name: text.st, value: districtInfo.currentMonthData?.stParticipation || 0 },
    { 
      name: text.others, 
      value: 100 - 
        (districtInfo.currentMonthData?.womenParticipation || 0) - 
        (districtInfo.currentMonthData?.scParticipation || 0) - 
        (districtInfo.currentMonthData?.stParticipation || 0)
    }
  ] : [];

  // Function to toggle comparison view
  const toggleComparison = async () => {
    if (!showComparison && !comparativeData.length && stateName && compareDistricts.length) {
      try {
        const validDistricts = compareDistricts.filter(d => d && typeof d === 'string');
        const data = await mgnregaApi.getComparativeData(stateName, validDistricts);
        setComparativeData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching comparative data:", error);
      }
    }
    setShowComparison(!showComparison);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
        <Button 
          component={Link} 
          to="/" 
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          color="primary"
        >
          {text.backButton}
        </Button>
      </Box>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {districtName}, {stateName}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {text.dashboardTitle}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <ShareButton districtName={districtName} stateName={stateName} />
            <Button 
              variant="outlined" 
              color="primary"
              startIcon={<CompareArrowsIcon />}
              onClick={toggleComparison}
            >
              {showComparison ? text.hideComparison || "Hide Comparison" : text.showComparison || "Compare Districts"}
            </Button>
          </Box>
        </Box>
        
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
                  {(districtInfo.currentMonthData.totalExpenditure / 100).toFixed(2)} {text.crore}
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
      
      {showComparison && (
        <Box sx={{ mt: 4 }}>
          <DistrictComparison 
            stateName={stateName} 
            currentDistrict={districtName} 
            nearbyDistricts={nearbyDistricts} 
          />
        </Box>
      )}
      
      <Paper elevation={3} sx={{ p: 3, mt: 4, bgcolor: '#f5f5f5' }}>
        <Typography variant="h5" gutterBottom color="primary">
          {text.visualExplainer || "What Do These Numbers Mean?"}
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', bgcolor: '#e3f2fd', border: '2px solid #2196f3' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BadgeIcon 
                    sx={{ fontSize: 48, marginRight: 2, color: '#2196f3' }}
                  />
                  <Typography variant="h6">
                    {text.jobCardsExplainer || "Job Cards"}
                  </Typography>
                </Box>
                <Typography variant="body2">
                  {text.jobCardsDescription || "A job card is your official document that allows you to work under MGNREGA. Each household gets one job card."}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', bgcolor: '#e8f5e9', border: '2px solid #4caf50' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <GroupsIcon 
                    sx={{ fontSize: 48, marginRight: 2, color: '#4caf50' }}
                  />
                  <Typography variant="h6">
                    {text.workersExplainer || "Workers"}
                  </Typography>
                </Box>
                <Typography variant="body2">
                  {text.workersDescription || "These are people who have registered to work under MGNREGA. Multiple workers can be in one household."}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', bgcolor: '#fff8e1', border: '2px solid #ffc107' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccountBalanceWalletIcon 
                    sx={{ fontSize: 48, marginRight: 2, color: '#ffc107' }}
                  />
                  <Typography variant="h6">
                    {text.expenditureExplainer || "Money Spent"}
                  </Typography>
                </Box>
                <Typography variant="body2">
                  {text.expenditureDescription || "This is the total amount of money spent on wages and materials for MGNREGA work in your district."}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default DistrictDashboard;