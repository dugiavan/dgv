# 📖 HƯỚNG DẪN TẠO VÀ QUẢN LÝ BLOG MỚI
*(Dành cho Thầy Du Gia Văn)*

Chào Thầy Văn! Hệ thống Blog mới hoạt động theo cơ chế **đọc file tĩnh** (tương tự như cách lưu Flashcard/Speaking). Thầy có thể tạo bài mới hoặc chỉnh sửa bài cũ cực kỳ đơn giản theo các bước bên dưới.

---

## 🛠️ Bước 1: Tạo Nội Dung Bài Viết (File Markdown)

1. Thầy vào thư mục: `content/blog/posts/`
2. Tạo một file mới và đặt tên theo định dạng: `{Số thứ tự}-{tên-không-dau}.md`
   * *Ví dụ bài tiếp theo:* `004-future-simple-guide.md`
3. Mở file vừa tạo lên và biên soạn nội dung bằng ngôn ngữ **Markdown** (như mẫu dưới đây):

```markdown
# 5 Mẹo Học Thì Tương Lai Đơn Siêu Nhanh

> 💡 **Tóm tắt:** Bài viết này hướng dẫn các em học sinh cách làm chủ thì Tương lai đơn (Future Simple) chỉ trong 10 phút.

---

## 1. Công thức cơ bản
* Khẳng định: **S + will + V-inf**
* Phủ định: **S + will not (won't) + V-inf**

*Ví dụ:* I **will go** to school tomorrow.

## 2. Cách nhận biết
Nhìn thấy các trạng từ chỉ tương lai:
- **Tomorrow** (ngày mai)
- **Next** week/month/year (tuần tới/tháng tới/năm tới)
- **In the future** (trong tương lai)
```

*(Mẹo: Thầy có thể sử dụng các trang web soạn thảo Markdown trực quan như [stackedit.io](https://stackedit.io/) để viết trước rồi copy paste vào file nếu muốn.)*

---

## 📋 Bước 2: Đăng Ký Bài Viết (Cập Nhật `index.json`)

Mỗi khi tạo bài viết mới, Thầy cần khai báo thông tin bài viết vào file danh mục trung tâm: `content/blog/index.json`.

1. Mở file `content/blog/index.json` bằng công cụ chỉnh sửa văn bản.
2. Thầy kéo xuống dưới cùng, copy một khối thông tin từ dấu ngoặc nhọn `{` đến `}` của bài viết trước, thêm dấu phẩy `,` và dán vào ngay phía sau để tạo một mục mới:

```json
  {
    "id": "004",
    "slug": "future-simple-guide",
    "title": "5 Mẹo Học Thì Tương Lai Đơn Siêu Nhanh",
    "excerpt": "Bài viết này hướng dẫn các em học sinh cách làm chủ thì Tương lai đơn (Future Simple) chỉ trong 10 phút.",
    "author": "Du Gia Văn",
    "authorAvatar": "🧑‍🏫",
    "publishedAt": "2026-05-28",
    "updatedAt": null,
    "readingTime": 3,
    "tags": ["grammar", "tips"],
    "category": "grammar",
    "featured": true,
    "pinned": false,
    "difficulty": "beginner",
    "coverEmoji": "🔮",
    "coverColor": "#EBF3FE",
    "relatedPosts": ["001", "002"],
    "linkedUnit": "unit-06",
    "linkedFlashcard": null,
    "views": 0,
    "likes": 0,
    "status": "published"
  }
```

### 💡 Các mục Thầy cần lưu ý khi điền:
* `"id"`: Phải trùng với số thứ tự đặt tên file (ví dụ `"004"`).
* `"slug"`: Tên file bỏ đi phần số thứ tự và đuôi `.md` (ví dụ `"future-simple-guide"`).
* `"coverEmoji"` và `"coverColor"`: Icon bìa và mã màu nền của bài viết. Thầy chọn màu pastel nhẹ nhàng (ví dụ `#FFF0F0` hồng nhạt, `#EAF8EB` xanh lá nhạt, `#EBF3FE` xanh dương nhạt).
* `"status"`: Để `"published"` để học sinh thấy ngay. Nếu thầy đang viết dở, hãy để `"draft"` để ẩn bài viết.
* `"featured"`: Nếu để `true`, bài viết này sẽ có xác suất được hiển thị tại widget **"Bài Viết Hôm Nay"** trên trang chủ cao gấp 3 lần bài viết thường.
* `"linkedUnit"`: Điền ID của Bài học (ví dụ `"unit-06"`) nếu Thầy muốn cuối bài viết hiện nút **"✏️ Luyện Tập Ngay"** để học sinh nhấn vào là bay thẳng qua bài học đó luyện đề luôn!
* `"linkedFlashcard"`: Điền ID của Bộ từ vựng Flashcard (ví dụ `"food-and-drinks"`) nếu Thầy muốn hiện nút **"📇 Ôn Từ Vựng Flashcard"** ở cuối bài.

---

## 🏷️ Bước 3: Cập Nhật Số Lượng Tags (Tùy chọn)

Nếu Thầy sử dụng các nhãn tìm kiếm (tags) hiện có, Thầy có thể vào file `content/blog/tags.json` để cộng thêm 1 đơn vị vào số lượng `"count"` của tag đó để thống kê chính xác hơn. 

Chúc Thầy Văn biên soạn được nhiều bài viết hay cho học trò của mình! 🍃
