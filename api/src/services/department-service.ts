import { Department } from "src/data/models";
import axios from "axios";
import { offlineDepartments }from  "../data/seed-data/departments"

import { API_GATEWAY_KEY, DEPARTMENT_API_URL } from "../config";

const AUTH_HEADER = { "Ocp-Apim-Subscription-Key": API_GATEWAY_KEY };
// const DEPARTMENT_API_URL = "https://api.gov.yk.ca/finance/api/v2/accounts/departments";

export class DepartmentService {
  //create a service to lookup a list of departments from YG API gateway
  constructor() {

  }
  // async getDepartmentList(): Promise<Department[]>
  async getDepartmentList()
  {
    return axios.get(`${DEPARTMENT_API_URL}`, { headers: AUTH_HEADER })
      .then(async (resp) => {
          // return resp.data.data as Department[];
          return resp.data.data;
      })
      .catch(error => {
          console.log("Error connecting to the API Gateway", error)
          return [];
      });
  };
  async getOfflineDepartmentList(): Promise<Department[]>{

    return offlineDepartments
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