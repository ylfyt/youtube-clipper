export function timeStringToSecond(time: string): number {
	const data = time.split(':');
	if (data.length === 0) {
		return -1;
	}

	if (data.length === 1) {
		const second = parseInt(data[0]);
		if (isNaN(second)) {
			return -1;
		}

		return second;
	}

	if (data.length === 2) {
		const second = parseInt(data[1]);
		if (isNaN(second)) {
			return -1;
		}

		const minute = parseInt(data[0]);
		if (isNaN(minute)) {
			return -1;
		}

		return second + minute * 60;
	}

	const second = parseInt(data[2]);
	if (isNaN(second)) {
		return -1;
	}

	const minute = parseInt(data[1]);
	if (isNaN(minute)) {
		return -1;
	}

	const hour = parseInt(data[0]);
	if (isNaN(hour)) {
		return -1;
	}

	return second + minute * 60 + hour * 60 * 60;
}
