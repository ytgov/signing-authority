import { DEPARTMENT_URL } from "../urls";
import axios from "axios";

const state = {
    departments: []
};

const getters = {
    departments: state => state.departments,
};

const actions = {
    async loadDepartments({ commit }) {
        return await axios.get(`${DEPARTMENT_URL}`)
            .then(resp => {
                commit("setDepartments", resp.data.data);
                return resp.data.data

            }).catch(() => {
                commit("setDepartments", []);
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
    getters,
    actions,
    mutations
};