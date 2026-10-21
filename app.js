/* ==========================================================================
   ISLAND — DYNAMIC ISLAND FOR WINDOWS
   Interactive Frontend Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ---------------- 1. AMBIENT CURSOR SPOTLIGHT ----------------
  const spotlight = document.getElementById('cursorSpotlight');
  if (spotlight) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let curX = mouseX;
    let curY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function updateSpotlight() {
      curX += (mouseX - curX) * 0.1;
      curY += (mouseY - curY) * 0.1;
      spotlight.style.left = `${curX}px`;
      spotlight.style.top = `${curY}px`;
      requestAnimationFrame(updateSpotlight);
    }
    requestAnimationFrame(updateSpotlight);
  }

  // ---------------- 2. DYNAMIC ISLAND SIMULATOR (DISTINCT HUDS!) ----------------
  const dynamicPill = document.getElementById('dynamicPill');
  const pillCollapsed = document.getElementById('pillCollapsed');
  const pillExpanded = document.getElementById('pillExpanded');
  const simModeBtns = document.querySelectorAll('[data-sim-mode]');
  const themeBtns = document.querySelectorAll('[data-theme-skin]');

  let currentMode = 'media';

  // Toggle Collapse / Expand
  if (dynamicPill) {
    dynamicPill.addEventListener('click', (e) => {
      // Don't collapse if clicking interactive buttons or inputs inside expanded HUD
      if (e.target.closest('button') || e.target.closest('input') || e.target.closest('.interactive-area')) {
        return;
      }

      if (dynamicPill.classList.contains('collapsed')) {
        expandIsland();
      } else {
        collapseIsland();
      }
    });
  }

  function expandIsland() {
    dynamicPill.classList.remove('collapsed');
    dynamicPill.classList.add('expanded');
    pillCollapsed.style.display = 'none';
    pillExpanded.style.display = 'block';
  }

  function collapseIsland() {
    dynamicPill.classList.remove('expanded');
    dynamicPill.classList.add('collapsed');
    pillExpanded.style.display = 'none';
    pillCollapsed.style.display = 'flex';
  }

  // Mode Switcher (Media, Mascot, Weather, Timer)
  simModeBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      simModeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      currentMode = btn.dataset.simMode;
      switchIslandMode(currentMode);
    });
  });

  function switchIslandMode(mode) {
    // 1. Hide all expanded views, activate selected view
    document.querySelectorAll('.island-view').forEach(v => v.classList.remove('active'));
    const targetView = document.getElementById(`view-${mode}`);
    if (targetView) targetView.classList.add('active');

    // 2. Update collapsed preview representation
    const simLeftText = document.getElementById('simLeftText');
    const simRightElement = document.getElementById('simRightElement');

    if (mode === 'media') {
      simLeftText.innerHTML = 'Synthetic Pulse • Kavinsky';
      simRightElement.innerHTML = `
        <div class="sound-wave">
          <span class="wave-bar"></span>
          <span class="wave-bar"></span>
          <span class="wave-bar"></span>
          <span class="wave-bar"></span>
          <span class="wave-bar"></span>
        </div>
      `;
    } else if (mode === 'mascot') {
      simLeftText.innerHTML = '👾 Пиксель: готов к работе!';
      simRightElement.innerHTML = `
        <span class="brand-dot" style="background:#fb923c; box-shadow:0 0 8px #fb923c;"></span>
      `;
    } else if (mode === 'weather') {
      const wData = weatherPresets[activeWeatherEffect] || weatherPresets.wind;
      simLeftText.innerHTML = wData.badge;
      simRightElement.innerHTML = `
        <span style="font-size:13px; font-weight:700; color:#5fe0a0;">MET.no</span>
      `;
      if (activeWeatherEffect === 'storm') scheduleNextLightning();
    } else if (mode === 'timer') {
      simLeftText.innerHTML = '⏱️ 04:32 • Фокус на разработке';
      simRightElement.innerHTML = `
        <span class="brand-dot" style="background:#38bdf8; box-shadow:0 0 8px #38bdf8;"></span>
      `;
    }

    expandIsland();
  }

  // Media Player simulation
  const btnPlayPause = document.getElementById('btnPlayPause');
  const playIcon = document.getElementById('playIcon');
  const pauseIcon = document.getElementById('pauseIcon');
  const waveBars = document.querySelectorAll('.wave-bar');
  const mediaProgFill = document.getElementById('mediaProgFill');
  const mediaCurrentTime = document.getElementById('mediaCurrentTime');
  let isPlaying = true;
  let playPercent = 58;

  if (btnPlayPause) {
    btnPlayPause.addEventListener('click', (e) => {
      e.stopPropagation();
      isPlaying = !isPlaying;
      if (isPlaying) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
        waveBars.forEach(b => b.style.animationPlayState = 'running');
      } else {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        waveBars.forEach(b => b.style.animationPlayState = 'paused');
      }
    });
  }

  setInterval(() => {
    if (!isPlaying) return;
    playPercent += 0.3;
    if (playPercent >= 100) playPercent = 0;
    if (mediaProgFill) mediaProgFill.style.width = `${playPercent}%`;
    const sec = Math.floor((playPercent / 100) * 204);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (mediaCurrentTime) mediaCurrentTime.textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
  }, 600);

  // Theme Skin Switcher
  themeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      themeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const skin = btn.dataset.themeSkin;
      dynamicPill.classList.remove('skin-liquid', 'skin-cyberpunk', 'skin-oled', 'skin-aurora');
      dynamicPill.classList.add(`skin-${skin}`);

      showToast(`Стиль оформления: ${btn.textContent.trim()}`);
    });
  });

  // ---------------- 3. PIXEL MASCOT ENGINE (FOR SIMULATOR & CORNER) ----------------
  const Ve = [
    "..XXXXXXX..",
    ".XXXXXXXXX.",
    "XXXXXXXXXXX",
    "XXXXXXXXXXX",
    "XXXXXXXXXXX",
    "XXXXXXXXXXX",
    "XXXXXXXXXXX"
  ];
  const He = [
    "X.XX.X.XX.X",
    "XX.X.X.X.XX"
  ];
  const Be = {
    idle: "#D97757",
    eat: "#D97757",
    sleep: "#9A5642",
    music: "#F0997B",
    think: "#8ea2ff",
    happy: "#5fe0a0",
    attn: "#fcd34d",
    sad: "#ff6b6b"
  };
  const Ye = {
    attn: "#fcd34d",
    sleep: "rgba(255,255,255,0.4)"
  };

  function Y(e, t, n, r) {
    let i = [];
    for (let a = n; a <= r; a++)
      for (let n = e; n <= t; n++)
        i.push([n, a]);
    return i;
  }

  function Ue(e, t) {
    let n = (e === 'idle' || e === 'attn') ? t.look : 0;
    let r = [];
    let i = (fn) => r.push(...fn(2 + n), ...fn(7 + n));

    if (e === 'happy' || e === 'music' || e === 'eat') {
      r.push([1, 4], [2, 3], [3, 4], [7, 4], [8, 3], [9, 4]);
    } else if (e === 'sleep' || t.blink) {
      i((x) => Y(x, x + 1, 4, 4));
    } else if (e === 'sad') {
      r.push([2, 3], [3, 4], [7, 4], [8, 3]);
    } else if (e === 'attn') {
      i((x) => Y(x, x + 1, 2, 4));
    } else {
      let y = e === 'think' ? 2 : 3;
      i((x) => Y(x, x + 1, y, y + 1));
    }

    if (e === 'eat') {
      r.push(...(t.step % 2 === 0 ? Y(4, 6, 5, 6) : Y(4, 6, 6, 6)));
    }
    if (e === 'sad') {
      r.push([4, 6], [5, 5], [6, 6]);
    }
    return r;
  }

  function Ge(e, t) {
    let n = new Set(Ue(e, t).map(([x, y]) => `${x},${y}`));
    let r = (e === 'music' || e === 'think' || e === 'happy') ? He[t.step % 2] : He[0];
    let i = [...Ve, r];
    let a = [];
    i.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        if (row[x] === 'X' && !n.has(`${x},${y}`)) {
          a.push([x, y]);
        }
      }
    });

    let o = [];
    if (e === 'think') {
      [3, 5, 7].slice(0, t.step % 4).forEach((x) => o.push([x, -2]));
    }
    return { body: a, extra: o };
  }

  function qe(e) {
    return e.map(([x, y, n = 1]) => `M${x},${y}h${n}v${n}h-${n}z`).join('');
  }

  // Mascot Controller
  class MascotController {
    constructor(bodyId, extraId, svgId) {
      this.bodyEl = document.getElementById(bodyId);
      this.extraEl = document.getElementById(extraId);
      this.svgEl = document.getElementById(svgId);
      this.mood = 'idle';
      this.look = 0;
      this.blink = false;
      this.step = 0;
    }

    render() {
      if (!this.bodyEl) return;
      const { body, extra } = Ge(this.mood, {
        step: this.step,
        blink: this.blink,
        look: this.look
      });

      this.bodyEl.setAttribute('d', qe(body));
      this.bodyEl.setAttribute('fill', Be[this.mood] || '#D97757');

      if (this.extraEl) {
        if (extra.length > 0) {
          this.extraEl.setAttribute('d', qe(extra));
          this.extraEl.setAttribute('fill', Ye[this.mood] || '#fcd34d');
        } else {
          this.extraEl.setAttribute('d', '');
        }
      }

      if (this.mood === 'happy' && this.svgEl) {
        const bounce = [0, -3, -5, -2][this.step % 4];
        this.svgEl.style.transform = `translateY(${bounce}px)`;
      } else if (this.svgEl) {
        this.svgEl.style.transform = 'translateY(0)';
      }
    }
  }

  const cornerMascot = new MascotController('mascotBody', 'mascotExtra', 'mascotSvg');
  const simMascot = new MascotController('simMascotBody', 'simMascotExtra', 'simMascotSvg');

  // Step ticker
  setInterval(() => {
    cornerMascot.step++;
    simMascot.step++;
    cornerMascot.render();
    simMascot.render();
  }, 240);

  // Blinking
  function scheduleBlink() {
    setTimeout(() => {
      cornerMascot.blink = true;
      simMascot.blink = true;
      cornerMascot.render();
      simMascot.render();
      setTimeout(() => {
        cornerMascot.blink = false;
        simMascot.blink = false;
        cornerMascot.render();
        simMascot.render();
        scheduleBlink();
      }, 140);
    }, 2800 + Math.random() * 3000);
  }
  scheduleBlink();

  // Eye mouse tracking for both mascots
  window.addEventListener('mousemove', (e) => {
    // Corner Mascot
    const cornerAvatar = document.getElementById('mascotAvatar');
    if (cornerAvatar) {
      const rect = cornerAvatar.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const dx = e.clientX - centerX;
      cornerMascot.look = dx < -40 ? -1 : dx > 40 ? 1 : 0;
      cornerMascot.render();
    }

    // Simulator Mascot
    const simAvatar = document.getElementById('simMascotAvatar');
    if (simAvatar) {
      const rect = simAvatar.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const dx = e.clientX - centerX;
      simMascot.look = dx < -30 ? -1 : dx > 30 ? 1 : 0;
      simMascot.render();
    }
  });

  // Mascot Interactive Actions inside SIMULATOR
  const simMascotSpeech = document.getElementById('simMascotSpeech');
  const simMascotAvatar = document.getElementById('simMascotAvatar');

  const mascotQuotes = [
    "Мурр! Щекотно! ^_^",
    "Я живу прямо в твоём островке на Windows!",
    "Все 25 персонажей навсегда бесплатны!",
    "Обожаю, когда ты меня гладишь!",
    "В версии 1.3.6 мы починили светящиеся контуры!",
    "Нагрузка на твой процессор меньше 1%!"
  ];

  window.mascotAction = function(action) {
    if (!simMascotAvatar) return;

    if (action === 'pet') {
      simMascotAvatar.classList.remove('hop');
      void simMascotAvatar.offsetWidth;
      simMascotAvatar.classList.add('hop');

      simMascot.mood = 'happy';
      simMascot.render();
      if (simMascotSpeech) simMascotSpeech.textContent = mascotQuotes[Math.floor(Math.random() * mascotQuotes.length)];
      showToast('💖 Пиксель счастлив!');

      setTimeout(() => {
        simMascot.mood = 'idle';
        simMascot.render();
      }, 1800);
    } else if (action === 'feed') {
      simMascot.mood = 'eat';
      simMascot.render();
      if (simMascotSpeech) simMascotSpeech.textContent = "Ням-ням! Очень вкусное цифровое печенье 🍪";
      showToast('🍪 Пиксель вкусно пообедал!');

      setTimeout(() => {
        simMascot.mood = 'happy';
        simMascot.render();
        setTimeout(() => {
          simMascot.mood = 'idle';
          simMascot.render();
        }, 1500);
      }, 2000);
    } else if (action === 'sleep') {
      if (simMascot.mood === 'sleep') {
        simMascot.mood = 'idle';
        if (simMascotSpeech) simMascotSpeech.textContent = "Доброе утро! Готов продуктивно трудиться! ☀️";
        showToast('☀️ Пиксель проснулся!');
      } else {
        simMascot.mood = 'sleep';
        if (simMascotSpeech) simMascotSpeech.textContent = "zZz... Сплю и экономлю ресурсы твоего ПК 💤";
        showToast('💤 Пиксель уснул.');
      }
      simMascot.render();
    } else if (action === 'chat') {
      simMascot.mood = 'think';
      simMascot.render();
      if (simMascotSpeech) simMascotSpeech.textContent = mascotQuotes[Math.floor(Math.random() * mascotQuotes.length)];
      setTimeout(() => {
        simMascot.mood = 'idle';
        simMascot.render();
      }, 1500);
    }
  };

  // Corner mascot clicks
  const mascotAvatar = document.getElementById('mascotAvatar');
  const mascotSpeech = document.getElementById('mascotSpeech');
  const mascotSparkle = document.getElementById('mascotSparkle');

  if (mascotAvatar) {
    mascotAvatar.addEventListener('click', () => {
      mascotAvatar.classList.remove('hop');
      void mascotAvatar.offsetWidth;
      mascotAvatar.classList.add('hop');

      cornerMascot.mood = 'happy';
      cornerMascot.render();
      if (mascotSparkle) mascotSparkle.classList.add('show');
      if (mascotSpeech) mascotSpeech.textContent = mascotQuotes[Math.floor(Math.random() * mascotQuotes.length)];

      setTimeout(() => {
        cornerMascot.mood = 'idle';
        cornerMascot.render();
        if (mascotSparkle) mascotSparkle.classList.remove('show');
      }, 1800);
    });
  }

  // ---------------- 3.5 LIVE SEASONAL WEATHER FX ENGINE ----------------
  const weatherCanvas = document.getElementById('weatherFxCanvas');
  const weatherLightning = document.getElementById('weatherLightning');
  const simStage = document.getElementById('simStage');
  let weatherCtx = null;
  let activeWeatherEffect = 'wind';
  let weatherAnimId = null;
  let lightningTimer = null;
  let sunRaysAngle = 0;

  // Particle pools
  let windLeaves = [];
  let stormDrops = [];
  let stormSplashes = [];
  let sunMotes = [];
  let snowFlakes = [];

  const weatherPresets = {
    wind: {
      temp: '+17°C',
      cond: 'Ветрено, свежий бриз',
      wind: '💨 9.4 м/с',
      humidity: '💧 42%',
      uv: '☀️ УФ 3',
      badge: '🍃 +17°C • Порывистый ветер'
    },
    storm: {
      temp: '+13°C',
      cond: 'Грозовой шторм, ливень',
      wind: '💨 14.8 м/с',
      humidity: '💧 96%',
      uv: '⚡ Грозовой фронт',
      badge: '⚡ +13°C • Гроза и ливень'
    },
    sun: {
      temp: '+24°C',
      cond: 'Ясно, тёплое солнце',
      wind: '💨 2.1 м/с',
      humidity: '💧 35%',
      uv: '☀️ УФ 6 (высокий)',
      badge: '☀️ +24°C • Ясно, тепло'
    },
    snow: {
      temp: '-3°C',
      cond: 'Снегопад, тихая метель',
      wind: '💨 4.5 м/с',
      humidity: '💧 88%',
      uv: '❄️ Зимний режим',
      badge: '❄️ -3°C • Зимний снегопад'
    }
  };

  function initWeatherCanvas() {
    if (!weatherCanvas || !simStage) return;
    weatherCtx = weatherCanvas.getContext('2d');
    resizeWeather();
    window.addEventListener('resize', resizeWeather);

    initParticles();
    startWeatherLoop();
  }

  function resizeWeather() {
    if (!weatherCanvas || !simStage) return;
    const rect = simStage.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    weatherCanvas.width = rect.width * dpr;
    weatherCanvas.height = rect.height * dpr;
    if (weatherCtx) {
      weatherCtx.setTransform(1, 0, 0, 1, 0, 0);
      weatherCtx.scale(dpr, dpr);
    }
  }

  function initParticles() {
    const w = simStage ? simStage.clientWidth : 720;
    const h = simStage ? simStage.clientHeight : 320;

    // Wind leaves
    windLeaves = [];
    const leafPalette = ['#4ade80', '#22c55e', '#84cc16', '#a3e635', '#eab308'];
    for (let i = 0; i < 28; i++) {
      windLeaves.push({
        x: Math.random() * (w + 100) - 50,
        y: Math.random() * (h + 40) - 20,
        vx: 1.8 + Math.random() * 2.6,
        vy: 0.7 + Math.random() * 1.5,
        size: 7 + Math.random() * 7,
        angle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.05,
        flipAngle: Math.random() * Math.PI * 2,
        flipSpeed: 0.04 + Math.random() * 0.05,
        color: leafPalette[Math.floor(Math.random() * leafPalette.length)],
        opacity: 0.7 + Math.random() * 0.25
      });
    }

    // Storm raindrops
    stormDrops = [];
    stormSplashes = [];
    for (let i = 0; i < 95; i++) {
      stormDrops.push({
        x: Math.random() * (w + 140) - 60,
        y: Math.random() * h,
        vx: 3 + Math.random() * 2,
        vy: 15 + Math.random() * 11,
        len: 14 + Math.random() * 18,
        opacity: 0.4 + Math.random() * 0.4,
        width: 1 + Math.random() * 0.7
      });
    }

    // Sun motes
    sunMotes = [];
    for (let i = 0; i < 35; i++) {
      sunMotes.push({
        x: w / 2 + (Math.random() - 0.5) * (w * 0.8),
        y: Math.random() * h,
        vy: -0.3 - Math.random() * 0.5,
        vx: (Math.random() - 0.5) * 0.4,
        r: 1.5 + Math.random() * 2.8,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.03 + Math.random() * 0.04,
        color: Math.random() > 0.4 ? '251, 191, 36' : '254, 240, 138'
      });
    }

    // Snowflakes
    snowFlakes = [];
    for (let i = 0; i < 80; i++) {
      const depth = Math.random();
      snowFlakes.push({
        x: Math.random() * (w + 60) - 30,
        y: Math.random() * h,
        r: 1.2 + depth * 3.6,
        vy: 0.5 + depth * 1.3,
        swayAngle: Math.random() * Math.PI * 2,
        swaySpeed: 0.02 + Math.random() * 0.03,
        swayAmp: 0.6 + Math.random() * 0.9,
        opacity: 0.35 + depth * 0.55
      });
    }
  }

  function startWeatherLoop() {
    if (weatherAnimId) cancelAnimationFrame(weatherAnimId);

    function frame() {
      if (weatherCtx && simStage) {
        const w = simStage.clientWidth;
        const h = simStage.clientHeight;
        weatherCtx.clearRect(0, 0, w, h);

        if (activeWeatherEffect === 'wind') {
          // Breeze wind lines
          weatherCtx.save();
          weatherCtx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          weatherCtx.lineWidth = 1.5;
          const t = Date.now() * 0.002;
          for (let b = 0; b < 3; b++) {
            const yB = 40 + b * 80;
            weatherCtx.beginPath();
            weatherCtx.moveTo(0, yB + Math.sin(t + b) * 14);
            weatherCtx.bezierCurveTo(
              w * 0.35, yB + Math.cos(t + b) * 20,
              w * 0.65, yB - Math.sin(t + b) * 20,
              w, yB + Math.cos(t + b) * 10
            );
            weatherCtx.stroke();
          }
          weatherCtx.restore();

          // Leaves
          windLeaves.forEach(p => {
            p.x += p.vx;
            p.y += p.vy + Math.sin(p.angle * 2) * 0.4;
            p.angle += p.rotSpeed;
            p.flipAngle += p.flipSpeed;

            if (p.x > w + 40) p.x = -40;
            if (p.y > h + 30) p.y = -30;

            const flip = Math.sin(p.flipAngle);
            weatherCtx.save();
            weatherCtx.translate(p.x, p.y);
            weatherCtx.rotate(p.angle);
            weatherCtx.scale(1, Math.abs(flip) < 0.1 ? 0.1 : flip);

            weatherCtx.fillStyle = p.color;
            weatherCtx.globalAlpha = p.opacity;

            weatherCtx.beginPath();
            weatherCtx.moveTo(-p.size, 0);
            weatherCtx.quadraticCurveTo(0, -p.size * 0.75, p.size, 0);
            weatherCtx.quadraticCurveTo(0, p.size * 0.75, -p.size, 0);
            weatherCtx.fill();

            weatherCtx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
            weatherCtx.lineWidth = 1;
            weatherCtx.beginPath();
            weatherCtx.moveTo(-p.size * 0.8, 0);
            weatherCtx.lineTo(p.size * 0.8, 0);
            weatherCtx.stroke();

            weatherCtx.restore();
          });
        } else if (activeWeatherEffect === 'storm') {
          // Rain streaks
          weatherCtx.save();
          stormDrops.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.y > h || p.x > w + 40) {
              if (Math.random() > 0.45 && stormSplashes.length < 30) {
                stormSplashes.push({
                  x: p.x,
                  y: Math.min(p.y, h - 8),
                  r: 1,
                  maxR: 4 + Math.random() * 5,
                  opacity: 0.65
                });
              }
              p.y = -p.len - Math.random() * 20;
              p.x = Math.random() * (w + 120) - 50;
            }

            const grad = weatherCtx.createLinearGradient(p.x, p.y, p.x + p.vx, p.y + p.len);
            grad.addColorStop(0, `rgba(180, 220, 255, ${p.opacity})`);
            grad.addColorStop(1, 'rgba(180, 220, 255, 0.05)');

            weatherCtx.strokeStyle = grad;
            weatherCtx.lineWidth = p.width;
            weatherCtx.beginPath();
            weatherCtx.moveTo(p.x, p.y);
            weatherCtx.lineTo(p.x + p.vx * 0.6, p.y + p.len);
            weatherCtx.stroke();
          });

          // Splashes
          for (let i = stormSplashes.length - 1; i >= 0; i--) {
            const s = stormSplashes[i];
            s.r += 0.45;
            s.opacity -= 0.038;
            if (s.opacity <= 0 || s.r >= s.maxR) {
              stormSplashes.splice(i, 1);
              continue;
            }
            weatherCtx.strokeStyle = `rgba(180, 220, 255, ${s.opacity})`;
            weatherCtx.lineWidth = 1;
            weatherCtx.beginPath();
            weatherCtx.ellipse(s.x, s.y, s.r * 1.4, s.r * 0.6, 0, 0, Math.PI * 2);
            weatherCtx.stroke();
          }
          weatherCtx.restore();
        } else if (activeWeatherEffect === 'sun') {
          const cx = w / 2;
          const cy = 35;

          weatherCtx.save();
          // Warm radial halo
          const halo = weatherCtx.createRadialGradient(cx, cy, 20, cx, cy, 200);
          halo.addColorStop(0, 'rgba(251, 191, 36, 0.28)');
          halo.addColorStop(0.45, 'rgba(245, 158, 11, 0.12)');
          halo.addColorStop(1, 'rgba(245, 158, 11, 0)');
          weatherCtx.fillStyle = halo;
          weatherCtx.beginPath();
          weatherCtx.arc(cx, cy, 200, 0, Math.PI * 2);
          weatherCtx.fill();

          // Rotating rays
          sunRaysAngle += 0.003;
          const numRays = 12;
          weatherCtx.translate(cx, cy);
          weatherCtx.rotate(sunRaysAngle);
          for (let i = 0; i < numRays; i++) {
            weatherCtx.rotate((Math.PI * 2) / numRays);
            weatherCtx.fillStyle = i % 2 === 0 ? 'rgba(254, 240, 138, 0.05)' : 'rgba(251, 191, 36, 0.03)';
            weatherCtx.beginPath();
            weatherCtx.moveTo(0, 0);
            weatherCtx.lineTo(-18, 230);
            weatherCtx.lineTo(18, 230);
            weatherCtx.closePath();
            weatherCtx.fill();
          }
          weatherCtx.restore();

          // Sparkles
          weatherCtx.save();
          sunMotes.forEach(p => {
            p.y += p.vy;
            p.x += p.vx;
            p.pulse += p.pulseSpeed;

            if (p.y < 0) {
              p.y = h + 10;
              p.x = cx + (Math.random() - 0.5) * (w * 0.7);
            }

            const alpha = 0.4 + Math.sin(p.pulse) * 0.35;
            weatherCtx.fillStyle = `rgba(${p.color}, ${Math.max(0.1, alpha)})`;
            weatherCtx.shadowColor = `rgb(${p.color})`;
            weatherCtx.shadowBlur = 6;
            weatherCtx.beginPath();
            weatherCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            weatherCtx.fill();
          });
          weatherCtx.restore();
        } else if (activeWeatherEffect === 'snow') {
          weatherCtx.save();
          snowFlakes.forEach(p => {
            p.swayAngle += p.swaySpeed;
            p.x += Math.sin(p.swayAngle) * p.swayAmp + 0.3;
            p.y += p.vy;

            if (p.y > h + 10) {
              p.y = -10;
              p.x = Math.random() * (w + 40) - 20;
            }
            if (p.x > w + 20) p.x = -20;
            if (p.x < -20) p.x = w + 20;

            weatherCtx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
            if (p.r > 3) {
              weatherCtx.shadowColor = 'rgba(255, 255, 255, 0.7)';
              weatherCtx.shadowBlur = 4;
            } else {
              weatherCtx.shadowBlur = 0;
            }

            weatherCtx.beginPath();
            weatherCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            weatherCtx.fill();
          });
          weatherCtx.restore();
        }
      }
      weatherAnimId = requestAnimationFrame(frame);
    }
    weatherAnimId = requestAnimationFrame(frame);
  }

  function triggerLightning() {
    if (!weatherLightning) return;
    weatherLightning.classList.add('flash');
    setTimeout(() => {
      weatherLightning.classList.remove('flash');
      setTimeout(() => {
        weatherLightning.classList.add('flash');
        setTimeout(() => weatherLightning.classList.remove('flash'), 60);
      }, 70);
    }, 110);
  }

  function scheduleNextLightning() {
    clearTimeout(lightningTimer);
    const delay = 3200 + Math.random() * 4000;
    lightningTimer = setTimeout(() => {
      if (activeWeatherEffect === 'storm') {
        triggerLightning();
        scheduleNextLightning();
      }
    }, delay);
  }

  // Interactive Button Clicker
  window.setWeatherEffect = function(btn, effect) {
    activeWeatherEffect = effect;

    document.querySelectorAll('.weather-btn-effect').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const data = weatherPresets[effect] || weatherPresets.wind;
    const tempEl = document.getElementById('weatherTemp');
    const condEl = document.getElementById('weatherCondTitle');
    const windEl = document.getElementById('metricWind');
    const humEl = document.getElementById('metricHumidity');
    const uvEl = document.getElementById('metricUv');
    const simLeftText = document.getElementById('simLeftText');

    if (tempEl) tempEl.textContent = data.temp;
    if (condEl) condEl.textContent = data.cond;
    if (windEl) windEl.textContent = data.wind;
    if (humEl) humEl.textContent = data.humidity;
    if (uvEl) uvEl.textContent = data.uv;

    if (currentMode === 'weather' && simLeftText) {
      simLeftText.innerHTML = data.badge;
    }

    if (effect === 'storm') {
      scheduleNextLightning();
      triggerLightning();
    } else {
      clearTimeout(lightningTimer);
    }

    if (typeof showToast === 'function') {
      const labels = { wind: '🍃 Ветер', storm: '⚡ Гроза', sun: '☀️ Солнце', snow: '❄️ Снег' };
      showToast(`Сезонный эффект: ${labels[effect] || effect}`);
    }
  };

  // Timer simulation
  let timerSeconds = 272; // 04:32
  let timerRunning = false;
  let timerInterval = null;
  const timerDigits = document.getElementById('timerDigits');
  const btnTimerToggle = document.getElementById('btnTimerToggle');

  window.toggleTimer = function() {
    timerRunning = !timerRunning;
    if (timerRunning) {
      if (btnTimerToggle) btnTimerToggle.textContent = 'Пауза';
      timerInterval = setInterval(() => {
        if (timerSeconds > 0) {
          timerSeconds--;
          const m = Math.floor(timerSeconds / 60);
          const s = timerSeconds % 60;
          if (timerDigits) timerDigits.textContent = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
        }
      }, 1000);
      showToast('⏱️ Таймер запущен');
    } else {
      if (btnTimerToggle) btnTimerToggle.textContent = 'Старт';
      clearInterval(timerInterval);
      showToast('⏸️ Таймер приостановлен');
    }
  };

  window.resetTimer = function() {
    clearInterval(timerInterval);
    timerRunning = false;
    timerSeconds = 300;
    if (btnTimerToggle) btnTimerToggle.textContent = 'Старт';
    if (timerDigits) timerDigits.textContent = '05:00';
    showToast('🔄 Таймер сброшен на 05:00');
  };

  window.setTimerPreset = function(minutes) {
    clearInterval(timerInterval);
    timerRunning = false;
    timerSeconds = minutes * 60;
    if (btnTimerToggle) btnTimerToggle.textContent = 'Старт';
    if (timerDigits) timerDigits.textContent = `${minutes < 10 ? '0' : ''}${minutes}:00`;
    showToast(`⏱️ Установлено время: ${minutes} мин`);
  };

  // ---------------- 4. 25 CHARACTERS GRID ----------------
  const charactersData = [
    { id: 'pixel', name: 'Пиксель', type: 'Маскот Claude', icon: '👾', desc: 'Следит глазками за курсором и прыгает' },
    { id: 'spark', name: 'Искра', type: 'Энергия', icon: '⚡', desc: 'Искрится в ритм музыке и заряжает бодростью' },
    { id: 'eyes', name: 'Глазки', type: 'Живой остров', icon: '👀', desc: 'Плавно озираются по экрану' },
    { id: 'jellyfish', name: 'Медуза', type: 'Глубины', icon: '🪼', desc: 'Невесомое парение с биолюминесценцией' },
    { id: 'hamster', name: 'Хомяк', type: 'Колесо', icon: '🐹', desc: 'Бежит в колесе при высокой нагрузке' },
    { id: 'campfire', name: 'Костёр', type: 'Уют', icon: '🔥', desc: 'Тёплые искры и согревающий свет' },
    { id: 'pendulum', name: 'Маятник', type: 'Физика', icon: '⚖️', desc: 'Маятник Ньютона с точной инерцией' },
    { id: 'lens', name: 'Объектив', type: 'Оптика', icon: '📷', desc: 'Диафрагма фокусируется на задачах' },
    { id: 'cat', name: 'Рыжий Кот', type: 'Питомец', icon: '🐱', desc: 'Мурлычет и дремлет во время работы' },
    { id: 'ghost', name: 'Призрак', type: 'Мистика', icon: '👻', desc: 'Таинственно полупрозрачный спутник' },
    { id: 'rocket', name: 'Ракета', type: 'Скорость', icon: '🚀', desc: 'Стартует при загрузке файлов' },
    { id: 'coffee', name: 'Кофе', type: 'Энергетик', icon: '☕', desc: 'Ароматный пар для бодрого утра' },
    { id: 'vinyl', name: 'Винил', type: 'Меломан', icon: '💿', desc: 'Вращается в такт любимым трекам' },
    { id: 'matrix', name: 'Матрица', type: 'Киберпанк', icon: '💻', desc: 'Зелёный неоновый дождь кода' },
    { id: 'sun', name: 'Солнышко', type: 'Погода', icon: '☀️', desc: 'Лучезарное сияние в ясную погоду' },
    { id: 'cloud', name: 'Гроза', type: 'Погода', icon: '⛈️', desc: 'Молнии и капли при ненастье' },
    { id: 'snow', name: 'Снегопад', type: 'Сезонный', icon: '❄️', desc: 'Тихие пушистые снежинки зимой' },
    { id: 'compass', name: 'Компас', type: 'Навигатор', icon: '🧭', desc: 'Указывает направление курсора' },
    { id: 'potion', name: 'Зелье', type: 'Алхимия', icon: '🧪', desc: 'Бурлящая колба с пузырьками' },
    { id: 'radio', name: 'Ретро-Радио', type: 'Винтаж', icon: '📻', desc: 'Ламповый приёмник со шкалой' },
    { id: 'ufo', name: 'НЛО', type: 'Космос', icon: '🛸', desc: 'Изучает неизведанные уголки рабочего стола' },
    { id: 'cyber_orb', name: 'Неоновый Шар', type: 'Голограмма', icon: '🔮', desc: 'Пульсирует квантовым градиентом' },
    { id: 'gamepad', name: 'Геймпад', type: 'Игры', icon: '🎮', desc: 'Готов к победным каткам' },
    { id: 'owl', name: 'Сова', type: 'Ночь', icon: '🦉', desc: 'Мудрый ночной спутник программиста' },
    { id: 'liquid', name: 'Жидкий Остров', type: 'Классика', icon: '💧', desc: 'Оригинальная капля магнитной жидкости' }
  ];

  const charGrid = document.getElementById('charactersGrid');
  const charSearch = document.getElementById('charSearch');

  function renderCharacters(items) {
    if (!charGrid) return;
    charGrid.innerHTML = items.map((c, idx) => `
      <div class="character-card ${idx === 0 ? 'active' : ''}" data-char-id="${c.id}" data-char-name="${c.name}" title="${c.desc}">
        <div class="char-unlocked-badge">Pro Free</div>
        <div class="char-avatar-slot">${c.icon}</div>
        <span class="char-name">${c.name}</span>
        <span class="char-type">${c.type}</span>
      </div>
    `).join('');

    document.querySelectorAll('.character-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.character-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        const charName = card.dataset.charName;
        const charIcon = card.querySelector('.char-avatar-slot').textContent;
        showToast(`Выбран персонаж: ${charName}`);

        // Switch to mascot mode and update text
        switchIslandMode('mascot');
        const charLabel = document.getElementById('simCharLabel');
        if (charLabel) charLabel.textContent = `${charIcon} ${charName}`;
      });
    });
  }

  renderCharacters(charactersData);

  if (charSearch) {
    charSearch.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const filtered = charactersData.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.type.toLowerCase().includes(q)
      );
      renderCharacters(filtered);
    });
  }

  // ---------------- 5. COLLAPSIBLE CLI COMMANDS & DOWNLOAD FEEDBACK ----------------
  // Note: Cli drawer toggle & command copies are handled by window.toggleCliDrawer / window.copyPsCommand

  // Direct download feedback
  document.querySelectorAll('.trigger-download').forEach(btn => {
    btn.addEventListener('click', () => {
      showToast('🚀 Загрузка актуального Island_Setup.exe началась!');
      const cornerAvatar = document.getElementById('mascotAvatar');
      if (cornerAvatar) cornerAvatar.click();
    });
  });

  // ---------------- 6. AUTO-SYNC LATEST RELEASE METADATA ----------------
  fetch('/api/version')
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      if (data && data.version) {
        document.querySelectorAll('.brand-version').forEach(el => el.textContent = `v${data.version}`);
        document.querySelectorAll('.live-ver-tag').forEach(el => el.textContent = `v${data.version}`);
      }
    })
    .catch(() => {});

  // Physical keyboard listener
  window.addEventListener('keydown', (e) => {
    if (e.altKey && e.code === 'Space') {
      e.preventDefault();
      const card = document.querySelector('[data-keys="Alt + Space"]');
      if (card) flashCard(card);
    } else if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      if (dynamicPill.classList.contains('collapsed')) expandIsland();
      else collapseIsland();
      const card = document.querySelector('[data-keys="Ctrl + Alt + I"]');
      if (card) flashCard(card);
    }
  });

  function flashCard(el) {
    el.style.transform = 'scale(1.04)';
    el.style.borderColor = 'var(--accent-blue)';
    showToast(`Нажата комбинация: ${el.dataset.keys}`);
    setTimeout(() => {
      el.style.transform = '';
      el.style.borderColor = '';
    }, 250);
  }

  // Toast Function
  const toastContainer = document.getElementById('toastContainer');
  function showToast(message, duration = 3200) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-mint)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
  window.showToast = showToast;

  // Initial renders
  cornerMascot.render();
  simMascot.render();
  initWeatherCanvas();

});
