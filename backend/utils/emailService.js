const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendQuizPublishedEmail = async (students, quizDetails) => {
  if (!students || students.length === 0) return;

  const studentEmails = students.map(student => student.email).join(',');

  const mailOptions = {
    from: `"Quiz Platform" <${process.env.SMTP_USER}>`,
    to: studentEmails,
    subject: `New Quiz Published: ${quizDetails.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <h2 style="color: #333;">New Quiz Alert!</h2>
        <p>Hello Students,</p>
        <p>A new quiz titled <strong>"${quizDetails.title}"</strong> has just been published.</p>
        <p><strong>Description:</strong> ${quizDetails.description || 'No description provided.'}</p>
        <p>Log in to the portal to take the quiz now.</p>
        <br>
        <p>Best regards,</p>
        <p>Quiz Platform Team</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = { sendQuizPublishedEmail };
