// supabase-client.js
// Thông tin kết nối dự án Supabase của Thầy Du Gia Văn
const SUPABASE_URL = "https://fgesawwyjidyyfuiiqga.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_JrCxME29MxPgfehEiOR1LQ_kyqrOXGx";

// Khởi tạo và xuất Supabase Client dùng chung cho toàn bộ ứng dụng
// Khóa anon này an toàn tuyệt đối khi chạy trên trình duyệt (Front-end thuần)
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);