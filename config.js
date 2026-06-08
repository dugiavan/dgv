/* ════════════════════════════════════════════
   CONFIG — Thầy chỉ cần sửa file này
   ════════════════════════════════════════════ */
const CONFIG = {
  // Dán URL Google Apps Script của thầy vào đây
  SHEETS_URL: 'https://script.google.com/macros/s/AKfycbyKS6Lb4aqXdC3K5xDmfezww5MD16Lav7tmWoX4IeZYZYQZg8PR2HquU_UHfgSlWNdr/exec',
  UNITS_INDEX: './content/units-index.json',
  // Thời gian session (giờ) — sau khi hết sẽ tự logout
  SESSION_HOURS: 8,

  // ─── CHẾ ĐỘ DEMO ───────────────────────────────
  // true  = tự động đăng nhập bằng tài khoản bên dưới
  // false = hiện trang đăng nhập như bình thường
  DEMO_MODE: false,
  DEMO_USERNAME: 'dgv',
  DEMO_PASSWORD: 'dgv',
  // ─────────────────────────────────────────────────
};

/* LEVELS — xem file levels.js (300 cấp) */

const XP_PER_Q = { easy: 5, medium: 10, hard: 18 };

const CATEGORIES = {
  tenses: { icon: '⏰', title: 'Các Thì (Tenses)', desc: '12 thì trong tiếng Anh' },
  sentence_structures: { icon: '📐', title: 'Cấu Trúc Câu', desc: 'Mẫu câu, điều kiện, ước, bị động, quan hệ và mệnh đề trạng ngữ' },
  verbs: { icon: '🏃', title: 'Chức Năng Động Từ', desc: 'Gerund V-ing, To-V và Bare-Infinitive' },
  word_types: { icon: '🔤', title: 'Loại Từ', desc: 'Các loại từ cơ bản trong tiếng Anh: Động Từ, Danh Từ, Trạng Từ, Tính Từ' }
};

const BLOG_CONFIG = {
  INDEX_URL: './content/blog/index.json',
  TAGS_URL: './content/blog/tags.json',
  POSTS_DIR: './content/blog/posts/',
  PAGE_SIZE: 12,
};

const VIDEO_CONFIG = {
  TOPICS_INDEX: './content/videos/topics-index.json',
  VIDEOS_DIR: './content/videos/',
  // YouTube video ID hiển thị trên trang chủ (đổi ID này để đổi video)
  HOME_VIDEO_ID: 'uD4izuDMUQA',
  HOME_VIDEO_TITLE: 'TIMELAPSE OF THE FUTURE: A Journey to the End of Time',
};

const WORDSHOOTER_CONFIG = {
  MAX_WORDS_ON_SCREEN: 6,
  SPAWN_INTERVAL_MS: 1600,
  FALL_SPEED_BASE: 1.6,
  FALL_SPEED_SCALE: 0.1,
  SHIP_SPEED: 8,
  LIVES: 3,
  XP_PER_CORRECT: 3,
  DEFAULT_SHIP: 'classic',
  DEFAULT_BG: 'space',
  WORD_MIN_COUNT: 8,
};

