const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_ADDRESS,
    pass: process.env.GMAIL_PASSWORD
  }
});

const sendVerificationEmail = async (to, token) => {
  transporter.sendMail({
    to,
    from: `<no-reply>@${process.env.COMPANY_URL}`,
    subject: "Account Verification",
    html: `<p>please click on this link to verify your vblog account <a>${process.env.COMPANY_URL}/v1/auth/verify/${token}</a></p>`
  });
};

module.exports = {
  sendVerificationEmail
};
