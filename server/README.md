# 방명록 API (Vercel + MongoDB Atlas)

둘 다 무료 플랜으로 운영됩니다.
- **MongoDB Atlas M0**: 512MB 무료 DB (구글 계정으로 가입 가능)
- **Vercel Hobby**: 서버리스 API 호스팅 (GitHub 계정으로 로그인)

## 1. MongoDB Atlas 준비

1. https://www.mongodb.com/cloud/atlas/register 에서 가입 (Sign up with Google)
2. **Create a cluster** → **M0 (Free)** 선택, 지역은 `Seoul (ap-northeast-2)` 또는 `Tokyo` → Create
3. **Database Access**: 사용자 이름/비밀번호 생성 (비밀번호에 특수문자는 피하는 게 편합니다)
4. **Network Access** → Add IP Address → **Allow access from anywhere (0.0.0.0/0)**
   (Vercel 서버 IP가 고정이 아니라서 필요합니다)
5. **Connect → Drivers** 에서 연결 문자열 복사
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority`

## 2. Vercel 배포

1. https://vercel.com 에서 **Continue with GitHub** 로 로그인
2. **Add New → Project** → `invitation` 저장소 Import
3. **Root Directory** 를 `server` 로 지정
4. **Environment Variables** 추가
   - `MONGODB_URI` = 1-5에서 복사한 연결 문자열
   - `ALLOWED_ORIGINS` = `https://koongsil.github.io`
5. **Deploy** → `https://<프로젝트>.vercel.app` 주소가 나옵니다

배포된 주소를 `public/js/config.js` 의 `guestbookApi` 에 넣고 push 하면 방명록이 보입니다.
이후 `server/` 를 수정해 push 하면 Vercel이 자동으로 다시 배포합니다.

## 로컬 개발

```bash
cd server
npm install
cp .env.example .env     # MONGODB_URI 채우기
npm run dev              # http://localhost:8787
```

`config.js` 의 `guestbookApi` 를 `http://localhost:8787` 로 바꾸고 루트에서 `npm run dev` 로 청첩장을 띄우면 됩니다.

## API

| 메서드 | 경로 | 본문 | 설명 |
| --- | --- | --- | --- |
| GET | `/api/guestbook?cursor=<id>` | | 최신순 10개씩, `nextCursor` 로 다음 페이지 |
| POST | `/api/guestbook` | `{ name, message }` | 작성 |

## 글 삭제 (관리자)

방명록에는 삭제 기능이 없습니다. Atlas 웹 콘솔 → **Data Explorer (Browse Collections)** → `invitation.guestbook` 에서 글을 찾아 휴지통 아이콘으로 삭제합니다.
