/**
 * @FileName : WebHelper.js
 * @Description : 백엔드 개발시 자주 사용되는 res, req 확장 함수들 모음
 * @Author : Lee Kwang-Ho (leekh4232@gmail.com)
 */
const { ForbiddenException, BadRequestException } = require("./ExceptionHelper");
const logger = require("./LogHelper");
const { urlFormat } = require("./UtilHelper");

const WebHelper = () => {
    return (req, res, next) => {
        /** Express의 req, res의 기능을 확장 */
        // req.foo = () => { ... };
        // res.bar = () => { ... };

        /** 프론트엔드에게 JSON결과를 출력하는 기능 */
        res._sendResult = (data, error = null) => {
            /**
                {
                    rt: 결과 (OK, 혹은 에러 이름),
                    rtcode: HTTP 상태코드 (200,400,404,500)
                    rtmsg: 결과메시지 (OK 없음. 에러인 경우 에러 내용)
                    ... JSON 데이터 ...
                    pubdate: 생성일시
                }
             */
            const json = {
                name: "Success",
                status: 200,
                message: "OK",
            };

            if (error) {
                json.error = error.name || "Server Error";
                json.status = error.code || 500;
                json.message = error.message || "요청을 처리하는데 실패했습니다.";

                if (isNaN(json.status)) {
                    json.status = 500;
                }

                json.trace = error.stack;
            }

            if (data) {
                for (const item in data) {
                    json[item] = data[item];
                }
            }

            // 표준시로부터 한국의 시차를 적용하여 ISO 포멧을 생성
            const offset = new Date().getTimezoneOffset() * 60000;
            const today = new Date(Date.now() - offset);
            json.timestamp = today.toISOString();

            res.header("Content-Type", "application/json; charset=utf-8");
            res.header("name", encodeURIComponent(json.rt));
            res.header("message", encodeURIComponent(json.rtmsg));
            res.status(json.status || 200).send(json);
        };

        /** 결과가 200(OK)인 경우에 대한 JSON 출력 */
        res.sendResult = (data) => {
            res._sendResult(data);
        };

        /** 에러처리 출력 */
        res.sendError = (error) => {
            // logger.error("--------------------------------------------------");
            // logger.error(`[${error.code} ${error.name}]`);
            // logger.error(`>>> ${error.message}`);
            // logger.error("--------------------------------------------------");
            // logger.error(`${error.stack}`);
            // logger.error("--------------------------------------------------\n\n");

            if (error.code != 401 && error.message.indexOf("__nextjs") == -1) {
                Error.stackTraceLimit = 3;

                const current_url = urlFormat({
                    protocol: req.protocol,
                    host: req.get("host"),
                    port: req.port,
                    pathname: req.originalUrl,
                });

                const errorInfo = {
                    error: `${error.code} ${error.name}`,
                    message: error.message,
                    url: `[${req.method}] ${decodeURIComponent(current_url)}`,
                    client: `${(req.headers['x-forwarded-for'] || req.connection.remoteAddress || '').split(',')[0].trim()} / ${req.useragent.os} / ${req.useragent.browser}-${req.useragent.version}`,
                    //trace: error.stack,
                };

                //logger.errorTable();

                logger.error("--------------------------------------------------");
                for (const item in errorInfo) {
                    logger.error(`${item} : ${errorInfo[item]}`);
                }
                logger.error("--------------------------------------------------");
            }

            res._sendResult(null, error);
        };

        res.sendForbidden = (msg) => {
            res.sendError(new ForbiddenException(msg));
        };

        res.sendUnauthorized = (msg) => {
            res.sendError(new UnauthorizedException(msg));
        };

        res.sendBadRequest = (msg) => {
            res.sendError(new BadRequestException(msg));
        };

        // express의 그 다음 처리 단계로 넘어간다.
        next();
    };
};

module.exports = WebHelper;
