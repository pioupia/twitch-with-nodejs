class mediaSharing {
	constructor(options, encoder, sampler){
		this.config = options;
		this.media = null;
		this.video = null;

		this.can = true;

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

		let mediaRecorder = new MediaRecorder(this.media, {"mimeType": "video/webm;"});
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
        /*if(!this.can) return;

    	this.video = document.querySelector('video');

    	if(this.config.isStreamEnable){
    		if(this.config.audio){
        	this.launchSendingAudio();
	        }
	        if(this.config.video){
	        	this.launchSendVideo();
	        }
    	}
        if(this.config.isRetour || this.config.isAudioRetour){
        	this.playVideo();
        }*/
	}

	/*launchSendingAudio(){

		 	this.audio.audioInput = this.audioContext.createMediaStreamSource(this.media);
            this.audio.gainNode = this.audioContext.createGain();
            this.audio.recorder = this.audioContext.createScriptProcessor(this.config.codec.bufferSize, 1, 1);

            const sampler = this.sampler;
            const encoder = this.encoder;

            this.setGain(this.config.volume);

	        const _this = this;
	        this.audio.recorder.onaudioprocess = function(e) {
	        	if(!_this.audio.recorder.onaudioprocess) return;
				const resampled = sampler.resampler(e.inputBuffer.getChannelData(0));
				const packets = encoder.encode_float(resampled);
				for (let i = 0; i < packets.length; i++) {
	            	if (wss.ws.readyState !== wss.ws.OPEN) return;
	                wss.ws.send(packets[i]);
	            }
	        };

	        this.audio.audioInput.connect(this.audio.gainNode);
	        this.audio.gainNode.connect(this.audio.recorder);
	        this.audio.recorder.connect(this.audioContext.destination);

	}

	playVideo(){
		this.video.srcObject = this.media;
		const video = this.video;
        this.video.onloadedmetadata = function() {
            video.play();
        };

        this.video.style.pointerEvents = 'none';

        if(!this.config.isRetour && this.config.isAudioRetour){
        	this.video.style.opacity = '0';
        	this.video.style.pointerEvents = 'none';
        }
	}

	launchSendVideo(){
		this.sendFPS = setInterval(() => {
	        if (!this.config.video) return;
	        wss.send('video', getFrame(this.video));
	    }, 1000 / this.config.fps.ideal);
	}

	changeFPS(fps){
		clearInterval(this.sendFPS);
		this.config.fps = fps;
		this.launchSendVideo();
	}

	stopVideo(){
		if(this.sendFPS){
			wss.send('video', '');
			clearInterval(this.sendFPS);
	 		this.sendFPS = null;
		}
	}

	allowVideo(){
		if(!this.sendFPS){
		 this.launchSendVideo();
		}
	}

	stopAudio(){
		if(this.config.audio){
			this.audio.recorder.onaudioprocess = null;
		}
	}

	allowAudio(){
		if(this.config.audio){
			this.launchSendingAudio();
		}
	}

	stopStreaming(){
		if(this.config.audio){
			this.stopAudio();
		}
		if(this.config.video){
			this.stopVideo();
		}
	}

	allowStreaming(){
		if(this.config.audio){
			this.allowAudio();
		}
		if(this.config.video){
			this.allowVideo();
		}
	}

	setGain(pourcentage){
		if(this.config.audio) this.audio.gainNode.gain.value = (pourcentage/100).toFixed(2);
		this.video.volume = (pourcentage/100).toFixed(2);
	}

	disableRetour(){
		this.video.style.opacity = '0';
		this.video.style.pointerEvents = 'none';
		if(!this.config.isRetour && !this.config.isAudioRetour){
        	this.video.muted = true;
        }
	}

	enableRetour(){
		this.video.muted = false;
		media.video.style.opacity = '1';
	}

	retourAdio(){
		this.video.muted = !this.video.muted;
	}*/
}
