import nodemailer from "nodemailer";

let transporter = null;
let triedInit = false;

function getTransporter() {
  if(triedInit) return transporter;
  triedInit = true;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if(!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn(
      "Email provider not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env to send real OTP emails."
    );
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });

  return transporter;
}

// Send a one-time password to the given email
export async function sendOtpEmail(email, otp) {
  const t = getTransporter();

  if(!t) {
    if(process.env.NODE_ENV !== "production") {
      console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
      return {
        delivered: false, 
        devMode: true
      };
    }
    throw new Error("Email provider not configured");
  }

  await t.sendMail({
    from: process.env.SMTP_FROM || '"Valentique" <no-reply@valentique.com>',
    to: email,
    subject: "Your Valentique verification code",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="font-weight: 300; letter-spacing: 0.05em;">Your verification code</h2>
        <p style="font-size: 32px; font-weight: 700; letter-spacing: 8px; margin: 24px 0;">${otp}</p>
        <p style="color: #666;">This code expires in ${Math.round(
          (parseInt(process.env.OTP_EXPIRY, 10) || 300) / 60,
        )} minutes. If you didn't request this, you can safely ignore this email.</p>
      </div>`,
  });

  return { delivered: true };
}