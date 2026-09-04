const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createUser, findByEmail } = require("../models/user");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

async function signup(req, res) {
  const email = String(req.body.email ?? "").trim();
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

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({ email, passwordHash, nickname });

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

module.exports = { signup, login };
