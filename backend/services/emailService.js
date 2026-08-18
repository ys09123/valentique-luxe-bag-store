// Resend HTTP API — Render blocks outbound SMTP ports (587/465),
// so we use Resend's REST API over HTTPS (port 443) instead.

const OTP_EXPIRY_MINUTES = Math.round(
  (parseInt(process.env.OTP_EXPIRY, 10) || 300) / 60,
);

/**
 * Send a one-time password to the given email via Resend HTTP API.
 */
export async function sendOtpEmail(email, otp) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
      return { delivered: false, devMode: true };
    }
    throw new Error("RESEND_API_KEY is not configured");
  }

  const from = process.env.EMAIL_FROM || "Valentique <onboarding@resend.dev>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Your Valentique verification code",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="font-weight: 300; letter-spacing: 0.05em;">Your verification code</h2>
          <p style="font-size: 32px; font-weight: 700; letter-spacing: 8px; margin: 24px 0;">${otp}</p>
          <p style="color: #666;">This code expires in ${OTP_EXPIRY_MINUTES} minutes. If you didn't request this, you can safely ignore this email.</p>
        </div>`,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend API error (${response.status}): ${body}`);
  }

  const data = await response.json();
  console.log("[Email] Sent via Resend, id:", data.id);
  return { delivered: true, id: data.id };
}