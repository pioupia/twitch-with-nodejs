const express = require("express"),
    path = require("path"),
    config = require("./config"),
    app = express(),
    fileUpload = require('express-fileupload'),
    { Duplex } = require('stream'),
    fs = require("fs");
let i = 0;

let Website = class Website {
    constructor() {
        this.config = config;
        this.chunks = new Array();
    }

    async start() {
        const baseURL = this.config.website.baseURL;

        app.use(express.static(path.join(__dirname, `${path.sep}dashboard${path.sep}public`)))
            .use(
                fileUpload({
                    useTempFiles: false,
                    limits: { fileSize: 1 * 1024 * 1024 },
                })
            )
            .set('views', path.join(__dirname, `${path.sep}dashboard${path.sep}views`))
            .set("port", this.config.website.port);

        const renderTemplate = (res, template) => {
            res.status(200).sendFile(path.resolve(__dirname + `${path.sep}dashboard${path.sep}views${path.sep}${template}`));
        };

        app.get("/", async(req, res) => {
            return renderTemplate(res, "index.html")
        });

        app.get("/panel", async(req, res) => {
            return renderTemplate(res, "panel.html")
        });

        app.get("/view", async(req, res) => {
            renderTemplate(res, "view.html");
        });

        app.post("/postStream", async (req, res) => {
            const fileProperty = req?.files?.file;
            if(!fileProperty?.data || fileProperty.mimetype !== 'video/webm') return res.json(false);
            this.chunks.push({ data: fileProperty?.data, id: i++, date: Date.now() });
            return res.json(true);
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

new Website().start();