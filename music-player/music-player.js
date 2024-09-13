const musicContainer = document.getElementById('music-container');
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const autoPlayBtn = document.getElementsByClassName('auto-play-music')[0];
const audio = document.getElementById('audio');
console.log(autoPlayBtn);

// Song titles
const songs = ['爱丽丝','Sean lennon']// 'Toby Fox - Shop', 'Toby Fox - Dating Start!'];

// Keep track of song
let songIndex = 0;

// Initially load song details into DOM
loadSong(songs[songIndex]);

// Update song details
function loadSong(song) {
	audio.src = "./music-player/" + `music/${song}.mp3`;
}

// Play song
function playSong() {
	musicContainer.classList.add('play');
	playBtn.querySelector('i.iconfont').classList.remove('icon-play_fill');
	playBtn.querySelector('i.iconfont').classList.add('icon-pause');

	audio.play();
}

// Pause song
function pauseSong() {
	musicContainer.classList.remove('play');
	playBtn.querySelector('i.iconfont').classList.add('icon-play_fill');
	playBtn.querySelector('i.iconfont').classList.remove('icon-pause');

	audio.pause();
}

// Previous song
function prevSong() {
	songIndex--;

	if (songIndex < 0) {
		songIndex = songs.length - 1;
	}

	loadSong(songs[songIndex]);

	playSong();
}

// Next song
function nextSong() {
	songIndex++;

	if (songIndex > songs.length - 1) {
		songIndex = 0;
	}

	loadSong(songs[songIndex]);

	playSong();
}

//get duration & currentTime for Time of song
function DurTime(e) {
	const { duration, currentTime } = e.srcElement;
	var sec;
	var sec_d;

	// define minutes currentTime
	let min = (currentTime == null) ? 0 :
		Math.floor(currentTime / 60);
	min = min < 10 ? '0' + min : min;

	// define seconds currentTime
	function get_sec(x) {
		if (Math.floor(x) >= 60) {

			for (var i = 1; i <= 60; i++) {
				if (Math.floor(x) >= (60 * i) && Math.floor(x) < (60 * (i + 1))) {
					sec = Math.floor(x) - (60 * i);
					sec = sec < 10 ? '0' + sec : sec;
				}
			}
		} else {
			sec = Math.floor(x);
			sec = sec < 10 ? '0' + sec : sec;
		}
	}

	get_sec(currentTime, sec);

	// define minutes duration
	let min_d = (isNaN(duration) === true) ? '0' :
		Math.floor(duration / 60);
	min_d = min_d < 10 ? '0' + min_d : min_d;


	function get_sec_d(x) {
		if (Math.floor(x) >= 60) {

			for (var i = 1; i <= 60; i++) {
				if (Math.floor(x) >= (60 * i) && Math.floor(x) < (60 * (i + 1))) {
					sec_d = Math.floor(x) - (60 * i);
					sec_d = sec_d < 10 ? '0' + sec_d : sec_d;
				}
			}
		} else {
			sec_d = (isNaN(duration) === true) ? '0' :
				Math.floor(x);
			sec_d = sec_d < 10 ? '0' + sec_d : sec_d;
		}
	}

	// define seconds duration

	get_sec_d(duration);

};

// Event listeners
playBtn.addEventListener('click', () => {
	const isPlaying = musicContainer.classList.contains('play');

	if (isPlaying) {
		pauseSong();
	} else {
		playSong();
	}
});

//auto-play
autoPlayBtn.addEventListener('click', () => {
	const isPlaying = musicContainer.classList.contains('play');

	if (isPlaying) {
		pauseSong();
	} else {
		playSong();
	}

	autoPlayBtn.remove();
});

// Change song
prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);

// Song ends
audio.addEventListener('ended', nextSong);

// Time of song
audio.addEventListener('timeupdate', DurTime);
