import { FORMA_URL } from "@/urls";
import _ from "lodash";

import { getInstance } from "@/auth/auth0-plugin"


const state = {
    formA: { employee: {}, department: {} }
};

const actions = {
    async loadFormA({ commit }, id) {
      console.log(`FormA ID: ${id}`)
      const auth = getInstance()
      return auth.get(`${FORMA_URL}/${id}`)
        .then(resp => {
            commit("setFormA", resp.data.data);
            return resp.data.data

        }).catch(() => {
            commit("setFormA", {});
        });
  },
    async saveFormA({ commit }, item) {
      const auth = getInstance()
        let body = _.clone(item);
        delete body.employee;
        delete body.department;
        delete body._id;

        return auth.put(`${FORMA_URL}/${item._id}`, body)
            .then(resp => {
                commit("setFormA", resp.data.data);
                return resp.data.data

            }).catch(() => {
                commit("setFormA", {});
            });
    },
    async downloadFormA(state, id) {
      const auth = getInstance()
        return auth.get(`${FORMA_URL}/${id}/pdf`)
          .then(resp => {
              //commit("setFormB", resp.data.data);
              console.log(resp)
              return resp.data.data

          }).catch(() => {
              //commit("setFormB", {});
          });
    }
};

const mutations = {
    setFormA(state, value) {
        state.formA = value;
    },
};

export default {
    namespaced: true,
    state,
    // getters,
    actions,
    mutations
};