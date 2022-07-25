import { FORMA_URL } from "@/urls";
import _ from "lodash";

import { getInstance } from "@/auth/auth0-plugin"


const state = {
    formA: { employee: {}, department: {} }
};

const getters = {
    isActive: (state) => {
      if (state.formA.reviewed_by_department){
        //we might consider a check on issue date and if a form is uploaded.
        return true;
      }
      return false
    },
    isLocked: () => {
      //Decide what is the test a locked form A. In the meantime
      if (state.formA.reviewed_by_department){
        //we might consider a check on issue date and if a form is uploaded.
        return true;
      }
      return false
    }

};

const actions = {
    async loadFormA({ commit }, { id }) {
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
    async createFormA({ commit }, item) {
        const auth = getInstance()
        // console.log(item)

        return auth.post(`${FORMA_URL}`, item)
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
    async duplicateFormA ({ commit, state }) {
      /*
      Create a new FormA instance with a copy of the data in the current
      Form A.
      */

      let dupe = {}
      dupe.department_code = state.formA.department_code;
      dupe.department_name = state.formA.department_descr;
      dupe.program_branch = state.formA.program_branch;
      dupe.position= state.formA.position;
      dupe.issue_date = new Date();
      dupe.reviewed_by_department = false;
      dupe.authority_lines = state.formA.authority_lines;
      dupe.created_by = ""; //TODO: get user from the store
      dupe.parentFormA = state.formA._id; //TODO: decide how to audit a clone

      const auth = getInstance ();
      return auth.post(`${FORMA_URL}`, dupe)
        .then(resp => {
          commit("setFormA", resp.data.data);
          return resp.data.data

        }).catch(() => {
          console.error (`Could not duplicate Form A ${state.formA._id}`);
          commit("setFormA", {});
        });
    },

    async archiveFormA({ commit, state }, archiveDetails) {
        const auth = getInstance()
        // const params = {
        //     archive: true
        // };

        let body = _.clone(state.formA);

        body.archive = archiveDetails;
        delete body._id;

        return auth.put(`${FORMA_URL}/${state.formA._id}/?archive=true`, body)
            .then(resp => {
                commit("setFormA", {});
                console.log("got a 200 response")
                return resp.code

            }).catch(() => {

                console.log(`Error archiving form A ${state.formA._id}`)
                commit("setFormA", {});
            });
    },
    async downloadFormA(state, id) {
        const auth = getInstance()
        return auth.get(`${FORMA_URL}/${id}/pdf`)
            .then(resp => {
                //commit("setFormB", resp.data.data);
                //   console.log(resp)
                return resp.data.data

            }).catch(() => {
                //commit("setFormB", {});
            });
    },
    // Department Sepcific FormAs
    async getDepartmentFormAList(state, department_code) {
        const auth = getInstance()
        const a = await auth.get(`${FORMA_URL}/department/${department_code}`)
        return a.data.data
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
    getters,
    actions,
    mutations
};