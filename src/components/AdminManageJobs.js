import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  IconButton,
  CircularProgress,
  Alert,
  useTheme,
  alpha,
  Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WorkIcon from '@mui/icons-material/Work';
import AddIcon from '@mui/icons-material/Add';
import { collection, getDocs, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

const AdminManageJobs = () => {
  const theme = useTheme();
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [formData, setFormData] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  const text = {
    english: {
      title: 'Manage Job Opportunities',
      subtitle: 'Edit or Delete Your Posted Jobs',
      addNew: 'Add New Job',
      noJobs: 'No job opportunities found',
      loadError: 'Failed to load jobs',
      jobTitle: 'Job Title',
      location: 'Location',
      description: 'Description',
      startTime: 'Start Date',
      endTime: 'End Date',
      contactInfo: 'Contact Info',
      actions: 'Actions',
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save Changes',
      cancel: 'Cancel',
      deleteConfirm: 'Are you sure you want to delete this job?',
      deleteTitle: 'Confirm Delete',
      editTitle: 'Edit Job Opportunity',
      required: 'This field is required',
      updateSuccess: 'Job updated successfully!',
      updateError: 'Failed to update job',
      deleteSuccess: 'Job deleted successfully!',
      deleteError: 'Failed to delete job',
      totalJobs: 'Total Jobs'
    },
    hindi: {
      title: 'नौकरी के अवसर प्रबंधित करें',
      subtitle: 'अपनी पोस्ट की गई नौकरियों को संपादित या हटाएं',
      addNew: 'नई नौकरी जोड़ें',
      noJobs: 'कोई नौकरी का अवसर नहीं मिला',
      loadError: 'नौकरियां लोड करने में विफल',
      jobTitle: 'नौकरी का शीर्षक',
      location: 'स्थान',
      description: 'विवरण',
      startTime: 'आरंभ तिथि',
      endTime: 'समाप्ति तिथि',
      contactInfo: 'संपर्क जानकारी',
      actions: 'कार्रवाई',
      edit: 'संपादित करें',
      delete: 'हटाएं',
      save: 'परिवर्तन सहेजें',
      cancel: 'रद्द करें',
      deleteConfirm: 'क्या आप वाकई इस नौकरी को हटाना चाहते हैं?',
      deleteTitle: 'हटाना सुनिश्चित करें',
      editTitle: 'नौकरी का अवसर संपादित करें',
      required: 'यह फ़ील्ड आवश्यक है',
      updateSuccess: 'नौकरी सफलतापूर्वक अपडेट की गई!',
      updateError: 'नौकरी अपडेट करने में विफल',
      deleteSuccess: 'नौकरी सफलतापूर्वक हटाई गई!',
      deleteError: 'नौकरी हटाने में विफल',
      totalJobs: 'कुल नौकरियां'
    }
  };

  const t = text[language] || text.english;

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const adminEmail = localStorage.getItem('userEmail');
      const q = query(collection(db, 'jobs'), where('createdBy', '==', adminEmail));
      const querySnapshot = await getDocs(q);
      const jobsList = [];
      querySnapshot.forEach((doc) => {
        jobsList.push({ id: doc.id, ...doc.data() });
      });
      setJobs(jobsList);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(t.loadError);
    } finally {
      setLoading(false);
    }
  }, [t.loadError]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleEditClick = (job) => {
    setSelectedJob(job);
    setFormData({
      jobTitle: job.jobTitle || '',
      location: job.location || '',
      description: job.description || '',
      startTime: job.startTime || '',
      endTime: job.endTime || '',
      contactInfo: job.contactInfo || ''
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (job) => {
    setSelectedJob(job);
    setDeleteDialogOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.jobTitle?.trim()) errors.jobTitle = t.required;
    if (!formData.location?.trim()) errors.location = t.required;
    if (!formData.description?.trim()) errors.description = t.required;
    if (!formData.startTime) errors.startTime = t.required;
    if (!formData.endTime) errors.endTime = t.required;
    if (!formData.contactInfo?.trim()) errors.contactInfo = t.required;

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    try {
      const jobRef = doc(db, 'jobs', selectedJob.id);
      await updateDoc(jobRef, {
        jobTitle: formData.jobTitle.trim(),
        location: formData.location.trim(),
        description: formData.description.trim(),
        startTime: formData.startTime,
        endTime: formData.endTime,
        contactInfo: formData.contactInfo.trim()
      });

      setEditDialogOpen(false);
      fetchJobs();
      alert(t.updateSuccess);
    } catch (err) {
      console.error('Error updating job:', err);
      alert(t.updateError);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, 'jobs', selectedJob.id));
      setDeleteDialogOpen(false);
      fetchJobs();
      alert(t.deleteSuccess);
    } catch (err) {
      console.error('Error deleting job:', err);
      alert(t.deleteError);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #b3e5fc 0%, #e1bee7 100%)',
      py: { xs: 3, sm: 5 }
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
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                    fontWeight: 700,
                    color: theme.palette.primary.main
                  }}
                >
                  {t.title}
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  {t.subtitle}
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/admin-add-job')}
                sx={{
                  py: 1.5,
                  px: 3,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: 'none'
                }}
              >
                {t.addNew}
              </Button>
            </Box>

            <Chip
              icon={<WorkIcon />}
              label={`${t.totalJobs}: ${jobs.length}`}
              color="primary"
              sx={{ fontWeight: 600 }}
            />
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
          ) : jobs.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              {t.noJobs}
            </Alert>
          ) : (
            /* Jobs Table */
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                    <TableCell sx={{ fontWeight: 700 }}>{t.jobTitle}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t.location}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t.startTime}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t.endTime}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t.actions}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job.id} sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) } }}>
                      <TableCell>{job.jobTitle}</TableCell>
                      <TableCell>{job.location}</TableCell>
                      <TableCell>{job.startTime || 'N/A'}</TableCell>
                      <TableCell>{job.endTime || 'N/A'}</TableCell>
                      <TableCell>
                        <IconButton
                          color="primary"
                          onClick={() => handleEditClick(job)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(job)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t.editTitle}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t.jobTitle}
                name="jobTitle"
                value={formData.jobTitle || ''}
                onChange={handleChange}
                error={!!validationErrors.jobTitle}
                helperText={validationErrors.jobTitle}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t.location}
                name="location"
                value={formData.location || ''}
                onChange={handleChange}
                error={!!validationErrors.location}
                helperText={validationErrors.location}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t.description}
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                error={!!validationErrors.description}
                helperText={validationErrors.description}
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t.startTime}
                name="startTime"
                type="date"
                value={formData.startTime || ''}
                onChange={handleChange}
                error={!!validationErrors.startTime}
                helperText={validationErrors.startTime}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t.endTime}
                name="endTime"
                type="date"
                value={formData.endTime || ''}
                onChange={handleChange}
                error={!!validationErrors.endTime}
                helperText={validationErrors.endTime}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t.contactInfo}
                name="contactInfo"
                value={formData.contactInfo || ''}
                onChange={handleChange}
                error={!!validationErrors.contactInfo}
                helperText={validationErrors.contactInfo}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>{t.cancel}</Button>
          <Button onClick={handleUpdate} variant="contained">{t.save}</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>{t.deleteTitle}</DialogTitle>
        <DialogContent>
          <Typography>{t.deleteConfirm}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t.cancel}</Button>
          <Button onClick={handleDelete} variant="contained" color="error">{t.delete}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminManageJobs;
