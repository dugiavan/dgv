/* ════════════════════════════════════════════
   EXERCISE ENGINE MODULE
   ════════════════════════════════════════════ */

var examQuestions = [];
var currentQIdx = 0;
var userAnswers = [];
var answered = false;
var selectedOptIdx = -1;

function startExam() {
  if (typeof allQuestions === 'undefined' || !allQuestions.length) {
    alert('Không tìm thấy câu hỏi!');
    return;
  }
  let qs = allQuestions.filter(q => q.difficulty === selectedDiff);
  if (!qs.length) { alert('Chưa có câu hỏi cho độ khó này!'); return; }

  // Shuffle if random is toggled on
  if (typeof isRandom !== 'undefined' && isRandom) {
    qs = shuffle([...qs]);
  } else {
    qs = [...qs]; // keep original order
  }

  // Limit by selected quantity
  if (typeof selectedQty !== 'undefined' && selectedQty !== 'all') {
    const qtyNum = Number(selectedQty);
    if (!isNaN(qtyNum)) {
      qs = qs.slice(0, qtyNum);
    }
  }

  examQuestions = qs;
  currentQIdx = 0;
  userAnswers = [];
  answered = false;
  if (typeof isFinishingExam !== 'undefined') {
    isFinishingExam = false;
  }

  const navTitle = document.getElementById('ex-nav-title');
  if (navTitle && currentUnit) navTitle.textContent = currentUnit.title;

  showPage('page-exercise');
  renderQuestion();
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function renderQuestion() {
  if (examQuestions.length === 0) return;
  const q = examQuestions[currentQIdx], total = examQuestions.length;

  const progressFill = document.getElementById('ex-prog-fill');
  const progressText = document.getElementById('ex-prog-text');
  const btnC = document.getElementById('btn-check');
  const btnN = document.getElementById('btn-nxt');

  if (progressFill) progressFill.style.width = (currentQIdx / total * 100) + '%';
  if (progressText) progressText.textContent = `${currentQIdx + 1}/${total}`;
  if (btnC) {
    btnC.style.display = '';
    btnC.disabled = true;
  }
  if (btnN) {
    btnN.style.display = 'none';
    btnN.disabled = false; // reset disabled state
    btnN.textContent = 'Tiếp →';
  }

  answered = false;
  selectedOptIdx = -1;

  // Stop any ongoing speech from previous question
  if (typeof stopSpeech === 'function') stopSpeech();

  const area = document.getElementById('question-area');
  if (!area) return;

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
    setTimeout(() => {
      const fillInp = document.getElementById('fill-input');
      if (fillInp) fillInp.focus();
    }, 50);
  }

  // Auto-play script after a short delay so voices are loaded
  // [ĐÃ SỬA] Tối ưu bộ nhớ, tự động huỷ lắng nghe sau khi gọi giọng đọc xong
  if (q.script && window.speechSynthesis) {
    const trySpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        if (typeof speakScript === 'function') speakScript(q.script);
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          if (typeof speakScript === 'function') speakScript(q.script);
          window.speechSynthesis.onvoiceschanged = null; // <- Thầy thêm dòng này vào đây
        };
      }
    };
    setTimeout(trySpeak, 350);
  }
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function selectOpt(i) {
  if (answered) return;
  selectedOptIdx = i;
  document.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('selected'));
  const targetOpt = document.getElementById('opt-' + i);
  if (targetOpt) targetOpt.classList.add('selected');
  const btnC = document.getElementById('btn-check');
  if (btnC) btnC.disabled = false;
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
      const b = document.getElementById('opt-' + i);
      if (!b) return;
      b.disabled = true;
      if (o.trim().toLowerCase() === answer.toLowerCase()) b.classList.add('correct');
      else if (i === selectedOptIdx && !correct) b.classList.add('wrong');
    });
  } else {
    const inp = document.getElementById('fill-input');
    // Ép làm sạch khoảng trắng ở hai đầu chuỗi do học sinh nhập vào
    userAns = inp ? inp.value.trim() : '';

    // So sánh sau khi đã .trim() đáp án gốc và .toLowerCase() cả hai vế
    correct = userAns.toLowerCase() === answer.trim().toLowerCase();

    if (inp) {
      inp.disabled = true;
      inp.classList.add(correct ? 'correct' : 'wrong');
    }
  }
  userAnswers.push({ q, userAns, correct });

  const fb = document.getElementById('fb-area');
  if (fb) {
    fb.innerHTML = correct
      ? `<div class="fb-box correct"><div class="fb-label">✅ Chính xác!</div><div>${q.explanation || ''}</div></div>`
      : `<div class="fb-box wrong"><div class="fb-label">❌ Đáp án: <strong>${answer}</strong></div><div>${q.explanation || ''}</div></div>`;
  }

  const btnC = document.getElementById('btn-check');
  if (btnC) btnC.style.display = 'none';
  const nxt = document.getElementById('btn-nxt');
  if (nxt) {
    nxt.style.display = '';
    nxt.textContent = currentQIdx >= examQuestions.length - 1 ? 'Xem kết quả 📊' : 'Tiếp →';
  }
}

function nextQuestion() {
  if (currentQIdx >= examQuestions.length - 1) {
    const btnN = document.getElementById('btn-nxt');
    if (btnN) {
      btnN.disabled = true;
      btnN.textContent = 'Đang xử lý...';
    }
    if (typeof finishExam === 'function') finishExam();
  } else {
    currentQIdx++;
    renderQuestion();
  }
}

function confirmLeave() {
  if (examQuestions.length && !answered && currentQIdx > 0) {
    if (!confirm('Thoát bài thi? Kết quả chưa lưu.')) return;
  }
  if (typeof stopSpeech === 'function') stopSpeech();
  showPage('page-detail');
}
