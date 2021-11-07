class webSocket {
  constructor(parameters, protocols = []) {
    this.url = parameters;
    this.protocols = protocols
    this.ws = undefined;
    this.callbacks = {};
  }

  open() {
    this.ws = new WebSocket(this.url, this.protocols);

    this.ws.onopen = () => {
      console.log('WebSocket open');
      this.emit('ready', true)
    }

    this.ws.onmessage = (data) => {
      let parsed;
      try{
        parsed = JSON.parse(data.data);
        this.emit(parsed.event, parsed.data);
      }catch(e){
        return;
      }
    }

    this.ws.onerror = (e) => {
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
      let intervalConnectWS = setInterval(() => {
        if (this.ws.readyState == this.ws.OPEN) return clearInterval(intervalConnectWS);
        this.open()
      }, 1000)
    }, 4 * 1000)
  }

  on(event, callback) {
    this.callbacks[event] = this.callbacks[event] || [];
    this.callbacks[event].push(callback);
    return this;
  }

  send(event, data) {
    if (this.ws.readyState !== this.ws.OPEN) return;
    this.ws.send(JSON.stringify({
      event,
      data
    }));

    return this;
  }

  emit(event, data) {
    const callback = this.callbacks[event];
    if (!callback) return;
    for (const events of callback) {
      events(data);
    }
  }
}
