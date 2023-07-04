const main = () => {
	if (window.location.href.indexOf('youtube.com/watch') === -1) {
		console.log('not yt');
		return;
	}
	const regex = /[?&]v=([^&#]+)/;
	const match = window.location.href.match(regex);

	const videoId = match && match[1];
	if (!videoId) {
		return;
	}
	console.log('id', videoId);

	var videoElement = document.querySelector('video');

	console.log(videoElement);
	console.log(videoElement.currentTime);
};

main();
