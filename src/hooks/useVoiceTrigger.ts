import { useEffect, useRef } from 'react';

export const useVoiceTrigger = (onTrigger: () => void, isActive: boolean) => {
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition || !isActive) {
      if (recognitionRef.current) recognitionRef.current.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      console.log("🎤 Voice Heard:", transcript);

      // --- KEYWORD DETECTION ---
      if (transcript.includes("help me") || transcript.includes("emergency") || transcript.includes("bachao")) {
        onTrigger();
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Voice Recognition Error:", event.error);
      // Restart on error to keep listening
      if (event.error !== 'no-speech') recognition.start();
    };

    recognition.onend = () => {
      // Keep it listening indefinitely while monitoring is active
      if (isActive) recognition.start();
    };

    recognition.start();
    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [isActive, onTrigger]);
};