/**
 * @FileName : UtilHelper.js
 * @Description : 백엔드 개발시 자주 사용되는 독립 함수들 모음
 * @Author : Lee Kwang-Ho (leekh4232@gmail.com)
 */
const { networkInterfaces } = require("os");
const nodemailer = require("nodemailer");
const logger = require("./LogHelper");

class UtilHelper {
    static #current = null;

    static getInstance() {
        if (UtilHelper.#current === null) {
            UtilHelper.#current = new UtilHelper();
        }

        return UtilHelper.#current;
    }

    myip() {
        const ipAddress = [];
        const nets = networkInterfaces();

        for (const attr in nets) {
            const item = nets[attr];

            item.map((v, i) => {
                if ((v.family == "IPv4" || v.family == 4) && v.address != "127.0.0.1") {
                    ipAddress.push(v.address);
                }
            });
        }

        return ipAddress;
    }

    urlFormat(urlObject) {
        return String(Object.assign(new URL("http://a.com"), urlObject));
    }

    async sendMail(receiverName, receiverEmail, subject, content) {
        const writerEmail = `${process.env.SMTP_USERNAME} <${process.env.SMTP_USERMAIL}>`;

        if (receiverName) {
            receiverEmail = `${receiverName} <${receiverEmail}>`;
        }

        const smtp = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth: {
                user: process.env.SMTP_USERMAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        try {
            await smtp.sendMail({
                from: writerEmail,
                to: receiverEmail,
                subject: subject,
                html: content,
            });
        } catch (e) {
            console.error(e);
            throw new Error("메일 발송에 실패했습니다.");
        }
    }
}

module.exports = UtilHelper.getInstance();
