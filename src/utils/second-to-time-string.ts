export function secondToTimeString(seconds: number): string {
	const hour = Math.floor(seconds / 3600);
	seconds = seconds % 3600;
	const minute = Math.floor(seconds / 60);
	seconds = seconds % 60;

	if (hour !== 0) {
		return `${hour}:${minute}:${seconds}`;
	}

	if (minute !== 0) {
		return `${minute}:${seconds}`;
	}

	return seconds.toString();
}
