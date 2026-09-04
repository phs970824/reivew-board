# 맛동네

지역별 맛집 후기를 공유하는 게시판입니다.

프론트엔드(Next.js)를 중심으로, 로그인과 CRUD가 백엔드·데이터베이스까지 어떻게 이어지는지 구현한 학습용 웹 서비스입니다.

- 프론트엔드: http://localhost:3000
- API: http://localhost:4000
- Swagger: http://localhost:4000/api-docs
- 저장소: https://github.com/phs970824/reivew-board

---

## 1. 과제 요구사항 대응

평가는 **프론트엔드 구현 완성도**와 **전체 흐름 이해**가 중심입니다. 아래 표는 과제 항목과 실제 구현을 1:1로 맞춘 것입니다.

| 항목 | 필수 | 구현 |
| --- | --- | --- |
| Frontend | O | Next.js App Router. 메인, 로그인/회원가입, 글쓰기/수정, 상세, 댓글 UI |
| Backend | O | Node.js + Express. API 제공, JWT 인증, 비즈니스 로직, PostgreSQL 접근 |
| Database | O | PostgreSQL. `users`, `posts`, `comments` + `regions` 관계(FK) |
| REST API | O | 자원 중심 URL (`/api/posts`, `/api/comments/:id`) + HTTP 메서드 |
| Swagger | 선택 | http://localhost:4000/api-docs |
| Docker | 선택 | `docker-compose.yml`로 FE / API / PostgreSQL 컨테이너 실행 |
| GitHub | 선택 | Git으로 버전 관리, GitHub 원격 저장소 사용 |
| Cloud Server | 선택 | 대표 이미지는 Supabase Storage. 앱 서버는 로컬(또는 Docker) 실행 |

과제에서 말하는 핵심 흐름은 아래 한 줄입니다.

> 회원가입/로그인 → JWT 저장 → 글/댓글 작성 → API가 DB에 저장 → 목록/상세가 DB를 다시 읽어 화면에 그린다.

그 외 기능(지도 필터, 갤러리, 이메일 인증, 비밀번호 찾기, 페이지네이션)은 과제 문구의 **자유 구현**에 해당하며, 필수 평가 범위를 대체하지 않습니다.

---

## 2. 서비스 구조

```text
브라우저 (Next.js :3000)
        │  REST (JSON) + Authorization: Bearer <JWT>
        ▼
Express API (:4000)
        │
        ├── PostgreSQL  (users / posts / comments / regions)
        ├── Supabase Storage  (게시글 이미지 업로드, 선택)
        └── SMTP  (회원가입·비밀번호 찾기 인증번호, 선택)
```

역할 분리:

- **Frontend**: 화면, 라우팅, 로그인 상태(`localStorage`의 JWT), 게시판 UI
- **Backend**: REST API, JWT 검증, 작성자 인가, bcrypt 해시, SQL 조회/저장
- **Database**: 사용자·게시글·댓글 영속 저장과 FK 관계

프론트는 DB에 직접 붙지 않습니다. 모든 생성/수정/삭제는 API를 통합니다.

---

## 3. 핵심 데이터 흐름 (평가 포인트)

### 3.1 회원가입

1. 이메일로 6자리 인증번호 요청 → `POST /api/auth/send-verification`
2. 인증번호 확인 → `POST /api/auth/verify-code`
3. 비밀번호는 bcrypt로 해시되어 `users`에 저장 → `POST /api/auth/signup`
4. 이메일은 UNIQUE, 인증된 계정만 `is_verified = true`

### 3.2 로그인

1. `POST /api/auth/login`에 이메일/비밀번호 전달
2. 서버가 bcrypt로 비교한 뒤 JWT 발급 (만료 1일)
3. 프론트는 토큰과 사용자 정보를 `localStorage`에 저장
4. 이후 글쓰기/댓글/수정/삭제 요청 헤더: `Authorization: Bearer <token>`

상태 관리 라이브러리(Zustand 등)는 쓰지 않습니다. `AuthProvider` + `localStorage`만 사용합니다.

### 3.3 게시글 CRUD

| 동작 | 화면 | API | DB |
| --- | --- | --- | --- |
| 목록 | `/` | `GET /api/posts?page=&limit=&region_id=` | `posts` JOIN `users`, `regions` |
| 상세 | `/posts/[id]` | `GET /api/posts/:id` | 단건 조회 |
| 작성 | `/write` | `POST /api/posts` (JWT) | `INSERT posts` |
| 수정 | `/posts/[id]/edit` | `PUT /api/posts/:id` (JWT + 작성자) | `UPDATE posts` |
| 삭제 | 상세 페이지 | `DELETE /api/posts/:id` (JWT + 작성자) | `DELETE posts` |

인가:

- 토큰 없음 → **401**
- 글이 없음 → **404**
- 로그인했지만 작성자가 아님 → **403**

작성 성공 시 메인으로 보내지 않고 해당 글 상세(`/posts/:id`)로 이동합니다.

### 3.4 댓글 CRUD

게시글 상세 하단에 댓글이 붙습니다.

- 목록: `GET /api/posts/:postId/comments` (작성자 닉네임 JOIN)
- 작성: `POST /api/posts/:postId/comments` (JWT)
- 수정/삭제: `PUT|DELETE /api/comments/:id` (JWT + 댓글 작성자만, 아니면 403)
- 게시글이 삭제되면 댓글도 함께 삭제 (`ON DELETE CASCADE`)

---

## 4. 기술 스택

| 구분 | 선택 | 이유 |
| --- | --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS | 과제 지정 프레임워크(Next). 게시판 화면과 로그인 상태 관리 |
| Backend | Node.js, Express | 과제 지정 백엔드(Node) + REST API(Express) |
| Database | PostgreSQL 16 | 과제 지정 RDB. 사용자/게시글/댓글 관계형 설계 |
| Auth | JWT + bcrypt | 세션 서버 없이 토큰 인증. 비밀번호는 평문 저장하지 않음 |
| API 문서 | swagger-jsdoc, swagger-ui-express | `/api-docs`에서 엔드포인트 확인 |
| 에디터 | react-quill-new | 후기 본문(이미지 포함) 작성 |
| 이미지 | Supabase Storage | 에디터 이미지 업로드 |

---

## 5. 데이터베이스 설계

PostgreSQL 데이터베이스 이름: `restaurant_board`

```text
users 1 ─── N posts 1 ─── N comments
               │
               N
            regions
```

| 테이블 | 역할 | 관계 |
| --- | --- | --- |
| `users` | 회원. email UNIQUE, password(hash), nickname, is_verified | posts/comments의 작성자 |
| `regions` | 서울, 경기, 강원, 충청, 전라, 경상, 제주 | posts.region_id FK |
| `posts` | 후기. restaurant_name, title, content, image_url | user_id, region_id FK. 사용자 삭제 시 CASCADE |
| `comments` | 댓글. content | post_id, user_id FK. 글/사용자 삭제 시 CASCADE |
| `email_verifications` | 이메일 인증번호 (가입/비밀번호 찾기) | 보조 테이블 |

DDL은 `backend/sql/`에 있습니다. 백엔드 기동 시 테이블이 없으면 자동으로 생성합니다.

---

## 6. REST API

기본 URL: `http://localhost:4000`

인증이 필요한 요청은 `Authorization: Bearer <JWT>`를 붙입니다.

### Auth

| Method | Path | 설명 | 인증 |
| --- | --- | --- | --- |
| POST | `/api/auth/send-verification` | 가입 인증번호 발송 | X |
| POST | `/api/auth/verify-code` | 인증번호 확인 | X |
| POST | `/api/auth/signup` | 회원가입 | X |
| POST | `/api/auth/login` | 로그인, JWT 발급 | X |
| POST | `/api/auth/send-password-reset` | 비밀번호 찾기 인증번호 | X |
| POST | `/api/auth/verify-reset-code` | 비밀번호 찾기 코드 확인 | X |
| POST | `/api/auth/reset-password` | 비밀번호 재설정 | X |

### Posts / Regions

| Method | Path | 설명 | 인증 |
| --- | --- | --- | --- |
| GET | `/api/regions` | 지역 목록 | X |
| GET | `/api/posts` | 게시글 목록. `page`, `limit`, `region_id` | X |
| GET | `/api/posts/popular` | 인기글 목록 (페이징) | X |
| GET | `/api/posts/gallery` | 사진 있는 최신 글 9개 | X |
| GET | `/api/posts/:id` | 게시글 상세 | X |
| POST | `/api/posts` | 게시글 작성 | O |
| PUT | `/api/posts/:id` | 게시글 수정 (작성자만) | O |
| DELETE | `/api/posts/:id` | 게시글 삭제 (작성자만) | O |

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

지역 필터는 `/api/posts/region/1` 같은 별도 URL이 아니라 `GET /api/posts?region_id=1`입니다.

### Comments / Upload

| Method | Path | 설명 | 인증 |
| --- | --- | --- | --- |
| GET | `/api/posts/:postId/comments` | 댓글 목록 | X |
| POST | `/api/posts/:postId/comments` | 댓글 작성 | O |
| PUT | `/api/comments/:id` | 댓글 수정 (작성자만) | O |
| DELETE | `/api/comments/:id` | 댓글 삭제 (작성자만) | O |
| POST | `/api/upload` | 이미지 업로드 | O |

상태 코드 규칙: 생성 성공 201, 권한 없음 401, 남의 글/댓글 403, 없는 자원 404.

문서 UI: [http://localhost:4000/api-docs](http://localhost:4000/api-docs)

---

## 7. 프론트엔드 화면

| 경로 | 설명 |
| --- | --- |
| `/` | 메인. 지역 지도 + 선택 지역 후기 + 인기글 + 사진 갤러리 |
| `/login` | 로그인 |
| `/signup` | 회원가입 (이메일 인증 포함) |
| `/forgot-password` | 비밀번호 찾기 |
| `/write` | 후기 작성 (로그인 필요) |
| `/posts/[id]` | 게시글 상세 + 댓글 |
| `/posts/[id]/edit` | 게시글 수정 (작성자만) |

로그인 상태:

- 헤더에 후기 작성 / 닉네임 / 로그아웃 (모바일은 Menu 사이드바)
- 비로그인 시 로그인 / 회원가입
- 본인 글에만 수정·삭제가 보입니다.

---

## 8. 실행 방법

필요 환경: Node.js 20+, PostgreSQL 16

### 8.1 데이터베이스

PostgreSQL에서 사용자와 DB를 만듭니다. (`backend/sql/init.sql`과 동일)

```sql
CREATE USER appuser WITH PASSWORD 'apppassword';
CREATE DATABASE restaurant_board OWNER appuser;
```

테이블은 백엔드 시작 시 자동 생성됩니다. 수동으로 넣으려면 `backend/sql/`의 SQL을 실행하면 됩니다.

### 8.2 백엔드

```bash
cd backend
copy .env.example .env
npm install
npm run dev
```

`backend/.env`에서 확인할 값:

- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`
- (선택) `SMTP_USER`, `SMTP_PASS` — 이메일 인증
- (선택) `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — 이미지 업로드

실행 확인:

- http://localhost:4000/health
- http://localhost:4000/api-docs

### 8.3 프론트엔드

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

브라우저: http://localhost:3000

### 8.4 Docker (선택)

프로젝트 루트:

```bash
docker compose up --build
```

프론트 3000, API 4000, PostgreSQL 5432로 올라갑니다.

---

## 9. 폴더 구조

```text
study/
├── backend/
│   ├── server.js              # Express 진입점, 테이블 준비
│   ├── sql/                   # users, posts, comments, regions DDL
│   └── src/
│       ├── config/            # DB, Swagger, 메일
│       ├── controllers/       # 인증, 게시글, 댓글 로직
│       ├── middlewares/auth.js
│       ├── models/            # PostgreSQL 쿼리
│       └── routes/            # REST 라우트 + Swagger 주석
├── frontend/
│   ├── app/                   # Next.js 페이지 (/, /login, /posts/[id] …)
│   ├── components/            # Header, 지도, 목록, 에디터, 댓글
│   └── lib/                   # auth-context, API URL, 타입
└── docker-compose.yml
```

---

## 10. 추가 구현 (필수 평가 범위 밖)

필수 CRUD와 별도로 아래를 넣었습니다.

- 지역 지도로 `region_id` 필터
- 서버 페이지네이션 (지역 목록 4개, 인기글 5개)
- 사진 갤러리 3x3
- 회원가입 이메일 인증, 비밀번호 찾기
- 모바일 헤더 사이드 메뉴

없어도 로그인·글·댓글 흐름은 동작합니다.

---

## 11. 로그인 없이 확인할 수 있는 것

- 메인 목록, 지역 필터, 인기글, 갤러리
- 게시글 상세와 댓글 목록
- Swagger 문서

로그인이 필요한 것:

- 후기 작성 / 수정 / 삭제
- 댓글 작성 / 수정 / 삭제
- 이미지 업로드
