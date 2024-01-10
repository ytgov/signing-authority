import { PROFILE_URL, EMPLOYEE_URL } from "@/urls";
import { getInstance } from "@/auth/auth0-plugin";

const state = {
  profile: {},
  actions: [],
  myAuthorities: [],
  loadingMyAuthorities: "primary",
  loadingMyActions: "primary",
};

const actions = {
  async initialize(store) {
    console.log("-- Initializing Home Store");
    await store.dispatch("loadProfile");
  },
  async loadProfile({ commit }) {
    const auth = getInstance();

    await auth.get(PROFILE_URL).then(async (resp) => {
      commit("setProfile", resp.data.data);

      if (resp.data.data.email) {
        await auth
          .get(`${EMPLOYEE_URL}/email/${resp.data.data.email}`)
          .then((resp) => {
            commit("setMyAuthorities", resp.data.data);
          })
          .catch(() => {
            console.log("Error pulling auth");
            commit("setMyAuthorities", []);
          });
      }
    });
  },
  async employeeSearch(store, { term }) {
    const auth = getInstance();

    return await auth.post(`${EMPLOYEE_URL}/search`, { term });
  },

  async loadActions({ commit }) {
    commit("setActionsLoad", "primary");
    commit("setActions", []);

    const auth = getInstance();
    await auth
      .get(`${EMPLOYEE_URL}/my-actions`)
      .then((resp) => {
        commit("setActions", resp.data.data);
        commit("setActionsLoad", "");
      })
      .catch(() => {
        console.log("Error pulling auth");
      });
  },
};

const mutations = {
  setProfile(state, value) {
    console.log(value);
    state.profile = value;
  },
  setActions(state, value) {
    state.actions = value;
  },
  setActionsLoad(state, value) {
    state.loadingMyActions = value;
  },
  setMyAuthorities(state, value) {
    state.myAuthorities = value;
    state.loadingMyAuthorities = "";
  },
};

export default {
  namespaced: true,
  state,
  actions,
  mutations,
};
