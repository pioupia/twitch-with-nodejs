const express = require("express"),
    path = require("path"),
    config = require("./config"),
    app = express(),
    fileUpload = require('express-fileupload'),
    { Duplex } = require('stream'),
    http = require("http"),
    Websocket = require("websocket").server;

let i = 0;

class Website {
    constructor() {
        this.config = config;
        this.chunks = [];
        this.chatConnected = [];
    }

    async start() {
        const baseURL = this.config.website.baseURL;

        app.use(express.static(path.join(__dirname, `${path.sep}dashboard${path.sep}public`)))
            .use(
                fileUpload({
                    useTempFiles: false,
                    limits: { fileSize: 1024 * 1024 },
                })
            ).use((req, res, next) => {
                res.setHeader("Access-Control-Allow-Origin", "*");
                next();
            })
            .set("port", this.config.website.port);

        app.post("/postStream", async (req, res) => {
            const fileProperty = req?.files?.file;
            if(!fileProperty?.data || fileProperty.mimetype !== 'video/webm') return res.json(false);
            this.chunks.push({ data: fileProperty?.data, id: i++, date: Date.now() });
            return res.end();
        });

        app.get("/getStreamer", (req, res) => {
            return res.json({count: i});
        });

        app.get("/playVideo", (req, res) => {
            if(this?.chunks?.length < 1) return res.json(false);
            const buffer = new Buffer.from(
                (req.query?.count && !isNaN(req.query?.count) && (req.query?.count??0) > 0) ?
                    (this.chunks.find(r => r.id === req.query.count)||this.chunks?.reverse()?.[0]?.data) :
                    this.chunks?.reverse()?.[0]?.data, 'base64')
            const stream = this.bufferToStream(buffer);
            res.setHeader("content-type", "video/webm");
            stream.pipe(res);
        });

        await app.listen(app.get("port"), () => {
            console.log(`Your website run on the URL : ${baseURL}`);
        });

        setInterval(() => {
            this.chunks = this.chunks.filter(r => r.date+60000 >= Date.now());
        }, 30*1000)

        this.launchTchat();
    }

    launchTchat(){
        const server = http.createServer(function(request, response) {
            console.log((new Date()) + ' Received request for ' + request.url);
            response.writeHead(404);
            response.end();
        });

        server.listen(7070, function() {
            console.log((new Date()) + ' Server is listening on port 3000');
        });

        const wsServer = new Websocket({
            httpServer: server,
            autoAcceptConnections: false
        });

        const _this = this;
        wsServer.on('request', function(request) {
            const connection = request.accept('echo-protocol', request.origin);
            _this.chatConnected.push(connection);
            connection.on('message', function(message) {
                if (message.type === 'utf8') {
                    const data = JSON.parse(message.utf8Data);
                    if(data.event === "message"){
                        const msg = (JSON.parse(data.data || '{}'))?.msg;
                        if(!msg || msg.length > 500) return;
                        _this.chatConnected.forEach(e => {
                            e.sendUTF(message.utf8Data);
                        });
                    }
                }
            });
            connection.on('close', () => {
                _this.chatConnected.splice(_this.chatConnected.findIndex(r => r === connection), 1);
            });
        });
    }
    /*
        Convert a buffer to a readable stream to send it to front.
     */
    bufferToStream(myBuffer) {
        let tmp = new Duplex();
        tmp.push(myBuffer);
        tmp.push(null);
        return tmp;
    }
}

new Website().start()