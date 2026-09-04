const express = require("express");
const {
  login,
  resetPassword,
  sendPasswordReset,
  sendVerification,
  signup,
  verifyCode,
  verifyResetCode,
} = require("../controllers/authController");

const router = express.Router();

/**
 * @openapi
 * /api/auth/send-verification:
 *   post:
 *     tags: [Auth]
 *     summary: 이메일 인증번호 발송
 *     description: 6자리 인증번호를 생성해 5분간 유효하도록 저장한 뒤 SMTP로 발송합니다. 인증번호는 응답에 포함되지 않습니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: 인증번호 발송 성공
 *       400:
 *         description: 이메일 형식 오류 또는 이미 가입된 이메일
 *       500:
 *         description: SMTP 설정 오류 또는 발송 실패
 */
router.post("/send-verification", sendVerification);

/**
 * @openapi
 * /api/auth/verify-code:
 *   post:
 *     tags: [Auth]
 *     summary: 이메일 인증번호 확인
 *     description: 최신 인증번호를 조회하고, 일치 여부와 서버 expires_at 만료를 검증합니다. 성공 시 해당 코드는 재사용할 수 없습니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: 이메일 인증 성공
 *       400:
 *         description: 인증번호 불일치, 만료, 또는 재사용
 */
router.post("/verify-code", verifyCode);

/**
 * @openapi
 * /api/auth/send-password-reset:
 *   post:
 *     tags: [Auth]
 *     summary: 비밀번호 재설정 인증번호 발송
 *     description: 가입된 이메일로 6자리 인증번호를 5분간 유효하게 발송합니다. 인증번호는 응답에 포함되지 않습니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: 인증번호 발송 성공
 *       400:
 *         description: 이메일 형식 오류 또는 미가입 이메일
 *       500:
 *         description: SMTP 설정 오류 또는 발송 실패
 */
router.post("/send-password-reset", sendPasswordReset);

/**
 * @openapi
 * /api/auth/verify-reset-code:
 *   post:
 *     tags: [Auth]
 *     summary: 비밀번호 재설정 인증번호 확인
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: 인증 성공
 *       400:
 *         description: 인증번호 불일치, 만료, 또는 재사용
 */
router.post("/verify-reset-code", verifyResetCode);

/**
 * @openapi
 * /api/auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: 새 비밀번호 설정
 *     description: 비밀번호 재설정용 이메일 인증이 완료된 계정만 새 비밀번호로 변경할 수 있습니다. 비밀번호는 bcrypt로 해시 저장됩니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: 비밀번호 변경 성공
 *       400:
 *         description: 미인증, 미가입, 또는 비밀번호 형식 오류
 */
router.post("/reset-password", resetPassword);

/**
 * @openapi
 * /api/auth/signup:
 *   post:
 *     tags: [Auth]
 *     summary: 회원가입
 *     description: 이메일 인증이 완료된 주소만 가입할 수 있습니다. 비밀번호는 bcrypt로 해시 저장되며 is_verified는 true로 설정됩니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, nickname]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               nickname:
 *                 type: string
 *                 example: 맛집탐험가
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *       400:
 *         description: 잘못된 요청, 이메일 중복, 또는 이메일 미인증
 */
router.post("/signup", signup);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: 로그인
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: 로그인 성공, JWT와 유저 정보 반환
 *       400:
 *         description: 이메일 또는 비밀번호 오류
 *       403:
 *         description: 이메일 인증이 필요한 계정
 */
router.post("/login", login);

module.exports = router;
