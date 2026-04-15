import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Fab,
  IconButton,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import MicIcon from '@mui/icons-material/Mic';
import SendIcon from '@mui/icons-material/Send';
import { useLanguage } from '../context/LanguageContext';
import TextToSpeech from './TextToSpeech';
import { generateGeminiReply } from '../services/geminiService';

// Parse markdown formatting in text (supports both English and Hindi)
// Converts **text** to bold formatting while preserving language
const parseMarkdownText = (text) => {
  if (!text) return null;
  
  const parts = [];
  let lastIndex = 0;
  const regex = /\*\*(.+?)\*\*/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {text.substring(lastIndex, match.index)}
        </span>
      );
    }
    // Add bold text (works with any language: English, Hindi, etc.)
    parts.push(
      <strong key={`bold-${match.index}`} style={{ fontWeight: 600 }}>
        {match[1]}
      </strong>
    );
    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(
      <span key={`text-${lastIndex}`}>
        {text.substring(lastIndex)}
      </span>
    );
  }

  return parts.length > 0 ? parts : text;
};

// Extract plain text without markdown formatting for TTS
// Removes ** symbols while preserving text in any language (English, Hindi, etc.)
const extractPlainText = (text) => {
  if (!text) return '';
  // Replace **text** with just text, works for all languages
  return text.replace(/\*\*(.+?)\*\*/g, '$1');
};

const DEFAULT_MODELS = [
  'models/gemini-2.5-flash',
  'models/gemini-2.5-pro',
  'models/gemini-2.0-flash'
];

const FloatingChatbot = () => {
  const { language } = useLanguage();
  const isHindi = language === 'hindi' || language === 'hi';
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  const models = useMemo(() => {
    const raw = process.env.REACT_APP_GEMINI_MODELS;
    const list = (raw || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    return list.length > 0 ? list : DEFAULT_MODELS;
  }, []);

  const greeting = useMemo(() => {
    return isHindi
      ? 'नमस्ते! मैं आपकी मदद कर सकता/सकती हूँ। आप किस योजना के बारे में जानना चाहते हैं? (मनरेगा, मजदूरी, जॉब कार्ड, शिकायत)'
      : 'Hello! I can help you. Which scheme do you want to know about? (MGNREGA, wages, job card, complaint)';
  }, [isHindi]);

  const [messages, setMessages] = useState([{ role: 'model', text: greeting }]);

  useEffect(() => {
    setMessages([{ role: 'model', text: greeting }]);
  }, [greeting]);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  }, [open, messages]);

  const quickQuestions = useMemo(() => {
    if (isHindi) {
      return [
        'मनरेगा में जॉब कार्ड कैसे बनता है?',
        'काम नहीं मिला तो क्या अधिकार हैं?',
        'मजदूरी देर से मिले तो क्या करें?',
        'शिकायत कैसे दर्ज करें?'
      ];
    }

    return [
      'How to get a job card in MGNREGA?',
      'What if I do not get work in 15 days?',
      'What to do if wage payment is delayed?',
      'How to file a complaint?'
    ];
  }, [isHindi]);

  const sendMessage = async (text) => {
    const trimmed = (text || '').trim();
    if (!trimmed || loading) return;

    setError('');
    const nextMessages = [...messages, { role: 'user', text: trimmed }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const reply = await generateGeminiReply({
        messages: nextMessages,
        language,
        model: models[0]
      });

      setMessages((prev) => [...prev, { role: 'model', text: reply || (isHindi ? 'माफ़ कीजिए, मुझे समझ नहीं आया।' : 'Sorry, I could not understand.') }]);
    } catch (e) {
      console.error('Gemini error:', e);
      const status = typeof e?.status === 'number' ? e.status : undefined;
      if (status === 403) {
        setError(
          isHindi
            ? '403: अनुमति नहीं मिली। कृपया API key सही है या नहीं, Generative Language API enabled है या नहीं, और API key restrictions (HTTP referrer) में localhost allowed है या नहीं—जांचें।'
            : '403: Permission denied. Check that your Gemini API key is valid, the Generative Language API is enabled, and API key restrictions (HTTP referrer) allow localhost.'
        );
      } else {
        setError(isHindi ? 'चैटबॉट अभी काम नहीं कर रहा। कृपया बाद में प्रयास करें।' : 'Chatbot is not working right now. Please try again later.');
      }
      setMessages((prev) => prev);
    } finally {
      setLoading(false);
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError(isHindi ? 'इस ब्राउज़र में वॉयस इनपुट सपोर्ट नहीं है।' : 'Voice input is not supported in this browser.');
      return;
    }

    if (listening) return;

    setError('');
    const recognition = new SpeechRecognition();
    recognition.lang = isHindi ? 'hi-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 2;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event?.results?.[0]?.[0]?.transcript;
      if (typeof transcript === 'string') {
        setInput(transcript);
      }
    };

    recognition.onerror = () => {
      setListening(false);
      setError(isHindi ? 'माइक की समस्या हुई। कृपया फिर से प्रयास करें।' : 'Microphone error. Please try again.');
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  const resetChat = () => {
    setError('');
    setInput('');
    setMessages([{ role: 'model', text: greeting }]);
  };

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          bottom: { xs: 150, sm: 96, md: 100 },
          right: { xs: 16, sm: 20, md: 24 },
          zIndex: 1100
        }}
      >
        <Fab
          color="secondary"
          onClick={() => setOpen(true)}
          sx={{
            width: { xs: 56, sm: 60, md: 64 },
            height: { xs: 56, sm: 60, md: 64 },
            boxShadow: 4,
            '&:hover': { boxShadow: 8 }
          }}
          aria-label={isHindi ? 'चैट सहायता' : 'Chat Help'}
        >
          <ChatIcon sx={{ fontSize: { xs: 24, sm: 28, md: 32 } }} />
        </Fab>
      </Box>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
        disableEnforceFocus
        PaperProps={{ 
          sx: { 
            borderRadius: 3,
            backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)'
          } 
        }}
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: 'blur(4px)',
              backgroundColor: 'rgba(0, 0, 0, 0.4)'
            }
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          pr: 1.5,
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
          py: 2
        }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
              {isHindi ? 'श्रमिक सहायता चैट' : 'Labour Help Chat'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mt: 0.5 }}>
              {isHindi ? 'सरकारी योजनाएँ और आपके अधिकार' : 'Government schemes and your rights'}
            </Typography>
          </Box>
          <IconButton 
            onClick={() => setOpen(false)} 
            size="small"
            sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2, pb: 1.5 }}>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {quickQuestions.map((q) => (
                <Button
                  key={q}
                  variant="outlined"
                  size="small"
                  onClick={() => sendMessage(q)}
                  disabled={loading}
                  sx={{ 
                    textTransform: 'none', 
                    borderRadius: 2.5,
                    fontSize: '0.875rem',
                    borderColor: '#1976d2',
                    color: '#1976d2',
                    '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.04)', borderColor: '#1565c0' },
                    '&:disabled': { opacity: 0.6 }
                  }}
                >
                  {q}
                </Button>
              ))}
              <Button
                variant="text"
                size="small"
                onClick={resetChat}
                disabled={loading}
                sx={{ 
                  textTransform: 'none', 
                  borderRadius: 2.5,
                  fontSize: '0.875rem',
                  color: '#757575',
                  '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
                  '&:disabled': { opacity: 0.6 }
                }}
              >
                {isHindi ? 'रीसेट' : 'Reset'}
              </Button>
            </Stack>

            <Box
              sx={{
                height: { xs: 360, sm: 420 },
                overflowY: 'auto',
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                p: 1.5,
                backgroundColor: '#fafbfc',
                backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #f5f7fa 100%)'
              }}
            >
              <Stack spacing={1.5}>
                {messages.map((m, idx) => {
                  const mine = m.role === 'user';
                  return (
                      <Box
                      key={`${idx}-${m.role}`}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: mine ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: '92%',
                          px: 1.5,
                          py: 1.25,
                          borderRadius: mine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          backgroundColor: mine ? '#1976d2' : '#ffffff',
                          color: mine ? '#ffffff' : '#212121',
                          border: mine ? 'none' : '1px solid #e0e0e0',
                          boxShadow: mine ? '0 2px 8px rgba(25,118,210,0.15)' : '0 1px 3px rgba(0,0,0,0.08)'
                        }}
                      >
                        <Typography sx={{ 
                          fontSize: '0.95rem', 
                          lineHeight: 1.6, 
                          whiteSpace: 'pre-wrap',
                          fontWeight: mine ? 500 : 400
                        }}>
                          {parseMarkdownText(m.text)}
                        </Typography>
                      </Box>
                      {!mine && (
                        <Box sx={{ mt: 0.5 }}>
                          <TextToSpeech 
                            text={extractPlainText(m.text)} 
                            language={language || 'en-IN'} 
                          />
                        </Box>
                      )}
                    </Box>
                  );
                })}
                <div ref={bottomRef} />
              </Stack>
            </Box>

            {error && (
              <Box
                sx={{
                  p: 1.25,
                  borderRadius: 2,
                  backgroundColor: '#ffebee',
                  border: '1px solid #ffcdd2'
                }}
              >
                <Typography variant="body2" color="#c62828" sx={{ fontWeight: 600 }}>
                  {error}
                </Typography>
              </Box>
            )}

            <Stack direction="row" spacing={1} alignItems="flex-end">
              <TextField
                value={input}
                onChange={(e) => setInput(e.target.value)}
                fullWidth
                placeholder={isHindi ? 'अपना सवाल लिखें या बोलें…' : 'Type or speak your question…'}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'white',
                    '&:hover fieldset': { borderColor: '#1976d2' },
                    '&.Mui-focused fieldset': { borderColor: '#1976d2', borderWidth: 2 }
                  },
                  '& .MuiOutlinedInput-input': {
                    fontSize: '0.95rem',
                    '&::placeholder': { opacity: 0.7 }
                  }
                }}
              />

              <IconButton
                onClick={startVoiceInput}
                disabled={loading || listening}
                color={listening ? 'error' : 'primary'}
                size="medium"
                sx={{
                  '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.08)' },
                  '&.Mui-disabled': { opacity: 0.5 }
                }}
              >
                <MicIcon sx={{ fontSize: '1.5rem' }} />
              </IconButton>

              <IconButton
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                color="primary"
                size="medium"
                sx={{
                  '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.08)' },
                  '&.Mui-disabled': { opacity: 0.5 }
                }}
              >
                {loading ? <CircularProgress size={20} /> : <SendIcon sx={{ fontSize: '1.5rem' }} />}
              </IconButton>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FloatingChatbot;

