/* ════════════════════════════════════════════
   EXAM RESULT & SYNC MODULE
   ════════════════════════════════════════════ */

async function finishExam() {
  if (typeof stopSpeech === 'function') stopSpeech();
  
  const total = examQuestions.length;
  const score = userAnswers.filter(a => a.correct).length;
  const pct = Math.round(score / total * 100);
  const xpLimit = (typeof XP_PER_Q !== 'undefined' && XP_PER_Q[selectedDiff]) || 0;
  const xpEarned = score * xpLimit;

  // Snapshot level before update
  let prevLv = 1;
  if (typeof getLevelInfo === 'function') {
    prevLv = getLevelInfo(currentUser.xp).cur.lv;
  }

  // Update local user object
  currentUser.xp += xpEarned;
  // Recompute level from XP
  if (typeof getLevelInfo === 'function') {
    currentUser.level = getLevelInfo(currentUser.xp).cur.lv;
  }
  
  // Update streak (already updated on login; just refresh date)
  const today = new Date().toDateString();
  if (currentUser.lastDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    currentUser.streak = currentUser.lastDate === yesterday ? currentUser.streak + 1 : 1;
    currentUser.lastDate = today;
  }
  
  if (typeof saveSession === 'function') saveSession(currentUser);

  let newLv = prevLv;
  let newLvInfo = null;
  if (typeof getLevelInfo === 'function') {
    newLvInfo = getLevelInfo(currentUser.xp);
    newLv = newLvInfo.cur.lv;
  }

  // Render result
  const resEmoji = document.getElementById('res-emoji');
  const resPct = document.getElementById('res-pct');
  const resFrac = document.getElementById('res-frac');
  const resXp = document.getElementById('res-xp');
  const resStreak = document.getElementById('res-streak');
  const resLevel = document.getElementById('res-level');
  
  if (resEmoji) resEmoji.textContent = pct >= 80 ? '🏆' : pct >= 60 ? '🎉' : pct >= 40 ? '👍' : '💪';
  if (resPct) resPct.textContent = pct + '%';
  if (resFrac) resFrac.textContent = `${score}/${total} câu đúng`;
  if (resXp) resXp.textContent = '+' + xpEarned;
  if (resStreak) resStreak.textContent = currentUser.streak + '🔥';
  if (resLevel) resLevel.textContent = 'Lv.' + newLv;

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
  if (typeof showXPToast === 'function') showXPToast(xpEarned);
  
  if (newLv > prevLv) {
    if (typeof showLevelUp === 'function' && newLvInfo) {
      setTimeout(() => showLevelUp(newLvInfo.cur), 800);
    }
  } else if (pct >= 80) {
    if (typeof launchConfetti === 'function') setTimeout(launchConfetti, 300);
  }

  // Sync to Google Sheets (ghi điểm + cập nhật XP/level của học sinh)
  syncResultToSheets({ score, total, pct, xpEarned });
}

// Ghi kết quả bài thi + cập nhật XP/level học sinh trên Sheet
async function syncResultToSheets({ score, total, pct, xpEarned }) {
  const el = document.getElementById('sheets-status');
  if (!CONFIG.SHEETS_URL || CONFIG.SHEETS_URL.includes('YOUR_SCRIPT_ID')) {
    if (el) {
      el.textContent = '⚠️ Chưa cấu hình Google Sheets URL';
      el.className = 'sheets-status fail'; 
      el.style.display = '';
    }
    if (typeof setSyncBadge === 'function') setSyncBadge('offline'); 
    return;
  }
  if (el) {
    el.textContent = '📡 Đang đồng bộ lên Google Sheets...';
    el.className = 'sheets-status sending'; 
    el.style.display = '';
  }
  if (typeof setSyncBadge === 'function') setSyncBadge('syncing');
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
      if (el) {
        el.textContent = '✅ Đã đồng bộ thành công!';
        el.className = 'sheets-status ok';
      }
      if (typeof setSyncBadge === 'function') setSyncBadge('synced');
      if (typeof clearHistoryCache === 'function') clearHistoryCache();
    } else throw new Error(json.message);
  } catch (e) {
    if (el) {
      el.textContent = '❌ Đồng bộ thất bại. Điểm vẫn được lưu cục bộ.';
      el.className = 'sheets-status fail';
    }
    if (typeof setSyncBadge === 'function') setSyncBadge('offline');
  }
}
