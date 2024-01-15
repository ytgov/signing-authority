import formB from "../formB/store/index";
import formA from "../formA/store/index";

import { FORMA_URL } from "@/urls";
import axios from "axios";

const actions = {
  async getOperationalRestictions() {
    return axios.get(`${FORMA_URL}/operational-restrictions?status=active`).then((resp) => {
      return resp.data.data.map((r) => r.description);
    });
  },
};

export default {
  namespaced: true,
  actions,
  modules: {
    formB,
    formA,
  },
};
