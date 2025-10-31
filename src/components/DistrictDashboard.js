import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Container, Typography, Box, Paper, Card, CardContent, Grid,
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
    { name: text.women, value: parseFloat((districtInfo.currentMonthData?.womenParticipation || 0) / 100000) },
    { name: text.sc, value: parseFloat((districtInfo.currentMonthData?.scParticipation || 0) / 100000) },
    { name: text.st, value: parseFloat((districtInfo.currentMonthData?.stParticipation || 0) / 100000) },
    { 
      name: text.others, 
      value: parseFloat(100 - 
        ((districtInfo.currentMonthData?.womenParticipation || 0) / 100000) - 
        ((districtInfo.currentMonthData?.scParticipation || 0) / 100000) - 
        ((districtInfo.currentMonthData?.stParticipation || 0) / 100000))
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
    <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: { xs: 1.5, sm: 2 } }}>
        <Button 
          component={Link} 
          to="/" 
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          color="primary"
          size="small"
          sx={{ fontSize: { xs: '0.875rem', sm: '0.875rem' } }}
        >
          {text.backButton}
        </Button>
      </Box>
      
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 4 } }}>
        {/* Header with district name and action buttons */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          mb: 1.5
        }}>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                fontWeight: 600,
                mb: 0.5
              }}
            >
              {districtName}, {stateName}
            </Typography>
            <Typography 
              variant="subtitle1" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              {text.dashboardTitle}
            </Typography>
          </Box>
          
          {/* Action buttons - compact on mobile */}
          <Box sx={{ display: 'flex', gap: 1, ml: 1 }}>
            <ShareButton districtName={districtName} stateName={stateName} />
            <Button 
              variant="outlined" 
              color="primary"
              onClick={toggleComparison}
              size="small"
              sx={{ 
                minWidth: { xs: 'auto', sm: 'auto' },
                px: { xs: 1, sm: 2 }
              }}
            >
              <CompareArrowsIcon fontSize="small" />
              <Box component="span" sx={{ ml: { xs: 0, sm: 1 }, display: { xs: 'none', sm: 'inline' } }}>
                {showComparison ? (text.hideComparison || "Hide") : (text.showComparison || "Compare")}
              </Box>
            </Button>
          </Box>
        </Box>
        
        <Divider sx={{ my: 1.5 }} />
        
        <Grid container spacing={{ xs: 1.5, sm: 3 }} sx={{ mt: 0 }}>
          <Grid item xs={6} sm={6} md={3}>
            <Card sx={{ height: '100%', bgcolor: '#e3f2fd' }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  align="center"
                  sx={{ fontSize: { xs: '0.875rem', sm: '1.25rem' }, mb: { xs: 0.5, sm: 1 } }}
                >
                  {text.jobCardsIssued}
                </Typography>
                <Typography 
                  variant="h4" 
                  align="center" 
                  color="primary"
                  sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' }, fontWeight: 600 }}
                >
                  {districtInfo.currentMonthData.jobCardsIssued.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={6} md={3}>
            <Card sx={{ height: '100%', bgcolor: '#e8f5e9' }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  align="center"
                  sx={{ fontSize: { xs: '0.875rem', sm: '1.25rem' }, mb: { xs: 0.5, sm: 1 } }}
                >
                  {text.workersRegistered}
                </Typography>
                <Typography 
                  variant="h4" 
                  align="center" 
                  color="primary"
                  sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' }, fontWeight: 600 }}
                >
                  {districtInfo.currentMonthData.workersRegistered.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={6} md={3}>
            <Card sx={{ height: '100%', bgcolor: '#fff8e1' }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  align="center"
                  sx={{ fontSize: { xs: '0.875rem', sm: '1.25rem' }, mb: { xs: 0.5, sm: 1 } }}
                >
                  {text.householdsEmployed}
                </Typography>
                <Typography 
                  variant="h4" 
                  align="center" 
                  color="primary"
                  sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' }, fontWeight: 600 }}
                >
                  {districtInfo.currentMonthData.householdsEmployed.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={6} md={3}>
            <Card sx={{ height: '100%', bgcolor: '#ffebee' }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  align="center"
                  sx={{ fontSize: { xs: '0.875rem', sm: '1.25rem' }, mb: { xs: 0.5, sm: 1 } }}
                >
                  {text.totalExpenditure}
                </Typography>
                <Typography 
                  variant="h4" 
                  align="center" 
                  color="primary"
                  sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' }, fontWeight: 600 }}
                >
                  {(districtInfo.currentMonthData.totalExpenditure / 100).toFixed(2)} {text.crore}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
      
      <Box sx={{ mb: { xs: 2, sm: 4 } }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              minWidth: { xs: 100, sm: 120 },
              px: { xs: 1, sm: 2 }
            }
          }}
        >
          <Tab label={text.performanceTab} />
          <Tab label={text.monthlyDataTab} />
          <Tab label={text.participationTab} />
        </Tabs>
        
        <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.paper', borderRadius: 1, mt: 2 }}>
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
              <Box sx={{ 
                height: { xs: 300, sm: 350, md: 400 }, 
                minHeight: 300, 
                mt: 3, 
                width: '100%',
                position: 'relative'
              }}>
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
              <Box sx={{ 
                height: { xs: 350, sm: 400, md: 450 }, 
                minHeight: 350, 
                mt: 3, 
                width: '100%',
                position: 'relative'
              }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={participationData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius="70%"
                      innerRadius="0%"
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
      
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mt: { xs: 2, sm: 3 } }}>
        <Typography 
          variant="h6" 
          gutterBottom
          sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' }, mb: { xs: 1.5, sm: 2.5 } }}
        >
          {text.additionalInfo}
        </Typography>
        <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
          <Grid item xs={6} sm={4} md={4}>
            <Card variant="outlined" sx={{ height: '100%', bgcolor: '#fafafa' }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  {text.wageRate}
                </Typography>
                <Typography variant="h6" fontWeight={600} color="primary">
                  ₹{parseFloat(districtInfo.currentMonthData.averageWageRate).toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {text.perDay}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={4} md={4}>
            <Card variant="outlined" sx={{ height: '100%', bgcolor: '#fafafa' }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  {text.completedWorks}
                </Typography>
                <Typography variant="h6" fontWeight={600} color="primary">
                  {districtInfo.currentMonthData.completedWorks.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={4} md={4}>
            <Card variant="outlined" sx={{ height: '100%', bgcolor: '#fafafa' }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  {text.ongoingWorks}
                </Typography>
                <Typography variant="h6" fontWeight={600} color="primary">
                  {districtInfo.currentMonthData.ongoingWorks.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={4} md={4}>
            <Card variant="outlined" sx={{ height: '100%', bgcolor: '#fafafa' }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  {text.womenParticipation}
                </Typography>
                <Typography variant="h6" fontWeight={600} color="primary">
                  {(parseFloat(districtInfo.currentMonthData.womenParticipation) / 100000).toFixed(2)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={4} md={4}>
            <Card variant="outlined" sx={{ height: '100%', bgcolor: '#fafafa' }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  {text.scParticipation}
                </Typography>
                <Typography variant="h6" fontWeight={600} color="primary">
                  {(parseFloat(districtInfo.currentMonthData.scParticipation) / 100000).toFixed(2)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={4} md={4}>
            <Card variant="outlined" sx={{ height: '100%', bgcolor: '#fafafa' }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  {text.stParticipation}
                </Typography>
                <Typography variant="h6" fontWeight={600} color="primary">
                  {(parseFloat(districtInfo.currentMonthData.stParticipation) / 100000).toFixed(2)}%
                </Typography>
              </CardContent>
            </Card>
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
      
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mt: { xs: 2, sm: 4 }, bgcolor: '#f5f5f5' }}>
        <Typography 
          variant="h5" 
          gutterBottom 
          color="primary"
          sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
        >
          {text.visualExplainer || "What Do These Numbers Mean?"}
        </Typography>
        
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mt: { xs: 0.5, sm: 1 } }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', bgcolor: '#e3f2fd', border: '2px solid #2196f3' }}>
              <CardContent sx={{ p: { xs: 2, sm: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1, sm: 2 } }}>
                  <BadgeIcon 
                    sx={{ fontSize: { xs: 36, sm: 48 }, marginRight: { xs: 1.5, sm: 2 }, color: '#2196f3' }}
                  />
                  <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    {text.jobCardsExplainer || "Job Cards"}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>
                  {text.jobCardsDescription || "A job card is your official document that allows you to work under MGNREGA. Each household gets one job card."}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', bgcolor: '#e8f5e9', border: '2px solid #4caf50' }}>
              <CardContent sx={{ p: { xs: 2, sm: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1, sm: 2 } }}>
                  <GroupsIcon 
                    sx={{ fontSize: { xs: 36, sm: 48 }, marginRight: { xs: 1.5, sm: 2 }, color: '#4caf50' }}
                  />
                  <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    {text.workersExplainer || "Workers"}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>
                  {text.workersDescription || "These are people who have registered to work under MGNREGA. Multiple workers can be in one household."}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', bgcolor: '#fff8e1', border: '2px solid #ffc107' }}>
              <CardContent sx={{ p: { xs: 2, sm: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1, sm: 2 } }}>
                  <AccountBalanceWalletIcon 
                    sx={{ fontSize: { xs: 36, sm: 48 }, marginRight: { xs: 1.5, sm: 2 }, color: '#ffc107' }}
                  />
                  <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    {text.expenditureExplainer || "Money Spent"}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>
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