import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  alpha,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import FeedbackIcon from '@mui/icons-material/Feedback';
import { collection, getDocs, orderBy, query, updateDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { useLanguage } from '../context/LanguageContext';

const HeadOfficerDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [finalRemarks, setFinalRemarks] = useState('');
  const [resolving, setResolving] = useState(false);

  const text = useMemo(() => ({
    english: {
      title: 'Head Officer Panel',
      subtitle: 'Review escalated complaints and provide final decision',
      refresh: 'Refresh',
      noComplaints: 'No escalated complaints found',
      loadError: 'Failed to load escalated complaints',
      sNo: 'S.No',
      district: 'District',
      issueType: 'Issue Type',
      status: 'Status',
      submittedAt: 'Submitted At',
      submittedBy: 'Submitted By',
      actions: 'Actions',
      view: 'View Details',
      resolve: 'Resolve',
      complaintDetails: 'Complaint Details',
      description: 'Description',
      close: 'Close',
      finalRemarks: 'Final Remarks',
      remarksPlaceholder: 'Write final decision / remarks...',
      submit: 'Submit',
      totalComplaints: 'Escalated Complaints'
    },
    hindi: {
      title: 'मुख्य अधिकारी पैनल',
      subtitle: 'एस्केलेट की गई शिकायतों की समीक्षा करें और अंतिम निर्णय दें',
      refresh: 'रीफ्रेश',
      noComplaints: 'कोई एस्केलेट की गई शिकायत नहीं मिली',
      loadError: 'एस्केलेट की गई शिकायतें लोड करने में विफल',
      sNo: 'क्र.सं.',
      district: 'जिला',
      issueType: 'समस्या का प्रकार',
      status: 'स्थिति',
      submittedAt: 'जमा किया गया',
      submittedBy: 'द्वारा जमा',
      actions: 'कार्रवाई',
      view: 'विवरण देखें',
      resolve: 'समाधान',
      complaintDetails: 'शिकायत विवरण',
      description: 'विवरण',
      close: 'बंद करें',
      finalRemarks: 'अंतिम टिप्पणी',
      remarksPlaceholder: 'अंतिम निर्णय / टिप्पणी लिखें...',
      submit: 'जमा करें',
      totalComplaints: 'एस्केलेट की गई शिकायतें'
    }
  }), []);

  const t = text[language] || text.english;

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'headOfficer') {
      navigate('/login');
    }
  }, [navigate]);

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

  const fetchEscalatedComplaints = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const q = query(collection(db, 'complaints'), orderBy('submittedAt', 'desc'));
      const snapshot = await getDocs(q);
      const escalated = [];
      snapshot.forEach((d) => {
        const data = { id: d.id, ...d.data() };
        if (data.status === 'Escalated') {
          escalated.push(data);
        }
      });
      setComplaints(escalated);
    } catch (err) {
      console.error('Error fetching escalated complaints:', err);
      setError(t.loadError);
    } finally {
      setLoading(false);
    }
  }, [t.loadError]);

  useEffect(() => {
    fetchEscalatedComplaints();
  }, [fetchEscalatedComplaints]);

  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setDetailsDialogOpen(true);
  };

  const handleOpenResolve = (complaint) => {
    setSelectedComplaint(complaint);
    setFinalRemarks(complaint.finalRemarks || '');
    setResolveDialogOpen(true);
  };

  const handleResolve = async () => {
    if (!selectedComplaint) return;
    setResolving(true);
    try {
      await updateDoc(doc(db, 'complaints', selectedComplaint.id), {
        status: 'Resolved',
        resolvedBy: 'Head Officer',
        finalRemarks: finalRemarks.trim()
      });
      setResolveDialogOpen(false);
      setDetailsDialogOpen(false);
      setSelectedComplaint(null);
      setFinalRemarks('');
      fetchEscalatedComplaints();
    } catch (err) {
      console.error('Error resolving complaint:', err);
      alert('Failed to resolve complaint');
    } finally {
      setResolving(false);
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
                onClick={fetchEscalatedComplaints}
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
              label={`${t.totalComplaints}: ${complaints.length}`}
              color="warning"
              sx={{ fontWeight: 600 }}
            />
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={60} />
            </Box>
          ) : complaints.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              {t.noComplaints}
            </Alert>
          ) : (
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
                  {complaints.map((complaint, index) => (
                    <TableRow
                      key={complaint.id}
                      sx={{ '&:hover': { bgcolor: alpha(theme.palette.warning.main, 0.05) } }}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{complaint.district}</TableCell>
                      <TableCell>{complaint.issueType}</TableCell>
                      <TableCell>
                        <Chip label={complaint.status} color="warning" size="small" />
                      </TableCell>
                      <TableCell>{complaint.submittedBy}</TableCell>
                      <TableCell sx={{ fontSize: '0.85rem' }}>{formatDate(complaint.submittedAt)}</TableCell>
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
                        <Tooltip title={t.resolve}>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleOpenResolve(complaint)}
                          >
                            <DoneAllIcon />
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
                <strong>{t.issueType}:</strong> {selectedComplaint.issueType}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>{t.status}:</strong> {selectedComplaint.status}
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
          {selectedComplaint && (
            <Button
              variant="contained"
              color="warning"
              onClick={() => handleOpenResolve(selectedComplaint)}
              startIcon={<DoneAllIcon />}
            >
              {t.resolve}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog
        open={resolveDialogOpen}
        onClose={() => setResolveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t.resolve}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <TextField
              fullWidth
              multiline
              minRows={4}
              label={t.finalRemarks}
              value={finalRemarks}
              onChange={(e) => setFinalRemarks(e.target.value)}
              placeholder={t.remarksPlaceholder}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolveDialogOpen(false)}>{t.close}</Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleResolve}
            disabled={resolving}
            startIcon={resolving ? <CircularProgress size={18} color="inherit" /> : <DoneAllIcon />}
          >
            {t.submit}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HeadOfficerDashboard;
