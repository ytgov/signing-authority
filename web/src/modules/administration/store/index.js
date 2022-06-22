import { HEALTHCHECK_URL } from "../../../urls";

const state = {
  appHealth: {},
};

const actions = {
  async doHealthCheck ({commit}) {
    console.log ("Checking app health")
    let response = await fetch (HEALTHCHECK_URL)
    let data = await response.json()
    commit("SET_APP_HEALTH", data)
  },
};

const mutations = {
  SET_APP_HEALTH(state, payload) {
      state.appHealth = payload;
  }
};

export default {
  namespaced: true,
  state,
  actions,
  mutations
};