import { PROFILE_URL, EMPLOYEE_URL } from "@/urls";
import { getInstance } from "@/auth/auth0-plugin";

const state = {
  profile: {},
};

const actions = {
  async initialize(store) {
    console.log("-- Initializing Home Store");
    await store.dispatch("loadProfile");
  },
  async loadProfile({ commit }) {
    const auth = getInstance();

    await auth.get(PROFILE_URL).then((resp) => {
      commit("setProfile", resp.data.data);
    });
  },
  async employeeSearch(store, terms) {
    const auth = getInstance();

    return await auth.post(`${EMPLOYEE_URL}/search`, { terms });
  },
};

const mutations = {
  setProfile(state, value) {
    state.profile = value;
  },
};

export default {
  namespaced: true,
  state,
  actions,
  mutations,
};
