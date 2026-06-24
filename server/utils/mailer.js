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

  const port =
    Number(SMTP_PORT);

  const secure =
    SMTP_SECURE
      ? SMTP_SECURE === "true"
      : port === 465;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure,
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
    tls: {
      minVersion: "TLSv1.2",
      rejectUnauthorized:
        process.env.SMTP_REJECT_UNAUTHORIZED !==
        "false",
    },
  });
};

export const sendOtpEmail =
  async (email, otp) => {
    const transporter =
      createTransporter();

    if (!transporter) {
      console.log(
        `OTP email not configured. OTP for ${email}: ${otp}`
      );

      return;
    }

    console.log(
      `Sending OTP email to ${email} through ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`
    );

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
