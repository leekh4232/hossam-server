#!/usr/bin/env node
/**
 * Backend Server Core
 *
 * Express 기반 백엔드 서버 본체.
 * 이 파일을 루트 디렉토리의 app.js에서 참조하여 백엔드를 가동한다.
 *
 * author : Lee Kwang-Ho (leekh4232@gmail.com)
 */
/*----------------------------------------------------------
 * 1) 환경설정 파일 로드
 *----------------------------------------------------------*/
const os = require("os");
const { join } = require("path");
const fs = require('fs');

const home_dir = os.homedir();
let env_path = join(home_dir, ".mega-server");

if (!fs.existsSync(env_path)) {
    env_path = join(__dirname, ".env");
}

require('dotenv').config({path: env_path});

/*----------------------------------------------------------
 * 2) 모듈 참조
 *----------------------------------------------------------*/
const express = require("express");
const useragent = require("express-useragent");
const serveStatic = require("serve-static");
const serveFavicon = require("serve-favicon");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const cors = require("cors");
const expressWinston = require("express-winston");
const getJsonServerRouter = require("./helper/JsonServerHelper");

/*-----------------------------------------------------------
 * 3) Express 객체 생성 및 Helper 로드
 *----------------------------------------------------------*/
const app = express();
const logger = require("./helper/LogHelper");
const WebHelper = require("./helper/WebHelper");
const { myip, urlFormat, sendMail } = require("./helper/UtilHelper");
const { PageNotFoundException } = require("./helper/ExceptionHelper");

(() => {
    /*----------------------------------------------------------
    * 4) 클라이언트의 접속시 초기화
    *----------------------------------------------------------*/
    app.use(WebHelper());
    app.use(useragent.express());

    /*----------------------------------------------------------
    * 5) Express 객체의 추가 설정
    *----------------------------------------------------------*/
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.text());
    app.use(bodyParser.json());

    app.use(cors());

    app.use(methodOverride("X-HTTP-Method"));
    app.use(methodOverride("X-HTTP-Method-Override"));
    app.use(methodOverride("X-Method-Override"));

    app.use(
        expressWinston.logger({
            winstonInstance: logger,
            meta: false,
            msg: "[HTTP {{req.method}}/{{res.statusCode}}] {{req.protocol}}://{{req.get('host')}}{{decodeURIComponent(req.url)}} ({{res.responseTime}}ms) ({{(req.headers['x-forwarded-for'] || req.connection.remoteAddress || '').split(',')[0].trim()}},{{req.useragent.os}},{{req.useragent.browser}}-{{req.useragent.version}})",
            ignoreRoute: function (req, res) {
                return req.url.includes("_next");
            }
        })
    );

    app.use(serveFavicon(join(__dirname, process.env.FAVICON_PATH)));
    app.use("/", serveStatic(join(__dirname, process.env.STATIC_PATH)));
    app.use("/files", serveStatic(join(__dirname, process.env.UPLOAD_PATH)));

    app.enable("trust proxy");
    app.set("trust proxy", function () {
        return true;
    });

    const router = express.Router();
    app.use(router);

    /*----------------------------------------------------------
    * 6) 메일 발송 기능
    *----------------------------------------------------------*/
    router.post(`${process.env.BACKEND_PATH}/sendmail`, async (req, res, next) => {
        const {receiver_name, receiver_email, subject, content} = req.params;

        try {
            await sendMail(receiver_name, receiver_email, subject, content);
            res.sendResult();
        } catch (err) {
            next(err);
        }
    });

    /*----------------------------------------------------------
     * 7) 테스트용 DB파일 연결
     *----------------------------------------------------------*/
    const dbFilePath = join(__dirname, process.env.DB_FILE_PATH);
    const jsonServerRouter = getJsonServerRouter(dbFilePath);

    if (jsonServerRouter !== null) {
        console.log("Json Server is mounted >>> " + dbFilePath);
        app.use(process.env.BACKEND_PATH, jsonServerRouter);
    }

    /*----------------------------------------------------------
    * 8) 에러 핸들링
    *----------------------------------------------------------*/
    app.use((err, req, res, next) => res.sendError(err));
    app.use("*", (req, res, next) => {
        if (req.originalUrl.indexOf(process.env.NEXT_PUBLIC_API_ROOT_URL) > -1) {
            const current_url = urlFormat({
                protocol: req.protocol,
                host: req.get("host"),
                port: req.port,
                pathname: req.originalUrl,
            });

            res.sendError(new PageNotFoundException(`${current_url} not found`));
        } else {
            next();
        }
    });

    /*----------------------------------------------------------
    * 9) 설정한 내용을 기반으로 서버 구동 시작
    *----------------------------------------------------------*/
    app.listen(process.env.HTTP_PORT, function () {
        console.log("+----------------------------------------------+");
        console.log("|             Hossam Backend Server            |");
        console.log("|             메가스터디 IT 아카데미           |");
        console.log("|       이광호 강사 (leekh4232@gmail.com)      |");
        console.log("+----------------------------------------------+");
        console.log("본 프로그램은 메가스터디IT아카데미 프론트엔드 수업에서의 활용을 목적으로 개발되었습니다.\nMIT 라이센스를 따릅니다.\n");
        logger.info(`Server Home: ${__dirname}`);
        logger.info(`Env File Path: ${env_path}`);
        logger.info(`Data File Path: ${join(__dirname, process.env.DB_FILE_PATH)}`);
        logger.info(`Static Directory Path: ${join(__dirname, process.env.STATIC_PATH)}`);
        logger.info(`HTTP server listening on port : ${process.env.HTTP_PORT}`);
        logger.info(`Backend Address (1) : http://localhost:${process.env.HTTP_PORT}${process.env.BACKEND_PATH}`);
        logger.info(`Backend Address (2) : http://127.0.0.1:${process.env.HTTP_PORT}${process.env.BACKEND_PATH}`);
        logger.info(`Backend Address (3) : http://${myip()[0]}:${process.env.HTTP_PORT}${process.env.BACKEND_PATH}`);
    });

    process.on("exit", function () {
        logger.info("Server is shutdown");
    });

    process.on("SIGINT", () => {
        process.exit();
    });
})();