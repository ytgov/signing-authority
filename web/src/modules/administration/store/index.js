import { HEALTHCHECK_URL, USER_URL, FORMA_URL } from "@/urls";
import { getInstance } from "@/auth/auth0-plugin";

const state = {
  //appHealth is an array of componentHealth
  appHealth: [],
  componentHealth: {
    name: "",
    status: false,
    loading: true,
    helpNotes: "", //what to do if something this component is broken
  },
  users: [],
  operationalRestrictions: [],
  roleOptions: [
    "Employee",
    "System Admin",
    "Department of Finance",
    "Form A Administrator",
    "Form B Administrator",
    "Acting Appointment Administrator",
    "Form Viewer",
  ],
};

const actions = {
  async doHealthCheck({ commit }) {
    console.log("Checking app health");
    let response = await fetch(HEALTHCHECK_URL);
    let data = await response.json();
    commit("SET_APP_HEALTH", data);
  },
  async seedData() {
    let response = await fetch("http://localhost:3000/seed");
    let data = await response.text();
    return data;
  },
  async loadUsers({ commit }) {
    const auth = getInstance();

    return auth
      .get(USER_URL)
      .then((resp) => {
        let data = resp.data.data;
        commit("SET_USERS", data);
        console.log(`Loaded ${data.length} users`);
        return data;
      })
      .catch((err) => {
        console.log("BROKEN", err);
      });
  },
  async saveUser({ dispatch }, item) {
    const auth = getInstance();
    let body = { roles: item.roles, status: item.status, department_admin_for: item.department_admin_for };
    const result = await auth.put(`${USER_URL}/${item.email}`, body);
    if (result.status === 200) {
      dispatch("loadUsers");
    }
    return result;
  },
  async unlinkUser({ dispatch }, item) {
    const auth = getInstance();
    const result = await auth.put(`${USER_URL}/${item.email}/unlink`, {});
    if (result.status === 200) {
      dispatch("loadUsers");
    }
    return result;
  },
  async createUser({ dispatch }, item) {
    const auth = getInstance();

    let body = item;
    let result = await auth.post(`${USER_URL}`, body);
    dispatch("loadUsers");
    return result;
  },

  async getFormAList() {
    const auth = getInstance();

    return auth.get(`${FORMA_URL}/pending-groups`).then((resp) => {
      return resp.data.data;
    });
  },
  async setFormAStatus(state, { id, status }) {
    const auth = getInstance();

    return auth.put(`${FORMA_URL}/pending-groups/${id}/status`, { status }).then((resp) => {
      return resp.data.data;
    });
  },

  async getPositionList() {
    const auth = getInstance();

    return auth.get(`${FORMA_URL}`).then((resp) => {
      return resp.data.data;
    });
  },

  async setPositionGroup(state, { id, position_group_id }) {
    const auth = getInstance();

    return auth.put(`${FORMA_URL}/${id}/position_group_id`, { position_group_id }).then((resp) => {
      return resp.data.data;
    });
  },
  async autoArchive() {
    const auth = getInstance();

    return auth.post(`${FORMA_URL}/auto-archive`).then((resp) => {
      return resp.data.data;
    });
  },

  async getOperationalRestrictions({ commit }) {
    const auth = getInstance();

    return auth.get(`${FORMA_URL}/operational-restrictions`).then((resp) => {
      commit("SET_OPERATIONAL_RESTRICTIONS", resp.data.data);
      return resp.data.data;
    });
  },
  async createOperationalRestriction({ commit }, value) {
    const auth = getInstance();

    return auth.post(`${FORMA_URL}/operational-restrictions`, value).then((resp) => {
      commit("SET_OPERATIONAL_RESTRICTIONS", resp.data.data);
      return resp.data;
    });
  },
  async updateOperationalRestriction({ commit }, value) {
    const auth = getInstance();

    return auth.put(`${FORMA_URL}/operational-restrictions/${value._id}`, value).then((resp) => {
      commit("SET_OPERATIONAL_RESTRICTIONS", resp.data.data);
      return resp.data;
    });
  },
};

const mutations = {
  SET_APP_HEALTH(state, payload) {
    state.appHealth = payload.appHealth;
  },
  SET_USERS(state, value) {
    state.users = value;
  },
  SET_OPERATIONAL_RESTRICTIONS(state, value) {
    state.operationalRestrictions = value;
  },
};

export default {
  namespaced: true,
  state,
  actions,
  mutations,
};
