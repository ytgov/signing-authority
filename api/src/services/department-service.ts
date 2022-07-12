import { Department } from "src/data/models";
import axios from "axios";

import { API_GATEWAY_KEY, DEPARTMENT_API_URL } from "../config";
import { rest } from "lodash";

const AUTH_HEADER = { "Ocp-Apim-Subscription-Key": API_GATEWAY_KEY };
// const DEPARTMENT_API_URL = "https://api.gov.yk.ca/finance/api/v2/accounts/departments";

export class DepartmentService {
  //create a service to lookup a list of departments from YG API gateway
  constructor() {

  }
  async getDepartmentList(): Promise<Department[]>
  {
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
  async healthCheck(): Promise<any>{
    return axios.get(`${DEPARTMENT_API_URL}`, { headers: AUTH_HEADER })
    .then(async (resp) => {
      if (resp.status == 200) { return true;}
      else {
        return false
      }
    });

  }

}