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
import SchoolIcon from '@mui/icons-material/School';
import AddIcon from '@mui/icons-material/Add';
import { collection, getDocs, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

const AdminManageTraining = () => {
  const theme = useTheme();
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [formData, setFormData] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  const text = {
    english: {
      title: 'Manage Training Programs',
      subtitle: 'Edit or Delete Your Posted Programs',
      addNew: 'Add New Program',
      noPrograms: 'No training programs found',
      loadError: 'Failed to load programs',
      programName: 'Program Name',
      location: 'Location',
      description: 'Description',
      startTime: 'Start Date',
      endTime: 'End Date',
      actions: 'Actions',
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save Changes',
      cancel: 'Cancel',
      deleteConfirm: 'Are you sure you want to delete this program?',
      deleteTitle: 'Confirm Delete',
      editTitle: 'Edit Training Program',
      required: 'This field is required',
      updateSuccess: 'Program updated successfully!',
      updateError: 'Failed to update program',
      deleteSuccess: 'Program deleted successfully!',
      deleteError: 'Failed to delete program',
      totalPrograms: 'Total Programs'
    },
    hindi: {
      title: 'प्रशिक्षण कार्यक्रम प्रबंधित करें',
      subtitle: 'अपने पोस्ट किए गए कार्यक्रमों को संपादित या हटाएं',
      addNew: 'नया कार्यक्रम जोड़ें',
      noPrograms: 'कोई प्रशिक्षण कार्यक्रम नहीं मिला',
      loadError: 'कार्यक्रम लोड करने में विफल',
      programName: 'कार्यक्रम का नाम',
      location: 'स्थान',
      description: 'विवरण',
      startTime: 'आरंभ तिथि',
      endTime: 'समाप्ति तिथि',
      actions: 'कार्रवाई',
      edit: 'संपादित करें',
      delete: 'हटाएं',
      save: 'परिवर्तन सहेजें',
      cancel: 'रद्द करें',
      deleteConfirm: 'क्या आप वाकई इस कार्यक्रम को हटाना चाहते हैं?',
      deleteTitle: 'हटाना सुनिश्चित करें',
      editTitle: 'प्रशिक्षण कार्यक्रम संपादित करें',
      required: 'यह फ़ील्ड आवश्यक है',
      updateSuccess: 'कार्यक्रम सफलतापूर्वक अपडेट किया गया!',
      updateError: 'कार्यक्रम अपडेट करने में विफल',
      deleteSuccess: 'कार्यक्रम सफलतापूर्वक हटाया गया!',
      deleteError: 'कार्यक्रम हटाने में विफल',
      totalPrograms: 'कुल कार्यक्रम'
    }
  };

  const t = text[language] || text.english;

  const fetchPrograms = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const adminEmail = localStorage.getItem('userEmail');
      const q = query(collection(db, 'trainingPrograms'), where('createdBy', '==', adminEmail));
      const querySnapshot = await getDocs(q);
      const programsList = [];
      querySnapshot.forEach((doc) => {
        programsList.push({ id: doc.id, ...doc.data() });
      });
      setPrograms(programsList);
    } catch (err) {
      console.error('Error fetching programs:', err);
      setError(t.loadError);
    } finally {
      setLoading(false);
    }
  }, [t.loadError]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const handleEditClick = (program) => {
    setSelectedProgram(program);
    setFormData({
      programName: program.programName || '',
      location: program.location || '',
      description: program.description || '',
      startTime: program.startTime || '',
      endTime: program.endTime || ''
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (program) => {
    setSelectedProgram(program);
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
    if (!formData.programName?.trim()) errors.programName = t.required;
    if (!formData.location?.trim()) errors.location = t.required;
    if (!formData.description?.trim()) errors.description = t.required;
    if (!formData.startTime) errors.startTime = t.required;
    if (!formData.endTime) errors.endTime = t.required;

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    try {
      const programRef = doc(db, 'trainingPrograms', selectedProgram.id);
      await updateDoc(programRef, {
        programName: formData.programName.trim(),
        location: formData.location.trim(),
        description: formData.description.trim(),
        startTime: formData.startTime,
        endTime: formData.endTime
      });

      setEditDialogOpen(false);
      fetchPrograms();
      alert(t.updateSuccess);
    } catch (err) {
      console.error('Error updating program:', err);
      alert(t.updateError);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, 'trainingPrograms', selectedProgram.id));
      setDeleteDialogOpen(false);
      fetchPrograms();
      alert(t.deleteSuccess);
    } catch (err) {
      console.error('Error deleting program:', err);
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
                    color: theme.palette.secondary.main
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
                onClick={() => navigate('/admin-add-training')}
                sx={{
                  py: 1.5,
                  px: 3,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  bgcolor: theme.palette.secondary.main
                }}
              >
                {t.addNew}
              </Button>
            </Box>

            <Chip
              icon={<SchoolIcon />}
              label={`${t.totalPrograms}: ${programs.length}`}
              color="secondary"
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
          ) : programs.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              {t.noPrograms}
            </Alert>
          ) : (
            /* Programs Table */
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1) }}>
                    <TableCell sx={{ fontWeight: 700 }}>{t.programName}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t.location}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t.startTime}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t.endTime}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t.actions}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {programs.map((program) => (
                    <TableRow key={program.id} sx={{ '&:hover': { bgcolor: alpha(theme.palette.secondary.main, 0.05) } }}>
                      <TableCell>{program.programName}</TableCell>
                      <TableCell>{program.location}</TableCell>
                      <TableCell>{program.startTime || 'N/A'}</TableCell>
                      <TableCell>{program.endTime || 'N/A'}</TableCell>
                      <TableCell>
                        <IconButton
                          color="secondary"
                          onClick={() => handleEditClick(program)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(program)}
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
                label={t.programName}
                name="programName"
                value={formData.programName || ''}
                onChange={handleChange}
                error={!!validationErrors.programName}
                helperText={validationErrors.programName}
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>{t.cancel}</Button>
          <Button onClick={handleUpdate} variant="contained" color="secondary">{t.save}</Button>
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

export default AdminManageTraining;
