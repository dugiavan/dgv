// history-supabase.js — Tải lịch sử từ Supabase (nhanh hơn Sheets)

async function loadHistory() {
  const c = document.getElementById('history-container');
  if (!c) return;
  c.innerHTML = '<div class="units-loading"><div class="loader"></div>Đang tải lịch sử...</div>';

  if (!currentUser) {
    c.innerHTML = '<div class="units-loading">⚠️ Vui lòng đăng nhập để xem lịch sử.</div>';
    return;
  }

  // Thử Supabase
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('results')
        .select('*')
        .eq('student_id', currentUser.student_id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (!error && data) {
        // 1. Sort cũ → mới để tính attemptNumber đúng
        const sorted = [...data].sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );

        // 2. Đếm số lần làm theo từng bài học
        const attemptCounts = {};
        sorted.forEach(r => {
          const key = r.unit + '_' + r.difficulty;
          attemptCounts[key] = (attemptCounts[key] || 0) + 1;
          r._attemptNumber = attemptCounts[key];
        });

        // 3. Map sang format chuẩn mà history.js đọc được
        const records = data
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // mới nhất lên đầu
          .map(r => {
            // Chuyển answers từ format Supabase sang format history.js mong đợi
            const rawAnswers = r.record_json ? r.record_json.answers || [] : [];
            const answers = rawAnswers.map(a => ({
              q: {
                q: a.question || '',        // history.js đọc ans.q.q
                a: a.correctAnswer || '',   // history.js đọc ans.q.a
                type: a.type || 'multiple_choice' // history.js đọc ans.q.type
              },
              userAns: a.userAnswer || '',  // history.js đọc ans.userAns
              correct: a.correct || false   // history.js đọc ans.correct
            }));

            const sortedEntry = sorted.find(s => s.id === r.id);

            return {
              id: r.id,
              date: new Date(r.created_at).toLocaleDateString('vi-VN') + ' ' +
                    new Date(r.created_at).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'}),
              timestamp: new Date(r.created_at).getTime(),
              studentName: currentUser.full_name,
              lessonName: r.unit + ' - ' + r.difficulty,
              score: r.score,
              total: r.total,
              pct: r.pct,
              answers,
              attemptNumber: sortedEntry ? sortedEntry._attemptNumber : 1
            };
          });

        c._historyData = records;
        renderHistoryList(records);
        return;
      }
    } catch (e) {
      console.warn('Supabase history failed');
    }
  }

  // Fallback về Sheets
  c.innerHTML = '<div class="units-loading" style="color:var(--c-muted);">⚠️ Không thể tải. Kiểm tra kết nối.</div>';
}
