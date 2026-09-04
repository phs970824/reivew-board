# 맛동네

동네에서 먹은 식당을 지역별로 모아 보는 맛집 후기 게시판입니다.

지도를 눌러 서울·경기 같은 지역을 고르면 그 동네 글만 보이고, 로그인하면 후기와 댓글을 남길 수 있습니다.

**데모:** [https://reivew-board.vercel.app](https://reivew-board.vercel.app)

> API는 Render 무료 인스턴스라 한동안 접속이 없으면 잠듭니다. 첫 로딩이 느리면 [헬스 체크](https://reivew-board.onrender.com/health)를 한 번 연 뒤 새로고침하면 됩니다. 글과 회원 정보는 Supabase에 있어서 서버가 잠들어도 데이터는 유지됩니다.

## 미리보기

- 메인: 지역 지도 + 선택 지역 후기 + 인기글 + 사진 갤러리
- 글: 커뮤니티형 상세, 댓글
- 회원: 이메일 인증 가입, 로그인, 비밀번호 찾기
- 작성자만 본인 글·댓글 수정/삭제

## 기술 스택

| 영역 | 사용 |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS |
| Backend | Node.js, Express |
| Database | PostgreSQL (Supabase) |
| API | REST. 문서: [Swagger](https://reivew-board.onrender.com/api-docs) |
| Auth | JWT, bcrypt. 프론트는 `localStorage` + Context (별도 상태 라이브러리 없음) |
| 이미지 | Supabase Storage (`post-images`) |
| 메일 | Nodemailer (가입·비밀번호 찾기 인증번호) |
| 배포 | 프론트 [Vercel](https://reivew-board.vercel.app), API [Render](https://reivew-board.onrender.com), DB·Storage [Supabase](https://tdvlhjheapbpxumujmvd.supabase.co) |
| 기타 | Docker Compose (로컬 일괄 실행), GitHub |

## 구조

프론트는 DB에 직접 붙지 않습니다. 화면은 Next.js, 저장과 인가는 Express가 담당합니다.

```text
브라우저  (Vercel / Next.js)
    │  JSON + Authorization: Bearer <JWT>
    ▼
Express   (Render)
    ├── PostgreSQL   users, posts, comments, regions
    ├── Storage      후기 이미지
    └── SMTP         인증 메일
```

## 주요 흐름

**가입 / 로그인**  
이메일로 6자리 코드를 받은 뒤 가입합니다. 비밀번호는 bcrypt로 해시되어 `users`에 들어갑니다. 로그인에 성공하면 JWT(1일)를 받고, 이후 글쓰기·댓글은 `Authorization: Bearer` 헤더로 요청합니다.

**게시글**  
목록 `GET /api/posts`, 상세 `GET /api/posts/:id`, 작성 `POST /api/posts`, 수정 `PUT`, 삭제 `DELETE`.  
토큰이 없으면 401, 없는 글은 404, 남이 쓴 글이면 403입니다. 등록이 끝나면 해당 글 상세로 이동합니다.

**댓글**  
글 아래 `GET|POST /api/posts/:postId/comments`, 수정·삭제는 `PUT|DELETE /api/comments/:id` (작성자만). 글이 지워지면 댓글도 같이 삭제됩니다 (`ON DELETE CASCADE`).

## 데이터 모델

```text
users 1 ─── N posts 1 ─── N comments
               │
               N
            regions
```

| 테이블 | 역할 |
| --- | --- |
| `users` | 이메일(UNIQUE), 비밀번호 해시, 닉네임, 인증 여부 |
| `regions` | 서울, 경기, 강원, 충청, 전라, 경상, 제주 |
| `posts` | 식당 이름, 제목, 본문, 이미지. `user_id`, `region_id` FK |
| `comments` | 댓글. `post_id`, `user_id` FK |
| `email_verifications` | 가입·비밀번호 찾기 인증번호 |

DDL은 `backend/sql/`에 있습니다. API가 켜질 때 테이블이 없으면 생성합니다.

## API

배포 기준: `https://reivew-board.onrender.com`  
로컬: `http://localhost:4000`  
전체 명세: [Swagger UI](https://reivew-board.onrender.com/api-docs)

| Method | Path | 인증 |
| --- | --- | --- |
| POST | `/api/auth/send-verification` | |
| POST | `/api/auth/verify-code` | |
| POST | `/api/auth/signup` | |
| POST | `/api/auth/login` | |
| POST | `/api/auth/send-password-reset` | |
| POST | `/api/auth/verify-reset-code` | |
| POST | `/api/auth/reset-password` | |
| GET | `/api/regions` | |
| GET | `/api/posts` | `page`, `limit`, `region_id` |
| GET | `/api/posts/popular` | |
| GET | `/api/posts/gallery` | |
| GET | `/api/posts/:id` | |
| POST | `/api/posts` | O |
| PUT | `/api/posts/:id` | O (작성자) |
| DELETE | `/api/posts/:id` | O (작성자) |
| GET | `/api/posts/:postId/comments` | |
| POST | `/api/posts/:postId/comments` | O |
| PUT | `/api/comments/:id` | O (작성자) |
| DELETE | `/api/comments/:id` | O (작성자) |
| POST | `/api/upload` | O |

생성 성공은 201입니다. 지역 필터는 `GET /api/posts?region_id=1`입니다.

목록 응답 예:

```json
{
  "posts": [],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalCount": 0,
    "limit": 4
  }
}
```

## 화면

| 경로 | |
| --- | --- |
| `/` | 지도, 지역 후기, 인기글, 갤러리 |
| `/login` `/signup` `/forgot-password` | 계정 |
| `/write` | 후기 작성 (로그인) |
| `/posts/[id]` | 상세 + 댓글 |
| `/posts/[id]/edit` | 수정 (작성자) |

로그인하면 헤더에 후기 작성·로그아웃이 보입니다. 모바일은 Menu 사이드바입니다.

## 로컬에서 실행

Node.js 20+가 필요합니다. DB는 로컬 PostgreSQL 16을 켜거나, 운영과 같이 Supabase `DATABASE_URL`을 넣으면 됩니다.

### 1) 로컬 PostgreSQL을 쓸 때

```sql
CREATE USER appuser WITH PASSWORD 'apppassword';
CREATE DATABASE restaurant_board OWNER appuser;
```

`backend/sql/init.sql`과 같습니다.

### 2) 백엔드

```bash
cd backend
copy .env.example .env
npm install
npm run dev
```

`backend/.env` 예시:

```
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_USER=appuser
DB_PASSWORD=apppassword
DB_NAME=restaurant_board
JWT_SECRET=아무거나-긴-비밀키
```

Supabase에 붙이려면 `DB_*` 대신 아래를 씁니다.

```
DATABASE_URL=postgresql://...
DB_SSL=true
SUPABASE_URL=https://tdvlhjheapbpxumujmvd.supabase.co
SUPABASE_SERVICE_ROLE_KEY=서비스롤키
```

메일 인증을 쓰려면 `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`를 넣고, Brevo를 쓸 때는 인증한 발신 주소를 `SMTP_FROM`에 넣습니다.

확인: [http://localhost:4000/health](http://localhost:4000/health), [http://localhost:4000/api-docs](http://localhost:4000/api-docs)

### 3) 프론트엔드

```bash
cd frontend
copy .env.example .env.local
npm install
npm run dev
```

`frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:4000
```

브라우저: [http://localhost:3000](http://localhost:3000)

### Docker로 한 번에

프로젝트 루트에서 `docker compose up --build`  
프론트 3000, API 4000, Postgres 5432입니다.

## 폴더

```text
.
├── backend/
│   ├── server.js
│   ├── sql/
│   └── src/          config, controllers, middlewares, models, routes
├── frontend/
│   ├── app/          페이지
│   ├── components/
│   └── lib/          auth, API URL, 타입
└── docker-compose.yml
```

## 라이선스

개인 학습·포트폴리오 용도로 만들었습니다.
