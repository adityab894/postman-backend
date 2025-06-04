const nodemailer = require('nodemailer');

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendSubmissionNotification = async (submission) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // Send to the same email as configured in .env
    subject: 'New Speaker Submission Received',
    html: `
      <h2>New Speaker Submission Details</h2>
      <p><strong>Speaker Name:</strong> ${submission.fullName}</p>
      <p><strong>Email:</strong> ${submission.email}</p>
      <p><strong>Organization:</strong> ${submission.organization}</p>
      <p><strong>Talk Title:</strong> ${submission.talkTitle}</p>
      <p><strong>Talk Type:</strong> ${submission.talkType}</p>
      <p><strong>Talk Description:</strong></p>
      <p>${submission.talkDescription}</p>
      <p><strong>Previous Speaking Experience:</strong> ${submission.previousSpeakingExperience ? 'Yes' : 'No'}</p>
      <p><strong>Submission Date:</strong> ${new Date(submission.submittedAt).toLocaleString()}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email notification sent successfully');
  } catch (error) {
    console.error('Error sending email notification:', error);
    throw new Error('Failed to send email notification');
  }
};

const sendSponsorNotification = async (submission) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: 'New Sponsorship Request Received',
    html: `
      <h2>New Sponsorship Request Details</h2>
      <p><strong>Name:</strong> ${submission.name}</p>
      <p><strong>Email:</strong> ${submission.email}</p>
      <p><strong>Company:</strong> ${submission.company}</p>
      <p><strong>Phone:</strong> ${submission.phone}</p>
      <p><strong>Job Title:</strong> ${submission.jobTitle || 'Not provided'}</p>
      <p><strong>Package:</strong> ${submission.package}</p>
      <p><strong>Additional Message:</strong></p>
      <p>${submission.message || 'No additional message provided'}</p>
      <p>${submission.additionalOptions?.join(', ') || 'None selected'}</p>
      <p><strong>Submission Date:</strong> ${new Date(submission.submittedAt).toLocaleString()}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Sponsor email notification sent successfully');
  } catch (error) {
    console.error('Error sending sponsor email notification:', error);
    throw new Error('Failed to send sponsor email notification');
  }
};

module.exports = {
  sendSubmissionNotification,
  sendSponsorNotification
}; 