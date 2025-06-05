const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify(function (error, success) {
  if (error) {
    console.error("Email configuration error:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

const sendEmailNotification = async (submission) => {
  try {
    const adminMailOptions = {
      from: `"Pune Community Hub" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: "New Team Interest Form Submission",
      html: `
        <h2>New Team Interest Form Submission</h2>
        <p><strong>Name:</strong> ${submission.userName}</p>
        <p><strong>Email:</strong> ${submission.userEmail}</p>
        <p><strong>Interest Area:</strong> ${submission.userInterest}</p>
        <p><strong>Submission Date:</strong> ${new Date(
          submission.submittedAt
        ).toLocaleString()}</p>
      `,
    };

    const userMailOptions = {
      from: `"Pune Community Hub" <${process.env.ADMIN_EMAIL}>`,
      to: submission.userEmail,
      subject: "Thank You for Your Interest - Pune Community Hub",
      html: `
        <h2>Welcome to Pune Community Hub!</h2>
        <p>Dear ${submission.userName},</p>
        <p>Thank you for your interest in joining our team as a ${submission.userInterest}.</p>
        <p>We have received your application and our team will review it shortly.</p>
        <p>We'll get back to you within 2-3 business days with next steps.</p>
        <br>
        <p>Best regards,</p>
        <p>Pune Community Hub Team</p>
      `,
    };

    const [adminResult, userResult] = await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(userMailOptions),
    ]);

    console.log("Admin email sent:", adminResult.messageId);
    console.log("User email sent:", userResult.messageId);

    return true;
  } catch (error) {
    console.error("Error sending email notifications:", error);
    throw new Error("Failed to send email notifications: " + error.message);
  }
};

const sendSubmissionNotification = async (submission) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: "New Speaker Submission Received",
    html: `
      <h2>New Speaker Submission Details</h2>
      <p><strong>Speaker Name:</strong> ${submission.fullName}</p>
      <p><strong>Email:</strong> ${submission.email}</p>
      <p><strong>Organization:</strong> ${submission.organization}</p>
      <p><strong>Talk Title:</strong> ${submission.talkTitle}</p>
      <p><strong>Talk Type:</strong> ${submission.talkType}</p>
      <p><strong>Talk Description:</strong></p>
      <p>${submission.talkDescription}</p>
      <p><strong>Previous Speaking Experience:</strong> ${
        submission.previousSpeakingExperience ? "Yes" : "No"
      }</p>
      <p><strong>Submission Date:</strong> ${new Date(
        submission.submittedAt
      ).toLocaleString()}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email notification sent successfully");
  } catch (error) {
    console.error("Error sending email notification:", error);
    throw new Error("Failed to send email notification");
  }
};

const sendSponsorNotification = async (submission) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: "New Sponsorship Request Received",
    html: `
      <h2>New Sponsorship Request Details</h2>
      <p><strong>Name:</strong> ${submission.name}</p>
      <p><strong>Email:</strong> ${submission.email}</p>
      <p><strong>Company:</strong> ${submission.company}</p>
      <p><strong>Phone:</strong> ${submission.phone}</p>
      <p><strong>Job Title:</strong> ${
        submission.jobTitle || "Not provided"
      }</p>
      <p><strong>Package:</strong> ${submission.package}</p>
      <p><strong>Additional Message:</strong></p>
      <p>${submission.message || "No additional message provided"}</p>
      <p>${submission.additionalOptions?.join(", ") || "None selected"}</p>
      <p><strong>Submission Date:</strong> ${new Date(
        submission.submittedAt
      ).toLocaleString()}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Sponsor email notification sent successfully");
  } catch (error) {
    console.error("Error sending sponsor email notification:", error);
    throw new Error("Failed to send sponsor email notification");
  }
};

module.exports = {
  sendEmailNotification,
  sendSubmissionNotification,
  sendSponsorNotification,
};
