# young ★ star

editorial photo booth, made for fun.

---

## 흐름

```
intro → 01 frame → 02 background → 03 capture → result
```

- 인트로: 풀스크린 무드 페이지
- 프레임 6종 (Ink · Paper · Plum · Lilac · Blush · Moss) — 좌우 화살표/점/사이드 카드 어느 걸 눌러도 동작
- 배경 13종 — 별 6 / 단색 6 / 없음 1
- 촬영: 4컷, 한 컷당 3초 카운트다운 + 플래시
- 결과: 600×1800 세로 스트립, 옵션 토글하며 미리보기, PNG 저장

---

## 파일

```
young-star/
├── index.html
├── style.css
├── app.js
└── README.md
```

---

## VS Code에서 실행

> ⚠️ `index.html` 더블클릭하지 마요. 카메라 안 켜져요. **Live Server**나 `localhost`에서만 됩니다.

1. VS Code에서 `young-star` 폴더 열기
2. Extensions에서 **Live Server** 설치
3. `index.html` 우클릭 → **Open with Live Server**
4. 브라우저 자동으로 열리고 카메라 권한 허용 → 끝

대안: 터미널에서
```bash
cd young-star
python3 -m http.server 5500
# → http://localhost:5500
```

---

## Vercel 배포

1. **GitHub에 push**
   ```bash
   cd young-star
   git init
   git add .
   git commit -m "first commit"
   git branch -M main
   git remote add origin https://github.com/본인아이디/young-star.git
   git push -u origin main
   ```

2. **Vercel 연결**
   - https://vercel.com → GitHub로 로그인
   - Add New → Project → `young-star` import
   - 설정 그대로 두고 Deploy
   - 30초 뒤 `young-star.vercel.app` 같은 주소로 사이트 완성

3. **`young-star.com` 도메인 연결**
   - 도메인 산 곳 준비 (가비아, Namecheap 등)
   - Vercel → Settings → Domains → 도메인 입력
   - Vercel이 알려주는 DNS 레코드를 도메인 구매처 DNS 설정에 추가
   - 1~30분 뒤 자동 연결 + HTTPS 자동 적용

> 도메인 없으면 `young-star.vercel.app`로 써도 됨.

---

## 커스터마이징

### 포인트 컬러
`style.css` 맨 위 `--accent: #a78bfa;` 수정.

### 배경 베이스
`--bg: #1c1426;` 더 어둡거나 밝게 조정.

### 프레임 추가
`app.js`의 `FRAMES` 배열에 추가하고, `style.css`에 `.frame-card.theme-새이름` 스타일 추가.

### 배경 추가
`app.js`의 `BACKGROUNDS.stars` 또는 `BACKGROUNDS.basic`에 추가.

### 사진 수 변경
`app.js`에서 숫자 `4` 일괄 수정 + 결과 캔버스 `H = 1800` 조정.

---

## 주의

- 카메라 권한은 첫 접속 시 "허용"
- 모바일도 지원 (사파리/크롬)
- **사진은 본인 컴퓨터에만 저장됨.** 서버 안 거침.

---

made with ★ for fun
