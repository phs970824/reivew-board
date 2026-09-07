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

## Frontend

프론트는 Next.js App Router입니다. DB나 JWT 검증은 하지 않고, Express REST만 호출합니다. Redux, Zustand, React Query, Axios는 쓰지 않습니다.

### 구현

| 구분 | 실제 구성 |
| --- | --- |
| 라우팅 | `app/` 파일 기반. `/`, `/login`, `/signup`, `/forgot-password`, `/write`, `/posts/[id]`, `/posts/[id]/edit` |
| 서버 컴포넌트 | `layout.tsx`, 홈 `page.tsx`처럼 데이터 없이 뼈대만 그리는 페이지 |
| 클라이언트 컴포넌트 | 폼, 목록, 상세, 헤더. `"use client"` + `useState` / `useEffect` |
| 공통 UI | `Header`, `PostForm`, `PostCard`, `PaginationControls`, `PageLoading`, `PostNotFound` |
| 에디터 | `react-quill-new`. `PostForm`에서 `next/dynamic` + `ssr: false`로 로드 |
| 지도 | `RegionPicker`가 `/map.svg`를 가져와 클릭한 지역 id를 부모에 넘김 |
| 본문 HTML | 상세에서 `dangerouslySetInnerHTML`로 렌더. 그 전에 `isomorphic-dompurify`로 `script`/`iframe` 등 제거 (`lib/sanitize.ts`) |
| 스타일 | Tailwind v4, `app/globals.css`의 `.field-input`, `.btn-accent` 등. 본문 폭 720px, 홈은 md 이상 1100px |
| 반응형 | 헤더 데스크톱 링크 / 모바일 `Menu` 사이드바. `md:` 그리드로 지도·목록·인기글·갤러리 배치 |
| 타입 | `lib/types.ts`의 `PostSummary`, `PostDetail`, `Comment`, `Pagination` 등 |

작성·수정은 같은 `PostForm`을 씁니다. 등록은 `POST /api/posts` 후 `/posts/:id`로, 수정은 `PUT` 후 상세로 돌아갑니다.

이미지 버튼은 `POST /api/upload`로 Supabase URL을 받아 에디터에 `<img>`를 넣습니다. 대표 `image_url`은 프론트가 보내지 않고, 백엔드가 본문 HTML에서 첫 이미지를 뽑습니다.

조회수는 상세 진입 시 `POST /api/posts/:id/view`입니다. `lib/views.ts`의 `Set`으로 같은 탭에서 같은 글은 한 번만 올립니다.

### 상태 관리

전역 스토어는 없습니다. 로그인 사용자만 Context로 공유하고, 나머지는 화면 `useState`입니다.

**회원 (`AuthProvider` + `lib/auth-storage.ts`)**  
`layout.tsx`가 트리를 감쌉니다. `user` / `token`은 `localStorage`의 `auth_token`, `auth_user`를 읽고, `useSyncExternalStore`로 구독합니다. SSR 스냅샷은 `null`/`false`라 서버와 첫 클라이언트 렌더가 어긋나지 않습니다. `ready`가 `true`가 된 뒤에야 헤더와 가드가 로그인 여부를 보여 줍니다.

로그인 성공 시 `storeAuth`가 토큰과 `{ id, email, nickname }`을 저장하고 구독자에게 알립니다. 로그아웃은 `clearAuth`입니다.

**화면 로컬 상태**

| 화면 | 상태 |
| --- | --- |
| `HomeBoard` | 지역, 페이지, 후기/인기글/갤러리 목록, 각각 로딩 |
| 상세 | `post`, `notFound`, `error`, `loading`, `deleting` |
| 작성·수정 | 폼 필드, `submitting`, 수정은 `allowed` |
| 댓글 | 목록, 작성/수정 텍스트, `editingId` |
| 가입·비밀번호 찾기 | 인증 단계, 5분(`CODE_SECONDS`) 타이머 |

목록 데이터는 URL과 동기화하지 않습니다. 지도에서 지역을 바꾸면 `regionId`와 `page`만 바꿔 다시 `fetch`합니다.

### API 통신

베이스 URL은 `lib/api.ts`의 `NEXT_PUBLIC_API_URL`이고, 없으면 `http://127.0.0.1:4000`입니다. Windows에서 `localhost`가 IPv6로 빠지는 경우를 피하기 위해 `127.0.0.1`을 씁니다.

공통 클라이언트는 없습니다. 인증 API만 `auth-context.tsx`의 `request()`가 `POST` + JSON을 담당하고, 글·댓글·업로드는 각 컴포넌트가 `fetch`합니다.

| 구분 | 방식 |
| --- | --- |
| 조회 | `GET`, 헤더 없음 |
| 쓰기 | `Authorization: Bearer <token>` |
| 업로드 | `FormData` 필드명 `file`. `Content-Type`은 브라우저가 설정 |
| 목록 | `page`, `limit`, 선택 `region_id` |
| 인기글 | `GET /api/posts/popular?page=&limit=` |
| 갤러리 | `GET /api/posts/gallery` |

홈은 지역 후기 4개, 인기글 5개씩 페이지를 나눕니다. 인증 요청이 네트워크에서 실패하면 `request()`가 “서버에 연결하지 못했습니다. 백엔드가 실행 중인지 확인해 주세요.”를 던집니다.

### 인증

회원 JWT와 관리자 쿠키는 다릅니다.

**회원**  
1. 가입: 이메일 6자리 인증 → `signup` → `/login`  
2. 로그인: `POST /api/auth/login` → JWT(만료 1일, 서버 발급) + 유저를 `localStorage`에 저장 → `/`  
3. 이후 글쓰기·수정·삭제·댓글·이미지 업로드에 Bearer 토큰  
4. 프론트는 JWT를 풀지 않습니다. 작성자 여부는 응답의 `user_id`와 `user.id`를 비교합니다.

가드는 미들웨어가 아니라 클라이언트입니다.

- `/write`: `ready && !user`이면 `/login`으로 `replace`. 준비 전에는 `null`  
- `/posts/[id]/edit`: 비로그인이거나 `user.id !== post.user_id`이면 알림 후 `/`  
- 댓글 입력: 비로그인이면 textarea 비활성, “로그인 후 댓글을 작성할 수 있습니다”  
- 헤더: `ready` 전에는 버튼을 그리지 않음. 로그인 후 닉네임·후기 작성·로그아웃

토큰이 만료돼 401이 와도 자동 로그아웃은 없습니다. 실패한 요청의 `message`만 보여 줍니다.

**관리자 (`/admin/*`)**  
회원 JWT와 무관합니다. `frontend/proxy.ts`가 `/admin/login` 외 경로를 막고, `admin_auth` 쿠키(HMAC)가 맞을 때만 통과합니다. 비밀번호는 `ADMIN_PASSWORD`이고, 로그인/로그아웃은 `app/api/admin/*` Route Handler입니다. 공개 헤더에는 관리자 링크가 없습니다.

### 에러 처리

`error.tsx` / `not-found.tsx` 같은 App Router 경계는 없습니다. 화면마다 처리합니다.

**보내기 전**  
이메일 정규식(`EMAIL_PATTERN`), 비밀번호 8자, 닉네임 50자, 본문 HTML을 태그 제거한 뒤 빈 값인지(`htmlToPlainText`), 비밀번호 확인 일치.

**응답**  
`response.ok`가 아니면 `data.message`를 씁니다. 없으면 화면별 기본 문구입니다. 인증 `request()`는 연결 실패와 4xx/5xx를 `throw`하고, 페이지가 `catch`에서 빨간 글씨로 보여 줍니다.

**화면별**

| 상황 | 동작 |
| --- | --- |
| 글 404 | `PostNotFound` |
| 글 기타 실패 | 빨간 메시지 + 메인으로 |
| 댓글 실패 | 섹션 아래 빨간 메시지 |
| 수정 403 | 알림 후 `/` |
| 글/댓글 삭제 | `window.confirm` 후 실패 시 `alert` 또는 빨간 메시지 |
| 이미지 업로드 실패 | `window.alert` |
| 홈 목록 실패 | 빈 배열로 두고 “이 지역에 작성된 후기가 없습니다.” (실패와 빈 목록을 나누지 않음) |
| 조회수 API 실패 | 조회수는 올리지 않고, 글 읽기는 그대로 |

로딩은 `PageLoading` 또는 “불러오는 중...” 텍스트입니다. 버튼은 요청 중 `disabled`입니다. 상세 `fetch`는 `cancelled` 플래그로, 글 id가 바뀌면 이전 응답을 무시합니다.

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
│   ├── app/          페이지, 관리자 Route Handler
│   ├── components/   헤더, 홈 보드, 폼, 댓글, 지도
│   └── lib/          API URL, Auth Context, 타입, sanitize
└── docker-compose.yml
```

## 라이선스

개인 학습·포트폴리오 용도로 만들었습니다.
