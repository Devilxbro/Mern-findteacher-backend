// import nodemailer from "nodemailer";
// import envConfig from "../Config/env";
//
// const config = envConfig();
//
// export const transporter = nodemailer.createTransport({
//   service: "gmail", // or your email provider
//   auth: {
//     user: config.SMTP_USER, // e.g., your_email@gmail.com
//     pass: config.SMTP_PASS, // e.g., app password
//   },
// });
//
// export const sendVerificationEmail = async (to: string, otp: string) => {
//   const mailOptions = {
//     from: `"YourApp Support" <${config.SMTP_USER}>`,
//     to,
//     subject: "Your Verification Code",
//     html: `
//       <h2>Welcome to YourApp!</h2>
//       <p>Your OTP is:</p>
//       <h3 style="color:blue;">${otp}</h3>
//       <p>This code will expire in 10 minutes.</p>
//     `,
//   };
//
//   return transporter.sendMail(mailOptions);
// };
