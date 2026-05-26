/* ════════════════════════════════════════════════════════
   SPEAKING MODULE — speaking.js
   Tính năng độc lập, không ảnh hưởng app.js
   Thầy có thể chỉnh sửa thoải mái file này
 ════════════════════════════════════════════════════════ */

/* ─── STATE ─── */
const SPK = {
  topics: [],           // Danh sách topics từ topics-index.json
  currentTopic: null,   // Topic đang chọn { id, title, icon, subtopics: [] }
  currentSubtopic: null,// Subtopic đang luyện { name, sentences: [] }
  playingIndex: null,   // Index câu đang phát
  playAllMode: false,   // Đang play all hay không
};

/* ─── SPEECH ENGINE ─── */
const spkSynth = window.speechSynthesis;

function spkStop() {
  if (spkSynth.speaking) spkSynth.cancel();
  SPK.playingIndex = null;
  SPK.playAllMode = false;
  spkUpdateButtons();
}

function spkSpeak(text, index, onEnd) {
  if (spkSynth.speaking) spkSynth.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'en-US';
  utt.rate = 0.92;
  utt.pitch = 1.0;
  // Chọn giọng đọc tốt nhất có sẵn
  const voices = spkSynth.getVoices();
  const best = voices.find(v => v.lang === 'en-US' && v.localService)
    || voices.find(v => v.lang.startsWith('en'))
    || voices[0];
  if (best) utt.voice = best;
  utt.onstart = () => { SPK.playingIndex = index; spkUpdateButtons(); };
  utt.onend   = () => { SPK.playingIndex = null; spkUpdateButtons(); if (onEnd) onEnd(); };
  utt.onerror = () => { SPK.playingIndex = null; spkUpdateButtons(); };
  spkSynth.speak(utt);
}

function spkTogglePlay(index) {
  SPK.playAllMode = false;
  if (SPK.playingIndex === index && spkSynth.speaking) { spkStop(); return; }
  const sentences = SPK.currentSubtopic.sentences;
  spkSpeak(sentences[index].text, index);
}

function spkPlayAll() {
  if (SPK.playAllMode) { spkStop(); return; }
  const sentences = SPK.currentSubtopic.sentences;
  SPK.playAllMode = true;
  let i = 0;
  function next() {
    if (!SPK.playAllMode || i >= sentences.length) {
      SPK.playAllMode = false; SPK.playingIndex = null; spkUpdateButtons(); return;
    }
    spkSpeak(sentences[i].text, i, () => { if (SPK.playAllMode) { i++; setTimeout(next, 450); } });
  }
  next();
}

function spkUpdateButtons() {
  // Cập nhật từng nút play trong sentence cards
  document.querySelectorAll('.spk-play-btn').forEach((btn, i) => {
    const isPlaying = SPK.playingIndex === i;
    btn.innerHTML = isPlaying ? '⏹' : '🔊';
    btn.closest('.sentence-card')?.classList.toggle('playing', isPlaying);
  });
  // Cập nhật nút Play All
  const btn = document.getElementById('spk-btn-play-all');
  if (btn) {
    btn.textContent = SPK.playAllMode ? '⏹ Stop' : '▶ Play All';
    btn.style.background = SPK.playAllMode
      ? 'linear-gradient(135deg,#e07b5a,#c0563a)'
      : '';
  }
}

/* ─── NAVIGATION ─── */
function spkGoBack() {
  spkStop();
  if (document.getElementById('page-speaking-practice').classList.contains('active')) {
    SPK.currentSubtopic = null;
    showPage('page-speaking-subtopics');
  } else if (document.getElementById('page-speaking-subtopics').classList.contains('active')) {
    SPK.currentTopic = null;
    showPage('page-speaking-topics');
  } else {
    showPage('page-home');
  }
}

/* ─── TRANG 1: DANH SÁCH TOPIC ─── */
async function openSpeakingTopicsPage() {
  showPage('page-speaking-topics');
  const container = document.getElementById('speaking-topics-list');
  container.innerHTML = '<div class="units-loading"><div class="loader"></div>Đang tải...</div>';

  try {
    if (SPK.topics.length === 0) {
      // ← Đây là nơi load file topics-index.json
      const res = await fetch(`./content/speaking/topics-index.json?t=${Date.now()}`);
      if (!res.ok) throw new Error('Không tìm thấy file');
      SPK.topics = await res.json();
    }
    renderSpeakingTopics();
  } catch (e) {
    container.innerHTML = `
      <div class="units-loading" style="color:var(--c-danger);">
        ⚠️ Không thể tải danh sách chủ đề.<br>
        <span style="font-size:.78rem;color:var(--c-muted);">
          Kiểm tra file: content/speaking/topics-index.json
        </span>
      </div>`;
  }
}

function renderSpeakingTopics() {
  const container = document.getElementById('speaking-topics-list');
  if (SPK.topics.length === 0) {
    container.innerHTML = '<div class="units-loading">📭 Chưa có chủ đề nào.</div>';
    return;
  }
  container.innerHTML = SPK.topics.map((topic, i) => `
    <div class="cat-card" style="animation-delay:${i * .07}s"
      onclick="openSpeakingSubtopics('${topic.id}')">
      <div class="cat-icon">${topic.icon || '🎤'}</div>
      <div class="cat-info">
        <div class="cat-title">${topic.title}</div>
        <div class="cat-desc">${topic.description || ''}</div>
      </div>
      <div class="cat-badge">
        <div class="cat-badge-num">${topic.sentenceCount || 0}</div>
        <div class="cat-badge-label">câu</div>
      </div>
      <div class="cat-arrow">›</div>
    </div>
  `).join('');
}

/* ─── TRANG 2: DANH SÁCH SUBTOPIC ─── */
async function openSpeakingSubtopics(topicId) {
  const container = document.getElementById('speaking-subtopics-list');
  container.innerHTML = '<div class="units-loading"><div class="loader"></div>Đang tải...</div>';
  showPage('page-speaking-subtopics');

  try {
    // Nếu chưa load topic này, fetch từ JSON
    if (!SPK.currentTopic || SPK.currentTopic.id !== topicId) {
      const res = await fetch(`./content/speaking/${topicId}.json?t=${Date.now()}`);
      if (!res.ok) throw new Error();
      SPK.currentTopic = await res.json();
    }
    renderSpeakingSubtopics();
  } catch (e) {
    container.innerHTML = `
      <div class="units-loading" style="color:var(--c-danger);">
        ⚠️ Không tải được chủ đề này.<br>
        <span style="font-size:.78rem;">Kiểm tra: content/speaking/${topicId}.json</span>
      </div>`;
  }
}

function renderSpeakingSubtopics() {
  document.getElementById('spk-subtopic-nav-title').textContent = SPK.currentTopic.title;
  document.getElementById('spk-subtopic-header-icon').textContent = SPK.currentTopic.icon || '🎤';
  document.getElementById('spk-subtopic-header-title').textContent = SPK.currentTopic.title;

  const container = document.getElementById('speaking-subtopics-list');
  container.innerHTML = SPK.currentTopic.subtopics.map((sub, i) => `
    <div class="cat-card" style="animation-delay:${i * .07}s"
      onclick="openSpeakingPractice('${sub.id}')">
      <div class="cat-icon">${sub.icon || '📝'}</div>
      <div class="cat-info">
        <div class="cat-title">${sub.name}</div>
        <div class="cat-desc">${sub.sentences.length} câu luyện tập</div>
      </div>
      <div class="cat-badge">
        <div class="cat-badge-num">${sub.sentences.length}</div>
        <div class="cat-badge-label">câu</div>
      </div>
      <div class="cat-arrow">›</div>
    </div>
  `).join('');
}

/* ─── TRANG 3: LUYỆN NÓI ─── */
function openSpeakingPractice(subtopicId) {
  spkStop();
  SPK.currentSubtopic = SPK.currentTopic.subtopics.find(s => s.id === subtopicId);
  if (!SPK.currentSubtopic) return;

  // Cập nhật header
  document.getElementById('spk-practice-nav-title').textContent = SPK.currentSubtopic.name;
  document.getElementById('spk-practice-title').textContent =
    `${SPK.currentSubtopic.icon || ''} ${SPK.currentSubtopic.name}`;
  document.getElementById('spk-practice-subtitle').textContent =
    `${SPK.currentSubtopic.sentences.length} câu · Nhấn 🔊 để nghe từng câu`;
  document.getElementById('spk-breadcrumb').innerHTML =
    `${SPK.currentTopic.title} <span class="breadcrumb-sep">›</span> ${SPK.currentSubtopic.name}`;

  // Render sentence cards
  document.getElementById('spk-sentences-list').innerHTML =
    SPK.currentSubtopic.sentences.map((s, i) => `
      <div class="sentence-card" id="spk-sc-${i}">
        <div class="sentence-num">${i + 1}</div>
        <div class="sentence-content">
          <div class="sentence-text">${s.text}</div>
          <div class="sentence-vi">🇻🇳 ${s.vi}</div>
          <div class="sentence-type ${s.type || 'basic'}">${s.type || 'basic'}</div>
        </div>
        <button class="spk-play-btn btn-play" onclick="spkTogglePlay(${i})" title="Nghe câu này">
          🔊
        </button>
      </div>
    `).join('');

  showPage('page-speaking-practice');
}

/* ─── INIT VOICES ─── */
if (spkSynth.onvoiceschanged !== undefined) {
  spkSynth.onvoiceschanged = () => spkSynth.getVoices();
}
