import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  useTheme,
  alpha,
  Button
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InfoIcon from '@mui/icons-material/Info';
import PhoneIcon from '@mui/icons-material/Phone';
import MicIcon from '@mui/icons-material/Mic';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import geolocationService from '../services/geolocationService';

const JobOpportunities = () => {
  const theme = useTheme();
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [voiceError, setVoiceError] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);
  const [userDistrict, setUserDistrict] = useState('');
  const [showNearestOnly, setShowNearestOnly] = useState(false);

  const text = {
    english: {
      title: 'Available Job Opportunities',
      subtitle: 'Local Employment Under MGNREGA',
      noJobs: 'No job opportunities available at the moment',
      loadError: 'Failed to load job opportunities',
      location: 'Location',
      description: 'Description',
      contact: 'Contact Information',
      applyNow: 'Apply Now',
      totalJobs: 'Total Opportunities',
      offlineUsingCache: 'You are offline. Showing saved jobs from this phone.',
      offlineNoCache: 'You are offline and no saved jobs are available yet. Please open this page once with internet.',
      speakJobs: 'Speak',
      listening: 'Listening... Speak now',
      micNotSupported: 'Your browser does not support voice input',
      micPermissionDenied: 'Microphone permission denied. Check browser settings.',
      noSpeech: 'No speech heard. Please try again.',
      nearestJobsLabel: 'Nearest jobs',
      districtLabel: 'District',
      voiceSummaryOne: 'There is 1 job available offline near you.',
      voiceSummaryMany: 'There are {count} jobs available offline near you.',
      syncOnReconnect: 'Internet is back. Syncing latest jobs...'
    },
    hindi: {
      title: 'उपलब्ध नौकरी के अवसर',
      subtitle: 'मनरेगा के तहत स्थानीय रोजगार',
      noJobs: 'इस समय कोई नौकरी के अवसर उपलब्ध नहीं हैं',
      loadError: 'नौकरी के अवसर लोड करने में विफल',
      location: 'स्थान',
      description: 'विवरण',
      contact: 'संपर्क जानकारी',
      applyNow: 'अभी आवेदन करें',
      totalJobs: 'कुल अवसर',
      offlineUsingCache: 'आप ऑफलाइन हैं। इस फोन में सेव किए गए काम दिखा रहे हैं।',
      offlineNoCache: 'आप ऑफलाइन हैं और अभी कोई सेव किया हुआ काम उपलब्ध नहीं है। कृपया एक बार इंटरनेट के साथ यह पेज खोलें।',
      speakJobs: 'बोलें',
      listening: 'सुन रहा हूँ... बोलिए',
      micNotSupported: 'आपका ब्राउज़र वॉयस इनपुट का समर्थन नहीं करता',
      micPermissionDenied: 'माइक्रोफ़ोन की अनुमति नहीं। ब्राउज़र सेटिंग्स जांचें।',
      noSpeech: 'कोई आवाज़ नहीं सुनी गई। कृपया पुनः प्रयास करें।',
      nearestJobsLabel: 'नज़दीकी काम',
      districtLabel: 'जिला',
      voiceSummaryOne: 'आपके आस-पास 1 काम ऑफलाइन उपलब्ध है।',
      voiceSummaryMany: 'आपके आस-पास {count} काम ऑफलाइन उपलब्ध हैं।',
      syncOnReconnect: 'इंटरनेट आ गया है। नए काम सिंक हो रहे हैं...'
    }
  };

  const t = text[language] || text.english;

  const getCache = useCallback(() => {
    try {
      const raw = localStorage.getItem('cachedJobs_v1');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.jobs)) return null;
      return parsed;
    } catch {
      return null;
    }
  }, []);

  const setCache = useCallback((jobsList) => {
    try {
      localStorage.setItem('cachedJobs_v1', JSON.stringify({ jobs: jobsList, cachedAt: Date.now() }));
    } catch {
      return;
    }
  }, []);

  const normalizeText = useCallback((value) => {
    if (typeof value !== 'string') return '';
    return value.toLowerCase().replace(/[^a-z0-9\s]/gi, ' ').replace(/\s+/g, ' ').trim();
  }, []);

  const speak = useCallback((message) => {
    if (typeof window === 'undefined') return;
    if (!('speechSynthesis' in window)) return;
    const msg = (message || '').toString().trim();
    if (!msg) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(msg);
      utterance.lang = language === 'hindi' ? 'hi-IN' : 'en-US';
      window.speechSynthesis.speak(utterance);
    } catch {
      return;
    }
  }, [language]);

  const resolveDistrict = useCallback(async () => {
    const saved = localStorage.getItem('selectedDistrict');
    if (saved && typeof saved === 'string' && saved.trim()) {
      setUserDistrict(saved.trim());
      return;
    }

    try {
      const coords = await geolocationService.getCurrentPosition();
      const resolved = geolocationService.findNearestDistrict(coords);
      if (resolved?.district) {
        setUserDistrict(resolved.district);
      }
    } catch {
      return;
    }
  }, []);

  const getNearestJobs = useCallback((jobsList) => {
    const district = (userDistrict || '').trim();
    if (!district) return jobsList;

    const districtNorm = normalizeText(district);
    const filtered = (Array.isArray(jobsList) ? jobsList : []).filter((job) => {
      const locationNorm = normalizeText(job?.location || '');
      return locationNorm.includes(districtNorm);
    });

    return filtered.length > 0 ? filtered : jobsList;
  }, [normalizeText, userDistrict]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const jobsList = [];
      querySnapshot.forEach((doc) => {
        jobsList.push({ id: doc.id, ...doc.data() });
      });
      setJobs(jobsList);
      setCache(jobsList);
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setError(t.offlineUsingCache);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      const cached = getCache();
      if (cached?.jobs?.length) {
        setJobs(cached.jobs);
        setError(t.offlineUsingCache);
      } else {
        setError((typeof navigator !== 'undefined' && !navigator.onLine) ? t.offlineNoCache : t.loadError);
      }
    } finally {
      setLoading(false);
    }
  }, [getCache, setCache, t.loadError, t.offlineNoCache, t.offlineUsingCache]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    resolveDistrict();
  }, [resolveDistrict]);

  useEffect(() => {
    const onOnline = () => {
      setIsOffline(false);
      setVoiceError('');
      setError(t.syncOnReconnect);
      fetchJobs();
    };
    const onOffline = () => {
      setIsOffline(true);
      setError(t.offlineUsingCache);
    };

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [fetchJobs, t.offlineUsingCache, t.syncOnReconnect]);

  const announceNearestJobs = useCallback((nearestOnly) => {
    const baseList = nearestOnly ? getNearestJobs(jobs) : jobs;
    const count = Array.isArray(baseList) ? baseList.length : 0;
    if (count === 1) {
      speak(t.voiceSummaryOne);
      return;
    }
    speak(t.voiceSummaryMany.replace('{count}', String(count)));
  }, [getNearestJobs, jobs, speak, t.voiceSummaryMany, t.voiceSummaryOne]);

  const handleVoiceInput = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError(t.micNotSupported);
      speak(t.micNotSupported);
      setTimeout(() => setVoiceError(''), 4000);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'hindi' ? 'hi-IN' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceError(t.listening);
    };

    recognition.onresult = (event) => {
      const transcript = event?.results?.[0]?.[0]?.transcript || '';
      const spoken = normalizeText(transcript);
      const triggers = ['aaj', 'आज', 'kaam', 'काम', 'job', 'jobs', 'naukri', 'नौकरी', 'dikhao', 'दिखाओ', 'show'];
      const triggered = triggers.some((w) => spoken.includes(normalizeText(String(w))));

      if (triggered) {
        setShowNearestOnly(true);
        announceNearestJobs(true);
      } else {
        setShowNearestOnly(false);
        announceNearestJobs(false);
      }

      setTimeout(() => setVoiceError(''), 2500);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      if (event?.error === 'no-speech') {
        setVoiceError(t.noSpeech);
        speak(t.noSpeech);
        setTimeout(() => setVoiceError(''), 4000);
        return;
      }
      if (event?.error === 'aborted') {
        return;
      }

      if (event?.error === 'not-allowed') {
        setVoiceError(t.micPermissionDenied);
        speak(t.micPermissionDenied);
        setTimeout(() => setVoiceError(''), 5000);
        return;
      }

      setVoiceError(t.loadError);
      setTimeout(() => setVoiceError(''), 4000);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [announceNearestJobs, language, normalizeText, speak, t.listening, t.loadError, t.micNotSupported, t.micPermissionDenied, t.noSpeech]);

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #b3e5fc 0%, #e1bee7 100%)',
      py: { xs: 3, sm: 5 }
    }}>
      <Container maxWidth="lg">
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            background: 'linear-gradient(180deg, #FFFFFF 0%, #E0F2F1 100%)',
            border: '1px solid rgba(0,137,123,0.12)',
            boxShadow: '0 10px 40px rgba(0,137,123,0.15)',
            mb: 4
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                mb: 2
              }}
            >
              <WorkIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                fontWeight: 700,
                color: theme.palette.primary.main,
                mb: 1
              }}
            >
              {t.title}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '0.95rem', sm: '1.05rem' },
                color: 'text.secondary'
              }}
            >
              {t.subtitle}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            <Button
              variant={isListening ? 'contained' : 'outlined'}
              color="primary"
              startIcon={<MicIcon />}
              onClick={handleVoiceInput}
              disabled={loading}
            >
              {t.speakJobs}
            </Button>
            {isOffline && (
              <Chip
                label="Offline"
                color="warning"
                sx={{ fontWeight: 700 }}
              />
            )}
            {userDistrict && (
              <Chip
                icon={<LocationOnIcon />}
                label={`${t.districtLabel}: ${userDistrict}`}
                color="secondary"
                sx={{ fontWeight: 600 }}
              />
            )}
            {showNearestOnly && (
              <Chip
                icon={<WorkIcon />}
                label={t.nearestJobsLabel}
                color="success"
                sx={{ fontWeight: 600 }}
              />
            )}
          </Box>

          {voiceError && (
            <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
              {voiceError}
            </Alert>
          )}

          {/* Stats */}
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Chip
              icon={<WorkIcon />}
              label={`${t.totalJobs}: ${jobs.length}`}
              color="primary"
              sx={{ fontWeight: 600, fontSize: '1rem', py: 2.5 }}
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
          ) : (showNearestOnly ? getNearestJobs(jobs) : jobs).length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              {t.noJobs}
            </Alert>
          ) : (
            /* Jobs Grid */
            <Grid container spacing={3}>
              {(showNearestOnly ? getNearestJobs(jobs) : jobs).map((job) => (
                <Grid item xs={12} md={6} key={job.id}>
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
                    <Box
                      sx={{
                        height: 6,
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                      }}
                    />
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      {/* Job Title */}
                      <Typography
                        variant="h5"
                        sx={{
                          fontSize: { xs: '1.25rem', sm: '1.4rem' },
                          fontWeight: 700,
                          color: theme.palette.primary.main,
                          mb: 2
                        }}
                      >
                        {job.jobTitle}
                      </Typography>

                      {/* Location */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <LocationOnIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {job.location}
                        </Typography>
                      </Box>

                      {/* Description */}
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <InfoIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                            {t.description}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                          {job.description}
                        </Typography>
                      </Box>

                      {/* Contact Info */}
                      {job.contactInfo && (
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <PhoneIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                              {t.contact}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {job.contactInfo}
                          </Typography>
                        </Box>
                      )}

                      {/* Apply Button */}
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => navigate('/job-application')}
                        sx={{
                          mt: 2,
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
                        {t.applyNow}
                      </Button>
                    </CardContent>
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

export default JobOpportunities;
