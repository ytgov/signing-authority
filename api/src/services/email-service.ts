import nodemailer, { Transporter, TransportOptions } from "nodemailer";
import { MailOptions } from "nodemailer/lib/json-transport";
import { AuthUser } from "../data";
import { MAIL_CONFIG, MAIL_FROM, NODE_ENV, FRONTEND_URL, APPLICATION_NAME, MAIL_CONFIG_DEV } from "../config";
import fs from "fs";
import path from "path";

const FROM_ADDRESS = "";
const BASE_TEMPLATE = "../templates/base.html";
const USER_CHANGE_TEMPLATE = "../templates/user-changed.html";

export class EmailService {

    TRANSPORT: Transporter;

    constructor() {
        if (NODE_ENV != "development")
            this.TRANSPORT = nodemailer.createTransport(MAIL_CONFIG as TransportOptions);
        else
            this.TRANSPORT = nodemailer.createTransport(MAIL_CONFIG_DEV as TransportOptions);
    }

    async sendPersonChangeNotification(user: AuthUser): Promise<any> {
        let templatePath = path.join(__dirname, USER_CHANGE_TEMPLATE);
        let content = fs.readFileSync(templatePath).toString();
        let fullName = `${user.first_name} ${user.last_name}`;

        return this.sendEmail(fullName, user.email, "Account Change", content);
    }

    async sendEmail(toName: string, toEmail: string, subject: string, customContent: string): Promise<any> {
        let basePath = path.join(__dirname, BASE_TEMPLATE);
        let baseContent = fs.readFileSync(basePath).toString();

        baseContent = baseContent.replace(/``CUSTOM_CONTENT``/, customContent);
        baseContent = baseContent.replace(/``APPLICATION_URL``/g, FRONTEND_URL);
        baseContent = baseContent.replace(/``APPLICATION_NAME``/g, APPLICATION_NAME);
        baseContent = baseContent.replace(/``TO_NAME``/g, toName);
        baseContent = baseContent.replace(/``TO_EMAIL``/g, toEmail);

        let message: MailOptions = {
            from: MAIL_FROM,
            to: `"${toName}" <${toEmail}>`,
            subject: `${subject} : ${APPLICATION_NAME}`,
            html: baseContent
        };
        
        if (toEmail.length == 0) {
            console.log("Not sending email to " + toName + " without an email address");
            return null;
        }

        return this.TRANSPORT.sendMail(message);
    }
}
