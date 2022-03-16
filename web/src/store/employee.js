import { EMPLOYEE_URL } from "../urls";
import axios from "axios";

const state = {
    employee: {}
};

const getters = {
    employee: state => state.employee,
};

const actions = {
    async loadEmployee({ commit }, id) {
        return await axios.get(`${EMPLOYEE_URL}/${id}`)
            .then(resp => {
                commit("setEmployee", resp.data.data);
                return resp.data.data

            }).catch(() => {
                commit("setEmployee", {});
            });
    },
};

const mutations = {
    setEmployee(state, value) {
        state.employee = value;
    },
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};