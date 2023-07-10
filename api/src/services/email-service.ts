import nodemailer, { Transporter, TransportOptions } from "nodemailer";
import { MailOptions } from "nodemailer/lib/json-transport";
import {
  MAIL_CONFIG,
  MAIL_FROM,
  NODE_ENV,
  FRONTEND_URL,
  APPLICATION_NAME,
  MAIL_CONFIG_DEV,
  SUSPEND_EMAIL,
} from "../config";
import { Authority, Position, PositionGroup, User } from "../data/models";
import fs from "fs";
import path from "path";

const BASE_TEMPLATE = "../templates/email/base.html";

const FORMA_FINREVIEW_TEMPLATE = "../templates/email/form_a_finance_review.html";
const FORMA_FINREVIEW_APPROVE_TEMPLATE = "../templates/email/form_a_finance_review_appove.html";
const FORMA_FINREVIEW_REJECT_TEMPLATE = "../templates/email/form_a_finance_review_reject.html";
const FORMA_FINAPPROVE_APPROVE_TEMPLATE = "../templates/email/form_a_finance_approve_appove.html";
const FORMA_FINAPPROVE_REJECT_TEMPLATE = "../templates/email/form_a_finance_approve_reject.html";
const FORMA_UPLOAD_TEMPLATE = "../templates/email/form_a_upload.html";

const FORMB_UPLOAD_TEMPLATE = "../templates/email/form_b_upload.html";
const FORMB_REVIEW_TEMPLATE = "../templates/email/form_b_review.html";
const FORMB_APPROVE_TEMPLATE = "../templates/email/form_b_approve.html";
const FORMB_REJECT_TEMPLATE = "../templates/email/form_b_reject.html";

const FORMB_ACTIVATE_TEMPLATE = "../templates/email/form_b_activate.html";
const FORMB_ACTING_TEMPLATE = "../templates/email/form_b_acting.html";

const FORMB_ACTING_APPROVE_NOTIFY_TEMPLATE = "../templates/email/form_b_acting_approve_notify.html";
const FORMB_ACTING_APPROVE_TEMPLATE = "../templates/email/form_b_acting_approve.html";

const FORMA_DM_TEMPLATE = "../templates/email/form_a_dm_notification.html";
const FORMA_DM_APPROVE = "../templates/email/form_a_dm_approve.html";
const FORMA_DM_REJECT = "../templates/email/form_a_dm_reject.html";

export class EmailService {
  TRANSPORT: Transporter;

  constructor() {
    if (NODE_ENV != "development") this.TRANSPORT = nodemailer.createTransport(MAIL_CONFIG as TransportOptions);
    else this.TRANSPORT = nodemailer.createTransport(MAIL_CONFIG_DEV as TransportOptions);
  }

  async sendFormAFinReview(group: PositionGroup, users: User[], action: string, actor: string): Promise<any> {
    let templatePath = path.join(__dirname, FORMA_FINREVIEW_TEMPLATE);
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

      console.log("-- EMAIL FORM-A FINREVIEW SENDING", recipient.email, action);
      await this.sendEmail(fullName, recipient.email, "Form A Ready for Review", content);
    }
  }

  async sendFormAReviewApprove(
    group: PositionGroup,
    recipient: User,
    action: string,
    actor: string,
    extraHtml: string = ""
  ): Promise<any> {
    let templatePath = path.join(__dirname, FORMA_FINREVIEW_APPROVE_TEMPLATE);
    let content = fs.readFileSync(templatePath).toString();

    content = content.replace(
      /``DESTINATION_URL``/,
      `${FRONTEND_URL}/departments/${group.department_code}/form-a/${group._id}`
    );
    content = content.replace(/``ACTOR_NAME``/, actor);
    content = content.replace(/``DEPARTMENT``/, group.department_descr);
    content = content.replace(/``PROGRAM``/, `${group.program} / ${group.activity}`);
    content = content.replace(/``NEXT_ACTION``/, action);
    content = content.replace(/``EXTRA_HTML``/, extraHtml);

    let fullName = `${recipient.first_name} ${recipient.last_name}`;

    console.log("-- EMAIL FORM-A FINREVIEWED SENDING", recipient.email, action);
    await this.sendEmail(fullName, recipient.email, "Form A Review Completed", content);
  }

  async sendFormAReviewReject(
    group: PositionGroup,
    recipient: User,
    action: string,
    actor: string,
    extraHtml: string = ""
  ): Promise<any> {
    let templatePath = path.join(__dirname, FORMA_FINREVIEW_REJECT_TEMPLATE);
    let content = fs.readFileSync(templatePath).toString();

    content = content.replace(
      /``DESTINATION_URL``/,
      `${FRONTEND_URL}/departments/${group.department_code}/form-a/${group._id}`
    );
    content = content.replace(/``ACTOR_NAME``/, actor);
    content = content.replace(/``DEPARTMENT``/, group.department_descr);
    content = content.replace(/``PROGRAM``/, `${group.program} / ${group.activity}`);
    content = content.replace(/``NEXT_ACTION``/, action);
    content = content.replace(/``EXTRA_HTML``/, extraHtml);

    let fullName = `${recipient.first_name} ${recipient.last_name}`;

    console.log("-- EMAIL FORM-A FINREVIEWED SENDING", recipient.email, action);
    await this.sendEmail(fullName, recipient.email, "Form A Review Rejected", content);
  }

  async sendFormAApproveApprove(
    group: PositionGroup,
    recipient: User,
    action: string,
    actor: string,
    extraHtml: string = ""
  ): Promise<any> {
    let templatePath = path.join(__dirname, FORMA_FINAPPROVE_APPROVE_TEMPLATE);
    let content = fs.readFileSync(templatePath).toString();

    content = content.replace(
      /``DESTINATION_URL``/,
      `${FRONTEND_URL}/departments/${group.department_code}/form-a/${group._id}`
    );
    content = content.replace(/``ACTOR_NAME``/, actor);
    content = content.replace(/``DEPARTMENT``/, group.department_descr);
    content = content.replace(/``PROGRAM``/, `${group.program} / ${group.activity}`);
    content = content.replace(/``NEXT_ACTION``/, action);
    content = content.replace(/``EXTRA_HTML``/, extraHtml);

    let fullName = `${recipient.first_name} ${recipient.last_name}`;

    console.log("-- EMAIL FORM-A FINAPPROVE SENDING", recipient.email, action);
    await this.sendEmail(fullName, recipient.email, "Form A Review Completed", content);
  }

  async sendFormAApproveReject(
    group: PositionGroup,
    recipient: User,
    action: string,
    actor: string,
    extraHtml: string = ""
  ): Promise<any> {
    let templatePath = path.join(__dirname, FORMA_FINAPPROVE_REJECT_TEMPLATE);
    let content = fs.readFileSync(templatePath).toString();

    content = content.replace(
      /``DESTINATION_URL``/,
      `${FRONTEND_URL}/departments/${group.department_code}/form-a/${group._id}`
    );
    content = content.replace(/``ACTOR_NAME``/, actor);
    content = content.replace(/``DEPARTMENT``/, group.department_descr);
    content = content.replace(/``PROGRAM``/, `${group.program} / ${group.activity}`);
    content = content.replace(/``NEXT_ACTION``/, action);
    content = content.replace(/``EXTRA_HTML``/, extraHtml);

    let fullName = `${recipient.first_name} ${recipient.last_name}`;

    console.log("-- EMAIL FORM-A FINREJECT SENDING", recipient.email, action);
    await this.sendEmail(fullName, recipient.email, "Form A Review Completed", content);
  }

  async sendFormAUpload(
    group: PositionGroup,
    users: User[],
    action: string,
    actor: string,
    extraHtml: string = ""
  ): Promise<any> {
    let templatePath = path.join(__dirname, FORMA_UPLOAD_TEMPLATE);
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

      console.log("-- EMAIL FORM-A FINREJECT SENDING", recipient.email, action);
      await this.sendEmail(fullName, recipient.email, "Form A PDF Upload", content);
    }
  }

  async sendDMNotification(position: Position, users: User[]): Promise<any> {
    let templatePath = path.join(__dirname, FORMA_DM_TEMPLATE);
    let content = fs.readFileSync(templatePath).toString();

    content = content.replace(
      /``DESTINATION_URL``/,
      `${FRONTEND_URL}/departments/${position.department_code}/positions/${position._id}`
    );
    content = content.replace(/``DEPARTMENT``/, position.department_descr);

    for (let recipient of users) {
      let fullName = `${recipient.first_name} ${recipient.last_name}`;

      console.log("-- EMAIL FORM-A_DM SENDING", recipient.email, position.department_code);
      await this.sendEmail(fullName, recipient.email, "DM Form A Workflow Notification", content);
    }
  }

  async sendDMApproved(position: Position, recipient: User): Promise<any> {
    let templatePath = path.join(__dirname, FORMA_DM_APPROVE);
    let content = fs.readFileSync(templatePath).toString();

    content = content.replace(
      /``DESTINATION_URL``/,
      `${FRONTEND_URL}/departments/${position.department_code}/positions/${position._id}`
    );
    content = content.replace(/``DEPARTMENT``/, position.department_descr);

    let fullName = `${recipient.first_name} ${recipient.last_name}`;

    console.log("-- EMAIL FORM-A_DM SENDING", recipient.email, position.department_code);
    await this.sendEmail(fullName, recipient.email, "DM Form A Approved", content);
  }

  async sendDMRejected(position: Position, recipient: User, comment: string): Promise<any> {
    let templatePath = path.join(__dirname, FORMA_DM_REJECT);
    let content = fs.readFileSync(templatePath).toString();

    content = content.replace(
      /``DESTINATION_URL``/,
      `${FRONTEND_URL}/departments/${position.department_code}/positions/${position._id}`
    );
    content = content.replace(/``DEPARTMENT``/, position.department_descr);
    content = content.replace(/``COMMENT``/, comment);

    let fullName = `${recipient.first_name} ${recipient.last_name}`;

    console.log("-- EMAIL FORM-A_DM SENDING", recipient.email, position.department_code);
    await this.sendEmail(fullName, recipient.email, "DM Form A Rejected", content);
  }

  async sendFormBUpload(
    formB: Authority,
    users: User[],
    action: string,
    actor: string,
    extraHtml: string = ""
  ): Promise<any> {
    let templatePath = path.join(__dirname, FORMB_UPLOAD_TEMPLATE);
    let content = fs.readFileSync(templatePath).toString();

    content = content.replace(/``DESTINATION_URL``/, `${FRONTEND_URL}/form-b/${formB._id}`);
    content = content.replace(/``ACTOR_NAME``/, actor);
    content = content.replace(/``DEPARTMENT``/, formB.department_descr);
    content = content.replace(/``POSITION``/, formB.employee.title);
    content = content.replace(/``EMPLOYEE``/, formB.employee.name);
    content = content.replace(/``NEXT_ACTION``/, action);
    content = content.replace(/``EXTRA_HTML``/, extraHtml);

    for (let recipient of users) {
      let fullName = `${recipient.first_name} ${recipient.last_name}`;

      console.log("-- EMAIL FORM-B-UPLOAD SENDING", recipient.email, action);
      await this.sendEmail(fullName, recipient.email, "Form B Upload Signatures", content);
    }
  }

  async sendFormBReview(
    formB: Authority,
    users: User[],
    action: string,
    actor: string,
    extraHtml: string = ""
  ): Promise<any> {
    let templatePath = path.join(__dirname, FORMB_REVIEW_TEMPLATE);
    let content = fs.readFileSync(templatePath).toString();

    content = content.replace(/``DESTINATION_URL``/, `${FRONTEND_URL}/form-b/${formB._id}`);
    content = content.replace(/``ACTOR_NAME``/, actor);
    content = content.replace(/``DEPARTMENT``/, formB.department_descr);
    content = content.replace(/``POSITION``/, formB.employee.title);
    content = content.replace(/``EMPLOYEE``/, formB.employee.name);
    content = content.replace(/``NEXT_ACTION``/, action);
    content = content.replace(/``EXTRA_HTML``/, extraHtml);

    for (let recipient of users) {
      let fullName = `${recipient.first_name} ${recipient.last_name}`;

      console.log("-- EMAIL FORM-B-REVIEW SENDING", recipient.email, action);
      await this.sendEmail(fullName, recipient.email, "Form B Review", content);
    }
  }

  async sendFormBApprove(
    formB: Authority,
    users: User[],
    action: string,
    actor: string,
    extraHtml: string = ""
  ): Promise<any> {
    let templatePath = path.join(__dirname, FORMB_APPROVE_TEMPLATE);
    let content = fs.readFileSync(templatePath).toString();

    content = content.replace(/``DESTINATION_URL``/, `${FRONTEND_URL}/form-b/${formB._id}`);
    content = content.replace(/``ACTOR_NAME``/, actor);
    content = content.replace(/``DEPARTMENT``/, formB.department_descr);
    content = content.replace(/``POSITION``/, formB.employee.title);
    content = content.replace(/``EMPLOYEE``/, formB.employee.name);
    content = content.replace(/``NEXT_ACTION``/, action);
    content = content.replace(/``EXTRA_HTML``/, extraHtml);

    for (let recipient of users) {
      let fullName = `${recipient.first_name} ${recipient.last_name}`;

      console.log("-- EMAIL FORM-B_APPROVE SENDING", recipient.email, action);
      await this.sendEmail(fullName, recipient.email, "Form B Approved", content);
    }
  }

  async sendFormBReject(
    formB: Authority,
    users: User[],
    action: string,
    actor: string,
    extraHtml: string = ""
  ): Promise<any> {
    let templatePath = path.join(__dirname, FORMB_REJECT_TEMPLATE);
    let content = fs.readFileSync(templatePath).toString();

    content = content.replace(/``DESTINATION_URL``/, `${FRONTEND_URL}/form-b/${formB._id}`);
    content = content.replace(/``ACTOR_NAME``/, actor);
    content = content.replace(/``DEPARTMENT``/, formB.department_descr);
    content = content.replace(/``POSITION``/, formB.employee.title);
    content = content.replace(/``EMPLOYEE``/, formB.employee.name);
    content = content.replace(/``NEXT_ACTION``/, action);
    content = content.replace(/``EXTRA_HTML``/, extraHtml);

    for (let recipient of users) {
      let fullName = `${recipient.first_name} ${recipient.last_name}`;

      console.log("-- EMAIL FORM-B-REJECT SENDING", recipient.email, action);
      await this.sendEmail(fullName, recipient.email, "Form B Rejected", content);
    }
  }

  async sendFormBActiveNotice(formB: Authority, effectiveDate: string): Promise<any> {
    let templatePath = path.join(__dirname, FORMB_ACTIVATE_TEMPLATE);
    let content = fs.readFileSync(templatePath).toString();
    let fullName = formB.employee.name;

    content = content.replace(/``EFFECTIVE_DATE``/, effectiveDate);

    await this.sendEmail(fullName, formB.employee.email, "Form B Activation", content);
  }

  async sendFormBActingNotice(formB: Authority, approverEmail: string): Promise<any> {
    let templatePath = path.join(__dirname, FORMB_ACTING_TEMPLATE);
    let content = fs.readFileSync(templatePath).toString();

    content = content.replace(/``EMPLOYEE``/, formB.employee.name);
    content = content.replace(/``DESTINATION_URL``/, `${FRONTEND_URL}/form-b/${formB._id}`);

    await this.sendEmail(approverEmail, approverEmail, "Form B Acting Approval", content);
  }

  async sendFormBActingApproveNotice(formB: Authority, effectiveDate: string, expireDate: string): Promise<any> {
    let templatePath = path.join(__dirname, FORMB_ACTING_APPROVE_NOTIFY_TEMPLATE);
    let content = fs.readFileSync(templatePath).toString();
    let fullName = formB.employee.name;

    content = content.replace(/``EFFECTIVE_DATE``/, effectiveDate);
    content = content.replace(/``EXPIRE_DATE``/, expireDate);
    content = content.replace(/``POSITION``/, formB.employee.title);

    await this.sendEmail(fullName, formB.employee.email, "Form B Acting Approval", content);
  }

  async sendFormBActingApprove(formB: Authority, approverEmail: string): Promise<any> {
    let templatePath = path.join(__dirname, FORMB_ACTING_TEMPLATE);
    let content = fs.readFileSync(templatePath).toString();

    content = content.replace(/``EMPLOYEE``/, formB.employee.name);
    content = content.replace(/``DESTINATION_URL``/, `${FRONTEND_URL}/form-b/${formB._id}`);

    await this.sendEmail(approverEmail, approverEmail, "Form B Acting Approval", content);
  }

  async sendFormBActingApproveCreatorNotice(
    formB: Authority,
    users: User[],
    effectiveDate: string,
    expireDate: string
  ): Promise<any> {
    let templatePath = path.join(__dirname, FORMB_ACTING_APPROVE_TEMPLATE);
    let content = fs.readFileSync(templatePath).toString();

    content = content.replace(/``EFFECTIVE_DATE``/, effectiveDate);
    content = content.replace(/``EXPIRE_DATE``/, expireDate);
    content = content.replace(/``POSITION``/, formB.employee.title);
    content = content.replace(/``ACTOR``/, formB.employee.name);

    for (let recipient of users) {
      let fullName = `${recipient.first_name} ${recipient.last_name}`;

      console.log("-- EMAIL FORM-B-ACTING APPROVE CREATOR SENDING", recipient.email);
      await this.sendEmail(fullName, recipient.email, "Form B Acting Approval", content);
    }
  }

  async sendEmail(toName: string, toEmail: string, subject: string, customContent: string): Promise<any> {
    if (SUSPEND_EMAIL) return false;

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

    if (!toEmail || toEmail.length == 0) {
      console.log("Not sending email to " + toName + " without an email address");
      return null;
    }

    return this.TRANSPORT.sendMail(message);
  }
}
