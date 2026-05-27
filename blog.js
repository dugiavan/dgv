/* ════════════════════════════════════════════════════════
   BLOG MODULE — blog.js
   Độc lập hoàn toàn, không ảnh hưởng các tính năng khác
   Thầy Du Gia Văn có thể tự biên soạn bài viết bằng Markdown
   ════════════════════════════════════════════════════════ */

const BLOG = {
  posts: [],            // Danh sách metadata bài viết
  tags: {},             // Danh sách tags định nghĩa trong tags.json
  currentPost: null,    // Bài viết đang xem chi tiết
  activeCategory: 'all',// Danh mục đang lọc ('all', 'grammar', 'vocabulary', 'tips')
  activeTag: null,      // Tag đang lọc
  searchQuery: '',      // Từ khoá tìm kiếm hiện tại
  historyPageStack: []  // Quản lý nút quay lại
};

// Khởi tạo Widget trang chủ
async function blogInitHome() {
  try {
    if (BLOG.posts.length === 0) {
      const res = await fetch(`${BLOG_CONFIG.INDEX_URL}?t=${Date.now()}`);
      if (!res.ok) return;
      BLOG.posts = await res.json();
    }
    
    const published = BLOG.posts.filter(p => p.status === 'published');
    if (published.length === 0) return;

    // Chọn ngẫu nhiên có trọng số (Featured bài viết có cơ hội xuất hiện cao gấp 3)
    const weighted = [];
    published.forEach(p => {
      const weight = p.featured ? 3 : 1;
      for (let i = 0; i < weight; i++) {
        weighted.push(p);
      }
    });

    const randomPost = weighted[Math.floor(Math.random() * weighted.length)];
    window._randomPost = randomPost;

    const widget = document.getElementById('random-post-widget');
    if (widget) {
      widget.style.display = 'block';
      widget.innerHTML = `
        <div class="rpw-label">🌱 Bài viết hay khuyên đọc</div>
        <div class="rpw-card" onclick="openBlogPost('${randomPost.id}')">
          <div class="rpw-cover" style="background-color: ${randomPost.coverColor || '#e8f5eb'}">
            ${randomPost.coverEmoji || '📝'}
          </div>
          <div class="rpw-info">
            <div class="rpw-title">${randomPost.title}</div>
            <div class="rpw-excerpt">${randomPost.excerpt}</div>
            <div class="rpw-meta">
              <span>⏱️ ${randomPost.readingTime} phút đọc</span>
              <span>👤 ${randomPost.author}</span>
            </div>
          </div>
          <div class="rpw-arrow">›</div>
        </div>
      `;
    }
  } catch (e) {
    console.error("Không thể load widget random post:", e);
  }
}

// Mở trang danh sách bài viết
async function openBlogList() {
  showPage('page-blog-list');
  
  const container = document.getElementById('blog-posts-list');
  container.innerHTML = '<div class="units-loading"><div class="loader"></div>Đang tải bài viết...</div>';

  try {
    // Tải danh sách bài viết nếu chưa có
    if (BLOG.posts.length === 0) {
      const res = await fetch(`${BLOG_CONFIG.INDEX_URL}?t=${Date.now()}`);
      if (!res.ok) throw new Error();
      BLOG.posts = await res.json();
    }

    // Tải danh sách tags nếu chưa có
    if (Object.keys(BLOG.tags).length === 0) {
      const res = await fetch(`${BLOG_CONFIG.TAGS_URL}?t=${Date.now()}`);
      if (res.ok) {
        BLOG.tags = await res.json();
      }
    }

    renderBlogCategories();
    renderBlogTags();
    renderBlogPosts();
  } catch (e) {
    container.innerHTML = `
      <div class="units-loading" style="color:var(--c-danger);">
        ⚠️ Không tải được danh sách bài viết.<br>
        <span style="font-size:.78rem;color:var(--c-muted);">Kiểm tra lại thư mục content/blog/</span>
      </div>`;
  }
}

// Render các nút danh mục lớn
function renderBlogCategories() {
  const listEl = document.getElementById('blog-categories-list');
  if (!listEl) return;

  const categories = [
    { id: 'all', label: 'Tất cả', icon: '📚' },
    { id: 'grammar', label: 'Ngữ Pháp', icon: '📐' },
    { id: 'vocabulary', label: 'Từ Vựng', icon: '📖' },
    { id: 'tips', label: 'Mẹo Học', icon: '💡' }
  ];

  listEl.innerHTML = categories.map(cat => `
    <button class="blog-cat-btn ${BLOG.activeCategory === cat.id ? 'active' : ''}" 
            onclick="blogFilterCategory('${cat.id}')">
      <span>${cat.icon}</span> ${cat.label}
    </button>
  `).join('');
}

// Render danh sách tags cuộn ngang
function renderBlogTags() {
  const listEl = document.getElementById('blog-tags-list');
  if (!listEl || Object.keys(BLOG.tags).length === 0) return;

  let tagsHtml = `<button class="blog-tag-pill ${!BLOG.activeTag ? 'active' : ''}" onclick="blogFilterTag(null)"># Tất cả tag</button>`;
  
  for (const [tagKey, tagMeta] of Object.entries(BLOG.tags)) {
    tagsHtml += `
      <button class="blog-tag-pill ${BLOG.activeTag === tagKey ? 'active' : ''}" 
              onclick="blogFilterTag('${tagKey}')">
        ${tagMeta.emoji || '#'} ${tagMeta.label}
      </button>`;
  }
  
  listEl.innerHTML = tagsHtml;
}

// Lọc theo danh mục
function blogFilterCategory(catId) {
  BLOG.activeCategory = catId;
  renderBlogCategories();
  renderBlogPosts();
}

// Lọc theo tag
function blogFilterTag(tagKey) {
  BLOG.activeTag = tagKey;
  renderBlogTags();
  renderBlogPosts();
}

// Sự kiện khi gõ ô tìm kiếm
function blogOnSearch() {
  const input = document.getElementById('blog-search-input');
  BLOG.searchQuery = input ? input.value.trim().toLowerCase() : '';
  renderBlogPosts();
}

// Hiển thị danh sách bài viết dựa trên bộ lọc & tìm kiếm
function renderBlogPosts() {
  const container = document.getElementById('blog-posts-list');
  if (!container) return;

  let filtered = BLOG.posts.filter(p => p.status === 'published');

  // Lọc theo category
  if (BLOG.activeCategory !== 'all') {
    filtered = filtered.filter(p => p.category === BLOG.activeCategory);
  }

  // Lọc theo tag
  if (BLOG.activeTag) {
    filtered = filtered.filter(p => p.tags && p.tags.includes(BLOG.activeTag));
  }

  // Tìm kiếm (trong tiêu đề, tóm tắt và tags)
  if (BLOG.searchQuery) {
    filtered = filtered.filter(p => 
      p.title.toLowerCase().includes(BLOG.searchQuery) ||
      p.excerpt.toLowerCase().includes(BLOG.searchQuery) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(BLOG.searchQuery)))
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = '<div class="units-loading">📭 Không tìm thấy bài viết nào phù hợp.</div>';
    return;
  }

  // Đánh dấu đã đọc lấy từ sessionStorage
  const readHistory = JSON.parse(sessionStorage.getItem('blog_read_history') || '[]');

  container.innerHTML = filtered.map((post, i) => {
    const isRead = readHistory.includes(post.id);
    const categoryLabel = post.category === 'grammar' ? 'Ngữ Pháp' : post.category === 'tips' ? 'Mẹo Học' : 'Từ Vựng';
    
    return `
      <div class="blog-card" style="animation-delay:${i * 0.05}s" onclick="openBlogPost('${post.id}')">
        <div class="blog-card-cover" style="background-color: ${post.coverColor || '#f9f9f9'}">
          <span class="blog-card-emoji">${post.coverEmoji || '📝'}</span>
          ${isRead ? '<span class="blog-card-read-badge">✓ Đã đọc</span>' : ''}
        </div>
        <div class="blog-card-content">
          <div class="blog-card-meta">
            <span class="blog-card-tag">${categoryLabel}</span>
            <span>⏱️ ${post.readingTime || 3} phút</span>
          </div>
          <h3 class="blog-card-title">${post.title}</h3>
          <p class="blog-card-excerpt">${post.excerpt}</p>
          <div class="blog-card-footer">
            <span>👤 ${post.author}</span>
            <span>📅 ${post.publishedAt}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Mở chi tiết 1 bài viết
async function openBlogPost(postId) {
  const container = document.getElementById('blog-post-body');
  const header = document.getElementById('blog-detail-header');
  const crosslinks = document.getElementById('blog-crosslinks');
  const footerNav = document.getElementById('blog-footer-nav');

  container.innerHTML = '<div class="units-loading"><div class="loader"></div>Đang tải bài viết...</div>';
  header.innerHTML = '';
  crosslinks.innerHTML = '';
  footerNav.innerHTML = '';
  
  // Reset progress bar
  document.getElementById('blog-progress-fill').style.width = '0%';

  // Lưu lịch sử stack để back đúng trang trước đó
  const activePage = document.querySelector('.page.active')?.id || 'page-home';
  if (activePage !== 'page-blog-post') {
    BLOG.historyPageStack.push(activePage);
  }

  showPage('page-blog-post');

  try {
    // Đảm bảo đã có index bài viết
    if (BLOG.posts.length === 0) {
      const res = await fetch(`${BLOG_CONFIG.INDEX_URL}?t=${Date.now()}`);
      BLOG.posts = await res.json();
    }

    const post = BLOG.posts.find(p => p.id === postId);
    if (!post) throw new Error('Không tìm thấy bài viết');
    
    BLOG.currentPost = post;
    document.getElementById('blog-detail-nav-title').textContent = post.title;

    // Load Markdown content
    const resMd = await fetch(`${BLOG_CONFIG.POSTS_DIR}${post.id}-${post.slug}.md?t=${Date.now()}`);
    if (!resMd.ok) throw new Error('Không load được nội dung');
    const markdownText = await resMd.text();

    // Render header
    const categoryLabel = post.category === 'grammar' ? 'Ngữ Pháp' : post.category === 'tips' ? 'Mẹo Học' : 'Từ Vựng';
    header.innerHTML = `
      <div class="blog-detail-emoji-wrap" style="background-color: ${post.coverColor || '#f0f0f0'}">
        <span class="blog-detail-emoji">${post.coverEmoji || '📝'}</span>
      </div>
      <div class="blog-detail-meta-top">
        <span class="blog-detail-cat-pill">${categoryLabel}</span>
        <span>⏱️ ${post.readingTime} phút đọc</span>
      </div>
      <h1 class="blog-detail-title">${post.title}</h1>
      <div class="blog-detail-author-row">
        <span class="blog-author-avatar">${post.authorAvatar || '🧑‍🏫'}</span>
        <div class="blog-author-info">
          <div class="blog-author-name">Thầy ${post.author}</div>
          <div class="blog-author-date">Đăng ngày: ${post.publishedAt}</div>
        </div>
      </div>
    `;

    // Render body using marked.js
    if (window.marked) {
      container.innerHTML = marked.parse(markdownText);
    } else {
      container.innerHTML = `<pre style="white-space: pre-wrap;">${markdownText}</pre>`;
    }

    // Render Cross-links (Làm bài ngay / Ôn từ vựng)
    let crosslinkHtml = '';
    if (post.linkedUnit) {
      // Tìm tên Unit
      let unitTitle = "Bài Học";
      if (typeof allUnits !== 'undefined') {
        const targetUnit = allUnits.find(u => u.id === post.linkedUnit);
        if (targetUnit) unitTitle = targetUnit.title;
      }
      crosslinkHtml += `
        <button class="blog-action-btn btn-unit" onclick="blogGoToUnit('${post.linkedUnit}')">
          ✏️ Luyện Tập Ngay: ${unitTitle}
        </button>`;
    }
    if (post.linkedFlashcard) {
      crosslinkHtml += `
        <button class="blog-action-btn btn-flashcard" onclick="blogGoToFlashcard('${post.linkedFlashcard}')">
          📇 Ôn Từ Vựng Flashcard
        </button>`;
    }
    crosslinks.innerHTML = crosslinkHtml;

    // Đánh dấu đã đọc bài viết vào history
    markPostAsRead(post.id);

    // Render Related posts & Prev/Next
    renderPostFooterNav(post);

    // Kích hoạt scroll progress listener
    setupBlogScrollProgress();

  } catch (e) {
    container.innerHTML = `
      <div class="units-loading" style="color:var(--c-danger);">
        ⚠️ Lỗi khi tải nội dung bài viết.<br>
        <span style="font-size:.78rem;">Vui lòng kiểm tra: ${BLOG_CONFIG.POSTS_DIR}${postId}</span>
      </div>`;
  }
}

// Lưu lịch sử bài viết đã đọc
function markPostAsRead(postId) {
  let readHistory = JSON.parse(sessionStorage.getItem('blog_read_history') || '[]');
  if (!readHistory.includes(postId)) {
    readHistory.push(postId);
    sessionStorage.setItem('blog_read_history', JSON.stringify(readHistory));
  }
}

// Thiết lập thanh tiến trình cuộn đọc bài viết
function setupBlogScrollProgress() {
  const pageContainer = document.getElementById('page-blog-post');
  pageContainer.onscroll = () => {
    const scrollHeight = pageContainer.scrollHeight - pageContainer.clientHeight;
    if (scrollHeight > 0) {
      const pct = (pageContainer.scrollTop / scrollHeight) * 100;
      document.getElementById('blog-progress-fill').style.width = pct + '%';
    }
  };
}

// Quay lại trang trước đó
function blogGoBack() {
  if (BLOG.historyPageStack.length > 0) {
    const prevPage = BLOG.historyPageStack.pop();
    showPage(prevPage);
    if (prevPage === 'page-blog-list') {
      renderBlogPosts(); // refresh badges
    }
  } else {
    showPage('page-home');
  }
}

// Chia sẻ bài viết (Copy link)
function blogShare() {
  if (!BLOG.currentPost) return;
  const dummyUrl = `${window.location.origin}${window.location.pathname}?post=${BLOG.currentPost.id}`;
  navigator.clipboard.writeText(dummyUrl).then(() => {
    alert("🔗 Đã sao chép liên kết bài viết này thành công!");
  }).catch(() => {
    alert("Không thể tự động copy, vui lòng copy địa chỉ trình duyệt.");
  });
}

// Nhấn chuyển nhanh đến bài học liên quan
function blogGoToUnit(unitId) {
  if (typeof openUnit === 'function') {
    openUnit(unitId);
  } else {
    alert(`Không tìm thấy bài học ${unitId}`);
  }
}

// Nhấn chuyển nhanh đến bộ Flashcard liên quan
function blogGoToFlashcard(topicId) {
  if (typeof startFlashcardTopic === 'function') {
    if (typeof flashcardTopics !== 'undefined' && flashcardTopics.length === 0) {
      fetch(`./content/flashcards/topics-index.json?t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
          flashcardTopics = data;
          startFlashcardTopic(topicId);
        })
        .catch(() => startFlashcardTopic(topicId));
    } else {
      startFlashcardTopic(topicId);
    }
  } else {
    alert(`Không tìm thấy bộ flashcard ${topicId}`);
  }
}

// Render nút Prev / Next và các bài viết liên quan
function renderPostFooterNav(currentPost) {
  const footerNav = document.getElementById('blog-footer-nav');
  if (!footerNav) return;

  const published = BLOG.posts.filter(p => p.status === 'published');
  const currentIndex = published.findIndex(p => p.id === currentPost.id);
  
  const prevPost = currentIndex > 0 ? published[currentIndex - 1] : null;
  const nextPost = currentIndex < published.length - 1 ? published[currentIndex + 1] : null;

  // Lọc 2 bài viết khác cùng chuyên mục làm bài liên quan
  const related = published
    .filter(p => p.id !== currentPost.id && p.category === currentPost.category)
    .slice(0, 2);

  let html = '';

  // Khúc liên quan
  if (related.length > 0) {
    html += `
      <div class="blog-related-section">
        <h4 class="blog-related-title">📖 Bài viết cùng chủ đề</h4>
        <div class="blog-related-grid">
          ${related.map(p => `
            <div class="blog-related-card" onclick="openBlogPost('${p.id}')">
              <span class="brc-emoji">${p.coverEmoji || '📝'}</span>
              <div class="brc-title">${p.title}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Khúc Prev / Next
  html += `
    <div class="blog-prev-next-row">
      ${prevPost ? `
        <button class="blog-pn-btn prev" onclick="openBlogPost('${prevPost.id}')">
          <span class="arrow">‹</span>
          <div class="btn-info">
            <span class="label">Bài trước</span>
            <span class="title">${prevPost.title}</span>
          </div>
        </button>
      ` : '<div style="flex:1;"></div>'}
      
      ${nextPost ? `
        <button class="blog-pn-btn next" onclick="openBlogPost('${nextPost.id}')">
          <div class="btn-info" style="text-align:right;">
            <span class="label">Bài tiếp theo</span>
            <span class="title">${nextPost.title}</span>
          </div>
          <span class="arrow">›</span>
        </button>
      ` : '<div style="flex:1;"></div>'}
    </div>
  `;

  footerNav.innerHTML = html;
}
