import { Component, OnInit } from '@angular/core';
import { webSocket } from './websocket.service';

interface message{
  content: string,
  author?: string,
  date?: string,
  isWelcome?: boolean
}

@Component({
  selector: 'app-stream',
  templateUrl: './stream.component.html',
  styleUrls: ['./stream.component.scss']
})

export class StreamComponent implements OnInit {

  messages: Array<message> = [];
  constructor() {
  }

  ngOnInit(): void {
    const ws = new webSocket("ws://localhost:7070/", "echo-protocol");
    const chatContent: any = document.querySelector(".chat-content");
    const send: any = document.querySelector(".sendMsg");
    const messageContent: any = document.querySelector(".messageContent");

    ws.on('ready', () => {
      this.messages.push({
        isWelcome: true,
        content: `Bienvenue sur le chat de ${document.location.pathname.split('/').reverse()[0]} !`
      });

      chatContent.scroll(0, chatContent.scrollHeight);
    });

    ws.on("message", (message: string) => {
      const d = new Date();
      this.messages.push({
        content: message,
        author: "Pioupia",
        date: `${d.getHours()}:${d.getMinutes()}`
      });
      if(this.messages.length > 100) this.messages.splice(99, 1);
      chatContent.scroll(0, chatContent.scrollHeight);
    });

    send.onclick = this.sendMessage(messageContent, ws);
    messageContent.onkeydown = (ev: any)  => {
      if(ev.keyCode === 13){
        if(!ev.shiftKey) return this.sendMessage(messageContent, ws);
        messageContent.value += "\n";
      }
      const attr = parseInt(messageContent.getAttribute("rows"));
      if(messageContent.selectionEnd < 5 && messageContent.selectionEnd !== attr) messageContent.setAttribute("rows", messageContent.selectionEnd);
      return true;
    }
    ws.open();
  }

  sendMessage(messageContent: any, ws: any){
    const content = messageContent.value.trim();
    if(!content || content == '' || content.length > 500) return false;
    ws.send("message", content);
    messageContent.value = "";
    return false;
  }
}
