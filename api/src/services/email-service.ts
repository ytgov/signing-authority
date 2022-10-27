import nodemailer, { Transporter, TransportOptions } from "nodemailer";
import { MailOptions } from "nodemailer/lib/json-transport";
import { MAIL_CONFIG, MAIL_FROM, NODE_ENV, FRONTEND_URL, APPLICATION_NAME, MAIL_CONFIG_DEV } from "../config";
import { Authority, PositionGroup, User } from "../data/models";
import fs from "fs";
import path from "path";

const FROM_ADDRESS = "";
const BASE_TEMPLATE = "../templates/email/base.html";
const FORMA_WORKFLOW_TEMPLATE = "../templates/email/form_a_notification.html";
const FORMB_WORKFLOW_TEMPLATE = "../templates/email/form_b_notification.html";
const FORMB_ACTIVATE_TEMPLATE = "../templates/email/form_b_activate.html";

export class EmailService {
  TRANSPORT: Transporter;

  constructor() {
    if (NODE_ENV != "development") this.TRANSPORT = nodemailer.createTransport(MAIL_CONFIG as TransportOptions);
    else this.TRANSPORT = nodemailer.createTransport(MAIL_CONFIG_DEV as TransportOptions);
  }

  async sendFormANotification(group: PositionGroup, users: User[], action: string, actor: string): Promise<any> {
    let templatePath = path.join(__dirname, FORMA_WORKFLOW_TEMPLATE);
    let content = fs.readFileSync(templatePath).toString();

    content = content.replace(
      /``DESTINATION_URL``/,
      `${FRONTEND_URL}/departments/${group.department_code}/form-a/${group._id}`
    );
    content = content.replace(/``ACTOR_NAME``/, actor);
    content = content.replace(/``DEPARTMENT``/, group.department_descr);
    content = content.replace(/``PROGRAM``/, `${group.program} / ${group.activity}`);
    content = content.replace(/``NEXT_ACTION``/, action);

    for (let recipient of users) {
      let fullName = `${recipient.first_name} ${recipient.last_name}`;

      console.log("-- EMAIL FORM-A SENDING", recipient.email, action);
      await this.sendEmail(fullName, recipient.email, "Form A Workflow Notification", content);
    }
  }

  async sendFormBNotification(formB: Authority, users: User[], action: string, actor: string): Promise<any> {
    let templatePath = path.join(__dirname, FORMB_WORKFLOW_TEMPLATE);
    let content = fs.readFileSync(templatePath).toString();

    content = content.replace(/``DESTINATION_URL``/, `${FRONTEND_URL}/form-b/${formB._id}`);
    content = content.replace(/``ACTOR_NAME``/, actor);
    content = content.replace(/``DEPARTMENT``/, formB.department_descr);
    content = content.replace(/``POSITION``/, formB.employee.title);
    content = content.replace(/``EMPLOYEE``/, formB.employee.name);
    content = content.replace(/``NEXT_ACTION``/, action);

    for (let recipient of users) {
      let fullName = `${recipient.first_name} ${recipient.last_name}`;

      console.log("-- EMAIL FORM-B SENDING", recipient.email);
      await this.sendEmail(fullName, recipient.email, "Form B Workflow Notification", content);
    }
  }

  async sendFormBActiveNotice(formB: Authority, effectiveDate: string): Promise<any> {
    let templatePath = path.join(__dirname, FORMB_ACTIVATE_TEMPLATE);
    let content = fs.readFileSync(templatePath).toString();
    let fullName = formB.employee.name;

    content = content.replace(/``EFFECTIVE_DATE``/, effectiveDate);

    await this.sendEmail(fullName, formB.employee.email, "Form B Activation", content);
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
      html: baseContent,
    };

    if (toEmail.length == 0) {
      console.log("Not sending email to " + toName + " without an email address");
      return null;
    }

    return this.TRANSPORT.sendMail(message);
  }
}
