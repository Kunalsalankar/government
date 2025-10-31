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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Grid
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FeedbackIcon from '@mui/icons-material/Feedback';
import { collection, getDocs, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useLanguage } from '../context/LanguageContext';

const AdminComplaints = () => {
  const theme = useTheme();
  const { language } = useLanguage();
  
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [filterDistrict, setFilterDistrict] = useState('all');
  const [filterIssueType, setFilterIssueType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [districts, setDistricts] = useState([]);

  const text = {
    english: {
      title: 'Manage Complaints',
      subtitle: 'Review and resolve user complaints',
      refresh: 'Refresh',
      noComplaints: 'No complaints found',
      loadError: 'Failed to load complaints',
      sNo: 'S.No',
      district: 'District',
      issueType: 'Issue Type',
      status: 'Status',
      submittedAt: 'Submitted At',
      submittedBy: 'Submitted By',
      actions: 'Actions',
      view: 'View Details',
      updateStatus: 'Update Status',
      pending: 'Pending',
      inReview: 'In Review',
      resolved: 'Resolved',
      rejected: 'Rejected',
      paymentDelay: 'Payment Delay',
      workNotProvided: 'Work Not Provided',
      corruption: 'Corruption',
      other: 'Other',
      filterDistrict: 'Filter by District',
      filterIssueType: 'Filter by Issue Type',
      filterStatus: 'Filter by Status',
      allDistricts: 'All Districts',
      allTypes: 'All Types',
      allStatuses: 'All Statuses',
      complaintDetails: 'Complaint Details',
      description: 'Description',
      close: 'Close',
      updateSuccess: 'Status updated successfully!',
      totalComplaints: 'Total Complaints'
    },
    hindi: {
      title: 'शिकायतों का प्रबंधन',
      subtitle: 'उपयोगकर्ता शिकायतों की समीक्षा और समाधान करें',
      refresh: 'रीफ्रेश',
      noComplaints: 'कोई शिकायत नहीं मिली',
      loadError: 'शिकायतें लोड करने में विफल',
      sNo: 'क्र.सं.',
      district: 'जिला',
      issueType: 'समस्या का प्रकार',
      status: 'स्थिति',
      submittedAt: 'जमा किया गया',
      submittedBy: 'द्वारा जमा',
      actions: 'कार्रवाई',
      view: 'विवरण देखें',
      updateStatus: 'स्थिति अपडेट करें',
      pending: 'लंबित',
      inReview: 'समीक्षाधीन',
      resolved: 'हल हो गया',
      rejected: 'अस्वीकृत',
      paymentDelay: 'भुगतान में देरी',
      workNotProvided: 'काम नहीं मिला',
      corruption: 'भ्रष्टाचार',
      other: 'अन्य',
      filterDistrict: 'जिले से फ़िल्टर करें',
      filterIssueType: 'समस्या प्रकार से फ़िल्टर करें',
      filterStatus: 'स्थिति से फ़िल्टर करें',
      allDistricts: 'सभी जिले',
      allTypes: 'सभी प्रकार',
      allStatuses: 'सभी स्थितियां',
      complaintDetails: 'शिकायत विवरण',
      description: 'विवरण',
      close: 'बंद करें',
      updateSuccess: 'स्थिति सफलतापूर्वक अपडेट की गई!',
      totalComplaints: 'कुल शिकायतें'
    }
  };

  const t = text[language] || text.english;

  const getIssueTypeText = (type) => {
    const types = {
      paymentDelay: t.paymentDelay,
      workNotProvided: t.workNotProvided,
      corruption: t.corruption,
      other: t.other
    };
    return types[type] || type;
  };

  const getStatusText = (status) => {
    const statuses = {
      'Pending': t.pending,
      'In Review': t.inReview,
      'Resolved': t.resolved,
      'Rejected': t.rejected
    };
    return statuses[status] || status;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'warning';
      case 'In Review':
        return 'info';
      case 'Resolved':
        return 'success';
      case 'Rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString(language === 'hindi' ? 'hi-IN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const q = query(collection(db, 'complaints'), orderBy('submittedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const complaintsList = [];
      const districtSet = new Set();
      
      querySnapshot.forEach((doc) => {
        const complaintData = { id: doc.id, ...doc.data() };
        complaintsList.push(complaintData);
        districtSet.add(complaintData.district);
      });
      
      setComplaints(complaintsList);
      setFilteredComplaints(complaintsList);
      setDistricts(Array.from(districtSet).sort());
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError(t.loadError);
    } finally {
      setLoading(false);
    }
  }, [t.loadError]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  useEffect(() => {
    let filtered = complaints;

    if (filterDistrict !== 'all') {
      filtered = filtered.filter(c => c.district === filterDistrict);
    }

    if (filterIssueType !== 'all') {
      filtered = filtered.filter(c => c.issueType === filterIssueType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(c => c.status === filterStatus);
    }

    setFilteredComplaints(filtered);
  }, [filterDistrict, filterIssueType, filterStatus, complaints]);

  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setDetailsDialogOpen(true);
  };


  const handleStatusUpdate = async (complaintId, newStatus) => {
    try {
      await updateDoc(doc(db, 'complaints', complaintId), {
        status: newStatus
      });
      fetchComplaints();
      alert(t.updateSuccess);
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
      py: { xs: 3, sm: 5 }
    }}>
      <Container maxWidth="xl">
        <Paper
          elevation={6}
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: 4,
            background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF8E1 100%)',
            border: '1px solid rgba(255,152,0,0.12)',
            boxShadow: '0 10px 40px rgba(255,152,0,0.15)'
          }}
        >
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                    fontWeight: 700,
                    color: theme.palette.warning.dark
                  }}
                >
                  {t.title}
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  {t.subtitle}
                </Typography>
              </Box>
              <IconButton
                color="primary"
                onClick={fetchComplaints}
                sx={{
                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.warning.main, 0.2)
                  }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Box>

            <Chip
              icon={<FeedbackIcon />}
              label={`${t.totalComplaints}: ${filteredComplaints.length}`}
              color="warning"
              sx={{ fontWeight: 600 }}
            />
          </Box>

          {/* Filters */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t.filterDistrict}</InputLabel>
                  <Select
                    value={filterDistrict}
                    onChange={(e) => setFilterDistrict(e.target.value)}
                    label={t.filterDistrict}
                  >
                    <MenuItem value="all">{t.allDistricts}</MenuItem>
                    {districts.map(district => (
                      <MenuItem key={district} value={district}>{district}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t.filterIssueType}</InputLabel>
                  <Select
                    value={filterIssueType}
                    onChange={(e) => setFilterIssueType(e.target.value)}
                    label={t.filterIssueType}
                  >
                    <MenuItem value="all">{t.allTypes}</MenuItem>
                    <MenuItem value="paymentDelay">{t.paymentDelay}</MenuItem>
                    <MenuItem value="workNotProvided">{t.workNotProvided}</MenuItem>
                    <MenuItem value="corruption">{t.corruption}</MenuItem>
                    <MenuItem value="other">{t.other}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t.filterStatus}</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label={t.filterStatus}
                  >
                    <MenuItem value="all">{t.allStatuses}</MenuItem>
                    <MenuItem value="Pending">{t.pending}</MenuItem>
                    <MenuItem value="In Review">{t.inReview}</MenuItem>
                    <MenuItem value="Resolved">{t.resolved}</MenuItem>
                    <MenuItem value="Rejected">{t.rejected}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
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
          ) : filteredComplaints.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              {t.noComplaints}
            </Alert>
          ) : (
            /* Complaints Table */
            <TableContainer sx={{ borderRadius: 2, overflow: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                    <TableCell sx={{ fontWeight: 700 }}>{t.sNo}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t.district}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t.issueType}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t.status}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t.submittedBy}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t.submittedAt}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t.actions}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredComplaints.map((complaint, index) => (
                    <TableRow 
                      key={complaint.id}
                      sx={{ '&:hover': { bgcolor: alpha(theme.palette.warning.main, 0.05) } }}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{complaint.district}</TableCell>
                      <TableCell>{getIssueTypeText(complaint.issueType)}</TableCell>
                      <TableCell>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={complaint.status}
                            onChange={(e) => handleStatusUpdate(complaint.id, e.target.value)}
                            sx={{ fontSize: '0.875rem' }}
                          >
                            <MenuItem value="Pending">{t.pending}</MenuItem>
                            <MenuItem value="In Review">{t.inReview}</MenuItem>
                            <MenuItem value="Resolved">{t.resolved}</MenuItem>
                            <MenuItem value="Rejected">{t.rejected}</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>{complaint.submittedBy}</TableCell>
                      <TableCell sx={{ fontSize: '0.85rem' }}>
                        {formatDate(complaint.submittedAt)}
                      </TableCell>
                      <TableCell>
                        <Tooltip title={t.view}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewDetails(complaint)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>

      {/* Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t.complaintDetails}</DialogTitle>
        <DialogContent>
          {selectedComplaint && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>{t.district}:</strong> {selectedComplaint.district}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>{t.issueType}:</strong> {getIssueTypeText(selectedComplaint.issueType)}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>{t.status}:</strong>{' '}
                <Chip
                  label={getStatusText(selectedComplaint.status)}
                  color={getStatusColor(selectedComplaint.status)}
                  size="small"
                />
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>{t.submittedBy}:</strong> {selectedComplaint.submittedBy}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>{t.submittedAt}:</strong> {formatDate(selectedComplaint.submittedAt)}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>
                {t.description}:
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedComplaint.description}
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>{t.close}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminComplaints;
