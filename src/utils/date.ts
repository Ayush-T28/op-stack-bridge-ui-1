export function formatTimestamp(timestamp: string | undefined): string {
    if(!timestamp){
      return "";
    }
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZoneName: 'short'
    };
    return date.toLocaleString('en-US', options);
}

export function getSecondsDifferenceFromNow(timestamp: string): number {
  // Parse the input timestamp into a Date object
  const parsedTimestamp = new Date(timestamp);

  // Get the current time in milliseconds
  const currentTime = new Date().getTime();

  // Get the timezone offset of the parsed timestamp in milliseconds
  const timestampOffset = parsedTimestamp.getTimezoneOffset() * 60 * 1000;

  // Calculate the difference between the current time and the parsed timestamp (considering the offset) in milliseconds
  const timeDifference = parsedTimestamp.getTime() - timestampOffset - currentTime;

  // Convert the time difference to seconds
  const secondsDifference = Math.floor(timeDifference / 1000);

  return Math.abs(secondsDifference);
}

export function formatTime(seconds: number): string {
  const secondsInMinute = 60;
  const secondsInHour = secondsInMinute * 60;
  const secondsInDay = secondsInHour * 24;
  const secondsInWeek = secondsInDay * 7;

  let remainingSeconds = seconds;
  const weeks = Math.floor(remainingSeconds / secondsInWeek);
  remainingSeconds %= secondsInWeek;
  const days = Math.floor(remainingSeconds / secondsInDay);
  remainingSeconds %= secondsInDay;
  const hours = Math.floor(remainingSeconds / secondsInHour);
  remainingSeconds %= secondsInHour;
  const minutes = Math.floor(remainingSeconds / secondsInMinute);

  let result = '';
  if (weeks > 0) {
      result += `${weeks} week${weeks > 1 ? 's' : ''}`;
  }
  if (days > 0) {
      if (result) result += ' ';
      result += `${days} day${days > 1 ? 's' : ''}`;
  }
  if (hours > 0) {
      if (result) result += ' ';
      result += `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  if (minutes > 0) {
      if (result) result += ' ';
      result += `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }

  if (!result) {
      result = `${remainingSeconds} seconds`;
  }

  return result;
}