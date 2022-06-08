import Vue from "vue";
import Vuex from "vuex";

import auth from "./auth";
import profile from "./profile";
import employee from "./employee";
import authority from "@/modules/forms/store";
import department from "./department";

Vue.use(Vuex);

export default new Vuex.Store({
  getters: {
  },
  state: {
  },
  mutations: {
  },
  actions: {
    initialize() {
      console.log("Initializing Store");
      this.dispatch("department/loadDepartments");
    },
  },
  modules: { auth, profile, employee, authority, department }
});
