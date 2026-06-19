/**
 * Utility functions for validating authentication inputs.
 */

/**
 * Validates an Indian phone number.
 * Allows optional "+91" or "91" prefix, followed by 10 digits starting with 6, 7, 8, or 9.
 * @param {string} phone 
 * @returns {boolean}
 */
export const validateIndianPhone = (phone) => {
  const cleanPhone = phone.replace(/[\s-]/g, '');
  const phoneRegex = /^(?:\+91|91)?[6-9]\d{9}$/;
  return phoneRegex.test(cleanPhone);
};

/**
 * Format phone to standard E.164 +91 format
 * @param {string} phone 
 * @returns {string}
 */
export const formatIndianPhone = (phone) => {
  const cleanPhone = phone.replace(/[\s-]/g, '');
  if (cleanPhone.startsWith('+91')) {
    return cleanPhone;
  }
  if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
    return `+${cleanPhone}`;
  }
  return `+91${cleanPhone}`;
};

/**
 * Validates standard email address formats.
 * @param {string} email 
 * @returns {boolean}
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validates password strength (minimum 6 characters).
 * @param {string} password 
 * @returns {boolean}
 */
export const validatePasswordStrength = (password) => {
  return password.length >= 6;
};
