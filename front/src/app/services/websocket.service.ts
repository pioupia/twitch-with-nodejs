interface receivedMessage{
  data: string
}

export class webSocket {
  url: string = "";
  protocols: any = [];
  ws: any;
  callbacks: any = {};

  constructor(parameters: string, protocols: any = []) {
    this.url = parameters;
    this.protocols = protocols;
    this.ws = undefined;
    this.callbacks = {};
  }

  open(): void {
    this.ws = new WebSocket(this.url, this.protocols);

    this.ws.onopen = () => {
      console.log('WebSocket open');
      this.emit('ready', true)
    }

    this.ws.onmessage = (data: receivedMessage) => {
      let parsed;
      try{
        parsed = JSON.parse(data.data);
        this.emit(parsed.event, parsed.data);
      }catch(e){
        return;
      }
    }

    this.ws.onerror = () => {
      if (this.ws.readyState == this.ws.OPEN) return;
      this.reconnected();
    }

    this.ws.onclose = () => {
      this.reconnected();
    }
  }

  reconnected() {
    setTimeout(() => {
      this.open();
    }, 1000)

    setTimeout(() => {
      if (this.ws.readyState == this.ws.OPEN) return;
      let intervalConnectWS: any = setInterval(() => {
        if (this.ws.readyState == this.ws.OPEN) return clearInterval(intervalConnectWS);
        this.open()
      }, 1000)
    }, 4 * 1000)
  }

  on(event: string, callback: any) {
    this.callbacks[event] = this.callbacks[event] || [];
    this.callbacks[event].push(callback);
    return this;
  }

  send(event: string, data: any) {
    if (this.ws.readyState !== this.ws.OPEN) return;
    this.ws.send(JSON.stringify({
      event,
      data
    }));

    return this;
  }

  emit(event: string, data: any) {
    const callback = this.callbacks[event];
    if (!callback) return;
    for (const events of callback) {
      events(data);
    }
  }
}
