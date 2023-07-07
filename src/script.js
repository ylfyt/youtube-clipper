// Get the active tab
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
	var activeTab = tabs[0];
	const notYoutubeMessage = document.getElementById('not-youtube-message');
	const mainContent = document.getElementById('main');
	const clearButton = document.getElementById('clear-button');

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

	function formatTime(seconds) {
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

		return seconds;
	}

	chrome.storage.local.get(videoId, (res) => {
		const time = res[videoId];
		if (!time) {
			clearButton.remove();
			return;
		}

		clearButton.addEventListener('click', () => {
			chrome.storage.local.remove(videoId).then(() => {
				message.innerText = 'Clear';
			});
		});

		if (time.start) {
			const fmt = formatTime(time.start);
			document.getElementById('start').value = fmt;
		}

		if (time.end) {
			const fmt = formatTime(time.end);
			document.getElementById('end').value = fmt;
		}

		document.getElementById('loop').checked = time.loop;
	});

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

	function setTime() {
		const start = document.getElementById('start').value;
		const end = document.getElementById('end').value;
		const loop = document.getElementById('loop').checked;
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

		const time = { loop, title: activeTab.title };
		if (start) {
			time.start = startSeconds;
		}
		if (end) {
			time.end = endSeconds;
		}

		chrome.storage.local.get((videos) => {
			videos[videoId] = time;
			chrome.storage.local
				.set(videos)
				.then(() => {
					message.innerText = 'ok';
				})
				.catch((err) => {
					message.innerText = err.message;
				});
		});
	}
	document.getElementById('save-button').addEventListener('click', setTime);
});

document.getElementById('all-button').addEventListener('click', () => {
	function showAll() {
		const seeAllContainer = document.getElementById('see-all');
		seeAllContainer.innerHTML = '';
		chrome.storage.local.get((videos) => {
			const ids = Object.keys(videos);
			for (const id of ids) {
				const time = videos[id];
				if (!time?.title) continue;
				seeAllContainer.innerHTML += `
        <li style="display: flex; align-items:start; border:solid; border-width: 2px; border-radius: 10px; padding: 5px;justify-content: space-between;margin-bottom:4px">
          <a target="_blank" href="http://youtube.com/watch?v=${id}">${time.title}</a>
          <button class="btn-delete" id="${id}">&#10005;</button>
        </li>
        `;
			}

			const btns = document.getElementsByClassName('btn-delete');
			for (let i = 0; i < btns.length; i++) {
				const btn = btns[i];
				btn.addEventListener('click', (e) => {
					chrome.storage.local.remove(e.target.id).then(() => {
						showAll();
					});
				});
			}
		});
	}

	showAll();
});
