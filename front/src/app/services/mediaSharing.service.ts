export class mediaSharing {
  private config: any;
  private media: any;
  private video: any;
  private audio: any;
  private elStream: any;
  private can: boolean | undefined;

	constructor(options: any) {
		this.config = options;
		this.media = null;
		this.video = null;

		this.audio = {
			audioInput: 0,
			gainNode: 0,
			recorder: false
		}
    this.elStream = document.getElementsByClassName("stream")[0];
	}

	async createMedia(what: boolean | string): Promise<any> {
		what = what ? 'getDisplayMedia' : 'getUserMedia';

    // @ts-ignore
    this.media = await navigator.mediaDevices[what]({
			audio: this.config.audio,
			video: this.config.video ? {
				width: this.config.width,
				height: this.config.height,
				frameRate: this.config.fps,
				facingMode: (this.config.front ? "user" : "environment")
			} : false
		}).catch((e: any) => {
			console.log(e.name + ": " + e.message);
			this.can = false;
		});

		let chunks: Array<any> = [];

		const video: any = document.querySelector('video');
		video.srcObject = this.media;
		video.onloadedmetadata = () => {
			video.play()
		}

		// @ts-ignore
    let mediaRecorder: any = new MediaRecorder(this.media, {"mimeType": "video/webm"});
		mediaRecorder.ondataavailable = function (ev: any) {
			chunks.push(ev.data);
		}

    const interval: any = setInterval(() => {
      mediaRecorder.stop();
      if (this.media.active !== true) {
        this.media = null;
        this.elStream.classList.add("disable");
        return clearInterval(interval);
      }
      mediaRecorder.start();
    }, 2000);

    mediaRecorder.onstop = () => {
			let blob = new Blob(chunks, {'type': 'video/webm'});
			chunks = [];
			const data = new FormData();
			data.append('file', blob);
			fetch("http://localhost:8080/postStream", {
				"method": "post",
				"body": data
			});
		}
		mediaRecorder.start();
		this.elStream.classList.remove("disable");
	}
}
