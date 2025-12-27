// Audio Helper Utility
// Centralized audio control for the entire application

export const speakText = (text, audioEnabled = true, options = {}) => {
  if (!audioEnabled) {
    return;
  }

  const synth = window.speechSynthesis;
  synth.cancel(); // Cancel any ongoing speech

  const utterance = new SpeechSynthesisUtterance(text);

  // Apply optional settings
  if (options.rate) utterance.rate = options.rate;
  if (options.pitch) utterance.pitch = options.pitch;
  if (options.volume) utterance.volume = options.volume;
  if (options.voice) utterance.voice = options.voice;

  synth.speak(utterance);
};

export const stopSpeaking = () => {
  const synth = window.speechSynthesis;
  synth.cancel();
};
