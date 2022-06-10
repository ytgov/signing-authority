import Vue from "vue";
import Vuex from "vuex";

import auth from "./auth";
import profile from "./profile";
import employee from "./employee";
import authority from "@/modules/forms/store";
import department from "./department";
import { secureGet } from "./jwt";
import { USER_URL } from "@/urls"

Vue.use(Vuex);

export default new Vuex.Store({
  getters: {
  },
  state: {
    user: {}
  },
  mutations: {
    SET_USER(state, payload) {
      state.user = payload;
    }
  },
  actions: {
    initialize() {
      console.log("Initializing Store");
      this.dispatch("department/loadDepartments");
    },
    async getCurrentUser(state) {
      let userResp = await secureGet(`${USER_URL}/me`);
      state.commit("SET_USER", userResp.data.data);
      return userResp.data.data;
    }
  },
  modules: { auth, profile, employee, authority, department }
});
