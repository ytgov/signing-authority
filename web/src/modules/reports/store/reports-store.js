import { REPORTS_URL } from "@/urls";
import { getInstance } from "@/auth/auth0-plugin";

const state = {
  formBList: [],
  positionList: [],
  isLoading: false,
};

const actions = {
  async loadFormBList({ commit }) {
    commit("setLoading", true);
    const auth = getInstance();

    return auth.get(`${REPORTS_URL}/form-b`).then(async (resp) => {
      let data = resp.data;
      commit("setFormBList", data.data);
      commit("setLoading", false);
    });
  },
  async loadPositionList({ commit }) {
    commit("setLoading", true);
    const auth = getInstance();

    return auth.get(`${REPORTS_URL}/position`).then(async (resp) => {
      let data = resp.data;
      commit("setPositionList", data.data);
      commit("setLoading", false);
    });
  },
};

const mutations = {
  setFormBList(state, value) {
    state.formBList = value;
  },
  setPositionList(state, value) {
    state.positionList = value;
  },
  setLoading(state, value) {
    state.isLoading = value;
  },
};

export default {
  namespaced: true,
  state,
  actions,
  mutations,
};
