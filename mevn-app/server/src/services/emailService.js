import nodemailer from "nodemailer";


const createTransporter = () => {
  if (process.env.EMAIL_SERVICE === "gmail") {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  
  return null;
};


export const sendEmail = async ({ to, subject, html, text }) => {
  try {
  
    if (!process.env.EMAIL_USER) {
      console.log("--- Test Email ---");
      console.log("To:", to);
      console.log("Subject:", subject);
      console.log("Content:", text || html);
      return { success: true, message: "Email logged (development mode)" };
    }

    const transporter = createTransporter();
    
    if (!transporter) {
      throw new Error("Email transporter not configured");
    }

    const senderEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER;
    const displayName = process.env.EMAIL_DISPLAY_NAME || "EcoGo noreply";
    
    const mailOptions = {
      from: `"${displayName}" <${senderEmail}>`,
      to,
      subject,
      html,
      text: text || "Please open this email in a browser to view the content.",
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};


export const sendPasswordResetEmail = async (email, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10b981;">EcoGo - Password Reset</h2>
      <p>Hello,</p>
      <p>To reset your password, click the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" 
           style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p style="color: #666; word-break: break-all;">${resetLink}</p>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        This link will expire in 1 hour. If you didn't request this, please ignore this email.
      </p>
    </div>
  `;

  const text = `
EcoGo - Password Reset

Hello,

You requested to reset your password. Click the link below to reset it:

${resetLink}

This link will expire in 1 hour. If you didn't request this, please ignore this email.
  `;

  return await sendEmail({
    to: email,
    subject: "EcoGo - Password Reset Request",
    html,
    text,
  });
};

export const sendAccountSuspendedEmail = async (email, username) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10b981;">EcoGo - Account Suspended</h2>
      <p>Hello ${username || ""},</p>
      <p>Your account has been suspended by an administrator.</p>
      <p>If you believe this is a mistake, please contact support.</p>
    </div>
  `;

  const text = `
EcoGo - Account Suspended

Hello ${username || ""},

Your account has been suspended by an administrator.
If you believe this is a mistake, please contact support.
  `;

  return await sendEmail({
    to: email,
    subject: "EcoGo - Account Suspended",
    html,
    text,
  });
};

export const sendAccountReactivatedEmail = async (email, username) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10b981;">EcoGo - Account Reactivated</h2>
      <p>Hello ${username || ""},</p>
      <p>Your account has been reactivated. You can now access the platform again.</p>
      <p>If you have any questions, please contact support.</p>
    </div>
  `;

  const text = `
EcoGo - Account Reactivated

Hello ${username || ""},

Your account has been reactivated. You can now access the platform again.
If you have any questions, please contact support.
  `;

  return await sendEmail({
    to: email,
    subject: "EcoGo - Account Reactivated",
    html,
    text,
  });
};
