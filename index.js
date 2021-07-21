const express = require("express"),
    path = require("path"),
    config = require("./config"),
    app = express(),
    fileUpload = require('express-fileupload'),
    fs = require("fs");

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
                    useTempFiles: true,
                    tempFileDir: path.join(__dirname, 'tmp'),
                    createParentPath: true,
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
        })
        app.get("/view", async(req, res) => {
            renderTemplate(res, "view.html");
        });

        app.post("/postStream", async (req, res) => {
            const fileProperty = req?.files?.file;
            if(!fileProperty?.data) return res.json(false);
            this.chunks.push({size: fileProperty.size, data: fileProperty.tempFilePath});
            setTimeout(() => {
                fs.rm(this.chunks[0].data, () => {});
                this.chunks.splice(0, 1);
            }, 2000);
            return res.json(true);
        });

        app.get("/playVideo", (req, res) => {
            const stream = fs.createReadStream(this.chunks?.reverse()?.[0]?.data);
            res.setHeader("content-type", "video/webm");
            stream.pipe(res);
        })

        await app.listen(app.get("port"), () => {
            console.log(`Your website run on the URL : ${baseURL}`);
        });
    }
}

new Website().start();
