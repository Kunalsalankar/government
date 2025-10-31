import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  CircularProgress,
  Alert,
  Checkbox,
  FormControlLabel,
  useTheme,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useLanguage } from '../context/LanguageContext';

const AdminSuccessStories = () => {
  const theme = useTheme();
  const { language } = useLanguage();
  
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  
  const [formData, setFormData] = useState({
    districtName: '',
    title: '',
    description: '',
    isFeatured: false
  });
  
  const [validationErrors, setValidationErrors] = useState({});

  const text = {
    english: {
      title: 'Manage Success Stories',
      subtitle: 'Create and manage inspiring stories from MGNREGA',
      addNew: 'Add Success Story',
      noStories: 'No success stories yet',
      loadError: 'Failed to load stories',
      districtName: 'District Name',
      storyTitle: 'Story Title',
      description: 'Description',
      featured: 'Mark as Featured',
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save Story',
      cancel: 'Cancel',
      deleteConfirm: 'Are you sure you want to delete this story?',
      deleteTitle: 'Confirm Delete',
      editTitle: 'Edit Success Story',
      addTitle: 'Add Success Story',
      required: 'This field is required',
      saving: 'Saving...',
      updateSuccess: 'Story updated successfully!',
      addSuccess: 'Story added successfully!',
      deleteSuccess: 'Story deleted successfully!',
      totalStories: 'Total Stories'
    },
    hindi: {
      title: 'सफलता की कहानियां प्रबंधित करें',
      subtitle: 'मनरेगा से प्रेरक कहानियां बनाएं और प्रबंधित करें',
      addNew: 'नई कहानी जोड़ें',
      noStories: 'अभी तक कोई सफलता की कहानी नहीं',
      loadError: 'कहानियां लोड करने में विफल',
      districtName: 'जिले का नाम',
      storyTitle: 'कहानी का शीर्षक',
      description: 'विवरण',
      featured: 'विशेष के रूप में चिह्नित करें',
      edit: 'संपादित करें',
      delete: 'हटाएं',
      save: 'कहानी सहेजें',
      cancel: 'रद्द करें',
      deleteConfirm: 'क्या आप वाकई इस कहानी को हटाना चाहते हैं?',
      deleteTitle: 'हटाना सुनिश्चित करें',
      editTitle: 'सफलता की कहानी संपादित करें',
      addTitle: 'सफलता की कहानी जोड़ें',
      required: 'यह फ़ील्ड आवश्यक है',
      saving: 'सहेजा जा रहा है...',
      updateSuccess: 'कहानी सफलतापूर्वक अपडेट की गई!',
      addSuccess: 'कहानी सफलतापूर्वक जोड़ी गई!',
      deleteSuccess: 'कहानी सफलतापूर्वक हटाई गई!',
      totalStories: 'कुल कहानियां'
    }
  };

  const t = text[language] || text.english;

  const fetchStories = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const q = query(collection(db, 'successStories'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const storiesList = [];
      querySnapshot.forEach((doc) => {
        storiesList.push({ id: doc.id, ...doc.data() });
      });
      setStories(storiesList);
    } catch (err) {
      console.error('Error fetching stories:', err);
      setError(t.loadError);
    } finally {
      setLoading(false);
    }
  }, [t.loadError]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const handleAddClick = () => {
    setSelectedStory(null);
    setFormData({
      districtName: '',
      title: '',
      description: '',
      isFeatured: false
    });
    setDialogOpen(true);
  };

  const handleEditClick = (story) => {
    setSelectedStory(story);
    setFormData({
      districtName: story.districtName || '',
      title: story.title || '',
      description: story.description || '',
      isFeatured: story.isFeatured || false
    });
    setDialogOpen(true);
  };

  const handleDeleteClick = (story) => {
    setSelectedStory(story);
    setDeleteDialogOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };


  const validateForm = () => {
    const errors = {};
    if (!formData.districtName?.trim()) errors.districtName = t.required;
    if (!formData.title?.trim()) errors.title = t.required;
    if (!formData.description?.trim()) errors.description = t.required;

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const adminEmail = localStorage.getItem('userEmail');

      const storyData = {
        districtName: formData.districtName.trim(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        isFeatured: formData.isFeatured,
        postedBy: adminEmail,
        timestamp: serverTimestamp()
      };

      if (selectedStory) {
        // Update existing story
        await updateDoc(doc(db, 'successStories', selectedStory.id), storyData);
        alert(t.updateSuccess);
      } else {
        // Add new story
        await addDoc(collection(db, 'successStories'), storyData);
        alert(t.addSuccess);
      }

      setDialogOpen(false);
      fetchStories();
    } catch (err) {
      console.error('Error saving story:', err);
      alert('Failed to save story. Please try again.');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, 'successStories', selectedStory.id));
      setDeleteDialogOpen(false);
      fetchStories();
      alert(t.deleteSuccess);
    } catch (err) {
      console.error('Error deleting story:', err);
      alert('Failed to delete story.');
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
      py: { xs: 3, sm: 5 }
    }}>
      <Container maxWidth="xl">
        <Paper
          elevation={6}
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: 4,
            background: 'linear-gradient(180deg, #FFFFFF 0%, #E8F5E9 100%)',
            border: '1px solid rgba(76,175,80,0.12)',
            boxShadow: '0 10px 40px rgba(76,175,80,0.15)'
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
                    color: theme.palette.success.main
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
                onClick={handleAddClick}
                sx={{
                  py: 1.5,
                  px: 3,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  bgcolor: theme.palette.success.main,
                  '&:hover': {
                    bgcolor: theme.palette.success.dark
                  }
                }}
              >
                {t.addNew}
              </Button>
            </Box>

            <Chip
              icon={<StarIcon />}
              label={`${t.totalStories}: ${stories.length}`}
              color="success"
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
          ) : stories.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              {t.noStories}
            </Alert>
          ) : (
            /* Stories Grid */
            <Grid container spacing={3}>
              {stories.map((story) => (
                <Grid item xs={12} sm={6} md={4} key={story.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            color: theme.palette.success.main
                          }}
                        >
                          {story.title}
                        </Typography>
                        {story.isFeatured && (
                          <StarIcon sx={{ color: 'gold', fontSize: 24 }} />
                        )}
                      </Box>
                      
                      <Chip
                        label={story.districtName}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {story.description}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                      <IconButton
                        color="primary"
                        onClick={() => handleEditClick(story)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(story)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Container>

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedStory ? t.editTitle : t.addTitle}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t.districtName}
                name="districtName"
                value={formData.districtName}
                onChange={handleChange}
                error={!!validationErrors.districtName}
                helperText={validationErrors.districtName}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t.storyTitle}
                name="title"
                value={formData.title}
                onChange={handleChange}
                error={!!validationErrors.title}
                helperText={validationErrors.title}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t.description}
                name="description"
                value={formData.description}
                onChange={handleChange}
                error={!!validationErrors.description}
                helperText={validationErrors.description}
                multiline
                rows={5}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    name="isFeatured"
                    icon={<StarBorderIcon />}
                    checkedIcon={<StarIcon />}
                  />
                }
                label={t.featured}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>{t.cancel}</Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            color="success"
          >
            {t.save}
          </Button>
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
          <Button onClick={handleDelete} variant="contained" color="error">
            {t.delete}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminSuccessStories;
