import { Department } from "src/data/models";
import axios from "axios";

import { API_GATEWAY_KEY } from "../config";

const AUTH_HEADER = { "Ocp-Apim-Subscription-Key": API_GATEWAY_KEY };
const DEPARTMENT_API_URL = "https://api.gov.yk.ca/finance/api/v2/accounts/departments";

export class DepartmentService {
  constructor() { }

  //get a list of departments from YG API gateway
    async getDepartmentList() {
        return axios.get(`${DEPARTMENT_API_URL}`, { headers: AUTH_HEADER })
            .then(async (resp) => {
                console.log(resp.data.data)
                return resp.data.data as Department[];
            })
            .catch(error => {
                console.log("Error connected to the API Gateway", error)
                return [];
            });
    };

}