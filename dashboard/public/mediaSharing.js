class mediaSharing {
	constructor(options, encoder, sampler){
		this.config = options;
		this.media = null;
		this.video = null;

		this.encoder = new OpusEncoder(this.config.codec.sampleRate, this.config.codec.channels, this.config.codec.app, this.config.codec.frameDuration);
		this.sampler = new Resampler(44100, this.config.codec.sampleRate, 1, this.config.codec.bufferSize);
		this.audioContext = new AudioContext();

		this.audio = {
			audioInput: null,
			gainNode: null,
			recorder: null,

		}

		this.can = true;

		this.sendFPS = null;
	}

	async createMedia(){
		this.media = await navigator.mediaDevices.getUserMedia({
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
        })

        if(!this.can) return;

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
        }
	}

	launchSendingAudio(){

		 	this.audio.audioInput = this.audioContext.createMediaStreamSource(this.media);
            this.audio.gainNode = this.audioContext.createGain();
            this.audio.recorder = this.audioContext.createScriptProcessor(this.config.codec.bufferSize, 1, 1);

            const sampler = this.sampler;
            const encoder = this.encoder;

            this.setGain(this.config.volume);

	        //l 36313

	        const _this = this;
	        this.audio.recorder.onaudioprocess = function(e) {
	        	if(!_this.audio.recorder.onaudioprocess) return;
	            var resampled = sampler.resampler(e.inputBuffer.getChannelData(0));
	            var packets = encoder.encode_float(resampled);
	            for (var i = 0; i < packets.length; i++) {
	            	if (wss.ws.readyState !== wss.ws.OPEN) return;
	                wss.ws.send(packets[i])
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
	}
}