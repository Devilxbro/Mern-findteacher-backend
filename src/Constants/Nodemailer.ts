import nodemailer from "nodemailer";

interface MailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: {
    filename: string;
    path: string;
  }[];
}

class Mailer {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendMail(options: MailOptions) {
    try {
      const info = await this.transporter.sendMail({
        from: `"${process.env.MAIL_FROM_NAME || "My App"}" <${process.env.SMTP_USER}>`,
        to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      });

      console.log("Email sent:", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("Email sending failed:", error);
      return { success: false, error };
    }
  }
}

export default new Mailer();
