import { useState, useEffect, useCallback, useRef } from 'react';

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState([]);
  const activeUtteranceRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);

      const updateVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;

      return () => {
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      };
    }
  }, []);

  const getVoiceForLang = useCallback((langCode) => {
    if (!voices || voices.length === 0) return null;

    let targetLang = 'en-IN';
    if (langCode === 'hi') targetLang = 'hi-IN';
    if (langCode === 'pa') targetLang = 'pa-IN';

    // Exact match
    let matched = voices.find(v => v.lang === targetLang || v.lang.startsWith(targetLang));
    if (matched) return matched;

    // Language prefix match
    const prefix = targetLang.split('-')[0];
    matched = voices.find(v => v.lang.startsWith(prefix));
    if (matched) return matched;

    // Punjabi fallback to Hindi voice if Punjabi not present
    if (langCode === 'pa') {
      matched = voices.find(v => v.lang.startsWith('hi'));
      if (matched) return matched;
    }

    // Default fallback
    return voices.find(v => v.lang.startsWith('en')) || voices[0];
  }, [voices]);

  const speak = useCallback((text, lang = 'en', onEndCallback = null) => {
    if (!isSupported || !text) return;

    try {
      window.speechSynthesis.cancel();

      // Clean text of markdown/emojis for smooth speech
      const cleanText = text
        .replace(/[*_#`~]/g, '')
        .replace(/[^\w\s\u0900-\u097F\u0A00-\u0A7F.,!?₹\-]/gi, ' ')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const voice = getVoiceForLang(lang);
      if (voice) {
        utterance.voice = voice;
      }
      
      utterance.lang = lang === 'hi' ? 'hi-IN' : lang === 'pa' ? 'pa-IN' : 'en-IN';
      utterance.rate = 0.92; // Slightly measured rate for clear understanding
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        if (onEndCallback) onEndCallback();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis notice:', e);
        setIsSpeaking(false);
      };

      activeUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
      setIsSpeaking(false);
    }
  }, [isSupported, getVoiceForLang]);

  const stop = useCallback(() => {
    if (isSupported && typeof window !== 'undefined') {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported
  };
};
