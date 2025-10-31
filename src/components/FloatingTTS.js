import React, { useState, useEffect } from 'react';
import { Fab, Tooltip, Box } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { useLanguage } from '../context/LanguageContext';

const FloatingTTS = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    // Check if speech synthesis is supported
    if (!('speechSynthesis' in window)) {
      setSupported(false);
    }
    
    // Cleanup on unmount
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const readPage = () => {
    if (!supported) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Get all text content from the page (excluding scripts, styles, etc.)
    const mainContent = document.querySelector('main') || document.body;
    
    // Extract text from important elements
    const textElements = mainContent.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, td, th');
    const textContent = Array.from(textElements)
      .map(el => {
        const text = el.textContent.trim();
        // Skip navigation elements, buttons, and footer content
        if (text.includes('Go Back') || 
            text.includes('वापस जाएं') ||
            text.includes('©') ||
            text.includes('View Information') ||
            text.includes('Detect Your Location') ||
            text.length === 0) {
          return '';
        }
        return text;
      })
      .filter(text => text.length > 0)
      .join('. ');

    if (!textContent) {
      alert(language === 'hindi' ? 'पढ़ने के लिए कोई सामग्री नहीं है' : 'No content to read');
      return;
    }

    console.log('Reading text:', textContent.substring(0, 100) + '...');

    const utterance = new SpeechSynthesisUtterance(textContent);
    const isHindi = language === 'hindi' || language === 'hi';
    
    // Set language
    utterance.lang = isHindi ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.8; // Slower for better clarity
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to select appropriate voice
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const hindiVoice = voices.find(voice => 
        voice.lang.includes('hi') || voice.lang.includes('Hindi')
      );
      const englishVoice = voices.find(voice => 
        voice.lang.includes('en-IN') || voice.name.includes('India')
      );
      
      if (isHindi && hindiVoice) {
        utterance.voice = hindiVoice;
        console.log('Using Hindi voice:', hindiVoice.name);
      } else if (!isHindi && englishVoice) {
        utterance.voice = englishVoice;
        console.log('Using English voice:', englishVoice.name);
      }
    }

    utterance.onstart = () => {
      console.log('Speech started');
      setIsSpeaking(true);
    };
    utterance.onend = () => {
      console.log('Speech ended');
      setIsSpeaking(false);
    };
    utterance.onerror = (e) => {
      console.error('Speech error:', e);
      alert(language === 'hindi' 
        ? 'आवाज़ चलाने में समस्या है। कृपया पुनः प्रयास करें।' 
        : 'Error playing audio. Please try again.');
      setIsSpeaking(false);
    };

    // Load voices if not loaded yet
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.addEventListener('voiceschanged', () => {
        window.speechSynthesis.speak(utterance);
      }, { once: true });
    } else {
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!supported) return null;

  const tooltipText = isSpeaking 
    ? (language === 'hindi' ? 'पढ़ना बंद करें' : 'Stop Reading')
    : (language === 'hindi' ? 'पेज पढ़ें' : 'Read Page Aloud');

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: { xs: 80, sm: 20, md: 24 },
        right: { xs: 16, sm: 20, md: 24 },
        zIndex: 1000,
      }}
    >
      <Tooltip title={tooltipText} placement="left">
        <Fab
          color={isSpeaking ? "secondary" : "primary"}
          onClick={readPage}
          sx={{
            width: { xs: 56, sm: 60, md: 64 },
            height: { xs: 56, sm: 60, md: 64 },
            boxShadow: 4,
            '&:hover': {
              boxShadow: 8,
            },
          }}
        >
          {isSpeaking ? (
            <VolumeOffIcon sx={{ fontSize: { xs: 24, sm: 28, md: 32 } }} />
          ) : (
            <VolumeUpIcon sx={{ fontSize: { xs: 24, sm: 28, md: 32 } }} />
          )}
        </Fab>
      </Tooltip>
    </Box>
  );
};

export default FloatingTTS;
