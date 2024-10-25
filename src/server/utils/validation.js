/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

export const isValidEmailAddress = emailAddress => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(emailAddress);
};

export const isValidPhoneNumber = phoneNumber => {
  const pattern = /^\+?[1-9]\d{1,14}$/;
  return pattern.test(phoneNumber);
};

export const isValidPasswordStrength = password => {
  const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;
  // at least 1 lower case
  // at least 1 upper case
  // at least 1 numeric
  // at least 8 characters in length
  return pattern.test(password);
};
