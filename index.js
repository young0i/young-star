// ===== young ★ star photo booth =====

// ===== 데이터 =====
const FRAMES = [
  { id: 'black',    name: 'Black',    theme: 'black',    bg: '#0a0a0a', text: '#fff' },
  { id: 'white',    name: 'White',    theme: 'white',    bg: '#fafafa', text: '#111' },
  { id: 'purple',   name: 'Purple',   theme: 'purple',   bg: '#4a3db5', text: '#fff' },
  { id: 'lavender', name: 'Lavender', theme: 'lavender', bg: '#cfc4ec', text: '#2a1f5a' },
  { id: 'beige',    name: 'Beige',    theme: 'beige',    bg: '#e8dcc4', text: '#3a2e1a' },
  { id: 'pink',     name: 'Pink',     theme: 'pink',     bg: '#f3cfd9', text: '#5a2738' },
];

const BACKGROUNDS = {
  stars: [
    { id: 'star-navy',    name: 'Navy / Gold',   color: '#0e1538', starColor: '#f5c44a', label: 'Navy / Gold' },
    { id: 'star-black',   name: 'Black / White', color: '#0a0a0a', starColor: '#ffffff', label: 'Black / White' },
    { id: 'star-pink',    name: 'Pink / Green',  color: '#d96b8e', starColor: '#4caf7a', label: 'Pink / Green' },
    { id: 'star-green',   name: 'Green / Pink',  color: '#2f5a3f', starColor: '#e89db3', label: 'Green / Pink' },
    { id: 'star-burgundy',name: 'Burgundy / Blue', color: '#5a1f2e', starColor: '#a5c8e6', label: 'Burgundy / Blue' },
    { id: 'star-red',     name: 'Red / Gold',    color: '#7a2030', starColor: '#f0c14b', label: 'Red / Gold' },
  ],
  basic: [
    { id: 'basic-black',  name: 'Black',  color: '#1a1a1a' },
    { id: 'basic-white',  name: 'White',  color: '#fafafa' },
    { id: 'basic-blue',   name: 'Blue',   color: '#3d6f8f' },
    { id: 'basic-green',  name: 'Green',  color: '#5a8055' },
    { id: 'basic-yellow', name: 'Yellow', color: '#d9b440' },
    { id: 'basic-rose',   name: 'Rose',   color: '#c97090' },
  ],
  none: [
    { id: 'none', name: 'No background', color: null }
  ]
};

// ===== 상태 =====
const state = {
  stream: null,
  filter: 'none',
  shots: [],
  shotCount: 0,
  shooting: false,
  frameIdx: 0,            // FRAMES 인덱스
  background: null,       // 선택된 배경 객체 (null = no bg)
  showDate: true,
  showTitle: true,
  history: [],            // 화면 이동 히스토리 (back 버튼용)
};

// ===== 유틸 =====
const $ = (id) => document.getElementById(id);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function showScreen(id, pushHistory = true) {
  const current = document.querySelector('.screen.active');
  if (current && pushHistory && current.id !== id) {
    state.history.push(current.id);
  }
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(id).classList.add('active');
  updateBackButton();
}

function updateBackButton() {
  const btn = $('nav-back');
  if (state.history.length > 0) {
    btn.classList.add('visible');
  } else {
    btn.classList.remove('visible');
  }
}

$('nav-back').addEventListener('click', () => {
  if (state.history.length === 0) return;
  const prev = state.history.pop();
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(prev).classList.add('active');
  updateBackButton();
});

// ===== 인트로 → 프레임 선택 =====
$('btn-begin').addEventListener('click', () => {
  showScreen('screen-frame');
  renderFrameCarousel();
});

// ===== 프레임 캐러셀 =====
function renderFrameCarousel() {
  const stage = $('frame-stage');
  const dots = $('frame-dots');
  stage.innerHTML = '';
  dots.innerHTML = '';

  // 왼쪽, 중앙, 오른쪽 3장만 보여주는 캐러셀
  const len = FRAMES.length;
  const idx = state.frameIdx;
  const leftIdx = (idx - 1 + len) % len;
  const rightIdx = (idx + 1) % len;

  [leftIdx, idx, rightIdx].forEach((i, pos) => {
    const f = FRAMES[i];
    const card = document.createElement('div');
    card.className = `frame-card theme-${f.theme}`;
    if (pos === 1) card.classList.add('center');
    else card.classList.add('side');

    card.innerHTML = `
      <div class="frame-card-title">Photo ★ Star</div>
      <div class="frame-card-slot"></div>
      <div class="frame-card-slot"></div>
      <div class="frame-card-slot"></div>
      <div class="frame-card-slot"></div>
    `;

    if (pos === 0) card.addEventListener('click', () => { state.frameIdx = leftIdx; renderFrameCarousel(); });
    if (pos === 2) card.addEventListener('click', () => { state.frameIdx = rightIdx; renderFrameCarousel(); });

    stage.appendChild(card);
  });

  // 이름
  $('frame-name').textContent = FRAMES[idx].name;

  // 점 인디케이터
  FRAMES.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === idx ? ' active' : '');
    dot.addEventListener('click', () => { state.frameIdx = i; renderFrameCarousel(); });
    dots.appendChild(dot);
  });
}

$('frame-prev').addEventListener('click', () => {
  state.frameIdx = (state.frameIdx - 1 + FRAMES.length) % FRAMES.length;
  renderFrameCarousel();
});
$('frame-next').addEventListener('click', () => {
  state.frameIdx = (state.frameIdx + 1) % FRAMES.length;
  renderFrameCarousel();
});

$('btn-frame-select').addEventListener('click', () => {
  showScreen('screen-bg');
  renderBackgrounds();
});

// ===== 배경 선택 =====
function makeStarTileSVG(color, starColor) {
  // 작은 별 패턴 SVG (썸네일용)
  return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 100' preserveAspectRatio='xMidYMid slice'>
      <rect width='160' height='100' fill='${color}'/>
      <g fill='${starColor}'>
        ${[
          [25,20],[60,15],[100,22],[135,18],
          [40,50],[80,48],[120,52],
          [20,80],[55,78],[95,82],[130,80]
        ].map(([x,y]) => `<path d='M${x} ${y-7} L${x+2} ${y-2} L${x+7} ${y-2} L${x+3} ${y+1} L${x+5} ${y+6} L${x} ${y+3} L${x-5} ${y+6} L${x-3} ${y+1} L${x-7} ${y-2} L${x-2} ${y-2} Z'/>`).join('')}
      </g>
    </svg>
  `)}`;
}

function renderBackgrounds() {
  const starsGrid = $('bg-stars-grid');
  const basicGrid = $('bg-basic-grid');
  const noneGrid = $('bg-none-grid');
  starsGrid.innerHTML = '';
  basicGrid.innerHTML = '';
  noneGrid.innerHTML = '';

  // 별 배경
  BACKGROUNDS.stars.forEach(bg => {
    const tile = document.createElement('button');
    tile.className = 'bg-tile';
    tile.style.backgroundImage = `url("${makeStarTileSVG(bg.color, bg.starColor)}")`;
    tile.style.backgroundSize = 'cover';
    tile.innerHTML = `<span class="bg-tile-label">${bg.label}</span>`;
    tile.addEventListener('click', () => selectBackground(bg, 'stars'));
    if (state.background?.id === bg.id) tile.classList.add('active');
    starsGrid.appendChild(tile);
  });

  // 단색 배경
  BACKGROUNDS.basic.forEach(bg => {
    const tile = document.createElement('button');
    tile.className = 'bg-tile';
    tile.style.background = bg.color;
    tile.innerHTML = `<span class="bg-tile-label">${bg.name}</span>`;
    tile.addEventListener('click', () => selectBackground(bg, 'basic'));
    if (state.background?.id === bg.id) tile.classList.add('active');
    basicGrid.appendChild(tile);
  });

  // 배경 없음
  BACKGROUNDS.none.forEach(bg => {
    const tile = document.createElement('button');
    tile.className = 'bg-tile bg-checker';
    tile.innerHTML = `<span class="bg-tile-label">${bg.name}</span>`;
    tile.addEventListener('click', () => selectBackground(bg, 'none'));
    if (state.background?.id === bg.id) tile.classList.add('active');
    noneGrid.appendChild(tile);
  });
}

function selectBackground(bg, group) {
  state.background = { ...bg, group };
  renderBackgrounds();
}

$('btn-skip-bg').addEventListener('click', () => {
  state.background = null;
  proceedToShoot();
});

$('btn-bg-select').addEventListener('click', () => {
  proceedToShoot();
});

async function proceedToShoot() {
  showScreen('screen-shoot');
  if (!state.stream) {
    const ok = await startCamera();
    if (!ok) {
      // 카메라 실패 시 한 단계 뒤로
      state.history.pop();
      showScreen('screen-bg', false);
    }
  }
}

// ===== 카메라 =====
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 960 }, facingMode: 'user' },
      audio: false,
    });
    state.stream = stream;
    $('video').srcObject = stream;
    $('cam-status').textContent = '준비 완료';
    return true;
  } catch (err) {
    console.error(err);
    alert('카메라 권한을 허용해주세요!\n\n오류: ' + err.message);
    $('cam-status').textContent = '카메라 오류';
    return false;
  }
}

// ===== 필터 =====
$('filter-list').addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  $('filter-list').querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  state.filter = chip.dataset.filter;
  const video = $('video');
  video.className = '';
  if (state.filter !== 'none') video.classList.add('filter-' + state.filter);
});

function filterToCanvasString(f) {
  switch (f) {
    case 'bw': return 'grayscale(1) contrast(1.05)';
    case 'sepia': return 'sepia(0.75) contrast(1.05) brightness(1.02)';
    case 'vintage': return 'sepia(0.3) contrast(1.1) saturate(0.8) brightness(1.05)';
    case 'bright': return 'brightness(1.15) contrast(1.05) saturate(1.1)';
    default: return 'none';
  }
}

// ===== 캡쳐 =====
function captureFrame() {
  const video = $('video');
  const w = video.videoWidth, h = video.videoHeight;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  ctx.translate(w, 0);
  ctx.scale(-1, 1);
  ctx.filter = filterToCanvasString(state.filter);
  ctx.drawImage(video, 0, 0, w, h);
  return c.toDataURL('image/jpeg', 0.92);
}

// ===== 카운트다운 =====
async function runCountdown(seconds) {
  const el = $('countdown');
  for (let i = seconds; i >= 1; i--) {
    el.textContent = i;
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
    await sleep(1000);
  }
  el.classList.remove('show');
  el.textContent = '';
}

function flash() {
  const el = $('flash');
  el.classList.remove('fire');
  void el.offsetWidth;
  el.classList.add('fire');
}

// ===== 촬영 시퀀스 =====
async function shootSequence() {
  if (state.shooting) return;
  state.shooting = true;
  state.shots = [];
  state.shotCount = 0;
  document.querySelectorAll('.progress-slot').forEach(s => {
    s.classList.remove('filled');
    s.style.backgroundImage = '';
  });

  $('btn-shoot').disabled = true;
  $('btn-shoot').textContent = '촬영 중...';
  $('btn-retake-all').disabled = true;

  for (let i = 0; i < 4; i++) {
    $('cam-status').textContent = `${i + 1}번째 컷 준비`;
    await runCountdown(3);
    flash();
    await sleep(120);
    const data = captureFrame();
    state.shots.push(data);
    state.shotCount++;
    $('shot-count').textContent = `${state.shotCount} / 4`;
    const slot = document.querySelector(`.progress-slot[data-i="${i}"]`);
    slot.style.backgroundImage = `url(${data})`;
    slot.classList.add('filled');
    await sleep(700);
  }

  state.shooting = false;
  $('btn-shoot').disabled = false;
  $('btn-shoot').textContent = '다시 시작';
  $('btn-retake-all').disabled = false;
  $('cam-status').textContent = '완료!';

  await sleep(500);
  goToResult();
}

$('btn-shoot').addEventListener('click', shootSequence);
$('btn-retake-all').addEventListener('click', () => {
  state.shots = [];
  state.shotCount = 0;
  $('shot-count').textContent = '0 / 4';
  document.querySelectorAll('.progress-slot').forEach(s => {
    s.classList.remove('filled');
    s.style.backgroundImage = '';
  });
  $('btn-shoot').textContent = '촬영 시작';
  $('btn-retake-all').disabled = true;
  $('cam-status').textContent = '준비 완료';
});

// ===== 결과 그리기 (세로 스트립) =====
async function drawResult() {
  const canvas = $('result-canvas');
  const ctx = canvas.getContext('2d');

  // 세로 4컷 스트립: 600 x 1800
  const W = 600, H = 1800;
  canvas.width = W;
  canvas.height = H;

  const frame = FRAMES[state.frameIdx];

  // 1) 프레임 배경 (테두리)
  ctx.fillStyle = frame.bg;
  ctx.fillRect(0, 0, W, H);

  // 2) 사진 영역
  const padX = 40;
  const padTop = 70;
  const padBottom = 180;
  const gap = 14;
  const innerW = W - padX * 2;
  const innerH = H - padTop - padBottom;
  const cellH = (innerH - gap * 3) / 4;

  // 3) 사진 그리기 + 배경 합성
  await Promise.all(state.shots.map((src, i) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const y = padTop + i * (cellH + gap);

      // 배경 먼저 (사진 영역 안에)
      if (state.background && state.background.color) {
        ctx.fillStyle = state.background.color;
        ctx.fillRect(padX, y, innerW, cellH);

        // 별 패턴이면 별 그리기
        if (state.background.group === 'stars') {
          drawStarsPattern(ctx, padX, y, innerW, cellH, state.background.starColor);
        }
      } else {
        // 배경 없음 → 사진 전체로 채움 (기본)
        ctx.fillStyle = '#000';
        ctx.fillRect(padX, y, innerW, cellH);
      }

      // 사진 cover로 그리기
      const ir = img.width / img.height;
      const cr = innerW / cellH;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;
      if (ir > cr) {
        sw = img.height * cr;
        sx = (img.width - sw) / 2;
      } else {
        sh = img.width / cr;
        sy = (img.height - sh) / 2;
      }
      ctx.drawImage(img, sx, sy, sw, sh, padX, y, innerW, cellH);

      resolve();
    };
    img.src = src;
  })));

  // 4) 상단 타이틀
  if (state.showTitle) {
    ctx.fillStyle = frame.text;
    ctx.textAlign = 'center';
    ctx.font = '500 italic 28px Fraunces, serif';
    ctx.fillText('young ★ star', W / 2, 44);
  }

  // 5) 하단 로고/날짜
  const footerY = H - padBottom + 50;
  ctx.fillStyle = frame.text;
  ctx.textAlign = 'center';
  ctx.font = '500 italic 32px Fraunces, serif';
  ctx.fillText('young ★ star', W / 2, footerY);

  if (state.showDate) {
    const d = new Date();
    const dateStr = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
    ctx.font = '400 14px Inter, sans-serif';
    ctx.fillStyle = frame.text;
    ctx.globalAlpha = 0.6;
    ctx.fillText(`${dateStr}  ·  PHOTO BOOTH`, W / 2, footerY + 32);
    ctx.globalAlpha = 1;
  }

  // 설정 표시 업데이트
  $('result-frame-name').textContent = frame.name;
  $('result-bg-name').textContent = state.background ? state.background.name : 'None';
}

function drawStarsPattern(ctx, x, y, w, h, starColor) {
  ctx.save();
  ctx.fillStyle = starColor;
  // 적당한 별 위치 시드 (사이즈에 맞게 분포)
  const cols = 4, rows = 3;
  const stepX = w / cols, stepY = h / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // 살짝 랜덤 오프셋 (시드 기반)
      const seed = (r * cols + c);
      const offX = ((seed * 31) % 30) - 15;
      const offY = ((seed * 17) % 24) - 12;
      const cx = x + stepX * (c + 0.5) + offX;
      const cy = y + stepY * (r + 0.5) + offY;
      const size = 12 + (seed % 4) * 2;
      drawStar(ctx, cx, cy, size);
    }
  }
  ctx.restore();
}

function drawStar(ctx, cx, cy, size) {
  const spikes = 5;
  const outer = size;
  const inner = size * 0.45;
  let rot = Math.PI / 2 * 3;
  const step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outer);
  for (let i = 0; i < spikes; i++) {
    let x = cx + Math.cos(rot) * outer;
    let y = cy + Math.sin(rot) * outer;
    ctx.lineTo(x, y);
    rot += step;
    x = cx + Math.cos(rot) * inner;
    y = cy + Math.sin(rot) * inner;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.closePath();
  ctx.fill();
}

async function goToResult() {
  showScreen('screen-result');
  await drawResult();
}

// 토글
$('toggle-date').addEventListener('change', async (e) => {
  state.showDate = e.target.checked;
  await drawResult();
});
$('toggle-title').addEventListener('change', async (e) => {
  state.showTitle = e.target.checked;
  await drawResult();
});

// 다운로드
$('btn-download').addEventListener('click', () => {
  const link = document.createElement('a');
  const d = new Date();
  const ts = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}_${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
  link.download = `young-star_${ts}.png`;
  link.href = $('result-canvas').toDataURL('image/png');
  link.click();
});

// 처음으로
$('btn-restart').addEventListener('click', () => {
  state.shots = [];
  state.shotCount = 0;
  state.history = [];
  $('shot-count').textContent = '0 / 4';
  document.querySelectorAll('.progress-slot').forEach(s => {
    s.classList.remove('filled');
    s.style.backgroundImage = '';
  });
  $('btn-shoot').textContent = '촬영 시작';
  $('btn-retake-all').disabled = true;
  showScreen('screen-intro', false);
});

// 정리
window.addEventListener('beforeunload', () => {
  if (state.stream) state.stream.getTracks().forEach(t => t.stop());
});

// 초기 상태
state.background = BACKGROUNDS.stars[1]; // 기본값: Black/White 별 배경
