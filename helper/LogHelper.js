/**
 * @FileName : LogHelper.js
 * @Description : 로그처리 유틸리티
 * @Author : Lee Kwang-Ho (leekh4232@gmail.com)
 */

/** 1) 패키지 참조 */
const table = require("table").table;
const winston = require("winston");
const winstonDaily = require("winston-daily-rotate-file");

/** 3) 로그가 출력될 형식 지정하기 위한 함수 추출 */
const { combine, timestamp, printf, splat, colorize } = winston.format;

/** 4) winston 객체 만들기 */
const logger = winston.createLogger({
    // 로그의 전반적인 형식
    format: combine(
        timestamp({
            // 날짜 출력형식은 https://day.js.org/docs/en/display/format 참고
            //format: 'YYYY-MM-DD HH:mm:ss',
            format: "YY/MM/DD HH:mm:ss SSS",
        }),
        printf((info) => {
            return `${info.timestamp} [${info.level}]: ${info.message}`;
        }),
        splat()
    ),
    // 일반 로그 규칙 정의
    transports: [
        // 하루에 하나씩 파일 형태로 기록하기 위한 설정
        /*new winstonDaily({
            name: "log",
            level: process.env.LOG_LEVEL, // 출력할 로그의 수준.
            datePattern: "YYMMDD", // 파일 이름에 표시될 날짜형식
            dirname: process.env.LOG_PATH, // 파일이 저장될 위치
            filename: "log_%DATE%.log", // 파일이름 형식
            maxsize: 50000000,
            maxFiles: 50,
            zippedArchive: true,
        }),*/
        // 하루에 하나씩 파일 형태로 기록하기 위한 설정
        /*new winstonDaily({
            name: "error",
            level: "error", // 출력할 로그의 수준.
            datePattern: "YYMMDD", // 파일 이름에 표시될 날짜형식
            dirname: process.env.LOG_PATH, // 파일이 저장될 위치
            filename: "error_%DATE%.log", // 파일이름 형식
            maxsize: 50000000,
            maxFiles: 50,
            zippedArchive: true,
        }),*/
    ],
});

/** 5) 로그에 대한 콘솔 설정 */
if (process.env.NODE_ENV === "development") {
    logger.add(
        new winston.transports.Console({
            prettyPrint: true,
            showLevel: true,
            level: process.env.LOG_LEVEL,
            format: combine(
                colorize({ all: true }),
                printf((info) => {
                    return `${info.timestamp} [${info.level}]: ${info.message}`;
                })
            ),
        })
    );
}

__getLogTable = (items, title = null) => {
    const config = {
        columns: [{ alignment: "left" }, { alignment: "left" }],
    };

    const rows = [];

    if (title) {
        rows.push([title, ""]);
        config.spanningCells = [{ col: 0, row: 0, colSpan: 2, alignment: "center" }];
    }

    for (const attr in items) {
        rows.push([attr, items[attr]]);
    }

    const tag = table(rows, config);
    const line = tag.split("\n");

    return line;
};

__getLogFrame = (items, title = null) => {

    if (!items || items.length === 0) {
        return [];
    }

    const keys = Object.keys(items[0]);
    const colsize = keys.length;
    const rows = [];

    const config = {};

    if (title) {
        const row = new Array(colsize).fill("");
        row[0] = title;
        rows.push(row);
        config.spanningCells = [{ col: 0, row: 0, colSpan: colsize, alignment: "center" }];
    }

    rows.push(keys.map((v) => `[${v}]`));

    items.forEach((v, i) => {
        const item = [];

        for (const attr in v) {
            item.push(v[attr]);
        }

        rows.push(item);
    });

    const tag = table(rows, config);
    const line = tag.split("\n");

    return line;
};

logger.infoTable = (items, title = null) => {
    __getLogTable(items, title).forEach((v, i) => v && logger.info(v));
};

logger.debugTable = (items, title = null) => {
    __getLogTable(items, title).forEach((v, i) => v && logger.debug(v));
};

logger.errorTable = (items, title = null) => {
    __getLogTable(items, title).forEach((v, i) => v && logger.error(v));
};

logger.infoFrame = (items, title = null) => {
    if (items) {
        __getLogFrame(items, title).forEach((v, i) => v && logger.info(v));
    }
};

logger.debugFrame = (items, title = null) => {
    if (items) {
        __getLogFrame(items, title).forEach((v, i) => v && logger.debug(v));
    }
};

logger.errorFrame = (items, title = null) => {
    if (items) {
        __getLogFrame(items, title).forEach((v, i) => v && logger.error(v));
    }
};

/** 6) 생성한 로그 객체 내보내기 */
module.exports = logger;
