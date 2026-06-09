/* ════════════════════════════════════════════
   THEORY MODULE
   ════════════════════════════════════════════ */

async function loadTheory() {
  const b = document.getElementById('theory-body');
  if (!b) return;
  b.innerHTML = '<div class="loader" style="margin:2rem auto;"></div>';
  if (!currentUnit) {
    b.innerHTML = '<p style="color:var(--c-muted);text-align:center;padding:2rem;">📭 Chưa chọn bài học.</p>';
    return;
  }
  try {
    if (!supabaseClient) {
      throw new Error('Supabase client chưa được khởi tạo');
    }
    const { data, error } = await supabaseClient
      .from('theory')
      .select('content')
      .eq('unit_id', currentUnit.id)
      .maybeSingle();

    if (error) throw error;
    
    if (data && data.content) {
      b.innerHTML = marked.parse(data.content);
    } else {
      b.innerHTML = '<p style="color:var(--c-muted);text-align:center;padding:2rem;">📭 Bài học này chưa cập nhật nội dung lý thuyết.</p>';
    }
  } catch (e) { 
    console.error('Lỗi tải lý thuyết:', e);
    b.innerHTML = '<p style="color:var(--c-muted);text-align:center;padding:2rem;">📭 Không thể tải lý thuyết. Kiểm tra lại kết nối.</p>'; 
  }
}
