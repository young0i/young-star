// ===== young ★ star photo booth =====

// ===== 데이터 =====
const FRAMES = [
  { id: 'ink',    name: 'Ink',    theme: 'ink',    bg: '#0a0a0a', text: '#ffffff' },
  { id: 'paper',  name: 'Paper',  theme: 'paper',  bg: '#f4ede0', text: '#2a1a14' },
  { id: 'plum',   name: 'Plum',   theme: 'plum',   bg: '#3d1a4f', text: '#f0e6f8' },
  { id: 'lilac',  name: 'Lilac',  theme: 'lilac',  bg: '#d4c5ee', text: '#2a1a4f' },
  { id: 'blush',  name: 'Blush',  theme: 'blush',  bg: '#efcfd6', text: '#4a1f2a' },
  { id: 'moss',   name: 'Moss',   theme: 'moss',   bg: '#3a4a35', text: '#ecf0e3' },
];

const BACKGROUNDS = {
  stars: [
    { id: 'star-navy',     name: 'Midnight',  color: '#0e1538', starColor: '#f5c44a' },
    { id: 'star-black',    name: 'Mono',      color: '#0a0a0a', starColor: '#ffffff' },
    { id: 'star-rose',     name: 'Rose',      color: '#d96b8e', starColor: '#4caf7a' },
    { id: 'star-forest',   name: 'Forest',    color: '#2f5a3f', starColor: '#e89db3' },
    { id: 'star-burgundy', name: 'Burgundy',  color: '#5a1f2e', starColor: '#a5c8e6' },
    { id: 'star-claret',   name: 'Claret',    color: '#7a2030', starColor: '#f0c14b' },
  ],
  basic: [
    { id: 'basic-black',  name: 'Onyx',   color: '#1a1a1a' },
    { id: 'basic-white',  name: 'Snow',   color: '#fafafa' },
    { id: 'basic-blue',   name: 'Ocean',  color: '#3d6f8f' },
    { id: 'basic-green',  name: 'Sage',   color: '#5a8055' },
    { id: 'basic-yellow', name: 'Honey',  color: '#d9b440' },
    { id: 'basic-rose',   name: 'Petal',  color: '#c97090' },
  ],
  none: [
    { id: 'none', name: 'No backdrop', color: null }
  ]
};

// ===== 상태 =====
const state = {
  stream: null,
  filter: 'none',
  shots: [],
  shotCount: 0,
  shooting: false,
  frameIdx: 0,
  background: null,
  showDate: true,
  showTitle: true,
};

// ===== 유틸 =====
const $ = (id) => document.getElementById(id);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = $(id);
  if (target) target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'instant' });
}

// 모든 back 버튼 자동 처리
document.querySelectorAll('[data-back]').forEach(btn => {
  btn.addEventListener('click', () => {
    showScreen(btn.dataset.back);
  });
});

// ===== 1. 인트로 → 프레임 =====
$('btn-begin').addEventListener('click', () => {
  showScreen('screen-frame');
  renderFrameCarousel();
});

// ===== 2. 프레임 캐러셀 =====
function renderFrameCarousel() {
  const deck = $('frame-deck');
  const dots = $('frame-dots');
  deck.innerHTML = '';
  dots.innerHTML = '';

  const len = FRAMES.length;
  const idx = state.frameIdx;
  const leftIdx = (idx - 1 + len) % len;
  const rightIdx = (idx + 1) % len;

  // 좌·중·우 카드 3장
  [
    { i: leftIdx, pos: 'side', onclick: () => { state.frameIdx = leftIdx; renderFrameCarousel(); } },
    { i: idx, pos: 'center', onclick: null },
    { i: rightIdx, pos: 'side', onclick: () => { state.frameIdx = rightIdx; renderFrameCarousel(); } },
  ].forEach(({ i, pos, onclick }) => {
    const f = FRAMES[i];
    const card = document.createElement('div');
    card.className = `frame-card theme-${f.theme} ${pos}`;
    card.innerHTML = `
      <div class="frame-card-title">young ★ star</div>
      <div class="frame-card-slot"></div>
      <div class="frame-card-slot"></div>
      <div class="frame-card-slot"></div>
      <div class="frame-card-slot"></div>
    `;
    if (onclick) card.addEventListener('click', onclick);
    deck.appendChild(card);
  });

  $('frame-name').textContent = FRAMES[idx].name;

  FRAMES.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot-btn' + (i === idx ? ' active' : '');
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

// ===== 3. 배경 선택 =====
function makeStarTileSVG(color, starColor) {
  const positions = [
    [25,18],[60,12],[100,22],[135,16],
    [40,48],[80,52],[120,46],
    [22,76],[58,82],[95,78],[130,74]
  ];
  const stars = positions.map(([x, y]) => {
    const p = drawStarPath(x, y, 6, 2.6);
    return `<path d="${p}"/>`;
  }).join('');
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 100' preserveAspectRatio='xMidYMid slice'>
    <rect width='160' height='100' fill='${color}'/>
    <g fill='${starColor}'>${stars}</g>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function drawStarPath(cx, cy, outer, inner) {
  const spikes = 5;
  let path = '';
  let rot = -Math.PI / 2;
  const step = Math.PI / spikes;
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const x = cx + Math.cos(rot) * r;
    const y = cy + Math.sin(rot) * r;
    path += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1);
    rot += step;
  }
  path += 'Z';
  return path;
}

function renderBackgrounds() {
  const starsRow = $('bg-stars-row');
  const basicRow = $('bg-basic-row');
  const noneRow = $('bg-none-row');
  starsRow.innerHTML = '';
  basicRow.innerHTML = '';
  noneRow.innerHTML = '';

  BACKGROUNDS.stars.forEach(bg => {
    const tile = document.createElement('button');
    tile.className = 'bg-tile';
    tile.style.backgroundImage = `url("${makeStarTileSVG(bg.color, bg.starColor)}")`;
    tile.style.backgroundSize = 'cover';
    tile.innerHTML = `<span class="bg-tile-label">${bg.name}</span>`;
    tile.addEventListener('click', () => selectBackground(bg, 'stars'));
    if (state.background?.id === bg.id) tile.classList.add('active');
    starsRow.appendChild(tile);
  });

  BACKGROUNDS.basic.forEach(bg => {
    const tile = document.createElement('button');
    tile.className = 'bg-tile';
    tile.style.background = bg.color;
    tile.innerHTML = `<span class="bg-tile-label" style="color:${isColorDark(bg.color) ? '#fff' : '#1a1a1a'};text-shadow:none">${bg.name}</span>`;
    tile.addEventListener('click', () => selectBackground(bg, 'basic'));
    if (state.background?.id === bg.id) tile.classList.add('active');
    basicRow.appendChild(tile);
  });

  BACKGROUNDS.none.forEach(bg => {
    const tile = document.createElement('button');
    tile.className = 'bg-tile bg-checker';
    tile.innerHTML = `<span class="bg-tile-label">${bg.name}</span>`;
    tile.addEventListener('click', () => selectBackground(bg, 'none'));
    if (state.background?.id === bg.id) tile.classList.add('active');
    noneRow.appendChild(tile);
  });
}

function selectBackground(bg, group) {
  if (group === 'none') {
    state.background = null;
  } else {
    state.background = bg;
    state.background.group = group;
  }
  renderBackgrounds();
}

function isColorDark(hex) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 140;
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
      showScreen('screen-bg');
    }
  }
}

// ===== 4. 카메라 + MediaPipe 배경 분리 =====
let selfieSegmentation = null;
let renderLoopId = null;
let aiReady = false;

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 960 }, facingMode: 'user' },
      audio: false,
    });
    state.stream = stream;
    const video = $('video');
    video.srcObject = stream;
    await new Promise(resolve => {
      if (video.readyState >= 2) resolve();
      else video.onloadedmetadata = () => resolve();
    });

    // 캔버스 크기 비디오와 맞추기
    const canvas = $('cam-canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // AI 모델 초기화
    if (!selfieSegmentation) {
      $('cam-status').textContent = "AI 모델 준비 중...";
      await initSegmentation();
    }
    $('ai-loading').classList.add('hidden');
    aiReady = true;
    $('cam-status').textContent = "ready when you are.";

    // 렌더링 루프 시작
    startRenderLoop();
    return true;
  } catch (err) {
    console.error(err);
    alert('카메라 권한을 허용해주세요!\n\n' + err.message);
    $('cam-status').textContent = 'camera unavailable';
    return false;
  }
}

async function initSegmentation() {
  selfieSegmentation = new SelfieSegmentation({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
  });
  selfieSegmentation.setOptions({
    modelSelection: 1, // 0=가벼움 1=정확함
    selfieMode: true,
  });
  selfieSegmentation.onResults(onSegmentationResults);

  // 첫 프레임 보내서 모델 로드시키기
  const video = $('video');
  await selfieSegmentation.send({ image: video });
}

// 매 프레임마다 결과를 캔버스에 그림
function onSegmentationResults(results) {
  const canvas = $('cam-canvas');
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.save();
  ctx.clearRect(0, 0, w, h);

  // 1) 인물 마스크 모양으로 사람 그리기
  ctx.drawImage(results.segmentationMask, 0, 0, w, h);
  ctx.globalCompositeOperation = 'source-in';
  ctx.drawImage(results.image, 0, 0, w, h);

  // 2) 사람 뒤에 배경 그리기
  ctx.globalCompositeOperation = 'destination-over';
  drawSelectedBackground(ctx, w, h);

  ctx.restore();
}

// 선택한 배경을 캔버스에 그리는 함수
function drawSelectedBackground(ctx, w, h) {
  const bg = state.background;
  if (!bg || !bg.color) {
    // 배경 없음 → 원본 카메라 영상 그대로
    ctx.drawImage($('video'), 0, 0, w, h);
    return;
  }

  // 단색
  ctx.fillStyle = bg.color;
  ctx.fillRect(0, 0, w, h);

  // 별 배경이면 별도 뿌리기
  if (bg.group === 'stars') {
    ctx.save();
    ctx.fillStyle = bg.starColor;
    // 그림자(빛나는 효과)
    ctx.shadowColor = bg.starColor;
    ctx.shadowBlur = 12;

    const cols = 7, rows = 6;
    const stepX = w / cols, stepY = h / rows;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const seed = r * cols + c;
        const offX = ((seed * 37) % 60) - 30;
        const offY = ((seed * 23) % 50) - 25;
        const cx = stepX * (c + 0.5) + offX;
        const cy = stepY * (r + 0.5) + offY;
        // 별 크기 키움: 22~38px
        const size = 22 + (seed % 5) * 4;
        drawStarShape(ctx, cx, cy, size);
      }
    }
    ctx.restore();
  }
}

function startRenderLoop() {
  const video = $('video');
  let lastTime = 0;
  const targetFps = 24;
  const minInterval = 1000 / targetFps;

  async function loop(now) {
    if (!state.stream) return;
    if (now - lastTime >= minInterval && aiReady && video.readyState >= 2) {
      lastTime = now;
      try {
        await selfieSegmentation.send({ image: video });
      } catch (e) {
        console.error('segmentation error:', e);
      }
    }
    renderLoopId = requestAnimationFrame(loop);
  }
  renderLoopId = requestAnimationFrame(loop);
}

// 필터
$('filter-list').addEventListener('click', (e) => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  $('filter-list').querySelectorAll('.filter-btn').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  state.filter = btn.dataset.filter;
  const canvas = $('cam-canvas');
  canvas.className = '';
  if (state.filter !== 'none') canvas.classList.add('filter-' + state.filter);
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

// 합성된 캔버스를 그대로 캡쳐
function captureFrame() {
  const camCanvas = $('cam-canvas');
  // 필터까지 적용된 결과로 캡쳐하기 위해 임시 캔버스에 그리기
  const c = document.createElement('canvas');
  c.width = camCanvas.width;
  c.height = camCanvas.height;
  const ctx = c.getContext('2d');
  ctx.filter = filterToCanvasString(state.filter);
  ctx.drawImage(camCanvas, 0, 0);
  return c.toDataURL('image/jpeg', 0.92);
}

// 카운트다운
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

function fireFlash() {
  const el = $('flash');
  el.classList.remove('fire');
  void el.offsetWidth;
  el.classList.add('fire');
}

async function shootSequence() {
  if (state.shooting) return;
  state.shooting = true;
  state.shots = [];
  state.shotCount = 0;
  document.querySelectorAll('.p-slot').forEach(s => {
    s.classList.remove('filled');
    s.style.backgroundImage = '';
  });

  $('btn-shoot').disabled = true;
  $('btn-retake-all').disabled = true;

  for (let i = 0; i < 4; i++) {
    $('cam-status').textContent = `frame ${i + 1} — get ready`;
    await runCountdown(3);
    fireFlash();
    await sleep(120);
    const data = captureFrame();
    state.shots.push(data);
    state.shotCount++;
    $('shot-count').textContent = `${state.shotCount} / 4`;
    const slot = document.querySelector(`.p-slot[data-i="${i}"]`);
    slot.style.backgroundImage = `url(${data})`;
    slot.classList.add('filled');
    await sleep(700);
  }

  state.shooting = false;
  $('btn-shoot').disabled = false;
  $('btn-retake-all').disabled = false;
  $('cam-status').textContent = 'looking gorgeous.';

  await sleep(600);
  goToResult();
}

$('btn-shoot').addEventListener('click', shootSequence);

$('btn-retake-all').addEventListener('click', () => {
  state.shots = [];
  state.shotCount = 0;
  $('shot-count').textContent = '0 / 4';
  document.querySelectorAll('.p-slot').forEach(s => {
    s.classList.remove('filled');
    s.style.backgroundImage = '';
  });
  $('btn-retake-all').disabled = true;
  $('cam-status').textContent = "ready when you are.";
});

// ===== 5. 결과 그리기 =====
async function drawResult() {
  const canvas = $('result-canvas');
  const ctx = canvas.getContext('2d');

  const W = 600, H = 1800;
  canvas.width = W;
  canvas.height = H;

  const frame = FRAMES[state.frameIdx];

  // 1) 프레임 배경
  ctx.fillStyle = frame.bg;
  ctx.fillRect(0, 0, W, H);

  // 2) 사진 영역 계산
  const padX = 42;
  const padTop = 72;
  const padBottom = 200;
  const gap = 16;
  const innerW = W - padX * 2;
  const innerH = H - padTop - padBottom;
  const cellH = (innerH - gap * 3) / 4;

  // 3) 사진 그리기 (이미 인물+배경이 합쳐진 상태로 들어옴)
  await Promise.all(state.shots.map((src, i) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const y = padTop + i * (cellH + gap);

      // 셀 배경 (이미지 로드 실패 대비)
      ctx.fillStyle = '#000';
      ctx.fillRect(padX, y, innerW, cellH);

      // 사진 cover 크롭으로 꽉 채우기
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
    ctx.font = 'italic 400 26px Fraunces, serif';
    ctx.fillText('young ★ star', W / 2, 48);
  }

  // 5) 하단
  const footerY = H - padBottom + 60;
  ctx.fillStyle = frame.text;
  ctx.textAlign = 'center';
  ctx.font = 'italic 400 34px Fraunces, serif';
  ctx.fillText('young ★ star', W / 2, footerY);

  if (state.showDate) {
    const d = new Date();
    const dateStr = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
    ctx.font = '400 13px Inter, sans-serif';
    ctx.globalAlpha = 0.6;
    ctx.fillText(`${dateStr}  ·  photo booth`, W / 2, footerY + 34);
    ctx.globalAlpha = 1;
  }

  $('result-frame-name').textContent = frame.name;
  $('result-bg-name').textContent = state.background ? state.background.name : 'None';
}

function drawStarsOnRect(ctx, x, y, w, h, starColor) {
  ctx.save();
  ctx.fillStyle = starColor;
  const cols = 4, rows = 4;
  const stepX = w / cols, stepY = h / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const seed = r * cols + c;
      const offX = ((seed * 37) % 28) - 14;
      const offY = ((seed * 23) % 22) - 11;
      const cx = x + stepX * (c + 0.5) + offX;
      const cy = y + stepY * (r + 0.5) + offY;
      const size = 10 + (seed % 4) * 2;
      drawStarShape(ctx, cx, cy, size);
    }
  }
  ctx.restore();
}

function drawStarShape(ctx, cx, cy, size) {
  const spikes = 5;
  const outer = size;
  const inner = size * 0.45;
  let rot = -Math.PI / 2;
  const step = Math.PI / spikes;
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const x = cx + Math.cos(rot) * r;
    const y = cy + Math.sin(rot) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
    rot += step;
  }
  ctx.closePath();
  ctx.fill();
}

async function goToResult() {
  showScreen('screen-result');
  await drawResult();
}

// 옵션 토글
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
  $('shot-count').textContent = '0 / 4';
  document.querySelectorAll('.p-slot').forEach(s => {
    s.classList.remove('filled');
    s.style.backgroundImage = '';
  });
  $('btn-retake-all').disabled = true;
  showScreen('screen-intro');
});

// 정리
window.addEventListener('beforeunload', () => {
  if (state.stream) state.stream.getTracks().forEach(t => t.stop());
  if (renderLoopId) cancelAnimationFrame(renderLoopId);
});

// 초기값
state.background = BACKGROUNDS.stars[1]; // Mono (검정+흰별)
