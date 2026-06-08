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
        // Chuyển đổi format để dùng được hàm renderHistoryList cũ
        const records = data.map((r, i) => ({
          id: r.id,
          date: new Date(r.created_at).toLocaleDateString('vi-VN') + ' ' +
                new Date(r.created_at).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'}),
          timestamp: new Date(r.created_at).getTime(),
          studentName: currentUser.full_name,
          lessonName: r.unit + ' - ' + r.difficulty,
          score: r.score,
          total: r.total,
          pct: r.pct,
          answers: r.record_json ? r.record_json.answers || [] : [],
          attemptNumber: i + 1
        }));

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
