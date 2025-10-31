import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Chip,
  useTheme,
  alpha,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CampaignIcon from '@mui/icons-material/Campaign';
import StarIcon from '@mui/icons-material/Star';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useLanguage } from '../context/LanguageContext';

const SuccessStories = () => {
  const theme = useTheme();
  const { language } = useLanguage();
  
  const [stories, setStories] = useState([]);
  const [filteredStories, setFilteredStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('all');
  const [districts, setDistricts] = useState([]);

  const text = {
    english: {
      title: 'Success Stories',
      subtitle: 'Inspiring achievements from MGNREGA beneficiaries',
      search: 'Search stories...',
      filterByDistrict: 'Filter by District',
      allDistricts: 'All Districts',
      noStories: 'No success stories available',
      loadError: 'Failed to load stories',
      listenStory: 'Listen to this story',
      featured: 'Featured Story',
      totalStories: 'Success Stories'
    },
    hindi: {
      title: 'सफलता की कहानियां',
      subtitle: 'मनरेगा लाभार्थियों की प्रेरक उपलब्धियां',
      search: 'कहानियां खोजें...',
      filterByDistrict: 'जिले के अनुसार फ़िल्टर करें',
      allDistricts: 'सभी जिले',
      noStories: 'कोई सफलता की कहानी उपलब्ध नहीं',
      loadError: 'कहानियां लोड करने में विफल',
      listenStory: 'इस कहानी को सुनें',
      featured: 'विशेष कहानी',
      totalStories: 'सफलता की कहानियां'
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
      const districtSet = new Set();
      
      querySnapshot.forEach((doc) => {
        const storyData = { id: doc.id, ...doc.data() };
        storiesList.push(storyData);
        districtSet.add(storyData.districtName);
      });
      
      setStories(storiesList);
      setFilteredStories(storiesList);
      setDistricts(Array.from(districtSet).sort());
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

  useEffect(() => {
    let filtered = stories;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(story =>
        story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.districtName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by district
    if (filterDistrict !== 'all') {
      filtered = filtered.filter(story => story.districtName === filterDistrict);
    }

    // Sort: Featured stories first
    filtered.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return 0;
    });

    setFilteredStories(filtered);
  }, [searchTerm, filterDistrict, stories]);

  const handleListenStory = (story) => {
    const text = `${story.title}. ${story.description}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'hindi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.9; // Slightly slower for better clarity
    
    utterance.onerror = (e) => {
      console.warn('TTS error:', e.error);
      // Silently handle common errors without alerting user
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        console.error('TTS Error details:', e);
      }
    };
    
    window.speechSynthesis.speak(utterance);
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
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <CampaignIcon sx={{ fontSize: 60, color: theme.palette.success.main, mb: 2 }} />
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '1.75rem', sm: '2.5rem' },
                fontWeight: 700,
                color: theme.palette.success.main,
                mb: 1
              }}
            >
              {t.title}
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
              {t.subtitle}
            </Typography>

            <Chip
              icon={<StarIcon />}
              label={`${filteredStories.length} ${t.totalStories}`}
              color="success"
              sx={{ fontWeight: 600, fontSize: '1rem', py: 2 }}
            />
          </Box>

          {/* Search and Filter */}
          <Box sx={{ mb: 4 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder={t.search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'white'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>{t.filterByDistrict}</InputLabel>
                  <Select
                    value={filterDistrict}
                    onChange={(e) => setFilterDistrict(e.target.value)}
                    label={t.filterByDistrict}
                    sx={{
                      borderRadius: 2,
                      bgcolor: 'white'
                    }}
                  >
                    <MenuItem value="all">{t.allDistricts}</MenuItem>
                    {districts.map(district => (
                      <MenuItem key={district} value={district}>{district}</MenuItem>
                    ))}
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
          ) : filteredStories.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              {t.noStories}
            </Alert>
          ) : (
            /* Stories Grid */
            <Grid container spacing={3}>
              {filteredStories.map((story) => (
                <Grid item xs={12} sm={6} md={4} key={story.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      border: story.isFeatured ? `3px solid ${theme.palette.success.main}` : 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 8px 24px rgba(76,175,80,0.3)'
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      {story.isFeatured && (
                        <Chip
                          icon={<StarIcon />}
                          label={t.featured}
                          color="success"
                          size="small"
                          sx={{ mb: 1 }}
                        />
                      )}
                      
                      <Chip
                        label={story.districtName}
                        size="small"
                        sx={{ mb: 1, bgcolor: alpha(theme.palette.success.main, 0.1) }}
                      />
                      
                      <Typography
                        variant="h6"
                        sx={{
                          fontSize: '1.15rem',
                          fontWeight: 700,
                          color: theme.palette.success.dark,
                          mb: 1
                        }}
                      >
                        {story.title}
                      </Typography>
                      
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          lineHeight: 1.6
                        }}
                      >
                        {story.description}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ p: 2 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="success"
                        startIcon={<VolumeUpIcon />}
                        onClick={() => handleListenStory(story)}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600
                        }}
                      >
                        {t.listenStory}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default SuccessStories;
