import React, { useState, useEffect } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

const TextToSpeech = ({ text, language = 'en-IN' }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    // Check if speech synthesis is supported
    if (!('speechSynthesis' in window)) {
      setSupported(false);
      return;
    }

    // Get available voices
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    // Cleanup on unmount
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Detect if text contains Hindi characters
  const isHindiText = /[\u0900-\u097F]/.test(text);
  const effectiveLanguage = language === 'hindi' || language === 'hi' || isHindiText ? 'hi-IN' : 'en-IN';

  const speak = () => {
    if (!supported || !text) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language
    utterance.lang = effectiveLanguage;
    
    // Find appropriate voice for the language
    const voice = voices.find(v => v.lang.startsWith(effectiveLanguage.substring(0, 2))) ||
                  voices.find(v => v.lang.includes('hin')) ||
                  voices[0];
    
    if (voice) {
      utterance.voice = voice;
    }

    // Optimize speech parameters for Hindi clarity
    utterance.rate = effectiveLanguage === 'hi-IN' ? 0.75 : 0.85;
    utterance.pitch = effectiveLanguage === 'hi-IN' ? 1.1 : 1.0;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      // Ignore "interrupted" errors - they're normal when cancelling speech
      if (e.error !== 'interrupted') {
        console.error('Speech synthesis error:', e.error);
      }
      setIsSpeaking(false);
    };

    // Only cancel if something is currently being spoken
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      // Small delay to ensure cancel completes before starting new utterance
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 100);
    } else {
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!supported) return null;

  return (
    <Tooltip title={isSpeaking ? "Stop Reading" : "Read Aloud"}>
      <IconButton
        onClick={speak}
        color={isSpeaking ? "secondary" : "primary"}
        size="small"
        sx={{ ml: 1 }}
      >
        {isSpeaking ? <VolumeOffIcon /> : <VolumeUpIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default TextToSpeech;

