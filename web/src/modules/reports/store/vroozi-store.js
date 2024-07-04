import { REPORTS_URL } from "@/urls";
import { getInstance } from "@/auth/auth0-plugin";

const state = {
  userStats: [],
  logs: [],
  isLoading: false,
};

const actions = {
  async loadAuditData({ state, commit }) {
    if (state.userStats && state.userStats.emails && state.userStats.emails.length > 0) return;

    commit("setLoading", true);
    const auth = getInstance();

    return auth.get(`${REPORTS_URL}/vroozi/audit`).then(async (resp) => {
      let data = resp.data;
      commit("setStats", data.data);
      commit("setLoading", false);
    });
  },
  async sendAuthorities({ commit }, email) {
    commit("setLoading", true);

    const auth = getInstance();
    return auth.get(`${REPORTS_URL}/vroozi/resend/${email}`).then(async (resp) => {
      commit("setLoading", false);
      return resp;
    });
  },
  async downloadCSV(store, email) {
    const auth = getInstance();
    return auth.get(`${REPORTS_URL}/vroozi/audit/${email}`).then((resp) => resp.data.data);
  },
  async loadLogs({ commit }) {
    commit("setLoading", true);
    const auth = getInstance();

    return auth.get(`${REPORTS_URL}/vroozi/logs`).then(async (resp) => {
      let data = resp.data;
      commit("setLogs", data.data);
      commit("setLoading", false);
    });
  },
};

const mutations = {
  setStats(state, value) {
    state.userStats = value;
  },
  setLogs(state, value) {
    state.logs = value;
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
