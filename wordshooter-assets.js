/* ════════════════════════════════════════════
   WORD SHOOTER ASSETS — wordshooter-assets.js
   Registry pattern: thêm ship/bg/effect mới không cần sửa engine
════════════════════════════════════════════ */

const WS_SHIPS = {
  classic: {
    id: 'classic',
    name: 'Máy Bay Xanh',
    emoji: '🛸',
    unlockLevel: 1,
    draw(ctx, x, y, w, h, timestamp) {
      const bob = Math.sin((timestamp || 0) / 400) * 3;
      const cy = y + bob;
      ctx.save();
      ctx.translate(x, cy);
      // Thân tam giác
      ctx.beginPath();
      ctx.moveTo(0, -h * 0.45);
      ctx.lineTo(-w * 0.42, h * 0.35);
      ctx.lineTo(w * 0.42, h * 0.35);
      ctx.closePath();
      ctx.fillStyle = '#4a8c5c';
      ctx.fill();
      ctx.strokeStyle = '#a7f3d0';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      // Buồng lái
      ctx.beginPath();
      ctx.ellipse(0, -h * 0.05, w * 0.12, h * 0.12, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fill();
      // Cánh
      ctx.beginPath();
      ctx.moveTo(-w * 0.15, h * 0.1);
      ctx.lineTo(-w * 0.55, h * 0.28);
      ctx.lineTo(-w * 0.2, h * 0.32);
      ctx.closePath();
      ctx.fillStyle = '#6aaa7a';
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(w * 0.15, h * 0.1);
      ctx.lineTo(w * 0.55, h * 0.28);
      ctx.lineTo(w * 0.2, h * 0.32);
      ctx.closePath();
      ctx.fill();
      // Động cơ
      ctx.beginPath();
      ctx.ellipse(0, h * 0.38, w * 0.08, h * 0.06, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd166';
      ctx.fill();
      ctx.restore();
    },
    shootEffect: 'bullet_green',
    idleAnim: 'hover',
  },

  fire_jet: {
    id: 'fire_jet',
    name: 'Phi Thuyền Lửa',
    emoji: '🚀',
    unlockLevel: 20,
    draw(ctx, x, y, w, h, timestamp) {
      const bob = Math.sin((timestamp || 0) / 350) * 2;
      const cy = y + bob;
      const flame = Math.abs(Math.sin((timestamp || 0) / 80)) * 0.3 + 0.7;
      ctx.save();
      ctx.translate(x, cy);
      // Thân
      ctx.beginPath();
      ctx.moveTo(-w * 0.18, -h * 0.4);
      ctx.lineTo(w * 0.18, -h * 0.4);
      ctx.lineTo(w * 0.18, h * 0.35);
      ctx.lineTo(-w * 0.18, h * 0.35);
      ctx.closePath();
      ctx.fillStyle = '#e63946';
      ctx.fill();
      ctx.strokeStyle = '#9d0208';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Mũi
      ctx.beginPath();
      ctx.moveTo(0, -h * 0.55);
      ctx.lineTo(-w * 0.18, -h * 0.4);
      ctx.lineTo(w * 0.18, -h * 0.4);
      ctx.closePath();
      ctx.fillStyle = '#f4a261';
      ctx.fill();
      // Cửa sổ
      ctx.beginPath();
      ctx.arc(0, -h * 0.15, w * 0.1, 0, Math.PI * 2);
      ctx.fillStyle = '#a8dadc';
      ctx.fill();
      // Ngọn lửa
      ctx.beginPath();
      ctx.moveTo(-w * 0.12, h * 0.35);
      ctx.quadraticCurveTo(0, h * (0.35 + 0.25 * flame), w * 0.12, h * 0.35);
      ctx.fillStyle = `rgba(255, ${100 + Math.floor(80 * flame)}, 0, 0.9)`;
      ctx.fill();
      ctx.restore();
    },
    shootEffect: 'bullet_fire',
    idleAnim: 'flame',
  },

  dragon: {
    id: 'dragon',
    name: 'Rồng Vàng',
    emoji: '🐉',
    unlockLevel: 50,
    draw(ctx, x, y, w, h, timestamp) {
      const bob = Math.sin((timestamp || 0) / 500) * 4;
      const cy = y + bob;
      ctx.save();
      ctx.translate(x, cy);
      // Thân rồng
      ctx.beginPath();
      ctx.ellipse(0, 0, w * 0.45, h * 0.22, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#f4d03f';
      ctx.fill();
      ctx.strokeStyle = '#b7950b';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Đầu
      ctx.beginPath();
      ctx.ellipse(0, -h * 0.28, w * 0.22, h * 0.18, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#f9e547';
      ctx.fill();
      // Sừng
      ctx.beginPath();
      ctx.moveTo(-w * 0.1, -h * 0.38);
      ctx.lineTo(-w * 0.18, -h * 0.55);
      ctx.lineTo(-w * 0.04, -h * 0.42);
      ctx.fillStyle = '#e67e22';
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(w * 0.1, -h * 0.38);
      ctx.lineTo(w * 0.18, -h * 0.55);
      ctx.lineTo(w * 0.04, -h * 0.42);
      ctx.fill();
      // Cánh
      const wingFlap = Math.sin((timestamp || 0) / 200) * 0.15;
      ctx.beginPath();
      ctx.ellipse(-w * 0.35, -h * 0.05 + wingFlap * h, w * 0.28, h * 0.12, -0.4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(241, 196, 15, 0.7)';
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(w * 0.35, -h * 0.05 + wingFlap * h, w * 0.28, h * 0.12, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    },
    shootEffect: 'bullet_dragon',
    idleAnim: 'breathe',
  },
};

const WS_BACKGROUNDS = {
  space: {
    id: 'space',
    name: 'Vũ Trụ',
    emoji: '🌌',
    unlockLevel: 1,
    _stars: null,
    _init(w, h) {
      if (this._stars && this._stars.length > 0) return;
      this._stars = [];
      const count = Math.floor((w * h) / 8000);
      for (let i = 0; i < count; i++) {
        this._stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.8 + 0.3,
          twinkle: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.02 + 0.005,
        });
      }
    },
    draw(ctx, w, h, timestamp) {
      this._init(w, h);
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#0a0e27');
      grad.addColorStop(1, '#1a1a3e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      this._stars.forEach(star => {
        const alpha = 0.4 + Math.abs(Math.sin(timestamp / 800 + star.twinkle)) * 0.6;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
      });
    },
    update(timestamp) {
      if (!this._stars) return;
      this._stars.forEach(star => {
        star.y += star.speed;
        if (star.y > (this._lastH || 800)) {
          star.y = 0;
          star.x = Math.random() * (this._lastW || 400);
        }
      });
      this._lastH = this._lastH;
    },
  },

  ocean: {
    id: 'ocean',
    name: 'Đại Dương',
    emoji: '🌊',
    unlockLevel: 10,
    draw(ctx, w, h, timestamp) {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#87ceeb');
      grad.addColorStop(0.55, '#4a90d9');
      grad.addColorStop(1, '#1a5276');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      // Sóng
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        const yBase = h * (0.55 + i * 0.12);
        ctx.moveTo(0, yBase);
        for (let x = 0; x <= w; x += 8) {
          const y = yBase + Math.sin(x / 40 + timestamp / 600 + i) * (8 + i * 3);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fillStyle = `rgba(255,255,255,${0.08 - i * 0.015})`;
        ctx.fill();
      }
    },
    update() {},
  },

  jungle: {
    id: 'jungle',
    name: 'Rừng Nhiệt Đới',
    emoji: '🌴',
    unlockLevel: 30,
    draw(ctx, w, h) {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#a8e6cf');
      grad.addColorStop(0.5, '#56ab2f');
      grad.addColorStop(1, '#1e3c1e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      // Cây đơn giản
      for (let i = 0; i < 6; i++) {
        const tx = (w / 7) * (i + 0.5);
        const th = 40 + (i % 3) * 20;
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(tx - 4, h - th, 8, th);
        ctx.beginPath();
        ctx.arc(tx, h - th, 22 + (i % 2) * 8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(27, 94, 32, ${0.5 + (i % 3) * 0.1})`;
        ctx.fill();
      }
    },
    update() {},
  },

  city: {
    id: 'city',
    name: 'Thành Phố',
    emoji: '🏙️',
    unlockLevel: 40,
    draw(ctx, w, h, timestamp) {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#2c3e50');
      grad.addColorStop(0.4, '#4a235a');
      grad.addColorStop(1, '#1a1a2e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      // Tòa nhà
      const buildings = [0.12, 0.22, 0.35, 0.18, 0.28, 0.4, 0.15, 0.25];
      buildings.forEach((bh, i) => {
        const bw = w / buildings.length;
        const bx = i * bw;
        const bHeight = h * bh;
        ctx.fillStyle = `rgba(${30 + i * 8}, ${30 + i * 5}, ${50 + i * 10}, 0.85)`;
        ctx.fillRect(bx + 2, h - bHeight, bw - 4, bHeight);
        // Cửa sổ sáng
        for (let wy = h - bHeight + 10; wy < h - 10; wy += 18) {
          for (let wx = bx + 8; wx < bx + bw - 8; wx += 14) {
            if (Math.sin(wx * wy + i) > 0) {
              ctx.fillStyle = `rgba(255, ${200 + (i * 7) % 55}, 100, ${0.3 + Math.abs(Math.sin(timestamp / 1000 + wx)) * 0.4})`;
              ctx.fillRect(wx, wy, 6, 8);
            }
          }
        }
      });
    },
    update() {},
  },
};

const WS_EFFECTS = {
  bullet_green: {
    id: 'bullet_green',
    duration: 350,
    draw(ctx, x1, y1, x2, y2, progress) {
      const px = x1 + (x2 - x1) * progress;
      const py = y1 + (y2 - y1) * progress;
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#4ade80';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(px, py, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(74, 222, 128, 0.3)';
      ctx.fill();
    },
  },

  bullet_fire: {
    id: 'bullet_fire',
    duration: 300,
    draw(ctx, x1, y1, x2, y2, progress) {
      const px = x1 + (x2 - x1) * progress;
      const py = y1 + (y2 - y1) * progress;
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#ff6b35';
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(px, py + 6);
      ctx.quadraticCurveTo(px - 4, py + 16, px, py + 22);
      ctx.quadraticCurveTo(px + 4, py + 16, px, py + 6);
      ctx.fillStyle = '#ffd166';
      ctx.fill();
    },
  },

  bullet_dragon: {
    id: 'bullet_dragon',
    duration: 280,
    draw(ctx, x1, y1, x2, y2, progress) {
      const px = x1 + (x2 - x1) * progress;
      const py = y1 + (y2 - y1) * progress;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(-5, 5);
      ctx.lineTo(5, 5);
      ctx.closePath();
      ctx.fillStyle = '#f4d03f';
      ctx.fill();
      ctx.restore();
    },
  },

  explosion_hit: {
    id: 'explosion_hit',
    frames: 8,
    duration: 500,
    draw(ctx, x, y, frame) {
      const maxR = 28;
      const r = (frame / 7) * maxR;
      const alpha = 1 - frame / 8;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(74, 222, 128, ${alpha * 0.5})`;
      ctx.fill();
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + frame * 0.3;
        const dist = r * 0.8;
        ctx.beginPath();
        ctx.arc(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist, 3 + frame * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
        ctx.fill();
      }
    },
  },

  explosion_miss: {
    id: 'explosion_miss',
    frames: 6,
    duration: 400,
    draw(ctx, x, y, frame) {
      const maxR = 22;
      const r = (frame / 5) * maxR;
      const alpha = 1 - frame / 6;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(239, 68, 68, ${alpha * 0.45})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(220, 38, 38, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - r * 0.6, y - r * 0.6);
      ctx.lineTo(x + r * 0.6, y + r * 0.6);
      ctx.moveTo(x + r * 0.6, y - r * 0.6);
      ctx.lineTo(x - r * 0.6, y + r * 0.6);
      ctx.stroke();
    },
  },
};
