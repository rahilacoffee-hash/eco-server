import { BrevoClient } from "@getbrevo/brevo";

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

export const sendVerificationEmail = async ({
  email,
  name,
  verificationToken,
}) => {
  const senderEmail = process.env.EMAIL_FROM?.trim();

  if (!senderEmail) {
    throw new Error("EMAIL_SENDER_NOT_CONFIGURED");
  }

  const verificationUrl =
    `${process.env.CLIENT_URL}/verify-email?token=${encodeURIComponent(
      verificationToken
    )}`;

  const sendSmtpEmail = {
    sender: {
      name: process.env.EMAIL_FROM_NAME || "Ecohome Concepts",
      email: senderEmail,
    },
    to: [
      {
        email,
        name,
      },
    ],
    subject: "Verify your Ecohome Concepts account",
    htmlContent: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Verify your email</title>
      </head>

      <body
        style="
          margin: 0;
          padding: 0;
          background: #f5f5f5;
          font-family: Arial, Helvetica, sans-serif;
        "
      >
        <div style="padding: 40px 20px;">
          <div
            style="
              max-width: 600px;
              margin: 0 auto;
              background: #ffffff;
              padding: 40px;
              border-radius: 16px;
            "
          >

            <h1
              style="
                margin: 0 0 20px;
                color: #102a72;
                font-size: 28px;
              "
            >
              Welcome to Ecohome Concepts
            </h1>

            <p
              style="
                color: #444;
                font-size: 16px;
                line-height: 1.6;
              "
            >
              Hello ${name},
            </p>

            <p
              style="
                color: #444;
                font-size: 16px;
                line-height: 1.6;
              "
            >
              Please verify your email address to activate your
              Ecohome Concepts admin account.
            </p>

            <div style="margin: 30px 0;">
              <a
                href="${verificationUrl}"
                style="
                  display: inline-block;
                  padding: 14px 24px;
                  background: #73b72b;
                  color: #ffffff;
                  text-decoration: none;
                  border-radius: 8px;
                  font-weight: 600;
                "
              >
                Verify Email
              </a>
            </div>

            <p
              style="
                color: #666;
                font-size: 14px;
                line-height: 1.6;
              "
            >
              This verification link will expire in 30 minutes.
            </p>

            <p
              style="
                color: #666;
                font-size: 14px;
                line-height: 1.6;
              "
            >
              If you did not request this account, you can safely
              ignore this email.
            </p>

            <hr
              style="
                margin: 30px 0;
                border: none;
                border-top: 1px solid #eeeeee;
              "
            />

            <p
              style="
                margin: 0;
                color: #999;
                font-size: 12px;
              "
            >
              © ${new Date().getFullYear()} Ecohome Concepts.
              All rights reserved.
            </p>

          </div>
        </div>
      </body>
    </html>
    `,
  };

  try {
    const response = await brevo.transactionalEmails.sendTransacEmail(
      sendSmtpEmail
    );

    console.log(
      `📧 Verification email sent to ${email}`
    );

    return response;
  } catch (error) {
    console.error(
      "Brevo email error:",
      error?.response?.body || error
    );

    throw new Error("Failed to send verification email");
  }
};

export const sendContactReplyEmail = async ({ email, name, subject, message }) => {
  const senderEmail = process.env.EMAIL_FROM?.trim();

  if (!senderEmail) {
    throw new Error("EMAIL_SENDER_NOT_CONFIGURED");
  }

  try {
    return await brevo.transactionalEmails.sendTransacEmail({
      sender: { name: process.env.EMAIL_FROM_NAME || "Ecohome Concepts", email: senderEmail },
      to: [{ email, name }],
      subject,
      textContent: `Hello ${name},\n\n${message}`,
    });
  } catch (error) {
    const providerError = error?.response?.body || error?.message || error;
    console.error("Contact reply email error:", providerError);
    throw new Error("EMAIL_DELIVERY_FAILED");
  }
};
