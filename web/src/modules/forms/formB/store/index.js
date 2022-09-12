import { AUTHORITY_URL } from "@/urls";
import axios from "axios";
import _ from "lodash";
import { getInstance } from "@/auth/auth0-plugin";

const state = {
  formB: { employee: {}, supervisor: {}, department: {}, form_a: {} },
};

const getters = {
  formB: (state) => state.formB,
};

const actions = {
  async loadFormB({ commit }, id) {
    const auth = getInstance();

    return auth
      .get(`${AUTHORITY_URL}/${id}`)
      .then((resp) => {
        commit("setFormB", resp.data.data);
        return resp.data.data;
      })
      .catch(() => {
        commit("setFormB", {});
      });
  },
  async createFormB(store, item) {
    const auth = getInstance();

    let body = _.clone(item);
    console.log("POSTING", body);

    return auth.post(`${AUTHORITY_URL}`, body).then((resp) => resp.data);
  },
  async saveFormB({ commit }, item) {
    let body = _.clone(item);
    delete body.employee;
    delete body.department;
    delete body._id;

    return axios
      .put(`${AUTHORITY_URL}/${item._id}`, body)
      .then((resp) => {
        commit("setFormB", resp.data.data);
        return resp.data.data;
      })
      .catch(() => {
        commit("setFormB", {});
      });
  },
  async downloadFormB(state, id) {
    return axios
      .get(`${AUTHORITY_URL}/${id}/pdf`)
      .then((resp) => {
        //commit("setFormB", resp.data.data);
        console.log(resp);
        return resp.data.data;
      })
      .catch(() => {
        //commit("setFormB", {});
      });
  },
  async getFormBList(state, dept_id) {
    const auth = getInstance();
    const resp = await auth.get(`${AUTHORITY_URL}/department/${dept_id}`);
    return resp.data.data;
  },
};

const mutations = {
  setFormB(state, value) {
    state.formB = value;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
