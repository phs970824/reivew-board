const nodemailer = require("nodemailer");

function getMailerConfig() {
  const host = String(process.env.SMTP_HOST ?? "").trim();
  const port = Number(process.env.SMTP_PORT);
  const user = String(process.env.SMTP_USER ?? "").trim();
  const pass = String(process.env.SMTP_PASS ?? "").trim();

  if (!host || !port || !user || !pass) {
    return null;
  }

  return { host, port, user, pass };
}

function createTransporter() {
  const config = getMailerConfig();
  if (!config) {
    return null;
  }

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    requireTLS: config.port !== 465,
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 15_000,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });
}

async function sendVerificationEmail(to, code, { subject } = {}) {
  const transporter = createTransporter();
  const from = String(process.env.SMTP_FROM ?? process.env.SMTP_USER ?? "").trim();

  if (!transporter || !from) {
    const error = new Error("SMTP_NOT_CONFIGURED");
    error.code = "SMTP_NOT_CONFIGURED";
    throw error;
  }

  await transporter.sendMail({
    from,
    to,
    subject: subject || "[맛집 후기] 이메일 인증번호",
    text: `인증번호는 ${code} 입니다. 5분 안에 입력해 주세요.`,
    html: `<p>인증번호는 <strong>${code}</strong> 입니다.</p><p>5분 안에 입력해 주세요.</p>`,
  });
}

module.exports = { sendVerificationEmail };
