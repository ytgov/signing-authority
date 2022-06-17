import { DEPARTMENT_URL } from "@/urls";
import { secureGet } from "@/store/jwt"

const state = {
    departments: []
};

const actions = {
    async initialize(store) {
        console.log("-- Initializing Department Store")
        await store.dispatch("loadDepartments")
    },
    async loadDepartments({ commit }) {
        secureGet(`${DEPARTMENT_URL}`).then(resp => {
            commit("setDepartments", resp.data.data);
            return resp.data.data;
        }).catch(() => {
            commit("setDepartments", []);
        });
    },
    async getDepartment(store, { id }) {
        return await secureGet(`${DEPARTMENT_URL}/${id}`)
            .then(resp => {
                //commit("setDepartments", resp.data.data);
                return resp.data.data
            }).catch(() => {
                //commit("setDepartments", []);
            });
    },
};

const mutations = {
    setDepartments(state, value) {
        state.departments = value;
    },
};

export default {
    namespaced: true,
    state,
    actions,
    mutations
};