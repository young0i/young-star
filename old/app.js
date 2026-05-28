// ===== young-star photo booth =====
// 상태
const state = {
  stream: null,
  filter: 'none',
  shots: [],          // dataURL 4장
  shotCount: 0,
  shooting: false,
  frameColor: '#111111',
  showDate: true,
};

// 엘리먼트
const $ = (id) => document.getElementById(id);
const video = $('video');
const countdownEl = $('countdown');
const flashEl = $('flash');
const shotCountEl = $('shot-count');
const camStatusEl = $('cam-status');
const previewSlots = document.querySelectorAll('.preview-slot');
const filterList = $('filter-list');
const colorList = $('color-list');
const resultCanvas = $('result-canvas');

// 화면 전환
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(id).classList.add('active');
}

// ===== 카메라 시작 =====
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 960 }, facingMode: 'user' },
      audio: false,
    });
    state.stream = stream;
    video.srcObject = stream;
    camStatusEl.textContent = '준비 완료';
    return true;
  } catch (err) {
    console.error(err);
    alert('카메라 권한을 허용해주세요!\n\n오류: ' + err.message);
    camStatusEl.textContent = '카메라 오류';
    return false;
  }
}

// ===== 필터 적용 =====
filterList.addEventListener('click', (e) => {
  const chip = e.target.closest('.filter-chip');
  if (!chip) return;
  filterList.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  state.filter = chip.dataset.filter;
  applyFilterToVideo();
});

function applyFilterToVideo() {
  video.className = '';
  if (state.filter !== 'none') video.classList.add('filter-' + state.filter);
}

// 필터 CSS → canvas filter 문자열로 변환
function filterToCanvasString(f) {
  switch (f) {
    case 'bw': return 'grayscale(1) contrast(1.05)';
    case 'sepia': return 'sepia(0.75) contrast(1.05) brightness(1.02)';
    case 'vintage': return 'sepia(0.3) contrast(1.1) saturate(0.8) brightness(1.05)';
    case 'bright': return 'brightness(1.15) contrast(1.05) saturate(1.1)';
    default: return 'none';
  }
}

// ===== 한 컷 캡쳐 =====
function captureFrame() {
  const w = video.videoWidth;
  const h = video.videoHeight;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');

  // 거울모드(좌우반전) 적용
  ctx.translate(w, 0);
  ctx.scale(-1, 1);
  ctx.filter = filterToCanvasString(state.filter);
  ctx.drawImage(video, 0, 0, w, h);

  return c.toDataURL('image/jpeg', 0.92);
}

// ===== 카운트다운 + 촬영 시퀀스 =====
async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function runCountdown(seconds) {
  for (let i = seconds; i >= 1; i--) {
    countdownEl.textContent = i;
    countdownEl.classList.remove('show');
    void countdownEl.offsetWidth; // reflow → 애니메이션 재시작
    countdownEl.classList.add('show');
    await sleep(1000);
  }
  countdownEl.classList.remove('show');
  countdownEl.textContent = '';
}

function flash() {
  flashEl.classList.remove('fire');
  void flashEl.offsetWidth;
  flashEl.classList.add('fire');
}

async function shootSequence() {
  if (state.shooting) return;
  state.shooting = true;
  state.shots = [];
  state.shotCount = 0;
  previewSlots.forEach(s => {
    s.classList.remove('filled');
    s.style.backgroundImage = '';
  });

  $('btn-shoot').disabled = true;
  $('btn-shoot').textContent = '촬영 중...';
  $('btn-retake-all').disabled = true;

  for (let i = 0; i < 4; i++) {
    camStatusEl.textContent = `${i + 1}번째 컷 준비`;
    await runCountdown(3);
    flash();
    await sleep(120); // 플래시 잠깐
    const data = captureFrame();
    state.shots.push(data);
    state.shotCount++;
    shotCountEl.textContent = `${state.shotCount} / 4`;
    const slot = previewSlots[i];
    slot.style.backgroundImage = `url(${data})`;
    slot.classList.add('filled');
    await sleep(700); // 잠시 보여주기
  }

  state.shooting = false;
  $('btn-shoot').disabled = false;
  $('btn-shoot').textContent = '다시 시작';
  $('btn-retake-all').disabled = false;
  camStatusEl.textContent = '완료! 결과 확인 중...';

  await sleep(500);
  goToResult();
}

$('btn-shoot').addEventListener('click', shootSequence);
$('btn-retake-all').addEventListener('click', () => {
  state.shots = [];
  state.shotCount = 0;
  shotCountEl.textContent = '0 / 4';
  previewSlots.forEach(s => {
    s.classList.remove('filled');
    s.style.backgroundImage = '';
  });
  $('btn-shoot').textContent = '촬영 시작';
  $('btn-retake-all').disabled = true;
  camStatusEl.textContent = '준비 완료';
});

// ===== 결과 그리기 =====
// 인생네컷 스타일: 세로 길쭉한 프레임, 2x2 배치
function drawResult() {
  const ctx = resultCanvas.getContext('2d');

  // 캔버스 크기 (인스타 친화적: 1200 x 1800)
  const W = 1200;
  const H = 1800;
  resultCanvas.width = W;
  resultCanvas.height = H;

  // 배경 (프레임 색)
  ctx.fillStyle = state.frameColor;
  ctx.fillRect(0, 0, W, H);

  // 사진 영역 계산 (2x2 그리드)
  const padX = 60;       // 좌우 여백
  const padTop = 60;     // 위 여백
  const padBottom = 220; // 아래 여백 (로고/날짜)
  const gap = 30;        // 사진 사이 간격

  const photoAreaW = W - padX * 2;
  const photoAreaH = H - padTop - padBottom;
  const cellW = (photoAreaW - gap) / 2;
  const cellH = (photoAreaH - gap) / 2;

  const positions = [
    [padX, padTop],
    [padX + cellW + gap, padTop],
    [padX, padTop + cellH + gap],
    [padX + cellW + gap, padTop + cellH + gap],
  ];

  // 사진 그리기
  const promises = state.shots.map((src, i) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const [x, y] = positions[i];
      // object-fit: cover 처럼 그리기
      const ir = img.width / img.height;
      const cr = cellW / cellH;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;
      if (ir > cr) {
        // 이미지가 더 가로로 김 → 가로 자르기
        sw = img.height * cr;
        sx = (img.width - sw) / 2;
      } else {
        sh = img.width / cr;
        sy = (img.height - sh) / 2;
      }
      ctx.drawImage(img, sx, sy, sw, sh, x, y, cellW, cellH);
      resolve();
    };
    img.src = src;
  }));

  return Promise.all(promises).then(() => {
    // 텍스트 색 결정 (배경 밝기 따라 자동)
    const isDark = isColorDark(state.frameColor);
    const textColor = isDark ? '#fafafa' : '#1a1a1a';
    const subColor = isDark ? 'rgba(250,250,250,0.6)' : 'rgba(26,26,26,0.55)';

    // 로고 영역
    const footerY = H - padBottom + 60;

    // ✦ young-star
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.font = 'italic 300 72px "Cormorant Garamond", serif';
    ctx.fillText('✦ young ★ star', W / 2, footerY + 10);

    // 날짜
    if (state.showDate) {
      const d = new Date();
      const dateStr = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
      ctx.fillStyle = subColor;
      ctx.font = '500 22px "DM Mono", monospace';
      ctx.letterSpacing = '4px';
      ctx.fillText(dateStr + '  ·  PHOTO BOOTH', W / 2, footerY + 60);
    } else {
      ctx.fillStyle = subColor;
      ctx.font = '500 22px "DM Mono", monospace';
      ctx.fillText('PHOTO BOOTH', W / 2, footerY + 60);
    }
  });
}

function isColorDark(hex) {
  // hex → r,g,b → 밝기 계산
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 140;
}

async function goToResult() {
  showScreen('screen-result');
  await drawResult();
}

// 색상 선택
colorList.addEventListener('click', async (e) => {
  const chip = e.target.closest('.color-chip');
  if (!chip) return;
  colorList.querySelectorAll('.color-chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  state.frameColor = chip.dataset.color;
  await drawResult();
});

// 날짜 토글
$('toggle-date').addEventListener('change', async (e) => {
  state.showDate = e.target.checked;
  await drawResult();
});

// 다운로드
$('btn-download').addEventListener('click', () => {
  const link = document.createElement('a');
  const d = new Date();
  const ts = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}_${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
  link.download = `young-star_${ts}.png`;
  link.href = resultCanvas.toDataURL('image/png');
  link.click();
});

// 처음으로
$('btn-restart').addEventListener('click', () => {
  state.shots = [];
  state.shotCount = 0;
  shotCountEl.textContent = '0 / 4';
  previewSlots.forEach(s => {
    s.classList.remove('filled');
    s.style.backgroundImage = '';
  });
  $('btn-shoot').textContent = '촬영 시작';
  $('btn-retake-all').disabled = true;
  showScreen('screen-intro');
});

// ===== 시작 버튼 =====
$('btn-start').addEventListener('click', async () => {
  showScreen('screen-shoot');
  const ok = await startCamera();
  if (!ok) {
    showScreen('screen-intro');
  }
});

// 페이지 떠날 때 스트림 정리
window.addEventListener('beforeunload', () => {
  if (state.stream) state.stream.getTracks().forEach(t => t.stop());
});
