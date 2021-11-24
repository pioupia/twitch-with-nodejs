import { Component, OnInit } from '@angular/core';
import { webSocket } from '../services/websocket.service';

interface message{
  content: string,
  author?: string,
  date?: string,
  isWelcome?: boolean,
  color?: string
}

@Component({
  selector: 'app-stream',
  templateUrl: './stream.component.html',
  styleUrls: ['./stream.component.scss']
})

export class StreamComponent implements OnInit {

  public messages: Array<message> = [];
  public color: string = 'yellow';
  public changingColor: boolean = !1;
  private mediaSource: any;
  private videoPlaying: any;
  private streamSegment: number = 0;
  private queue: Array<any> = [];
  private sourceBuffer: any;
  private refreshVideo: any;
  private readonly mime: string;
  private enableStream: boolean = !0;
  private isScrolling: boolean;

  constructor() {
    this.streamSegment = 0;
    this.queue = [];
    this.sourceBuffer = !1;
    this.mime = "video/webm; codecs=\"vp8, vorbis\"";
    this.isScrolling = !1;
  }

  ngOnInit(): void {
    const ws = new webSocket("ws://localhost:7070/", "echo-protocol");
    const chatContent: any = document.querySelector(".chat-content");
    const send: any = document.querySelector(".sendMsg");
    const messageContent: any = document.querySelector(".messageContent");
    const params: any = document.querySelector(".params");
    this.videoPlaying = document.getElementById("videoPlaying");
    this.mediaSource = new MediaSource();

    ws.on('ready', () => {
      this.messages.push({
        isWelcome: true,
        content: `Bienvenue sur le chat de ${document.location.pathname.split('/').reverse()[0]} !`
      });
      chatContent.scroll(0, chatContent.scrollHeight);
    });

    ws.on("message", (message: any) => {
      const d = new Date();
      message = JSON.parse(message);
      if(this.messages.length+1 > 100) this.messages.splice(1, 1);
      this.messages.push({
        content: message.msg,
        author: "Pioupia",
        date: this.msgDate(d),
        color: message.color
      });
      setTimeout(() => {
        // Wait time for variable scrollHeight to update.
        chatContent.scroll(0, chatContent.scrollHeight);
      }, 5)
    });

    ws.on("start", this.initStream);

    params.onclick = () => this.changeColor();
    send.onclick = () => this.sendMessage(messageContent, ws);
    messageContent.onkeydown = (ev: any)  => {
      if(ev.keyCode === 13){
        if(!ev.shiftKey) return this.sendMessage(messageContent, ws);
        messageContent.value += "\n";
      }
      if(messageContent.rows < 5) messageContent.setAttribute("rows", messageContent.rows+1);
      return true;
    }
    ws.open();

    // Connect to the stream
    this.initStream();
  }

  initStream(): void {
    this.videoPlaying.src = URL.createObjectURL(this.mediaSource);

    this.mediaSource.addEventListener('sourceopen', this.sourceOpen(this));

    this.refreshVideo = setInterval(async () => {
      this.streamSegment++;
      if(!this.sourceBuffer || this.sourceBuffer.updating) return;
      let data = await this.fetchSegment();
      if(data.byteLength < 10) return this.endStream();

      if (this.queue.length > 0){
        this.queue.push(data);
        return;
      }

      this.sourceBuffer.appendBuffer(data);
      setTimeout(() => {
        // Clearing memory
        if(!this.sourceBuffer || this.sourceBuffer.updating) return;
        const time = this.sourceBuffer.timestampOffset - 2;
        if(time > 2){
          this.sourceBuffer.remove(0, time);
        }
      }, 1000)
    }, 2000)
  }

  async sourceOpen(_this: any): Promise<void> {
    const informations: any = await Promise.all([fetch("http://localhost:8080/getStreamer").then((res: any) => res.json()),
      _this.fetchSegment()]).catch((e:any) => console.error(e));
    _this.streamSegment = informations[0].count;
    let data = informations[1];
    if(data.byteLength < 10) return _this.endStream();
    _this.sourceBuffer = _this.mediaSource.addSourceBuffer(_this.mime);
    _this.sourceBuffer.mode = 'sequence';
    _this.sourceBuffer.addEventListener('updateend', _this.onUpdateEnd(_this));
    _this.sourceBuffer.onabort = (...e: any) => {
      console.log(...e);
    }
    _this.sourceBuffer.onerror = (...e: any) => {
      console.log(...e);
    }
    _this.sourceBuffer.appendBuffer(data);
    setTimeout(() => {
      _this.videoPlaying.play();
    }, 50)
  }

  private fetchSegment(): any {
    return fetch(`http://localhost:8080/playVideo${this.streamSegment > 0 ? '?count='+this.streamSegment : ''}`)
      .catch(() => {
        return this.endStream();
      }).then((res: any) => res.arrayBuffer());
  }

  private onUpdateEnd(_this: any): void {
    if(_this.queue.length < 1 || _this.sourceBuffer.updating) return;
    if((_this.queue?.[0]?.byteLength||0) < 10) return _this.endStream();
    _this.sourceBuffer.appendBuffer(_this.queue.shift());
  }

  private endStream(): void{
    // Stream is complete or not yet started.
    this.enableStream = !1;
    clearInterval(this.refreshVideo);
    this.sourceBuffer = !1;
    this.mediaSource.endOfStream();
    this.videoPlaying.pause();
    return;
  }

  private sendMessage(messageContent: any, ws: any): boolean {
    const content = messageContent.value.trim();
    if(!content || content == '' || content.length > 500) return false;
    ws.send("message", JSON.stringify({msg: content, color: this.color }));
    messageContent.value = "";
    return false;
  }

  private msgDate(date: Date): string {
    return `${this.parseDate(date.getHours())}:${this.parseDate(date.getMinutes())}`;
  }

  private parseDate(value: number, max: number = 10): string {
    return value < max ? `0${value}` : value.toString();
  }

  public changeColor(el?: any): void {
    if(el){
      el = el.target?.classList?.[1]?.replace('-bg','');
      switch(el){
        case 'r':
          this.color = 'red';
          break;
        case 'v':
          this.color = 'green';
          break;
        case 'b':
          this.color = 'blue';
          break;
        case 'y':
          this.color = 'yellow';
          break;
      }
    }else this.changingColor = !this.changingColor;
    return;
  }
}
