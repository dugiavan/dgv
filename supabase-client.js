// supabase-client.js — Phiên bản sửa lỗi
const SUPABASE_URL = "https://fgesawwyjidyyfuiiqga.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_JrCxME29MxPgfehEiOR1LQ_kyqrOXGx";

// Biến toàn cục, sẽ được gán sau khi thư viện load
let supabaseClient = null;

function initSupabase() {
  if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase đã kết nối');
  } else {
    console.warn('⚠️ Supabase SDK chưa được load');
  }
}