import axios from "axios";
import { FM_ACCOUNT_LOOKUP_URL, FM_ACCOUNT_LOOKUP_KEY } from "../config";

const FM_AUTH_HEADER = { "Ocp-Apim-Subscription-Key": FM_ACCOUNT_LOOKUP_KEY };

export class QuestService {
  cache = new Map();

  constructor() {}

  async accountPatternIsValid(input: string): Promise<Boolean> {
    // must swap 'x' to underscore and append underscore to end of account to force wildcard search
    input = input.replace(/x/g, "_") + "_";
    input = input.replace(/-/g, "");

    // this is just validating a single "x", which is strange, but OK
    if (input == "__") return true;

    if (this.cache.has(input)) {
      return this.cache.get(input);
    }

    return axios
      .get(`${FM_ACCOUNT_LOOKUP_URL}/account/${input}`, { headers: FM_AUTH_HEADER })
      .then(async (resp) => {
        let count = (resp.data.count as number) || 0;
        let val = count > 0;

        if (!this.cache.has(input)) this.cache.set(input, val);

        return val;
      })
      .catch((error) => {
        console.log("Error connected to the API Gateway", error);
        return false;
      });
  }
}
