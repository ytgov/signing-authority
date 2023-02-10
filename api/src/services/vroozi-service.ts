import axios from "axios";
import { SignatureV4 } from "@aws-sdk/signature-v4";
import { Sha256 } from "@aws-crypto/sha256-js";
import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, VROOZI_ENDPOINT_URL } from "../config";

export class VrooziService {
  async test() {
    const apiUrl = new URL(VROOZI_ENDPOINT_URL);

    const sigv4 = new SignatureV4({
      //service: "execute-api",
      service: "lambda",
      region: "ap-southeast-2",
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },

      sha256: Sha256,
    });

    const handler = async () => {
      const signed = await sigv4.sign({
        method: "GET",
        hostname: apiUrl.host,
        path: apiUrl.pathname,
        protocol: apiUrl.protocol,
        headers: {
          "Content-Type": "application/json",
          host: apiUrl.hostname, // compulsory
        },
      });

      try {
        const { data } = await axios({
          ...signed,
          url: VROOZI_ENDPOINT_URL, // compulsory
        });

        console.log("Successfully received data: ", data);
        return data;
      } catch (error) {
        console.log("An error occurred", error);

        throw error;
      }
    };

    handler();
  }

  async getUsers() {
    const apiUrl = new URL("https://47egbqfyfzja7mup76teh7ldgu0alnlt.lambda-url.ap-southeast-2.on.aws/");

    const sigv4 = new SignatureV4({
      service: "lambda",
      region: "ap-southeast-2",
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },

      sha256: Sha256,
    });

    const signed = await sigv4.sign({
      method: "GET",
      hostname: apiUrl.host,
      path: apiUrl.pathname,
      protocol: apiUrl.protocol,
      headers: {
        "Content-Type": "application/json",
        host: apiUrl.hostname, // compulsory
      },
    });

    const apiResponse = await axios({
      ...signed,
      url: apiUrl.toString(), // compulsory
    })
      .then((resp) => {
        console.log("Successfully received data: ", resp.data);
        return resp.data;
      })
      .catch((err) => {
        console.log(err.response.status, err.response.data);
      });

    return apiResponse;
  }

  async sendAuthorities(body: any): Promise<any> {
    const apiUrl = new URL(VROOZI_ENDPOINT_URL);

    const sigv4 = new SignatureV4({
      service: "lambda",
      region: "ap-southeast-2",
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },

      sha256: Sha256,
    });

    const signed = await sigv4.sign({
      method: "POST",
      hostname: apiUrl.host,
      path: apiUrl.pathname,
      protocol: apiUrl.protocol,
      headers: {
        "Content-Type": "application/json",
        host: apiUrl.hostname, // compulsory
      },

      body: JSON.stringify(body),
    });

    const apiResponse = await axios({
      ...signed,
      url: VROOZI_ENDPOINT_URL, // compulsory
      data: body,
    })
      .then((resp) => {
        console.log("Successfully received data: ", resp.data);
        return resp.data;
      })
      .catch((err) => {
        console.log(err.response.status, err.response.data);
      });

    return apiResponse;
  }
}
