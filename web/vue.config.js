var dotenv = require('dotenv')

process.env.VUE_APP_TEST = "Booyeah"


let path;
switch (process.env.NODE_ENV) {
  case "test":
    path = `../.env.uat`;
    break;
  case "production":
    path = `../.env.production`;
    break;
  default:
    path = `../.env.development`;
}


dotenv.config({ path: path });
