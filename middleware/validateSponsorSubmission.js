const validateSponsorSubmission = (req, res, next) => {
  const { name, email, company, phone, package: sponsorPackage } = req.body;

  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name is required and must be at least 2 characters long' });
  }

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }

  if (!company || company.trim().length < 2) {
    errors.push({ field: 'company', message: 'Company name is required and must be at least 2 characters long' });
  }

  if (!phone || !/^\+?[\d\s-]{10,}$/.test(phone)) {
    errors.push({ field: 'phone', message: 'Please enter a valid phone number' });
  }

  if (!sponsorPackage || !['Gold', 'Silver', 'Bronze', 'Community'].includes(sponsorPackage)) {
    errors.push({ field: 'package', message: 'Please select a valid sponsorship package' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors
    });
  }

  next();
};

module.exports = validateSponsorSubmission; 