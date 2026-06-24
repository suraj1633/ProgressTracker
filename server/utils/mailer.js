import nodemailer from "nodemailer";

const sendWithBrevo = async (
  email,
  otp
) => {
  const apiKey =
    process.env.BREVO_API_KEY;

  if (!apiKey) {
    return false;
  }

  const senderEmail =
    process.env.BREVO_SENDER_EMAIL;

  if (!senderEmail) {
    throw new Error(
      "BREVO_SENDER_EMAIL is required when BREVO_API_KEY is set"
    );
  }

  const senderName =
    process.env.BREVO_SENDER_NAME ||
    "DSA Tracker";

  console.log(
    `Sending OTP email to ${email} through Brevo API`
  );

  const response = await fetch(
    "https://api.brevo.com/v3/smtp/email",
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: [
          {
            email,
          },
        ],
        subject:
          "Verify your DSA Tracker account",
        textContent: `Your verification code is ${otp}. It expires in 10 minutes.`,
      }),
    }
  );

  if (!response.ok) {
    const body =
      await response.text();

    throw new Error(
      `Brevo email failed (${response.status}): ${body}`
    );
  }

  return true;
};

const sendWithResend = async (
  email,
  otp
) => {
  const apiKey =
    process.env.RESEND_API_KEY;

  if (!apiKey) {
    return false;
  }

  const from =
    process.env.RESEND_FROM ||
    process.env.SMTP_FROM ||
    "DSA Tracker <onboarding@resend.dev>";

  console.log(
    `Sending OTP email to ${email} through Resend API`
  );

  const response = await fetch(
    "https://api.resend.com/emails",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        from,
        to: email,
        subject:
          "Verify your DSA Tracker account",
        text: `Your verification code is ${otp}. It expires in 10 minutes.`,
      }),
    }
  );

  if (!response.ok) {
    const body =
      await response.text();

    throw new Error(
      `Resend email failed (${response.status}): ${body}`
    );
  }

  return true;
};

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
    family: 4,
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
    console.log(
      `Email provider: ${
        process.env.BREVO_API_KEY
          ? "brevo"
          : process.env.RESEND_API_KEY
          ? "resend"
          : "smtp"
      }`
    );

    const sentWithBrevo =
      await sendWithBrevo(
        email,
        otp
      );

    if (sentWithBrevo) {
      return;
    }

    const sentWithResend =
      await sendWithResend(
        email,
        otp
      );

    if (sentWithResend) {
      return;
    }

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
