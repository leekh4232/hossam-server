const fs = require("fs");
const jsonServer = require("json-server");
const { PageNotFoundException } = require("./ExceptionHelper");
const { myip, urlFormat } = require("./UtilHelper");

const getJsonServerRouter = (dbFilePath) => {
    if (!fs.existsSync(dbFilePath)) {
        return null;
    }

    const appUrl = `http://${myip()[0]}:${process.env.HTTP_PORT}${process.env.BACKEND_PATH}`

    const jsonServerRouter = jsonServer.router(dbFilePath);

    jsonServerRouter.render = (req, res) => {
        if (req.method.toUpperCase() !== 'DELETE' && Object.keys(res.locals.data).length === 0) {
        //if (req.method.toUpperCase() !== 'DELETE' && req.method.toUpperCase() !== 'GET' && Object.keys(res.locals.data).length === 0) {
            const current_url = urlFormat({
                protocol: req.protocol,
                host: req.get("host"),
                port: req.port,
                pathname: req.originalUrl,
            });

            return res.sendError(new PageNotFoundException(`${current_url} not found`));
        }

        let data = structuredClone(res.locals.data);

        if (Array.isArray(data)) {
            data = data.map((v, i) => {
                if (v.photo_url) {
                    v.photo_url = appUrl + v.photo_url;
                }

                return v;
            })
        }

        const json = {
            status: 200,
            message: "OK",
            item: data,
            timestamp: new Date().toISOString(),
        };

        res.jsonp(json);
    };

    return jsonServerRouter;
};

const getJsonServerBodyParser = () => jsonServer.bodyParser;

module.exports = { getJsonServerRouter, getJsonServerBodyParser };
