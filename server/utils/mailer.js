import nodemailer from "nodemailer";

const createTransporter = () => {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_SECURE,
  } = process.env;

  if (
    !SMTP_HOST ||
    !SMTP_PORT ||
    !SMTP_USER ||
    !SMTP_PASS
  ) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure:
      SMTP_SECURE === "true",
    connectionTimeout: Number(
      process.env.SMTP_CONNECTION_TIMEOUT_MS ||
        10000
    ),
    greetingTimeout: Number(
      process.env.SMTP_GREETING_TIMEOUT_MS ||
        10000
    ),
    socketTimeout: Number(
      process.env.SMTP_SOCKET_TIMEOUT_MS ||
        15000
    ),
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

export const sendOtpEmail =
  async (email, otp) => {
    const transporter =
      createTransporter();

    if (!transporter) {
      console.log(
        `OTP for ${email}: ${otp}`
      );

      return;
    }

    await transporter.sendMail({
      from:
        process.env.SMTP_FROM ||
        process.env.SMTP_USER,
      to: email,
      subject:
        "Verify your DSA Tracker account",
      text: `Your verification code is ${otp}. It expires in 10 minutes.`,
    });
  };
