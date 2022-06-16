

import axios from "axios";

import { API_GATEWAY_KEY } from "../config";

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
                console.log("Error connected to the API Gateway", error)
                return [];
            });
    };
}
