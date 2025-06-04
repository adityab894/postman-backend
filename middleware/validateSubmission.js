const Joi = require('joi');

const submissionSchema = Joi.object({
  fullName: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Full name is required',
      'string.min': 'Full name must be at least 2 characters long',
      'string.max': 'Full name cannot exceed 100 characters'
    }),
  
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email address'
    }),
  
  organization: Joi.string()
    .max(200)
    .required()
    .messages({
      'string.empty': 'Organization is required',
      'string.max': 'Organization name cannot exceed 200 characters'
    }),
  
  talkTitle: Joi.string()
    .min(5)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Talk title is required',
      'string.min': 'Talk title must be at least 5 characters long',
      'string.max': 'Talk title cannot exceed 200 characters'
    }),
  
  talkType: Joi.string()
    .valid('technical', 'casestudy', 'workshop', 'lightning')
    .required()
    .messages({
      'any.only': 'Invalid talk type selected'
    }),
  
  talkDescription: Joi.string()
    .min(50)
    .max(2000)
    .required()
    .messages({
      'string.empty': 'Talk description is required',
      'string.min': 'Talk description must be at least 50 characters long',
      'string.max': 'Talk description cannot exceed 2000 characters'
    }),
  
  previousSpeakingExperience: Joi.boolean()
    .default(false),
  
  termsAccepted: Joi.boolean()
    .valid(true)
    .required()
    .messages({
      'any.only': 'Terms and conditions must be accepted'
    })
});

const validateSubmission = (req, res, next) => {
  const { error } = submissionSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));
    
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors
    });
  }
  
  next();
};

module.exports = validateSubmission; 