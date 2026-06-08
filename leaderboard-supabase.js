// leaderboard-supabase.js — Bảng xếp hạng realtime từ Supabase

async function loadLeaderboard() {
  const c = document.getElementById('lb-container');
  if (!c) return;
  c.innerHTML = '<div class="units-loading"><div class="loader"></div>Đang tải...</div>';

  // Thử Supabase trước
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('students')
        .select('student_id, full_name, username, role, department, xp, streak, level')
        .order('xp', { ascending: false })
        .limit(50);

      if (!error && data && data.length > 0) {
        renderLB(c, data);
        return;
      }
    } catch (e) {
      console.warn('Supabase leaderboard failed, falling back to Sheets');
    }
  }

  // Fallback về Google Sheets nếu Supabase lỗi
  renderLBFallback(c);
}
