const express = require("express");
const logger = require("./LogHelper");
const { isLoggedIn, isNotLoggedIn } = require("./PassportHelper");

class BaseController {
    #app;
    #router;

    #baseUrl = {
        create: null,
        read: {
            item: null,
            list: null,
        },
        update: null,
        delete: null,
    };
    static #current = null;

    constructor(app, baseUrl) {
        //logger.debug(`[${this.constructor.name} loaded]`);

        this.#app = app;
        this.#baseUrl = Object.assign(this.#baseUrl, baseUrl);
        this.#router = express.Router();

        const crud = {
            create: "post",
            read: "get",
            update: "put",
            delete: "delete",
        };

        const controllerInfo = [];

        for (const key in this.#baseUrl) {
            let url = null;
            let secure = undefined;
            const method = crud[key];
            
            if (key === "read") {
                if (this.#baseUrl[key].item) {
                    url = this.#baseUrl[key].item.url;
                    secure = this.#baseUrl[key].item.secure;
                    //logger.debug(`crud: ${key}(item), method: ${method}, url: ${url}, secure: ${secure}`);
                    controllerInfo.push({
                        crud: `${key}(item)`,
                        method: method,
                        url: url,
                        secure: secure,
                    });

                    if (secure === true) {
                        this.#router[method](url, isLoggedIn, async (req, res, next) => this.readItem(req, res, next));
                    } else if (secure === false) {
                        this.#router[method](url, isNotLoggedIn, async (req, res, next) => this.readItem(req, res, next));
                    } else {
                        this.#router[method](url, async (req, res, next) => this.readItem(req, res, next));
                    }
                }

                if (this.#baseUrl[key].list) {
                    url = this.#baseUrl[key].list.url;
                    secure = this.#baseUrl[key].list.secure;
                    //logger.debug(`crud: ${key}(list), method: ${method}, url: ${url}, secure: ${secure}`);

                    controllerInfo.push({
                        crud: `${key}(list)`,
                        method: method,
                        url: url,
                        secure: secure,
                    });

                    if (secure === true) {
                        this.#router[method](url, isLoggedIn, async (req, res, next) => this.readList(req, res, next));
                    } else if (secure === false) {
                        this.#router[method](url, isNotLoggedIn, async (req, res, next) => this.readList(req, res, next));
                    } else {
                        this.#router[method](url, async (req, res, next) => this.readList(req, res, next));
                    }
                }
            } else {
                if (this.#baseUrl[key]) {
                    url = this.#baseUrl[key].url;
                    secure = this.#baseUrl[key].secure;
                    //logger.debug(`crud: ${key}, method: ${method}, url: ${url}, secure: ${secure}`);

                    controllerInfo.push({
                        crud: key,
                        method: method,
                        url: url,
                        secure: secure,
                    });

                    if (secure === true) {
                        this.#router[method](url, isLoggedIn, async (req, res, next) => this[key](req, res, next));
                    } else if (secure === false) {
                        this.#router[method](url, isNotLoggedIn, async (req, res, next) => this[key](req, res, next));
                    } else {
                        this.#router[method](url, async (req, res, next) => this[key](req, res, next));
                    }
                }
            }
        }

        //logger.debugFrame(controllerInfo, this.constructor.name);
    }

    get router() {
        return this.#router;
    }

    get app() {
        return this.#app;
    }

    async readItem(req, res, next) {
        throw new Error("This is not supported!");
    }

    async readList(req, res, next) {
        throw new Error("This is not supported!");
    }

    async create(req, res, next) {
        throw new Error("This is not supported!");
    }

    async update(req, res, next) {
        throw new Error("This is not supported!");
    }

    async delete(req, res, next) {
        throw new Error("This is not supported!");
    }

    extendApi(method, url, cb, loginCheck = undefined) {
        if (loginCheck === true) {
            this.#router[method](url, isLoggedIn, cb);
        } else if (loginCheck === false) {
            this.#router[method](url, isNotLoggedIn, cb);
        } else {
            this.#router[method](url, cb);
        }
    }
}

module.exports = BaseController;
