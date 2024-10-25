/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

const formatSum = (sum, thouMark, decimalMark) => {
  // convert to set decimal places
  const decimalPlaces = 2;
  const sumFixed = parseFloat(sum).toFixed(decimalPlaces);

  // insert thousands separator
  const parts = sumFixed.toString().split('.');
  const pattern = /\B(?=(\d{3})+(?!\d))/g;
  const thouChar = thouMark === 'comma' ? ',' : ' ';
  parts[0] = parts[0].replace(pattern, thouChar);
  let sum2 = parts.join('.');

  // change default decimal separator, if necessary
  if (decimalMark === 'comma') {
    const decimalChar = ',';
    sum2 = sum2.substring(0, sum2.length - decimalPlaces - 1) + decimalChar + sum2.substring(sum2.length - decimalPlaces, sum2.length);
  }

  return sum2;
};

export default formatSum;
