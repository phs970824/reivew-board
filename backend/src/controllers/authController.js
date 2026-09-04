const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createUser, findByEmail, updatePasswordByEmail } = require("../models/user");
const {
  PURPOSE_PASSWORD_RESET,
  PURPOSE_SIGNUP,
  createVerification,
  deleteByEmail,
  findLatestByEmail,
  findVerifiedByEmail,
  invalidateByEmail,
  markUsed,
} = require("../models/emailVerification");
const { sendVerificationEmail } = require("../config/mailer");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_TTL_MS = 5 * 60 * 1000;

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );
}

function readEmail(value) {
  return String(value ?? "").trim().toLowerCase();
}

function generateCode() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

function smtpFailResponse(res, error) {
  if (error.code === "SMTP_NOT_CONFIGURED") {
    return res.status(500).json({
      message:
        "이메일 발송 설정이 되어 있지 않습니다. backend/.env의 SMTP_USER와 SMTP_PASS를 입력한 뒤 백엔드를 재시작해 주세요.",
    });
  }
  console.error("인증 메일 발송 실패:", error);
  return res.status(500).json({ message: "인증번호 발송 중 오류가 발생했습니다." });
}

async function issueCode({ email, purpose, subject }) {
  const code = generateCode();
  const expiresAt = new Date(Date.now() + CODE_TTL_MS);
  await invalidateByEmail(email, purpose);
  await createVerification({ email, code, expiresAt, purpose });
  try {
    await sendVerificationEmail(email, code, { subject });
  } catch (error) {
    await invalidateByEmail(email, purpose);
    throw error;
  }
}

async function confirmCode({ email, code, purpose }) {
  const latest = await findLatestByEmail(email, purpose);
  if (!latest) {
    return { ok: false, message: "인증번호 발송을 먼저 진행해 주세요." };
  }
  if (latest.code !== code) {
    return { ok: false, message: "인증번호가 올바르지 않습니다." };
  }
  if (new Date(latest.expires_at).getTime() <= Date.now()) {
    return { ok: false, message: "인증번호가 만료되었습니다." };
  }
  if (latest.used_at) {
    return { ok: false, message: "이미 사용된 인증번호입니다." };
  }
  const marked = await markUsed(latest.id);
  if (!marked) {
    return { ok: false, message: "이미 사용된 인증번호입니다." };
  }
  return { ok: true };
}

async function sendVerification(req, res) {
  const email = readEmail(req.body.email);

  if (!email) {
    return res.status(400).json({ message: "이메일을 입력해 주세요." });
  }

  if (!EMAIL_PATTERN.test(email)) {
    return res.status(400).json({ message: "이메일 형식이 올바르지 않습니다." });
  }

  try {
    const existing = await findByEmail(email);
    if (existing) {
      return res.status(400).json({ message: "이미 사용 중인 이메일입니다." });
    }

    await issueCode({
      email,
      purpose: PURPOSE_SIGNUP,
      subject: "[맛집 후기] 이메일 인증번호",
    });

    return res.status(200).json({ message: "인증번호를 발송했습니다." });
  } catch (error) {
    return smtpFailResponse(res, error);
  }
}

async function verifyCode(req, res) {
  const email = readEmail(req.body.email);
  const code = String(req.body.code ?? "").trim();

  if (!email || !code) {
    return res.status(400).json({ message: "이메일과 인증번호를 입력해 주세요." });
  }

  if (!EMAIL_PATTERN.test(email)) {
    return res.status(400).json({ message: "이메일 형식이 올바르지 않습니다." });
  }

  if (!/^\d{6}$/.test(code)) {
    return res.status(400).json({ message: "인증번호는 6자리 숫자입니다." });
  }

  try {
    const result = await confirmCode({ email, code, purpose: PURPOSE_SIGNUP });
    if (!result.ok) {
      return res.status(400).json({ message: result.message });
    }
    return res.status(200).json({ message: "이메일 인증이 완료되었습니다." });
  } catch (error) {
    console.error("인증번호 확인 실패:", error);
    return res.status(500).json({ message: "인증번호 확인 중 오류가 발생했습니다." });
  }
}

async function sendPasswordReset(req, res) {
  const email = readEmail(req.body.email);

  if (!email) {
    return res.status(400).json({ message: "이메일을 입력해 주세요." });
  }

  if (!EMAIL_PATTERN.test(email)) {
    return res.status(400).json({ message: "이메일 형식이 올바르지 않습니다." });
  }

  try {
    const existing = await findByEmail(email);
    if (!existing) {
      return res.status(400).json({ message: "가입되지 않은 이메일입니다." });
    }

    await issueCode({
      email,
      purpose: PURPOSE_PASSWORD_RESET,
      subject: "[맛집 후기] 비밀번호 재설정 인증번호",
    });

    return res.status(200).json({ message: "인증번호를 발송했습니다." });
  } catch (error) {
    return smtpFailResponse(res, error);
  }
}

async function verifyResetCode(req, res) {
  const email = readEmail(req.body.email);
  const code = String(req.body.code ?? "").trim();

  if (!email || !code) {
    return res.status(400).json({ message: "이메일과 인증번호를 입력해 주세요." });
  }

  if (!EMAIL_PATTERN.test(email)) {
    return res.status(400).json({ message: "이메일 형식이 올바르지 않습니다." });
  }

  if (!/^\d{6}$/.test(code)) {
    return res.status(400).json({ message: "인증번호는 6자리 숫자입니다." });
  }

  try {
    const existing = await findByEmail(email);
    if (!existing) {
      return res.status(400).json({ message: "가입되지 않은 이메일입니다." });
    }

    const result = await confirmCode({ email, code, purpose: PURPOSE_PASSWORD_RESET });
    if (!result.ok) {
      return res.status(400).json({ message: result.message });
    }
    return res.status(200).json({ message: "이메일 인증이 완료되었습니다." });
  } catch (error) {
    console.error("비밀번호 재설정 인증 실패:", error);
    return res.status(500).json({ message: "인증번호 확인 중 오류가 발생했습니다." });
  }
}

async function resetPassword(req, res) {
  const email = readEmail(req.body.email);
  const password = String(req.body.password ?? "");

  if (!email || !password) {
    return res.status(400).json({ message: "이메일과 새 비밀번호를 입력해 주세요." });
  }

  if (!EMAIL_PATTERN.test(email)) {
    return res.status(400).json({ message: "이메일 형식이 올바르지 않습니다." });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: "비밀번호는 8자 이상이어야 합니다." });
  }

  try {
    const existing = await findByEmail(email);
    if (!existing) {
      return res.status(400).json({ message: "가입되지 않은 이메일입니다." });
    }

    const verified = await findVerifiedByEmail(email, PURPOSE_PASSWORD_RESET);
    if (!verified) {
      return res.status(400).json({ message: "이메일 인증이 필요합니다." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await updatePasswordByEmail(email, passwordHash);
    await deleteByEmail(email, PURPOSE_PASSWORD_RESET);

    return res.status(200).json({ message: "비밀번호가 변경되었습니다." });
  } catch (error) {
    console.error("비밀번호 재설정 실패:", error);
    return res.status(500).json({ message: "비밀번호 변경 중 오류가 발생했습니다." });
  }
}

async function signup(req, res) {
  const email = readEmail(req.body.email);
  const password = String(req.body.password ?? "");
  const nickname = String(req.body.nickname ?? "").trim();

  if (!email || !password || !nickname) {
    return res.status(400).json({ message: "이메일, 비밀번호, 닉네임을 모두 입력해 주세요." });
  }

  if (!EMAIL_PATTERN.test(email)) {
    return res.status(400).json({ message: "이메일 형식이 올바르지 않습니다." });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: "비밀번호는 8자 이상이어야 합니다." });
  }

  if (nickname.length > 50) {
    return res.status(400).json({ message: "닉네임은 50자 이하여야 합니다." });
  }

  try {
    const existing = await findByEmail(email);
    if (existing) {
      return res.status(400).json({ message: "이미 사용 중인 이메일입니다." });
    }

    const verified = await findVerifiedByEmail(email, PURPOSE_SIGNUP);
    if (!verified) {
      return res.status(400).json({ message: "이메일 인증이 필요합니다." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({ email, passwordHash, nickname });
    await deleteByEmail(email, PURPOSE_SIGNUP);

    return res.status(201).json({
      message: "회원가입이 완료되었습니다.",
      user,
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({ message: "이미 사용 중인 이메일입니다." });
    }
    console.error("회원가입 실패:", error);
    return res.status(500).json({ message: "회원가입 처리 중 오류가 발생했습니다." });
  }
}

async function login(req, res) {
  const email = String(req.body.email ?? "").trim();
  const password = String(req.body.password ?? "");

  if (!email || !password) {
    return res.status(400).json({ message: "이메일과 비밀번호를 입력해 주세요." });
  }

  try {
    const user = await findByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }

    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      return res.status(400).json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }

    if (!user.is_verified) {
      return res.status(403).json({ message: "이메일 인증이 필요합니다." });
    }

    const token = signToken(user);

    return res.status(200).json({
      message: "로그인에 성공했습니다.",
      token,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
      },
    });
  } catch (error) {
    console.error("로그인 실패:", error);
    return res.status(500).json({ message: "로그인 처리 중 오류가 발생했습니다." });
  }
}

module.exports = {
  signup,
  login,
  sendVerification,
  verifyCode,
  sendPasswordReset,
  verifyResetCode,
  resetPassword,
};
