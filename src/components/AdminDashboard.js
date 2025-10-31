import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  Alert,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
  Grid,
  Tabs,
  Tab
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import RefreshIcon from '@mui/icons-material/Refresh';
import WorkIcon from '@mui/icons-material/Work';
import AddIcon from '@mui/icons-material/Add';
import SchoolIcon from '@mui/icons-material/School';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const AdminDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { language } = useLanguage();
  
  const [applications, setApplications] = useState([]);
  const [trainingApplications, setTrainingApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  const text = {
    english: {
      title: 'Admin Dashboard',
      subtitle: 'Application Management',
      jobTab: 'Job Applications',
      trainingTab: 'Training Applications',
      logout: 'Logout',
      refresh: 'Refresh',
      noApplications: 'No job applications found',
      loadError: 'Failed to load applications',
      sNo: 'S.No',
      name: 'Name',
      age: 'Age',
      gender: 'Gender',
      mobile: 'Mobile',
      village: 'Village/District',
      workType: 'Work Type',
      skills: 'Skills',
      availability: 'Availability',
      submittedAt: 'Submitted At',
      male: 'Male',
      female: 'Female',
      other: 'Other',
      immediate: 'Immediate',
      withinWeek: 'Within a Week',
      later: 'Later',
      totalApplications: 'Total Applications',
      addJob: 'Add Job',
      addTraining: 'Add Training',
      manageJobs: 'Manage Jobs',
      manageTraining: 'Manage Training'
    },
    hindi: {
      title: 'प्रशासक डैशबोर्ड',
      subtitle: 'आवेदन प्रबंधन',
      jobTab: 'नौकरी आवेदन',
      trainingTab: 'प्रशिक्षण आवेदन',
      logout: 'लॉगआउट',
      refresh: 'रीफ्रेश',
      noApplications: 'कोई नौकरी आवेदन नहीं मिला',
      loadError: 'आवेदन लोड करने में विफल',
      sNo: 'क्र.सं.',
      name: 'नाम',
      age: 'आयु',
      gender: 'लिंग',
      mobile: 'मोबाइल',
      village: 'गाँव/जिला',
      workType: 'कार्य प्रकार',
      skills: 'कौशल',
      availability: 'उपलब्धता',
      submittedAt: 'जमा किया गया',
      male: 'पुरुष',
      female: 'महिला',
      other: 'अन्य',
      immediate: 'तुरंत',
      withinWeek: 'एक सप्ताह में',
      later: 'बाद में',
      totalApplications: 'कुल आवेदन',
      addJob: 'नौकरी जोड़ें',
      addTraining: 'प्रशिक्षण जोड़ें',
      manageJobs: 'नौकरियाँ प्रबंधित करें',
      manageTraining: 'प्रशिक्षण प्रबंधित करें'
    }
  };

  const t = text[language] || text.english;

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch job applications
      const jobQuery = query(collection(db, 'jobApplications'), orderBy('timestamp', 'desc'));
      const jobSnapshot = await getDocs(jobQuery);
      const jobApps = [];
      jobSnapshot.forEach((doc) => {
        jobApps.push({ id: doc.id, ...doc.data() });
      });
      setApplications(jobApps);

      // Fetch training applications
      const trainingQuery = query(collection(db, 'trainingApplications'), orderBy('timestamp', 'desc'));
      const trainingSnapshot = await getDocs(trainingQuery);
      const trainingApps = [];
      trainingSnapshot.forEach((doc) => {
        trainingApps.push({ id: doc.id, ...doc.data() });
      });
      setTrainingApplications(trainingApps);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(t.loadError);
    } finally {
      setLoading(false);
    }
  }, [t.loadError]);

  useEffect(() => {
    // Check if user is admin
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin') {
      navigate('/login');
      return;
    }
    fetchApplications();
  }, [navigate, fetchApplications]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('userRole');
      localStorage.removeItem('userEmail');
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getGenderText = (gender) => {
    if (gender === 'male') return t.male;
    if (gender === 'female') return t.female;
    if (gender === 'other') return t.other;
    return gender;
  };

  const getAvailabilityText = (availability) => {
    if (availability === 'immediate') return t.immediate;
    if (availability === 'withinWeek') return t.withinWeek;
    if (availability === 'later') return t.later;
    return availability;
  };

  const getAvailabilityColor = (availability) => {
    if (availability === 'immediate') return 'success';
    if (availability === 'withinWeek') return 'warning';
    return 'default';
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #b3e5fc 0%, #e1bee7 100%)',
      py: { xs: 3, sm: 4 }
    }}>
      <Container maxWidth="xl">
        <Paper
          elevation={6}
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: 4,
            background: 'linear-gradient(180deg, #FFFFFF 0%, #E0F2F1 100%)',
            border: '1px solid rgba(0,137,123,0.12)',
            boxShadow: '0 10px 40px rgba(0,137,123,0.15)'
          }}
        >
          {/* Header */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3,
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' },
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  mb: 0.5
                }}
              >
                {t.title}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  color: 'text.secondary'
                }}
              >
                {t.subtitle}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title={t.refresh}>
                <IconButton 
                  onClick={fetchApplications}
                  color="primary"
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.2)
                    }
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="outlined"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                {t.logout}
              </Button>
            </Box>
          </Box>

          {/* Stats */}
          <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Paper sx={{ 
              p: 2, 
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              borderRadius: 2,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1
            }}>
              <WorkIcon sx={{ color: theme.palette.primary.main }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                {t.jobTab}: {applications.length}
              </Typography>
            </Paper>
            <Paper sx={{ 
              p: 2, 
              bgcolor: alpha(theme.palette.secondary.main, 0.1),
              borderRadius: 2,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1
            }}>
              <SchoolIcon sx={{ color: theme.palette.secondary.main }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.secondary.main }}>
                {t.trainingTab}: {trainingApplications.length}
              </Typography>
            </Paper>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/admin-add-job')}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    '&:hover': {
                      background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.dark})`
                    }
                  }}
                >
                  {t.addJob}
                </Button>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<ManageSearchIcon />}
                  onClick={() => navigate('/admin-manage-jobs')}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    background: `linear-gradient(45deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                    '&:hover': {
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.main})`
                    }
                  }}
                >
                  {t.manageJobs}
                </Button>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/admin-add-training')}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
                    '&:hover': {
                      background: `linear-gradient(45deg, ${theme.palette.secondary.dark}, ${theme.palette.secondary.dark})`
                    }
                  }}
                >
                  {t.addTraining}
                </Button>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<ManageSearchIcon />}
                  onClick={() => navigate('/admin-manage-training')}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    background: `linear-gradient(45deg, ${theme.palette.secondary.light}, ${theme.palette.secondary.main})`,
                    '&:hover': {
                      background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.main})`
                    }
                  }}
                >
                  {t.manageTraining}
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label={t.jobTab} />
              <Tab label={t.trainingTab} />
            </Tabs>
          </Box>

          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Loading */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={60} />
            </Box>
          ) : (
            <Box>
              {/* Job Applications Tab */}
              {tabValue === 0 && (
                applications.length === 0 ? (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    {t.noApplications}
                  </Alert>
                ) : (
            /* Applications Table */
            <TableContainer sx={{ borderRadius: 2, overflow: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                    <TableCell sx={{ fontWeight: 700 }}>{t.sNo}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t.name}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t.age}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t.gender}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t.mobile}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t.village}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t.workType}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t.skills}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t.availability}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t.submittedAt}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {applications.map((app, index) => (
                    <TableRow 
                      key={app.id}
                      sx={{ 
                        '&:hover': { 
                          bgcolor: alpha(theme.palette.primary.main, 0.05) 
                        } 
                      }}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{app.name}</TableCell>
                      <TableCell>{app.age}</TableCell>
                      <TableCell>{getGenderText(app.gender)}</TableCell>
                      <TableCell>{app.mobile}</TableCell>
                      <TableCell>{app.village}</TableCell>
                      <TableCell>{app.workType}</TableCell>
                      <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {app.skills}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getAvailabilityText(app.availability)}
                          color={getAvailabilityColor(app.availability)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.85rem' }}>
                        {formatDate(app.timestamp)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
                )
              )}

              {/* Training Applications Tab */}
              {tabValue === 1 && (
                trainingApplications.length === 0 ? (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    No training applications found
                  </Alert>
                ) : (
                  <TableContainer sx={{ borderRadius: 2, overflow: 'auto' }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1) }}>
                          <TableCell sx={{ fontWeight: 700 }}>S.No</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Age</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Gender</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Mobile</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Village/District</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Education</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Preferred Skill</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Availability</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Submitted At</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {trainingApplications.map((app, index) => (
                          <TableRow 
                            key={app.id}
                            sx={{ 
                              '&:hover': { 
                                bgcolor: alpha(theme.palette.secondary.main, 0.05) 
                              } 
                            }}
                          >
                            <TableCell>{index + 1}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{app.name}</TableCell>
                            <TableCell>{app.age}</TableCell>
                            <TableCell>{getGenderText(app.gender)}</TableCell>
                            <TableCell>{app.mobile}</TableCell>
                            <TableCell>{app.village}</TableCell>
                            <TableCell>{app.education}</TableCell>
                            <TableCell>{app.preferredSkill}</TableCell>
                            <TableCell>
                              <Chip 
                                label={getAvailabilityText(app.availability)}
                                color={getAvailabilityColor(app.availability)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.85rem' }}>
                              {formatDate(app.timestamp)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )
              )}
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
