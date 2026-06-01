/* ════════════════════════════════════════════
   WEB SPEECH API HELPER
   ════════════════════════════════════════════ */

let _speechUtterance = null;

function _getEnglishVoice() {
  if (!window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  return voices.find(v => /en[-_](US|GB|AU)/i.test(v.lang) && /natural|google|samantha|zira|david/i.test(v.name))
      || voices.find(v => /en[-_](US|GB)/i.test(v.lang))
      || null;
}

function stopSpeech() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  _speechUtterance = null;
  _updateSpeechUI(false);
}

function speakScript(text) {
  if (!window.speechSynthesis) return;
  stopSpeech();
  const u = new SpeechSynthesisUtterance(text);
  u.lang  = 'en-US';
  u.rate  = 0.92;
  u.pitch = 1.05;
  u.volume = 1;
  
  const preferred = _getEnglishVoice();
  if (preferred) u.voice = preferred;
  
  u.onstart = () => _updateSpeechUI(true);
  u.onend   = () => _updateSpeechUI(false);
  u.onerror  = () => _updateSpeechUI(false);
  _speechUtterance = u;
  window.speechSynthesis.speak(u);
}

function replaySpeech() {
  if (typeof examQuestions !== 'undefined' && typeof currentQIdx !== 'undefined') {
    const q = examQuestions[currentQIdx];
    if (q && q.script) speakScript(q.script);
  }
}

function _updateSpeechUI(isPlaying) {
  const waves = document.getElementById('sp-waves');
  const status = document.getElementById('sp-status');
  const playBtn = document.getElementById('sp-play-btn');
  if (!waves) return;
  if (isPlaying) {
    waves.classList.add('playing');
    if (status) status.textContent = 'Đang phát...';
    if (playBtn) playBtn.innerHTML = `<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
  } else {
    waves.classList.remove('playing');
    if (status) status.textContent = 'Nhấn ▶ để nghe lại';
    if (playBtn) playBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
  }
}
