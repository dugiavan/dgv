/* ════════════════════════════════════════════
   LEVELS — 300 cấp (tên vui + XP grind dần)
   Load trước config.js — đừng sửa tay, dùng script _rebuild_xp.py nếu cần
   ════════════════════════════════════════════ */
const LEVELS = [
  {
    "lv": 1,
    "title": "Mầm Non Ngôn Ngữ",
    "xp": 0
  },
  {
    "lv": 2,
    "title": "Học Sinh Mới Tinh",
    "xp": 39
  },
  {
    "lv": 3,
    "title": "Siêu Nhân Đi Học",
    "xp": 82
  },
  {
    "lv": 4,
    "title": "Chăm Ngoan Bổ Ích",
    "xp": 129
  },
  {
    "lv": 5,
    "title": "Tập Tành Past Simple",
    "xp": 180
  },
  {
    "lv": 6,
    "title": "Fan Chưa Biết Fan",
    "xp": 235
  },
  {
    "lv": 7,
    "title": "Con Cưng Của Thầy",
    "xp": 294
  },
  {
    "lv": 8,
    "title": "Học Trò Ngoan Xinh",
    "xp": 357
  },
  {
    "lv": 9,
    "title": "Đom Đóm Phát Sáng",
    "xp": 424
  },
  {
    "lv": 10,
    "title": "Cú Đêm Ôn Bài",
    "xp": 495
  },
  {
    "lv": 11,
    "title": "Bánh Mì Kẹp Từ Vựng",
    "xp": 570
  },
  {
    "lv": 12,
    "title": "Trà Sữa Ngữ Pháp",
    "xp": 649
  },
  {
    "lv": 13,
    "title": "Cà Phê Sữa Đá Anh Văn",
    "xp": 732
  },
  {
    "lv": 14,
    "title": "Bún Bò Chấm Điểm",
    "xp": 819
  },
  {
    "lv": 15,
    "title": "Phở Tái Level Up",
    "xp": 910
  },
  {
    "lv": 16,
    "title": "Bánh Cuốn Thì",
    "xp": 1005
  },
  {
    "lv": 17,
    "title": "Xôi Gấc Động Từ",
    "xp": 1104
  },
  {
    "lv": 18,
    "title": "Chè Khúc Bạch Từ",
    "xp": 1207
  },
  {
    "lv": 19,
    "title": "Bánh Flan Không Tan",
    "xp": 1314
  },
  {
    "lv": 20,
    "title": "Kem Dừa Gerund",
    "xp": 1425
  },
  {
    "lv": 21,
    "title": "Trứng Vịt Lộn Thì",
    "xp": 1545
  },
  {
    "lv": 22,
    "title": "Ốc Hương Sốt Me",
    "xp": 1677
  },
  {
    "lv": 23,
    "title": "Gà Rán Present",
    "xp": 1821
  },
  {
    "lv": 24,
    "title": "Vịt Quay Bài Tập",
    "xp": 1977
  },
  {
    "lv": 25,
    "title": "Heo Quay Điểm Cao",
    "xp": 2145
  },
  {
    "lv": 26,
    "title": "Cá Kho XP",
    "xp": 2325
  },
  {
    "lv": 27,
    "title": "Tôm Hùm Leaderboard",
    "xp": 2517
  },
  {
    "lv": 28,
    "title": "Mực Xào Leader",
    "xp": 2721
  },
  {
    "lv": 29,
    "title": "Cua Rang Me Streak",
    "xp": 2937
  },
  {
    "lv": 30,
    "title": "Ghẹ Hấp Bài Thi",
    "xp": 3165
  },
  {
    "lv": 31,
    "title": "Sò Điệp Flashcard",
    "xp": 3405
  },
  {
    "lv": 32,
    "title": "Hàu Nướng Unit",
    "xp": 3657
  },
  {
    "lv": 33,
    "title": "Nem Rán Đúng Hết",
    "xp": 3921
  },
  {
    "lv": 34,
    "title": "Gỏi Cuốn Không Sai",
    "xp": 4197
  },
  {
    "lv": 35,
    "title": "Chả Giò Level",
    "xp": 4485
  },
  {
    "lv": 36,
    "title": "Bún Chả Hà Nội",
    "xp": 4785
  },
  {
    "lv": 37,
    "title": "Bánh Xèo Miền Tây",
    "xp": 5097
  },
  {
    "lv": 38,
    "title": "Hủ Tiếu Nam Vang",
    "xp": 5421
  },
  {
    "lv": 39,
    "title": "Mì Quảng Đà Nẵng",
    "xp": 5757
  },
  {
    "lv": 40,
    "title": "Cao Lầu Hội An",
    "xp": 6105
  },
  {
    "lv": 41,
    "title": "Bánh Bèo Huế",
    "xp": 6465
  },
  {
    "lv": 42,
    "title": "Bánh Nậm Huế",
    "xp": 6853
  },
  {
    "lv": 43,
    "title": "Bánh Lọc Huế",
    "xp": 7269
  },
  {
    "lv": 44,
    "title": "Cơm Hến Hoàng Hôn",
    "xp": 7713
  },
  {
    "lv": 45,
    "title": "Bánh Canh Cua",
    "xp": 8185
  },
  {
    "lv": 46,
    "title": "Hủ Tiếu Gõ Đêm",
    "xp": 8685
  },
  {
    "lv": 47,
    "title": "Bò Kho Sách Vở",
    "xp": 9213
  },
  {
    "lv": 48,
    "title": "Lẩu Bò Tri Thức",
    "xp": 9769
  },
  {
    "lv": 49,
    "title": "Lẩu Thái Từ Vựng",
    "xp": 10353
  },
  {
    "lv": 50,
    "title": "Lẩu Mắm Tôm Grammar",
    "xp": 10965
  },
  {
    "lv": 51,
    "title": "Lẩu Dê Núi Đá",
    "xp": 11605
  },
  {
    "lv": 52,
    "title": "Lẩu Cá Kèo",
    "xp": 12273
  },
  {
    "lv": 53,
    "title": "Bánh Tráng Trộn",
    "xp": 12969
  },
  {
    "lv": 54,
    "title": "Bánh Khọt Vũng Tàu",
    "xp": 13693
  },
  {
    "lv": 55,
    "title": "Bánh Căn Nha Trang",
    "xp": 14445
  },
  {
    "lv": 56,
    "title": "Bánh Ướt Lá Sen",
    "xp": 15225
  },
  {
    "lv": 57,
    "title": "Cháo Lòng Đêm Khuya",
    "xp": 16033
  },
  {
    "lv": 58,
    "title": "Cháo Gà Ôn Thi",
    "xp": 16869
  },
  {
    "lv": 59,
    "title": "Cháo Vịt Level 50",
    "xp": 17733
  },
  {
    "lv": 60,
    "title": "Hủ Tiếu Bò Viên",
    "xp": 18625
  },
  {
    "lv": 61,
    "title": "Mì Xào Bò Bài",
    "xp": 19545
  },
  {
    "lv": 62,
    "title": "Phở Gà Ta",
    "xp": 20520
  },
  {
    "lv": 63,
    "title": "Phở Bò Tái Năng",
    "xp": 21550
  },
  {
    "lv": 64,
    "title": "Bún Riêu Cua",
    "xp": 22635
  },
  {
    "lv": 65,
    "title": "Bún Mắm Miền Tây",
    "xp": 23775
  },
  {
    "lv": 66,
    "title": "Bún Thịt Nướng",
    "xp": 24970
  },
  {
    "lv": 67,
    "title": "Cơm Tấm Sườn Bì",
    "xp": 26220
  },
  {
    "lv": 68,
    "title": "Cơm Tấm Đặc Biệt",
    "xp": 27525
  },
  {
    "lv": 69,
    "title": "Bánh Mì Thịt Nướng",
    "xp": 28885
  },
  {
    "lv": 70,
    "title": "Bánh Mì Pate",
    "xp": 30300
  },
  {
    "lv": 71,
    "title": "Bánh Mì Chả Cá",
    "xp": 33500
  },
  {
    "lv": 72,
    "title": "Xôi Xéo Hà Nội",
    "xp": 37150
  },
  {
    "lv": 73,
    "title": "Xôi Khúc Mùa Thi",
    "xp": 41250
  },
  {
    "lv": 74,
    "title": "Bánh Chưng Tết",
    "xp": 45800
  },
  {
    "lv": 75,
    "title": "Bánh Tét Miền Tây",
    "xp": 50800
  },
  {
    "lv": 76,
    "title": "Bánh Giò Sáng",
    "xp": 56250
  },
  {
    "lv": 77,
    "title": "Bánh Bao Nhân Thịt",
    "xp": 62150
  },
  {
    "lv": 78,
    "title": "Bánh Cuốn Thanh Trì",
    "xp": 68500
  },
  {
    "lv": 79,
    "title": "Bánh Gối Hà Nội",
    "xp": 75300
  },
  {
    "lv": 80,
    "title": "Bánh Rán Doremon",
    "xp": 82550
  },
  {
    "lv": 81,
    "title": "Kem Que Học Sinh",
    "xp": 90050
  },
  {
    "lv": 82,
    "title": "Kem Cốc Streak",
    "xp": 97870
  },
  {
    "lv": 83,
    "title": "Sinh Tố Bơ XP",
    "xp": 106010
  },
  {
    "lv": 84,
    "title": "Sinh Tố Măng Cụt",
    "xp": 114470
  },
  {
    "lv": 85,
    "title": "Trà Chanh Giá Rẻ",
    "xp": 123250
  },
  {
    "lv": 86,
    "title": "Trà Đào Cam Sả",
    "xp": 132350
  },
  {
    "lv": 87,
    "title": "Trà Tắc Siêu Chua",
    "xp": 141770
  },
  {
    "lv": 88,
    "title": "Nước Mía Ép Điểm",
    "xp": 151510
  },
  {
    "lv": 89,
    "title": "Nước Dừa Tươi",
    "xp": 161570
  },
  {
    "lv": 90,
    "title": "Soda Kem Streak",
    "xp": 171950
  },
  {
    "lv": 91,
    "title": "Yaourt Probiotics",
    "xp": 182650
  },
  {
    "lv": 92,
    "title": "Sữa Chua Nếp Cẩm",
    "xp": 193670
  },
  {
    "lv": 93,
    "title": "Bánh Donut Ngủ Quên",
    "xp": 205010
  },
  {
    "lv": 94,
    "title": "Bánh Croissant Sớm",
    "xp": 216670
  },
  {
    "lv": 95,
    "title": "Bánh Tiramisu Đêm",
    "xp": 228650
  },
  {
    "lv": 96,
    "title": "Bánh Cheesecake",
    "xp": 240950
  },
  {
    "lv": 97,
    "title": "Cookie Monster Việt",
    "xp": 253570
  },
  {
    "lv": 98,
    "title": "Brownie Điểm 10",
    "xp": 266510
  },
  {
    "lv": 99,
    "title": "Macaron Pháp Việt",
    "xp": 279770
  },
  {
    "lv": 100,
    "title": "Pudding Ông Bụt",
    "xp": 293350
  },
  {
    "lv": 101,
    "title": "Mèo Con Học Chữ",
    "xp": 307350
  },
  {
    "lv": 102,
    "title": "Chó Cưng Nghe Script",
    "xp": 321830
  },
  {
    "lv": 103,
    "title": "Vịt Con Past Tense",
    "xp": 336790
  },
  {
    "lv": 104,
    "title": "Gà Con Future",
    "xp": 352230
  },
  {
    "lv": 105,
    "title": "Heo Con Continuous",
    "xp": 368150
  },
  {
    "lv": 106,
    "title": "Bò Con Passive",
    "xp": 384550
  },
  {
    "lv": 107,
    "title": "Trâu Cày Sách",
    "xp": 401430
  },
  {
    "lv": 108,
    "title": "Rùa Kiên Nhẫn XP",
    "xp": 418790
  },
  {
    "lv": 109,
    "title": "Thỏ Nhanh Làm Bài",
    "xp": 436630
  },
  {
    "lv": 110,
    "title": "Sóc Cất Hạt Từ",
    "xp": 454950
  },
  {
    "lv": 111,
    "title": "Chim Sẻ Twitter Anh",
    "xp": 473750
  },
  {
    "lv": 112,
    "title": "Đại Bàng Grammar",
    "xp": 493030
  },
  {
    "lv": 113,
    "title": "Cú Mèo Đêm Thi",
    "xp": 512790
  },
  {
    "lv": 114,
    "title": "Cò Trắng Điểm Cao",
    "xp": 533030
  },
  {
    "lv": 115,
    "title": "Hạc Hồng Leader",
    "xp": 553750
  },
  {
    "lv": 116,
    "title": "Vẹt Nói Tiếng Anh",
    "xp": 574950
  },
  {
    "lv": 117,
    "title": "Cá Vàng Trí Nhớ",
    "xp": 596630
  },
  {
    "lv": 118,
    "title": "Cá Heo Phát Âm",
    "xp": 618790
  },
  {
    "lv": 119,
    "title": "Cá Mập Đề Khó",
    "xp": 641430
  },
  {
    "lv": 120,
    "title": "Bạch Tuộc Nhiều Tay",
    "xp": 664550
  },
  {
    "lv": 121,
    "title": "Sứa Phát Sáng",
    "xp": 688150
  },
  {
    "lv": 122,
    "title": "Sao Biển May Mắn",
    "xp": 712230
  },
  {
    "lv": 123,
    "title": "Cua Đá Level",
    "xp": 736790
  },
  {
    "lv": 124,
    "title": "Tôm Hùm Đỏ",
    "xp": 761830
  },
  {
    "lv": 125,
    "title": "Bướm Đẹp Từ Vựng",
    "xp": 787350
  },
  {
    "lv": 126,
    "title": "Ong Chăm Chỉ",
    "xp": 813350
  },
  {
    "lv": 127,
    "title": "Kiến Cày XP",
    "xp": 839830
  },
  {
    "lv": 128,
    "title": "Nhện Mạng Từ",
    "xp": 866790
  },
  {
    "lv": 129,
    "title": "Gián Đen Đêm Thi",
    "xp": 894230
  },
  {
    "lv": 130,
    "title": "Muỗi Chích Điểm",
    "xp": 922150
  },
  {
    "lv": 131,
    "title": "Ruồi Xanh May",
    "xp": 950550
  },
  {
    "lv": 132,
    "title": "Dế Mèn Phiêu Lưu",
    "xp": 979670
  },
  {
    "lv": 133,
    "title": "Thần Đèn Grammar",
    "xp": 1009510
  },
  {
    "lv": 134,
    "title": "Ông Bụt Past Simple",
    "xp": 1040070
  },
  {
    "lv": 135,
    "title": "Bà Tiên Present",
    "xp": 1071350
  },
  {
    "lv": 136,
    "title": "Công Chúa Tense",
    "xp": 1103350
  },
  {
    "lv": 137,
    "title": "Hoàng Tử Động Từ",
    "xp": 1136070
  },
  {
    "lv": 138,
    "title": "Hiệp Sĩ Mạng Từ",
    "xp": 1169510
  },
  {
    "lv": 139,
    "title": "Phù Thủy Sửa Lỗi",
    "xp": 1203670
  },
  {
    "lv": 140,
    "title": "Rồng Vàng XP",
    "xp": 1238550
  },
  {
    "lv": 141,
    "title": "Rồng Xanh Leader",
    "xp": 1274150
  },
  {
    "lv": 142,
    "title": "Rồng Lửa Streak",
    "xp": 1310470
  },
  {
    "lv": 143,
    "title": "Rồng Nước Unit",
    "xp": 1347510
  },
  {
    "lv": 144,
    "title": "Rồng Đất Bài Thi",
    "xp": 1385270
  },
  {
    "lv": 145,
    "title": "Unicorn Tiếng Anh",
    "xp": 1423750
  },
  {
    "lv": 146,
    "title": "Pegasus Bay Chữ",
    "xp": 1462950
  },
  {
    "lv": 147,
    "title": "Phoenix Hồi Điểm",
    "xp": 1502870
  },
  {
    "lv": 148,
    "title": "Kraken Đề Khó",
    "xp": 1543510
  },
  {
    "lv": 149,
    "title": "Minotaur Mê Cung",
    "xp": 1584870
  },
  {
    "lv": 150,
    "title": "Centaur Nửa Người",
    "xp": 1626950
  },
  {
    "lv": 151,
    "title": "Yeti Tuyết Rơi",
    "xp": 1669750
  },
  {
    "lv": 152,
    "title": "Bigfoot Chân To",
    "xp": 1713270
  },
  {
    "lv": 153,
    "title": "Alien UFO Từ",
    "xp": 1757510
  },
  {
    "lv": 154,
    "title": "Robot GPT Cũ",
    "xp": 1802470
  },
  {
    "lv": 155,
    "title": "Cyborg Sửa Ngữ Pháp",
    "xp": 1848150
  },
  {
    "lv": 156,
    "title": "Zombie Ôn Đêm",
    "xp": 1894550
  },
  {
    "lv": 157,
    "title": "Vampire Không Ngủ",
    "xp": 1941670
  },
  {
    "lv": 158,
    "title": "Ma Friendly",
    "xp": 1989510
  },
  {
    "lv": 159,
    "title": "Ma Quỷ Đề Hard",
    "xp": 2038070
  },
  {
    "lv": 160,
    "title": "Hồ Ly Level",
    "xp": 2087350
  },
  {
    "lv": 161,
    "title": "Tiên Ông Điểm",
    "xp": 2137350
  },
  {
    "lv": 162,
    "title": "Thần Sấm Grammar",
    "xp": 2188250
  },
  {
    "lv": 163,
    "title": "Thần Biển Tense",
    "xp": 2240050
  },
  {
    "lv": 164,
    "title": "Thần Lửa XP",
    "xp": 2292750
  },
  {
    "lv": 165,
    "title": "Thần Gió Flashcard",
    "xp": 2346350
  },
  {
    "lv": 166,
    "title": "Thần Đất Unit",
    "xp": 2400850
  },
  {
    "lv": 167,
    "title": "Hercules Sách Nặng",
    "xp": 2456250
  },
  {
    "lv": 168,
    "title": "Zeus Sét Đúng",
    "xp": 2512550
  },
  {
    "lv": 169,
    "title": "Poseidon Sóng Từ",
    "xp": 2569750
  },
  {
    "lv": 170,
    "title": "Athena Trí Tuệ",
    "xp": 2627850
  },
  {
    "lv": 171,
    "title": "Apollo Mặt Trời",
    "xp": 2686850
  },
  {
    "lv": 172,
    "title": "Artemis Mũi Tên",
    "xp": 2746750
  },
  {
    "lv": 173,
    "title": "Hermes Nhanh Tay",
    "xp": 2807550
  },
  {
    "lv": 174,
    "title": "Hades Quá Khứ",
    "xp": 2869250
  },
  {
    "lv": 175,
    "title": "Ares Chiến Binh",
    "xp": 2931850
  },
  {
    "lv": 176,
    "title": "Aphrodite Đẹp",
    "xp": 2995350
  },
  {
    "lv": 177,
    "title": "Loki Trick Question",
    "xp": 3059750
  },
  {
    "lv": 178,
    "title": "Thor Búa Điểm",
    "xp": 3125050
  },
  {
    "lv": 179,
    "title": "Odin Một Mắt",
    "xp": 3191250
  },
  {
    "lv": 180,
    "title": "Freya Streak",
    "xp": 3258350
  },
  {
    "lv": 181,
    "title": "Anubis Ai Cập",
    "xp": 3326350
  },
  {
    "lv": 182,
    "title": "Ra Mặt Trời",
    "xp": 3395250
  },
  {
    "lv": 183,
    "title": "Cleopatra Queen",
    "xp": 3465050
  },
  {
    "lv": 184,
    "title": "Ninja Im Lặng",
    "xp": 3535750
  },
  {
    "lv": 185,
    "title": "Samurai Katana",
    "xp": 3607350
  },
  {
    "lv": 186,
    "title": "Viking Bão XP",
    "xp": 3679850
  },
  {
    "lv": 187,
    "title": "Cướp Biển Từ Vựng",
    "xp": 3753250
  },
  {
    "lv": 188,
    "title": "Thuyền Trưởng Unit",
    "xp": 3827550
  },
  {
    "lv": 189,
    "title": "Phi Công Bay Chữ",
    "xp": 3902750
  },
  {
    "lv": 190,
    "title": "Phi Hành Gia Space",
    "xp": 3978850
  },
  {
    "lv": 191,
    "title": "Thợ Mỏ Đào XP",
    "xp": 4055850
  },
  {
    "lv": 192,
    "title": "Thợ Lặn Deep",
    "xp": 4133750
  },
  {
    "lv": 193,
    "title": "Thợ Săn Điểm",
    "xp": 4212550
  },
  {
    "lv": 194,
    "title": "Thợ Rèn Từ",
    "xp": 4292250
  },
  {
    "lv": 195,
    "title": "Thợ May Câu",
    "xp": 4372850
  },
  {
    "lv": 196,
    "title": "Thợ Xây Grammar",
    "xp": 4454350
  },
  {
    "lv": 197,
    "title": "Bác Sĩ Chữa Lỗi",
    "xp": 4536750
  },
  {
    "lv": 198,
    "title": "Y Tá Ôn Bài",
    "xp": 4620050
  },
  {
    "lv": 199,
    "title": "Giáo Sư Thầy Văn",
    "xp": 4704250
  },
  {
    "lv": 200,
    "title": "Tiến Sĩ Tense",
    "xp": 4789350
  },
  {
    "lv": 201,
    "title": "Thạc Sĩ Medium",
    "xp": 4875350
  },
  {
    "lv": 202,
    "title": "Cử Nhân Easy",
    "xp": 4961870
  },
  {
    "lv": 203,
    "title": "Học Giả Đêm Khuya",
    "xp": 5048910
  },
  {
    "lv": 204,
    "title": "Thiên Tài Ngủ Quên",
    "xp": 5136470
  },
  {
    "lv": 205,
    "title": "Thánh Quiz",
    "xp": 5224550
  },
  {
    "lv": 206,
    "title": "Chúa Tể Multiple Choice",
    "xp": 5313150
  },
  {
    "lv": 207,
    "title": "Vua Fill Blank",
    "xp": 5402270
  },
  {
    "lv": 208,
    "title": "Hoàng Đế XP",
    "xp": 5491910
  },
  {
    "lv": 209,
    "title": "Nữ Hoàng Streak",
    "xp": 5582070
  },
  {
    "lv": 210,
    "title": "Công Tước Unit",
    "xp": 5672750
  },
  {
    "lv": 211,
    "title": "Bá Tước Bài",
    "xp": 5763950
  },
  {
    "lv": 212,
    "title": "Hầu Tước Điểm",
    "xp": 5855670
  },
  {
    "lv": 213,
    "title": "Hiệp Sĩ Bàn Tròn",
    "xp": 5947910
  },
  {
    "lv": 214,
    "title": "Lính Canh Đề",
    "xp": 6040670
  },
  {
    "lv": 215,
    "title": "Cung Thủ Mũi Tên",
    "xp": 6133950
  },
  {
    "lv": 216,
    "title": "Đao Khách Slash",
    "xp": 6227750
  },
  {
    "lv": 217,
    "title": "Pháp Sư Mana XP",
    "xp": 6322070
  },
  {
    "lv": 218,
    "title": "Tu Sĩ Thiền",
    "xp": 6416910
  },
  {
    "lv": 219,
    "title": "Thầy Tu Level",
    "xp": 6512270
  },
  {
    "lv": 220,
    "title": "Đạo Sĩ Bay",
    "xp": 6608150
  },
  {
    "lv": 221,
    "title": "Thợ Phù Phép",
    "xp": 6704550
  },
  {
    "lv": 222,
    "title": "Alchemist Vàng",
    "xp": 6801470
  },
  {
    "lv": 223,
    "title": "Thợ Rèn Legend",
    "xp": 6898910
  },
  {
    "lv": 224,
    "title": "Thợ Thủ Công",
    "xp": 6996870
  },
  {
    "lv": 225,
    "title": "Streamer Live Học",
    "xp": 7095350
  },
  {
    "lv": 226,
    "title": "YouTuber Grammar",
    "xp": 7194350
  },
  {
    "lv": 227,
    "title": "TikToker 15s",
    "xp": 7293870
  },
  {
    "lv": 228,
    "title": "Blogger Dài",
    "xp": 7393910
  },
  {
    "lv": 229,
    "title": "Meme Lord Việt",
    "xp": 7494470
  },
  {
    "lv": 230,
    "title": "Shitpost Master",
    "xp": 7595550
  },
  {
    "lv": 231,
    "title": "Troll Nhẹ Nhàng",
    "xp": 7697150
  },
  {
    "lv": 232,
    "title": "Fan cứng Thầy",
    "xp": 7799270
  },
  {
    "lv": 233,
    "title": "Anti Procrastinate",
    "xp": 7901910
  },
  {
    "lv": 234,
    "title": "Deadline Slayer",
    "xp": 8005070
  },
  {
    "lv": 235,
    "title": "All Nighter Pro",
    "xp": 8108750
  },
  {
    "lv": 236,
    "title": "Sáng Thức Dậy",
    "xp": 8212950
  },
  {
    "lv": 237,
    "title": "Trưa Ngủ Trưa",
    "xp": 8317670
  },
  {
    "lv": 238,
    "title": "Chiều Tan Học",
    "xp": 8422910
  },
  {
    "lv": 239,
    "title": "Tối Cày Bài",
    "xp": 8528670
  },
  {
    "lv": 240,
    "title": "Khuya Đèn Vẫn Sáng",
    "xp": 8634950
  },
  {
    "lv": 241,
    "title": "Chủ Nhật Ôn",
    "xp": 8741750
  },
  {
    "lv": 242,
    "title": "Thứ Hai Blues",
    "xp": 8849070
  },
  {
    "lv": 243,
    "title": "Thứ Ba Cố Gắng",
    "xp": 8956910
  },
  {
    "lv": 244,
    "title": "Thứ Tư Giữa Tuần",
    "xp": 9065270
  },
  {
    "lv": 245,
    "title": "Thứ Năm Gần Cuối",
    "xp": 9174150
  },
  {
    "lv": 246,
    "title": "Thứ Sáu Vui",
    "xp": 9283550
  },
  {
    "lv": 247,
    "title": "Thứ Bảy Nghỉ Bù",
    "xp": 9393470
  },
  {
    "lv": 248,
    "title": "Lễ Tết Vẫn Học",
    "xp": 9503910
  },
  {
    "lv": 249,
    "title": "Tết Không Ngừng",
    "xp": 9614870
  },
  {
    "lv": 250,
    "title": "Trung Thu Chữ",
    "xp": 9726350
  },
  {
    "lv": 251,
    "title": "Giỗ Tổ Grammar",
    "xp": 9838350
  },
  {
    "lv": 252,
    "title": "Quốc Khánh Điểm",
    "xp": 9950870
  },
  {
    "lv": 253,
    "title": "Sinh Nhật XP",
    "xp": 10063910
  },
  {
    "lv": 254,
    "title": "Valentine Từ Yêu",
    "xp": 10177470
  },
  {
    "lv": 255,
    "title": "Halloween Ma",
    "xp": 10291550
  },
  {
    "lv": 256,
    "title": "Noel Santa Clause",
    "xp": 10406150
  },
  {
    "lv": 257,
    "title": "Năm Mới Level",
    "xp": 10521270
  },
  {
    "lv": 258,
    "title": "Xuân Phất Phới",
    "xp": 10636910
  },
  {
    "lv": 259,
    "title": "Hạ Nắng Cháy",
    "xp": 10753070
  },
  {
    "lv": 260,
    "title": "Thu Lá Rơi",
    "xp": 10869750
  },
  {
    "lv": 261,
    "title": "Đông Ấm Trà",
    "xp": 10909750
  },
  {
    "lv": 262,
    "title": "Mưa Phùn Lì Xì",
    "xp": 10950430
  },
  {
    "lv": 263,
    "title": "Nắng Gắt Unit",
    "xp": 10991790
  },
  {
    "lv": 264,
    "title": "Gió Lốc Đề",
    "xp": 11033830
  },
  {
    "lv": 265,
    "title": "Sấm Chớp Đúng",
    "xp": 11076550
  },
  {
    "lv": 266,
    "title": "Cầu Vồng Điểm",
    "xp": 11119950
  },
  {
    "lv": 267,
    "title": "Sao Băng May",
    "xp": 11164030
  },
  {
    "lv": 268,
    "title": "Nguyệt Thực XP",
    "xp": 11208790
  },
  {
    "lv": 269,
    "title": "Nhật Thực Level",
    "xp": 11254230
  },
  {
    "lv": 270,
    "title": "Galaxy Brain",
    "xp": 11300350
  },
  {
    "lv": 271,
    "title": "Vũ Trụ Từ Vựng",
    "xp": 11347150
  },
  {
    "lv": 272,
    "title": "Hố Đen Đề Khó",
    "xp": 11394630
  },
  {
    "lv": 273,
    "title": "Sao Kim Sáng",
    "xp": 11442790
  },
  {
    "lv": 274,
    "title": "Sao Hỏa Nóng",
    "xp": 11491630
  },
  {
    "lv": 275,
    "title": "Sao Mộc To",
    "xp": 11541150
  },
  {
    "lv": 276,
    "title": "Sao Thổ Vòng",
    "xp": 11591350
  },
  {
    "lv": 277,
    "title": "Sao Thiên Vương",
    "xp": 11642230
  },
  {
    "lv": 278,
    "title": "Sao Hải Vương",
    "xp": 11693790
  },
  {
    "lv": 279,
    "title": "Sao Diêm Vương",
    "xp": 11746030
  },
  {
    "lv": 280,
    "title": "Pluto Bị Kick",
    "xp": 11798950
  },
  {
    "lv": 281,
    "title": "Mặt Trăng Đêm",
    "xp": 11852550
  },
  {
    "lv": 282,
    "title": "Mặt Trời Sáng",
    "xp": 11906830
  },
  {
    "lv": 283,
    "title": "Trái Đất Xanh",
    "xp": 11961790
  },
  {
    "lv": 284,
    "title": "Sao Hỏa Đỏ",
    "xp": 12017430
  },
  {
    "lv": 285,
    "title": "Tàu Vũ Trụ",
    "xp": 12073750
  },
  {
    "lv": 286,
    "title": "Hành Tinh Thứ 9",
    "xp": 12130750
  },
  {
    "lv": 287,
    "title": "Ngân Hà XP",
    "xp": 12188430
  },
  {
    "lv": 288,
    "title": "Đa Vũ Trụ",
    "xp": 12246790
  },
  {
    "lv": 289,
    "title": "Song Song Thì",
    "xp": 12305830
  },
  {
    "lv": 290,
    "title": "Xuyên Không Grammar",
    "xp": 12365550
  },
  {
    "lv": 291,
    "title": "Isekai Anh Văn",
    "xp": 12425950
  },
  {
    "lv": 292,
    "title": "Reincarnated Học Sinh",
    "xp": 12487030
  },
  {
    "lv": 293,
    "title": "Main Character",
    "xp": 12548790
  },
  {
    "lv": 294,
    "title": "Side Quest Hero",
    "xp": 12611230
  },
  {
    "lv": 295,
    "title": "Hall of Fame",
    "xp": 12674350
  },
  {
    "lv": 296,
    "title": "Bảng Vàng Vĩnh Viễn",
    "xp": 12738150
  },
  {
    "lv": 297,
    "title": "Prestige Ba",
    "xp": 12802630
  },
  {
    "lv": 298,
    "title": "Đỉnh Cao Không Đỉnh",
    "xp": 12867790
  },
  {
    "lv": 299,
    "title": "Huyền Thoại Muôn Đời",
    "xp": 12933630
  },
  {
    "lv": 300,
    "title": "Chúa Tể 300 Level",
    "xp": 13000150
  }
];
