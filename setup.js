/* ════════════════════════════════════════════
   QUIZ SETUP MODULE
   ════════════════════════════════════════════ */

var selectedDiff = 'medium';
var allQuestions = [];
var selectedQty = 'all'; // 5, 10, 20, or 'all'
var isRandom = false;

function selectDiff(d) {
  selectedDiff = d;
  ['easy', 'medium', 'hard'].forEach(x => {
    const el = document.getElementById('diff-' + x);
    if (el) el.classList.toggle('active', x === d);
  });
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
  const toggle = document.getElementById('random-toggle');
  if (toggle) {
    isRandom = toggle.checked;
  }
}

function updateSetupInfo() {
  const infoEl = document.getElementById('setup-info');
  if (!infoEl) return;
  if (!allQuestions.length) return;
  
  const qs = allQuestions.filter(q => q.difficulty === selectedDiff);
  const totalAvailable = qs.length;
  const qtyNum = selectedQty === 'all' ? totalAvailable : Math.min(selectedQty, totalAvailable);
  const xp = (typeof XP_PER_Q !== 'undefined' && XP_PER_Q[selectedDiff]) || 0;
  const diffName = { easy: 'Dễ', medium: 'Vừa', hard: 'Khó' }[selectedDiff];
  const qtyLabel = selectedQty === 'all' ? `Tất cả (${totalAvailable})` : `${qtyNum}/${totalAvailable}`;
  
  infoEl.innerHTML =
    `📝 <b>${qtyLabel}</b> câu &nbsp;·&nbsp; Độ khó: <b>${diffName}</b><br>XP tối đa: <b style="color:var(--c-warning);">+${xp * qtyNum} ⭐</b> (${xp} XP/câu)`;
}

async function loadQuestions() {
  if (!currentUnit) return;
  const infoEl = document.getElementById('setup-info');
  try {
    const r = await fetch(`./content/${currentUnit.id}/questions.json?t=${Date.now()}`);
    if (!r.ok) throw new Error();
    allQuestions = await r.json();
    updateSetupInfo();
  } catch (e) { 
    allQuestions = []; 
    if (infoEl) infoEl.textContent = '⚠️ Chưa có câu hỏi.'; 
  }
}
