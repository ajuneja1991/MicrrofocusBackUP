import timeUtils from '../../../../shared/utils/dateTime/timeUtils.js';

const moment = require('moment');
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function getTimeAsString(date) {
  // used for UI Tests in Reporting and return date string
  const dd = new Date(date.getTime());
  dd.setSeconds(0, 0);
  return moment(dd.getTime()).format('h:mm:ss A');
}

export function getDateAsString(day, month, year) {
  /**
   * Used for UI Tests in Reporting and return date strings.
   * For the month use the normal 1-12 numbers.
   */

  const date = `${month}/${day}/${year}`; // The month is a number.
  const dateWithMonthName = `${MONTH_NAMES[month - 1]} ${day}, ${year}`; // The month name is taken from an array which starts at 0.
  const dateAsInUrl = `${year}-${month}-${day}`;
  return [date, dateWithMonthName, dateAsInUrl];
}

export function getDateAsStringPassDtAsString(day = '', month = '', year = '') {
  /**
   * Used for UI Tests in Reporting and return date strings.
   * For the month use the normal 1-12 numbers.
   */

  const date = `${month}/${day}/${year}`; // The month is a number.
  const dateWithMonthName = `${MONTH_NAMES[month - 1]} ${day}, ${year}`; // The month name is taken from an array which starts at 0.
  const dateAsInUrl = `${year}-${month}-${day}`;
  return [date, dateWithMonthName, dateAsInUrl];
}

export function getDateAsPerFormat(dateformat) {
  const dt = new Date().getTime();
  return moment(dt).format(dateformat);
}

// START_OF_THE_WEEK

const defaultStartOfTheWeek = 'MONDAY';

const weekNamesDayMap = new Map([
  ['SUNDAY', { day: 0, offset: 0, weekDay: 0, short: 'Sun' }],
  ['MONDAY', { day: 1, offset: 6, weekDay: 1, short: 'Mon' }],
  ['TUESDAY', { day: 2, offset: 5, weekDay: 2, short: 'Tue' }],
  ['WEDNESDAY', { day: 3, offset: 4, weekDay: 3, short: 'Wed' }],
  ['THURSDAY', { day: 4, offset: 3, weekDay: 4, short: 'Thu' }],
  ['FRIDAY', { day: 5, offset: 2, weekDay: 5, short: 'Fri' }],
  ['SATURDAY', { day: 6, offset: 1, weekDay: 6, short: 'Sat' }]
]);

function getStartOfTheWeek() {
  // used for UI Tests in Reporting and return start of the week
  let startOfTheWeek = Cypress.env('START_OF_THE_WEEK');
  if (!startOfTheWeek) {
    return defaultStartOfTheWeek;
  }
  startOfTheWeek = startOfTheWeek.toUpperCase();
  const startOfTheWeekExists = weekNamesDayMap.get(startOfTheWeek);
  if (!startOfTheWeekExists) {
    return defaultStartOfTheWeek;
  }
  return startOfTheWeek;
}

function getDateSting(date) {
  // used for UI Tests in Reporting and return date strings
  const monthName = MONTH_NAMES[date.getMonth()];
  return `${monthName} ${date.getDate()}, ${date.getFullYear()}`;
}

export function calcWeekInformation(predefinedId) {
  // used for UI Tests in Reporting and calculate week information
  const startOfTheWeek = getStartOfTheWeek();
  const calculateDates = timeUtils.calculateRelativeTime(predefinedId, ':both', '', startOfTheWeek);

  return {
    firstDayString: getDateSting(calculateDates.start),
    lastDayString: getDateSting(calculateDates.end),
    shortName: weekNamesDayMap.get(startOfTheWeek).short,
    firstDay: calculateDates.start,
    lastDay: calculateDates.end
  };
}
