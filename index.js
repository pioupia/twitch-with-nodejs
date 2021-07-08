const express = require("express"),
    path = require("path"),
    config = require("./config"),
    WebSocket = require("ws"),
    app = express(),
    wss = new WebSocket.Server({
        port: 2200
    });

let Website = class Website {
    constructor() {
        this.config = config;
    }

    async start() {
        const baseURL = this.config.website.baseURL;

        app.use(express.static(path.join(__dirname, `${path.sep}dashboard${path.sep}public`)))
            .set('views', path.join(__dirname, `${path.sep}dashboard${path.sep}views`))
            .engine("html", require("ejs").renderFile)
            .set("view engine", "html")
            .set("port", this.config.website.port);

        const renderTemplate = (res, req, template, data = {}) => {
            const baseData = {
                path: req.path
            };
            res.status(200).render(
                path.resolve(__dirname + `${path.sep}dashboard${path.sep}views${path.sep}${template}`),
                Object.assign(baseData, data),
                (err, html) => {
                    res.send(html);
                });
        };

        app.get("/", async(req, res) => {
            return renderTemplate(res, req, "index.html")
        })
        app.get("/view", async(req, res) => {
            renderTemplate(res, req, "view.html");
        });

        await app.listen(app.get("port"), () => {
            console.log(`Your website run on the URL : ${baseURL}`);
        });

		/* video */

        wss.on('connection', function connection(ws) {
            ws.on('message', function incoming(data) {
                wss.clients.forEach(function each(client) {
                  if (client.readyState === WebSocket.OPEN && client != ws){
                    client.send(data);
                  }
                });
            });
        });
    }
}

new Website().start();
