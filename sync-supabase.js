// sync-supabase.js — Đồng bộ XP và lịch sử sang Supabase

async function syncResultToSupabase({ score, total, pct, xpEarned }) {
  if (!supabaseClient || !currentUser) return;

  const el = document.getElementById('sheets-status');
  if (el) {
    el.textContent = '📡 Đang đồng bộ...';
    el.className = 'sheets-status sending';
    el.style.display = '';
  }
  if (typeof setSyncBadge === 'function') setSyncBadge('syncing');

  try {
    // 1. Ghi lịch sử bài làm
    const recordData = {
      student_id: currentUser.student_id,
      username: currentUser.username,
      unit: currentUnit ? currentUnit.title : 'Unknown',
      difficulty: typeof selectedDiff !== 'undefined' ? selectedDiff : 'medium',
      score,
      total,
      pct,
      xp_earned: xpEarned,
      new_xp: currentUser.xp,
      new_level: currentUser.level,
      streak: currentUser.streak,
      record_json: {
        answers: typeof userAnswers !== 'undefined' ? userAnswers.map(a => ({
          question: a.q.question || a.q.q,
          userAnswer: a.userAns,
          correct: a.correct,
          correctAnswer: a.q.answer || a.q.a,
          type: a.q.type || 'multiple_choice'
        })) : []
      }
    };

    const { error: resultError } = await supabaseClient
      .from('results')
      .insert(recordData);

    if (resultError) throw resultError;

    // 2. Cập nhật XP + level cho học sinh
    const { error: updateError } = await supabaseClient
      .from('students')
      .update({
        xp: currentUser.xp,
        level: currentUser.level,
        streak: currentUser.streak,
        last_date: currentUser.lastDate
      })
      .eq('student_id', currentUser.student_id);

    if (updateError) throw updateError;

    if (el) {
      el.textContent = '✅ Đã lưu thành công!';
      el.className = 'sheets-status ok';
    }
    if (typeof setSyncBadge === 'function') setSyncBadge('synced');

  } catch (e) {
    console.error('Supabase sync error:', e);
    if (el) {
      el.textContent = '❌ Lỗi lưu điểm. Đã lưu cục bộ.';
      el.className = 'sheets-status fail';
    }
    if (typeof setSyncBadge === 'function') setSyncBadge('offline');
  }
}

// Không cần override syncResultToSheets nữa vì result.js đã gọi trực tiếp syncResultToSupabase


