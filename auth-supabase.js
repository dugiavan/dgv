// auth-supabase.js — Đăng nhập qua Supabase thay vì Google Sheets

async function doLogin() {
  const usernameInput = document.getElementById('inp-username');
  const passwordInput = document.getElementById('inp-password');
  const username = usernameInput ? usernameInput.value.trim() : '';
  const password = passwordInput ? passwordInput.value : '';

  if (!username) { setLoginError('Vui lòng nhập tên đăng nhập'); return; }
  if (!password) { setLoginError('Vui lòng nhập mật khẩu'); return; }
  if (!supabaseClient) { setLoginError('⚠️ Chưa kết nối được server'); return; }

  setLoginLoading(true);
  setLoginError('');

  try {
    // Tìm học sinh theo username và password
    const { data, error } = await supabaseClient
      .from('students')
      .select('*')
      .eq('username', username)
      .eq('password_hash', password)
      .single();

    if (error || !data) {
      setLoginError('Sai tên đăng nhập hoặc mật khẩu');
      return;
    }

    // Lưu session như cũ
    saveSession({
      student_id: data.student_id,
      username: data.username,
      full_name: data.full_name,
      role: data.role || '',
      department: data.department || '',
      level: data.level || 1,
      xp: data.xp || 0,
      streak: data.streak || 0,
      lastDate: data.last_date || '',
    });

    updateStreakOnLogin();
    if (typeof initHome === 'function') initHome();
    showPage('page-home');

  } catch (e) {
    setLoginError('Lỗi kết nối. Kiểm tra mạng và thử lại.');
  } finally {
    setLoginLoading(false);
  }
}
