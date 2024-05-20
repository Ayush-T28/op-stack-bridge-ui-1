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