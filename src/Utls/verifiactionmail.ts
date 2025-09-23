// src/Services/EmailTemplates.ts

export const PasswordResetTemplate = (firstName: string, resetLink: string) => `
<div style="font-family: Arial, sans-serif; line-height: 1.5;">
  <h2>Hello ${firstName},</h2>
  <p>You requested to reset your password. Click the link below to reset it:</p>
  <p><a href="${resetLink}" style="color: #1a73e8;">Reset Password</a></p>
  <p>If you did not request this, please ignore this email or contact support.</p>
  <hr/>
  <p style="font-size: 0.9em; color: gray;">&copy; ${new Date().getFullYear()} My App. All rights reserved.</p>
</div>
`;

export const PasswordResetSuccessTemplate = (firstName: string) => `
<div style="font-family: Arial, sans-serif; line-height: 1.5;">
  <h2>Hello ${firstName},</h2>
  <p>Your password has been successfully reset.</p>
  <p>If you did not perform this action, please contact support immediately.</p>
  <hr/>
  <p style="font-size: 0.9em; color: gray;">&copy; ${new Date().getFullYear()} My App. All rights reserved.</p>
</div>
`;
