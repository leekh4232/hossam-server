const fs = require("fs");
const jsonServer = require("json-server");
const { PageNotFoundException } = require("./ExceptionHelper");
const { urlFormat } = require("./UtilHelper")

const getJsonServerRouter = (dbFilePath) => {
    if (!fs.existsSync(dbFilePath)) {
        return null;
    }

    const jsonServerRouter = jsonServer.router(dbFilePath);

    jsonServerRouter.render = (req, res) => {
        if (req.method.toUpperCase() !== 'DELETE' && Object.keys(res.locals.data).length === 0) {
            const current_url = urlFormat({
                protocol: req.protocol,
                host: req.get("host"),
                port: req.port,
                pathname: req.originalUrl,
            });

            return res.sendError(new PageNotFoundException(`${current_url} not found`));
        }

        const json = {
            status: 200,
            message: "OK",
            item: res.locals.data,
            timestamp: new Date().toISOString(),
        };

        res.jsonp(json);
    };

    return jsonServerRouter;
};

module.exports = getJsonServerRouter;
