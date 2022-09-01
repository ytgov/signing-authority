

import axios from "axios";

import { API_GATEWAY_KEY, FM_ACCOUNT_LOOKUP_URL } from "../config";

const AUTH_HEADER = { "Ocp-Apim-Subscription-Key": API_GATEWAY_KEY };
const DEPARTMENT_API_URL = "https://api.gov.yk.ca/finance/api/v2/accounts/departments";

export class QuestService {

    constructor() { }

    async getDepartmentList() {
        return axios.get(`${DEPARTMENT_API_URL}`, { headers: AUTH_HEADER })
            .then(async (resp) => {
                return resp.data.data;
            })
            .catch(error => {
                console.log("Error connected to the API Gateway", error);
                return [];
            });
    };

    async accountPatternIsValid(input: string): Promise<boolean> {
        // must swap 'x' to underscore and append underscore to end of account to force wildcard search
        input = input.replace(/x/g, "_") + "_";

        console.log("LOOKING UP", `${FM_ACCOUNT_LOOKUP_URL}/${input}`);

        return axios.get(`${FM_ACCOUNT_LOOKUP_URL}/${input}`, { headers: AUTH_HEADER })
            .then(async (resp) => {
                let { count } = resp.data;

                return count && count > 0;
            })
            .catch(error => {
                console.log("Error connected to the API Gateway", error.status);
                return false;
            });
    }
}
