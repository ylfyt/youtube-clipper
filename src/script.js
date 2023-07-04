// Get the active tab
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
	var activeTab = tabs[0];
	const notYoutubeMessage = document.getElementById('not-youtube-message');
	const mainContent = document.getElementById('main');

	if (activeTab.url?.indexOf('youtube.com/watch') === -1) {
		mainContent.remove();
		return;
	}
	notYoutubeMessage.remove();

	const regex = /[?&]v=([^&#]+)/;
	const match = activeTab.url?.match(regex);

	const videoId = match && match[1];
	if (!videoId) {
		return;
	}

	document.getElementById('title').innerText = activeTab.title;
	const message = document.getElementById('message');

	function getSeconds(time) {
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
			const second = parseInt(data[0]);
			if (isNaN(second)) {
				return -1;
			}

			const minute = parseInt(data[1]);
			if (isNaN(minute)) {
				return -1;
			}

			return second + minute * 60;
		}

		const second = parseInt(data[0]);
		if (isNaN(second)) {
			return -1;
		}

		const minute = parseInt(data[1]);
		if (isNaN(minute)) {
			return -1;
		}

		const hour = parseInt(data[2]);
		if (isNaN(hour)) {
			return -1;
		}

		return second + minute * 60 + hour * 60 * 60;
	}

	function setTime() {
		const start = document.getElementById('start').value;
		const end = document.getElementById('end').value;
		if (!start && !end) {
			console.log('Please input one');
			return;
		}

		const startSeconds = getSeconds(start);
		if (start && startSeconds === -1) {
			message.innerText = 'Time is not valid';
			return;
		}

		const endSeconds = getSeconds(end);
		if (end && endSeconds === -1) {
			message.innerText = 'Time is not valid';
			return;
		}

		const time = {};
		if (start) {
			time.start = startSeconds;
		}
		if (end) {
			time.end = endSeconds;
		}

		chrome.storage.local
			.set({
				videoId: time,
			})
			.then(() => {
				message.innerText = 'ok';
			})
			.catch((err) => {
				message.innerText = err.message;
			});
	}
	document.getElementById('save-button').addEventListener('click', setTime);
});
