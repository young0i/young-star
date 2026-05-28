# ✦ young-star photo booth

나만의 네컷사진 포토부스 ✿

---

## 📁 파일 구조

```
young-star/
├── index.html      ← 메인 페이지
├── style.css       ← 디자인
├── app.js          ← 포토부스 로직
└── README.md       ← 이 파일
```

---

## 🚀 로컬에서 실행하기 (VS Code)

> ⚠️ 카메라(getUserMedia) 기능은 **반드시 `localhost`나 `https://`** 에서만 동작해요. `index.html` 더블클릭으로는 카메라가 안 켜져요.

### 방법 1. VS Code Live Server (제일 쉬움)
1. VS Code 열고 `young-star` 폴더 열기
2. 왼쪽 확장팩(Extensions)에서 **Live Server** 설치
3. `index.html` 우클릭 → **"Open with Live Server"**
4. 자동으로 브라우저 열림 → 카메라 권한 허용 → 끝!

### 방법 2. 터미널에서
```bash
cd young-star
python3 -m http.server 5500
# 또는
npx serve
```
브라우저에서 `http://localhost:5500` 접속.

---

## 🌍 인터넷에 배포하기 (Vercel)

> Vercel을 추천하는 이유: **무료, HTTPS 자동, 도메인 연결 쉬움, 깃허브 푸시하면 자동 배포**

### 1단계. GitHub에 코드 올리기
1. https://github.com 에서 새 저장소 만들기 (이름: `young-star`)
2. 터미널에서:
   ```bash
   cd young-star
   git init
   git add .
   git commit -m "first commit"
   git branch -M main
   git remote add origin https://github.com/본인아이디/young-star.git
   git push -u origin main
   ```

### 2단계. Vercel에 배포
1. https://vercel.com → GitHub로 로그인
2. **"Add New" → "Project"**
3. 방금 만든 `young-star` 저장소 **Import**
4. 설정 그대로 두고 **"Deploy"** 클릭
5. 30초쯤 기다리면 → `young-star.vercel.app` 같은 주소로 사이트 완성 ✿

### 3단계. `young-star.com` 도메인 연결 (선택)
1. 도메인 산 곳 (가비아, Namecheap, GoDaddy 등) 준비
2. Vercel 프로젝트 → **Settings → Domains**
3. `young-star.com` 입력 → **Add**
4. Vercel이 알려주는 DNS 레코드(A 또는 CNAME)를 도메인 구매처 DNS 설정에 추가
5. 보통 1~30분 안에 연결 완료, HTTPS도 자동으로 붙음

> 💡 도메인 없으면 그냥 `young-star.vercel.app`로 써도 충분해요. 어차피 본인만 쓸 거면!

---

## 🎨 커스터마이징

### 프레임 색상 추가/변경
`index.html`에서 `color-list` 부분 수정:
```html
<button class="color-chip" data-color="#원하는색" style="--c:#원하는색" title="이름"></button>
```

### 필터 추가
1. `style.css`에 새 필터 추가:
   ```css
   .filter-cool { filter: hue-rotate(20deg) saturate(1.2); }
   ```
2. `index.html` filter-list에 버튼 추가
3. `app.js`의 `filterToCanvasString()`에 case 추가 (다운로드 시 적용용)

### 사진 개수 4컷 → 다른 숫자
`app.js`에서 `4`로 검색해서 바꾸기 (촬영 횟수 + 결과 그리드 레이아웃)

### 메인 컬러(빨간 포인트) 바꾸기
`style.css` 맨 위 `--accent: #c44536;` 수정

---

## ⚠️ 주의

- **카메라 권한**: 처음 접속 시 브라우저가 물어봐요. "허용" 누르기
- **HTTPS 필수**: 배포된 사이트는 무조건 https여야 카메라 동작 (Vercel은 자동으로 됨)
- **모바일도 지원**: 폰 브라우저에서도 동작 (사파리/크롬)
- **사진은 어디로?**: 전부 본인 컴퓨터에만 저장됨. 서버로 안 올라감.

---

made with ✦ for fun
