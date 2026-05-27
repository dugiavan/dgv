/* ════════════════════════════════════════════
   SESSION STORAGE  (auth token + profile)
════════════════════════════════════════════ */
const SESSION_KEY = 'dv_eng_session';

// currentUser: { student_id, username, full_name, role, department, level, xp, streak, lastDate }
let currentUser = null;

function saveSession(user) {
  const data = { ...user, _expires: Date.now() + CONFIG.SESSION_HOURS * 3600 * 1000 };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  currentUser = user;
}
function loadSession() {
  try {
    const d = JSON.parse(sessionStorage.getItem(SESSION_KEY));
    if (!d) return null;
    if (Date.now() > d._expires) { sessionStorage.removeItem(SESSION_KEY); return null; }
    delete d._expires;
    return d;
  } catch (e) { return null; }
}
function clearSession() { sessionStorage.removeItem(SESSION_KEY); currentUser = null; }

/* ════════════════════════════════════════════
   PAGE ROUTING
════════════════════════════════════════════ */
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  const nav = document.getElementById('bottom-nav');
  id === 'page-login' ? nav.classList.remove('visible') : nav.classList.add('visible');
  document.querySelectorAll('.bn-item').forEach(b => b.classList.remove('active'));
  if (id === 'page-home') document.getElementById('bn-home').classList.add('active');
  if (id === 'page-leaderboard') document.getElementById('bn-lb').classList.add('active');
  if (id === 'page-history') document.getElementById('bn-history').classList.add('active');
  document.getElementById(id).scrollTop = 0;
  // Lazy loaders
  if (id === 'page-theory') loadTheory();
  if (id === 'page-setup') loadQuestions();
  if (id === 'page-leaderboard') loadLeaderboard();
  if (id === 'page-history') loadHistory();
  if (id === 'page-blog-list') { if (typeof openBlogList === 'function') openBlogList(); }
}

/* ════════════════════════════════════════════
   LOGIN FLOW
════════════════════════════════════════════ */
function togglePw() {
  const inp = document.getElementById('inp-password');
  const eye = document.getElementById('pw-eye');
  inp.type = inp.type === 'password' ? 'text' : 'password';
  eye.textContent = inp.type === 'password' ? '👁' : '🙈';
}

function setLoginLoading(on) {
  document.getElementById('login-spinner').classList.toggle('show', on);
  document.getElementById('login-btn-text').textContent = on ? 'Đang xác thực...' : 'Đăng nhập ✨';
  document.getElementById('btn-login').disabled = on;
}
function setLoginError(msg) {
  const el = document.getElementById('login-error');
  el.textContent = msg;
  if (msg) {
    document.getElementById('inp-username').classList.toggle('input-error', true);
    document.getElementById('inp-password').classList.toggle('input-error', true);
    setTimeout(() => {
      document.getElementById('inp-username').classList.remove('input-error');
      document.getElementById('inp-password').classList.remove('input-error');
    }, 2000);
  }
}

async function doLogin() {
  const username = document.getElementById('inp-username').value.trim();
  const password = document.getElementById('inp-password').value;
  if (!username) { setLoginError('Vui lòng nhập tên đăng nhập'); return; }
  if (!password) { setLoginError('Vui lòng nhập mật khẩu'); return; }
  if (!CONFIG.SHEETS_URL || CONFIG.SHEETS_URL.includes('YOUR_SCRIPT_ID')) {
    setLoginError('⚠️ Chưa cấu hình Google Sheets URL'); return;
  }
  setLoginLoading(true);
  setLoginError('');
  try {
    const url = CONFIG.SHEETS_URL + '?action=login'
      + '&username=' + encodeURIComponent(username)
      + '&password=' + encodeURIComponent(password);
    const res = await fetch(url);
    const json = await res.json();
    if (json.status === 'ok' && json.user) {
      const u = json.user;
      saveSession({
        student_id: u.student_id || '',
        username: u.username || username,
        full_name: u.full_name || username,
        role: u.role || '',
        department: u.department || '',
        level: Number(u.level) || 1,
        xp: Number(u.xp) || 0,
        streak: Number(u.streak) || 0,
        lastDate: u.lastDate || '',
      });
      updateStreakOnLogin();
      initHome();
      showPage('page-home');
    } else {
      setLoginError(json.message || 'Sai tên đăng nhập hoặc mật khẩu');
    }
  } catch (e) {
    setLoginError('Lỗi kết nối. Kiểm tra mạng và thử lại.');
  } finally {
    setLoginLoading(false);
  }
}

function updateStreakOnLogin() {
  if (!currentUser) return;
  const today = new Date().toDateString();
  if (currentUser.lastDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    currentUser.streak = currentUser.lastDate === yesterday ? currentUser.streak + 1 : 1;
    currentUser.lastDate = today;
    saveSession(currentUser);
  }
}

function doLogout() {
  if (CONFIG.DEMO_MODE) {
    // Demo: đăng xuất xong tự đăng nhập lại — khách không bị kẹt ở trang login
    clearSession();
    clearHistoryCache();
    // Tự reload lại trang → DOMContentLoaded chạy lại → tự login lại
    window.location.reload();
    return;
  }
  if (!confirm('Đăng xuất?')) return;
  clearSession();
  clearHistoryCache();
  document.getElementById('inp-username').value = '';
  document.getElementById('inp-password').value = '';
  showPage('page-login');
}

/* ════════════════════════════════════════════
   HOME / PROFILE / GAMI
════════════════════════════════════════════ */
function initHome() {
  if (!currentUser) return;
  document.getElementById('profile-name').textContent = currentUser.full_name;
  const avatarMap = { 'lớp trưởng': '👑', 'giám thị': '🎓', 'học sinh': '🌿', 'default': '🌿' };
  const key = (currentUser.role || '').toLowerCase();
  document.getElementById('profile-avatar').textContent = avatarMap[key] || avatarMap['default'];
  const roleEl = document.getElementById('profile-role');
  const deptEl = document.getElementById('profile-dept');
  if (currentUser.role) { roleEl.textContent = currentUser.role; roleEl.style.display = ''; }
  if (currentUser.department) { deptEl.textContent = currentUser.department; deptEl.style.display = ''; }
  document.getElementById('profile-id').textContent = currentUser.student_id ? 'ID: ' + currentUser.student_id : '';
  refreshGamiCard();
  loadUnits();
  if (typeof blogInitHome === 'function') blogInitHome();
}

function getLevelInfo(xp) {
  let cur = LEVELS[0], next = LEVELS[1];
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].xp) { cur = LEVELS[i]; next = LEVELS[i + 1] || null; } else break;
  }
  return { cur, next };
}

function refreshGamiCard() {
  if (!currentUser) return;
  const { cur, next } = getLevelInfo(currentUser.xp);
  document.getElementById('gami-lv').textContent = cur.lv;
  const titleEl = document.getElementById('gami-lv-title');
  titleEl.textContent = cur.title;
  titleEl.title = cur.title;
  document.getElementById('gami-streak').textContent = currentUser.streak;
  document.getElementById('gami-xp-cur').textContent = currentUser.xp.toLocaleString('vi-VN');
  if (next) {
    document.getElementById('gami-xp-next').textContent = next.xp.toLocaleString('vi-VN');
    const pct = Math.min(100, ((currentUser.xp - cur.xp) / (next.xp - cur.xp)) * 100);
    document.getElementById('gami-bar').style.width = pct + '%';
    const need = next.xp - currentUser.xp;
    document.getElementById('gami-next-label').textContent =
      `Cần ${need.toLocaleString('vi-VN')} XP để lên Lv.${next.lv}`;
  } else {
    document.getElementById('gami-xp-next').textContent = '∞';
    document.getElementById('gami-bar').style.width = '100%';
    document.getElementById('gami-next-label').textContent = 'Cấp độ tối đa! 🎉';
  }
}

/* ════════════════════════════════════════════
   UNITS
════════════════════════════════════════════ */
let allUnits = [];
async function loadUnits() {
  const c = document.getElementById('units-container');
  c.innerHTML = '<div class="units-loading"><div class="loader"></div>Đang tải bài học...</div>';
  try {
    const r = await fetch(CONFIG.UNITS_INDEX + '?t=' + Date.now());
    if (!r.ok) throw new Error();
    allUnits = await r.json();
    renderCategories();
  } catch (e) {
    c.innerHTML = '<div class="units-loading" style="color:var(--c-danger);">⚠️ Chưa có dữ liệu bài học.<br><span style="font-size:.78rem;color:var(--c-muted);">Thêm file content/units-index.json</span></div>';
  }
}

function renderCategories() {
  const c = document.getElementById('units-container');
  if (!allUnits.length) { c.innerHTML = '<div class="units-loading">📭 Chưa có bài học nào.</div>'; return; }

  // Group units by category
  const grouped = {};
  allUnits.forEach(u => {
    const cat = u.category || 'other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(u);
  });

  let html = '';
  let idx = 0;
  for (const [catKey, units] of Object.entries(grouped)) {
    const catMeta = CATEGORIES[catKey] || { icon: '📁', title: catKey, desc: '' };
    const totalQ = units.reduce((s, u) => s + (u.questionCount || 0), 0);
    html += `
      <div class="cat-card" style="animation-delay:${idx * .08}s" onclick="openCategory('${catKey}')">
        <div class="cat-icon">${catMeta.icon}</div>
        <div class="cat-info">
          <div class="cat-title">${catMeta.title}</div>
          <div class="cat-desc">${units.length} bài học · ${totalQ} câu hỏi</div>
        </div>
        <div class="cat-badge">
          <div class="cat-badge-num">${units.length}</div>
          <div class="cat-badge-label">bài</div>
        </div>
        <div class="cat-arrow">›</div>
      </div>`;
    idx++;
  }
  c.innerHTML = html;
}

function openCategory(catKey) {
  lastOpenCategory = catKey;
  const catMeta = CATEGORIES[catKey] || { icon: '📁', title: catKey, desc: '' };
  const units = allUnits.filter(u => (u.category || 'other') === catKey);

  document.getElementById('cat-nav-title').textContent = catMeta.title;
  document.getElementById('cat-header-icon').textContent = catMeta.icon;
  document.getElementById('cat-header-title').textContent = catMeta.title;
  document.getElementById('cat-header-desc').textContent = catMeta.desc;

  const list = document.getElementById('cat-units-list');
  list.innerHTML = units.map((u, i) => `
    <div class="unit-card" style="animation-delay:${i * .05}s" onclick="openUnit('${u.id}')">
      <div class="unit-icon">${u.icon || '📘'}</div>
      <div class="unit-info"><div class="unit-title">${u.title}</div><div class="unit-desc">${u.description || ''}</div></div>
      <div class="unit-badge">${u.questionCount || '?'} câu</div>
    </div>`).join('');

  showPage('page-category');
}

// Legacy renderUnits - keep for backward compat
function renderUnits() { renderCategories(); }

/* ════════════════════════════════════════════
   UNIT DETAIL
════════════════════════════════════════════ */
let currentUnit = null;
let lastOpenCategory = null;

async function openUnit(id) {
  currentUnit = allUnits.find(u => u.id === id);
  if (!currentUnit) return;
  // Track which category this unit belongs to
  if (!lastOpenCategory && currentUnit.category) lastOpenCategory = currentUnit.category;
  try {
    const r = await fetch(`./content/${id}/unit.json?t=${Date.now()}`);
    if (r.ok) currentUnit = { ...currentUnit, ...(await r.json()) };
  } catch (e) { }
  document.getElementById('detail-icon').textContent = currentUnit.icon || '📘';
  document.getElementById('detail-nav-title').textContent = currentUnit.title;
  document.getElementById('detail-title').textContent = currentUnit.title;
  document.getElementById('detail-desc').textContent = currentUnit.description || '';
  showPage('page-detail');
}

function goBackFromDetail() {
  if (lastOpenCategory) {
    openCategory(lastOpenCategory);
  } else {
    showPage('page-home');
  }
}

/* ════════════════════════════════════════════
   THEORY
════════════════════════════════════════════ */
async function loadTheory() {
  const b = document.getElementById('theory-body');
  b.innerHTML = '<div class="loader" style="margin:2rem auto;"></div>';
  try {
    const r = await fetch(`./content/${currentUnit.id}/theory.md?t=${Date.now()}`);
    if (!r.ok) throw new Error();
    b.innerHTML = marked.parse(await r.text());
  } catch (e) { b.innerHTML = '<p style="color:var(--c-muted);text-align:center;padding:2rem;">📭 Chưa có lý thuyết.</p>'; }
}

/* ════════════════════════════════════════════
   SETUP
════════════════════════════════════════════ */
let selectedDiff = 'medium', allQuestions = [];
let selectedQty = 'all'; // 5, 10, 20, or 'all'
let isRandom = false;

function selectDiff(d) {
  selectedDiff = d;
  ['easy', 'medium', 'hard'].forEach(x => document.getElementById('diff-' + x).classList.toggle('active', x === d));
  updateSetupInfo();
}

function selectQty(n) {
  selectedQty = n;
  [5, 10, 20, 'all'].forEach(v => {
    const el = document.getElementById('qty-' + v);
    if (el) el.classList.toggle('active', v === n);
  });
  updateSetupInfo();
}

function toggleRandom() {
  isRandom = document.getElementById('random-toggle').checked;
}

function updateSetupInfo() {
  if (!allQuestions.length) return;
  const qs = allQuestions.filter(q => q.difficulty === selectedDiff);
  const totalAvailable = qs.length;
  const qtyNum = selectedQty === 'all' ? totalAvailable : Math.min(selectedQty, totalAvailable);
  const xp = XP_PER_Q[selectedDiff];
  const diffName = { easy: 'Dễ', medium: 'Vừa', hard: 'Khó' }[selectedDiff];
  const qtyLabel = selectedQty === 'all' ? `Tất cả (${totalAvailable})` : `${qtyNum}/${totalAvailable}`;
  document.getElementById('setup-info').innerHTML =
    `📝 <b>${qtyLabel}</b> câu &nbsp;·&nbsp; Độ khó: <b>${diffName}</b><br>XP tối đa: <b style="color:var(--c-warning);">+${xp * qtyNum} ⭐</b> (${xp} XP/câu)`;
}

async function loadQuestions() {
  if (!currentUnit) return;
  try {
    const r = await fetch(`./content/${currentUnit.id}/questions.json?t=${Date.now()}`);
    if (!r.ok) throw new Error();
    allQuestions = await r.json();
    updateSetupInfo();
  } catch (e) { allQuestions = []; document.getElementById('setup-info').textContent = '⚠️ Chưa có câu hỏi.'; }
}

/* ════════════════════════════════════════════
   EXERCISE ENGINE
════════════════════════════════════════════ */
let examQuestions = [], currentQIdx = 0, userAnswers = [], answered = false, selectedOptIdx = -1;

function startExam() {
  let qs = allQuestions.filter(q => q.difficulty === selectedDiff);
  if (!qs.length) { alert('Chưa có câu hỏi cho độ khó này!'); return; }

  // Shuffle if random is toggled on
  if (isRandom) {
    qs = shuffle([...qs]);
  } else {
    qs = [...qs]; // keep original order
  }

  // Limit by selected quantity
  if (selectedQty !== 'all' && typeof selectedQty === 'number') {
    qs = qs.slice(0, selectedQty);
  }

  examQuestions = qs;
  currentQIdx = 0; userAnswers = []; answered = false;
  document.getElementById('ex-nav-title').textContent = currentUnit.title;
  showPage('page-exercise');
  renderQuestion();
}
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }

function renderQuestion() {
  const q = examQuestions[currentQIdx], total = examQuestions.length;
  document.getElementById('ex-prog-fill').style.width = (currentQIdx / total * 100) + '%';
  document.getElementById('ex-prog-text').textContent = `${currentQIdx + 1}/${total}`;
  const btnC = document.getElementById('btn-check');
  btnC.style.display = ''; btnC.disabled = true;
  document.getElementById('btn-nxt').style.display = 'none';
  answered = false; selectedOptIdx = -1;

  // Stop any ongoing speech from previous question
  stopSpeech();

  const area = document.getElementById('question-area');
  const typeLabel = q.type === 'fill_blank' ? '✍️ Điền vào chỗ trống' : '🔘 Chọn đáp án đúng';
  const qText = (q.question || q.q || '').replace(/___+/g, '<em>___</em>');

  // Build speech player HTML if question has a script
  const speechHTML = q.script ? `
    <div class="speech-player">
      <div class="speech-player-icon" id="sp-play-btn" onclick="replaySpeech()" title="Phát lại">
        <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
      </div>
      <div class="speech-player-label">
        <div class="sp-title">🔊 Nghe câu hỏi</div>
        <div class="sp-status" id="sp-status">Đang chuẩn bị...</div>
      </div>
      <div class="speech-waves" id="sp-waves">
        <span></span><span></span><span></span><span></span><span></span>
      </div>
      <button class="speech-stop-btn" onclick="stopSpeech()" title="Dừng">■ Dừng</button>
    </div>` : '';

  if (q.type === 'multiple_choice') {
    const opts = q.options || q.choices || [];
    area.innerHTML = `<div class="q-card">
      <div class="q-type-tag">${typeLabel}</div>
      ${speechHTML}
      <div class="q-text">${qText}</div>
      <div class="opts-list">${opts.map((o, i) => `<button class="opt-btn" id="opt-${i}" onclick="selectOpt(${i})"><span class="ol">${['A', 'B', 'C', 'D'][i]}</span>${esc(o)}</button>`).join('')}</div>
      <div id="fb-area"></div>
    </div>`;
  } else {
    area.innerHTML = `<div class="q-card">
      <div class="q-type-tag">${typeLabel}</div>
      ${speechHTML}
      <div class="q-text">${qText}</div>
      <input class="fill-input" id="fill-input" type="text" placeholder="Nhập đáp án..."
        oninput="document.getElementById('btn-check').disabled=this.value.trim().length<1"
        onkeydown="if(event.key==='Enter'&&!answered)checkAnswer()"/>
      <div id="fb-area"></div>
    </div>`;
    setTimeout(() => document.getElementById('fill-input') && document.getElementById('fill-input').focus(), 50);
  }

  // Auto-play script after a short delay so voices are loaded
  if (q.script) {
    if (window.speechSynthesis) {
      // Chrome needs voices to be loaded first
      const trySpeak = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          speakScript(q.script);
        } else {
          window.speechSynthesis.onvoiceschanged = () => speakScript(q.script);
        }
      };
      setTimeout(trySpeak, 350);
    }
  }
}
function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

/* ════════════════════════════════════════════
   WEB SPEECH API  – Text-to-Speech
════════════════════════════════════════════ */
let _speechUtterance = null;

function stopSpeech() {
  window.speechSynthesis && window.speechSynthesis.cancel();
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
  // Prefer a natural English voice if available
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => /en[-_](US|GB|AU)/i.test(v.lang) && /natural|google|samantha|zira|david/i.test(v.name))
                 || voices.find(v => /en[-_](US|GB)/i.test(v.lang))
                 || null;
  if (preferred) u.voice = preferred;
  u.onstart = () => _updateSpeechUI(true);
  u.onend   = () => _updateSpeechUI(false);
  u.onerror  = () => _updateSpeechUI(false);
  _speechUtterance = u;
  window.speechSynthesis.speak(u);
}

function replaySpeech() {
  const q = examQuestions[currentQIdx];
  if (q && q.script) speakScript(q.script);
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

function selectOpt(i) {
  if (answered) return;
  selectedOptIdx = i;
  document.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('opt-' + i).classList.add('selected');
  document.getElementById('btn-check').disabled = false;
}

function checkAnswer() {
  if (answered) return;
  answered = true;
  const q = examQuestions[currentQIdx];
  const answer = (q.answer || q.a || '').trim();
  let userAns = '', correct = false;
  if (q.type === 'multiple_choice') {
    const opts = q.options || q.choices || [];
    userAns = opts[selectedOptIdx] || '';
    correct = userAns.trim().toLowerCase() === answer.toLowerCase();
    opts.forEach((o, i) => {
      const b = document.getElementById('opt-' + i); if (!b) return; b.disabled = true;
      if (o.trim().toLowerCase() === answer.toLowerCase()) b.classList.add('correct');
      else if (i === selectedOptIdx && !correct) b.classList.add('wrong');
    });
  } else {
    const inp = document.getElementById('fill-input');
    userAns = inp ? inp.value.trim() : '';
    correct = userAns.toLowerCase() === answer.toLowerCase();
    if (inp) { inp.disabled = true; inp.classList.add(correct ? 'correct' : 'wrong'); }
  }
  userAnswers.push({ q, userAns, correct });
  const fb = document.getElementById('fb-area');
  fb.innerHTML = correct
    ? `<div class="fb-box correct"><div class="fb-label">✅ Chính xác!</div><div>${q.explanation || ''}</div></div>`
    : `<div class="fb-box wrong"><div class="fb-label">❌ Đáp án: <strong>${answer}</strong></div><div>${q.explanation || ''}</div></div>`;
  document.getElementById('btn-check').style.display = 'none';
  const nxt = document.getElementById('btn-nxt'); nxt.style.display = '';
  nxt.textContent = currentQIdx >= examQuestions.length - 1 ? 'Xem kết quả 📊' : 'Tiếp →';
}

function nextQuestion() {
  if (currentQIdx >= examQuestions.length - 1) finishExam();
  else { currentQIdx++; renderQuestion(); }
}
function confirmLeave() {
  if (examQuestions.length && !answered && currentQIdx > 0)
    if (!confirm('Thoát bài thi? Kết quả chưa lưu.')) return;
  stopSpeech();
  showPage('page-detail');
}

/* ════════════════════════════════════════════
   FINISH — update XP & sync to Sheets
════════════════════════════════════════════ */
async function finishExam() {
  stopSpeech();
  const total = examQuestions.length;
  const score = userAnswers.filter(a => a.correct).length;
  const pct = Math.round(score / total * 100);
  const xpEarned = score * XP_PER_Q[selectedDiff];

  // Snapshot level before update
  const prevLv = getLevelInfo(currentUser.xp).cur.lv;

  // Update local user object
  currentUser.xp += xpEarned;
  // Recompute level from XP
  currentUser.level = getLevelInfo(currentUser.xp).cur.lv;
  // Update streak (already updated on login; just refresh date)
  const today = new Date().toDateString();
  if (currentUser.lastDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    currentUser.streak = currentUser.lastDate === yesterday ? currentUser.streak + 1 : 1;
    currentUser.lastDate = today;
  }
  saveSession(currentUser);

  const newLvInfo = getLevelInfo(currentUser.xp);
  const newLv = newLvInfo.cur.lv;

  // Render result
  document.getElementById('res-emoji').textContent = pct >= 80 ? '🏆' : pct >= 60 ? '🎉' : pct >= 40 ? '👍' : '💪';
  document.getElementById('res-pct').textContent = pct + '%';
  document.getElementById('res-frac').textContent = `${score}/${total} câu đúng`;
  document.getElementById('res-xp').textContent = '+' + xpEarned;
  document.getElementById('res-streak').textContent = currentUser.streak + '🔥';
  document.getElementById('res-level').textContent = 'Lv.' + newLv;

  document.getElementById('result-details').innerHTML = userAnswers.map((a, i) => {
    const correctAns = a.q.answer || a.q.a || '';
    return `<div class="result-card">
  <div class="rc-head"><span class="rc-badge ${a.correct ? 'c' : 'w'}">${a.correct ? '✅ Đúng' : '❌ Sai'}</span>
    <span style="font-size:.72rem;color:var(--c-muted);font-weight:600;">Câu ${i + 1}</span></div>
  <div class="rc-q">${a.q.question || a.q.q || ''}</div>
  <div class="rc-ans">Bạn trả lời: <strong class="${a.correct ? 'ca' : 'wa'}">${a.userAns || '(Bỏ trống)'}</strong></div>
  ${!a.correct ? `<div class="rc-ans">Đáp án đúng: <strong class="ca">${correctAns}</strong></div>` : ''}
  ${(a.q.explanation) ? `<div class="rc-explain">${a.q.explanation}</div>` : ''}
</div>`;
  }).join('');

  showPage('page-result');
  refreshGamiCard();
  showXPToast(xpEarned);
  if (newLv > prevLv) setTimeout(() => showLevelUp(newLvInfo.cur), 800);
  else if (pct >= 80) setTimeout(launchConfetti, 300);

  // Sync to Google Sheets (ghi điểm + cập nhật XP/level của học sinh)
  syncResultToSheets({ score, total, pct, xpEarned });
}

/* ════════════════════════════════════════════
   GOOGLE SHEETS — ALL API CALLS
════════════════════════════════════════════ */

// Ghi kết quả bài thi + cập nhật XP/level học sinh trên Sheet
async function syncResultToSheets({ score, total, pct, xpEarned }) {
  const el = document.getElementById('sheets-status');
  if (!CONFIG.SHEETS_URL || CONFIG.SHEETS_URL.includes('YOUR_SCRIPT_ID')) {
    el.textContent = '⚠️ Chưa cấu hình Google Sheets URL';
    el.className = 'sheets-status fail'; el.style.display = '';
    setSyncBadge('offline'); return;
  }
  el.textContent = '📡 Đang đồng bộ lên Google Sheets...';
  el.className = 'sheets-status sending'; el.style.display = '';
  setSyncBadge('syncing');
  try {
    // Tạo record JSON chi tiết câu đúng câu sai
    const recordJSON = JSON.stringify({
      id: 'TEST_' + Date.now(),
      date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}),
      timestamp: Date.now(),
      studentName: currentUser.full_name,
      lessonName: currentUnit.title + ' - ' + {easy:'Dễ', medium:'Vừa', hard:'Khó'}[selectedDiff],
      score: score,
      total: total,
      pct: pct,
      answers: userAnswers.map(ans => ({
        q: {
          type: ans.q.type,
          q: ans.q.question || ans.q.q || '',
          a: ans.q.answer || ans.q.a || '',
          options: ans.q.options || ans.q.choices || null
        },
        userAns: ans.userAns || '',
        correct: ans.correct
      }))
    });

    const params = new URLSearchParams({
      action: 'recordResult',
      student_id: currentUser.student_id,
      username: currentUser.username,
      unit: currentUnit.title,
      difficulty: selectedDiff,
      score, total, pct,
      xp_earned: xpEarned,
      new_xp: currentUser.xp,
      new_level: currentUser.level,
      streak: currentUser.streak,
      date: new Date().toLocaleDateString('vi-VN'),
      timestamp: new Date().toISOString(),
      recordJSON: recordJSON
    });
    const res = await fetch(CONFIG.SHEETS_URL + '?' + params);
    const json = await res.json();
    if (json.status === 'ok') {
      el.textContent = '✅ Đã đồng bộ thành công!';
      el.className = 'sheets-status ok';
      setSyncBadge('synced');
      clearHistoryCache();
    } else throw new Error(json.message);
  } catch (e) {
    el.textContent = '❌ Đồng bộ thất bại. Điểm vẫn được lưu cục bộ.';
    el.className = 'sheets-status fail';
    setSyncBadge('offline');
  }
}

// Leaderboard từ Sheets
async function loadLeaderboard() {
  const c = document.getElementById('lb-container');
  c.innerHTML = '<div class="units-loading"><div class="loader"></div>Đang tải...</div>';
  if (!CONFIG.SHEETS_URL || CONFIG.SHEETS_URL.includes('YOUR_SCRIPT_ID')) {
    renderLBFallback(c); return;
  }
  try {
    const res = await fetch(CONFIG.SHEETS_URL + '?action=leaderboard');
    const json = await res.json();
    renderLB(c, json.data || []);
  } catch (e) { renderLBFallback(c); }
}
function renderLBFallback(c) {
  const u = currentUser;
  const deptStr = u && u.department ? u.department : '';
  const roleStr = u && u.role ? u.role : '';
  const metaExtra = [deptStr, roleStr].filter(Boolean).join(' - ');

  c.innerHTML = `<div style="text-align:center;padding:1.5rem;color:var(--c-muted);font-size:.84rem;line-height:1.7;">
📊 Chưa kết nối Google Sheets.<br>Cấu hình <code>SHEETS_URL</code> để xem bảng xếp hạng lớp.</div>
  <div class="lb-item lb-me">
<div class="lb-rank gold">🥇</div>
<div class="lb-info"><div class="lb-name">${u ? u.full_name : ''}</div>
  <div class="lb-meta">Lv.${u ? getLevelInfo(u.xp).cur.lv : 1} · ${u ? u.streak : 0}🔥 ${metaExtra ? '· ' + metaExtra : ''}</div></div>
<div class="lb-xp">${u ? u.xp : 0} XP</div>
  </div>`;
}
function renderLB(c, rows) {
  if (!rows.length) { renderLBFallback(c); return; }
  const ranks = ['🥇', '🥈', '🥉'];
  const cls = ['gold', 'silver', 'bronze'];
  c.innerHTML = rows.map((r, i) => {
    const deptStr = r.department ? r.department : '';
    const roleStr = r.role ? r.role : '';
    const metaExtra = [deptStr, roleStr].filter(Boolean).join(' - ');
    return `
<div class="lb-item ${currentUser && r.student_id === currentUser.student_id ? 'lb-me' : ''}">
  <div class="lb-rank ${cls[i] || ''}">${ranks[i] || i + 1}</div>
  <div class="lb-info"><div class="lb-name">${r.full_name || r.username || ''}</div>
    <div class="lb-meta">Lv.${getLevelInfo(r.xp || 0).cur.lv} · ${r.streak || 0}🔥 ${metaExtra ? '· ' + metaExtra : ''}</div></div>
  <div class="lb-xp">${r.xp || 0} XP</div>
</div>`;
  }).join('');
}

/* ════════════════════════════════════════════
   LỊCH SỬ LÀM BÀI
════════════════════════════════════════════ */
let _historyCache = null;
let _historyCacheTime = 0;
let _historyCacheUser = '';
const CACHE_TTL_MS = 30 * 1000; // cache 30 giây

function clearHistoryCache() {
  _historyCache = null;
  _historyCacheTime = 0;
  _historyCacheUser = '';
}

async function loadHistory() {
  const c = document.getElementById('history-container');
  c.innerHTML = '<div class="units-loading"><div class="loader"></div>Đang tải lịch sử...</div>';

  if (!currentUser || !currentUser.username) {
    c.innerHTML = '<div class="units-loading">⚠️ Vui lòng đăng nhập để xem lịch sử.</div>';
    return;
  }

  const myUsername = currentUser.username.trim().toLowerCase();
  
  // Reset search box và dropdown lọc bài học
  document.getElementById('history-search').value = '';
  const filterSelect = document.getElementById('history-lesson-filter');
  if (filterSelect) filterSelect.value = 'all';

  if (!CONFIG.SHEETS_URL || CONFIG.SHEETS_URL.includes('YOUR_SCRIPT_ID')) {
    c.innerHTML = '<div class="units-loading">⚠️ Chưa cấu hình Google Sheets URL.</div>';
    return;
  }

  try {
    let records = [];
    const cacheValid = _historyCache
      && _historyCacheUser === myUsername
      && (Date.now() - _historyCacheTime) < CACHE_TTL_MS;
    if (cacheValid) {
      records = _historyCache;
    } else {
      const res = await fetch(
        CONFIG.SHEETS_URL + '?action=history&username=' + encodeURIComponent(currentUser.username)
      );
      const json = await res.json();
      if (json.status === 'success' || json.status === 'ok') {
        records = json.records || [];
        _historyCache = records;
        _historyCacheTime = Date.now();
        _historyCacheUser = myUsername;
      } else {
        throw new Error(json.message || 'Lỗi không xác định');
      }
    }
    
    // Parse recordJSON
    const parsedRecords = records.map(row => {
      let rec = {
        id: row.timestamp || ('row_' + Math.random()),
        date: row.date || '',
        timestamp: row.timestamp ? (new Date(row.timestamp).getTime()) : (row.date ? new Date(row.date).getTime() : 0),
        studentName: currentUser.full_name || row.username || 'Ẩn danh',
        lessonName: row.unit + ' - ' + row.difficulty,
        score: Number(row.score) || 0,
        total: Number(row.total) || 0,
        pct: Number(row.pct) || 0,
        answers: []
      };
      try {
        if (row.recordJSON && row.recordJSON.trim() !== "") {
          const parsed = JSON.parse(row.recordJSON);
          rec = {
            ...rec,
            ...parsed,
            date: parsed.date || row.date || '',
            timestamp: parsed.timestamp || (row.timestamp ? new Date(row.timestamp).getTime() : 0),
            studentName: currentUser.full_name || parsed.studentName || row.username || 'Ẩn danh',
            lessonName: parsed.lessonName || (row.unit + ' - ' + row.difficulty)
          };
        }
      } catch (e) {}
      return rec;
    });

    // Sắp xếp các bản ghi theo thời gian tăng dần (cũ nhất đến mới nhất) để tính lần làm bài
    parsedRecords.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

    // Tính lần làm bài
    const attemptCounts = {};
    parsedRecords.forEach(r => {
      const userKey = (r.studentName || 'Ẩn danh').trim();
      const lessonKey = (r.lessonName || '').trim();
      const key = `${userKey}_${lessonKey}`;
      if (!attemptCounts[key]) {
        attemptCounts[key] = 1;
      } else {
        attemptCounts[key]++;
      }
      r.attemptNumber = attemptCounts[key];
    });

    // Sắp xếp ngược lại cho hiển thị (mới nhất lên đầu)
    parsedRecords.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    // Cập nhật bộ lọc bài học động
    if (filterSelect && allUnits && allUnits.length) {
      filterSelect.innerHTML = '<option value="all">📚 Tất cả bài học</option>';
      allUnits.forEach(unit => {
        const opt = document.createElement('option');
        opt.value = unit.title;
        opt.textContent = '📚 ' + unit.title;
        filterSelect.appendChild(opt);
      });
    }

    c._historyData = parsedRecords;
    renderHistoryList(parsedRecords);
  } catch (e) {
    c.innerHTML = `<div class="units-loading" style="color:var(--c-danger);">⚠️ Lỗi khi tải lịch sử làm bài.<br><span style="font-size:.78rem;color:var(--c-muted);">${e.message}</span></div>`;
  }
}

function renderHistoryList(records, filterKeyword = '', filterLesson = 'all') {
  const container = document.getElementById('history-container');
  let history = records || [];

  if (history.length === 0) {
    container.innerHTML = `
      <div class="units-loading" style="padding: 2rem 0;">
        <div style="font-size:2.2rem;margin-bottom:.5rem;">🔍</div>
        <div style="font-weight:600;color:var(--c-muted);">Không tìm thấy lịch sử phù hợp</div>
      </div>`;
    return;
  }

  container.innerHTML = `<div style="display:flex; flex-direction:column; gap:.75rem;">` + 
    history.map((r, index) => {
      const isGood = r.pct >= 80;
      const isPass = r.pct >= 50;
      const col = isGood ? 'var(--c-success)' : isPass ? 'var(--c-warning)' : 'var(--c-danger)';
      const emoji = isGood ? '🏆' : isPass ? '👍' : '💪';
      return `
      <div class="unit-card" style="margin-bottom:0; padding:1rem; cursor:pointer;" onclick="viewHistoryDetail(${index})">
        <div class="unit-icon" style="font-size:1.4rem; width:38px; height:38px; border-radius:10px;">${emoji}</div>
        <div class="unit-info">
          <div class="unit-title" style="font-size:.88rem; margin-bottom:.1rem;">📚 ${r.lessonName}</div>
          <div class="unit-desc" style="font-size:.75rem; display:flex; align-items:center; gap:.35rem;">
            <span>${r.pct}% đúng</span>
            <span class="profile-tag" style="background:var(--c-accent-light); color:var(--c-accent); padding: .05rem .35rem; font-size: .6rem; border-radius:4px; font-weight:700;">Lần ${r.attemptNumber}</span>
          </div>
          <div style="font-size:.65rem; color:var(--c-muted); margin-top:.15rem;">🕐 ${r.date}</div>
        </div>
        <div style="text-align:right; font-weight:800; font-size:.9rem; color:${col}; line-height:1.2;">
          ${r.score}/${r.total}<br>
          <span style="font-size:.68rem; font-weight:600; color:var(--c-muted);">${r.pct}%</span>
        </div>
      </div>`;
    }).join('') + `</div>`;
}

function filterHistory() {
  const keyword = document.getElementById('history-search').value.trim().toLowerCase();
  const lesson = document.getElementById('history-lesson-filter').value;
  const container = document.getElementById('history-container');
  const allData = container._historyData || [];
  
  let filtered = allData;
  if (keyword) {
    filtered = filtered.filter(r =>
      (r.lessonName || '').toLowerCase().includes(keyword)
    );
  }
  if (lesson !== 'all') {
    filtered = filtered.filter(r => 
      (r.lessonName || '').includes(lesson)
    );
  }
  
  renderHistoryList(filtered, keyword, lesson);
}

function viewHistoryDetail(index) {
  const container = document.getElementById('history-container');
  const allData = container._historyData || [];
  const record = allData[index];
  if (!record) return;

  // Lấy danh sách các lần làm bài khác của cùng học sinh và cùng bài học này để vẽ timeline tiến độ
  const studentKey = (record.studentName || 'Ẩn danh').trim();
  const otherAttempts = allData
    .filter(r => (r.studentName || 'Ẩn danh').trim() === studentKey && r.lessonName === record.lessonName)
    .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)); // Sắp xếp cũ -> mới
  
  let progressTimelineHtml = '';
  if (otherAttempts.length > 1) {
    progressTimelineHtml = `
      <div class="setup-card" style="margin-bottom: 1rem; padding: 1.1rem;">
        <h4 style="font-size: .75rem; font-weight: 800; text-transform: uppercase; color: var(--c-muted); margin-bottom: .6rem; letter-spacing: .05em;">📈 Tiến bộ qua các lần làm bài</h4>
        <div style="display: flex; flex-direction: column; gap: .45rem; font-size: .8rem;">
          ${otherAttempts.map(att => {
            const isCurrent = att.timestamp === record.timestamp;
            const textCol = att.pct >= 80 ? 'var(--c-success)' : att.pct >= 50 ? 'var(--c-warning)' : 'var(--c-danger)';
            return `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: .35rem .6rem; border-radius: 10px; ${isCurrent ? 'background: var(--c-accent-light); font-weight: 700; border: 1px solid var(--c-glass-border);' : ''}">
                <span>Lần ${att.attemptNumber} (${att.date})</span>
                <span style="color: ${textCol}; font-weight: 700;">${att.score}/${att.total} (${att.pct}%) ${isCurrent ? '👈 Hiện tại' : ''}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  let det = '';
  const TYPE_LBL = { multiple_choice: '🔘 Trắc nghiệm', fill_blank: '✍️ Điền từ' };
  
  (record.answers || []).forEach((ans, i) => {
    const isCorrect = ans.correct;
    det += `
    <div class="result-card" style="margin-bottom: .75rem; padding: 1rem;">
      <div class="rc-head">
        <span class="rc-badge ${isCorrect ? 'c' : 'w'}">${isCorrect ? '✅ Đúng' : '❌ Sai'}</span>
        <span style="font-size:.68rem; color:var(--c-muted); font-weight:600;">Câu ${i + 1} (${TYPE_LBL[ans.q.type] || ans.q.type})</span>
      </div>
      <div class="rc-q" style="font-size:.84rem; font-weight:600; margin-top:.4rem; color:var(--c-text);">${ans.q.q}</div>
      <div class="rc-ans" style="font-size:.8rem; margin-top:.3rem;">Bạn trả lời: <strong class="${isCorrect ? 'ca' : 'wa'}">${ans.userAns || '(Bỏ trống)'}</strong></div>
      ${!isCorrect ? `<div class="rc-ans" style="font-size:.8rem;">Đáp án đúng: <strong class="ca">${ans.q.a}</strong></div>` : ''}
    </div>`;
  });

  if (!det) {
    det = `<div style="text-align:center; padding:2rem; color:var(--c-muted); font-size:.8rem;">
      <div style="font-size:2rem; margin-bottom:.5rem;">📄</div>
      Không có dữ liệu chi tiết từng câu cho bài làm này.
    </div>`;
  }

  container.innerHTML = `
    <div style="margin-bottom: 1rem;">
      <button onclick="renderHistoryList(document.getElementById('history-container')._historyData)" 
        class="btn-back" style="width: auto; height: auto; padding: .4rem .8rem; border-radius: 20px; font-size: .8rem; display: inline-flex; align-items: center; gap: .3rem; font-weight: bold;">
        ‹ Quay lại danh sách
      </button>
    </div>
    <div class="setup-card" style="margin-bottom: 1rem; padding: 1.2rem;">
      <h3 style="font-size: 1.05rem; font-weight: 800; margin-bottom: .4rem; color:var(--c-text);">📋 Chi tiết bài làm</h3>
      <div style="font-size: .82rem; color: var(--c-text2); line-height: 1.5;">
        <div>👤 Học sinh: <b>${record.studentName}</b></div>
        <div>📚 Bài học: <b>${record.lessonName}</b></div>
        <div>🕐 Thời gian: <b>${record.date}</b></div>
        <div style="margin-top: .4rem; font-size: .9rem;">
          Kết quả: <b style="color: ${record.pct >= 80 ? 'var(--c-success)' : record.pct >= 50 ? 'var(--c-warning)' : 'var(--c-danger)'}">${record.score}/${record.total} câu đúng (${record.pct}%)</b>
        </div>
      </div>
    </div>
    ${progressTimelineHtml}
    <div class="section-title">📋 Chi tiết từng câu</div>
    <div id="history-details-list">${det}</div>
  `;
}

/* ════════════════════════════════════════════
   UI HELPERS
════════════════════════════════════════════ */
function setSyncBadge(state) {
  const b = document.getElementById('sync-badge');
  b.className = 'sync-badge ' + state;
  b.textContent = state === 'synced' ? '✓ Đồng bộ' : state === 'syncing' ? '⏳ Đang đồng bộ...' : '✗ Mất kết nối';
}

function showXPToast(xp) {
  if (!xp) return;
  const t = document.getElementById('xp-toast');
  document.getElementById('xp-toast-val').textContent = '+' + xp + ' XP';
  t.classList.add('show');
  setTimeout(() => {
    t.classList.remove('show');
  }, 2000);
}

function showLevelUp(cur) {
  document.getElementById('lu-title').textContent = cur.title;
  document.getElementById('lu-xp').textContent = `Cấp ${cur.lv}`;
  document.getElementById('lu-desc').textContent = `Bạn đã thăng tiến vượt bậc! Hãy tiếp tục phát huy nhé! 🌿`;
  document.getElementById('levelup-overlay').classList.add('show');
}

function closeLevelUp(e) {
  if (e && e.target !== e.currentTarget && !e.target.classList.contains('levelup-close-btn')) return;
  document.getElementById('levelup-overlay').classList.remove('show');
  launchConfetti();
}

function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  let particles = [];
  const colors = ['#4a8c5c', '#6bb07a', '#ff9500', '#ffcc00', '#0071e3', '#5ac8fa'];

  for (let i = 0; i < 80; i++) {
    particles.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 50,
      y: canvas.height + 20,
      vx: (Math.random() - 0.5) * 12,
      vy: -Math.random() * 12 - 12,
      r: Math.random() * 5 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 1,
      dOpacity: Math.random() * 0.015 + 0.01
    });
  }

  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;
    particles.forEach(p => {
      if (p.opacity > 0) {
        active = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.vx *= 0.98;
        p.opacity -= p.dOpacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fill();
      }
    });
    if (active) {
      requestAnimationFrame(update);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  update();
}

/* ════════════════════════════════════════════
   FLASHCARD SYSTEM
   - Lazy loads topics-index.json and vocabulary files
   - Web Speech API integration
   - 3D Flip Card navigation
════════════════════════════════════════════ */
let flashcardTopics = [];
let currentFlashcards = [];
let currentCardIdx = 0;
let isAutoSpeakFlashcard = true;

async function openFlashcardTopicsPage() {
  showPage('page-flashcard-topics');
  const listContainer = document.getElementById('flashcard-topics-list');
  listContainer.innerHTML = '<div class="units-loading"><div class="loader"></div>Đang tải các chủ đề...</div>';
  
  try {
    if (flashcardTopics.length === 0) {
      const res = await fetch(`./content/flashcards/topics-index.json?t=${Date.now()}`);
      if (!res.ok) throw new Error();
      flashcardTopics = await res.json();
    }
    renderFlashcardTopics();
  } catch (e) {
    listContainer.innerHTML = '<div class="units-loading" style="color:var(--c-danger);">⚠️ Không thể tải danh sách chủ đề.<br><span style="font-size:.78rem;color:var(--c-muted);">Vui lòng kiểm tra file content/flashcards/topics-index.json</span></div>';
  }
}

function renderFlashcardTopics() {
  const listContainer = document.getElementById('flashcard-topics-list');
  if (flashcardTopics.length === 0) {
    listContainer.innerHTML = '<div class="units-loading">📭 Chưa có chủ đề từ vựng nào.</div>';
    return;
  }

  listContainer.innerHTML = flashcardTopics.map((topic, index) => `
    <div class="cat-card" style="animation-delay:${index * .08}s" onclick="startFlashcardTopic('${topic.id}')">
      <div class="cat-icon">${topic.icon || '📇'}</div>
      <div class="cat-info">
        <div class="cat-title">${topic.title}</div>
        <div class="cat-desc">${topic.description || ''}</div>
      </div>
      <div class="cat-badge">
        <div class="cat-badge-num">${topic.cardCount || 0}</div>
        <div class="cat-badge-label">từ</div>
      </div>
      <div class="cat-arrow">›</div>
    </div>
  `).join('');
}

async function startFlashcardTopic(topicId) {
  const topic = flashcardTopics.find(t => t.id === topicId);
  const title = topic ? topic.title : 'Từ vựng';
  
  // Update nav title immediately
  document.getElementById('fc-nav-title').textContent = title;
  document.getElementById('fc-topic-info').textContent = `Chủ đề: ${title}`;
  
  // Reset card index
  currentCardIdx = 0;
  currentFlashcards = [];
  
  // Get DOM elements for card reset
  const cardEl = document.getElementById('fc-card');
  if (cardEl) cardEl.classList.remove('flipped');
  
  showPage('page-flashcard');
  
  // Loading state on card
  document.getElementById('fc-english').textContent = 'Đang tải từ vựng...';
  document.getElementById('fc-phonetic').textContent = '';
  document.getElementById('fc-vietnamese').textContent = 'Loading...';
  
  try {
    const res = await fetch(`./content/flashcards/${topicId}.json?t=${Date.now()}`);
    if (!res.ok) throw new Error();
    currentFlashcards = await res.json();
    
    if (currentFlashcards.length === 0) {
      document.getElementById('fc-english').textContent = 'Không có từ vựng';
      document.getElementById('fc-vietnamese').textContent = 'Chủ đề này hiện chưa có dữ liệu từ vựng.';
      return;
    }
    
    renderCurrentCard();
  } catch (e) {
    document.getElementById('fc-english').textContent = 'Lỗi tải dữ liệu';
    document.getElementById('fc-vietnamese').textContent = 'Không thể kết nối hoặc không tìm thấy file từ vựng.';
  }
}

function renderCurrentCard() {
  if (currentFlashcards.length === 0) return;
  
  const card = currentFlashcards[currentCardIdx];
  const cardEl = document.getElementById('fc-card');
  if (cardEl) cardEl.classList.remove('flipped'); // Reset card to front
  
  // Fill front
  document.getElementById('fc-english').textContent = card.english || '';
  const phoneticEl = document.getElementById('fc-phonetic');
  if (card.phonetic) {
    phoneticEl.textContent = card.phonetic;
    phoneticEl.style.display = 'block';
  } else {
    phoneticEl.style.display = 'none';
  }
  
  // Update badge types (front and back)
  const badgeFront = document.getElementById('fc-badge-front');
  const badgeBack = document.getElementById('fc-badge-back');
  const cardType = card.type || 'vocabulary';
  
  if (badgeFront) {
    badgeFront.textContent = cardType === 'example' ? 'ví dụ (example)' : 'từ vựng (vocab)';
    badgeFront.className = `card-badge ${cardType}`;
  }
  if (badgeBack) {
    badgeBack.textContent = cardType === 'example' ? 'ví dụ (example)' : 'từ vựng (vocab)';
    badgeBack.className = `card-badge ${cardType}`;
  }
  
  // Fill back
  const viText = card.vietnamese || '';
  const viEl = document.getElementById('fc-vietnamese');
  viEl.textContent = viText;
  viEl.classList.toggle('card-vietnamese--detail', /【Nghĩa】|【Giải thích】|【Dịch】/.test(viText));
  
  // Update progress
  const total = currentFlashcards.length;
  document.getElementById('fc-progress-text').textContent = `Thẻ ${currentCardIdx + 1} / ${total}`;
  const pct = Math.round(((currentCardIdx + 1) / total) * 100);
  document.getElementById('fc-progress-percent').textContent = `${pct}%`;
  document.getElementById('fc-progress-fill').style.width = `${pct}%`;
  
  // Web Speech Auto-play
  if (isAutoSpeakFlashcard) {
    // Cancel any ongoing speech to avoid overlaps
    stopFlashcardSpeech();
    // Short timeout to let UI transition finish smoothly
    setTimeout(() => {
      speakFlashcard();
    }, 320);
  } else {
    stopFlashcardSpeech();
  }
}

function flipFlashcard() {
  const cardEl = document.getElementById('fc-card');
  if (cardEl) {
    cardEl.classList.toggle('flipped');
  }
}

function nextFlashcard() {
  if (currentFlashcards.length === 0) return;
  currentCardIdx = (currentCardIdx + 1) % currentFlashcards.length;
  renderCurrentCard();
}

function prevFlashcard() {
  if (currentFlashcards.length === 0) return;
  currentCardIdx = (currentCardIdx - 1 + currentFlashcards.length) % currentFlashcards.length;
  renderCurrentCard();
}

function shuffleFlashcards() {
  if (currentFlashcards.length <= 1) return;
  
  // Fisher-Yates shuffle
  for (let i = currentFlashcards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [currentFlashcards[i], currentFlashcards[j]] = [currentFlashcards[j], currentFlashcards[i]];
  }
  
  currentCardIdx = 0;
  renderCurrentCard();
}

function speakFlashcard() {
  if (currentFlashcards.length === 0) return;
  const card = currentFlashcards[currentCardIdx];
  const textToSpeak = card.english;
  if (!textToSpeak) return;
  
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  
  const u = new SpeechSynthesisUtterance(textToSpeak);
  u.lang = 'en-US';
  u.rate = card.type === 'example' ? 0.88 : 0.92; // Read sentences slightly slower for clarity
  u.pitch = 1.05;
  
  // Find voices
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => /en[-_](US|GB|AU)/i.test(v.lang) && /natural|google|samantha|zira|david/i.test(v.name))
                 || voices.find(v => /en[-_](US|GB)/i.test(v.lang))
                 || null;
  if (preferred) u.voice = preferred;
  
  // Visual feedback on the speak button if playing
  const speakBtns = document.querySelectorAll('.card-speak-btn');
  u.onstart = () => {
    speakBtns.forEach(btn => btn.style.transform = 'scale(1.15)');
  };
  u.onend = () => {
    speakBtns.forEach(btn => btn.style.transform = '');
  };
  u.onerror = () => {
    speakBtns.forEach(btn => btn.style.transform = '');
  };
  
  window.speechSynthesis.speak(u);
}

function stopFlashcardSpeech() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

function toggleAutoSpeak(checked) {
  if (checked !== undefined) {
    isAutoSpeakFlashcard = checked;
  } else {
    isAutoSpeakFlashcard = !isAutoSpeakFlashcard;
    const chk = document.getElementById('fc-auto-speak-chk');
    if (chk) chk.checked = isAutoSpeakFlashcard;
  }
}

// Khởi chạy ứng dụng
window.addEventListener('DOMContentLoaded', async () => {
  // ── Chế độ demo: tự động đăng nhập tài khoản thật ──
  if (CONFIG.DEMO_MODE) {
    document.getElementById('inp-username').value = CONFIG.DEMO_USERNAME;
    document.getElementById('inp-password').value = CONFIG.DEMO_PASSWORD;
    await doLogin(); // Gọi đúng hàm đăng nhập thật — kết nối Google Sheets bình thường
    return;
  }

  // ── Bình thường: kiểm tra session rồi quyết định ──
  currentUser = loadSession();
  if (currentUser) {
    initHome();
    showPage('page-home');
  } else {
    showPage('page-login');
  }
});
