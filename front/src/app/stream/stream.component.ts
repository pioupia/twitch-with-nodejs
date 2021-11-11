import { Component, OnInit } from '@angular/core';
import { webSocket } from './websocket.service';

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

  messages: Array<message> = [];
  color: string = 'yellow';
  changingColor: boolean = !1;

  constructor() {
  }

  ngOnInit(): void {
    const ws = new webSocket("ws://localhost:7070/", "echo-protocol");
    const chatContent: any = document.querySelector(".chat-content");
    const send: any = document.querySelector(".sendMsg");
    const messageContent: any = document.querySelector(".messageContent");
    const params: any = document.querySelector(".params");

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
