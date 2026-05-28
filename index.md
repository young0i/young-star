# young ★ star · photo booth

너만의 네컷사진 포토부스. 미니멀하게, 보라빛으로.

---

## 📁 파일 구조

```
young-star/
├── index.html      ← 메인 페이지
├── style.css       ← 디자인 (흰/검 + 짙은 보라)
├── app.js          ← 포토부스 로직
└── README.md       ← 이 파일
```

---

## ✨ 흐름

```
인트로 → 프레임 선택 → 배경 선택 → 촬영 → 결과 저장
```

- **프레임 6종** (Black, White, Purple, Lavender, Beige, Pink) — 캐러셀로 미리보기
- **배경 13종** — 별 배경 6 / 단색 6 / 배경 없음 1
- **필터 5종** — 오리지널 / 흑백 / 세피아 / 빈티지 / 밝게
- **세로 4컷 스트립** 결과물 (600×1800 PNG)

---

## 🚀 로컬에서 실행하기 (VS Code)

> ⚠️ 카메라는 **`localhost` 또는 `https://`** 에서만 동작해요. `index.html` 더블클릭은 안 돼요.

### 방법 1. Live Server (제일 쉬움)
1. VS Code에서 `young-star` 폴더 열기
2. 확장팩(Extensions)에서 **Live Server** 설치
3. `index.html` 우클릭 → **"Open with Live Server"**
4. 브라우저 자동 열림 → 카메라 권한 허용 → 끝

### 방법 2. 터미널
```bash
cd young-star
python3 -m http.server 5500
# 또는
npx serve
```
`http://localhost:5500` 접속.

---

## 🌍 인터넷에 배포하기 (Vercel)

### 1. GitHub에 코드 올리기
```bash
cd young-star
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/본인아이디/young-star.git
git push -u origin main
```

### 2. Vercel 배포
1. https://vercel.com → GitHub로 로그인
2. **Add New → Project** → `young-star` 저장소 Import
3. 설정 그대로 두고 **Deploy**
4. 30초 후 `young-star.vercel.app` 같은 주소로 완성

### 3. `young-star.com` 도메인 연결 (선택)
1. 도메인 산 곳 준비 (가비아, Namecheap 등)
2. Vercel → **Settings → Domains** → 도메인 입력
3. Vercel이 알려주는 DNS 레코드를 도메인 구매처에 추가
4. 1~30분 후 HTTPS까지 자동 연결

> 도메인 없으면 `young-star.vercel.app` 그대로 써도 됨!

---

## 🎨 커스터마이징

### 프레임 추가
`app.js`의 `FRAMES` 배열에 추가:
```js
{ id: 'mint', name: 'Mint', theme: 'mint', bg: '#c8e6d4', text: '#1a3a2a' }
```
그리고 `style.css`에 `.frame-card.theme-mint` 스타일 추가.

### 배경 추가
`app.js`의 `BACKGROUNDS` 객체에 추가:
- 별 배경: `{ id, name, color, starColor, label }`
- 단색: `{ id, name, color }`

### 메인 포인트 컬러 변경
`style.css` 맨 위 `--accent: #6d5ce3;` 수정.

### 사진 개수 4컷 → 다른 숫자
`app.js`에서 `4`로 검색해서 일괄 변경 + 결과 캔버스 높이(`H = 1800`) 조정.

---

## ⚠️ 주의

- 카메라 권한은 처음 접속 시 "허용" 누르기
- 모바일도 지원 (사파리/크롬)
- **사진은 본인 컴퓨터에만 저장됨**. 서버 안 거침.

---

made with ★ for fun
