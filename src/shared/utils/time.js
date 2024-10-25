/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

export const minutesToDuration = (minutesIn, showZeroHours) => {
  const minutesInAbs = Math.abs(minutesIn);
  const hoursOut = Math.floor(minutesInAbs / 60);
  const minutesOut = minutesInAbs % 60;
  const sign = minutesIn < 0 ? '-' : '';
  if (!showZeroHours && hoursOut < 1) {
    return `${sign}${minutesOut}m`;
  }
  return `${sign}${hoursOut}h ${minutesOut}m`;
};

export const minutesToHHMM = minutesIn => {
  let hoursOut = Math.floor(minutesIn / 60);
  let minutesOut = minutesIn % 60;

  // leading zeros for hours
  if (hoursOut === 0) {
    hoursOut = '00';
  } else if (hoursOut < 10) {
    hoursOut = `0${hoursOut}`;
  }

  // leading zeros for minutes
  if (minutesOut === 0) {
    minutesOut = '00';
  } else if (minutesOut < 10) {
    minutesOut = `0${minutesOut}`;
  }

  return `${hoursOut}:${minutesOut}`;
};
