import { HEALTHCHECK_URL } from "../../../urls";

const state = {
  //appHealth is an array of componentHealth
  appHealth: [],
  componentHealth: {
    "name": "",
    "status": false,
    "loading": true,
    "helpNotes": "" //what to do if something this component is broken
  }
};

const actions = {
  async doHealthCheck ({commit}) {
    console.log ("Checking app health")
    let response = await fetch (HEALTHCHECK_URL)
    let data = await response.json()
    commit("SET_APP_HEALTH", data)
  },
  async seedData () {
    let resopnse = await fetch ("http://localhost:3000/seed")
    let data = await resopnse.text()
    return data
  }
};

const mutations = {
  SET_APP_HEALTH(state, payload) {
      state.appHealth = payload.appHealth;
  }
};

export default {
  namespaced: true,
  state,
  actions,
  mutations
};