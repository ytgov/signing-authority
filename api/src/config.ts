import * as dotenv from "dotenv";

export const NODE_ENV = process.env.NODE_ENV || "development";

let path;
switch (process.env.NODE_ENV) {
  case "test":
    path = `../../.env.test`;
    break;
  case "production":
    path = `../.env.production`;
    break;
  default:
    path = `../.env.development`;
}

dotenv.config({ path: path });

console.log(`LOADING ${NODE_ENV} CONFIG FROM ${path}`);
export const apiBaseUrl = process.env.NODE_ENV == "production" ? "" : "http://localhost:3000";
export const API_PORT = process.env.API_PORT || "3000";
export const FRONTEND_URL = process.env.FRONTEND_URL || "";
export const AUTH_REDIRECT = process.env.AUTH_REDIRECT || "";


export const AUTH0_DOMAIN = `${process.env.VUE_APP_AUTH_DOMAIN}/` || "";
export const AUTH0_AUDIENCE = process.env.VUE_APP_AUTH_AUDIENCE || "";

export const APPLICATION_NAME = process.env.APPLICATION_NAME || "";

export const MONGO_DB = process.env.MONGO_DB || "";
export const MONGO_HOST = process.env.MONGO_HOST || "";
export const MONGO_URL = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}`

export const API_GATEWAY_KEY = process.env.API_GATEWAY_KEY || "";

export const MAIL_FROM = process.env.MAIL_FROM || "signing-authority@yukon.ca";
export const MAIL_HOST = process.env.MAIL_HOST || "smtp.gov.yk.ca";
export const MAIL_PORT = process.env.MAIL_PORT || 25;
export const MAIL_USER = process.env.MAIL_USER || "";
export const MAIL_PASS = process.env.MAIL_PASS || "";

export const MAIL_CONFIG_DEV = {
  host: MAIL_HOST,
  port: MAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  }
};

export const MAIL_CONFIG = {
  host: MAIL_HOST,
  port: MAIL_PORT,
  secure: false, // true for 465, false for other ports
};
