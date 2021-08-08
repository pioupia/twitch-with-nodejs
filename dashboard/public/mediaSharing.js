class mediaSharing {
	constructor(options, encoder, sampler){
		this.config = options;
		this.media = null;
		this.video = null;

		this.audio = {
			audioInput: null,
			gainNode: null,
			recorder: null
		}
		this.sendFPS = null;
	}

	async createMedia(what){
		what = what ? 'getDisplayMedia' : 'getUserMedia';
		this.media = await navigator.mediaDevices[what]({
            audio: this.config.audio,
            video: this.config.video ? {
                width: this.config.width,
                height: this.config.height,
                frameRate: this.config.fps,
                facingMode: (this.config.front ? "user" : "environment")
            } : false
        }).catch(e => {
        	console.log(e.name + ": " + e.message);
        	this.can = false;
        });

		let chunks = [];

		const video = document.querySelector('video');
		video.srcObject = this.media;
		video.onloadedmetadata = () => {
			video.play()
		}

		let mediaRecorder = new MediaRecorder(this.media, {"mimeType": "video/webm"});
		mediaRecorder.ondataavailable = function(ev) {
			chunks.push(ev.data);
		}

		setInterval(() => {
			mediaRecorder.stop();
			mediaRecorder.start();
		}, 2000);

		mediaRecorder.onstop = () => {
			let blob = new Blob(chunks, {'type': 'video/webm;'});
			chunks = [];
			const data = new FormData();
			data.append('file', blob);
			fetch("/postStream", {
				"method": "post",
				"body": data
			});
		}

		mediaRecorder.start();
	}
}
