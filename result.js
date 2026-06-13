/* ════════════════════════════════════════════
   EXAM RESULT & SYNC MODULE
   ════════════════════════════════════════════ */

var isFinishingExam = false;

async function finishExam() {
  if (isFinishingExam) return;
  isFinishingExam = true;

  if (typeof stopSpeech === 'function') stopSpeech();
  
  const total = examQuestions.length;
  const score = userAnswers.filter(a => a.correct).length;
  const pct = Math.round(score / total * 100);

  // Lấy level hiện tại mà không thay đổi/cập nhật
  let curLv = 1;
  if (typeof getLevelInfo === 'function' && currentUser) {
    curLv = getLevelInfo(currentUser.xp).cur.lv;
  }

  // Render kết quả
  const resEmoji = document.getElementById('res-emoji');
  const resPct = document.getElementById('res-pct');
  const resFrac = document.getElementById('res-frac');
  const resXp = document.getElementById('res-xp');
  const resStreak = document.getElementById('res-streak');
  const resLevel = document.getElementById('res-level');
  
  if (resEmoji) resEmoji.textContent = pct >= 80 ? '🏆' : pct >= 60 ? '🎉' : pct >= 40 ? '👍' : '💪';
  if (resPct) resPct.textContent = pct + '%';
  if (resFrac) resFrac.textContent = `${score}/${total} câu đúng`;
  if (resXp) resXp.textContent = '+0 XP (Đã tắt lưu điểm)';
  if (resStreak) resStreak.textContent = (currentUser ? currentUser.streak : 0) + '🔥';
  if (resLevel) resLevel.textContent = 'Lv.' + curLv;

  const resultDetails = document.getElementById('result-details');
  if (resultDetails) {
    resultDetails.innerHTML = userAnswers.map((a, i) => {
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
  }

  showPage('page-result');
  if (typeof refreshGamiCard === 'function') refreshGamiCard();
  
  if (pct >= 80) {
    if (typeof launchConfetti === 'function') setTimeout(launchConfetti, 300);
  }

  // Đồng bộ kết quả lên Supabase
  syncResultToSheets({ score, total, pct, xpEarned: 0 });
}

// Hàm này sẽ được sync-supabase.js ghi đè
async function syncResultToSheets({ score, total, pct, xpEarned }) {
  if (typeof setSyncBadge === 'function') setSyncBadge('offline');
}

