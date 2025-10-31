import React, { useState, useEffect } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

const TextToSpeech = ({ text, language = 'en-IN' }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);

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

  const speak = () => {
    if (!supported || !text) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    // Fix: Check both 'hindi' and 'hi' language codes
    const isHindi = language === 'hindi' || language === 'hi';
    utterance.lang = isHindi ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.85; // Slower for better clarity
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error('Speech error:', e);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
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
